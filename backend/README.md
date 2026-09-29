# Backend — Currículo Online

Python + FastAPI (serviço de API; RAG na Fase 05).

## Stack

- Python + FastAPI
- MCP: SDK oficial `mcp` (servidor stdio e Streamable HTTP, `ADR-017`)
- Validação do currículo: Pydantic (`app/resume/models.py`), espelhando o Zod do frontend
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

`python-dotenv` carrega `backend/.env` automaticamente no startup (`app/shared/env_bootstrap.py`). Em produção as variáveis vêm do painel do Render (`override=False`) — mesmo caminho: **`curriculo-online-backend` → Environment → `LLM_API_KEY`**.

## Comandos

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload   # servidor local (a partir de backend/)
ruff check .                    # lint
black --check .                 # format check
pytest                          # testes
pytest -v                       # testes com display em PT-BR (docstring de cada teste, via tests/conftest.py)
```

## Variáveis de ambiente

Definidas em `backend/.env` local (a partir de `.env.example`) e no painel do Render em produção — nunca commitadas com valor real. `LLM_API_KEY` e `ALLOWED_ORIGIN` já documentadas na seção [Segurança do `/chat`](#segurança-do-chat-us-05-07) e na tabela do [`README.md` raiz](../README.md#env).

| Variável | Valores esperados | Default | Efeito |
|---|---|---|---|
| `ENVIRONMENT` | `development` \| `production` | `development` (quando ausente) | Em `production`, desativa `/docs`, `/redoc` e `/openapi.json` (404) — ver [Documentação da API](#documentacao-da-api). Não é segredo; configurar `ENVIRONMENT=production` no painel do Render (produção). |
| `CHAT_TOOL_CALLING` | `true` \| `false` | `false` (quando ausente); `true` no `render.yaml` | Liga o tool calling no `/chat`: recupera primeiro e o modelo usa as tools exatas como reforço ([ADR-018](../docs/architecture/ADR-018-tools-estruturadas-recuperar-primeiro-hibrida.md)). Desligado, o `/chat` segue o pipeline determinístico. Em falha do provider, cai sempre para o pipeline. |
| `MCP_HTTP_ENABLED` | `true` \| `false` | `false` (quando ausente) | Expõe o servidor MCP em `POST /mcp` (Streamable HTTP, com rate limit de 30 req/min por IP). O modo stdio (`python -m app.mcp_server`) não depende desta flag. |
| `WEB_SEARCH_API_KEY` | Chave da [Tavily](https://app.tavily.com) | Ausente (feature desativada) | Fallback de busca web do `/chat` para dados externos ao `resume.json` ([ADR-010](../docs/architecture/ADR-010-fluxo-rag-v2-precisao-web.md)) — opcional, sem ela o chat funciona normalmente só com o currículo. |

## Tools e MCP

O assistente tem um **núcleo de tools** (`app/tools/`) exposto por duas portas ([`ADR-017`](../docs/architecture/ADR-017-tools-e-mcp-um-nucleo-duas-portas.md)):

| Tool | O que faz | Precisa de LLM? |
|---|---|---|
| `calculate_experience(skill_or_company)` | Tempo de experiência **calculado** (períodos sobrepostos contados uma vez; cargo atual conta até hoje) | não |
| `find_technology(name)` | Onde e por quanto tempo uma tecnologia aparece: cargos, skills e projetos (casa por token inteiro na lista de tecnologias) | não |
| `get_experience(company)` | Registro estruturado da empresa: cargo, período, cidade, modalidade, tecnologias e conquistas em campos separados | não |
| `career_timeline(around?)` | Carreira em ordem, contagem de empresas, primeira e mais recente. Com `around`, quem veio antes e depois | não |
| `list_adrs()` / `read_adr(number)` | Lista e lê as decisões de arquitetura do projeto (`docs/architecture/`), para o chat explicar como o projeto foi construído | não |
| `search_resume(query, section?)` | Busca semântica no currículo (embeddings, precisa de `LLM_API_KEY`) | embedding |
| `search_web(query)` | Busca pública sobre uma entidade citada no currículo (Tavily, opcional) | não |

Todas são somente leitura.

**Porta 1: tool calling no `/chat`.** Ligue com `CHAT_TOOL_CALLING=true`. O retrieval do pipeline roda primeiro e o contexto vai junto da pergunta; as tools entram como reforço. Limites: 3 turnos e 3 execuções de tool por pergunta; sem contexto confiável, o 1º turno exige uma tool.

**Porta 2: servidor MCP.**

Local (stdio), por exemplo no `claude_desktop_config.json` (ajuste o caminho):

```json
{
  "mcpServers": {
    "curriculo-lucas": {
      "command": "python",
      "args": ["-m", "app.mcp_server"],
      "cwd": "C:/caminho/para/curriculo-online-ia/backend"
    }
  }
}
```

Remoto (HTTP): com `MCP_HTTP_ENABLED=true`, aponte um cliente MCP para `https://<backend>/mcp`. Recursos de leitura: `resume://experiencias` e `resume://skills`.

Medição no golden-set real (`ADR-018`): regressão (24 perguntas) 21/24 contra 19/24 do pipeline, e capacidades novas (15) 14/15 contra 3/15. Para repetir (usa a API da OpenAI, custa centavos):

```bash
cd backend
python -m eval.compare_modes                       # 4 modos, 2 conjuntos
python -m eval.compare_modes --modes pipeline,tools-hybrid --sets original
```

## OpenAPI (contrato da API)

Com o servidor no ar (`uvicorn app.main:app --reload`):

| UI | URL |
|---|---|
| Swagger UI | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |
| JSON OpenAPI | http://127.0.0.1:8000/openapi.json |

| `GET /health` | `{"status": "ok"}` |
| `POST /chat` | Request `{"question": string}` → Response `{"answer": string, "source": "resume"\|"web", "tools": [{"name", "arguments", "result"}]}` (`tools` é aditivo e fica vazio quando o pipeline determinístico respondeu, `ADR-019`). Erros: `422` (pergunta ausente/vazia), `429` (rate limit excedido), `500` (falha ao gerar — mensagem genérica, sem detalhe interno). Pergunta fora do escopo do currículo não é erro — retorna `200` com fallback textual. |

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
- **Rate limit**: contador simples em memória por IP (`app/chat/router.py`, `_request_log`) — sem lib externa (`slowapi` avaliado, mas dispensado; volume do projeto não justifica a dependência extra). Limite: 10 requisições/minuto por IP; excedente retorna `429`. Reinicia a cada deploy (estado em memória, não persistido) — aceitável para o volume de tráfego esperado (visitantes ocasionais de portfólio).
- **Chave de API**: `LLM_API_KEY` só existe como variável de ambiente no backend (lida em `app/chat/adapters/openai_adapter.py`), nunca no client — ver [ADR-003](../docs/architecture/ADR-003-fluxo-rag.md) seção 5.
- **Timeout e retry** ([ADR-004](../docs/architecture/ADR-004-resiliencia-backend-chat.md) / US-08-02): `get_client()` em `app/chat/adapters/openai_adapter.py` configura `timeout=20s` e `max_retries=1` (SDK retenta só erros transitórios tipicamente 429/5xx). Evita o default de minutos do SDK e limita o tempo que uma chamada lenta trava o worker do Render free tier. Timeout/falha após retry → `/chat` responde 500 com mensagem genérica (sem detalhe do provider).

## Headers de segurança HTTP (US-08-07)

Middleware custom (`add_security_headers` em `app/main.py`, sem lib externa) injeta em toda resposta: `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'` (API só serve JSON, nenhum recurso próprio para permitir), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy` desativando `camera`/`microphone`/`geolocation`/`payment`/`usb`. Sem `Strict-Transport-Security` próprio — a API roda sempre atrás de HTTPS (Render/Cloudflare). Teste de regressão: `backend/tests/test_main.py::test_health_check_returns_security_headers`.

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
│   ├── main.py               # composition root: FastAPI, CORS, /health
│   ├── shared/                # cross-cutting, sem regra de negócio de domínio
│   │   ├── errors.py          # shape de erro padrão da API
│   │   └── env_bootstrap.py   # bootstrap de .env local
│   ├── resume/                 # domínio "currículo"
│   │   └── models.py           # schema Pydantic do currículo
│   ├── tools/                  # núcleo de tools do ADR-017 (sem openai/mcp)
│   │   ├── registry.py          # Tool + execute_tool (valida a entrada do LLM)
│   │   ├── experience.py        # cálculo determinístico de tempo de experiência
│   │   ├── career.py            # find_technology, get_experience, career_timeline (ADR-018)
│   │   ├── docs_tools.py        # list_adrs, read_adr (ADR-018)
│   │   └── resume_tools.py      # monta as 8 tools com as dependências injetadas
│   ├── mcp_server/             # porta MCP do ADR-017
│   │   ├── server.py            # FastMCP: tools do núcleo + recursos resume://
│   │   ├── http.py              # Streamable HTTP em /mcp + rate limit
│   │   └── __main__.py          # stdio: python -m app.mcp_server
│   └── chat/                   # domínio "chat/RAG" — Ports & Adapters (ADR-012)
│       ├── router.py            # camada HTTP: endpoint /chat + /chat/feedback, rate limit, Depends()
│       ├── service.py           # use case: orquestra pergunta → resposta
│       ├── ports.py             # Protocol: EmbeddingProvider, ChatCompletionProvider, WebSearchProvider, ToolCallingProvider
│       ├── adapters/
│       │   ├── openai_adapter.py   # Embedding/ChatCompletion/ToolCalling providers (openai.OpenAI)
│       │   └── tavily_adapter.py    # WebSearchProvider (Tavily)
│       └── rag.py               # chunking, ranking, roteamento (recebe EmbeddingProvider por parâmetro)
├── tests/                    # espelha backend/app/ (tests/chat/, tests/tools/, tests/mcp_server/, tests/resume/)
└── requirements.txt
```

Modularização por domínio (`resume`/`chat`/`shared`) — ver [`ADR-011`](../docs/architecture/ADR-011-modularizacao-ddd-lite.md). Ports & Adapters no domínio `chat` — ver [`ADR-012`](../docs/architecture/ADR-012-clean-architecture-chat.md).

Convenções completas em [`docs/agents/CONTEXTO-PROJETO.md`](../docs/agents/CONTEXTO-PROJETO.md).
