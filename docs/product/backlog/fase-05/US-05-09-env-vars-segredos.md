# US-05-09 — Documentar variáveis de ambiente / segredos

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** Deploy (`PRD-004-deploy.md`) — ex-US-D05

**Como** desenvolvedor,
**quero** um `.env.example` e documentação de quais segredos existem,
**para** nunca expor chave de API no client e facilitar setup local.

### Critérios de aceite
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

**Status:** Blocked — aguarda US-05-07
