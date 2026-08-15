# US-03-04 — Popular seção Formação Acadêmica

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Conteúdo (`PRD-001-conteudo.md`) — ex-US-C04

**Como** visitante/recrutador,
**quero** ver a formação acadêmica do autor,
**para** completar o entendimento da trajetória.

### Critérios de aceite
- [x] CA-001: `resume.json.education` lista as 3 instituições reais (Centro Universitário Senac, Fatec Rio Preto, Etec Philadelpho Gouvêa Netto) com curso e período
- [x] CA-002: validado contra o schema de US-03-01

### Fora de escopo
- Renderização visual (US-03-12)

### Dependências
- US-03-01

### Épico / Prioridade
Conteúdo — P2

### Tasks
- [x] T01 Popular `education` (3 instituições) em `frontend/content/resume.json`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
