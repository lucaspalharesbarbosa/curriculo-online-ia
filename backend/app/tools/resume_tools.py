"""Tools do assistente do currículo (`ADR-017`): montadas com as dependências
injetadas, sem importar `openai`, `httpx` nem `mcp`.

Todas são somente leitura: nenhuma escreve estado nem executa código.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import date

from app.chat import rag
from app.chat.ports import EmbeddingProvider, WebSearchProvider
from app.resume.models import Resume
from app.tools import experience
from app.tools.registry import Tool

SEARCH_TOP_K = 3
# Teto de tamanho dos argumentos de texto. O /mcp é público: sem isto, um
# cliente manda um texto enorme e gera custo de embedding ou de busca web.
MAX_QUERY_LENGTH = 300
WEB_RESULT_PREFIX = "Informação pública da web (não faz parte do currículo):"
WEB_BLOCKED_MESSAGE = (
    "A busca web só é permitida para entidades citadas no currículo (empresa, "
    "instituição, curso, certificação, habilidade ou projeto)."
)
WEB_NO_RESULT_MESSAGE = "A busca web não retornou nada aproveitável."
SEARCH_NO_RESULT_MESSAGE = "Nada relevante encontrado no currículo."

SECTIONS = [
    "summary",
    "experience",
    "skill",
    "project",
    "certification",
    "recognition",
    "education",
    "article",
]


def _check_length(value: str, field: str) -> None:
    if len(value) > MAX_QUERY_LENGTH:
        raise ValueError(f"{field} excede {MAX_QUERY_LENGTH} caracteres.")


def _mentions_known_entity(query: str, entities: list[str]) -> bool:
    normalized = query.lower()
    return any(entity.lower() in normalized for entity in entities if entity)


def build_resume_tools(
    resume: Resume,
    index_loader: Callable[[], list[rag.EmbeddedChunk]],
    embedding_provider: EmbeddingProvider,
    web_search_provider: WebSearchProvider,
    today: Callable[[], date] = date.today,
) -> list[Tool]:
    known_entities = rag.extract_known_entities(resume)

    def search_resume(query: str, section: str | None = None) -> str:
        _check_length(query, "query")
        if section is not None and section not in SECTIONS:
            raise ValueError(f"section deve ser uma de {SECTIONS}.")
        index = index_loader()
        if section is None:
            results = rag.search_with_routing(
                query, index, embedding_provider, top_k=SEARCH_TOP_K
            )
        else:
            results = rag.search(
                query, index, embedding_provider, top_k=SEARCH_TOP_K, section=section
            )
        relevant = [chunk for chunk, score in results if score > 0]
        if not relevant:
            return SEARCH_NO_RESULT_MESSAGE
        return "\n".join(f"- [{chunk.section}] {chunk.text}" for chunk in relevant)

    def calculate_experience(skill_or_company: str) -> str:
        _check_length(skill_or_company, "skill_or_company")
        summary = experience.calculate_experience(
            resume, skill_or_company, today=today()
        )
        return experience.format_summary(summary)

    def search_web(query: str) -> str:
        _check_length(query, "query")
        if not _mentions_known_entity(query, known_entities):
            return WEB_BLOCKED_MESSAGE
        context = web_search_provider.search_web(query)
        if not context:
            return WEB_NO_RESULT_MESSAGE
        return f"{WEB_RESULT_PREFIX}\n{context}"

    return [
        Tool(
            name="search_resume",
            description=(
                "Busca semântica no currículo do Lucas (experiências, skills, "
                "projetos, certificações, formação, artigos). Use para qualquer "
                "pergunta factual sobre a trajetória dele. Devolve os trechos "
                "mais relevantes."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Pergunta ou termos de busca, em português.",
                    },
                    "section": {
                        "type": "string",
                        "enum": SECTIONS,
                        "description": (
                            "Opcional. Restringe a busca a uma seção do currículo."
                        ),
                    },
                },
                "required": ["query"],
                "additionalProperties": False,
            },
            handler=search_resume,
        ),
        Tool(
            name="calculate_experience",
            description=(
                "Calcula, com precisão, quanto tempo de experiência profissional "
                "o Lucas tem com uma tecnologia ou empresa, somando os cargos do "
                "currículo. Use SEMPRE que a pergunta envolver duração, "
                "'quantos anos' ou 'há quanto tempo'. Nunca faça essa conta de "
                "cabeça."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "skill_or_company": {
                        "type": "string",
                        "description": "Tecnologia ou empresa. Ex.: 'Python', 'Java'.",
                    },
                },
                "required": ["skill_or_company"],
                "additionalProperties": False,
            },
            handler=calculate_experience,
        ),
        Tool(
            name="search_web",
            description=(
                "Busca informação pública na web sobre uma entidade citada no "
                "currículo (empresa, instituição, curso, certificação, "
                "habilidade). Use só quando o currículo não tiver o detalhe "
                "pedido. A consulta precisa conter o nome da entidade."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Consulta com o nome da entidade.",
                    },
                },
                "required": ["query"],
                "additionalProperties": False,
            },
            handler=search_web,
        ),
    ]
