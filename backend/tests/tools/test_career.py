"""Testes das consultas estruturadas da carreira (`ADR-018`)."""

from __future__ import annotations

from datetime import date

import pytest

from app.chat import rag
from app.resume.models import Resume
from app.tools import career

TODAY = date(2026, 9, 15)


def _resume() -> Resume:
    def job(company, role, start, end, techs, city="Rio Preto", mode="Presencial"):
        return {
            "company": company,
            "role": role,
            "startDate": start,
            "endDate": end,
            "location": city,
            "modality": mode,
            "highlights": [f"Conquista em {company} com Java 21 e pipelines."],
            "technologies": techs,
        }

    return Resume.model_validate(
        {
            "hero": {"name": "F", "title": "Dev", "location": "BR", "summary": "S."},
            "about": "Sobre.",
            "experiences": [
                job(
                    "Beta",
                    "Engenheiro",
                    "2026-03",
                    None,
                    ["Python", "Kubernetes"],
                    "São Paulo, SP",
                    "Remoto",
                ),
                job(
                    "Alfa",
                    "Sênior",
                    "2022-07",
                    "2025-09",
                    ["Java 11", "Kubernetes"],
                    "São Paulo, SP",
                    "Remoto",
                ),
                job("Gama", "Pleno", "2021-07", "2022-07", ["JavaScript"]),
                job("Gama", "Júnior", "2020-09", "2021-07", ["Java"]),
                job("Delta", "Júnior", "2015-11", "2016-08", ["C#"]),
            ],
            "education": [],
            "skills": [
                {
                    "category": "Cloud",
                    "items": [
                        {"name": "Kubernetes", "level": 4},
                        {"name": "AWS", "level": 3},
                    ],
                }
            ],
            "certifications": [],
            "recognitions": [],
            "projects": [
                {
                    "title": "Projeto X",
                    "description": "Desc.",
                    "technologies": ["Python", "Kubernetes"],
                    "repositoryUrl": "https://github.com/x/y",
                }
            ],
            "articles": [],
            "contact": {"linkedin": "https://www.linkedin.com/in/f"},
        }
    )


def test_find_technology_reune_cargos_skills_e_projetos() -> None:
    """'Já usou Kubernetes?' responde com evidência de três fontes."""
    text = career.find_technology(_resume(), "kubernetes", today=TODAY)

    assert "2 cargo(s)" in text
    assert "na Alfa (2022-07 a 2025-09)" in text
    assert "na Beta (2026-03 a o momento)" in text
    assert "Cloud: Kubernetes (avançado)" in text
    assert "Projetos: Projeto X" in text
    # 38 meses na Alfa + 6 na Beta
    assert "3 anos e 8 meses" in text


def test_find_technology_ignora_o_texto_das_conquistas() -> None:
    """'Java 21' só aparece numa conquista, não na lista de tecnologias."""
    text = career.find_technology(_resume(), "Java 21", today=TODAY)

    assert text.startswith("Nenhum registro de 'Java 21'")


def test_find_technology_java_nao_casa_javascript() -> None:
    """Token inteiro: Java conta Alfa e Gama Júnior, não o cargo com JavaScript."""
    text = career.find_technology(_resume(), "Java", today=TODAY)

    assert "2 cargo(s)" in text
    assert "Pleno" not in text


def test_find_technology_sem_uso_profissional_mas_com_skill() -> None:
    """AWS só consta em skills: informa isso sem inventar cargo."""
    text = career.find_technology(_resume(), "AWS", today=TODAY)

    assert "nenhum cargo lista essa tecnologia" in text
    assert "Cloud: AWS (intermediário)" in text


def test_find_technology_vazio_levanta_erro() -> None:
    """Consulta sem tokens é rejeitada."""
    with pytest.raises(ValueError):
        career.find_technology(_resume(), "  ")


def test_get_experience_devolve_campos_separados() -> None:
    """Cidade, modalidade e tecnologias vêm em campos, separados das conquistas."""
    text = career.get_experience(_resume(), "alfa")

    assert "Local: São Paulo, SP (Remoto)" in text
    assert "Tecnologias usadas: Java 11, Kubernetes" in text
    assert "Conquistas (texto livre, não é lista de tecnologias)" in text


def test_get_experience_empresa_com_dois_cargos_lista_os_dois_recente_primeiro() -> (
    None
):
    """Gama teve dois cargos: o mais recente aparece antes."""
    text = career.get_experience(_resume(), "Gama")

    assert text.index("Pleno") < text.index("Júnior")


def test_get_experience_empresa_inexistente_lista_as_existentes() -> None:
    """Empresa desconhecida informa as registradas, sem chutar."""
    text = career.get_experience(_resume(), "Inexistente")

    assert "não consta no currículo" in text
    assert "Beta, Alfa, Gama, Delta" in text


def test_career_timeline_em_ordem_e_com_contagem() -> None:
    """Ordem cronológica, empresas distintas, primeira e mais recente."""
    text = career.career_timeline(_resume())

    assert "4 empresas distintas" in text
    assert "Empresas (4):" in text
    assert text.index("Delta") < text.index("Gama") < text.index("Alfa")
    assert "Primeira empresa: Delta. Mais recente: Beta." in text


def test_career_timeline_nao_confunde_cargos_com_empresas() -> None:
    """Regressão: o modelo respondia '8 empresas' contando as linhas (cargos),
    quando eram 6 empresas com 2 delas em dois cargos."""
    resume = rag.load_resume()

    text = career.career_timeline(resume)

    assert "6 empresas distintas e 8 cargos" in text
    assert "cada linha abaixo é um cargo" in text
    assert "Empresas (6): Grupo WDG, WebPic, Shift," in text


def test_career_timeline_around_informa_antes_e_depois() -> None:
    """'Antes da Alfa' é a Gama (cargo mais novo dela), depois é a Beta."""
    text = career.career_timeline(_resume(), around="Alfa")

    assert "Imediatamente antes: Gama (Pleno" in text
    assert "Imediatamente depois: Beta" in text


def test_career_timeline_around_da_empresa_com_dois_cargos() -> None:
    """Para empresa com dois cargos, 'antes' vem do primeiro e 'depois' do último."""
    text = career.career_timeline(_resume(), around="Gama")

    assert "Imediatamente antes: Delta" in text
    assert "Imediatamente depois: Alfa" in text


def test_career_timeline_extremos() -> None:
    """A primeira não tem 'antes' e a mais recente não tem 'depois'."""
    resume = _resume()

    assert "nenhuma (foi a primeira empresa)" in career.career_timeline(resume, "Delta")
    assert "nenhuma (é a mais recente)" in career.career_timeline(resume, "Beta")


def test_career_timeline_around_desconhecida() -> None:
    """Empresa desconhecida avisa e ainda devolve a linha do tempo."""
    text = career.career_timeline(_resume(), around="Nada")

    assert "não consta no currículo" in text
    assert "Linha do tempo" in text
