"""Use case do chat: orquestra pergunta → resposta (ADR-010, ADR-012).

Extraído de `router.py` (que fica só com a camada HTTP: rate limit e
mapeamento de exceção→`HTTPException`, `US-14-03`). Depende só dos ports
(`ports.py`) — nunca de `openai`/`httpx` direto.
"""

from __future__ import annotations

from typing import Literal

from app.chat import rag
from app.chat.ports import ChatCompletionProvider, EmbeddingProvider, WebSearchProvider

GENERATION_MODEL = "gpt-4o-mini"
SIMILARITY_THRESHOLD = 0.2
TOP_K = 3

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


def get_index(embedding_provider: EmbeddingProvider) -> list[rag.EmbeddedChunk]:
    """Índice de embeddings cacheado em memória — carregado uma vez, não por request."""
    global _index_cache
    if _index_cache is None:
        _index_cache = rag.load_or_build_index(embedding_provider)
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


def _build_user_prompt(question: str, chunks: list[rag.Chunk]) -> str:
    context = "\n".join(f"- {chunk.text}" for chunk in chunks)
    return f"Contexto do currículo:\n{context}\n\nPergunta: {question}"


def _generate_answer(
    question: str,
    chunks: list[rag.Chunk],
    chat_completion_provider: ChatCompletionProvider,
) -> str:
    answer = chat_completion_provider.generate_completion(
        model=GENERATION_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(question, chunks)},
        ],
    )
    return answer or FALLBACK_ANSWER


def _generate_web_answer(
    question: str,
    web_context: str,
    chat_completion_provider: ChatCompletionProvider,
) -> str:
    user_prompt = (
        f"Informação pública encontrada na web:\n{web_context}\n\n"
        f"Pergunta: {question}"
    )
    answer = chat_completion_provider.generate_completion(
        model=GENERATION_MODEL,
        messages=[
            {"role": "system", "content": WEB_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    return answer or FALLBACK_ANSWER


def answer_question(
    question: str,
    embedding_provider: EmbeddingProvider,
    chat_completion_provider: ChatCompletionProvider,
    web_search_provider: WebSearchProvider,
) -> tuple[str, Literal["resume", "web"]]:
    """Orquestra busca local → fallback web → geração de resposta (ADR-010).

    Levanta `openai.OpenAIError` (ou subclasses) se a busca local ou a
    geração falharem — o mapeamento para `HTTPException` fica em `router.py`.
    """
    index = get_index(embedding_provider)
    results = rag.search_with_routing(question, index, embedding_provider, top_k=TOP_K)

    if not results or results[0][1] < SIMILARITY_THRESHOLD:
        # ADR-010 seção 2: RAG local insuficiente — tenta busca web só se a
        # pergunta citar uma entidade que já existe no currículo.
        web_context = None
        if _mentions_known_entity(question, get_known_entities()):
            web_context = web_search_provider.search_web(question)

        if web_context:
            answer = _generate_web_answer(
                question, web_context, chat_completion_provider
            )
            return answer, "web"

        return FALLBACK_ANSWER, "resume"

    relevant_chunks = [chunk for chunk, _score in results]
    answer = _generate_answer(question, relevant_chunks, chat_completion_provider)
    return answer, "resume"
