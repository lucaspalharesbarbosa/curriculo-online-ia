"""Testes do registro e das tools do currículo (`ADR-017`)."""

from __future__ import annotations

import inspect
from datetime import date

import pytest

from app.chat import rag
from app.tools.registry import Tool, execute_tool
from app.tools.resume_tools import (
    SEARCH_NO_RESULT_MESSAGE,
    WEB_BLOCKED_MESSAGE,
    WEB_NO_RESULT_MESSAGE,
    WEB_RESULT_PREFIX,
    build_resume_tools,
)
from tests.chat.fakes import FakeEmbeddingProvider, FakeWebSearchProvider
from tests.tools.helpers import make_resume


def _tools(web_result: str | None = None) -> list[Tool]:
    resume = make_resume([("Alfa", "2024-01", "2025-07", ["Python"])])
    provider = FakeEmbeddingProvider([1.0, 0.0])
    index = [
        rag.EmbeddedChunk(
            chunk=rag.Chunk(id="experience-0", section="experience", text="Texto A"),
            embedding=[1.0, 0.0],
        ),
        rag.EmbeddedChunk(
            chunk=rag.Chunk(id="skill-0", section="skill", text="Texto B"),
            embedding=[0.0, 1.0],
        ),
    ]
    return build_resume_tools(
        resume,
        lambda: index,
        provider,
        FakeWebSearchProvider(web_result),
        today=lambda: date(2026, 1, 1),
    )


def _by_name(tools: list[Tool], name: str) -> Tool:
    return next(tool for tool in tools if tool.name == name)


def test_schema_declarado_bate_com_a_assinatura_do_handler() -> None:
    """O JSON Schema (fonte única dos dois adapters) não diverge da função."""
    for tool in _tools():
        signature = inspect.signature(tool.handler)
        declared = set(tool.parameters["properties"])
        required = set(tool.parameters["required"])

        assert declared == set(signature.parameters), tool.name
        assert required == {
            name
            for name, param in signature.parameters.items()
            if param.default is inspect.Parameter.empty
        }, tool.name


def test_tools_expostas_sao_as_tres_esperadas() -> None:
    """O núcleo tem exatamente as três tools do ADR-017."""
    assert [tool.name for tool in _tools()] == [
        "search_resume",
        "calculate_experience",
        "search_web",
    ]


def test_execute_tool_calculate_experience() -> None:
    """A tool devolve o cálculo exato, não uma estimativa do modelo."""
    result = execute_tool(
        _tools(), "calculate_experience", '{"skill_or_company": "python"}'
    )

    assert "1 ano e 6 meses" in result


def test_execute_tool_search_resume_devolve_trechos_com_secao() -> None:
    """A busca devolve só o que tem similaridade positiva, com a seção."""
    result = execute_tool(_tools(), "search_resume", '{"query": "algo"}')

    assert "[experience] Texto A" in result
    assert "Texto B" not in result


def test_search_resume_com_secao_restringe_o_indice() -> None:
    """`section` limita a busca aos chunks daquela seção."""
    result = execute_tool(
        _tools(), "search_resume", '{"query": "algo", "section": "skill"}'
    )

    assert result == SEARCH_NO_RESULT_MESSAGE


def test_search_resume_secao_invalida_vira_erro_para_o_modelo() -> None:
    """Seção fora do enum é devolvida como erro, sem exceção."""
    result = execute_tool(
        _tools(), "search_resume", '{"query": "algo", "section": "inexistente"}'
    )

    assert result.startswith("Erro na ferramenta 'search_resume'")


def test_search_web_bloqueia_consulta_sem_entidade_do_curriculo() -> None:
    """Busca web só para entidade citada no currículo (guard do ADR-010)."""
    result = execute_tool(
        _tools("qualquer"), "search_web", '{"query": "preço do bitcoin"}'
    )

    assert result == WEB_BLOCKED_MESSAGE


def test_search_web_com_entidade_conhecida_marca_a_fonte() -> None:
    """Resultado web vem prefixado, para o modelo citar que é público."""
    result = execute_tool(
        _tools("Alfa é uma empresa X."), "search_web", '{"query": "o que é a Alfa"}'
    )

    assert result.startswith(WEB_RESULT_PREFIX)
    assert "Alfa é uma empresa X." in result


def test_search_web_sem_resultado_do_provider() -> None:
    """Provider sem conteúdo aproveitável vira mensagem, não erro."""
    result = execute_tool(_tools(None), "search_web", '{"query": "o que é a Alfa"}')

    assert result == WEB_NO_RESULT_MESSAGE


@pytest.mark.parametrize(
    ("name", "raw", "fragment"),
    [
        ("nao_existe", "{}", "ferramenta inexistente"),
        ("search_resume", "{nao json", "JSON válido"),
        ("search_resume", "[1, 2]", "objeto JSON"),
        ("search_resume", '{"query": "x", "extra": 1}', "argumentos desconhecidos"),
        ("search_resume", "{}", "faltam argumentos"),
        ("calculate_experience", '{"skill_or_company": ""}', "informe"),
    ],
)
def test_execute_tool_entrada_invalida_nunca_levanta(
    name: str, raw: str, fragment: str
) -> None:
    """Entrada do LLM é não confiável: todo erro vira texto para o modelo."""
    result = execute_tool(_tools(), name, raw)

    assert result.startswith("Erro na ferramenta")
    assert fragment in result
