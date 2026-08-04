# US-02-04 — Conectar backend-ci.yml ao lint + testes reais

**Fase:** Fase 02 — Setup do projeto
**Épico de origem:** Deploy (`PRD-004-deploy.md`) — ex-US-D02

**Como** desenvolvedor,
**quero** que o CI do backend rode lint e testes de verdade a cada PR,
**para** pegar erro antes do merge.

### Critérios de aceite
- [ ] CA-001: `backend-ci.yml` roda ruff/black e `pytest` do projeto real (pós US-02-02)
- [ ] CA-002: PR com lint/teste quebrado falha o check

### Fora de escopo
- Deploy em si (US-05-08)

### Dependências
- US-02-02

### Épico / Prioridade
Deploy — P1

### Tasks
- [ ] T01 Atualizar `.github/workflows/backend-ci.yml` com lint + testes reais

**Status:** Ready for Agent (bloqueada até US-02-02 existir)
