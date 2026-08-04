# US-02-03 — Conectar frontend-ci.yml ao lint + build reais

**Fase:** Fase 02 — Setup do projeto
**Épico de origem:** Deploy (`PRD-004-deploy.md`) — ex-US-D01

**Como** desenvolvedor,
**quero** que o CI do frontend rode lint e build de verdade a cada PR,
**para** pegar erro antes do merge, não depois do deploy.

### Critérios de aceite
- [ ] CA-001: `frontend-ci.yml` roda `npm run lint` e `npm run build` do projeto real (pós US-02-01)
- [ ] CA-002: PR com lint/build quebrado falha o check

### Fora de escopo
- Deploy em si (US-03-17)

### Dependências
- US-02-01

### Épico / Prioridade
Deploy — P1

### Tasks
- [ ] T01 Atualizar `.github/workflows/frontend-ci.yml` com lint + build reais

**Status:** Ready for Agent (bloqueada até US-02-01 existir)
