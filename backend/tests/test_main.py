import importlib

from fastapi.testclient import TestClient

from app import main
from app.main import ALLOWED_ORIGIN, app

client = TestClient(app)


def test_health_check_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_cors_preflight_aceita_origem_permitida() -> None:
    response = client.options(
        "/chat",
        headers={
            "Origin": ALLOWED_ORIGIN,
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ALLOWED_ORIGIN


def test_cors_preflight_rejeita_origem_nao_permitida() -> None:
    response = client.options(
        "/chat",
        headers={
            "Origin": "https://origem-nao-permitida.example.com",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 400


def test_docs_endpoints_desativados_quando_environment_production(
    monkeypatch,
) -> None:
    """Com ENVIRONMENT=production, /docs, /redoc e /openapi.json retornam 404."""
    monkeypatch.setenv("ENVIRONMENT", "production")
    importlib.reload(main)

    try:
        prod_client = TestClient(main.app)

        assert prod_client.get("/docs").status_code == 404
        assert prod_client.get("/redoc").status_code == 404
        assert prod_client.get("/openapi.json").status_code == 404
    finally:
        # Restaura o app default (dev) para não vazar estado a outros testes.
        monkeypatch.delenv("ENVIRONMENT", raising=False)
        importlib.reload(main)


def test_health_check_retorna_headers_de_seguranca() -> None:
    """Resposta de /health inclui os headers de seguranca do middleware (US-08-07)."""
    response = client.get("/health")

    assert response.status_code == 200
    assert response.headers["content-security-policy"] == (
        "default-src 'none'; frame-ancestors 'none'"
    )
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert response.headers["permissions-policy"] == (
        "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
    )
    # CA-004: HSTS nao e adicionado por este middleware (ja vem via
    # plataforma em producao real, nao aplicavel ao TestClient local).
    assert "strict-transport-security" not in response.headers


def test_docs_endpoints_disponiveis_quando_environment_ausente_ou_dev(
    monkeypatch,
) -> None:
    """Sem ENVIRONMENT (ou != production), os três endpoints continuam 200."""
    monkeypatch.delenv("ENVIRONMENT", raising=False)
    importlib.reload(main)

    try:
        dev_client = TestClient(main.app)

        assert dev_client.get("/docs").status_code == 200
        assert dev_client.get("/redoc").status_code == 200
        assert dev_client.get("/openapi.json").status_code == 200
    finally:
        importlib.reload(main)
