"""Porta HTTP do servidor MCP (Streamable HTTP), montada no FastAPI em `/mcp`.

Opt-in por `MCP_HTTP_ENABLED=true` (`app/main.py`, `ADR-017`). É o modo remoto:
o cliente aponta para `https://<backend>/mcp`, sem instalar nada.
"""

from __future__ import annotations

import json
import time
from collections import defaultdict
from typing import Any

from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from starlette.types import ASGIApp, Receive, Scope, Send

from app.mcp_server.server import build_default_server

MCP_RATE_LIMIT_MAX_REQUESTS = 30
MCP_RATE_LIMIT_WINDOW_SECONDS = 60.0
MCP_RATE_LIMIT_MESSAGE = "Muitas requisições. Tente novamente em instantes."


class RateLimitedApp:
    """Rate limit por IP em memória, na frente do app ASGI do MCP.

    Mesma abordagem do `/chat` (`chat/router.py`), com teto maior porque um
    único uso de cliente MCP faz 3 a 4 requests (initialize, tools/list,
    tools/call). Cada `search_resume` custa um embedding, então o teto existe.
    """

    def __init__(
        self,
        app: ASGIApp,
        max_requests: int = MCP_RATE_LIMIT_MAX_REQUESTS,
        window_seconds: float = MCP_RATE_LIMIT_WINDOW_SECONDS,
    ) -> None:
        self._app = app
        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._log: dict[str, list[float]] = defaultdict(list)

    def _is_limited(self, client_id: str) -> bool:
        now = time.monotonic()
        recent = [t for t in self._log[client_id] if t > now - self._window_seconds]
        recent.append(now)
        self._log[client_id] = recent
        return len(recent) > self._max_requests

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            client = scope.get("client")
            if self._is_limited(client[0] if client else "unknown"):
                await self._reject(send)
                return
        await self._app(scope, receive, send)

    @staticmethod
    async def _reject(send: Send) -> None:
        body = json.dumps({"detail": MCP_RATE_LIMIT_MESSAGE}).encode("utf-8")
        await send(
            {
                "type": "http.response.start",
                "status": 429,
                "headers": [(b"content-type", b"application/json")],
            }
        )
        await send({"type": "http.response.body", "body": body})


def create_mcp_http(server: FastMCP | None = None) -> tuple[ASGIApp, FastMCP]:
    """`(app_asgi, server)`: o app responde em `/mcp`; o chamador precisa rodar
    `server.session_manager.run()` no lifespan do FastAPI."""
    if server is None:
        # Sem cookies nem credenciais e com dados públicos: a proteção contra
        # DNS rebinding (pensada para servidores locais) só bloquearia o Host
        # real da hospedagem.
        server = build_default_server(
            transport_security=TransportSecuritySettings(
                enable_dns_rebinding_protection=False
            )
        )
    inner: Any = server.streamable_http_app()
    return RateLimitedApp(inner), server
