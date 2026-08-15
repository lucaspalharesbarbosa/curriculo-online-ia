# US-01-01 — PRD e backlog inicial dos 4 épicos

**Fase:** Fase 01 — Descoberta e planejamento
**Área de origem:** Product Owner (não amarrada a um único épico — cobre os 4) — retroativa, registrada após a conclusão

**Como** product owner do projeto,
**quero** o PRD e o backlog inicial dos 4 épicos (Conteúdo, Frontend, RAG, Deploy) registrados,
**para** ter escopo, critérios de aceite e prioridade claros antes de iniciar a implementação.

### Critérios de aceite
- [x] CA-001: `PRD-001-conteudo.md`, `PRD-002-frontend.md`, `PRD-003-rag.md`, `PRD-004-deploy.md` criados em `docs/product/`
- [x] CA-002: backlog inicial com todas as histórias derivadas dos 4 PRDs, organizado por fase de implementação em `docs/product/backlog/fase-NN/`
- [x] CA-003: riscos e pendências (dados de Projetos/Portfólio, confirmação de e-mail/GitHub) identificados nos PRDs

### Fora de escopo
- ADR de stack e diagramas C4 (US-01-02)
- Implementação de qualquer história (fases 02 em diante)

### Dependências
- Nenhuma

### Área / Prioridade
Product Owner — P0

### Tasks
- [x] T01 Criar os 4 PRDs em `docs/product/`
- [x] T02 Decompor o backlog inicial por fase de implementação

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | N/A — artefato de descoberta/planejamento (PRD, backlog), sem código a testar | 2026-08-04 | — |
| Tech Lead | `@tech-lead-review` | N/A — sem diff de código de produto | 2026-08-04 | — |
| PO | `@product-owner` | Done | 2026-08-04 | Registro retroativo — trabalho concluído antes da formalização da tabela Vereditos; auditado e documentado nesta data |

**Status:** Done
