import httpx
import pytest

from app.chat import web_search
from app.chat.web_search import search_web


class _FakeResponse:
    def __init__(self, payload: dict[str, object], status_code: int = 200) -> None:
        self._payload = payload
        self.status_code = status_code

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            request = httpx.Request("POST", web_search.TAVILY_API_URL)
            response = httpx.Response(self.status_code, request=request)
            raise httpx.HTTPStatusError(
                "erro simulado", request=request, response=response
            )

    def json(self) -> dict[str, object]:
        return self._payload


@pytest.fixture(autouse=True)
def _web_search_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("WEB_SEARCH_API_KEY", "test-key-not-real")


def test_search_web_without_api_key_returns_none_without_calling_http(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Sem WEB_SEARCH_API_KEY, nunca deve haver chamada de rede."""
    monkeypatch.delenv("WEB_SEARCH_API_KEY", raising=False)

    def _fail_if_called(*args: object, **kwargs: object) -> None:
        raise AssertionError("httpx.post não deveria ser chamado sem API key")

    monkeypatch.setattr(web_search.httpx, "post", _fail_if_called)

    assert search_web("Empresa X") is None


def test_search_web_returns_answer_when_available(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Retorna o answer quando disponível na resposta."""
    monkeypatch.setattr(
        web_search.httpx,
        "post",
        lambda *args, **kwargs: _FakeResponse({"answer": "Resposta resumida."}),
    )

    result = search_web("Empresa X")

    assert result == "Resposta resumida."


def test_search_web_uses_results_when_no_answer(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Usa os results concatenados quando não há answer."""
    monkeypatch.setattr(
        web_search.httpx,
        "post",
        lambda *args, **kwargs: _FakeResponse(
            {
                "results": [
                    {"content": "Trecho um."},
                    {"content": "Trecho dois."},
                ]
            }
        ),
    )

    result = search_web("Empresa X")

    assert result == "Trecho um. Trecho dois."


def test_search_web_without_answer_and_without_results_returns_none(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Retorna None quando não há answer nem results."""
    monkeypatch.setattr(
        web_search.httpx, "post", lambda *args, **kwargs: _FakeResponse({})
    )

    assert search_web("Empresa X") is None


def test_search_web_timeout_returns_none_without_raising_exception(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-005: timeout do provedor nunca vira erro para o chamador."""

    def _raise_timeout(*args: object, **kwargs: object) -> None:
        raise httpx.TimeoutException("timeout simulado")

    monkeypatch.setattr(web_search.httpx, "post", _raise_timeout)

    assert search_web("Empresa X") is None


def test_search_web_http_error_returns_none_without_raising_exception(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Retorna None quando a API responde com erro HTTP."""
    monkeypatch.setattr(
        web_search.httpx,
        "post",
        lambda *args, **kwargs: _FakeResponse({}, status_code=500),
    )

    assert search_web("Empresa X") is None


def test_search_web_invalid_json_returns_none(monkeypatch: pytest.MonkeyPatch) -> None:
    """Retorna None quando o corpo da resposta não é JSON válido."""

    class _BadJsonResponse:
        status_code = 200

        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict[str, object]:
            raise ValueError("corpo não é JSON válido")

    monkeypatch.setattr(
        web_search.httpx, "post", lambda *args, **kwargs: _BadJsonResponse()
    )

    assert search_web("Empresa X") is None


def test_search_web_uses_short_documented_timeout(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-005: timeout explícito e curto (8s), não o default do cliente HTTP."""
    captured_kwargs: dict[str, object] = {}

    def _capture(*args: object, **kwargs: object) -> _FakeResponse:
        captured_kwargs.update(kwargs)
        return _FakeResponse({"answer": "ok"})

    monkeypatch.setattr(web_search.httpx, "post", _capture)

    search_web("Empresa X")

    assert captured_kwargs["timeout"] == web_search.WEB_SEARCH_TIMEOUT_SECONDS
    assert captured_kwargs["timeout"] == 8.0
