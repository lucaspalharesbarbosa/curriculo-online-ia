"""Bootstrap local de variáveis de ambiente (nunca commitado)."""

from __future__ import annotations

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

logger = logging.getLogger("uvicorn.error")

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_ENV_PATH = _BACKEND_DIR / ".env"
_EXAMPLE_PATH = _BACKEND_DIR / ".env.example"
_PLACEHOLDER_MARKERS = ("xxxxxxxx", "your-key", "change-me")


def _looks_like_placeholder(value: str) -> bool:
    lowered = value.strip().lower()
    if not lowered:
        return True
    return any(marker in lowered for marker in _PLACEHOLDER_MARKERS)


def ensure_local_env() -> None:
    """Garante `.env` local a partir do example e carrega no processo.

    Em produção (Render) as variáveis já vêm do painel — `override=False`
    preserva o ambiente da plataforma.
    """
    if not _ENV_PATH.exists() and _EXAMPLE_PATH.exists():
        _ENV_PATH.write_text(
            _EXAMPLE_PATH.read_text(encoding="utf-8"),
            encoding="utf-8",
        )
        logger.warning(
            "Criado %s a partir de .env.example. "
            "Preencha LLM_API_KEY com uma chave real antes de usar o /chat.",
            _ENV_PATH,
        )

    if _ENV_PATH.exists():
        load_dotenv(_ENV_PATH, override=False)

    api_key = os.environ.get("LLM_API_KEY", "")
    if _looks_like_placeholder(api_key):
        logger.warning(
            "LLM_API_KEY ausente ou ainda no placeholder de .env.example. "
            "Configure em backend/.env (local) ou no painel do Render (produção)."
        )
