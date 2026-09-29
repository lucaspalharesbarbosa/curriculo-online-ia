"""Builders de `Resume` mínimo para os testes de tools."""

from __future__ import annotations

from app.resume.models import Resume


def make_resume(
    experiences: list[tuple[str, str, str | None, list[str]]],
) -> Resume:
    """`experiences`: (empresa, início, fim|None, tecnologias)."""
    return Resume.model_validate(
        {
            "hero": {
                "name": "Fulano",
                "title": "Dev",
                "location": "BR",
                "summary": "Resumo.",
            },
            "about": "Sobre.",
            "experiences": [
                {
                    "company": company,
                    "role": "Engenheiro",
                    "startDate": start,
                    "endDate": end,
                    "location": "Remoto",
                    "modality": "Remoto",
                    "highlights": ["Fez coisas."],
                    "technologies": technologies,
                }
                for company, start, end, technologies in experiences
            ],
            "education": [],
            "skills": [
                {"category": "Backend", "items": [{"name": "Python", "level": 4}]}
            ],
            "certifications": [],
            "recognitions": [],
            "projects": [],
            "articles": [],
            "contact": {"linkedin": "https://www.linkedin.com/in/fulano"},
        }
    )
