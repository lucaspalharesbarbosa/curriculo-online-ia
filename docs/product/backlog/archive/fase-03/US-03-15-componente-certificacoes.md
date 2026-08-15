# US-03-15 — Componente de Certificações

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F08

**Como** visitante,
**quero** ver as certificações do autor com validade,
**para** confirmar qualificações formais.

### Critérios de aceite
- [x] CA-001: `Certifications.tsx` renderiza `resume.json.certifications` (nome, emissor, emissão, expiração)
- [x] CA-002: `Certifications.test.tsx` cobre a renderização

### Fora de escopo
- Dados do `resume.json` (US-03-06)

### Dependências
- US-03-09, US-03-06

### Épico / Prioridade
Frontend — P2

### Tasks
- [x] T01 Criar `frontend/components/Certifications.tsx`
- [x] T02 [P] Teste `Certifications.test.tsx`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
