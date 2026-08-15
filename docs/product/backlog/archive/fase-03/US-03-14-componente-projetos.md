# US-03-14 — Componente de Projetos/Portfólio

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F07

**Como** visitante,
**quero** ver cards de projetos linkando para os repositórios,
**para** avaliar código real do autor.

### Critérios de aceite
- [x] CA-001: `ProjectCard.tsx` renderiza `resume.json.projects` (título, descrição, tecnologias, link do repositório)
- [x] CA-002: `ProjectCard.test.tsx` cobre a renderização

### Fora de escopo
- Dados do `resume.json` (US-03-07 — bloqueada)

### Dependências
- US-03-09, US-03-07 (bloqueada)

### Épico / Prioridade
Frontend — P3

### Tasks
- [x] T01 Criar `frontend/components/ProjectCard.tsx`
- [x] T02 [P] Teste `ProjectCard.test.tsx`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
