# US-03-13 — Componente de Habilidades Técnicas

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F06

**Como** visitante,
**quero** ver as habilidades técnicas agrupadas por categoria,
**para** identificar rapidamente se o perfil casa com a vaga/necessidade.

### Critérios de aceite
- [x] CA-001: `SkillBadge.tsx` (ou `Skills.tsx`) renderiza `resume.json.skills` agrupado por categoria
- [x] CA-002: `Skills.test.tsx` cobre a renderização de ao menos um grupo

### Fora de escopo
- Dados do `resume.json` (US-03-05)

### Dependências
- US-03-09, US-03-05

### Épico / Prioridade
Frontend — P2

### Tasks
- [x] T01 Criar `frontend/components/SkillBadge.tsx`
- [x] T02 [P] Teste `SkillBadge.test.tsx`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
