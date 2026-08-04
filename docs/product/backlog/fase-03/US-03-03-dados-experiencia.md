# US-03-03 — Popular seção Experiência Profissional

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Conteúdo (`PRD-001-conteudo.md`) — ex-US-C03

**Como** visitante/recrutador,
**quero** ver o histórico profissional completo com empresa, cargo, período e principais entregas,
**para** avaliar a trajetória e o nível de senioridade do autor.

### Critérios de aceite
- [x] CA-001: `resume.json.experiences` lista as 6 empresas / 7 cargos reais (Engineering Brasil, banco BV, Itaú Unibanco, Shift ×2, Grupo WebPic, WDG Automation), com empresa, cargo, período, localização/modalidade e bullets de entrega (não só tarefa)
- [x] CA-002: cada entrada lista as tecnologias principais do vínculo
- [x] CA-003: ordenado do mais recente para o mais antigo
- [x] CA-004: validado contra o schema de US-03-01

### Fora de escopo
- Renderização visual (US-03-11)

### Dependências
- US-03-01

### Épico / Prioridade
Conteúdo — P2

### Tasks
- [x] T01 Popular `experiences` (6 empresas / 7 cargos) em `frontend/content/resume.json`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
