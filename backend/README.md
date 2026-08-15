# Backend — Currículo Online

Python + FastAPI (serviço de API; RAG na Fase 05).

## Stack

- Python + FastAPI
- Validação do currículo: Pydantic (`app/models/resume.py`), espelhando o Zod do frontend
- Testes: pytest (AAA), `TestClient` para endpoints
- Lint/format: ruff + black

## Setup local (obrigatório para o chat)

Na primeira subida, o backend cria `backend/.env` a partir de `.env.example` se ele ainda não existir. **Substitua o placeholder de `LLM_API_KEY` pela chave real** — sem isso o `/chat` responde erro genérico ao client e registra o motivo só no log do servidor.

### Onde obter `LLM_API_KEY`

1. Abra o [Dashboard do Render](https://dashboard.render.com).
2. Web Service **`curriculo-online-backend`**.
3. Aba **Environment**.
4. Variável **`LLM_API_KEY`** — revele/copie o valor no painel e cole em `backend/.env`.

Alternativa: gerar uma chave nova em [platform.openai.com/api-keys](https://platform.openai.com/api-keys) (a mesma usada em produção no Render).

```bash
cd backend
pip install -r requirements.txt
# Edite backend/.env → LLM_API_KEY=<valor do Render Environment>
uvicorn app.main:app --reload
```

`python-dotenv` carrega `backend/.env` automaticamente no startup (`app/env_bootstrap.py`). Em produção as variáveis vêm do painel do Render (`override=False`) — mesmo caminho: **`curriculo-online-backend` → Environment → `LLM_API_KEY`**.

## Comandos

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload   # servidor local (a partir de backend/)
ruff check .                    # lint
black --check .                 # format check
pytest                          # testes
```

## Variáveis de ambiente

Definidas em `backend/.env` local (a partir de `.env.example`) e no painel do Render em produção — nunca commitadas com valor real. `LLM_API_KEY` e `ALLOWED_ORIGIN` já documentadas na seção [Segurança do `/chat`](#segurança-do-chat-us-05-07) e na tabela do [`README.md` raiz](../README.md#env).

| Variável | Valores esperados | Default | Efeito |
|---|---|---|---|
| `ENVIRONMENT` | `development` \| `production` | `development` (quando ausente) | Em `production`, desativa `/docs`, `/redoc` e `/openapi.json` (404) — ver [Documentação da API](#documentacao-da-api). Não é segredo; configurar `ENVIRONMENT=production` no painel do Render (produção). |

## OpenAPI (contrato da API)

Com o servidor no ar (`uvicorn app.main:app --reload`):

| UI | URL |
|---|---|
| Swagger UI | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |
| JSON OpenAPI | http://127.0.0.1:8000/openapi.json |

| `GET /health` | `{"status": "ok"}` |
| `POST /chat` | Request `{"question": string}` → Response `{"answer": string}`. Erros: `422` (pergunta ausente/vazia), `429` (rate limit excedido), `500` (falha ao gerar — mensagem genérica, sem detalhe interno). Pergunta fora do escopo do currículo não é erro — retorna `200` com fallback textual. |

O model `Resume` (Pydantic) valida o `resume.json` nos testes e ainda não aparece no OpenAPI (não há endpoint que o use como request/response).

<a id="documentacao-da-api"></a>

### Documentação da API — Swagger/ReDoc/OpenAPI local vs. produção

Swagger UI (`/docs`), ReDoc (`/redoc`) e o schema JSON (`/openapi.json`) ficam **disponíveis só rodando o backend localmente**, sem `ENVIRONMENT=production` (ausente ou `development`):

```bash
cd backend
uvicorn app.main:app --reload
# http://localhost:8000/docs
# http://localhost:8000/redoc
# http://localhost:8000/openapi.json
```

Em **produção** (`ENVIRONMENT=production`, configurado no painel do Render), os três endpoints retornam `404` — as rotas nem são registradas no app. Isso reduz a superfície de informação exposta a qualquer visitante anônimo (achado M1 da auditoria de segurança, [`US-08-01`](../docs/product/backlog/fase-08/US-08-01-auditoria-seguranca.md) / [`QA-005`](../docs/qa/QA-005-auditoria-seguranca.md)); a documentação da API continua acessível ao autor rodando local. Detalhes da decisão: [`US-08-06`](../docs/product/backlog/fase-08/US-08-06-desativar-docs-openapi-producao.md).

## Segurança do `/chat` (US-05-07)

- **CORS**: restrito à origem definida em `ALLOWED_ORIGIN` (env var; default `http://localhost:3000` em dev). Em produção, configurar com a URL do frontend na Vercel — nunca `allow_origins=["*"]`. **Origem única** (`allow_origins=[ALLOWED_ORIGIN]` em `app/main.py`, sem lista) — para rodar um smoke manual do `/chat` a partir de um frontend local (`http://localhost:3000`) contra o backend real no Render, é preciso trocar `ALLOWED_ORIGIN` temporariamente no painel do Render para `http://localhost:3000` e depois reverter para a URL da Vercel; não dá para atender as duas origens ao mesmo tempo sem alterar o código.
- **Rate limit**: contador simples em memória por IP (`app/chat.py`, `_request_log`) — sem lib externa (`slowapi` avaliado, mas dispensado; volume do projeto não justifica a dependência extra). Limite: 10 requisições/minuto por IP; excedente retorna `429`. Reinicia a cada deploy (estado em memória, não persistido) — aceitável para o volume de tráfego esperado (visitantes ocasionais de portfólio).
- **Chave de API**: `LLM_API_KEY` só existe como variável de ambiente no backend (lida em `app/rag.py`), nunca no client — ver [ADR-003](../docs/architecture/ADR-003-fluxo-rag.md) seção 5.

## Headers de segurança HTTP (US-08-07)

Middleware custom (`add_security_headers` em `app/main.py`, sem lib externa) injeta em toda resposta: `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'` (API só serve JSON, nenhum recurso próprio para permitir), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy` desativando `camera`/`microphone`/`geolocation`/`payment`/`usb`. Sem `Strict-Transport-Security` próprio — a API roda sempre atrás de HTTPS (Render/Cloudflare). Teste de regressão: `backend/tests/test_main.py::test_health_check_retorna_headers_de_seguranca`.

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
