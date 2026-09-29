"""Testes do cálculo determinístico de experiência (`ADR-017`)."""

from __future__ import annotations

from datetime import date

import pytest

from app.tools import experience
from app.tools.experience import calculate_experience, format_duration
from tests.tools.helpers import make_resume


def test_soma_periodos_de_uma_tecnologia_em_varios_cargos() -> None:
    """Python em dois cargos separados soma os dois períodos."""
    resume = make_resume(
        [
            ("Alfa", "2022-07", "2025-09", ["Python"]),
            ("Beta", "2026-03", None, ["Python", "React"]),
        ]
    )

    summary = calculate_experience(resume, "python", today=date(2026, 9, 15))

    assert summary.total_months == 38 + 6


def test_cargo_atual_conta_ate_o_mes_de_referencia() -> None:
    """Sem end_date, o período vai até o mês de `today`."""
    resume = make_resume([("Alfa", "2026-03", None, ["Python"])])

    summary = calculate_experience(resume, "Python", today=date(2026, 9, 29))

    assert summary.total_months == 6


def test_periodos_sobrepostos_sao_contados_uma_vez() -> None:
    """Dois cargos simultâneos não dobram os meses em comum."""
    resume = make_resume(
        [
            ("Alfa", "2020-01", "2021-01", ["Java"]),
            ("Beta", "2020-07", "2021-07", ["Java"]),
        ]
    )

    summary = calculate_experience(resume, "Java", today=date(2026, 1, 1))

    assert summary.total_months == 18


def test_periodos_contiguos_somam_sem_buraco() -> None:
    """Cargos em sequência na mesma empresa somam o período completo."""
    resume = make_resume(
        [
            ("Shift", "2020-09", "2021-07", ["Java"]),
            ("Shift", "2021-07", "2022-07", ["Java"]),
        ]
    )

    summary = calculate_experience(resume, "Java", today=date(2026, 1, 1))

    assert summary.total_months == 22


def test_java_nao_casa_com_javascript() -> None:
    """A busca é por token inteiro, não por substring."""
    resume = make_resume([("Alfa", "2020-01", "2021-01", ["JavaScript"])])

    summary = calculate_experience(resume, "Java", today=date(2026, 1, 1))

    assert summary.matches == []
    assert summary.total_months == 0


def test_java_casa_com_java_versionado_e_frameworks() -> None:
    """'Java 11' e 'Java (Spring Boot)' contam como Java."""
    resume = make_resume(
        [
            ("Alfa", "2020-01", "2021-01", ["Java 11"]),
            ("Beta", "2021-01", "2022-01", ["Java (Spring Boot)"]),
        ]
    )

    summary = calculate_experience(resume, "java", today=date(2026, 1, 1))

    assert len(summary.matches) == 2


def test_consulta_por_empresa_casa_sem_acento() -> None:
    """'itau' casa com a empresa 'Itaú Unibanco'."""
    resume = make_resume([("Itaú Unibanco", "2022-07", "2025-09", ["Java"])])

    summary = calculate_experience(resume, "itau", today=date(2026, 1, 1))

    assert summary.total_months == 38


def test_tecnologia_com_simbolo_e_reconhecida() -> None:
    """'C#' não vira 'c' e casa só com C#."""
    resume = make_resume([("Alfa", "2016-11", "2018-05", ["C#"])])

    assert calculate_experience(resume, "C#", today=date(2026, 1, 1)).total_months == 18


def test_consulta_vazia_levanta_erro() -> None:
    """Consulta sem tokens é rejeitada, não devolve o currículo inteiro."""
    resume = make_resume([("Alfa", "2020-01", "2021-01", ["Java"])])

    with pytest.raises(ValueError):
        calculate_experience(resume, "  ")


@pytest.mark.parametrize(
    ("months", "expected"),
    [
        (0, "menos de 1 mês"),
        (1, "1 mês"),
        (12, "1 ano"),
        (25, "2 anos e 1 mês"),
        (44, "3 anos e 8 meses"),
    ],
)
def test_format_duration(months: int, expected: str) -> None:
    """Formata meses em anos e meses no singular/plural corretos."""
    assert format_duration(months) == expected


def test_format_summary_sem_resultado_nao_afirma_desconhecimento() -> None:
    """Sem cargo registrado, o texto orienta a não concluir falta de domínio."""
    resume = make_resume([("Alfa", "2020-01", "2021-01", ["Java"])])
    summary = calculate_experience(resume, "Rust", today=date(2026, 1, 1))

    text = experience.format_summary(summary)

    assert "Nenhuma experiência profissional com 'Rust'" in text
    assert "não conclua" in text


def test_format_summary_com_resultado_traz_total_e_cargos() -> None:
    """O texto traz duração formatada, total em meses e os cargos usados."""
    resume = make_resume([("Alfa", "2024-01", "2025-07", ["Python"])])
    summary = calculate_experience(resume, "Python", today=date(2026, 1, 1))

    text = experience.format_summary(summary)

    assert "1 ano e 6 meses" in text
    assert "18 meses" in text
    assert "Alfa" in text
