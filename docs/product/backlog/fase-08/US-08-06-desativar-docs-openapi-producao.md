# US-08-06 — Desativar documentação OpenAPI em produção

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** dono do produto,
**quero** que `/docs`, `/redoc` e `/openapi.json` fiquem inacessíveis quando o backend roda em produção,
**para** reduzir a superfície de informação exposta a qualquer visitante anônimo, mantendo os três endpoints disponíveis em desenvolvimento/local (onde são úteis para debug).

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — sim, ver subseção "Contrato de API" (mudança de comportamento condicional dos três endpoints de documentação, não payload de negócio)
- [x] Mapeamento de erros documentado — ver subseção "Contrato de API" (não é exceção de aplicação; é a resposta padrão 404 do FastAPI para rota não registrada)
- [x] Modelagem de dados documentada — N/A (nenhuma entidade nova/alterada)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance (`PRD-006`); origem do achado: [US-08-01](US-08-01-auditoria-seguranca.md) / [`QA-005`](../../../qa/QA-005-auditoria-seguranca.md), achado M1
- [x] ADR registrado se envolve decisão de stack nova — N/A (config condicional nativa do FastAPI — `docs_url`/`redoc_url`/`openapi_url` no construtor de `FastAPI(...)` —, não é decisão de stack)
- [x] Variáveis de ambiente/segredos necessários identificados — **nova env var `ENVIRONMENT`** (não é segredo, é um rótulo de ambiente): valores esperados `development` (default, quando ausente) e `production`; configurar `ENVIRONMENT=production` no painel do Render (produção); em dev/local permanece ausente/`development`, mantendo os docs abertos
- [x] Referência visual definida — N/A (sem UI)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Contrato de API

Não é um endpoint de negócio novo — é a ativação condicional dos endpoints de documentação que o FastAPI já expõe por padrão.

- Quando `ENVIRONMENT=production`: `FastAPI(docs_url=None, redoc_url=None, openapi_url=None)` — as três rotas deixam de existir no app.
- Quando `ENVIRONMENT` ausente ou diferente de `production` (dev/local/preview): comportamento atual, sem mudança (`docs_url="/docs"`, `redoc_url="/redoc"`, `openapi_url="/openapi.json"`, os defaults do FastAPI).

Mapeamento de erros:

| Condição | Código HTTP | Body do erro | Mensagem |
|---|---|---|---|
| `GET /docs`, `/redoc` ou `/openapi.json` com `ENVIRONMENT=production` | 404 | `{"detail": "Not Found"}` | resposta padrão do FastAPI/Starlette para rota inexistente (a rota nem é registrada) |
| Mesmos endpoints com `ENVIRONMENT` ausente ou `!= production` | 200 | inalterado (Swagger UI / ReDoc / schema JSON) | inalterado |

#### Plano de testes

- Integração: `backend/tests/test_main.py` — `TestClient` construído com `ENVIRONMENT=production` (via `monkeypatch`/fixture de env) confirma 404 nos três endpoints; `TestClient` sem a env var (ou `development`) confirma 200, replicando o comportamento hoje coberto pelo baseline de CORS/health
- Manual: `curl -I` em produção real pós-deploy (Render), nos três endpoints, confirmando 404
- Mocks: nenhum

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: dado `ENVIRONMENT=production`, `GET /docs` retorna 404
- [ ] CA-002: dado `ENVIRONMENT=production`, `GET /redoc` retorna 404
- [ ] CA-003: dado `ENVIRONMENT=production`, `GET /openapi.json` retorna 404
- [ ] CA-004: dado `ENVIRONMENT` ausente ou diferente de `production` (dev/local), os três endpoints continuam respondendo 200 como hoje
- [ ] CA-005: `ENVIRONMENT=production` configurado no painel do Render (produção real) e comportamento confirmado via `curl -I` pós-deploy
- [ ] CA-006: `backend/README.md` (com referência no `README.md` raiz) documenta como acessar Swagger/ReDoc/OpenAPI **localmente** (rodar o backend sem `ENVIRONMENT=production` → `http://localhost:8000/docs`) — a documentação da API continua disponível para o autor, só não fica exposta publicamente em produção

### Fora de escopo

- Autenticação/whitelist de IP para liberar docs a usuários específicos em produção (nenhum uso identificado que justifique)
- Alterar o schema OpenAPI em si (títulos, descrições) — só ativação/desativação condicional
- Qualquer outra env var de configuração de ambiente além de `ENVIRONMENT`

### Dependências

- [PRD-006](../../PRD-006-seguranca-performance.md)
- [US-08-01](US-08-01-auditoria-seguranca.md) (Done) — origem do achado M1
- [`QA-005`](../../../qa/QA-005-auditoria-seguranca.md) — evidência do achado
- [US-05-09](../../../product/backlog/archive/fase-05/US-05-09-env-vars-segredos.md) — padrão de env vars/segredos já estabelecido (`.env.example`, painel do Render)

### Épico / Prioridade

Segurança & Performance — P1

### Tasks

- [ ] T01 Ler `ENVIRONMENT` em `backend/app/main.py` e condicionar `docs_url`/`redoc_url`/`openapi_url` a `None` quando `production`
- [ ] T02 [P] Atualizar `backend/.env.example` com a nova variável `ENVIRONMENT` (comentário explicando valores esperados e default)
- [ ] T03 [P] Teste em `backend/tests/test_main.py` cobrindo os dois cenários (produção bloqueado / dev liberado)
- [ ] T04 Configurar `ENVIRONMENT=production` no painel do Render (produção) e validar com `curl -I` pós-deploy nos três endpoints
- [ ] T05 Atualizar `backend/README.md` (seção de variáveis de ambiente) documentando `ENVIRONMENT`
- [ ] T06 Adicionar em `backend/README.md` uma seção curta "Documentação da API" explicando que Swagger/ReDoc/OpenAPI ficam em `http://localhost:8000/docs` (`/redoc`, `/openapi.json`) ao rodar local (sem `ENVIRONMENT=production`), e por que ficam fechados em produção; linkar essa seção a partir do `README.md` raiz

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado (`pytest --cov` no trecho alterado de `backend/app/main.py`)
- [ ] Build/lint limpo (`ruff check`, `black --check`)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado acima (404 condicional aos três endpoints de docs)
- [ ] Sem chave de API/secret exposto (client bundle ou repo) — `ENVIRONMENT` não é segredo, mas confirmar que nenhuma outra variável vazou no processo
- [ ] Documentação atualizada — `backend/.env.example` e `backend/README.md` (variável `ENVIRONMENT` + seção "Documentação da API" de como acessar Swagger localmente); `README.md` raiz linkando essa seção
- [ ] Deploy/preview verificado — `curl -I` real em produção (Render) pós-deploy, nos três endpoints
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
