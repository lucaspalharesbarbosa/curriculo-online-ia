"""Ports (typing.Protocol) do domínio chat — interfaces com os SDKs externos.

Ports & Adapters (ADR-012): `rag.py`/`service.py` dependem só destas
interfaces, nunca de `openai`/`httpx` direto. Implementações reais em
`app/chat/adapters/`; fakes de teste implementam a mesma forma sem herdar
nada (`Protocol` é estruturalmente tipado — duck typing verificado por
mypy/pyright, sem necessidade de herança).
"""

from __future__ import annotations

from typing import Protocol


class EmbeddingProvider(Protocol):
    """Gera o vetor de embedding de um texto (equivalente a `embeddings.create`)."""

    def embed_text(self, text: str) -> list[float]: ...


class ChatCompletionProvider(Protocol):
    """Gera uma resposta de chat a partir de um modelo e uma lista de mensagens.

    Equivalente a `chat.completions.create(...).choices[0].message.content`,
    já resolvido para o texto da resposta (ou `""` se o provider não retornar
    conteúdo) — o chamador decide o fallback, o adapter só traduz o SDK.
    """

    def generate_completion(
        self, model: str, messages: list[dict[str, str]]
    ) -> str: ...


class WebSearchProvider(Protocol):
    """Busca contexto público na web para uma query (equivalente a `search_web`).

    Contrato: nunca propaga exceção — qualquer falha do provider externo
    (timeout, erro HTTP, resposta sem conteúdo aproveitável) retorna `None`.
    """

    def search_web(self, query: str) -> str | None: ...
