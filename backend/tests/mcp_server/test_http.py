"""Testes da porta HTTP do MCP (`ADR-017`): mount no FastAPI e rate limit."""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import asynccontextmanager

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from mcp.server.transport_security import TransportSecuritySettings

from app.chat import rag
from app.mcp_server.http import RateLimitedApp, create_mcp_http
from app.mcp_server.server import build_server
from tests.chat.fakes import FakeEmbeddingProvider, FakeWebSearchProvider
from tests.tools.helpers import make_resume

HEADERS = {
    "Accept": "application/json, text/event-stream",
    "Content-Type": "application/json",
}
INDEX = [
    rag.EmbeddedChunk(
        chunk=rag.Chunk(id="experience-0", section="experience", text="Texto A"),
        embedding=[1.0, 0.0],
    )
]


def _rpc(client: TestClient, method: str, params: dict, id_: int = 1):
    body = {"jsonrpc": "2.0", "id": id_, "method": method, "params": params}
    return client.post("/mcp", json=body, headers=HEADERS)


@pytest.fixture
def client() -> Iterator[TestClient]:
    server = build_server(
        make_resume([("Alfa", "2024-01", "2025-07", ["Python"])]),
        lambda: INDEX,
        FakeEmbeddingProvider([1.0, 0.0]),
        FakeWebSearchProvider(),
        transport_security=TransportSecuritySettings(
            enable_dns_rebinding_protection=False
        ),
    )
    mcp_app, server = create_mcp_http(server)

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        async with server.session_manager.run():
            yield

    app = FastAPI(lifespan=lifespan)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.mount("/", mcp_app)
    with TestClient(app) as test_client:
        yield test_client


def test_rotas_do_fastapi_continuam_atendidas(client: TestClient) -> None:
    """O mount em '/' não engole as rotas registradas antes dele."""
    assert client.get("/health").json() == {"status": "ok"}


def test_initialize_e_lista_de_tools_via_http(client: TestClient) -> None:
    """Handshake MCP e `tools/list` funcionam em `/mcp`."""
    init = _rpc(
        client,
        "initialize",
        {
            "protocolVersion": "2025-06-18",
            "capabilities": {},
            "clientInfo": {"name": "teste", "version": "0"},
        },
    )
    listed = _rpc(client, "tools/list", {}, id_=2)

    assert init.status_code == 200
    assert init.json()["result"]["serverInfo"]["name"] == "curriculo-lucas-palhares"
    names = [tool["name"] for tool in listed.json()["result"]["tools"]]
    assert names == ["search_resume", "calculate_experience", "search_web"]


def test_tools_call_via_http(client: TestClient) -> None:
    """Uma chamada de tool completa pelo transporte HTTP."""
    response = _rpc(
        client,
        "tools/call",
        {"name": "search_resume", "arguments": {"query": "algo"}},
        id_=3,
    )

    text = response.json()["result"]["content"][0]["text"]
    assert "[experience] Texto A" in text


def test_rate_limit_devolve_429_apos_o_teto() -> None:
    """Acima de `max_requests` na janela, o IP recebe 429 sem chegar ao MCP."""
    reached: list[str] = []

    async def inner(scope, receive, send):  # noqa: ANN001
        reached.append("ok")
        await send({"type": "http.response.start", "status": 200, "headers": []})
        await send({"type": "http.response.body", "body": b""})

    app = FastAPI()
    app.mount("/", RateLimitedApp(inner, max_requests=2, window_seconds=60))
    test_client = TestClient(app)

    codes = [test_client.get("/qualquer").status_code for _ in range(4)]

    assert codes == [200, 200, 429, 429]
    assert len(reached) == 2
