import pytest

from app.chat.adapters import openai_adapter
from app.chat.adapters.openai_adapter import (
    OpenAIChatCompletionProvider,
    OpenAIEmbeddingProvider,
)


@pytest.fixture(autouse=True)
def _llm_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    """Garante LLM_API_KEY nos testes — o client OpenAI real nunca é chamado."""
    monkeypatch.setenv("LLM_API_KEY", "test-key-not-real")
    openai_adapter.get_client.cache_clear()
    yield
    # Testes que substituem `get_client` via monkeypatch trocam a função
    # cacheada por um lambda simples — sem `cache_clear` para limpar.
    if hasattr(openai_adapter.get_client, "cache_clear"):
        openai_adapter.get_client.cache_clear()


class _FakeMessage:
    def __init__(self, content: str) -> None:
        self.content = content


class _FakeChoice:
    def __init__(self, content: str) -> None:
        self.message = _FakeMessage(content)


class _FakeCompletion:
    def __init__(self, content: str) -> None:
        self.choices = [_FakeChoice(content)]


class _FakeCompletionsResource:
    def __init__(self, answer: str) -> None:
        self._answer = answer
        self.call_count = 0
        self.last_kwargs: dict[str, object] | None = None

    def create(self, **kwargs: object) -> _FakeCompletion:
        self.call_count += 1
        self.last_kwargs = kwargs
        return _FakeCompletion(self._answer)


class _FakeChatResource:
    def __init__(self, answer: str) -> None:
        self.completions = _FakeCompletionsResource(answer)


class _FakeEmbeddingData:
    def __init__(self, embedding: list[float]) -> None:
        self.embedding = embedding


class _FakeEmbeddingResponse:
    def __init__(self, embedding: list[float]) -> None:
        self.data = [_FakeEmbeddingData(embedding)]


class _FakeEmbeddingsResource:
    def __init__(self, embedding: list[float]) -> None:
        self._embedding = embedding
        self.last_kwargs: dict[str, object] | None = None

    def create(self, **kwargs: object) -> _FakeEmbeddingResponse:
        self.last_kwargs = kwargs
        return _FakeEmbeddingResponse(self._embedding)


class _FakeOpenAIClient:
    def __init__(self, embedding: list[float], answer: str = "") -> None:
        self.embeddings = _FakeEmbeddingsResource(embedding)
        self.chat = _FakeChatResource(answer)


def test_get_client_configures_timeout_and_max_retries() -> None:
    """CA-001/CA-002 (US-14-03): timeout explícito e no máximo 1 retry (ADR-004)."""
    client = openai_adapter.get_client()

    assert client.timeout == openai_adapter.OPENAI_TIMEOUT_SECONDS
    assert client.timeout == 20.0
    assert 15.0 <= client.timeout <= 30.0
    assert client.max_retries == openai_adapter.OPENAI_MAX_RETRIES
    assert client.max_retries == 1


def test_embedding_provider_returns_vector_from_client(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """`OpenAIEmbeddingProvider.embed_text` retorna o vetor do client mockado."""
    fake_client = _FakeOpenAIClient(embedding=[0.1, 0.2, 0.3])
    monkeypatch.setattr(openai_adapter, "get_client", lambda: fake_client)

    embedding = OpenAIEmbeddingProvider().embed_text("pergunta")

    assert embedding == [0.1, 0.2, 0.3]
    assert fake_client.embeddings.last_kwargs["model"] == openai_adapter.EMBEDDING_MODEL
    assert fake_client.embeddings.last_kwargs["input"] == "pergunta"


def test_chat_completion_provider_returns_message_content(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """`OpenAIChatCompletionProvider.generate_completion` retorna o texto gerado."""
    fake_client = _FakeOpenAIClient(embedding=[], answer="Resposta gerada.")
    monkeypatch.setattr(openai_adapter, "get_client", lambda: fake_client)
    messages = [{"role": "user", "content": "Oi"}]

    answer = OpenAIChatCompletionProvider().generate_completion(
        model="gpt-4o-mini", messages=messages
    )

    assert answer == "Resposta gerada."
    assert fake_client.chat.completions.last_kwargs["model"] == "gpt-4o-mini"
    assert fake_client.chat.completions.last_kwargs["messages"] == messages
    assert fake_client.chat.completions.call_count == 1


def test_chat_completion_provider_returns_empty_string_without_content(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Sem conteúdo na resposta, retorna string vazia (fallback é do chamador)."""
    fake_client = _FakeOpenAIClient(embedding=[], answer="")
    monkeypatch.setattr(openai_adapter, "get_client", lambda: fake_client)

    answer = OpenAIChatCompletionProvider().generate_completion(
        model="gpt-4o-mini", messages=[{"role": "user", "content": "Oi"}]
    )

    assert answer == ""
