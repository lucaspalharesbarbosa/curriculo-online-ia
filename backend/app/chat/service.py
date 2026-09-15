"""Use case do chat: orquestra pergunta → resposta (ADR-010, ADR-012).

Extraído de `router.py` (que fica só com a camada HTTP: rate limit e
mapeamento de exceção→`HTTPException`, `US-14-03`). Depende só dos ports
(`ports.py`) — nunca de `openai`/`httpx` direto.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from openai import OpenAIError

from app.chat import rag
from app.chat.ports import ChatCompletionProvider, EmbeddingProvider, WebSearchProvider

GENERATION_MODEL = "gpt-4o-mini"
SIMILARITY_THRESHOLD = 0.2
TOP_K = 3
# ADR-014: janela funcional de histórico (3 pares) — o request pode trazer até
# 20 mensagens (router.py), mas só as últimas MAX_HISTORY_MESSAGES entram no
# retrieval/prompt.
MAX_HISTORY_MESSAGES = 6
# ADR-016: patamares de confiança do top-k que decidem se a auto-crítica roda.
# Score >= HIGH_CONFIDENCE é confiável por si só, com ou sem seção roteada.
# Com seção roteada por keyword (ADR-010), o corte cai para SECTION_CONFIDENCE
# — o próprio roteamento já é um sinal de confiança adicional.
SELF_CRITIQUE_HIGH_CONFIDENCE_THRESHOLD = 0.5
SELF_CRITIQUE_SECTION_CONFIDENCE_THRESHOLD = 0.35
MAX_SELF_CRITIQUE_ITERATIONS = 2


@dataclass(frozen=True)
class HistoryTurn:
    """Troca de conversa anterior (ADR-014) — tipo do domínio, sem depender do
    `BaseModel` de `router.py` (Ports & Adapters, `ADR-012`)."""

    role: Literal["user", "assistant"]
    content: str


# ADR-014: prompt de query condensation — reescreve a pergunta atual como
# standalone question, incorporando o contexto do histórico, para o retrieval
# encontrar o chunk certo mesmo com referência anafórica ("a empresa" etc.).
CONDENSE_SYSTEM_PROMPT = (
    "Reescreva a pergunta do usuário como uma pergunta autônoma (standalone), "
    "incorporando o contexto necessário do histórico da conversa para que faça "
    "sentido sozinha, sem depender dos turnos anteriores. Se a pergunta já for "
    "autônoma, repita-a sem alteração. Responda só com a pergunta reescrita, em "
    "português, sem aspas, sem explicações e sem respondê-la."
)

# ADR-016: crítico + reformulador numa única chamada — o modelo julga se o
# contexto responde à pergunta e, se não, já propõe a reformulação, em vez de
# duas chamadas separadas (custo dobrado sem ganho real).
SELF_CRITIQUE_SYSTEM_PROMPT = (
    "Você avalia se o contexto recuperado do currículo é suficiente para "
    "responder à pergunta do usuário. Responda só com a palavra SUFICIENTE se "
    "o contexto já permite responder. Caso contrário, responda exatamente no "
    'formato "INSUFICIENTE: <pergunta reformulada>", propondo uma '
    "reformulação que ajude a encontrar o que falta (sinônimos, termos mais "
    "específicos, ou isolando a parte de uma pergunta composta que ainda não "
    "foi respondida). Nunca responda à pergunta em si, nem escreva nada fora "
    "desses dois formatos."
)

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


def _history_messages(history: list[HistoryTurn]) -> list[dict[str, str]]:
    return [{"role": turn.role, "content": turn.content} for turn in history]


def _condense_question(
    question: str,
    history: list[HistoryTurn],
    chat_completion_provider: ChatCompletionProvider,
) -> str:
    """Reformula `question` como standalone question a partir do `history` (ADR-014).

    Usada só para o retrieval (`rag.search_with_routing`) — a `question`
    original segue para exibição/log e para o prompt final. Sem histórico,
    devolve a pergunta crua sem chamar o provider. Qualquer falha do provider
    (ou resposta vazia) cai de volta para a pergunta crua, sem propagar erro —
    mesmo padrão de resiliência de `ADR-004`.
    """
    if not history:
        return question

    history_text = "\n".join(f"{turn.role}: {turn.content}" for turn in history)
    prompt = f"Histórico da conversa:\n{history_text}\n\nPergunta atual: {question}"
    try:
        condensed = chat_completion_provider.generate_completion(
            model=GENERATION_MODEL,
            messages=[
                {"role": "system", "content": CONDENSE_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
    except OpenAIError:
        return question
    return condensed.strip() or question


def _should_run_self_critique(top_score: float, section_routed: bool) -> bool:
    """Critério seletivo do ADR-016 — só a faixa ambígua entre "sem contexto útil"
    (`SIMILARITY_THRESHOLD`) e "confiança alta" gasta a chamada extra."""
    if top_score < SIMILARITY_THRESHOLD:
        return False
    if top_score >= SELF_CRITIQUE_HIGH_CONFIDENCE_THRESHOLD:
        return False
    if section_routed and top_score >= SELF_CRITIQUE_SECTION_CONFIDENCE_THRESHOLD:
        return False
    return True


def _parse_self_critique_response(response: str) -> tuple[bool, str | None]:
    """`(is_sufficient, reformulated_query)`. Resposta fora do formato esperado
    (ou sem query após "INSUFICIENTE:") é tratada como suficiente — mesma
    postura de resiliência de `_condense_question` (ADR-004/ADR-014)."""
    normalized = response.strip()
    if normalized.upper().startswith("INSUFICIENTE"):
        _, _, remainder = normalized.partition(":")
        reformulated = remainder.strip()
        if reformulated:
            return False, reformulated
    return True, None


def _critique_context(
    question: str,
    chunks: list[rag.Chunk],
    chat_completion_provider: ChatCompletionProvider,
) -> tuple[bool, str | None]:
    """Uma chamada ao provider julga E reformula (ADR-016). Falha do provider
    nunca propaga — cai para "suficiente", aceitando o contexto já obtido."""
    context = "\n".join(f"- {chunk.text}" for chunk in chunks)
    prompt = f"Contexto recuperado:\n{context}\n\nPergunta: {question}"
    try:
        response = chat_completion_provider.generate_completion(
            model=GENERATION_MODEL,
            messages=[
                {"role": "system", "content": SELF_CRITIQUE_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
    except OpenAIError:
        return True, None
    return _parse_self_critique_response(response)


def _search_with_self_critique(
    search_question: str,
    index: list[rag.EmbeddedChunk],
    embedding_provider: EmbeddingProvider,
    chat_completion_provider: ChatCompletionProvider,
    enable_self_critique: bool,
) -> tuple[list[tuple[rag.Chunk, float]], bool]:
    """Retrieval + auto-crítica seletiva (ADR-016).

    Devolve os resultados finais do retrieval e `forced_insufficient`: `True`
    só quando a auto-crítica rodou, esgotou `MAX_SELF_CRITIQUE_ITERATIONS`
    tentativas e ainda assim julgou o contexto insuficiente — sinal explícito
    para o chamador forçar o fallback web independentemente do score bruto do
    top-k. `enable_self_critique=False` reproduz o comportamento anterior a
    este ADR (usado por `US-16-03` para comparar antes/depois).
    """
    results = rag.search_with_routing(
        search_question, index, embedding_provider, top_k=TOP_K
    )
    if not enable_self_critique or not results:
        return results, False

    section_routed = rag.detect_section_intent(search_question) is not None
    if not _should_run_self_critique(results[0][1], section_routed):
        return results, False

    current_question = search_question
    for iteration in range(MAX_SELF_CRITIQUE_ITERATIONS):
        chunks = [chunk for chunk, _score in results]
        is_sufficient, reformulated = _critique_context(
            current_question, chunks, chat_completion_provider
        )
        if is_sufficient or not reformulated:
            return results, False

        current_question = reformulated
        if iteration == 0:
            # Iteração 1: reescreve a query, mantém o roteamento por seção — a
            # reformulação pode, ela mesma, acertar uma keyword do dicionário.
            results = rag.search_with_routing(
                current_question, index, embedding_provider, top_k=TOP_K
            )
        else:
            # Iteração 2: relaxa a restrição de seção — cobre pergunta composta
            # entre seções, onde restringir a seção exclui o chunk certo.
            results = rag.search(
                current_question,
                index,
                embedding_provider,
                top_k=TOP_K,
                section=None,
            )

    # Esgotou MAX_SELF_CRITIQUE_ITERATIONS ainda insuficiente → força fallback.
    return results, True


def _generate_answer(
    question: str,
    chunks: list[rag.Chunk],
    chat_completion_provider: ChatCompletionProvider,
    history: list[HistoryTurn],
) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *_history_messages(history),
        {"role": "user", "content": _build_user_prompt(question, chunks)},
    ]
    answer = chat_completion_provider.generate_completion(
        model=GENERATION_MODEL, messages=messages
    )
    return answer or FALLBACK_ANSWER


def _generate_web_answer(
    question: str,
    web_context: str,
    chat_completion_provider: ChatCompletionProvider,
    history: list[HistoryTurn],
) -> str:
    user_prompt = (
        f"Informação pública encontrada na web:\n{web_context}\n\n"
        f"Pergunta: {question}"
    )
    messages = [
        {"role": "system", "content": WEB_SYSTEM_PROMPT},
        *_history_messages(history),
        {"role": "user", "content": user_prompt},
    ]
    answer = chat_completion_provider.generate_completion(
        model=GENERATION_MODEL, messages=messages
    )
    return answer or FALLBACK_ANSWER


def answer_question(
    question: str,
    embedding_provider: EmbeddingProvider,
    chat_completion_provider: ChatCompletionProvider,
    web_search_provider: WebSearchProvider,
    history: list[HistoryTurn] | None = None,
    enable_self_critique: bool = True,
) -> tuple[str, Literal["resume", "web"]]:
    """Orquestra busca local → auto-crítica → fallback web → geração (ADR-010,
    ADR-014, ADR-016).

    Levanta `openai.OpenAIError` (ou subclasses) se a busca local ou a
    geração falharem — o mapeamento para `HTTPException` fica em `router.py`.
    Falha na reformulação da pergunta (query condensation) ou na auto-crítica
    nunca propaga — cai para a pergunta crua / contexto já obtido.
    `enable_self_critique=False` reproduz o comportamento anterior ao
    `ADR-016`, byte a byte (usado por `US-16-03` para comparar antes/depois).
    """
    truncated_history = (history or [])[-MAX_HISTORY_MESSAGES:]
    search_question = _condense_question(
        question, truncated_history, chat_completion_provider
    )

    index = get_index(embedding_provider)
    results, forced_insufficient = _search_with_self_critique(
        search_question,
        index,
        embedding_provider,
        chat_completion_provider,
        enable_self_critique,
    )

    if forced_insufficient or not results or results[0][1] < SIMILARITY_THRESHOLD:
        # ADR-010 seção 2: RAG local insuficiente — tenta busca web só se a
        # pergunta citar uma entidade que já existe no currículo.
        web_context = None
        if _mentions_known_entity(question, get_known_entities()):
            web_context = web_search_provider.search_web(question)

        if web_context:
            answer = _generate_web_answer(
                question, web_context, chat_completion_provider, truncated_history
            )
            return answer, "web"

        return FALLBACK_ANSWER, "resume"

    relevant_chunks = [chunk for chunk, _score in results]
    answer = _generate_answer(
        question, relevant_chunks, chat_completion_provider, truncated_history
    )
    return answer, "resume"
