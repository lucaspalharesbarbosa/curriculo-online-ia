# US-08-04 — Auditoria de performance (spike)

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** visitante/recrutador,
**quero** que o site tenha orçamento de performance medido (Lighthouse, bundle, cache),
**para** que melhorias nasçam de achados reais — não de otimização infinita.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (spike)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance (`PRD-006`); baseline Lighthouse produção já citado na Fase 07 (US-07-06 — Perf ~66 com trade-off de motion)
- [x] ADR registrado se envolve decisão de stack nova — N/A (auditoria; libs novas só em US filhas se o achado exigir)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — N/A (sem UI nova)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante — escopo Lighthouse = rota `/` (única page App Router hoje); seções âncora não são URLs separadas

#### Plano de testes

- Evidência: relatório Lighthouse (mobile + desktop) em produção ou preview + notas de bundle (`next build` / analyzer se útil) + cache de estáticos
- Unitário: N/A no spike
- Mocks: nenhum

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: Relatório em `docs/qa/QA-NNN-auditoria-performance.md` com scores Lighthouse (Performance, Acessibilidade, Boas práticas, SEO) para **mobile e desktop** na Home (`/`) — produção preferencial (`https://lucas-palhares-cv.vercel.app`)
- [ ] CA-002: Achados classificados (Critical/High/Medium/Low/Info) com causa provável (JS, imagens, fonts, motion, cache, TTFB do chat/proxy se aplicável)
- [ ] CA-003: Bundle: tamanho relativo do client JS da Home documentado (`next build` ou ferramenta equivalente) — top offenders se disponíveis
- [ ] CA-004: Cache de assets estáticos (headers Vercel/Next) revisado em 1 parágrafo no relatório (hit/miss ou headers observados)
- [ ] CA-005: Para cada achado Critical/High/Medium: proposta de US filha **ou** “aceitar risco” (ex.: trade-off de motion já aceito na US-07-06)
- [ ] CA-006: Sem refactor de UI nesta história (só auditoria + backlog derivado), salvo hot-fix Critical pedido pelo autor

### Fora de escopo

- Redesign visual / Chat v2 (`PRD-009`)
- Mitigação de cold start do Render (US-08-03) — correlato, mas história separada
- Meta arbitrária “100 no Lighthouse” sem achado priorizado

### Dependências

- Site em produção (Fase 3/7 Done)
- Referência histórica: US-07-06 (Perf 66 — trade-off motion)

### Épico / Prioridade

Segurança & Performance — P2

### Tasks

- [ ] T01 Lighthouse mobile + desktop na Home (produção ou preview) e anexar scores no relatório
- [ ] T02 [P] Revisar bundle (`next build`) e headers/cache de estáticos
- [ ] T03 Escrever `docs/qa/QA-NNN-auditoria-performance.md` com classificação e propostas de US filhas
- [ ] T04 Atualizar `PRD-006` se nascerem histórias de correção

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% — N/A (spike sem código, salvo hot-fix)
- [ ] Build/lint limpo — N/A se sem diff de app
- [ ] Review do `@tech-lead-review` sem Critical/High no **método** do relatório
- [ ] Contrato de API — N/A
- [ ] Sem chave de API/secret exposto
- [ ] Documentação atualizada — relatório QA + links no PRD se US filhas
- [ ] Deploy/preview verificado — scores de produção/preview no relatório
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
