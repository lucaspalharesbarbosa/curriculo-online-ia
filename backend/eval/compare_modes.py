"""Compara modos do chat nos dois golden-sets (ADR-018).

Rotina manual, sob demanda: bate na API real da OpenAI (embeddings, geração e
LLM-as-judge). NUNCA rodar em pytest/CI.

Modos:
    pipeline      pipeline determinístico atual (com auto-crítica, ADR-016)
    hybrid        pipeline + busca híbrida (bônus léxico, ADR-018)
    tools         tool calling, recuperar primeiro (ADR-017/ADR-018)
    tools-hybrid  tool calling + busca híbrida

Conjuntos:
    original      as 24 perguntas de golden_set.json (REGRESSÃO: não pode cair)
    capabilities  as perguntas de golden_set_capabilities.json (GANHO)

Uso:
    cd backend
    python -m eval.compare_modes
    python -m eval.compare_modes --modes pipeline,tools-hybrid --sets original
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.chat import rag, service  # noqa: E402
from app.chat.adapters.openai_adapter import (  # noqa: E402
    OpenAIChatCompletionProvider,
    OpenAIEmbeddingProvider,
    OpenAIToolCallingProvider,
)
from app.chat.adapters.tavily_adapter import TavilyWebSearchProvider  # noqa: E402
from eval.run_golden_set import RESULTS_DIR, _judge  # noqa: E402

EVAL_DIR = Path(__file__).resolve().parent
SETS = {
    "original": EVAL_DIR / "golden_set.json",
    "capabilities": EVAL_DIR / "golden_set_capabilities.json",
}
MODES = {
    "pipeline": {"tools": False, "hybrid": False},
    "hybrid": {"tools": False, "hybrid": True},
    "tools": {"tools": True, "hybrid": False},
    "tools-hybrid": {"tools": True, "hybrid": True},
}


class CountingChat(OpenAIChatCompletionProvider):
    calls = 0

    def generate_completion(self, model: str, messages: list[dict[str, str]]) -> str:
        CountingChat.calls += 1
        return super().generate_completion(model, messages)


class CountingTools(OpenAIToolCallingProvider):
    calls = 0

    def generate_with_tools(self, *args: Any, **kwargs: Any):
        CountingTools.calls += 1
        return super().generate_with_tools(*args, **kwargs)


@dataclass
class Case:
    id: str
    question: str
    category: str
    answer: str
    source: str
    verdict: str
    judge_reason: str | None
    seconds: float
    llm_calls: int


def _run(mode: str, questions: list[dict], providers: dict[str, Any]) -> list[Case]:
    config = MODES[mode]
    judge_chat = OpenAIChatCompletionProvider()
    cases: list[Case] = []
    for item in questions:
        CountingChat.calls = CountingTools.calls = 0
        started = time.perf_counter()
        answer, source = service.answer_question(
            item["question"],
            providers["embedding"],
            providers["chat"],
            providers["web"],
            enable_self_critique=True,
            tool_calling_provider=providers["tools"] if config["tools"] else None,
            enable_hybrid=config["hybrid"],
        )
        seconds = time.perf_counter() - started
        calls = CountingChat.calls + CountingTools.calls
        verdict, reason = _judge(
            item["question"], item["expected_facts"], answer, judge_chat
        )
        cases.append(
            Case(
                item["id"],
                item["question"],
                item["category"],
                answer,
                source,
                verdict,
                reason,
                round(seconds, 2),
                calls,
            )
        )
        print(f"  {item['id']} {verdict:9s} {seconds:5.1f}s {calls} chamadas")
    return cases


def _summary(cases: list[Case]) -> dict[str, Any]:
    correct = sum(1 for c in cases if c.verdict == "CORRETO")
    return {
        "correct": correct,
        "total": len(cases),
        "accuracy": round(correct / len(cases), 3) if cases else 0.0,
        "avg_seconds": round(sum(c.seconds for c in cases) / len(cases), 2),
        "avg_llm_calls": round(sum(c.llm_calls for c in cases) / len(cases), 2),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--modes", default=",".join(MODES))
    parser.add_argument("--sets", default=",".join(SETS))
    args = parser.parse_args()
    modes = [m.strip() for m in args.modes.split(",") if m.strip()]
    sets = [s.strip() for s in args.sets.split(",") if s.strip()]
    for name, options in (("modo", (modes, MODES)), ("conjunto", (sets, SETS))):
        unknown = [x for x in options[0] if x not in options[1]]
        if unknown:
            raise SystemExit(f"{name} desconhecido: {unknown}")
    if not os.environ.get("LLM_API_KEY"):
        raise SystemExit("LLM_API_KEY ausente (medição sob demanda, nunca em CI).")

    embedding = OpenAIEmbeddingProvider()
    resume = rag.load_resume()
    service._index_cache = rag.load_or_build_index(embedding, resume=resume)
    service._entities_cache = rag.extract_known_entities(resume)
    service._resume_cache = resume
    providers = {
        "embedding": embedding,
        "chat": CountingChat(),
        "web": TavilyWebSearchProvider(),
        "tools": CountingTools(),
    }

    report: dict[str, Any] = {}
    for set_name in sets:
        questions = json.loads(SETS[set_name].read_text(encoding="utf-8"))["questions"]
        report[set_name] = {}
        for mode in modes:
            print(f"\n[{set_name}] modo {mode} ({len(questions)} perguntas)")
            cases = _run(mode, questions, providers)
            report[set_name][mode] = {
                "summary": _summary(cases),
                "cases": [asdict(c) for c in cases],
            }

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    path = RESULTS_DIR / f"compare_modes_{stamp}.json"
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n=== RESUMO ===")
    print(
        f"{'conjunto':14s}{'modo':14s}{'acerto':>10s}{'seg/perg':>10s}{'chamadas':>10s}"
    )
    for set_name, by_mode in report.items():
        for mode, data in by_mode.items():
            s = data["summary"]
            rate = f"{s['correct']}/{s['total']}"
            print(
                f"{set_name:14s}{mode:14s}{rate:>10s}"
                f"{s['avg_seconds']:>10}{s['avg_llm_calls']:>10}"
            )
    print(f"\nRelatório: {path}")


if __name__ == "__main__":
    main()
