"""Entrada stdio do servidor MCP: `python -m app.mcp_server` (a partir de `backend/`).

É o modo usado por clientes locais (Claude Desktop, Cursor). Precisa de
`LLM_API_KEY` no `backend/.env` para a tool `search_resume` (embeddings).
"""

from __future__ import annotations

from app.mcp_server.server import build_default_server
from app.shared.env_bootstrap import ensure_local_env


def main() -> None:
    ensure_local_env()
    build_default_server().run(transport="stdio")


if __name__ == "__main__":
    main()
