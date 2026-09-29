"""Avaliação golden-set: taxa de acerto antes/depois da auto-crítica (ADR-016).

Rotina manual, sob demanda — bate na API real da OpenAI (embeddings, geração e
LLM-as-judge) de propósito, para medir qualidade real do RAG. NUNCA rodar em
pytest/CI (por isso vive fora de `app/` e de `tests/`).

Uso:
    cd backend
    python -m eval.run_golden_set          # antes/depois da auto-crítica (ADR-016)
    python -m eval.run_golden_set --tools  # pipeline atual vs tool calling (ADR-017)

Requer `LLM_API_KEY` no ambiente (mesma variável usada pelo `/chat`, ver
`.env.example`). `WEB_SEARCH_API_KEY` é opcional — sem ela, o fallback de busca
web (`ADR-010`) simplesmente não encontra contexto extra, mesmo comportamento
de fallback gracioso já existente.
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path

# Permite `python -m eval.run_golden_set` a partir de `backend/` sem instalar
# o pacote — insere `backend/` no path para resolver `from app.chat import ...`.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.chat import rag, service  # noqa: E402
from app.chat.adapters.openai_adapter import (  # noqa: E402
    OpenAIChatCompletionProvider,
    OpenAIEmbeddingProvider,
    OpenAIToolCallingProvider,
)
from app.chat.adapters.tavily_adapter import TavilyWebSearchProvider  # noqa: E402
from app.chat.ports import (  # noqa: E402
    ChatCompletionProvider,
    EmbeddingProvider,
    ToolCallingProvider,
    WebSearchProvider,
)

GOLDEN_SET_PATH = Path(__file__).resolve().parent / "golden_set.json"
RESULTS_DIR = Path(__file__).resolve().parent / "results"

JUDGE_MODEL = "gpt-4o-mini"
JUDGE_SYSTEM_PROMPT = (
    "Você é um avaliador (LLM-as-judge) que decide se a resposta de um "
    "assistente de currículo está correta, comparando-a com os fatos "
    'esperados de uma pergunta. Responda exatamente no formato "CORRETO" '
    'ou "INCORRETO: <motivo em uma frase>". Considere CORRETO se a resposta '
    "cobre a essência dos fatos esperados, mesmo com palavras diferentes; "
    "considere INCORRETO se a resposta está errada, incompleta a ponto de "
    'não responder à pergunta, ou é a mensagem de "não encontrei essa '
    'informação" quando os fatos esperados existem no currículo.'
)


@dataclass
class CaseResult:
    id: str
    question: str
    category: str
    expected_facts: list[str]
    answer: str
    source: str
    verdict: str  # "CORRETO" | "INCORRETO"
    judge_reason: str | None


def _load_golden_set() -> list[dict]:
    payload = json.loads(GOLDEN_SET_PATH.read_text(encoding="utf-8"))
    return payload["questions"]


def _judge(
    question: str,
    expected_facts: list[str],
    answer: str,
    chat_completion_provider: ChatCompletionProvider,
) -> tuple[str, str | None]:
    facts_text = "; ".join(expected_facts)
    prompt = (
        f"Pergunta: {question}\n"
        f"Fatos esperados na resposta correta: {facts_text}\n"
        f"Resposta do assistente: {answer}"
    )
    raw = chat_completion_provider.generate_completion(
        model=JUDGE_MODEL,
        messages=[
            {"role": "system", "content": JUDGE_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
    )
    normalized = raw.strip()
    if normalized.upper().startswith("CORRETO"):
        return "CORRETO", None
    _, _, reason = normalized.partition(":")
    return "INCORRETO", reason.strip() or normalized


def _run_mode(
    questions: list[dict],
    enable_self_critique: bool,
    embedding_provider: EmbeddingProvider,
    chat_completion_provider: ChatCompletionProvider,
    web_search_provider: WebSearchProvider,
    tool_calling_provider: ToolCallingProvider | None = None,
) -> list[CaseResult]:
    results: list[CaseResult] = []
    for item in questions:
        answer, source = service.answer_question(
            item["question"],
            embedding_provider,
            chat_completion_provider,
            web_search_provider,
            enable_self_critique=enable_self_critique,
            tool_calling_provider=tool_calling_provider,
        )
        verdict, reason = _judge(
            item["question"],
            item["expected_facts"],
            answer,
            chat_completion_provider,
        )
        results.append(
            CaseResult(
                id=item["id"],
                question=item["question"],
                category=item["category"],
                expected_facts=item["expected_facts"],
                answer=answer,
                source=source,
                verdict=verdict,
                judge_reason=reason,
            )
        )
    return results


def _write_report(before: list[CaseResult], after: list[CaseResult]) -> Path:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    path = RESULTS_DIR / f"golden_set_result_{timestamp}.json"

    before_correct = sum(1 for r in before if r.verdict == "CORRETO")
    after_correct = sum(1 for r in after if r.verdict == "CORRETO")
    changed_verdicts = [
        {
            "id": b.id,
            "question": b.question,
            "before_verdict": b.verdict,
            "after_verdict": a.verdict,
            "before_answer": b.answer,
            "after_answer": a.answer,
        }
        for b, a in zip(before, after, strict=True)
        if b.verdict != a.verdict
    ]

    payload = {
        "generated_at": timestamp,
        "total_questions": len(before),
        "before": {
            "correct": before_correct,
            "accuracy": before_correct / len(before) if before else 0.0,
        },
        "after": {
            "correct": after_correct,
            "accuracy": after_correct / len(after) if after else 0.0,
        },
        "changed_verdicts": changed_verdicts,
        "cases_before": [asdict(r) for r in before],
        "cases_after": [asdict(r) for r in after],
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def main() -> None:
    if not os.environ.get("LLM_API_KEY"):
        raise SystemExit(
            "LLM_API_KEY ausente — configure antes de rodar a avaliação real "
            "(nunca rode este script em CI/pytest, é medição sob demanda)."
        )

    compare_tools = "--tools" in sys.argv[1:]
    questions = _load_golden_set()
    embedding_provider = OpenAIEmbeddingProvider()
    chat_completion_provider = OpenAIChatCompletionProvider()
    web_search_provider = TavilyWebSearchProvider()

    # Índice + entidades reais, cacheados em memória (mesma estratégia do /chat).
    resume = rag.load_resume()
    index = rag.load_or_build_index(embedding_provider, resume=resume)
    service._index_cache = index
    service._entities_cache = rag.extract_known_entities(resume)
    service._resume_cache = resume

    if compare_tools:
        # ADR-017: ANTES = pipeline determinístico atual (com auto-crítica);
        # DEPOIS = o modelo decide as fontes por tool calling.
        print(f"Golden-set: {len(questions)} perguntas, ANTES (pipeline atual)...")
        before = _run_mode(
            questions,
            True,
            embedding_provider,
            chat_completion_provider,
            web_search_provider,
        )
        print("Golden-set: DEPOIS (tool calling, ADR-017)...")
        after = _run_mode(
            questions,
            True,
            embedding_provider,
            chat_completion_provider,
            web_search_provider,
            tool_calling_provider=OpenAIToolCallingProvider(),
        )
    else:
        print(
            f"Golden-set: {len(questions)} perguntas — modo ANTES (sem auto-crítica)..."
        )
        before = _run_mode(
            questions,
            False,
            embedding_provider,
            chat_completion_provider,
            web_search_provider,
        )
        print("Golden-set — modo DEPOIS (com auto-crítica, ADR-016)...")
        after = _run_mode(
            questions,
            True,
            embedding_provider,
            chat_completion_provider,
            web_search_provider,
        )

    report_path = _write_report(before, after)
    before_correct = sum(1 for r in before if r.verdict == "CORRETO")
    after_correct = sum(1 for r in after if r.verdict == "CORRETO")
    before_rate = before_correct / len(before)
    after_rate = after_correct / len(after)
    print(f"\nAntes:  {before_correct}/{len(before)} ({before_rate:.0%})")
    print(f"Depois: {after_correct}/{len(after)} ({after_rate:.0%})")
    print(f"Relatório salvo em {report_path}")


if __name__ == "__main__":
    main()
