# Agentes

Documentação de contexto e processos usados pelos skills em `.claude/skills/`.

| Documento | Uso |
|---|---|
| [CONTEXTO-PROJETO.md](./CONTEXTO-PROJETO.md) | Stack, estrutura, branching, convenções — **obrigatório** para todos os agentes |
| [PROCESSO-PROTOTIPO.md](./PROCESSO-PROTOTIPO.md) | Protótipos visuais sob pedido (`@ux-designer`): fluxo, ciclo de vida e limpeza |

## Skills principais

| Skill | Papel |
|---|---|
| `@orquestrador` | Pipeline PO → arquiteto? → ux-designer? → dev → QA → tech lead |
| `@product-owner` | PRD, histórias, DoR/DoD, aceite |
| `@arquiteto-ia-senior` | ADR, C4, decisões de stack |
| `@ux-designer` | Protótipos visuais **somente sob pedido** do autor |
| `@senior-developer` | Implementação frontend/backend |
| `@qa-engineer` | Testes e relatório QA |
| `@tech-lead-review` | Code review / merge |

Skills auxiliares: `@git-auto-commits`, `@git-rebase-feature-develop`, `@open-merge-request`, `@scrum-master`.
