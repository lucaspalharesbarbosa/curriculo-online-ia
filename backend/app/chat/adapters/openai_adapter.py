"""Adapter OpenAI: implementa `EmbeddingProvider`, `ChatCompletionProvider` e
`ToolCallingProvider` (ADR-012, ADR-017).

Único ponto do domínio `chat` que instancia `openai.OpenAI` — `rag.py` e
`service.py` dependem só dos ports (`ports.py`), nunca deste módulo direto.
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Any

from openai import OpenAI

from app.chat.ports import ToolCall, ToolCompletion
from app.tools.registry import Tool

EMBEDDING_MODEL = "text-embedding-3-small"
# ADR-004 / US-08-02: timeout curto (faixa 15–30s) + no máximo 1 retry (SDK só
# reenvia em erros transitórios tipicamente 429/5xx). Evita o default de minutos
# do SDK, que trava o único worker do Render free tier.
OPENAI_TIMEOUT_SECONDS = 20.0
OPENAI_MAX_RETRIES = 1


@lru_cache(maxsize=1)
def get_client() -> OpenAI:
    return OpenAI(
        api_key=os.environ.get("LLM_API_KEY"),
        timeout=OPENAI_TIMEOUT_SECONDS,
        max_retries=OPENAI_MAX_RETRIES,
    )


class OpenAIEmbeddingProvider:
    """Implementa `EmbeddingProvider` (`ports.py`) com o SDK da OpenAI."""

    def embed_text(self, text: str) -> list[float]:
        response = get_client().embeddings.create(model=EMBEDDING_MODEL, input=text)
        return list(response.data[0].embedding)


class OpenAIChatCompletionProvider:
    """Implementa `ChatCompletionProvider` (`ports.py`) com o SDK da OpenAI."""

    def generate_completion(self, model: str, messages: list[dict[str, str]]) -> str:
        response = get_client().chat.completions.create(model=model, messages=messages)
        return response.choices[0].message.content or ""


class OpenAIToolCallingProvider:
    """Implementa `ToolCallingProvider` (`ports.py`): traduz `Tool` para o
    formato de function calling da OpenAI (`ADR-017`)."""

    def generate_with_tools(
        self,
        model: str,
        messages: list[dict[str, Any]],
        tools: list[Tool],
        require_tool: bool = False,
    ) -> ToolCompletion:
        options: dict[str, Any] = {}
        if tools:
            options["tools"] = [
                {
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": tool.parameters,
                    },
                }
                for tool in tools
            ]
            options["tool_choice"] = "required" if require_tool else "auto"
        response = get_client().chat.completions.create(
            model=model, messages=messages, **options
        )
        message = response.choices[0].message
        tool_calls = [
            ToolCall(
                id=call.id,
                name=call.function.name,
                arguments=call.function.arguments,
            )
            for call in message.tool_calls or []
            if getattr(call, "function", None) is not None
        ]
        assistant_message: dict[str, Any] = {
            "role": "assistant",
            "content": message.content,
        }
        if tool_calls:
            assistant_message["tool_calls"] = [
                {
                    "id": call.id,
                    "type": "function",
                    "function": {"name": call.name, "arguments": call.arguments},
                }
                for call in tool_calls
            ]
        return ToolCompletion(
            content=message.content or "",
            tool_calls=tool_calls,
            message=assistant_message,
        )
