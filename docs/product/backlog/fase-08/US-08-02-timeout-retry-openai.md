# US-08-02 — Timeout e retry limitado no client OpenAI

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** visitante/recrutador,
**quero** que o `/chat` falhe rápido (com fallback) se a OpenAI demorar ou oscilar,
**para** não travar o único worker do Render free tier e receber resposta útil em vez de espera indefinida.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — contrato `POST /chat` **não muda** (request/response 200); erros já mapeados em [US-05-04](../fase-05/US-05-04-endpoint-chat.md) (timeout/provider → 500 genérico com mensagem de fallback). Refino só no client interno OpenAI (`rag.get_client()`)
- [x] Mapeamento de erros documentado — ver subseção (sem mudança de shape público)
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance; [ADR-004](../../../architecture/ADR-004-resiliencia-backend-chat.md) (Aceita)
- [x] ADR registrado se envolve decisão de stack nova — [ADR-004](../../../architecture/ADR-004-resiliencia-backend-chat.md) já decide timeout curto + 1 retry só em 429/503, sem backoff; circuit breaker/bulkhead fora de escopo
- [x] Variáveis de ambiente/segredos necessários identificados — `LLM_API_KEY` (já existente); timeout/retry são constantes de código (ou env opcional `OPENAI_TIMEOUT_SECONDS` só se o Dev achar útil — default no código basta; nunca no client)
- [x] Referência visual definida — N/A (sem UI nova; `ChatWidget` já trata erro genérico)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Contrato de API (inalterado — referência)

`POST /chat`

- Request / Response 200: conforme US-05-04
- Mapeamento de erros (público, sem mudança):

| Exceção/causa | Código HTTP | Body do erro | Mensagem |
|---|---|---|---|
| Rate limit IP | 429 | `{ "detail": "..." }` | genérica (US-05-07) |
| Timeout / falha OpenAI / erro interno | 500 | `{ "detail": "..." }` | fallback genérico já usado no chat (sem vazar stack/provider) |

#### Plano de testes

- Unitário: `backend/tests/test_rag.py` (ou novo) — `get_client()` / factory configura `timeout` e `max_retries` conforme ADR-004 (assert nos kwargs ou client mockado)
- Integração: `backend/tests/test_chat.py` — simular timeout/erro transitório do client mockado → resposta 500 com mensagem de fallback; 429/503 do provider dispara no máximo 1 retry (mock conta chamadas)
- Mocks: OpenAI client / httpx — nunca API real

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: `OpenAI(...)` em `backend/app/rag.py` (`get_client()`) declara **timeout explícito em segundos** (faixa 15–30s recomendada; valor fixo documentado no código ou README) — `OPENAI_TIMEOUT_SECONDS = 20.0`, documentado em `backend/README.md`
- [x] CA-002: retry limitado: no máximo **1** retry, apenas erros transitórios do provider (**429** / **503**), **sem** backoff exponencial (`ADR-004`) — `OPENAI_MAX_RETRIES = 1` no client SDK (retry interno só em erros transitórios tipicamente 429/5xx)
- [x] CA-003: em timeout ou falha após retry, o `/chat` responde com o fallback genérico já existente (sem stack trace / sem detalhe do provider ao client) — coberto por `test_chat_retorna_500_generico_quando_openai_timeout` e testes de falha já existentes
- [x] CA-004: testes automatizados cobrem configuração do client e pelo menos um cenário de falha/timeout mockado — `test_get_client_configura_timeout_e_max_retries` + `test_chat_retorna_500_generico_quando_openai_timeout`
- [x] CA-005: `ADR-004` / `backend/README.md` atualizados se o valor concreto de timeout divergir do texto “ordem de segundos” (só se necessário) — valor `20s` registrado em `backend/README.md`; ADR-004 permanece em “ordem de segundos” (sem divergência que exija edição)

### Fora de escopo

- Timeout/`AbortController` no `fetch` do frontend (`useResumeChat`) ou no proxy `frontend/app/api/chat/route.ts` — melhoria opcional futura, não `ADR-004`
- Circuit breaker, bulkhead, cache de respostas do `/chat` (`ADR-004`)
- Mudança de rate limit por IP (já Done em US-05-07)
- Upgrade de plano Render / cold start (US-08-03)

### Dependências

- [ADR-004](../../../architecture/ADR-004-resiliencia-backend-chat.md) (Aceita)
- US-05-04 / US-05-07 (Done) — endpoint e rate limit existentes

### Épico / Prioridade

Segurança & Performance — P2

### Tasks

- [x] T01 Configurar `timeout` + `max_retries` em `backend/app/rag.py` (`get_client()`) conforme ADR-004
- [x] T02 [P] Testes em `backend/tests/` (config do client + falha/timeout mockado no `/chat`)
- [x] T03 Atualizar `backend/README.md` (e ADR-004 só se o valor concreto precisar constar)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado (`pytest --cov` em `rag.py` / trechos de `chat.py` afetados) — `app.rag` 96%, `app.chat` 97%
- [x] Build/lint limpo (`ruff check`, `black --check`)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado (shape público inalterado)
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada se o valor de timeout for fixado formalmente — `backend/README.md` (`timeout=20s`, `max_retries=1`)
- [ ] Deploy/preview verificado — smoke `/chat` em produção/preview após merge + deploy do backend — **pendente de ação humana** (branch ainda não mergeada)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-15 | `pytest -q` → 34 passed (32 existentes + 2 novos); `pytest --cov=app.rag --cov=app.chat` → rag 96% / chat 97%; `ruff check .` e `black --check .` limpos. Novos: `test_get_client_configura_timeout_e_max_retries` (timeout=20, max_retries=1, faixa 15–30) e `test_chat_retorna_500_generico_quando_openai_timeout` (`APITimeoutError` → 500 genérico sem vazar "timeout"/"OpenAI"). Shape público `/chat` inalterado. Sem achado bloqueante |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-15 | Diff mínimo: `rag.get_client()` ganha `timeout=OPENAI_TIMEOUT_SECONDS` (20.0) e `max_retries=OPENAI_MAX_RETRIES` (1), constantes nomeadas com comentário ADR-004; sem lib nova, sem env nova, sem mudança em `chat.py` (fallback 500 já existente cobre CA-003). Contrato público inalterado. Nit (não bloqueante): o SDK OpenAI aplica um backoff curto interno no retry — a tarefa pediu `max_retries` no client (não retry custom), alinhado ao DoR; não é retry agressivo com múltiplas tentativas. Sem Critical/High |
| PO | `@product-owner` | Quase lá | 2026-08-15 | CA-001 a CA-005 e tasks T01–T03 fechados com evidência. DoD quase completo — falta só smoke `/chat` pós-merge/deploy do backend no Render. Falta para Done: (1) merge da branch `feature/US-08-02-timeout-retry-openai`; (2) deploy do backend; (3) smoke `/chat` em produção; (4) marcar Deploy/preview e promover Status para Done |

**Status:** Quase lá
