# US-03-14 — Componente de Projetos/Portfólio

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F07

**Como** visitante,
**quero** ver cards de projetos linkando para os repositórios,
**para** avaliar código real do autor.

### Critérios de aceite
- [ ] CA-001: `ProjectCard.tsx` renderiza `resume.json.projects` (título, descrição, tecnologias, link do repositório)
- [ ] CA-002: `ProjectCard.test.tsx` cobre a renderização

### Fora de escopo
- Dados do `resume.json` (US-03-07 — bloqueada)

### Dependências
- US-03-09, US-03-07 (bloqueada)

### Épico / Prioridade
Frontend — P3

### Tasks
- [ ] T01 Criar `frontend/components/ProjectCard.tsx`
- [ ] T02 [P] Teste `ProjectCard.test.tsx`

**Status:** Draft — componente pode ser implementado com dado mockado; conteúdo real aguarda US-03-07
