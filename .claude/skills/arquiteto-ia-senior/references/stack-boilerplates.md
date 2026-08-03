# Stack Boilerplates — Referência (Currículo Online)

> **Escopo:** Next.js/TypeScript/Tailwind (frontend) + Python/FastAPI (backend), monorepo.

## Frontend — Next.js

### Setup inicial

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app
```

### Estrutura de projeto

```
frontend/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Hero.tsx
│   ├── ExperienceCard.tsx
│   ├── SkillBadge.tsx
│   └── ChatWidget.tsx
├── content/
│   └── resume.json
├── public/
├── package.json
└── tsconfig.json
```

### `resume.json` — schema mínimo

```json
{
  "name": "Nome Sobrenome",
  "headline": "Cargo-alvo",
  "summary": "2-3 frases de posicionamento",
  "experiences": [
    { "role": "...", "company": "...", "period": "...", "highlights": ["..."] }
  ],
  "skills": { "languages": ["..."], "frameworks": ["..."], "cloud": ["..."] },
  "projects": [{ "name": "...", "description": "...", "url": "..." }],
  "contact": { "email": "...", "linkedin": "...", "github": "..." }
}
```

---

## Backend — FastAPI

### Setup inicial

```bash
mkdir -p backend/app
cd backend
python -m venv .venv
pip install fastapi uvicorn pydantic
pip freeze > requirements.txt
```

### Estrutura de projeto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py         # app FastAPI, CORS
│   ├── rag.py          # chunking + embeddings + similaridade
│   └── chat.py         # endpoint /chat
├── requirements.txt
└── .env.example        # variáveis de ambiente (sem valores reais)
```

### `main.py` (esqueleto)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.chat import router as chat_router

app = FastAPI(title="Currículo Online — backend RAG")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://<seu-site>.vercel.app", "http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

app.include_router(chat_router)

@app.get("/health")
def health():
    return {"status": "ok"}
```

### `.env.example`

```
LLM_API_KEY=
LLM_PROVIDER=openai
```

### Rodar local

```bash
uvicorn app.main:app --reload
```

---

## Checklist de alinhamento

| Item | Esperado |
|---|---|
| Frontend | Next.js App Router, TS, Tailwind |
| Backend | FastAPI, Python 3.12, sem framework de RAG pesado |
| Dados | `resume.json` único, schema estável |
| CORS | Backend só aceita origem do frontend (Vercel + localhost) |
| Secrets | `.env` local (não commitado) + variáveis de ambiente na hospedagem |

---

## IaC / containerização

Não é necessário para hospedagem free-tier (Vercel/Render/Cloud Run fazem build a partir do repositório). Só considerar Dockerfile se o Render/Cloud Run exigir explicitamente para o backend — nesse caso, imagem simples `python:3.12-slim` + `uvicorn`.
