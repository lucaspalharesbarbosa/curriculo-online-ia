# US-03-06 — Popular seção Certificações

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Conteúdo (`PRD-001-conteudo.md`) — ex-US-C06

**Como** visitante/recrutador,
**quero** ver as certificações do autor com validade,
**para** confirmar qualificações formais.

### Critérios de aceite
- [x] CA-001: `resume.json.certifications` contém AWS Certified Cloud Practitioner (emissor, data de emissão jul/2024, expiração jul/2027)
- [x] CA-002: validado contra o schema de US-03-01

### Fora de escopo
- Renderização visual (US-03-15)

### Dependências
- US-03-01

### Épico / Prioridade
Conteúdo — P2

### Tasks
- [x] T01 Popular `certifications` em `frontend/content/resume.json`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
