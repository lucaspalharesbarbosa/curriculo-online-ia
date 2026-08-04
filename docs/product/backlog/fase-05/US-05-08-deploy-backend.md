# US-05-08 — Deploy do backend no Render/Cloud Run

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** Deploy (`PRD-004-deploy.md`) — ex-US-D04

**Como** dono do produto,
**quero** o backend publicado,
**para** o `ChatWidget` conseguir chamar o `/chat` em produção.

### Critérios de aceite
- [ ] CA-001: serviço criado no Render (free tier) ou Cloud Run com Root Directory = `backend/`
- [ ] CA-002: deploy automático a cada push em `main`
- [ ] CA-003: `/health` acessível publicamente

### Fora de escopo
- Configuração de domínio customizado

### Dependências
- US-02-02 (esqueleto mínimo viável para publicar)

### Épico / Prioridade
Deploy — P3

### Tasks
- [ ] T01 Criar serviço no Render/Cloud Run apontando para `backend/`

**Status:** Blocked — aguarda US-02-02
