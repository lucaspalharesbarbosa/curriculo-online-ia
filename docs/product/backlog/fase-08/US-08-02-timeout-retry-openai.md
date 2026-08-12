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

- [ ] CA-001: `OpenAI(...)` em `backend/app/rag.py` (`get_client()`) declara **timeout explícito em segundos** (faixa 15–30s recomendada; valor fixo documentado no código ou README) — não usa o default de minutos do SDK
- [ ] CA-002: retry limitado: no máximo **1** retry, apenas erros transitórios do provider (**429** / **503**), **sem** backoff exponencial (`ADR-004`)
- [ ] CA-003: em timeout ou falha após retry, o `/chat` responde com o fallback genérico já existente (sem stack trace / sem detalhe do provider ao client)
- [ ] CA-004: testes automatizados cobrem configuração do client e pelo menos um cenário de falha/timeout mockado
- [ ] CA-005: `ADR-004` / `backend/README.md` atualizados se o valor concreto de timeout divergir do texto “ordem de segundos” (só se necessário)

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

- [ ] T01 Configurar `timeout` + `max_retries` em `backend/app/rag.py` (`get_client()`) conforme ADR-004
- [ ] T02 [P] Testes em `backend/tests/` (config do client + falha/timeout mockado no `/chat`)
- [ ] T03 Atualizar `backend/README.md` (e ADR-004 só se o valor concreto precisar constar)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado (`pytest --cov` em `rag.py` / trechos de `chat.py` afetados)
- [ ] Build/lint limpo (`ruff check`, `black --check`)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado (shape público inalterado)
- [ ] Sem chave de API/secret exposto
- [ ] Documentação atualizada se o valor de timeout for fixado formalmente
- [ ] Deploy/preview verificado — smoke `/chat` em preview/produção após deploy do backend (ou nota se só merge pending)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
