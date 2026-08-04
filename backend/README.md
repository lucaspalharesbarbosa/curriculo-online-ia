# Backend — Currículo Online

Python + FastAPI (serviço de RAG).

## Stack

- Python + FastAPI
- Testes: pytest (AAA), `TestClient` para integração do endpoint `/chat`
- Lint/format: ruff + black

## Comandos

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload   # servidor local (a partir de backend/)
ruff check .                    # lint
black --check .                 # format check
pytest                          # testes
```

## Estrutura

```
backend/
├── app/
│   ├── main.py
│   ├── rag.py       # embeddings + busca por similaridade
│   └── chat.py      # endpoint /chat
├── tests/           # espelha backend/app/
└── requirements.txt
```

Convenções completas em [`docs/agents/CONTEXTO-PROJETO.md`](../docs/agents/CONTEXTO-PROJETO.md).
