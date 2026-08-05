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

| `GET /health` | `{"status": "ok"}` |
| `POST /chat` | Request `{"question": string}` → Response `{"answer": string}`. Erros: `422` (pergunta ausente/vazia), `429` (rate limit excedido), `500` (falha ao chamar o provider de IA, mensagem genérica). Pergunta fora do escopo do currículo não é erro — retorna `200` com fallback textual. |

O model `Resume` (Pydantic) valida o `resume.json` nos testes e ainda não aparece no OpenAPI (não há endpoint que o use como request/response).

## Segurança do `/chat` (US-05-07)

- **CORS**: restrito à origem definida em `ALLOWED_ORIGIN` (env var; default `http://localhost:3000` em dev). Em produção, configurar com a URL do frontend na Vercel — nunca `allow_origins=["*"]`.
- **Rate limit**: contador simples em memória por IP (`app/chat.py`, `_request_log`) — sem lib externa (`slowapi` avaliado, mas dispensado; volume do projeto não justifica a dependência extra). Limite: 10 requisições/minuto por IP; excedente retorna `429`. Reinicia a cada deploy (estado em memória, não persistido) — aceitável para o volume de tráfego esperado (visitantes ocasionais de portfólio).
- **Chave de API**: `LLM_API_KEY` só existe como variável de ambiente no backend (lida em `app/rag.py`), nunca no client — ver [ADR-003](../docs/architecture/ADR-003-fluxo-rag.md) seção 5.

## Deploy

Decisão de hospedagem: [`ADR-002`](../docs/architecture/ADR-002-hospedagem-gratuita.md) (Aceita) — **Render free tier**, Root Directory = `backend/`; Google Cloud Run documentado como fallback caso o cold start do Render atrapalhe o chat.

O repositório já traz [`render.yaml`](../render.yaml) na raiz (Blueprint / Infrastructure as Code) com `buildCommand`, `startCommand` e `healthCheckPath` prontos. Isso reduz o passo manual no painel a "conectar o repositório" — mas a criação do serviço em si (US-05-08, CA-001/CA-002/CA-003) é uma ação humana, feita uma única vez no painel do Render por quem tem acesso à conta:

1. Criar conta/logar no [Render](https://render.com) (plano free — não precisa cartão para web service free).
2. **New → Blueprint** e conectar o repositório GitHub `curriculo-online-ia`. O Render lê o `render.yaml` da raiz automaticamente e propõe o serviço `curriculo-online-backend` já configurado com `rootDir: backend`, `buildCommand: pip install -r requirements.txt` e `startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
   - Alternativa sem Blueprint: **New → Web Service**, conectar o repositório e preencher manualmente:
     - Root Directory: `backend`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - Plan: Free
     - Health Check Path: `/health`
3. Durante a criação do Blueprint, o Render solicita valores para as env vars marcadas com `sync: false` no `render.yaml` (`LLM_API_KEY`, `ALLOWED_ORIGIN`). **Para este primeiro deploy (esqueleto, só `/health`) elas não são obrigatórias** — podem ficar em branco/pular; serão configuradas de fato nas histórias US-05-07 (LLM) e US-05-09 (env vars/segredos), sem bloquear este deploy.
4. Confirmar que **Auto-Deploy** está ativado para a branch `main` (equivalente a `autoDeployTrigger: commit` no `render.yaml`) — atende ao CA-002: todo push em `main` dispara um novo deploy automaticamente.
5. Depois do primeiro deploy concluir, checar manualmente na URL pública gerada pelo Render (formato `https://<nome-do-serviço>.onrender.com`) que `GET /health` responde `200 {"status": "ok"}` — atende ao CA-003. O free tier do Render hiberna após ~15 min sem tráfego; a primeira requisição após hibernação pode levar 30–60s (cold start) — comportamento esperado, não é falha.

Nenhum valor real de segredo é commitado no repositório — chaves de API sempre configuradas manualmente no painel do Render (nunca no `render.yaml` nem em `.env` versionado).

## Estrutura

```
backend/
├── app/
│   ├── main.py              # FastAPI + CORS + /health
│   ├── models/
│   │   └── resume.py        # schema Pydantic do currículo
│   ├── rag.py               # chunking + embeddings + busca por similaridade
│   └── chat.py              # endpoint /chat + rate limit
├── tests/                   # espelha backend/app/
└── requirements.txt
```

Convenções completas em [`docs/agents/CONTEXTO-PROJETO.md`](../docs/agents/CONTEXTO-PROJETO.md).
