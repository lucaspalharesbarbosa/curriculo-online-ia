# US-03-05 — Popular seção Habilidades Técnicas

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Conteúdo (`PRD-001-conteudo.md`) — ex-US-C05

**Como** visitante/recrutador,
**quero** ver as habilidades técnicas do autor agrupadas por categoria,
**para** identificar rapidamente se o perfil casa com a vaga/necessidade.

### Critérios de aceite
- [x] CA-001: `resume.json.skills` agrupa por categoria (linguagens, frameworks, cloud/infra, dados/mensageria, CI/CD, arquitetura/práticas, AI Engineering, testes, legado, liderança) — grupos e itens reais em `docs/product/PRD-001-conteudo.md`
- [x] CA-002: validado contra o schema de US-03-01

### Fora de escopo
- Renderização visual (US-03-13)

### Dependências
- US-03-01

### Épico / Prioridade
Conteúdo — P2

### Tasks
- [x] T01 Popular `skills` (agrupado) em `frontend/content/resume.json`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
