"""Registro de tools do assistente: o "núcleo" de `ADR-017` (um núcleo, duas portas).

Uma `Tool` é um nome, uma descrição, um JSON Schema dos argumentos e uma função
Python pura. Este módulo não conhece OpenAI nem MCP: cada protocolo é um
adapter fino que traduz `Tool` para o seu formato (`chat/adapters/openai_adapter.py`
para tool calling, `mcp_server/server.py` para MCP).
"""

from __future__ import annotations

import json
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

TOOL_ERROR_PREFIX = "Erro na ferramenta"


@dataclass(frozen=True)
class Tool:
    name: str
    description: str
    # JSON Schema (`type: object`) dos argumentos, fonte única para os dois
    # adapters. `handler` recebe exatamente essas chaves como kwargs.
    parameters: dict[str, Any]
    handler: Callable[..., str]

    def run(self, arguments: dict[str, Any]) -> str:
        return self.handler(**arguments)


def find_tool(tools: list[Tool], name: str) -> Tool | None:
    return next((tool for tool in tools if tool.name == name), None)


def execute_tool(tools: list[Tool], name: str, raw_arguments: str) -> str:
    """Executa a tool pedida pelo modelo e devolve sempre um texto.

    Nunca propaga exceção: nome desconhecido, JSON inválido ou argumento
    errado viram uma mensagem de erro devolvida ao modelo, que pode se
    corrigir na iteração seguinte ou responder que não conseguiu. A entrada é
    não confiável (vem do LLM), então só argumentos declarados no schema
    passam adiante.
    """
    tool = find_tool(tools, name)
    if tool is None:
        return f"{TOOL_ERROR_PREFIX} '{name}': ferramenta inexistente."
    try:
        arguments = json.loads(raw_arguments) if raw_arguments.strip() else {}
    except json.JSONDecodeError:
        return f"{TOOL_ERROR_PREFIX} '{name}': argumentos não são um JSON válido."
    if not isinstance(arguments, dict):
        return f"{TOOL_ERROR_PREFIX} '{name}': argumentos devem ser um objeto JSON."

    allowed = set(tool.parameters.get("properties", {}))
    unknown = set(arguments) - allowed
    if unknown:
        return (
            f"{TOOL_ERROR_PREFIX} '{name}': argumentos desconhecidos "
            f"{sorted(unknown)}."
        )
    missing = set(tool.parameters.get("required", [])) - set(arguments)
    if missing:
        return f"{TOOL_ERROR_PREFIX} '{name}': faltam argumentos {sorted(missing)}."

    try:
        return tool.run(arguments)
    except (TypeError, ValueError) as exc:
        return f"{TOOL_ERROR_PREFIX} '{name}': {exc}"
