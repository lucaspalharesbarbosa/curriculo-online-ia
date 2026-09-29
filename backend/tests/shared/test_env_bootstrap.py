"""Testes do bootstrap de `.env` local."""

from __future__ import annotations

from pathlib import Path

import pytest

from app.shared import env_bootstrap


def test_env_local_fica_em_backend_e_nao_em_backend_app() -> None:
    """O `.env` documentado no README é `backend/.env`, ao lado de `.env.example`."""
    backend_dir = Path(__file__).resolve().parents[2]

    assert env_bootstrap._ENV_PATH == backend_dir / ".env"
    assert env_bootstrap._EXAMPLE_PATH == backend_dir / ".env.example"
    assert env_bootstrap._EXAMPLE_PATH.exists()


def test_carrega_variaveis_do_env_existente(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Um `.env` existente é carregado no processo sem sobrescrever o ambiente."""
    env_file = tmp_path / ".env"
    env_file.write_text("BOOTSTRAP_TESTE=do-arquivo\nJA_DEFINIDA=do-arquivo\n")
    monkeypatch.setattr(env_bootstrap, "_ENV_PATH", env_file)
    monkeypatch.setattr(env_bootstrap, "_EXAMPLE_PATH", tmp_path / ".env.example")
    monkeypatch.delenv("BOOTSTRAP_TESTE", raising=False)
    monkeypatch.setenv("JA_DEFINIDA", "do-ambiente")

    env_bootstrap.ensure_local_env()

    import os

    assert os.environ["BOOTSTRAP_TESTE"] == "do-arquivo"
    assert os.environ["JA_DEFINIDA"] == "do-ambiente"
    monkeypatch.delenv("BOOTSTRAP_TESTE", raising=False)


def test_cria_env_a_partir_do_example_quando_ausente(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Sem `.env`, cria a partir do `.env.example` (primeira subida local)."""
    example = tmp_path / ".env.example"
    example.write_text("LLM_API_KEY=sk-proj-xxxxxxxx\n")
    env_file = tmp_path / ".env"
    monkeypatch.setattr(env_bootstrap, "_ENV_PATH", env_file)
    monkeypatch.setattr(env_bootstrap, "_EXAMPLE_PATH", example)
    monkeypatch.delenv("LLM_API_KEY", raising=False)

    env_bootstrap.ensure_local_env()

    assert env_file.read_text() == "LLM_API_KEY=sk-proj-xxxxxxxx\n"
    monkeypatch.delenv("LLM_API_KEY", raising=False)
