# Backend — Currículo Online

Python + FastAPI (serviço de RAG).

Esqueleto da aplicação ainda não criado (ver Fase 2 do [plano do projeto](../docs/plano-projeto-curriculo-online.md)).

## Stack

- Python + FastAPI
- Testes: pytest (AAA), `TestClient` para integração do endpoint `/chat`
- Lint/format: ruff (ou flake8) + black

## Estrutura prevista

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
