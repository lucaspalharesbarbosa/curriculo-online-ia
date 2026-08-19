# US-11-04 — Feedback do usuário na resposta (útil / não útil)

**Fase:** Fase 11 — Chat v2 + RAG Inteligente
**Épico de origem:** Chat v2 (`PRD-009-chat-v2.md`)

**Como** visitante/recrutador,
**quero** avaliar se a resposta do assistente foi útil (👍/👎),
**para** dar um sinal de qualidade sobre o assistente ao autor.

### Decisão de escopo (PO)

`PRD-009` já registrava o risco de que feedback de visitante seria o primeiro dado persistido pelo backend — mesma dependência de decisão de persistência levantada em `PRD-005`/`PRD-010` (Fase 12, hoje bloqueada por ADRs de auth/persistência de métricas ainda não tomados). Para não acoplar esta história P3 a essa decisão maior, o PO escopa o feedback como **log estruturado no backend, sem persistência em banco/arquivo por visitante** — não há dashboard, não há histórico consultável (isso é `PRD-010`, quando destravado). Reavaliar persistência de verdade quando a Fase 12 acontecer.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado (ver subseção abaixo)
- [x] Mapeamento de erros documentado (ver subseção abaixo)
- [x] Modelagem de dados documentada — N/A, sem persistência (só log)
- [x] Plano de testes definido (ver subseção abaixo)
- [x] Épico e dependências identificados — Chat v2 (`PRD-009`); nenhuma dependência
- [x] ADR registrado se envolve decisão de stack nova — N/A, sem lib/serviço novo (log usa `logging` já em uso no backend)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — botões 👍/👎 discretos abaixo de cada resposta do assistente
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Contrato de API

`POST /chat/feedback`
- Request: `{ question: string, answer: string, rating: "up" | "down" }`
- Response 200: `{ ok: true }` — sempre 200 quando o request é válido, mesmo se o log falhar internamente (fire-and-forget, não deve quebrar a UX do chat)
- Mapeamento de erros:

| Exceção/causa | Código HTTP | Body do erro | Mensagem |
|---|---|---|---|
| `ValidationError` (Pydantic) — `rating` fora de `"up"`/`"down"` ou campos ausentes | 422 | `{ "detail": [...] }` | erro padrão do FastAPI |
| Falha ao registrar o log (interna) | 200 | `{ "ok": true }` | falha é só logada no servidor (`logger.error`), nunca propagada ao client |

#### Plano de testes

- Unitário/integração: `backend/tests/test_chat.py` (ou arquivo próprio) — request válido loga e retorna `ok: true`; request inválido retorna 422; falha simulada no logger não quebra a resposta
- Frontend: componente de chat — clique em 👍/👎 dispara a chamada, estado do botão reflete o voto
- Mocks necessários: mock da chamada ao `/chat/feedback` no teste do componente; mock do logger no teste do backend

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: usuário pode marcar 👍 ou 👎 em cada resposta do assistente
- [x] CA-002: feedback é registrado em log estruturado do backend (sem persistência em banco/arquivo por visitante), sem expor dado sensível
- [x] CA-003: falha ao registrar feedback não impede a conversa de continuar nem quebra a resposta da UI

### Fora de escopo
- Dashboard/consulta de feedback (Fase 12, `PRD-010`)
- Persistência em banco de dados

### Dependências
- Nenhuma

### Épico / Prioridade
Chat v2 (`PRD-009`) — P3

### Tasks
- [x] T01 Endpoint `POST /chat/feedback` em `backend/app/chat.py` (ou módulo próprio), com log estruturado
- [x] T02 [P] Botões 👍/👎 no componente de chat em `frontend/components/`
- [x] T03 Testes de backend (request válido/inválido, falha de log) e de frontend (clique, estado do botão)

Implementação: `ChatFeedbackRequest`/`ChatFeedbackResponse` (Pydantic) + `POST /chat/feedback` em `chat.py`, logando só `rating`/tamanho de pergunta e resposta (nunca o texto completo) via `logger.info`, com `try/except` para nunca propagar falha de log ao client. Proxy same-origin novo em `frontend/app/api/chat/feedback/route.ts` (mesmo padrão do `/api/chat`). `useResumeChat.sendFeedback()` marca o voto otimisticamente e dispara a chamada fire-and-forget; `RagChatPanel.tsx` ganhou os botões 👍/👎 (`aria-pressed` refletindo o voto) abaixo de cada resposta concluída do assistente.

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado pela história (`pytest --cov` → `chat.py` 100%; `npm test -- --coverage` → `useResumeChat.ts` 100%, `RagChatPanel.tsx` 87.5%)
- [x] Build/lint limpo (`ruff check`, `npm run build`, ESLint, `tsc --noEmit` — todos limpos)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A
- [ ] Deploy/preview verificado (Vercel preview + backend do PR) — pendente do merge/PR (Fase 6)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — falta linha do PO (Fase 6)
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-18 | `POST /chat/feedback` revisado: loga só `rating`+tamanhos (nunca texto completo), sempre 200 mesmo com falha de log (`try/except`), `rating` fora de `up`/`down` rejeitado pelo Pydantic (422). Frontend: `sendFeedback` otimista + fire-and-forget, botões 👍/👎 com `aria-pressed` refletindo o voto. Nenhuma persistência em banco/arquivo confirmada — escopo respeitado |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-18 | `POST /chat/feedback` herda o shape de erro padrão (`errors.py`/US-13-02) automaticamente via `register_exception_handlers`, sem código extra; `frontend/app/api/chat/feedback/route.ts` replica exatamente o padrão de proxy same-origin do `/api/chat` existente. Sem Critical/High |
| PO | `@product-owner` | Quase lá | 2026-08-18 | CA 100% fechados, QA/Tech Lead aprovaram; falta só "Deploy/preview verificado" — sem commit/PR aberto ainda nesta fase. Fecha Done assim que o preview da Vercel existir |

**Status:** Quase lá — falta preview real do PR para fechar Done
