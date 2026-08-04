# US-02-01 — Setup do projeto Next.js (TS + Tailwind)

**Fase:** Fase 02 — Setup do projeto
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F01

**Como** desenvolvedor,
**quero** o esqueleto do projeto Next.js com TypeScript e Tailwind configurado em `frontend/`,
**para** ter uma base para implementar os componentes das seções.

### Critérios de aceite
- [ ] CA-001: `npx create-next-app` (App Router, TS, Tailwind) rodando em `frontend/`
- [ ] CA-002: ESLint + Prettier configurados
- [ ] CA-003: `frontend-ci.yml` (esqueleto criado na Fase 00) passa a rodar lint + build de verdade
- [ ] CA-004: `npm run dev` sobe a aplicação localmente

### Fora de escopo
- Componentes de seção (US-03-10 em diante)

### Dependências
- Nenhuma

### Épico / Prioridade
Frontend — P1

### Tasks
- [ ] T01 `npx create-next-app` em `frontend/` (TS + Tailwind + App Router)
- [ ] T02 [P] Configurar ESLint + Prettier
- [ ] T03 Conectar `frontend-ci.yml` ao lint + build reais

**Status:** Ready for Agent
