"""Fakes de `ToolCallingProvider` (`app.chat.ports`) para os testes de `ADR-017`."""

from __future__ import annotations

from typing import Any

from app.chat.ports import ToolCall, ToolCompletion
from app.tools.registry import Tool


class ScriptedToolCallingProvider:
    """Devolve uma `ToolCompletion` por chamada, em sequência (o último passo se
    repete), e registra o que recebeu. Um passo que seja `Exception` é levantado."""

    def __init__(self, script: list[ToolCompletion | Exception]) -> None:
        self._script = list(script)
        self.calls: list[dict[str, Any]] = []

    def generate_with_tools(
        self,
        model: str,
        messages: list[dict[str, Any]],
        tools: list[Tool],
        require_tool: bool = False,
    ) -> ToolCompletion:
        self.calls.append(
            {
                "model": model,
                "messages": [dict(message) for message in messages],
                "tools": [tool.name for tool in tools],
                "require_tool": require_tool,
            }
        )
        step = self._script[min(len(self.calls) - 1, len(self._script) - 1)]
        if isinstance(step, Exception):
            raise step
        return step


def tool_request(*calls: tuple[str, str, str]) -> ToolCompletion:
    """Turno em que o modelo pede tools: `(id, nome, argumentos_json)`."""
    tool_calls = [
        ToolCall(id=call_id, name=name, arguments=arguments)
        for call_id, name, arguments in calls
    ]
    return ToolCompletion(
        content="",
        tool_calls=tool_calls,
        message={"role": "assistant", "content": None},
    )


def final_answer(text: str) -> ToolCompletion:
    """Turno em que o modelo responde em texto, sem pedir tools."""
    return ToolCompletion(
        content=text,
        tool_calls=[],
        message={"role": "assistant", "content": text},
    )
