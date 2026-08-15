import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.chat import router as chat_router
from app.env_bootstrap import ensure_local_env

ensure_local_env()

# Origem do frontend: localhost em dev, URL da Vercel configurada no painel do
# Render em produção (ADR-003 seção 5, US-05-09).
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "http://localhost:3000")

# Em produção, desativa /docs, /redoc e /openapi.json (US-08-06, achado M1 da
# auditoria de seguranca) — qualquer valor diferente de "production" (ou
# ausente) mantem o comportamento padrao do FastAPI, aberto em dev/local.
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

app = FastAPI(
    title="Curriculo Online API",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
app.include_router(chat_router)

# US-08-07 (achado M2 de QA-005): mesmo conjunto de headers de seguranca do
# frontend (frontend/next.config.ts), aplicado a toda resposta da API. Como o
# backend so serve JSON (nunca HTML/JS/CSS proprio), a CSP fica no modo mais
# restritivo possivel (default-src 'none') — nao ha recurso nenhum para a API
# carregar ou permitir carregarem dela. HSTS fica de fora de proposito
# (CA-004): API roda sempre atras de HTTPS via Render/Cloudflare, sem
# necessidade de header proprio.
SECURITY_HEADERS = {
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": (
        "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
    ),
}


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    for header, value in SECURITY_HEADERS.items():
        response.headers[header] = value
    return response


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
