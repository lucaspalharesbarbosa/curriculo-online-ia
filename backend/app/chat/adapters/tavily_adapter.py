"""Adapter Tavily: implementa `WebSearchProvider` (era `web_search.py`, ADR-012).

Enriquecimento opcional do RAG (ADR-010 seção 2) — só é chamado por
`service.py` quando a busca local não encontrou contexto suficiente e a
pergunta cita uma entidade conhecida do currículo. Nunca propaga exceção:
qualquer falha (timeout, erro de rede, resposta inesperada do provedor)
vira `None`, e o chamador cai no fallback local — a busca web é só
enriquecimento, nunca pode derrubar o `/chat`.
"""

from __future__ import annotations

import logging
import os

import httpx

logger = logging.getLogger(__name__)

TAVILY_API_URL = "https://api.tavily.com/search"
# ADR-010 seção 2 (resiliência): timeout curto, sem retry — busca web é
# enriquecimento opcional, nunca pode ser o motivo de uma resposta lenta.
WEB_SEARCH_TIMEOUT_SECONDS = 8.0
WEB_SEARCH_MAX_RESULTS = 3


class TavilyWebSearchProvider:
    """Implementa `WebSearchProvider` (`ports.py`) com a API do Tavily."""

    def search_web(self, query: str) -> str | None:
        """Busca `query` no Tavily; retorna um texto de contexto resumido ou `None`.

        `None` cobre: sem `WEB_SEARCH_API_KEY` configurada, timeout, erro
        HTTP/rede do provedor, ou resposta sem conteúdo aproveitável — em
        todos os casos o chamador deve seguir para o fallback local, sem
        levantar erro ao client.
        """
        api_key = os.environ.get("WEB_SEARCH_API_KEY")
        if not api_key:
            logger.info("WEB_SEARCH_API_KEY ausente — busca web pulada.")
            return None

        try:
            response = httpx.post(
                TAVILY_API_URL,
                json={
                    "api_key": api_key,
                    "query": query,
                    "max_results": WEB_SEARCH_MAX_RESULTS,
                    "include_answer": True,
                },
                timeout=WEB_SEARCH_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError as exc:
            logger.warning("Falha na busca web (Tavily): %s", type(exc).__name__)
            return None
        except ValueError:
            logger.warning("Resposta inesperada da busca web (Tavily): JSON inválido.")
            return None

        return _extract_context(data)


def _extract_context(data: dict[str, object]) -> str | None:
    """Extrai o melhor texto de contexto disponível na resposta do Tavily."""
    answer = data.get("answer")
    if isinstance(answer, str) and answer.strip():
        return answer.strip()

    results = data.get("results")
    if not isinstance(results, list):
        return None

    snippets = [
        str(result["content"]).strip()
        for result in results
        if isinstance(result, dict) and result.get("content")
    ]
    if not snippets:
        return None
    return " ".join(snippets[:WEB_SEARCH_MAX_RESULTS])
