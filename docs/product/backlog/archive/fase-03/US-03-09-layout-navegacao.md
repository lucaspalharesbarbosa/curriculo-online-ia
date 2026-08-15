# US-03-09 — Layout base e navegação entre seções

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F02

**Como** visitante,
**quero** navegar entre as seções do currículo em uma página única,
**para** encontrar rapidamente a informação que procuro sem recarregar a página.

### Critérios de aceite
- [x] CA-001: layout com header/nav fixo linkando para as âncoras de cada seção (Sobre, Experiência, Formação, Skills, Certificações, Projetos, Contato)
- [x] CA-002: scroll suave entre seções
- [x] CA-003: responsivo (mobile e desktop)

### Fora de escopo
- Conteúdo das seções em si

### Dependências
- US-02-01

### Épico / Prioridade
Frontend — P1

### Tasks
- [x] T01 Criar `frontend/app/layout.tsx` com header/nav de âncoras

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
