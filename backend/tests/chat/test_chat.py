"""Testes de integração de /chat e /chat/feedback via `TestClient` (ADR-012, US-14-03).

Adapters reais substituídos por fakes de port via override do `Depends()` do
FastAPI (`app.dependency_overrides`) — nunca toca `openai`/`httpx` de verdade.
"""

from __future__ import annotations

import httpx
import pytest
from fastapi.testclient import TestClient
from openai import APITimeoutError, AuthenticationError, OpenAIError, RateLimitError

from app.chat import rag, service
from app.chat import router as chat
from app.main import app
from tests.chat.fakes import (
    FailIfCalledWebSearchProvider,
    FakeChatCompletionProvider,
    FakeEmbeddingProvider,
    FakeWebSearchProvider,
    RaisingChatCompletionProvider,
    RaisingEmbeddingProvider,
)

client = TestClient(app)

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


@pytest.fixture(autouse=True)
def _reset_rate_limit() -> None:
    """Evita que o rate limit (estado em memória, módulo `router`) vaze entre testes."""
    chat._request_log.clear()


@pytest.fixture(autouse=True)
def _llm_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    """Garante LLM_API_KEY nos testes — adapters reais sempre viram fakes."""
    monkeypatch.setenv("LLM_API_KEY", "test-key-not-real")


@pytest.fixture(autouse=True)
def _reset_dependency_overrides() -> None:
    """Limpa os overrides de `Depends()` entre testes (fake não vaza p/ outro)."""
    yield
    app.dependency_overrides.clear()


def _override_providers(
    embedding_provider: object = None,
    chat_completion_provider: object = None,
    web_search_provider: object = None,
) -> None:
    """Substitui os adapters reais pelos fakes informados via `Depends()` override."""
    if embedding_provider is not None:
        app.dependency_overrides[chat.get_embedding_provider] = (
            lambda: embedding_provider
        )
    if chat_completion_provider is not None:
        app.dependency_overrides[chat.get_chat_completion_provider] = (
            lambda: chat_completion_provider
        )
    if web_search_provider is not None:
        app.dependency_overrides[chat.get_web_search_provider] = (
            lambda: web_search_provider
        )


@pytest.fixture
def stub_index(monkeypatch: pytest.MonkeyPatch) -> None:
    """Substitui o índice real por um fixo e determinístico, sem tocar OpenAI."""
    monkeypatch.setattr(service, "_index_cache", FIXTURE_INDEX)


@pytest.fixture
def stub_entities(monkeypatch: pytest.MonkeyPatch) -> None:
    """Entidades conhecidas fixas — sem depender do resume.json real (US-11-07)."""
    monkeypatch.setattr(service, "_entities_cache", ["Engineering Brasil"])


def test_chat_returns_response_with_relevant_context(stub_index: None) -> None:
    """Retorna resposta com contexto relevante do currículo."""
    chat_completion_provider = FakeChatCompletionProvider(
        answer="Você trabalha na Engineering Brasil."
    )
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[1.0, 0.0]),
        chat_completion_provider=chat_completion_provider,
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Você trabalha na Engineering Brasil.",
        "source": "resume",
    }
    assert chat_completion_provider.call_count == 1


def test_chat_returns_fallback_for_out_of_scope_question(
    stub_index: None, stub_entities: None
) -> None:
    """Retorna fallback para pergunta fora do escopo do currículo."""
    chat_completion_provider = FakeChatCompletionProvider()
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[-1.0, -1.0]),
        chat_completion_provider=chat_completion_provider,
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post("/chat", json={"question": "Qual a previsão do tempo?"})

    assert response.status_code == 200
    assert response.json() == {"answer": service.FALLBACK_ANSWER, "source": "resume"}
    assert chat_completion_provider.call_count == 0


def test_chat_returns_422_for_empty_question() -> None:
    """Retorna 422 para pergunta vazia."""
    response = client.post("/chat", json={"question": ""})

    assert response.status_code == 422


def test_chat_returns_422_for_missing_field() -> None:
    """Retorna 422 quando falta um campo obrigatório."""
    response = client.post("/chat", json={})

    assert response.status_code == 422


def test_chat_returns_503_when_embeddings_fail_without_leaking_internal_detail(
    stub_index: None,
) -> None:
    """Falha genérica (não auth/rate-limit) do provider → 503, shape padrão de erro."""
    _override_providers(
        embedding_provider=RaisingEmbeddingProvider(
            OpenAIError("falha simulada de embeddings")
        ),
        chat_completion_provider=FakeChatCompletionProvider(),
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 503
    assert response.json() == {
        "error": {"code": "llm_unavailable", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "falha simulada" not in response.text


def test_chat_returns_503_when_generation_fails(stub_index: None) -> None:
    """Retorna 503 quando a geração da resposta falha."""
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[1.0, 0.0]),
        chat_completion_provider=RaisingChatCompletionProvider(
            OpenAIError("falha simulada de geração")
        ),
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 503
    assert response.json() == {
        "error": {"code": "llm_unavailable", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "falha simulada" not in response.text


def test_chat_returns_429_after_exceeding_rate_limit(stub_index: None) -> None:
    """Retorna 429 após exceder o limite de requisições."""
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[1.0, 0.0]),
        chat_completion_provider=FakeChatCompletionProvider(answer="resposta"),
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    for _ in range(chat.RATE_LIMIT_MAX_REQUESTS):
        response = client.post("/chat", json={"question": "Onde você trabalha?"})
        assert response.status_code == 200

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 429
    assert response.json() == {
        "error": {"code": "rate_limited", "message": chat.RATE_LIMIT_MESSAGE}
    }


def test_chat_returns_500_generic_when_key_missing(
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


def test_chat_returns_500_when_provider_quota_exhausted(stub_index: None) -> None:
    """RateLimitError real do provider (quota/cota) → 500 (falha de config/conta)."""
    request = httpx.Request("POST", "https://api.openai.com/v1/embeddings")
    response_obj = httpx.Response(429, request=request)
    _override_providers(
        embedding_provider=RaisingEmbeddingProvider(
            RateLimitError("insufficient_quota", response=response_obj, body=None)
        ),
        chat_completion_provider=FakeChatCompletionProvider(),
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": "internal_error", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "quota" not in response.text.lower()
    assert "OpenAI" not in response.text


def test_chat_returns_500_when_provider_authentication_fails(stub_index: None) -> None:
    """AuthenticationError real do provider (chave inválida) → 500 (falha nossa)."""
    request = httpx.Request("POST", "https://api.openai.com/v1/embeddings")
    response_obj = httpx.Response(401, request=request)
    _override_providers(
        embedding_provider=RaisingEmbeddingProvider(
            AuthenticationError("invalid api key", response=response_obj, body=None)
        ),
        chat_completion_provider=FakeChatCompletionProvider(),
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": "internal_error", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "OpenAI" not in response.text


def test_chat_returns_503_when_openai_timeout(stub_index: None) -> None:
    """Timeout do provider (não auth/rate-limit) → 503, sem vazar detalhe interno."""
    _override_providers(
        embedding_provider=RaisingEmbeddingProvider(APITimeoutError(request=None)),
        chat_completion_provider=FakeChatCompletionProvider(),
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post("/chat", json={"question": "Onde você trabalha?"})

    assert response.status_code == 503
    assert response.json() == {
        "error": {"code": "llm_unavailable", "message": chat.GENERIC_ERROR_MESSAGE}
    }
    assert "timeout" not in response.text.lower()
    assert "OpenAI" not in response.text


def test_chat_returns_422_with_standard_error_shape_and_preserved_details() -> None:
    """Validação do Pydantic segue o mesmo envelope, com os detalhes originais."""
    response = client.post("/chat", json={"question": ""})

    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["message"] == "Dados inválidos."
    assert isinstance(body["error"]["details"], list)
    assert len(body["error"]["details"]) >= 1


# --- US-11-06: regressão de precisão de recuperação (roteamento por seção/recência) --


def test_chat_prioritizes_education_for_where_did_you_study_question(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-001: "onde você estudou?" usa o chunk de education no contexto."""
    monkeypatch.setattr(service, "_index_cache", ROUTING_FIXTURE_INDEX)
    chat_completion_provider = FakeChatCompletionProvider(
        answer="Você estudou na Universidade X."
    )
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[0.5, 0.5]),
        chat_completion_provider=chat_completion_provider,
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post("/chat", json={"question": "Onde você estudou?"})

    assert response.status_code == 200
    assert response.json()["source"] == "resume"
    sent_prompt = chat_completion_provider.last_messages[1]["content"]
    assert "Formação" in sent_prompt


def test_chat_prioritizes_recent_experience_for_last_company(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-002: "última empresa" traz o cargo atual antes do cargo antigo no prompt."""
    monkeypatch.setattr(service, "_index_cache", ROUTING_FIXTURE_INDEX)
    chat_completion_provider = FakeChatCompletionProvider(
        answer="Sua última empresa é a Empresa Atual."
    )
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[1.0, 0.0]),
        chat_completion_provider=chat_completion_provider,
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post(
        "/chat", json={"question": "Qual a última empresa que trabalhei?"}
    )

    assert response.status_code == 200
    sent_prompt = chat_completion_provider.last_messages[1]["content"]
    assert sent_prompt.index("Empresa Atual") < sent_prompt.index("Empresa Antiga")


def test_chat_without_keyword_keeps_current_similarity_behavior(
    stub_index: None,
) -> None:
    """CA-003: pergunta específica (skills) já coberta hoje não regride."""
    chat_completion_provider = FakeChatCompletionProvider(
        answer="Sim, já trabalhei com Python."
    )
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[1.0, 0.0]),
        chat_completion_provider=chat_completion_provider,
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post("/chat", json={"question": "Já trabalhou com Python?"})

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Sim, já trabalhei com Python.",
        "source": "resume",
    }


# --- US-11-07: web search fallback para entidades externas (ADR-010 seção 2) --------


def test_chat_triggers_web_search_when_similarity_low_and_entity_known(
    stub_index: None, stub_entities: None
) -> None:
    """CA-001: score local abaixo do threshold + entidade citada aciona a busca web."""
    chat_completion_provider = FakeChatCompletionProvider(
        answer="A Engineering Brasil atua com IA."
    )
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[-1.0, -1.0]),
        chat_completion_provider=chat_completion_provider,
        web_search_provider=FakeWebSearchProvider(result="Contexto público da web."),
    )

    response = client.post(
        "/chat", json={"question": "O que a Engineering Brasil faz?"}
    )

    assert response.status_code == 200
    assert response.json() == {
        "answer": "A Engineering Brasil atua com IA.",
        "source": "web",
    }
    sent_messages = chat_completion_provider.last_messages
    assert sent_messages[0]["content"] == service.WEB_SYSTEM_PROMPT
    assert "Contexto público da web." in sent_messages[1]["content"]


def test_chat_graceful_fallback_when_web_search_fails(
    stub_index: None, stub_entities: None
) -> None:
    """CA-002: busca web indisponível (retorna None) não gera erro 5xx."""
    chat_completion_provider = FakeChatCompletionProvider()
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[-1.0, -1.0]),
        chat_completion_provider=chat_completion_provider,
        web_search_provider=FakeWebSearchProvider(result=None),
    )

    response = client.post(
        "/chat", json={"question": "O que a Engineering Brasil faz?"}
    )

    assert response.status_code == 200
    assert response.json() == {"answer": service.FALLBACK_ANSWER, "source": "resume"}
    assert chat_completion_provider.call_count == 0


def test_chat_does_not_trigger_web_search_without_known_entity(
    stub_index: None, stub_entities: None
) -> None:
    """CA-004: pergunta genérica sem entidade do currículo não vira agente de busca."""
    chat_completion_provider = FakeChatCompletionProvider()
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[-1.0, -1.0]),
        chat_completion_provider=chat_completion_provider,
        web_search_provider=FailIfCalledWebSearchProvider(),
    )

    response = client.post("/chat", json={"question": "Qual a previsão do tempo?"})

    assert response.status_code == 200
    assert response.json() == {"answer": service.FALLBACK_ANSWER, "source": "resume"}


def test_chat_returns_503_when_generation_fails_after_web_search(
    stub_index: None, stub_entities: None
) -> None:
    """Falha do LLM ao gerar a resposta com contexto web segue o mapeamento padrão."""
    _override_providers(
        embedding_provider=FakeEmbeddingProvider(embedding=[-1.0, -1.0]),
        chat_completion_provider=RaisingChatCompletionProvider(
            OpenAIError("falha simulada de geração")
        ),
        web_search_provider=FakeWebSearchProvider(result="Contexto público da web."),
    )

    response = client.post(
        "/chat", json={"question": "O que a Engineering Brasil faz?"}
    )

    assert response.status_code == 503
    assert response.json() == {
        "error": {"code": "llm_unavailable", "message": chat.GENERIC_ERROR_MESSAGE}
    }


# --- US-11-04: feedback do usuário na resposta (log estruturado) --------------------


def test_chat_feedback_returns_ok_for_valid_request() -> None:
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


def test_chat_feedback_returns_422_for_invalid_rating() -> None:
    """Retorna 422 para rating inválido."""
    response = client.post(
        "/chat/feedback",
        json={"question": "Pergunta", "answer": "Resposta", "rating": "invalido"},
    )

    assert response.status_code == 422


def test_chat_feedback_returns_422_for_missing_field() -> None:
    """Retorna 422 quando falta um campo obrigatório."""
    response = client.post("/chat/feedback", json={"question": "Pergunta"})

    assert response.status_code == 422


def test_chat_feedback_does_not_expose_full_question_and_answer_in_log(
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


def test_chat_feedback_logging_failure_does_not_break_response(
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
