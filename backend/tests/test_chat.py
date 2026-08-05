import pytest
from fastapi.testclient import TestClient
from openai import OpenAIError

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


@pytest.fixture(autouse=True)
def _reset_rate_limit() -> None:
    """Evita que o rate limit (estado em memória, módulo `chat`) vaze entre testes."""
    chat._request_log.clear()


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


def test_chat_retorna_500_generico_sem_vazar_detalhe_interno(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(rag, "get_client", lambda: _RaisingOpenAIClient())

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 500
    assert response.json() == {"detail": chat.GENERIC_ERROR_MESSAGE}
    assert "falha simulada" not in response.text


def test_chat_retorna_500_generico_quando_geracao_falha(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake_client = _EmbeddingOkGenerationFailsClient(question_embedding=[1.0, 0.0])
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 500
    assert response.json() == {"detail": chat.GENERIC_ERROR_MESSAGE}
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
    assert response.json() == {"detail": chat.RATE_LIMIT_MESSAGE}


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
