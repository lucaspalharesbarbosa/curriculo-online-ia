"""Endpoint /chat: orquestra busca por similaridade (rag.py) e geração de resposta."""

from __future__ import annotations

import logging
import os
import time
from collections import defaultdict
from typing import Literal

from fastapi import APIRouter, HTTPException, Request
from openai import AuthenticationError, OpenAIError, RateLimitError
from pydantic import BaseModel, Field

from app.chat import rag, web_search

router = APIRouter()
logger = logging.getLogger(__name__)

GENERATION_MODEL = "gpt-4o-mini"
SIMILARITY_THRESHOLD = 0.2
TOP_K = 3
# Mensagens públicas: genéricas, sem revelar stack, provider ou variáveis internas.
GENERIC_ERROR_MESSAGE = "Erro ao gerar resposta. Tente novamente mais tarde."
RATE_LIMIT_MESSAGE = "Muitas requisições. Tente novamente em instantes."

# Rate limit básico por IP em memória — sem lib externa, proporcional ao volume
# do projeto (visitantes ocasionais de portfólio, não tráfego de produto).
RATE_LIMIT_MAX_REQUESTS = 10
RATE_LIMIT_WINDOW_SECONDS = 60.0

_request_log: dict[str, list[float]] = defaultdict(list)
FALLBACK_ANSWER = (
    "Não encontrei essa informação no currículo. Pergunte sobre experiências, "
    "skills, projetos ou formação profissional."
)
SYSTEM_PROMPT = (
    "Você é o assistente do currículo online de Lucas Palhares Barbosa. "
    "Responda em português, de forma direta, usando só as informações do "
    "contexto abaixo. Nunca invente informação que não esteja no contexto."
)
# ADR-010 seção 2 (T03): prompt usado quando a resposta vem da busca web, não
# do currículo — instrui o modelo a deixar a fonte explícita na resposta.
WEB_SYSTEM_PROMPT = (
    "Você é o assistente do currículo online de Lucas Palhares Barbosa. "
    "A pergunta é sobre uma entidade citada no currículo (empresa, "
    "instituição, curso, certificação ou habilidade), mas o currículo "
    "sozinho não tem esse detalhe. Responda em português, de forma direta, "
    "usando só o contexto de busca pública abaixo. Deixe claro que essa "
    "informação é pública, encontrada na web, e não faz parte do currículo. "
    "Nunca invente informação que não esteja no contexto."
)

_index_cache: list[rag.EmbeddedChunk] | None = None
_entities_cache: list[str] | None = None


def get_index() -> list[rag.EmbeddedChunk]:
    """Índice de embeddings cacheado em memória — carregado uma vez, não por request."""
    global _index_cache
    if _index_cache is None:
        _index_cache = rag.load_or_build_index()
    return _index_cache


def get_known_entities() -> list[str]:
    """Entidades do currículo cacheadas em memória (US-11-07) — carregado 1x."""
    global _entities_cache
    if _entities_cache is None:
        _entities_cache = rag.extract_known_entities(rag.load_resume())
    return _entities_cache


def _mentions_known_entity(question: str, entities: list[str]) -> bool:
    """Substring case-insensitive — gatilho objetivo de busca web (ADR-010)."""
    normalized_question = question.lower()
    return any(entity.lower() in normalized_question for entity in entities if entity)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)


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


def _build_user_prompt(question: str, chunks: list[rag.Chunk]) -> str:
    context = "\n".join(f"- {chunk.text}" for chunk in chunks)
    return f"Contexto do currículo:\n{context}\n\nPergunta: {question}"


def _generate_answer(question: str, chunks: list[rag.Chunk]) -> str:
    response = rag.get_client().chat.completions.create(
        model=GENERATION_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(question, chunks)},
        ],
    )
    return response.choices[0].message.content or FALLBACK_ANSWER


def _generate_web_answer(question: str, web_context: str) -> str:
    user_prompt = (
        f"Informação pública encontrada na web:\n{web_context}\n\n"
        f"Pergunta: {question}"
    )
    response = rag.get_client().chat.completions.create(
        model=GENERATION_MODEL,
        messages=[
            {"role": "system", "content": WEB_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content or FALLBACK_ANSWER


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
def chat(request: ChatRequest, http_request: Request) -> ChatResponse:
    client_id = http_request.client.host if http_request.client else "unknown"
    if _is_rate_limited(client_id):
        raise HTTPException(status_code=429, detail=RATE_LIMIT_MESSAGE)

    if not os.environ.get("LLM_API_KEY"):
        logger.error("LLM_API_KEY ausente — /chat indisponível.")
        raise HTTPException(status_code=500, detail=GENERIC_ERROR_MESSAGE)

    try:
        results = rag.search_with_routing(request.question, get_index(), top_k=TOP_K)
    except OpenAIError as exc:
        raise _http_error_from_openai(exc) from exc

    if not results or results[0][1] < SIMILARITY_THRESHOLD:
        # ADR-010 seção 2: RAG local insuficiente — tenta busca web só se a
        # pergunta citar uma entidade que já existe no currículo.
        web_context = None
        if _mentions_known_entity(request.question, get_known_entities()):
            web_context = web_search.search_web(request.question)

        if web_context:
            try:
                answer = _generate_web_answer(request.question, web_context)
            except OpenAIError as exc:
                raise _http_error_from_openai(exc) from exc
            return ChatResponse(answer=answer, source="web")

        return ChatResponse(answer=FALLBACK_ANSWER, source="resume")

    relevant_chunks = [chunk for chunk, _score in results]

    try:
        answer = _generate_answer(request.question, relevant_chunks)
    except OpenAIError as exc:
        raise _http_error_from_openai(exc) from exc

    return ChatResponse(answer=answer, source="resume")


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
