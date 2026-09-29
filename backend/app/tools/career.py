"""Consultas estruturadas e exatas sobre a carreira (`ADR-018`).

Código puro sobre o `Resume`, sem LLM e sem similaridade: cada função devolve
um texto factual em campos separados (cargo, período, local, tecnologias,
conquistas). Existe porque busca semântica trata o currículo como texto
corrido: acha mal um termo exato ("Kubernetes"), mistura tecnologias com
detalhes de conquistas ("Java 21") e não sabe ordenar cargos ("antes do Itaú").
"""

from __future__ import annotations

from datetime import date

from app.chat.rag import SKILL_LEVEL_LABELS
from app.resume.models import Experience, Resume
from app.tools.experience import (
    format_duration,
    merge_intervals,
    month_index,
    text_tokens,
)


def _period(experience: Experience) -> str:
    return f"{experience.start_date} a {experience.end_date or 'o momento'}"


def _place(experience: Experience) -> str:
    return f"{experience.location} ({experience.modality})"


def _company_matches(experience: Experience, query_tokens: set[str]) -> bool:
    return query_tokens <= text_tokens(experience.company)


def _company_names(resume: Resume) -> list[str]:
    names: list[str] = []
    for experience in resume.experiences:
        if experience.company not in names:
            names.append(experience.company)
    return names


def _chronological(resume: Resume) -> list[Experience]:
    return sorted(resume.experiences, key=lambda e: month_index(e.start_date))


def find_technology(resume: Resume, name: str, today: date | None = None) -> str:
    """Onde e por quanto tempo uma tecnologia aparece: cargos, skills e projetos.

    Casa por token inteiro na lista de tecnologias (não no texto das conquistas).
    """
    query_tokens = text_tokens(name)
    if not query_tokens:
        raise ValueError("informe o nome de uma tecnologia.")
    reference = today or date.today()
    current_month = reference.year * 12 + reference.month - 1

    jobs = [
        experience
        for experience in _chronological(resume)
        if any(query_tokens <= text_tokens(tech) for tech in experience.technologies)
    ]
    skills = [
        f"{group.category}: {item.name} "
        f"({SKILL_LEVEL_LABELS.get(item.level, 'intermediário')})"
        for group in resume.skills
        for item in group.items
        if query_tokens <= text_tokens(item.name)
    ]
    projects = [
        project.title
        for project in resume.projects
        if any(query_tokens <= text_tokens(tech) for tech in project.technologies)
    ]
    label = name.strip()
    if not (jobs or skills or projects):
        return (
            f"Nenhum registro de '{label}' no currículo, nem em cargos, nem em "
            "skills, nem em projetos (não conclua que o Lucas não conhece o "
            "assunto, só que não consta)."
        )

    lines = [f"Tecnologia '{label}':"]
    if jobs:
        intervals = [
            (
                month_index(job.start_date),
                month_index(job.end_date) if job.end_date else current_month,
            )
            for job in jobs
        ]
        total = sum(end - start for start, end in merge_intervals(intervals))
        lines.append(
            f"- Uso profissional: {len(jobs)} cargo(s), {format_duration(total)} "
            f"no total ({total} meses, períodos sobrepostos contados uma vez)."
        )
        lines += [f"  - {job.role} na {job.company} ({_period(job)})" for job in jobs]
    else:
        lines.append("- Uso profissional: nenhum cargo lista essa tecnologia.")
    if skills:
        lines.append("- Skills declaradas: " + "; ".join(skills) + ".")
    if projects:
        lines.append("- Projetos: " + ", ".join(projects) + ".")
    return "\n".join(lines)


def get_experience(resume: Resume, company: str) -> str:
    """Registro estruturado dos cargos numa empresa, com campos separados."""
    query_tokens = text_tokens(company)
    if not query_tokens:
        raise ValueError("informe o nome de uma empresa.")
    matches = [
        experience
        for experience in reversed(_chronological(resume))
        if _company_matches(experience, query_tokens)
    ]
    if not matches:
        return (
            f"Empresa '{company.strip()}' não consta no currículo. Empresas "
            "registradas: " + ", ".join(_company_names(resume)) + "."
        )
    blocks = []
    for experience in matches:
        highlights = "\n".join(f"    - {text}" for text in experience.highlights)
        blocks.append(
            f"Empresa: {experience.company}\n"
            f"  Cargo: {experience.role}\n"
            f"  Período: {_period(experience)}\n"
            f"  Local: {_place(experience)}\n"
            f"  Tecnologias usadas: {', '.join(experience.technologies)}\n"
            f"  Conquistas (texto livre, não é lista de tecnologias):\n{highlights}"
        )
    return "\n\n".join(blocks)


def career_timeline(resume: Resume, around: str | None = None) -> str:
    """Carreira em ordem cronológica. Com `around`, diz quem veio antes e depois."""
    ordered = _chronological(resume)
    lines = [
        f"{i}. {e.company}: {e.role} ({_period(e)}), {_place(e)}"
        for i, e in enumerate(ordered, start=1)
    ]
    companies = _company_names(resume)
    summary = (
        f"Linha do tempo (da mais antiga para a mais recente), "
        f"{len(companies)} empresas distintas:\n" + "\n".join(lines)
    )
    summary += (
        f"\nPrimeira empresa: {ordered[0].company}. "
        f"Mais recente: {ordered[-1].company}."
    )
    if not around:
        return summary

    query_tokens = text_tokens(around)
    indexes = [i for i, e in enumerate(ordered) if _company_matches(e, query_tokens)]
    if not indexes:
        return f"Empresa '{around.strip()}' não consta no currículo.\n{summary}"
    first, last = min(indexes), max(indexes)
    company = ordered[first].company
    before = ordered[first - 1] if first > 0 else None
    after = ordered[last + 1] if last + 1 < len(ordered) else None
    summary += f"\nSobre {company}:"
    summary += (
        f"\n- Imediatamente antes: {before.company} ({before.role}, "
        f"{_period(before)})"
        if before
        else "\n- Imediatamente antes: nenhuma (foi a primeira empresa)."
    )
    summary += (
        f"\n- Imediatamente depois: {after.company} ({after.role}, "
        f"{_period(after)})"
        if after
        else "\n- Imediatamente depois: nenhuma (é a mais recente)."
    )
    return summary
