"""Shape de erro padrao da API: {"error": {"code", "message", "details"?}}.

Registrado via handlers nativos do FastAPI (sem lib nova) para toda rota,
nao so /chat — US-13-02.
"""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

# Um status HTTP mapeia para exatamente um code nesta API (escopo atual:
# 429 rate limit, 500 falha interna/config, 503 provider de LLM indisponivel).
_STATUS_CODE_TO_ERROR_CODE: dict[int, str] = {
    429: "rate_limited",
    500: "internal_error",
    503: "llm_unavailable",
}
_DEFAULT_ERROR_CODE = "http_error"


def _error_response(
    status_code: int,
    code: str,
    message: str,
    details: list[object] | None = None,
) -> JSONResponse:
    body: dict[str, object] = {"code": code, "message": message}
    if details is not None:
        body["details"] = details
    return JSONResponse(status_code=status_code, content={"error": body})


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    code = _STATUS_CODE_TO_ERROR_CODE.get(exc.status_code, _DEFAULT_ERROR_CODE)
    return _error_response(exc.status_code, code, str(exc.detail))


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return _error_response(
        422, "validation_error", "Dados inválidos.", details=exc.errors()
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
