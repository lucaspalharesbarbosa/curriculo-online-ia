"""Endpoint /chat: camada HTTP — rate limit, injeção de dependências, mapeamento
de exceção→`HTTPException`. Orquestração da resposta fica em `service.py`
(ADR-012, US-14-03)."""

from __future__ import annotations

import logging
import os
import time
from collections import defaultdict
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from openai import AuthenticationError, OpenAIError, RateLimitError
from pydantic import BaseModel, Field

from app.chat import service
from app.chat.adapters.openai_adapter import (
    OpenAIChatCompletionProvider,
    OpenAIEmbeddingProvider,
)
from app.chat.adapters.tavily_adapter import TavilyWebSearchProvider
from app.chat.ports import ChatCompletionProvider, EmbeddingProvider, WebSearchProvider

router = APIRouter()
logger = logging.getLogger(__name__)

# Mensagens públicas: genéricas, sem revelar stack, provider ou variáveis internas.
GENERIC_ERROR_MESSAGE = "Erro ao gerar resposta. Tente novamente mais tarde."
RATE_LIMIT_MESSAGE = "Muitas requisições. Tente novamente em instantes."

# Rate limit básico por IP em memória — sem lib externa, proporcional ao volume
# do projeto (visitantes ocasionais de portfólio, não tráfego de produto).
RATE_LIMIT_MAX_REQUESTS = 10
RATE_LIMIT_WINDOW_SECONDS = 60.0

_request_log: dict[str, list[float]] = defaultdict(list)


# --- Injeção de dependências (Depends()) — wiring dos adapters aos ports -----------


def get_embedding_provider() -> EmbeddingProvider:
    return OpenAIEmbeddingProvider()


def get_chat_completion_provider() -> ChatCompletionProvider:
    return OpenAIChatCompletionProvider()


def get_web_search_provider() -> WebSearchProvider:
    return TavilyWebSearchProvider()


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)
    # ADR-014: teto de validação (20 mensagens) — a janela funcional usada pelo
    # service é menor (MAX_HISTORY_MESSAGES, service.py); histórico entre os
    # dois é truncado à cauda, não rejeitado.
    history: list[HistoryMessage] | None = Field(default=None, max_length=20)


class ChatResponse(BaseModel):
    answer: str
    # ADR-010 seção 2: campo aditivo — "web" só quando a resposta usa
    # contexto da busca externa; "resume" em todos os outros casos (default),
    # preservando compatibilidade com clientes que ignoram o campo.
    source: Literal["resume", "web"] = "resume"


class ChatFeedbackRequest(BaseModel):
    question: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    rating: Literal["up", "down"]


class ChatFeedbackResponse(BaseModel):
    ok: bool = True


def _is_rate_limited(client_id: str) -> bool:
    now = time.monotonic()
    window_start = now - RATE_LIMIT_WINDOW_SECONDS
    recent_requests = [t for t in _request_log[client_id] if t > window_start]
    recent_requests.append(now)
    _request_log[client_id] = recent_requests
    return len(recent_requests) > RATE_LIMIT_MAX_REQUESTS


def _http_error_from_openai(exc: OpenAIError) -> HTTPException:
    """Falha do provider → resposta genérica ao client; detalhe só no log.

    Auth/quota (falha nossa: chave inválida ou cota) mantém 500. Qualquer
    outra falha do provider (indisponibilidade, erro de conexão) vira 503 —
    reflete que a causa é dependência externa fora do ar, não bug interno.
    """
    if isinstance(exc, AuthenticationError):
        logger.error("Falha de autenticação no provider de LLM.")
        return HTTPException(status_code=500, detail=GENERIC_ERROR_MESSAGE)
    if isinstance(exc, RateLimitError):
        logger.error("Rate limit / quota do provider de LLM.")
        return HTTPException(status_code=500, detail=GENERIC_ERROR_MESSAGE)
    logger.error("Falha no provider de LLM: %s", type(exc).__name__)
    return HTTPException(status_code=503, detail=GENERIC_ERROR_MESSAGE)


@router.post(
    "/chat",
    responses={
        429: {"description": RATE_LIMIT_MESSAGE},
        500: {"description": GENERIC_ERROR_MESSAGE},
        503: {"description": GENERIC_ERROR_MESSAGE},
    },
)
def chat(
    request: ChatRequest,
    http_request: Request,
    embedding_provider: EmbeddingProvider = Depends(get_embedding_provider),
    chat_completion_provider: ChatCompletionProvider = Depends(
        get_chat_completion_provider
    ),
    web_search_provider: WebSearchProvider = Depends(get_web_search_provider),
) -> ChatResponse:
    client_id = http_request.client.host if http_request.client else "unknown"
    if _is_rate_limited(client_id):
        raise HTTPException(status_code=429, detail=RATE_LIMIT_MESSAGE)

    if not os.environ.get("LLM_API_KEY"):
        logger.error("LLM_API_KEY ausente — /chat indisponível.")
        raise HTTPException(status_code=500, detail=GENERIC_ERROR_MESSAGE)

    history = (
        [
            service.HistoryTurn(role=message.role, content=message.content)
            for message in request.history
        ]
        if request.history
        else None
    )

    try:
        answer, source = service.answer_question(
            request.question,
            embedding_provider,
            chat_completion_provider,
            web_search_provider,
            history=history,
        )
    except OpenAIError as exc:
        raise _http_error_from_openai(exc) from exc

    return ChatResponse(answer=answer, source=source)


@router.post("/chat/feedback")
def chat_feedback(request: ChatFeedbackRequest) -> ChatFeedbackResponse:
    """Log estruturado do feedback (US-11-04) — sem persistência em banco/arquivo.

    Sempre 200 para request válido (contrato fire-and-forget): falha ao
    registrar o log nunca deve quebrar a UX do chat, só fica no log do
    servidor.
    """
    try:
        logger.info(
            "chat_feedback rating=%s question_length=%d answer_length=%d",
            request.rating,
            len(request.question),
            len(request.answer),
        )
    except Exception:  # noqa: BLE001 — logging nunca pode derrubar o request
        logger.error("Falha ao registrar log de feedback do chat.")
    return ChatFeedbackResponse(ok=True)
