"""Fakes de port (`app.chat.ports`) compartilhados pelos testes do domínio chat.

ADR-012 / US-14-03: implementam a forma de `EmbeddingProvider`,
`ChatCompletionProvider` e `WebSearchProvider` sem herdar nada (`Protocol` é
estruturalmente tipado) e sem tocar `openai`/`httpx` de verdade.
"""

from __future__ import annotations


class FakeEmbeddingProvider:
    """Sempre retorna o mesmo vetor de embedding, independente do texto."""

    def __init__(self, embedding: list[float] | None = None) -> None:
        self.embedding = embedding if embedding is not None else [1.0, 0.0]
        self.calls: list[str] = []

    def embed_text(self, text: str) -> list[float]:
        self.calls.append(text)
        return self.embedding


class FakeEmbeddingProviderByText:
    """Retorna um vetor diferente por texto exato — útil quando o teste precisa
    diferenciar o embedding de cada chunk/pergunta."""

    def __init__(self, embedding_by_text: dict[str, list[float]]) -> None:
        self._embedding_by_text = embedding_by_text

    def embed_text(self, text: str) -> list[float]:
        return self._embedding_by_text[text]


class RaisingEmbeddingProvider:
    """Levanta a exceção informada — simula falha do provider nos embeddings."""

    def __init__(self, exc: Exception) -> None:
        self._exc = exc

    def embed_text(self, text: str) -> list[float]:
        raise self._exc


class FakeChatCompletionProvider:
    """Devolve uma resposta fixa e registra a última chamada recebida."""

    def __init__(self, answer: str = "") -> None:
        self.answer = answer
        self.call_count = 0
        self.last_model: str | None = None
        self.last_messages: list[dict[str, str]] | None = None

    def generate_completion(self, model: str, messages: list[dict[str, str]]) -> str:
        self.call_count += 1
        self.last_model = model
        self.last_messages = messages
        return self.answer


class RaisingChatCompletionProvider:
    """Levanta a exceção informada — simula falha do provider na geração."""

    def __init__(self, exc: Exception) -> None:
        self._exc = exc

    def generate_completion(self, model: str, messages: list[dict[str, str]]) -> str:
        raise self._exc


class FakeWebSearchProvider:
    """Devolve um resultado fixo (ou `None`) e registra as queries recebidas."""

    def __init__(self, result: str | None = None) -> None:
        self.result = result
        self.calls: list[str] = []

    def search_web(self, query: str) -> str | None:
        self.calls.append(query)
        return self.result


class FailIfCalledWebSearchProvider:
    """Falha o teste se `search_web` for chamado — prova que não deveria ter sido."""

    def search_web(self, query: str) -> str | None:
        raise AssertionError("search_web não deveria ser chamado")
