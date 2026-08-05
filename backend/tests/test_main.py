from fastapi.testclient import TestClient

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
