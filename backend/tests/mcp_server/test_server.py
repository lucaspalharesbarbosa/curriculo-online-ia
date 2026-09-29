"""Testes do servidor MCP (`ADR-017`): a segunda porta do núcleo de tools."""

from __future__ import annotations

import asyncio
import json

from mcp.server.fastmcp import FastMCP

from app.chat import rag
from app.mcp_server.server import build_server
from app.tools.resume_tools import build_resume_tools
from tests.chat.fakes import FakeEmbeddingProvider, FakeWebSearchProvider
from tests.tools.helpers import make_resume

RESUME = make_resume(
    [
        ("Alfa", "2022-07", "2025-09", ["Python"]),
        ("Beta", "2026-03", None, ["Python", "React"]),
    ]
)
INDEX = [
    rag.EmbeddedChunk(
        chunk=rag.Chunk(id="experience-0", section="experience", text="Texto A"),
        embedding=[1.0, 0.0],
    )
]


def _server() -> FastMCP:
    return build_server(
        RESUME,
        lambda: INDEX,
        FakeEmbeddingProvider([1.0, 0.0]),
        FakeWebSearchProvider(),
    )


def _run(coro):
    return asyncio.run(coro)


def test_lista_as_mesmas_tools_do_nucleo() -> None:
    """A porta MCP expõe exatamente o que o registro de tools define."""
    core = build_resume_tools(
        RESUME,
        lambda: INDEX,
        FakeEmbeddingProvider(),
        FakeWebSearchProvider(),
    )

    listed = _run(_server().list_tools())

    assert [tool.name for tool in listed] == [tool.name for tool in core]
    assert [tool.description for tool in listed] == [tool.description for tool in core]


def test_schema_mcp_bate_com_o_schema_openai() -> None:
    """Uma fonte de verdade: nomes e obrigatoriedade dos args são os mesmos
    nos dois protocolos (o do MCP é derivado da assinatura da função)."""
    core = {
        tool.name: tool
        for tool in build_resume_tools(
            RESUME, lambda: INDEX, FakeEmbeddingProvider(), FakeWebSearchProvider()
        )
    }

    for listed in _run(_server().list_tools()):
        schema = listed.inputSchema
        expected = core[listed.name].parameters
        assert set(schema["properties"]) == set(expected["properties"]), listed.name
        assert set(schema.get("required", [])) == set(expected["required"]), listed.name


def test_todas_as_tools_sao_somente_leitura() -> None:
    """Guard rail: nenhuma tool escreve estado (readOnlyHint)."""
    for listed in _run(_server().list_tools()):
        assert listed.annotations is not None
        assert listed.annotations.readOnlyHint is True, listed.name


def test_chamar_calculate_experience_pelo_mcp() -> None:
    """Chamada real via protocolo devolve o cálculo do núcleo."""
    content, _ = _run(
        _server().call_tool("calculate_experience", {"skill_or_company": "Python"})
    )

    text = content[0].text
    assert "Experiência profissional com 'Python'" in text
    assert "meses" in text


def test_search_resume_pelo_mcp() -> None:
    """A busca semântica funciona pela porta MCP com o índice injetado."""
    content, _ = _run(_server().call_tool("search_resume", {"query": "algo"}))

    assert "[experience] Texto A" in content[0].text


def test_recursos_de_leitura() -> None:
    """Recursos `resume://experiencias` e `resume://skills` devolvem JSON."""
    server = _server()

    uris = {str(r.uri) for r in _run(server.list_resources())}
    experiencias = _run(server.read_resource("resume://experiencias"))
    skills = _run(server.read_resource("resume://skills"))

    assert uris == {"resume://experiencias", "resume://skills"}
    assert json.loads(list(experiencias)[0].content)[0]["company"] == "Alfa"
    assert json.loads(list(skills)[0].content)[0]["category"] == "Backend"
