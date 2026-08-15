# US-00-02 — Estrutura inicial do repositório

**Fase:** Fase 00 — Preparação
**Área de origem:** Infraestrutura de repositório (não amarrada a um épico de produto) — retroativa, registrada após a conclusão

**Como** responsável técnico do projeto,
**quero** o repositório com monorepo (`frontend/`, `backend/`, `docs/`), git flow, branch protection e esqueleto de CI configurados,
**para** ter uma base segura e automatizada antes de começar a implementar features.

### Critérios de aceite
- [x] CA-001: repositório novo criado no GitHub (público, README, licença MIT) e clonado localmente
- [x] CA-002: estrutura de pastas do monorepo criada com README placeholder em cada uma
- [x] CA-003: `.gitignore` combinado (Node + Python) e `.editorconfig` criados
- [x] CA-004: git flow configurado (`develop` a partir de `main`, convenção `feature/*`/`fix/*`)
- [x] CA-005: branch protection em `main` e `develop` (exigir PR, CI passando, bloquear push direto e force-push)
- [x] CA-006: templates de PR/issue e esqueleto de CI (`frontend-ci.yml`, `backend-ci.yml`, mesmo que só com lint placeholder)
- [x] CA-007: primeiro commit/PR ("chore: estrutura inicial do repositório") aberto

### Fora de escopo
- Customização dos agentes de IA (US-00-01)
- CI rodando lint/build/teste reais (US-02-03, US-02-04)

### Dependências
- Nenhuma

### Área / Prioridade
Preparação — P0

### Tasks
- [x] T01 Criar e clonar o repositório
- [x] T02 Criar estrutura de pastas do monorepo
- [x] T03 Criar `.gitignore`, `.editorconfig`, templates de PR/issue
- [x] T04 Configurar git flow e branch protection
- [x] T05 Criar esqueleto de CI e abrir PR inicial

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | N/A — infraestrutura de repositório (monorepo, git flow, CI esqueleto), sem lógica de produto a testar | 2026-08-04 | — |
| Tech Lead | `@tech-lead-review` | N/A — sem diff de código de produto; estrutura/CI revisada pelo próprio autor no PR inicial (`chore: estrutura inicial do repositório`) | 2026-08-04 | — |
| PO | `@product-owner` | Done | 2026-08-04 | Registro retroativo — trabalho concluído antes da formalização da tabela Vereditos; auditado e documentado nesta data |

**Status:** Done
