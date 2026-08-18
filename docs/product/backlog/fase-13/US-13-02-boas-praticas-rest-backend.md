# US-13-02 — Padronizar shape de erro e revisar status codes REST do backend

**Fase:** Fase 13 — Qualidade de Engenharia (continuação)
**Épico de origem:** Qualidade de Engenharia (`PRD-007-qualidade-engenharia.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** um shape de erro consistente e status codes HTTP semanticamente corretos no backend FastAPI,
**para** que qualquer consumidor da API (hoje só o frontend do próprio monorepo) receba respostas de erro previsíveis, e o mapeamento de erros exigido pelo DoR de toda história de endpoint tenha um padrão único a seguir.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — ver subseção "Contrato de API" (altera o endpoint `/chat` existente; `/health` não muda)
- [x] Mapeamento de erros documentado — ver subseção "Contrato de API"
- [x] Modelagem de dados documentada — `N/A`, sem entidade nova
- [x] Plano de testes definido — ver subseção "Plano de testes"
- [x] Épico e dependências identificados — épico Qualidade de Engenharia (`PRD-007`); sem dependência bloqueante de história em aberto
- [x] ADR registrado se envolve decisão de stack nova — `N/A`, usa `@app.exception_handler` nativo do FastAPI, sem lib nova; não é decisão de stack/arquitetura (só padronização de contrato), então não passa por `@arquiteto-ia-senior` (Fase 2 do `@orquestrador` — critérios de "quando executar" não se aplicam: sem lib nova, sem mudança de estrutura do monorepo/fluxo de RAG, sem pedido explícito)
- [x] Variáveis de ambiente/segredos necessários identificados — `N/A`, nenhum segredo novo
- [x] Referência visual definida — `N/A`, sem UI nova
- [x] Protótipo solicitado pelo autor — `N/A`, sem pedido
- [x] Sem dúvida bloqueante — confirmado que o frontend (`frontend/hooks/useResumeChat.ts`) decide a mensagem de erro só pelo `response.status` (`publicErrorMessage`), nunca lê o `detail`/body do erro — mudar o shape do body no backend não quebra o client atual

#### Contrato de API

`POST /chat` (já existe — request e response de sucesso **não mudam**; só a resposta de erro)

- Request: `{ question: string }` (sem alteração)
- Response 200: `{ answer: string }` (sem alteração)
- Response de erro — shape novo, `{ "error": { "code": string, "message": string, "details"?: array } }`, aplicado via `@app.exception_handler(HTTPException)` e `@app.exception_handler(RequestValidationError)` em `backend/app/main.py`, valendo para toda rota (não só `/chat`):

| Exceção/causa | Código HTTP | Body do erro | Mensagem |
|---|---|---|---|
| Rate limit (`_is_rate_limited`) | 429 (sem mudança) | `{ "error": { "code": "rate_limited", "message": "Muitas requisições. Tente novamente em instantes." } }` | já existente, só shape novo |
| `LLM_API_KEY` ausente (config do servidor) | 500 (sem mudança — falha nossa, não do cliente nem de dependência externa) | `{ "error": { "code": "internal_error", "message": "Erro ao gerar resposta. Tente novamente mais tarde." } }` | já existente, só shape novo |
| `OpenAIError` não-auth/rate-limit (provider indisponível/erro de conexão) | **503** (mudança — hoje é 500; reflete que a causa é dependência externa fora do ar, não bug interno) | `{ "error": { "code": "llm_unavailable", "message": "Erro ao gerar resposta. Tente novamente mais tarde." } }` | mensagem pública inalterada, só código HTTP e shape |
| `AuthenticationError`/`RateLimitError` do provider (falha nossa: chave inválida/quota) | 500 (sem mudança — é falha de configuração/conta nossa, não do provider em si) | `{ "error": { "code": "internal_error", "message": "Erro ao gerar resposta. Tente novamente mais tarde." } }` | já existente, só shape novo |
| `RequestValidationError` (Pydantic, ex.: `question` vazio) | 422 (sem mudança) | `{ "error": { "code": "validation_error", "message": "Dados inválidos.", "details": [...] } }` (`details` = payload original do Pydantic, preservado para debug) | novo — hoje é o `{"detail": [...]}` cru do FastAPI |

### Fora de escopo

- Alterar o proxy Next.js (`frontend/app/api/chat/route.ts`) — é encaminhamento transparente (repassa status e body do FastAPI); como o frontend já ignora o body de erro (só olha `status`), não há necessidade de tocar nele nesta história
- Versionamento de API (`/v1/...`) — único consumidor conhecido é o frontend do próprio monorepo; sem custo/benefício até existir consumidor externo real (registrar como possível follow-up se/quando surgir)
- Novos endpoints ou mudança no contrato de sucesso (`request`/`response 200` do `/chat`)
- Mudar o shape de erro dos handlers próprios do Next.js (`route.ts` gera `{ detail: "..." }` em 400/502) — serviço/convenção separados do backend Python, fora do escopo desta frente do `PRD-007` ("boas práticas REST **no backend**")

### Dependências

- Nenhuma história em aberto — independente de `US-13-01`

### Épico / Prioridade

Qualidade de Engenharia — P2

#### Plano de testes

- Unitário: `backend/tests/test_chat.py` — cenário de rate limit (429), `LLM_API_KEY` ausente (500), falha genérica do provider mockada via fixture (503 — cenário novo), validação de `question` vazia (422); todos verificando o shape `{"error": {...}}` da resposta
- Integração: `TestClient` do FastAPI batendo em `/chat` e `/health` de ponta a ponta, LLM mockado (convenção já usada no arquivo)
- Mocks: client OpenAI mockado (como já é hoje em `test_chat.py`) — nunca bate na API real

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: toda resposta de erro do FastAPI (`HTTPException` levantada pelo código do projeto) segue `{"error": {"code": string, "message": string}}` — `app/errors.py` (`http_exception_handler`), validado em `test_chat.py` para 429/500/503
- [x] CA-002: erro de validação do Pydantic (422) segue o mesmo envelope, com os detalhes originais preservados em `error.details` — `test_chat_retorna_422_com_shape_de_erro_padrao_e_detalhes_preservados`
- [x] CA-003: falha do provider de LLM (exceto autenticação/rate limit, já tratados como 500) retorna **503** em vez de 500 — `_http_error_from_openai` em `chat.py`; `test_chat_retorna_503_quando_embeddings_falham_sem_vazar_detalhe_interno`, `test_chat_retorna_503_quando_geracao_falha`, `test_chat_retorna_503_quando_openai_timeout`
- [x] CA-004: `/health` continua respondendo 200 com o mesmo body `{"status": "ok"}` — sem regressão (`test_health_check_returns_ok` continua verde; `/health` não levanta `HTTPException`, não passa pelo handler novo)
- [x] CA-005: suíte de testes do frontend continua verde sem nenhuma alteração relacionada ao consumo do shape de erro — confirma que o novo shape não quebra o client, já que ele decide a mensagem só pelo `status` (`useResumeChat.ts`, inalterado por esta história); `npm test -- --run --coverage` → 71/71 (`ChatWidget.test.tsx` foi removido por decisão própria da `US-13-06`, não por esta história — sua cobertura de `useResumeChat` foi realocada para `hooks/useResumeChat.test.ts`, que já exercita 429/5xx/erro de rede contra o client real)

### Tasks

- [x] T01 Modelos/handlers de erro em módulo novo `backend/app/errors.py` (dict tipado via `_error_response`, mais simples que Pydantic dedicado para o volume de campos)
- [x] T02 [P] `app.add_exception_handler(HTTPException, ...)` registrado via `register_exception_handlers(app)` em `backend/app/main.py` — converte toda `HTTPException` levantada no projeto para o shape `{"error": {...}}`
- [x] T03 [P] `app.add_exception_handler(RequestValidationError, ...)` no mesmo módulo — shape `{"error": {"code": "validation_error", ...}}` com `details` preservado
- [x] T04 Em `backend/app/chat.py`, `_http_error_from_openai` agora retorna 503 no ramo de falha genérica do provider (mantendo 500 para os ramos de auth/rate-limit já existentes)
- [x] T05 [P] Testes novos/atualizados em `backend/tests/test_chat.py` cobrindo os 5 CAs (36 testes, incluindo cenários novos com `AuthenticationError`/`RateLimitError` reais do SDK da OpenAI)
- [x] T06 Rodar a suíte do frontend (`npm test`) sem alterar código, só para confirmar CA-005 (evidência, não mudança) — 71/71 verde

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado pela história (`pytest --cov=app`)
- [ ] Build/lint limpo (`ruff check`, `black --check`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR (tabela de mapeamento de erros acima)
- [ ] Sem chave de API/secret exposto (client bundle ou repo)
- [ ] Documentação atualizada (`backend/README.md`, se descrever o shape de erro hoje; senão registrar o contrato nesta própria história)
- [ ] Deploy/preview verificado — `N/A`, sem UI
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
