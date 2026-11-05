"""Fatos esperados dinâmicos dos golden-sets (`eval/dynamic_facts.py`)."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import pytest

from app.chat import rag
from eval.dynamic_facts import resolve_fact, resolve_questions
from tests.tools.helpers import make_resume

EVAL_DIR = Path(__file__).resolve().parents[2] / "eval"


def _resume():
    return make_resume([("Alfa", "2024-01", None, ["Python"])])


def test_duracao_e_meses_acompanham_a_data_de_hoje() -> None:
    """O mesmo cargo atual rende valores diferentes em datas diferentes."""
    fact = "{duration:Python} ({months:Python} meses)"

    assert resolve_fact(fact, _resume(), date(2026, 1, 15)) == "2 anos (24 meses)"
    assert (
        resolve_fact(fact, _resume(), date(2026, 3, 15))
        == "2 anos e 2 meses (26 meses)"
    )


def test_fato_sem_marcador_passa_intacto() -> None:
    """Fatos comuns não são alterados."""
    assert resolve_fact("Engineering Brasil", _resume()) == "Engineering Brasil"


def test_marcador_sem_cargo_correspondente_falha_alto() -> None:
    """Um marcador que não casa com nenhum cargo é erro do teste, não valor vazio."""
    with pytest.raises(ValueError):
        resolve_fact("{duration:Rust}", _resume())


def test_resolve_questions_nao_muta_o_original() -> None:
    """A resolução devolve cópias."""
    original = [{"id": "x", "expected_facts": ["{months:Python}"]}]

    resolved = resolve_questions(original, _resume(), date(2026, 1, 15))

    assert resolved[0]["expected_facts"] == ["24"]
    assert original[0]["expected_facts"] == ["{months:Python}"]


@pytest.mark.parametrize(
    "filename", ["golden_set.json", "golden_set_capabilities.json"]
)
def test_todos_os_marcadores_dos_golden_sets_sao_resolvidos(filename: str) -> None:
    """Contra o currículo real, nenhum marcador sobra sem resolver."""
    data = json.loads((EVAL_DIR / filename).read_text(encoding="utf-8"))

    resolved = resolve_questions(data["questions"], rag.load_resume())

    for question in resolved:
        for fact in question["expected_facts"]:
            assert "{" not in fact and "}" not in fact, (question["id"], fact)
