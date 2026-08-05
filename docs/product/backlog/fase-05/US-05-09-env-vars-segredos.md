# US-05-09 — Documentar variáveis de ambiente / segredos

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** Deploy (`PRD-004-deploy.md`) — ex-US-D05

**Como** desenvolvedor,
**quero** um `.env.example` e documentação de quais segredos existem,
**para** nunca expor chave de API no client e facilitar setup local.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (história de documentação, sem endpoint)
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Deploy; depende de US-05-07 (ainda não implementada) para a lista final de variáveis (`ALLOWED_ORIGIN` e eventual config de rate limit); `LLM_API_KEY` ([ADR-003](../../../architecture/ADR-003-fluxo-rag.md) seção 5) e `NEXT_PUBLIC_API_URL` (US-05-05) já podem ser adiantadas — DoR fechado agora para não travar o início
- [x] ADR registrado se envolve decisão de stack nova — N/A
- [x] Variáveis de ambiente/segredos necessários identificados — lista consolidada nesta própria história: `LLM_API_KEY` (backend, ADR-003 §5), `ALLOWED_ORIGIN` (backend, US-05-07), `NEXT_PUBLIC_API_URL` (frontend, US-05-05); `NEXT_PUBLIC_SITE_URL` já documentada fora da Fase 05
- [x] Referência visual definida — N/A (sem UI)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Smoke manual (obrigatório para aceite): `.env.example` não contém nenhum valor real de chave; README aponta corretamente onde configurar cada variável no painel do Render (backend) e da Vercel (frontend)
- Unitário/integração: N/A (documentação)
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done
- [ ] CA-001: `.env.example` no backend lista as variáveis necessárias (sem valores reais)
- [ ] CA-002: README documenta onde configurar os segredos em produção (Vercel/Render)

### Fora de escopo
- Rotação de segredos automatizada

### Dependências
- US-05-07 (segurança do `/chat` define quais segredos existem)

### Épico / Prioridade
Deploy — P3

### Tasks
- [ ] T01 Criar `backend/.env.example`
- [ ] T02 [P] Documentar segredos no README

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — N/A (documentação, sem código)
- [ ] Build/lint limpo — N/A
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto (confirmar que `.env.example` não vaza valor real)
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [ ] Sem chave de API/secret exposto — checagem central desta história
- [ ] Documentação atualizada — é o próprio entregável
- [ ] Deploy/preview verificado — N/A
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Blocked — aguarda US-05-07 (implementação). DoR fechado em 2026-08-04; pronta para "Ready for Agent" assim que US-05-07 concluir.
