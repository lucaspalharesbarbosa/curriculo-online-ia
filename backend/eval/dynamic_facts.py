"""Fatos esperados dinâmicos dos golden-sets.

Valores que dependem da data (tempo de experiência de um cargo atual) não podem
ser fixos no JSON: envelhecem todo mês e o teste passa a reprovar respostas
corretas (aconteceu com c01 e c02, que foram escritos em setembro e reprovaram em
novembro). Em vez disso, o JSON usa marcadores e este módulo os resolve com o
`resume.json` e a data de hoje, usando o mesmo cálculo das tools do chat.

Marcadores aceitos em `expected_facts`:
    {duration:Python}   "3 anos e 10 meses"
    {months:Python}     "46"
"""

from __future__ import annotations

import re
from datetime import date
from typing import Any

from app.resume.models import Resume
from app.tools.experience import calculate_experience, format_duration

_PLACEHOLDER = re.compile(r"\{(duration|months):([^}]+)\}")


def resolve_fact(fact: str, resume: Resume, today: date | None = None) -> str:
    def _replace(match: re.Match[str]) -> str:
        kind, subject = match.group(1), match.group(2).strip()
        summary = calculate_experience(resume, subject, today=today)
        if not summary.matches:
            raise ValueError(f"marcador sem cargo correspondente: {match.group(0)}")
        if kind == "months":
            return str(summary.total_months)
        return format_duration(summary.total_months)

    return _PLACEHOLDER.sub(_replace, fact)


def resolve_questions(
    questions: list[dict[str, Any]], resume: Resume, today: date | None = None
) -> list[dict[str, Any]]:
    """Cópia das perguntas com os marcadores de `expected_facts` resolvidos."""
    return [
        {
            **question,
            "expected_facts": [
                resolve_fact(fact, resume, today) for fact in question["expected_facts"]
            ],
        }
        for question in questions
    ]
