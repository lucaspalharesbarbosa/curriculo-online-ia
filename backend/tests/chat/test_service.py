"""Testes unitários do use case `service.answer_question` (ADR-012, US-14-03).

Fakes de port (`tests/chat/fakes.py`) no lugar de mock de SDK — nunca toca
`openai`/`httpx` de verdade.
"""

from __future__ import annotations

import pytest
from openai import OpenAIError

from app.chat import rag, service
from tests.chat.fakes import (
    FailFirstThenAnswerChatCompletionProvider,
    FailIfCalledWebSearchProvider,
    FakeChatCompletionProvider,
    FakeEmbeddingProvider,
    FakeEmbeddingProviderByText,
    FakeWebSearchProvider,
    RaisingChatCompletionProvider,
    RaisingEmbeddingProvider,
    SequentialChatCompletionProvider,
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


# --- US-15-02: memória conversacional (ADR-014) --------------------------------------


def test_answer_question_resolves_anaphora_using_condensed_question_for_retrieval(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-001/CA-002: "onde fica a matriz da empresa?" resolve via histórico."""
    condensed_question = "Onde fica a matriz da NA Engineering Brasil?"
    chunk = rag.Chunk(
        id="experience-0",
        section="experience",
        text="A matriz da NA Engineering Brasil fica em São Paulo, SP.",
    )
    monkeypatch.setattr(
        service, "_index_cache", [rag.EmbeddedChunk(chunk=chunk, embedding=[1.0, 0.0])]
    )
    embedding_provider = FakeEmbeddingProviderByText(
        {
            condensed_question: [1.0, 0.0],
            # pergunta crua isolada não teria como casar com o chunk certo —
            # embedding ortogonal, prova que é a condensada quem é usada
            "Onde fica a matriz da empresa?": [0.0, 1.0],
        }
    )
    chat_completion_provider = SequentialChatCompletionProvider(
        [condensed_question, "A matriz fica em São Paulo, SP."]
    )
    history = [
        service.HistoryTurn(role="user", content="Onde Lucas trabalha?"),
        service.HistoryTurn(
            role="assistant", content="Você trabalha na NA Engineering Brasil."
        ),
    ]

    answer, source = service.answer_question(
        "Onde fica a matriz da empresa?",
        embedding_provider,
        chat_completion_provider,
        FailIfCalledWebSearchProvider(),
        history=history,
    )

    assert answer == "A matriz fica em São Paulo, SP."
    assert source == "resume"
    assert len(chat_completion_provider.calls) == 2


def test_answer_question_includes_history_turns_between_system_and_current_question(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-002/CA-003: histórico entra nas `messages`, pergunta original mantida."""
    chunk = rag.Chunk(id="experience-0", section="experience", text="Contexto.")
    monkeypatch.setattr(
        service, "_index_cache", [rag.EmbeddedChunk(chunk=chunk, embedding=[1.0, 0.0])]
    )
    embedding_provider = FakeEmbeddingProvider(embedding=[1.0, 0.0])
    chat_completion_provider = SequentialChatCompletionProvider(
        ["Onde fica a matriz da NA Engineering Brasil?", "Fica em São Paulo, SP."]
    )
    history = [
        service.HistoryTurn(role="user", content="Onde Lucas trabalha?"),
        service.HistoryTurn(
            role="assistant", content="Você trabalha na NA Engineering Brasil."
        ),
    ]

    service.answer_question(
        "Onde fica a matriz da empresa?",
        embedding_provider,
        chat_completion_provider,
        FailIfCalledWebSearchProvider(),
        history=history,
    )

    final_messages = chat_completion_provider.calls[1]["messages"]
    assert final_messages[0] == {"role": "system", "content": service.SYSTEM_PROMPT}
    assert final_messages[1] == {"role": "user", "content": "Onde Lucas trabalha?"}
    assert final_messages[2] == {
        "role": "assistant",
        "content": "Você trabalha na NA Engineering Brasil.",
    }
    assert final_messages[3]["content"] == service._build_user_prompt(
        "Onde fica a matriz da empresa?", [chunk]
    )


def test_answer_question_without_history_does_not_call_condensation() -> None:
    """CA-004: sem histórico, comportamento idêntico ao pré-US-15-02 (1 chamada só)."""
    embedding_provider = FakeEmbeddingProvider(embedding=[1.0, 0.0])
    chat_completion_provider = FakeChatCompletionProvider(
        answer="Você trabalha na Engineering Brasil."
    )

    answer, source = service.answer_question(
        "Onde você trabalha?",
        embedding_provider,
        chat_completion_provider,
        FailIfCalledWebSearchProvider(),
        history=None,
    )

    assert answer == "Você trabalha na Engineering Brasil."
    assert source == "resume"
    assert chat_completion_provider.call_count == 1


def test_answer_question_falls_back_to_raw_question_when_condensation_fails() -> None:
    """CA-005: falha na condensation cai para a pergunta crua, sem propagar erro."""
    chat_completion_provider = FailFirstThenAnswerChatCompletionProvider(
        OpenAIError("falha simulada de condensation"),
        "Você trabalha na Engineering Brasil.",
    )
    embedding_provider = FakeEmbeddingProvider(embedding=[1.0, 0.0])
    history = [
        service.HistoryTurn(role="user", content="Onde Lucas trabalha?"),
        service.HistoryTurn(role="assistant", content="Na Engineering Brasil."),
    ]

    answer, source = service.answer_question(
        "E o cargo, qual é?",
        embedding_provider,
        chat_completion_provider,
        FailIfCalledWebSearchProvider(),
        history=history,
    )

    assert answer == "Você trabalha na Engineering Brasil."
    assert source == "resume"
    assert embedding_provider.calls == ["E o cargo, qual é?"]
    assert len(chat_completion_provider.calls) == 2


def test_answer_question_truncates_history_to_last_window() -> None:
    """CA-006: histórico maior que `MAX_HISTORY_MESSAGES` é truncado à cauda."""
    chat_completion_provider = SequentialChatCompletionProvider(
        ["pergunta condensada", "resposta final"]
    )
    embedding_provider = FakeEmbeddingProvider(embedding=[1.0, 0.0])
    history = [
        service.HistoryTurn(
            role="user" if i % 2 == 0 else "assistant", content=f"turno {i}"
        )
        for i in range(10)
    ]
    kept = history[-service.MAX_HISTORY_MESSAGES :]
    dropped = history[: -service.MAX_HISTORY_MESSAGES]

    service.answer_question(
        "pergunta atual",
        embedding_provider,
        chat_completion_provider,
        FailIfCalledWebSearchProvider(),
        history=history,
    )

    condensation_prompt = chat_completion_provider.calls[0]["messages"][1]["content"]
    final_contents = [
        message["content"] for message in chat_completion_provider.calls[1]["messages"]
    ]
    for turn in kept:
        assert turn.content in condensation_prompt
        assert turn.content in final_contents
    for turn in dropped:
        assert turn.content not in condensation_prompt
        assert turn.content not in final_contents
