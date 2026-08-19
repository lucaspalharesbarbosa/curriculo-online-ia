"""Testes unitários do use case `service.answer_question` (ADR-012, US-14-03).

Fakes de port (`tests/chat/fakes.py`) no lugar de mock de SDK — nunca toca
`openai`/`httpx` de verdade.
"""

from __future__ import annotations

import pytest
from openai import OpenAIError

from app.chat import rag, service
from tests.chat.fakes import (
    FailIfCalledWebSearchProvider,
    FakeChatCompletionProvider,
    FakeEmbeddingProvider,
    FakeWebSearchProvider,
    RaisingChatCompletionProvider,
    RaisingEmbeddingProvider,
)

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
def _fixed_index_and_entities(monkeypatch: pytest.MonkeyPatch) -> None:
    """Índice/entidades fixos — sem depender do `resume.json` real nem recalcular."""
    monkeypatch.setattr(service, "_index_cache", FIXTURE_INDEX)
    monkeypatch.setattr(service, "_entities_cache", ["Engineering Brasil"])


def test_answer_question_returns_generated_answer_for_relevant_question() -> None:
    """Pergunta com contexto relevante gera resposta via `ChatCompletionProvider`."""
    embedding_provider = FakeEmbeddingProvider(embedding=[1.0, 0.0])
    chat_completion_provider = FakeChatCompletionProvider(
        answer="Você trabalha na Engineering Brasil."
    )
    web_search_provider = FailIfCalledWebSearchProvider()

    answer, source = service.answer_question(
        "Onde você trabalha?",
        embedding_provider,
        chat_completion_provider,
        web_search_provider,
    )

    assert answer == "Você trabalha na Engineering Brasil."
    assert source == "resume"
    assert chat_completion_provider.call_count == 1
    assert chat_completion_provider.last_messages[0]["content"] == service.SYSTEM_PROMPT


def test_answer_question_returns_fallback_for_out_of_scope_question() -> None:
    """Pergunta fora do escopo (similaridade baixa, sem entidade) retorna fallback."""
    embedding_provider = FakeEmbeddingProvider(embedding=[-1.0, -1.0])
    chat_completion_provider = FakeChatCompletionProvider()
    web_search_provider = FailIfCalledWebSearchProvider()

    answer, source = service.answer_question(
        "Qual a previsão do tempo?",
        embedding_provider,
        chat_completion_provider,
        web_search_provider,
    )

    assert answer == service.FALLBACK_ANSWER
    assert source == "resume"
    assert chat_completion_provider.call_count == 0


def test_answer_question_triggers_web_search_when_similarity_low_and_entity_known() -> (
    None
):
    """CA-001 (US-11-07): score local baixo + entidade citada aciona a busca web."""
    embedding_provider = FakeEmbeddingProvider(embedding=[-1.0, -1.0])
    chat_completion_provider = FakeChatCompletionProvider(
        answer="A Engineering Brasil atua com IA."
    )
    web_search_provider = FakeWebSearchProvider(result="Contexto público da web.")

    answer, source = service.answer_question(
        "O que a Engineering Brasil faz?",
        embedding_provider,
        chat_completion_provider,
        web_search_provider,
    )

    assert answer == "A Engineering Brasil atua com IA."
    assert source == "web"
    assert web_search_provider.calls == ["O que a Engineering Brasil faz?"]
    sent_system_message = chat_completion_provider.last_messages[0]["content"]
    assert sent_system_message == service.WEB_SYSTEM_PROMPT
    assert (
        "Contexto público da web."
        in chat_completion_provider.last_messages[1]["content"]
    )


def test_answer_question_graceful_fallback_when_web_search_returns_none() -> None:
    """CA-002 (US-11-07): busca web indisponível (retorna None) não gera erro."""
    embedding_provider = FakeEmbeddingProvider(embedding=[-1.0, -1.0])
    chat_completion_provider = FakeChatCompletionProvider()
    web_search_provider = FakeWebSearchProvider(result=None)

    answer, source = service.answer_question(
        "O que a Engineering Brasil faz?",
        embedding_provider,
        chat_completion_provider,
        web_search_provider,
    )

    assert answer == service.FALLBACK_ANSWER
    assert source == "resume"
    assert chat_completion_provider.call_count == 0


def test_answer_question_does_not_trigger_web_search_without_known_entity() -> None:
    """CA-004 (US-11-07): pergunta genérica sem entidade conhecida não busca a web."""
    embedding_provider = FakeEmbeddingProvider(embedding=[-1.0, -1.0])
    chat_completion_provider = FakeChatCompletionProvider()
    web_search_provider = FailIfCalledWebSearchProvider()

    answer, source = service.answer_question(
        "Qual a previsão do tempo?",
        embedding_provider,
        chat_completion_provider,
        web_search_provider,
    )

    assert answer == service.FALLBACK_ANSWER
    assert source == "resume"


def test_answer_question_propagates_embedding_provider_error() -> None:
    """Falha do `EmbeddingProvider` na busca local propaga sem ser capturada aqui."""
    embedding_provider = RaisingEmbeddingProvider(OpenAIError("falha simulada"))
    chat_completion_provider = FakeChatCompletionProvider()
    web_search_provider = FailIfCalledWebSearchProvider()

    with pytest.raises(OpenAIError):
        service.answer_question(
            "Onde você trabalha?",
            embedding_provider,
            chat_completion_provider,
            web_search_provider,
        )


def test_answer_question_propagates_chat_completion_provider_error() -> None:
    """Falha do `ChatCompletionProvider` na geração propaga sem ser capturada aqui."""
    embedding_provider = FakeEmbeddingProvider(embedding=[1.0, 0.0])
    chat_completion_provider = RaisingChatCompletionProvider(
        OpenAIError("falha simulada")
    )
    web_search_provider = FailIfCalledWebSearchProvider()

    with pytest.raises(OpenAIError):
        service.answer_question(
            "Onde você trabalha?",
            embedding_provider,
            chat_completion_provider,
            web_search_provider,
        )


def test_get_index_loads_once_and_reuses_in_memory_cache(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Carrega o índice uma vez e reaproveita o cache em memória."""
    monkeypatch.setattr(service, "_index_cache", None)
    calls = {"count": 0}

    def _fake_load_or_build_index(embedding_provider: object) -> list:
        calls["count"] += 1
        return FIXTURE_INDEX

    monkeypatch.setattr(rag, "load_or_build_index", _fake_load_or_build_index)
    embedding_provider = FakeEmbeddingProvider()

    first = service.get_index(embedding_provider)
    second = service.get_index(embedding_provider)

    assert first is FIXTURE_INDEX
    assert second is FIXTURE_INDEX
    assert calls["count"] == 1


def test_get_known_entities_loads_once_and_reuses_in_memory_cache(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Carrega as entidades conhecidas uma vez e reaproveita o cache em memória."""
    monkeypatch.setattr(service, "_entities_cache", None)
    calls = {"count": 0}

    def _fake_extract_known_entities(resume: object) -> list[str]:
        calls["count"] += 1
        return ["Engineering Brasil"]

    monkeypatch.setattr(rag, "load_resume", lambda: object())
    monkeypatch.setattr(rag, "extract_known_entities", _fake_extract_known_entities)

    first = service.get_known_entities()
    second = service.get_known_entities()

    assert first == ["Engineering Brasil"]
    assert second == ["Engineering Brasil"]
    assert calls["count"] == 1
