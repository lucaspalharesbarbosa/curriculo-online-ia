"""Testes das tools de leitura dos ADRs (`ADR-018`)."""

from __future__ import annotations

from pathlib import Path

import pytest

from app.tools import docs_tools


@pytest.fixture
def adr_dir(tmp_path: Path) -> Path:
    (tmp_path / "ADR-001-primeiro.md").write_text(
        "# ADR-001: Stack inicial\n\n## Status\nAceita\n\n## Contexto\nTexto.\n",
        encoding="utf-8",
    )
    (tmp_path / "ADR-003-fluxo-rag.md").write_text(
        "# ADR-003 \u2014 Fluxo de RAG\n\n## Status\n\nAceita\n\nCorpo do RAG.\n",
        encoding="utf-8",
    )
    (tmp_path / "README.md").write_text("# Índice\n", encoding="utf-8")
    (tmp_path / "C4-001-contexto.md").write_text("# C4\n", encoding="utf-8")
    return tmp_path


def test_list_adrs_traz_numero_titulo_e_status(adr_dir: Path) -> None:
    """A listagem ignora arquivos que não são ADR."""
    text = docs_tools.list_adrs(adr_dir)

    assert "- ADR-001: Stack inicial (Aceita)" in text
    assert "- ADR-003: Fluxo de RAG (Aceita)" in text
    assert "README" not in text
    assert "C4" not in text


def test_read_adr_devolve_o_conteudo(adr_dir: Path) -> None:
    """Lê o ADR pelo número."""
    assert "Corpo do RAG." in docs_tools.read_adr(3, adr_dir)


def test_read_adr_inexistente_lista_os_disponiveis(adr_dir: Path) -> None:
    """Número sem arquivo informa os ADRs que existem."""
    text = docs_tools.read_adr(99, adr_dir)

    assert "ADR-099 não existe" in text
    assert "ADR-001, ADR-003" in text


def test_read_adr_trunca_conteudo_grande(adr_dir: Path) -> None:
    """ADR enorme é cortado para não estourar o contexto do modelo."""
    (adr_dir / "ADR-010-grande.md").write_text("x" * 20000, encoding="utf-8")

    text = docs_tools.read_adr(10, adr_dir)

    assert len(text) < docs_tools.MAX_ADR_CHARS + 50
    assert text.endswith("[...conteúdo truncado]")


@pytest.mark.parametrize("bad", ["../../etc/passwd", "3", 3.5, True, None])
def test_read_adr_so_aceita_inteiro(adr_dir: Path, bad: object) -> None:
    """O número não vira caminho: qualquer coisa que não seja int é rejeitada."""
    with pytest.raises(ValueError):
        docs_tools.read_adr(bad, adr_dir)  # type: ignore[arg-type]


def test_pasta_ausente_devolve_mensagem_em_vez_de_erro(tmp_path: Path) -> None:
    """Ambiente sem os docs (ex.: deploy só do backend) degrada com elegância."""
    missing = tmp_path / "nao-existe"

    assert "não estão disponíveis" in docs_tools.list_adrs(missing)
    assert "não estão disponíveis" in docs_tools.read_adr(1, missing)


def test_adrs_reais_do_repositorio_estao_acessiveis() -> None:
    """Os ADRs versionados no repositório são encontrados pelo caminho padrão."""
    text = docs_tools.list_adrs()

    assert "ADR-003" in text
    assert "ADR-017" in text
