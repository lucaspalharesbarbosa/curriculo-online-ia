# US-03-02 — Popular seção Hero/Sobre

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Conteúdo (`PRD-001-conteudo.md`) — ex-US-C02

**Como** visitante/recrutador,
**quero** ver rapidamente quem é o autor e seu posicionamento profissional,
**para** entender em segundos se o perfil é relevante para o que procuro.

### Critérios de aceite
- [x] CA-001: `resume.json.hero` contém nome, título/cargo-alvo e resumo curto (2-3 frases) — conteúdo real em `docs/product/PRD-001-conteudo.md`
- [x] CA-002: `resume.json.about` contém o resumo longo real (parágrafo de "Sobre")
- [x] CA-003: validado contra o schema de US-03-01

### Fora de escopo
- Renderização visual (US-03-10)

### Dependências
- US-03-01

### Épico / Prioridade
Conteúdo — P2

### Tasks
- [x] T01 Popular `hero` e `about` em `frontend/content/resume.json`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
