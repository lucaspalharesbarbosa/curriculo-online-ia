"""Testes do `OpenAIToolCallingProvider` (`ADR-017`), com client OpenAI falso."""

from __future__ import annotations

from types import SimpleNamespace
from typing import Any

import pytest

from app.chat.adapters import openai_adapter
from app.chat.adapters.openai_adapter import OpenAIToolCallingProvider
from app.tools.registry import Tool

TOOL = Tool(
    name="calculate_experience",
    description="Calcula experiência.",
    parameters={
        "type": "object",
        "properties": {"skill_or_company": {"type": "string"}},
        "required": ["skill_or_company"],
    },
    handler=lambda skill_or_company: skill_or_company,
)


class _FakeCompletions:
    def __init__(self, message: SimpleNamespace) -> None:
        self._message = message
        self.last_kwargs: dict[str, Any] = {}

    def create(self, **kwargs: Any) -> SimpleNamespace:
        self.last_kwargs = kwargs
        return SimpleNamespace(choices=[SimpleNamespace(message=self._message)])


def _client(message: SimpleNamespace) -> SimpleNamespace:
    return SimpleNamespace(chat=SimpleNamespace(completions=_FakeCompletions(message)))


def _install(monkeypatch: pytest.MonkeyPatch, message: SimpleNamespace):
    client = _client(message)
    monkeypatch.setattr(openai_adapter, "get_client", lambda: client)
    return client.chat.completions


def _call(id_: str, name: str, arguments: str) -> SimpleNamespace:
    return SimpleNamespace(
        id=id_, function=SimpleNamespace(name=name, arguments=arguments)
    )


def test_traduz_tool_para_o_formato_de_function_calling(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Cada `Tool` vira uma `function` com o mesmo JSON Schema."""
    completions = _install(monkeypatch, SimpleNamespace(content="oi", tool_calls=None))

    OpenAIToolCallingProvider().generate_with_tools(
        "gpt-4o-mini", [{"role": "user", "content": "x"}], [TOOL]
    )

    sent = completions.last_kwargs["tools"]
    assert sent == [
        {
            "type": "function",
            "function": {
                "name": "calculate_experience",
                "description": "Calcula experiência.",
                "parameters": TOOL.parameters,
            },
        }
    ]
    assert completions.last_kwargs["tool_choice"] == "auto"


def test_require_tool_usa_tool_choice_required(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """`require_tool=True` obriga o modelo a pedir uma tool."""
    completions = _install(monkeypatch, SimpleNamespace(content="oi", tool_calls=None))

    OpenAIToolCallingProvider().generate_with_tools(
        "gpt-4o-mini", [], [TOOL], require_tool=True
    )

    assert completions.last_kwargs["tool_choice"] == "required"


def test_sem_tools_nao_envia_parametros_de_function_calling(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """`tools=[]` desliga o function calling (turno final forçado)."""
    completions = _install(monkeypatch, SimpleNamespace(content="fim", tool_calls=None))

    OpenAIToolCallingProvider().generate_with_tools("gpt-4o-mini", [], [])

    assert "tools" not in completions.last_kwargs
    assert "tool_choice" not in completions.last_kwargs


def test_resposta_com_tool_calls_vira_toolcompletion(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Pedidos de tool voltam tipados, com a mensagem do assistente reenviável."""
    message = SimpleNamespace(
        content=None,
        tool_calls=[_call("c1", "calculate_experience", '{"skill_or_company":"Java"}')],
    )
    _install(monkeypatch, message)

    completion = OpenAIToolCallingProvider().generate_with_tools(
        "gpt-4o-mini", [], [TOOL]
    )

    assert completion.content == ""
    assert [(c.id, c.name, c.arguments) for c in completion.tool_calls] == [
        ("c1", "calculate_experience", '{"skill_or_company":"Java"}')
    ]
    assert completion.message["role"] == "assistant"
    assert completion.message["tool_calls"][0]["function"]["name"] == (
        "calculate_experience"
    )


def test_resposta_em_texto_nao_traz_tool_calls(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Turno final: texto e nenhuma tool_call na mensagem do assistente."""
    _install(monkeypatch, SimpleNamespace(content="Resposta.", tool_calls=None))

    completion = OpenAIToolCallingProvider().generate_with_tools(
        "gpt-4o-mini", [], [TOOL]
    )

    assert completion.content == "Resposta."
    assert completion.tool_calls == []
    assert "tool_calls" not in completion.message
