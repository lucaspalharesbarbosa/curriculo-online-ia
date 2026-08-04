# Backend — Currículo Online

Python + FastAPI (serviço de API; RAG na Fase 05).

## Stack

- Python + FastAPI
- Validação do currículo: Pydantic (`app/models/resume.py`), espelhando o Zod do frontend
- Testes: pytest (AAA), `TestClient` para endpoints
- Lint/format: ruff + black

## Comandos

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload   # servidor local (a partir de backend/)
ruff check .                    # lint
black --check .                 # format check
pytest                          # testes
```

## OpenAPI (contrato da API)

Com o servidor no ar (`uvicorn app.main:app --reload`):

| UI | URL |
|---|---|
| Swagger UI | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |
| JSON OpenAPI | http://127.0.0.1:8000/openapi.json |

Hoje só existe `GET /health` → `{"status": "ok"}`. O endpoint `/chat` entra na Fase 05. O model `Resume` (Pydantic) valida o `resume.json` nos testes e ainda não aparece no OpenAPI (não há endpoint que o use como request/response).

## Estrutura

```
backend/
├── app/
│   ├── main.py              # FastAPI + /health
│   ├── models/
│   │   └── resume.py        # schema Pydantic do currículo
│   ├── rag.py               # (Fase 05) embeddings + similaridade
│   └── chat.py              # (Fase 05) endpoint /chat
├── tests/                   # espelha backend/app/
└── requirements.txt
```

Convenções completas em [`docs/agents/CONTEXTO-PROJETO.md`](../docs/agents/CONTEXTO-PROJETO.md).
