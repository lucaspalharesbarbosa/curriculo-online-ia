# US-01-02 — ADR da stack inicial + diagrama C4 de contexto/containers

**Fase:** Fase 01 — Descoberta e planejamento
**Área de origem:** Arquitetura — retroativa, registrada após a conclusão

**Como** arquiteto do projeto,
**quero** a stack (Next.js/TS/Tailwind + Python/FastAPI, monorepo) registrada em ADR e o diagrama C4 de contexto/containers documentado,
**para** que a decisão de arquitetura fique auditável e não seja reaberta a cada história.

### Critérios de aceite
- [x] CA-001: `ADR-001-stack-inicial-monorepo.md` registra a decisão de stack e monorepo, com consequências e alternativas consideradas
- [x] CA-002: `C4-001-contexto-containers.md` cobre os níveis Contexto (L1) e Containers (L2)
- [x] CA-003: níveis L3/L4 (Component, Sequence, Deployment) explicitamente adiados para quando a Fase 05 (RAG) entrar em execução

### Fora de escopo
- PRD e backlog (US-01-01)
- ADR do fluxo de RAG (US-05-01)

### Dependências
- Nenhuma

### Área / Prioridade
Arquitetura — P0

### Tasks
- [x] T01 Criar `ADR-001-stack-inicial-monorepo.md`
- [x] T02 Criar `C4-001-contexto-containers.md` (L1/L2)

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | N/A — artefato de arquitetura (ADR, diagrama C4), sem código a testar | 2026-08-04 | — |
| Tech Lead | `@tech-lead-review` | N/A — decisão de stack/arquitetura registrada em `ADR-001`, não em diff de código | 2026-08-04 | — |
| PO | `@product-owner` | Done | 2026-08-04 | Registro retroativo — trabalho concluído antes da formalização da tabela Vereditos; auditado e documentado nesta data |

**Status:** Done
