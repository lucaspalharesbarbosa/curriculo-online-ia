"""Testes do caminho de tool calling do `service` (`ADR-017`)."""

from __future__ import annotations

import httpx
import pytest
from openai import APIConnectionError

from app.chat import service
from tests.chat.fakes import (
    FakeChatCompletionProvider,
    FakeEmbeddingProvider,
    FakeWebSearchProvider,
)
from tests.chat.test_service import FIXTURE_INDEX
from tests.chat.tool_fakes import (
    ScriptedToolCallingProvider,
    final_answer,
    tool_request,
)
from tests.tools.helpers import make_resume


@pytest.fixture(autouse=True)
def _fixed_state(monkeypatch: pytest.MonkeyPatch) -> None:
    """Índice e currículo fixos, sem disco nem OpenAI."""
    monkeypatch.setattr(service, "_index_cache", FIXTURE_INDEX)
    monkeypatch.setattr(service, "_entities_cache", ["Alfa"])
    monkeypatch.setattr(
        service,
        "_resume_cache",
        make_resume([("Alfa", "2024-01", "2025-07", ["Python"])]),
    )


def _answer(
    provider: ScriptedToolCallingProvider,
    web_result: str | None = None,
    chat_completion: FakeChatCompletionProvider | None = None,
) -> tuple[str, str]:
    return service.answer_question(
        "quantos anos de Python?",
        FakeEmbeddingProvider([1.0, 0.0]),
        chat_completion or FakeChatCompletionProvider(answer="pipeline"),
        FakeWebSearchProvider(web_result),
        tool_calling_provider=provider,
    )


def test_modelo_chama_calculate_experience_e_responde_com_o_resultado() -> None:
    """Fluxo feliz: pede a tool, recebe o cálculo exato, responde em texto."""
    provider = ScriptedToolCallingProvider(
        [
            tool_request(
                ("c1", "calculate_experience", '{"skill_or_company": "Python"}')
            ),
            final_answer("Cerca de 1 ano e 6 meses com Python."),
        ]
    )

    answer, source = _answer(provider)

    assert answer == "Cerca de 1 ano e 6 meses com Python."
    assert source == "resume"
    tool_message = provider.calls[1]["messages"][-1]
    assert tool_message["role"] == "tool"
    assert tool_message["tool_call_id"] == "c1"
    assert "meses" in tool_message["content"]


def test_sem_contexto_do_retrieval_o_primeiro_turno_exige_tool() -> None:
    """Guard rail: sem contexto confiável, a resposta precisa de uma tool."""
    provider = ScriptedToolCallingProvider(
        [
            tool_request(("c1", "career_timeline", "{}")),
            final_answer("ok"),
        ]
    )

    service.answer_question(
        "onde trabalhou antes?",
        FakeEmbeddingProvider([0.0, 0.0]),
        FakeChatCompletionProvider(),
        FakeWebSearchProvider(),
        tool_calling_provider=provider,
    )

    assert [call["require_tool"] for call in provider.calls] == [True, False]
    assert provider.calls[0]["messages"][-1]["content"] == "onde trabalhou antes?"
    assert provider.calls[0]["tools"] == [
        "search_resume",
        "calculate_experience",
        "find_technology",
        "get_experience",
        "career_timeline",
        "list_adrs",
        "read_adr",
        "search_web",
    ]


def test_com_contexto_do_retrieval_vai_junto_da_pergunta_e_tool_e_opcional() -> None:
    """ADR-018: recuperar primeiro. O contexto entra no prompt e o modelo pode
    responder direto, sem chamar tool."""
    provider = ScriptedToolCallingProvider([final_answer("Engineering Brasil.")])

    answer, source = _answer(provider)

    assert answer == "Engineering Brasil."
    assert source == "resume"
    assert len(provider.calls) == 1
    assert provider.calls[0]["require_tool"] is False
    user_message = provider.calls[0]["messages"][-1]["content"]
    assert "Contexto do currículo" in user_message
    assert "Engineering Brasil" in user_message


def test_search_web_bem_sucedido_marca_source_web() -> None:
    """Resposta que usou a web fica marcada como `web` (contrato do /chat)."""
    provider = ScriptedToolCallingProvider(
        [
            tool_request(("c1", "search_web", '{"query": "o que é a Alfa"}')),
            final_answer("Informação pública: ..."),
        ]
    )

    _, source = _answer(provider, web_result="Alfa é X.")

    assert source == "web"


def test_search_web_bloqueado_nao_marca_source_web() -> None:
    """Consulta sem entidade do currículo é bloqueada e a fonte segue `resume`."""
    provider = ScriptedToolCallingProvider(
        [
            tool_request(("c1", "search_web", '{"query": "bitcoin"}')),
            final_answer("Não encontrei."),
        ]
    )

    _, source = _answer(provider, web_result="qualquer")

    assert source == "resume"


def test_tool_inexistente_devolve_erro_ao_modelo_sem_quebrar() -> None:
    """Tool alucinada pelo modelo vira mensagem de erro, não exceção."""
    provider = ScriptedToolCallingProvider(
        [
            tool_request(("c1", "apagar_tudo", "{}")),
            final_answer("Não consegui."),
        ]
    )

    answer, _ = _answer(provider)

    assert answer == "Não consegui."
    assert "ferramenta inexistente" in provider.calls[1]["messages"][-1]["content"]


def test_limite_de_execucoes_por_pergunta() -> None:
    """No máximo MAX_TOOL_CALLS execuções reais; as demais recebem o aviso."""
    many = tool_request(
        *[(f"c{i}", "search_resume", '{"query": "x"}') for i in range(5)]
    )
    provider = ScriptedToolCallingProvider([many, final_answer("fim")])

    _answer(provider)

    tool_results = [
        m["content"] for m in provider.calls[1]["messages"] if m["role"] == "tool"
    ]
    assert len(tool_results) == 5
    assert service.TOOL_LIMIT_MESSAGE not in tool_results[: service.MAX_TOOL_CALLS]
    assert tool_results[service.MAX_TOOL_CALLS :] == [service.TOOL_LIMIT_MESSAGE] * 2


def test_esgotar_iteracoes_forca_turno_final_sem_tools() -> None:
    """Modelo que nunca para de pedir tool é cortado: turno final sem tools."""
    looping = tool_request(("c", "search_resume", '{"query": "x"}'))
    provider = ScriptedToolCallingProvider(
        [looping] * service.MAX_TOOL_ITERATIONS + [final_answer("resposta forçada")]
    )

    answer, _ = _answer(provider)

    assert answer == "resposta forçada"
    assert len(provider.calls) == service.MAX_TOOL_ITERATIONS + 1
    assert provider.calls[-1]["tools"] == []


def test_resposta_vazia_do_modelo_vira_fallback() -> None:
    """Sem texto, devolve o fallback padrão, nunca string vazia."""
    provider = ScriptedToolCallingProvider([final_answer("   ")])

    answer, _ = _answer(provider)

    assert answer == service.FALLBACK_ANSWER


def test_falha_do_provider_cai_para_o_pipeline_deterministico() -> None:
    """Plano B: erro no tool calling não derruba o chat, roda o RAG clássico."""
    request = httpx.Request("POST", "https://api.openai.com/v1/chat/completions")
    provider = ScriptedToolCallingProvider([APIConnectionError(request=request)])
    chat_completion = FakeChatCompletionProvider(answer="resposta do pipeline")

    answer, _ = _answer(provider, chat_completion=chat_completion)

    assert answer == "resposta do pipeline"
    assert chat_completion.call_count >= 1


def test_historico_entra_entre_o_system_prompt_e_a_pergunta() -> None:
    """O histórico truncado acompanha a conversa no caminho com tools."""
    provider = ScriptedToolCallingProvider([final_answer("ok")])

    service.answer_question(
        "e em Java?",
        FakeEmbeddingProvider(),
        FakeChatCompletionProvider(),
        FakeWebSearchProvider(),
        history=[
            service.HistoryTurn(role="user", content="quantos anos de Python?"),
            service.HistoryTurn(role="assistant", content="1 ano e 6 meses."),
        ],
        tool_calling_provider=provider,
    )

    roles = [m["role"] for m in provider.calls[0]["messages"]]
    assert roles == ["system", "user", "assistant", "user"]
