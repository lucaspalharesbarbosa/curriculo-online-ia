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

- [x] CA-001: Relatório salvo em `docs/qa/QA-NNN-auditoria-seguranca.md` (próximo `NNN` livre) com escopo, método, data e ambiente (local/preview/produção) — [`docs/qa/QA-005-auditoria-seguranca.md`](../../../qa/QA-005-auditoria-seguranca.md)
- [x] CA-002: Achados classificados por severidade (Critical / High / Medium / Low / Info), com evidência (comando, header ausente, CVE, URL) — nenhum Critical; 1 High (nanoid/GHSA-2v37-7h3g-55p8), 2 Medium (docs OpenAPI abertos; headers ausentes), 2 Low (deps dev com CVE; starlette), 2 Info (CORS app-wide adequado ao tamanho da API; segredos confirmados fora do bundle)
- [x] CA-003: Checklist mínimo coberto: (a) headers HTTP no frontend (`next.config` / Vercel) e backend; (b) CORS app-wide vs só `/chat`; (c) `npm audit` + auditoria Python (`pip-audit` ou `safety`); (d) exposição de `/docs`, `/redoc`, `/openapi.json` em produção; (e) segredos no bundle client — os 5 itens cobertos com evidência real (comando + saída) no relatório
- [x] CA-004: Para cada achado Critical/High/Medium, proposta de história filha (título + CA em 1 linha) **ou** justificativa explícita de “aceitar risco” (projeto solo / free tier) — 4 histórias filhas rascunhadas no `PRD-006` (nanoid — High; docs OpenAPI abertos e headers de segurança — Medium; Starlette — Low tratado com atenção elevada); L1 (deps dev) aceito como risco, sem história dedicada
- [x] CA-005: Sem correção de código nesta história, exceto se o autor pedir hot-fix Critical no mesmo PR — default = só auditoria + backlog derivado — nenhum achado Critical; nenhuma correção de código aplicada (`git status` confirma só o relatório QA/story/PRD tocados); decisão documentada explicitamente na seção "CA-005" do relatório

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

- [x] T01 Rodar `npm audit` em `frontend/` e registrar vulnerabilidades relevantes
- [x] T02 [P] Rodar auditoria de deps em `backend/` (`pip-audit` ou `safety`) e registrar
- [x] T03 Checklist headers + CORS + FastAPI docs + bundle (sem secret no client)
- [x] T04 Escrever `docs/qa/QA-NNN-auditoria-seguranca.md` com classificação e propostas de US filhas
- [x] T05 Atualizar `PRD-006` / backlog se nascerem histórias de correção (rascunho de títulos na tabela do PRD)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — N/A (spike sem código de produção, nenhum hot-fix aplicado)
- [x] Build/lint limpo — N/A (sem diff de código; nenhum hot-fix aplicado nesta história)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto no **relatório** (achados do produto podem existir; o review valida método e classificação) — Aprovado, ver `docs/qa/QA-005-auditoria-seguranca.md` e veredito abaixo
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto (client bundle ou repo) — confirmado no CA-003(e)
- [x] Documentação atualizada — relatório QA (`docs/qa/QA-005-auditoria-seguranca.md`) + `docs/qa/README.md` + 4 histórias filhas rascunhadas na tabela do `PRD-006`
- [x] Deploy/preview verificado — N/A (auditoria); smoke de headers em produção documentado no relatório (`curl -I` real contra Vercel e Render)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-15 | `docs/qa/QA-005-auditoria-seguranca.md` — todo achado tem comando/evidência real; classificação justificada; checklist CA-003(a-e) sem item em aberto |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-15 | Método e classificação de severidade validados; nenhum Critical/High de produto tratado como bloqueio do spike (regra do DoD: "achados do produto podem existir"); decisão de não aplicar hot-fix (CA-005) correta — H1 não é Critical |
| PO | `@product-owner` | Done | 2026-08-15 | `docs/qa/QA-005-auditoria-seguranca.md`; CAs e DoD 100% fechados; 4 histórias filhas rascunhadas no `PRD-006` |

**Status:** Done
