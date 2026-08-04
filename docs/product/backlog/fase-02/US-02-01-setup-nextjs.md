# US-02-01 — Setup do projeto Next.js (TS + Tailwind)

**Fase:** Fase 02 — Setup do projeto
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F01

**Como** desenvolvedor,
**quero** o esqueleto do projeto Next.js com TypeScript e Tailwind configurado em `frontend/`,
**para** ter uma base para implementar os componentes das seções.

### DoR (antes de iniciar)

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (história de setup, sem endpoint novo)
- [x] Modelagem de dados documentada — N/A (sem entidade nova; `content/resume.json` placeholder)
- [x] Plano de testes definido — Vitest + Testing Library: renderização da home (`app/page.test.tsx`)
- [x] Épico e dependências identificados — Frontend, sem dependências
- [x] ADR registrado se envolve decisão de stack nova — N/A (stack em `ADR-001`)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A nesta história
- [x] Referência visual definida — N/A (esqueleto default do `create-next-app`)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `app/page.test.tsx` — heading principal renderiza
- Integração: N/A
- Mocks necessários: N/A

### Critérios de aceite

- [x] CA-001: `npx create-next-app` (App Router, TS, Tailwind) rodando em `frontend/`
- [x] CA-002: ESLint + Prettier configurados
- [x] CA-003: `frontend-ci.yml` (esqueleto criado na Fase 00) passa a rodar lint + build de verdade
- [x] CA-004: `npm run dev` sobe a aplicação localmente

### Fora de escopo

- Componentes de seção (US-03-10 em diante)

### Dependências

- Nenhuma

### Épico / Prioridade

Frontend — P1

### Tasks

- [x] T01 `npx create-next-app` em `frontend/` (TS + Tailwind + App Router)
- [x] T02 [P] Configurar ESLint + Prettier
- [x] T03 Conectar `frontend-ci.yml` ao lint + build reais

### DoD (antes de concluir)

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — 100% em `app/page.tsx` (`npm test -- --run --coverage`)
- [x] Build/lint limpo (`npm run lint`, `npm run format`, `npm run build`)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — `frontend/README.md`
- [x] Deploy/preview verificado — N/A (esqueleto; deploy na Fase 03)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-04 | `npm run lint`, `npm run format`, `npm test -- --run --coverage` (100% em `page.tsx`), `npm run build` — todos passando |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-04 | Setup enxuto, ESLint+Prettier integrados, teste colocado, sem secrets |
| PO | `@product-owner` | Done | 2026-08-04 | Critérios de aceite e DoD 100% fechados |

**Status:** Done
