import httpx
import pytest
from fastapi.testclient import TestClient
from openai import APITimeoutError, AuthenticationError, OpenAIError, RateLimitError

from app import chat, rag
from app.main import app

client = TestClient(app)


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

    def create(self, model: str, messages: list[dict[str, str]]):  # noqa: ANN001
        self.call_count += 1
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
    def __init__(self, question_embedding: list[float]) -> None:
        self._question_embedding = question_embedding

    def create(self, model: str, input: str):  # noqa: A002, ANN001
        return _FakeEmbeddingResponse(self._question_embedding)


class _FakeOpenAIClient:
    def __init__(self, question_embedding: list[float], answer: str = "") -> None:
        self.embeddings = _FakeEmbeddingsResource(question_embedding)
        self.chat = _FakeChatResource(answer)


class _RaisingEmbeddingsResource:
    def create(self, model: str, input: str):  # noqa: A002, ANN001
        raise OpenAIError("falha simulada de embeddings")


class _RaisingOpenAIClient:
    def __init__(self) -> None:
        self.embeddings = _RaisingEmbeddingsResource()


class _RaisingCompletionsResource:
    def create(self, model: str, messages: list[dict[str, str]]):  # noqa: ANN001
        raise OpenAIError("falha simulada de geração")


class _RaisingChatResource:
    def __init__(self) -> None:
        self.completions = _RaisingCompletionsResource()


class _EmbeddingOkGenerationFailsClient:
    def __init__(self, question_embedding: list[float]) -> None:
        self.embeddings = _FakeEmbeddingsResource(question_embedding)
        self.chat = _RaisingChatResource()


FIXTURE_INDEX = [
    rag.EmbeddedChunk(
        chunk=rag.Chunk(
            id="experience-0",
            section="experience",
            text="Tech Lead na Engineering Brasil, projetos de AI Engineering.",
        ),
        embedding=[1.0, 0.0],
    ),
    rag.EmbeddedChunk(
        chunk=rag.Chunk(id="skill-0", section="skill", text="Skills: Python, Java."),
        embedding=[0.0, 1.0],
    ),
]


def _fake_openai_response(status_code: int) -> httpx.Response:
    """Response mínima exigida pelos construtores de erro do SDK da OpenAI."""
    request = httpx.Request("POST", "https://api.openai.com/v1/chat/completions")
    return httpx.Response(status_code=status_code, request=request)


@pytest.fixture(autouse=True)
def _reset_rate_limit() -> None:
    """Evita que o rate limit (estado em memória, módulo `chat`) vaze entre testes."""
    chat._request_log.clear()


@pytest.fixture(autouse=True)
def _llm_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    """Garante LLM_API_KEY nos testes — o client OpenAI é sempre mockado."""
    monkeypatch.setenv("LLM_API_KEY", "test-key-not-real")


@pytest.fixture
def stub_index(monkeypatch: pytest.MonkeyPatch) -> None:
    """Substitui o índice real por um fixo e determinístico, sem chamar OpenAI."""
    monkeypatch.setattr(chat, "get_index", lambda: FIXTURE_INDEX)


def test_chat_retorna_resposta_com_contexto_relevante(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake_client = _FakeOpenAIClient(
        question_embedding=[1.0, 0.0], answer="Você trabalha na Engineering Brasil."
    )
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 200
    assert response.json() == {"answer": "Você trabalha na Engineering Brasil."}
    assert fake_client.chat.completions.call_count == 1


def test_chat_retorna_fallback_para_pergunta_fora_do_escopo(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake_client = _FakeOpenAIClient(question_embedding=[-1.0, -1.0])
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    response = client.post("/chat", json={"question": "Qual a previsão do tempo?"})

    assert response.status_code == 200
    assert response.json() == {"answer": chat.FALLBACK_ANSWER}
    assert fake_client.chat.completions.call_count == 0


def test_chat_retorna_422_para_pergunta_vazia() -> None:
    response = client.post("/chat", json={"question": ""})

    assert response.status_code == 422


def test_chat_retorna_422_para_campo_ausente() -> None:
    response = client.post("/chat", json={})

    assert response.status_code == 422


def test_chat_retorna_503_quando_embeddings_falham_sem_vazar_detalhe_interno(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Falha genérica (não auth/rate-limit) do provider → 503, shape padrão de erro."""
    monkeypatch.setattr(rag, "get_client", lambda: _RaisingOpenAIClient())

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 503
    assert response.json() == {
        "error": {"code": "llm_unavailable", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "falha simulada" not in response.text


def test_chat_retorna_503_quando_geracao_falha(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake_client = _EmbeddingOkGenerationFailsClient(question_embedding=[1.0, 0.0])
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 503
    assert response.json() == {
        "error": {"code": "llm_unavailable", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "falha simulada" not in response.text


def test_chat_retorna_429_apos_exceder_rate_limit(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake_client = _FakeOpenAIClient(question_embedding=[1.0, 0.0], answer="resposta")
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    for _ in range(chat.RATE_LIMIT_MAX_REQUESTS):
        response = client.post("/chat", json={"question": "Onde você trabalha?"})
        assert response.status_code == 200

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 429
    assert response.json() == {
        "error": {"code": "rate_limited", "message": chat.RATE_LIMIT_MESSAGE}
    }


def test_chat_retorna_500_generico_quando_chave_ausente(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Sem LLM_API_KEY, o client só vê mensagem genérica (sem vazar config)."""
    monkeypatch.delenv("LLM_API_KEY", raising=False)

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": "internal_error", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "LLM_API_KEY" not in response.text
    assert "OpenAI" not in response.text


def test_chat_retorna_500_quando_quota_do_provider_esgotada(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """RateLimitError real do provider (quota/cota) → 500 (falha de config/conta)."""

    class _QuotaFailEmbeddings:
        def create(self, model: str, input: str):  # noqa: A002, ANN001
            raise RateLimitError(
                "insufficient_quota",
                response=_fake_openai_response(429),
                body=None,
            )

    class _QuotaClient:
        def __init__(self) -> None:
            self.embeddings = _QuotaFailEmbeddings()

    monkeypatch.setattr(rag, "get_client", lambda: _QuotaClient())

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": "internal_error", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "quota" not in response.text.lower()
    assert "OpenAI" not in response.text


def test_chat_retorna_500_quando_autenticacao_do_provider_falha(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AuthenticationError real do provider (chave inválida) → 500 (falha nossa)."""

    class _AuthFailEmbeddings:
        def create(self, model: str, input: str):  # noqa: A002, ANN001
            raise AuthenticationError(
                "invalid api key",
                response=_fake_openai_response(401),
                body=None,
            )

    class _AuthFailClient:
        def __init__(self) -> None:
            self.embeddings = _AuthFailEmbeddings()

    monkeypatch.setattr(rag, "get_client", lambda: _AuthFailClient())

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": "internal_error", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "OpenAI" not in response.text


def test_chat_retorna_503_quando_openai_timeout(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Timeout do provider (não auth/rate-limit) → 503, sem vazar detalhe interno."""

    class _TimeoutEmbeddings:
        def create(self, model: str, input: str):  # noqa: A002, ANN001
            raise APITimeoutError(request=None)

    class _TimeoutClient:
        def __init__(self) -> None:
            self.embeddings = _TimeoutEmbeddings()

    monkeypatch.setattr(rag, "get_client", lambda: _TimeoutClient())

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 503
    assert response.json() == {
        "error": {"code": "llm_unavailable", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "timeout" not in response.text.lower()
    assert "OpenAI" not in response.text


def test_chat_retorna_422_com_shape_de_erro_padrao_e_detalhes_preservados() -> None:
    """Validação do Pydantic segue o mesmo envelope, com os detalhes originais."""
    response = client.post("/chat", json={"question": ""})

    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["message"] == "Dados inválidos."
    assert isinstance(body["error"]["details"], list)
    assert len(body["error"]["details"]) >= 1


def test_get_index_carrega_uma_vez_e_reaproveita_cache_em_memoria(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(chat, "_index_cache", None)
    calls = {"count": 0}

    def _fake_load_or_build_index() -> list[rag.EmbeddedChunk]:
        calls["count"] += 1
        return FIXTURE_INDEX

    monkeypatch.setattr(rag, "load_or_build_index", _fake_load_or_build_index)

    first = chat.get_index()
    second = chat.get_index()

    assert first is FIXTURE_INDEX
    assert second is FIXTURE_INDEX
    assert calls["count"] == 1
