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

- [x] CA-001: Relatório em `docs/qa/QA-006-auditoria-performance.md` com scores Lighthouse (Performance, Acessibilidade, Boas práticas, SEO) para **mobile e desktop** na Home (`/`) — produção real (`https://lucas-palhares-cv.vercel.app`): mobile Perf 92/A11y 100/BP 96/SEO 100; desktop Perf 100/A11y 100/BP 100/SEO 100
- [x] CA-002: Achados classificados (1 Medium + 3 Low) com causa provável rastreada até código-fonte ou audit específico do Lighthouse — ver `QA-006`, seção CA-002
- [x] CA-003: Bundle documentado via `next build` real + inspeção de `build-manifest.json`/`index.html` — total ~941 KB raw / ~285 KB gzip carregado por `/`; top offender identificado (chunk de 295,7 KB raw/98,0 KB gzip com `framer-motion` + ícones) — ver `QA-006`, seção CA-003
- [x] CA-004: Cache de assets estáticos revisado com `curl -I` real em produção (headers colados no relatório) — assets hasheados: `Cache-Control: public,max-age=31536000,immutable` + `X-Vercel-Cache: HIT`; HTML: `max-age=0, must-revalidate` + edge cache com `X-Nextjs-Stale-Time: 300` — comportamento padrão já correto, sem ação necessária — ver `QA-006`, seção CA-004
- [x] CA-005: Achado Medium (M1) → história filha [US-08-10](US-08-10-reduzir-payload-js-home.md); achado Low (L1) → história filha [US-08-11](US-08-11-fix-prefetch-download-cv.md); achados Low L2 (agrupado em US-08-10) e L3 (CSS render-blocking) → aceitar risco, justificado em `QA-006`
- [x] CA-006: Sem refactor de UI nesta história — confirmado por `git status` (só `docs/` alterado); nenhum achado foi Critical, então a regra de hot-fix não se aplicou

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

- [X] T01 Lighthouse mobile + desktop na Home (produção ou preview) e anexar scores no relatório
- [X] T02 [P] Revisar bundle (`next build`) e headers/cache de estáticos
- [X] T03 Escrever `docs/qa/QA-006-auditoria-performance.md` com classificação e propostas de US filhas
- [X] T04 Atualizar `PRD-006` se nascerem histórias de correção

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% — N/A (spike sem código, salvo hot-fix; nenhum hot-fix aplicado, sem achado Critical)
- [x] Build/lint limpo — `npm run build` rodado como parte do CA-003 (revisão de bundle), sucesso, `/` gerada como estática
- [x] Review do `@tech-lead-review` sem Critical/High no **método** do relatório — ver Vereditos
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto — só `docs/` alterado, sem código tocado
- [x] Documentação atualizada — `docs/qa/QA-006-auditoria-performance.md` + links em `PRD-006` (histórias filhas US-08-10 e US-08-11)
- [x] Deploy/preview verificado — scores de **produção real** no relatório (Lighthouse contra `https://lucas-palhares-cv.vercel.app`, `curl -I` real em produção para cache)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — Lighthouse mobile (Perf 92/A11y 100/BP 96/SEO 100) e desktop (100/100/100/100) medidos contra produção real, evidência bruta em `lighthouse-mobile.report.json/html` e `lighthouse-desktop.report.json/html` (artefato local, não commitado, mesmo padrão de US-07-06); bundle documentado via `next build` real com tamanhos raw/gzip calculados via `zlib`; cache de estáticos confirmado via `curl -I` real em produção; nenhum item do plano de testes ficou sem resposta | 2026-08-16 | `docs/qa/QA-006-auditoria-performance.md` |
| Tech Lead | `@tech-lead-review` | Aprovar — método da auditoria é reprodutível e verificável (comandos reais, não estimativas); causa raiz do achado L1 rastreada até linha exata do código-fonte (`ResumeSidebar.tsx:216-217`, `MobileHero.tsx:161-163`) antes de propor a história filha, evitando proposta vaga; nenhum refactor de UI aplicado (CA-006 respeitado, confirmado por `git status`); duas histórias filhas (US-08-10, US-08-11) com DoR próprio fechado e CA testável, prontas para `Ready for Agent`. Sem achado Critical/High no método | 2026-08-16 | `docs/qa/QA-006-auditoria-performance.md`, `US-08-10`, `US-08-11` |
| PO | `@product-owner` | Done — CA-001 a CA-006 fechados com evidência real, sem nenhum dado fabricado; diferente de outras histórias da Fase 08, esta teve acesso real a produção (site público, sem gate de autenticação como o painel do Render), então nenhum CA ficou bloqueado por limitação de ambiente. Achado Medium (M1) e achado Low com causa raiz trivial (L1) viraram histórias filhas (US-08-10, US-08-11); achados Low restantes (L2 agrupado, L3) com "aceitar risco" justificado. `PRD-006` atualizado com as duas histórias filhas e DoR do épico fechado para este spike | 2026-08-16 | `docs/qa/QA-006-auditoria-performance.md`, `PRD-006` |

**Status:** Done
