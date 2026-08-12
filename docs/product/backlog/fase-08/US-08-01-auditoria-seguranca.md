# US-08-01 — Auditoria de segurança (spike)

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** dono do produto,
**quero** uma auditoria formal da superfície de segurança (headers, CORS, dependências, exposição de docs),
**para** classificar achados por severidade e só então abrir histórias de correção verificáveis — sem “melhorar segurança” sem critério.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (spike de auditoria; não cria/altera endpoint)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance (`PRD-006`); baseline Fase 5: [US-05-07](../fase-05/US-05-07-seguranca-chat.md), [US-05-09](../fase-05/US-05-09-env-vars-segredos.md)
- [x] ADR registrado se envolve decisão de stack nova — N/A (auditoria; libs de correção nascem em histórias filhas se o achado exigir)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A para o spike (não adiciona env); revisar se `LLM_API_KEY` / `ALLOWED_ORIGIN` / `API_URL` aparecem no client bundle
- [x] Referência visual definida — N/A (sem UI)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário/integração: N/A no spike — evidência = relatório com comandos e resultados (`npm audit`, `pip-audit` ou equivalente, checklist de headers/CORS/docs)
- Manual: smoke de headers na Home (produção ou preview) e preflight CORS já coberto por `backend/tests/test_main.py` como baseline
- Mocks: nenhum

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: Relatório salvo em `docs/qa/QA-NNN-auditoria-seguranca.md` (próximo `NNN` livre) com escopo, método, data e ambiente (local/preview/produção)
- [ ] CA-002: Achados classificados por severidade (Critical / High / Medium / Low / Info), com evidência (comando, header ausente, CVE, URL)
- [ ] CA-003: Checklist mínimo coberto: (a) headers HTTP no frontend (`next.config` / Vercel) e backend; (b) CORS app-wide vs só `/chat`; (c) `npm audit` + auditoria Python (`pip-audit` ou `safety`); (d) exposição de `/docs`, `/redoc`, `/openapi.json` em produção; (e) segredos no bundle client
- [ ] CA-004: Para cada achado Critical/High/Medium, proposta de história filha (título + CA em 1 linha) **ou** justificativa explícita de “aceitar risco” (projeto solo / free tier)
- [ ] CA-005: Sem correção de código nesta história, exceto se o autor pedir hot-fix Critical no mesmo PR — default = só auditoria + backlog derivado

### Fora de escopo

- Implementar CSP/HSTS/headers (vira US filha se o relatório exigir)
- WAF/CDN dedicado
- Migrar hospedagem (`ADR-002`)
- Correções de performance (US-08-04) ou timeout OpenAI (US-08-02)

### Dependências

- Nenhuma bloqueante (site já em produção)
- Baseline: US-05-07 (CORS + rate limit), US-05-09 (env/segredos)

### Épico / Prioridade

Segurança & Performance — P1

### Tasks

- [ ] T01 Rodar `npm audit` em `frontend/` e registrar vulnerabilidades relevantes
- [ ] T02 [P] Rodar auditoria de deps em `backend/` (`pip-audit` ou `safety`) e registrar
- [ ] T03 Checklist headers + CORS + FastAPI docs + bundle (sem secret no client)
- [ ] T04 Escrever `docs/qa/QA-NNN-auditoria-seguranca.md` com classificação e propostas de US filhas
- [ ] T05 Atualizar `PRD-006` / backlog se nascerem histórias de correção (rascunho de títulos na tabela do PRD)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — N/A (spike sem código de produção, salvo hot-fix Critical pedido)
- [ ] Build/lint limpo — N/A se sem diff de código; se houver hot-fix, `npm run build` / `ruff check` no escopo tocado
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto no **relatório** (achados do produto podem existir; o review valida método e classificação)
- [ ] Contrato de API — N/A
- [ ] Sem chave de API/secret exposto (client bundle ou repo) — confirmado no CA-003(e)
- [ ] Documentação atualizada — relatório QA + links no `PRD-006` se US filhas forem criadas
- [ ] Deploy/preview verificado — N/A (auditoria); smoke de headers em produção documentado no relatório
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
