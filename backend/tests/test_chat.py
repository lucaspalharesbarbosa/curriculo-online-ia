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
        self.last_messages: list[dict[str, str]] | None = None

    def create(self, model: str, messages: list[dict[str, str]]):  # noqa: ANN001
        self.call_count += 1
        self.last_messages = messages
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

# US-11-06: índice com seções que competem por similaridade, usado para provar
# que o roteamento por seção/recência muda o contexto selecionado.
ROUTING_FIXTURE_INDEX = [
    rag.EmbeddedChunk(
        chunk=rag.Chunk(
            id="education-0",
            section="education",
            text="Formação: Bacharelado em Ciência da Computação em Universidade X.",
        ),
        embedding=[0.0, 1.0],
    ),
    rag.EmbeddedChunk(
        chunk=rag.Chunk(
            id="experience-0",
            section="experience",
            text="Cargo atual na Empresa Atual.",
            recency_key=rag.EXPERIENCE_ONGOING_RECENCY_KEY,
        ),
        embedding=[0.6, 0.4],
    ),
    rag.EmbeddedChunk(
        chunk=rag.Chunk(
            id="experience-1",
            section="experience",
            text="Cargo antigo na Empresa Antiga.",
            recency_key="2019-12",
        ),
        embedding=[1.0, 0.0],
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


@pytest.fixture
def stub_entities(monkeypatch: pytest.MonkeyPatch) -> None:
    """Entidades conhecidas fixas — sem depender do resume.json real (US-11-07)."""
    monkeypatch.setattr(chat, "get_known_entities", lambda: ["Engineering Brasil"])


@pytest.fixture(autouse=True)
def _no_web_search_key_by_default(monkeypatch: pytest.MonkeyPatch) -> None:
    """Sem WEB_SEARCH_API_KEY por padrão — nunca bate na API real do Tavily.

    Testes que precisam simular a chave configurada usam `monkeypatch.setenv`
    explicitamente (ver testes de US-11-07 abaixo).
    """
    monkeypatch.delenv("WEB_SEARCH_API_KEY", raising=False)


def test_chat_retorna_resposta_com_contexto_relevante(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake_client = _FakeOpenAIClient(
        question_embedding=[1.0, 0.0], answer="Você trabalha na Engineering Brasil."
    )
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Você trabalha na Engineering Brasil.",
        "source": "resume",
    }
    assert fake_client.chat.completions.call_count == 1


def test_chat_retorna_fallback_para_pergunta_fora_do_escopo(
    stub_index: None, stub_entities: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake_client = _FakeOpenAIClient(question_embedding=[-1.0, -1.0])
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    response = client.post("/chat", json={"question": "Qual a previsão do tempo?"})

    assert response.status_code == 200
    assert response.json() == {"answer": chat.FALLBACK_ANSWER, "source": "resume"}
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


# --- US-11-06: regressão de precisão de recuperação (roteamento por seção/recência) --


def test_chat_prioriza_formacao_para_pergunta_onde_estudei(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-001: "onde você estudou?" usa o chunk de education no contexto."""
    monkeypatch.setattr(chat, "get_index", lambda: ROUTING_FIXTURE_INDEX)
    fake_client = _FakeOpenAIClient(
        question_embedding=[0.5, 0.5], answer="Você estudou na Universidade X."
    )
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    response = client.post("/chat", json={"question": "Onde você estudou?"})

    assert response.status_code == 200
    assert response.json()["source"] == "resume"
    sent_prompt = fake_client.chat.completions.last_messages[1]["content"]
    assert "Formação" in sent_prompt


def test_chat_prioriza_experiencia_recente_para_ultima_empresa(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-002: "última empresa" traz o cargo atual antes do cargo antigo no prompt."""
    monkeypatch.setattr(chat, "get_index", lambda: ROUTING_FIXTURE_INDEX)
    fake_client = _FakeOpenAIClient(
        question_embedding=[1.0, 0.0], answer="Sua última empresa é a Empresa Atual."
    )
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    response = client.post(
        "/chat", json={"question": "Qual a última empresa que trabalhei?"}
    )

    assert response.status_code == 200
    sent_prompt = fake_client.chat.completions.last_messages[1]["content"]
    assert sent_prompt.index("Empresa Atual") < sent_prompt.index("Empresa Antiga")


def test_chat_sem_palavra_chave_mantem_comportamento_atual_por_similaridade(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """CA-003: pergunta específica (skills) já coberta hoje não regride."""
    fake_client = _FakeOpenAIClient(
        question_embedding=[1.0, 0.0], answer="Sim, já trabalhei com Python."
    )
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    response = client.post("/chat", json={"question": "Já trabalhou com Python?"})

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Sim, já trabalhei com Python.",
        "source": "resume",
    }


# --- US-11-07: web search fallback para entidades externas (ADR-010 seção 2) --------


def test_chat_aciona_busca_web_quando_similaridade_baixa_e_entidade_conhecida(
    stub_index: None, stub_entities: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """CA-001: score local abaixo do threshold + entidade citada aciona a busca web."""
    fake_client = _FakeOpenAIClient(
        question_embedding=[-1.0, -1.0], answer="A Engineering Brasil atua com IA."
    )
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)
    monkeypatch.setattr(
        chat.web_search, "search_web", lambda query: "Contexto público da web."
    )

    response = client.post(
        "/chat", json={"question": "O que a Engineering Brasil faz?"}
    )

    assert response.status_code == 200
    assert response.json() == {
        "answer": "A Engineering Brasil atua com IA.",
        "source": "web",
    }
    sent_messages = fake_client.chat.completions.last_messages
    assert sent_messages[0]["content"] == chat.WEB_SYSTEM_PROMPT
    assert "Contexto público da web." in sent_messages[1]["content"]


def test_chat_fallback_gracioso_quando_busca_web_falha(
    stub_index: None, stub_entities: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """CA-002: busca web indisponível (retorna None) não gera erro 5xx."""
    fake_client = _FakeOpenAIClient(question_embedding=[-1.0, -1.0])
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)
    monkeypatch.setattr(chat.web_search, "search_web", lambda query: None)

    response = client.post(
        "/chat", json={"question": "O que a Engineering Brasil faz?"}
    )

    assert response.status_code == 200
    assert response.json() == {"answer": chat.FALLBACK_ANSWER, "source": "resume"}
    assert fake_client.chat.completions.call_count == 0


def test_chat_nao_aciona_busca_web_sem_entidade_conhecida(
    stub_index: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """CA-004: pergunta genérica sem entidade do currículo não vira agente de busca."""
    monkeypatch.setattr(chat, "get_known_entities", lambda: ["Engineering Brasil"])
    fake_client = _FakeOpenAIClient(question_embedding=[-1.0, -1.0])
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    def _fail_if_called(query: str) -> str | None:
        raise AssertionError("search_web não deveria ser chamado sem entidade citada")

    monkeypatch.setattr(chat.web_search, "search_web", _fail_if_called)

    response = client.post("/chat", json={"question": "Qual a previsão do tempo?"})

    assert response.status_code == 200
    assert response.json() == {"answer": chat.FALLBACK_ANSWER, "source": "resume"}


def test_chat_retorna_503_quando_geracao_falha_apos_busca_web(
    stub_index: None, stub_entities: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Falha do LLM ao gerar a resposta com contexto web segue o mapeamento padrão."""
    fake_client = _EmbeddingOkGenerationFailsClient(question_embedding=[-1.0, -1.0])
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)
    monkeypatch.setattr(
        chat.web_search, "search_web", lambda query: "Contexto público da web."
    )

    response = client.post(
        "/chat", json={"question": "O que a Engineering Brasil faz?"}
    )

    assert response.status_code == 503
    assert response.json() == {
        "error": {"code": "llm_unavailable", "message": chat.GENERIC_ERROR_MESSAGE}
    }


def test_get_known_entities_carrega_uma_vez_e_reaproveita_cache_em_memoria(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(chat, "_entities_cache", None)
    calls = {"count": 0}

    def _fake_extract_known_entities(resume: object) -> list[str]:
        calls["count"] += 1
        return ["Engineering Brasil"]

    monkeypatch.setattr(rag, "load_resume", lambda: object())
    monkeypatch.setattr(rag, "extract_known_entities", _fake_extract_known_entities)

    first = chat.get_known_entities()
    second = chat.get_known_entities()

    assert first == ["Engineering Brasil"]
    assert second == ["Engineering Brasil"]
    assert calls["count"] == 1


# --- US-11-04: feedback do usuário na resposta (log estruturado) --------------------


def test_chat_feedback_retorna_ok_para_request_valido() -> None:
    """CA-001/CA-002: request válido é logado e retorna 200 { ok: true }."""
    response = client.post(
        "/chat/feedback",
        json={
            "question": "Onde você trabalha?",
            "answer": "Na Engineering Brasil.",
            "rating": "up",
        },
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_chat_feedback_retorna_422_para_rating_invalido() -> None:
    response = client.post(
        "/chat/feedback",
        json={"question": "Pergunta", "answer": "Resposta", "rating": "invalido"},
    )

    assert response.status_code == 422


def test_chat_feedback_retorna_422_para_campo_ausente() -> None:
    response = client.post("/chat/feedback", json={"question": "Pergunta"})

    assert response.status_code == 422


def test_chat_feedback_nao_expoe_pergunta_e_resposta_completas_no_log(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-002: log estruturado sem persistência nem dado sensível exposto."""
    logged: list[str] = []
    monkeypatch.setattr(
        chat.logger, "info", lambda msg, *args: logged.append(msg % args)
    )

    response = client.post(
        "/chat/feedback",
        json={
            "question": "Pergunta sensível qualquer",
            "answer": "Resposta qualquer",
            "rating": "down",
        },
    )

    assert response.status_code == 200
    assert len(logged) == 1
    assert "Pergunta sensível qualquer" not in logged[0]
    assert "Resposta qualquer" not in logged[0]
    assert "rating=down" in logged[0]


def test_chat_feedback_falha_ao_logar_nao_quebra_a_resposta(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-003: falha ao registrar log nunca propaga erro ao client (fire-and-forget)."""

    def _raise(*args: object, **kwargs: object) -> None:
        raise RuntimeError("falha simulada no logger")

    monkeypatch.setattr(chat.logger, "info", _raise)

    response = client.post(
        "/chat/feedback",
        json={"question": "Pergunta", "answer": "Resposta", "rating": "up"},
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}
