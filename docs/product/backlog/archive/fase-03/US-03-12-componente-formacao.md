# US-03-12 — Componente de Formação Acadêmica

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F05

**Como** visitante,
**quero** ver a formação acadêmica do autor,
**para** completar o entendimento da trajetória.

### Critérios de aceite
- [x] CA-001: `Education.tsx` renderiza `resume.json.education` (instituição, curso, período)
- [x] CA-002: `Education.test.tsx` cobre a renderização

### Fora de escopo
- Dados do `resume.json` (US-03-04)

### Dependências
- US-03-09, US-03-04

### Épico / Prioridade
Frontend — P2

### Tasks
- [x] T01 Criar `frontend/components/Education.tsx`
- [x] T02 [P] Teste `Education.test.tsx`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
