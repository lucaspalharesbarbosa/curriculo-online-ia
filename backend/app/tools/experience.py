"""Cálculo determinístico de tempo de experiência a partir do `resume.json`.

Existe porque LLM erra aritmética de datas: o RAG devolve o trecho certo e o
modelo "chuta" a conta. Aqui a conta é código (`ADR-017`).
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from datetime import date

from app.resume.models import Experience, Resume

_TOKEN_PATTERN = re.compile(r"[\w#+]+")


@dataclass(frozen=True)
class ExperienceMatch:
    company: str
    role: str
    start: str
    end: str | None


@dataclass(frozen=True)
class ExperienceSummary:
    query: str
    matches: list[ExperienceMatch]
    total_months: int


def _tokens(text: str) -> set[str]:
    decomposed = unicodedata.normalize("NFKD", text.lower())
    plain = "".join(char for char in decomposed if not unicodedata.combining(char))
    return set(_TOKEN_PATTERN.findall(plain))


def _month_index(year_month: str) -> int:
    year, month = year_month.split("-")
    return int(year) * 12 + int(month) - 1


def _matches_query(experience: Experience, query_tokens: set[str]) -> bool:
    """Casa por conjunto de tokens, não por substring: "java" casa "Java 11" mas
    não "JavaScript"; "spring boot" casa "Java (Spring Boot)"."""
    if query_tokens <= _tokens(experience.company):
        return True
    return any(query_tokens <= _tokens(tech) for tech in experience.technologies)


def _merge_intervals(intervals: list[tuple[int, int]]) -> list[tuple[int, int]]:
    """Une períodos sobrepostos ou contíguos, para não contar o mesmo mês duas vezes."""
    merged: list[tuple[int, int]] = []
    for start, end in sorted(intervals):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def calculate_experience(
    resume: Resume, query: str, today: date | None = None
) -> ExperienceSummary:
    """Meses de experiência profissional com `query` (tecnologia ou empresa).

    Cargo sem `end_date` conta até `today` (mês corrente). Períodos
    sobrepostos ou contíguos entre cargos são unidos antes da soma.
    """
    reference = today or date.today()
    current_month = reference.year * 12 + reference.month - 1
    query_tokens = _tokens(query)
    if not query_tokens:
        raise ValueError("informe uma tecnologia ou empresa.")

    matches = [
        experience
        for experience in resume.experiences
        if _matches_query(experience, query_tokens)
    ]
    intervals = [
        (
            _month_index(experience.start_date),
            _month_index(experience.end_date) if experience.end_date else current_month,
        )
        for experience in matches
    ]
    total_months = sum(end - start for start, end in _merge_intervals(intervals))
    return ExperienceSummary(
        query=query.strip(),
        matches=[
            ExperienceMatch(
                company=experience.company,
                role=experience.role,
                start=experience.start_date,
                end=experience.end_date,
            )
            for experience in matches
        ],
        total_months=total_months,
    )


def format_duration(total_months: int) -> str:
    years, months = divmod(total_months, 12)
    parts = []
    if years:
        parts.append(f"{years} {'ano' if years == 1 else 'anos'}")
    if months:
        parts.append(f"{months} {'mês' if months == 1 else 'meses'}")
    return " e ".join(parts) if parts else "menos de 1 mês"


def format_summary(summary: ExperienceSummary) -> str:
    if not summary.matches:
        return (
            f"Nenhuma experiência profissional com '{summary.query}' aparece no "
            "currículo (não conclua que o Lucas não conhece o assunto, só que "
            "não há cargo registrado com ele)."
        )
    periods = "; ".join(
        f"{match.role} na {match.company} ({match.start} a {match.end or 'o momento'})"
        for match in summary.matches
    )
    return (
        f"Experiência profissional com '{summary.query}': "
        f"{format_duration(summary.total_months)} "
        f"(total de {summary.total_months} meses, períodos sobrepostos contados "
        f"uma vez). Cargos considerados: {periods}."
    )
