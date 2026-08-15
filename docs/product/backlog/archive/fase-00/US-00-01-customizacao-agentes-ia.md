# US-00-01 — Customização e dry-run dos agentes de IA

**Fase:** Fase 00 — Preparação
**Área de origem:** Processo/agentes (não amarrada a um épico de produto) — retroativa, registrada após a conclusão

**Como** responsável técnico do projeto,
**quero** os agentes de IA (`product-owner`, `arquiteto-ia-senior`, `senior-developer`, `qa-engineer`, `tech-lead-review`, `orquestrador`, agentes de Git) customizados com o contexto real deste projeto e validados por um dry-run,
**para** que o pipeline de agentes produza saída específica deste projeto (não genérica) desde a primeira feature real.

### Critérios de aceite
- [x] CA-001: `docs/agents/CONTEXTO-PROJETO.md` criado com stack, branching, hospedagem e convenções
- [x] CA-002: cada agente ajustado conforme checklist de customização definido no planejamento inicial do projeto
- [x] CA-003: dry-run do pipeline completo executado numa tarefa fake e pequena
- [x] CA-004: desvios encontrados no dry-run corrigidos antes de seguir para features reais

### Fora de escopo
- Estrutura do repositório em si (US-00-02)

### Dependências
- Nenhuma

### Área / Prioridade
Preparação — P0

### Tasks
- [x] T01 Criar `docs/agents/CONTEXTO-PROJETO.md`
- [x] T02 Ajustar cada agente conforme checklist
- [x] T03 Dry-run numa tarefa fake (ex.: "criar Footer")
- [x] T04 Corrigir desvios do dry-run

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | N/A — sem código de produto (`frontend/`/`backend/`) tocado; validação foi o dry-run do pipeline descrito nas tasks acima | 2026-08-04 | — |
| Tech Lead | `@tech-lead-review` | N/A — sem diff de código de produto a revisar; escopo é configuração/prompt dos agentes | 2026-08-04 | — |
| PO | `@product-owner` | Done | 2026-08-04 | Registro retroativo — trabalho concluído antes da formalização da tabela Vereditos; auditado e documentado nesta data |

**Status:** Done
