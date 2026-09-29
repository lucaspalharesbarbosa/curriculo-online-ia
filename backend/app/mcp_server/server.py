"""Servidor MCP do currículo: a segunda "porta" de `ADR-017`.

Expõe o mesmo registro de tools (`app.tools`) que o tool calling do `/chat`
usa, no protocolo MCP (Model Context Protocol), para que qualquer cliente
compatível (Claude Desktop, Cursor, outros agentes) consulte o currículo.
Este módulo só traduz: a lógica vive em `app/tools/`.

Todas as tools são somente leitura (`readOnlyHint`).
"""

from __future__ import annotations

import json
from collections.abc import Callable

from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from mcp.types import ToolAnnotations

from app.chat import rag
from app.chat.ports import EmbeddingProvider, WebSearchProvider
from app.resume.models import Resume
from app.tools.resume_tools import build_resume_tools

SERVER_NAME = "curriculo-lucas-palhares"
SERVER_INSTRUCTIONS = (
    "Currículo profissional de Lucas Palhares Barbosa (AI Engineering). Use "
    "search_resume para fatos da trajetória, calculate_experience para tempo "
    "de experiência (cálculo exato, não estime) e search_web só para detalhes "
    "públicos de entidades citadas no currículo."
)


def _json(data: object) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2)


def build_server(
    resume: Resume,
    index_loader: Callable[[], list[rag.EmbeddedChunk]],
    embedding_provider: EmbeddingProvider,
    web_search_provider: WebSearchProvider,
    *,
    transport_security: TransportSecuritySettings | None = None,
) -> FastMCP:
    """Monta o `FastMCP` com as tools do núcleo e dois recursos de leitura."""
    server = FastMCP(
        SERVER_NAME,
        instructions=SERVER_INSTRUCTIONS,
        # Sem estado e com resposta JSON: cada request é independente, o que
        # combina com o free tier do Render (worker único que dorme, ADR-008).
        stateless_http=True,
        json_response=True,
        transport_security=transport_security,
    )
    read_only = ToolAnnotations(readOnlyHint=True, openWorldHint=True)
    for tool in build_resume_tools(
        resume, index_loader, embedding_provider, web_search_provider
    ):
        server.add_tool(
            tool.handler,
            name=tool.name,
            description=tool.description,
            annotations=read_only,
        )

    @server.resource(
        "resume://experiencias",
        name="experiencias",
        description="Experiências profissionais (cargo, empresa, período, stack).",
        mime_type="application/json",
    )
    def experiences_resource() -> str:
        return _json([e.model_dump(by_alias=True) for e in resume.experiences])

    @server.resource(
        "resume://skills",
        name="skills",
        description="Skills agrupadas por categoria, com nível de 1 a 5.",
        mime_type="application/json",
    )
    def skills_resource() -> str:
        return _json([group.model_dump() for group in resume.skills])

    return server


def build_default_server(
    *, transport_security: TransportSecuritySettings | None = None
) -> FastMCP:
    """Servidor com os adapters reais (OpenAI embeddings + Tavily)."""
    # Import tardio: o adapter carrega o SDK da OpenAI.
    from app.chat import service
    from app.chat.adapters.openai_adapter import OpenAIEmbeddingProvider
    from app.chat.adapters.tavily_adapter import TavilyWebSearchProvider

    embedding_provider = OpenAIEmbeddingProvider()
    return build_server(
        service.get_resume(),
        lambda: service.get_index(embedding_provider),
        embedding_provider,
        TavilyWebSearchProvider(),
        transport_security=transport_security,
    )
