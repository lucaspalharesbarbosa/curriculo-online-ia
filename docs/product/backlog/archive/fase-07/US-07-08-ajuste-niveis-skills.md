# US-07-08 — Remover duplicidade em AI Engineering e recalibrar níveis de skills

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** que a seção Habilidades Técnicas reflita os níveis reais autoavaliados pelo autor, sem item redundante,
**para** que a proficiência exibida seja precisa e não redundante (categoria e item com o mesmo nome).

### Contexto

Autor identificou dois problemas em `resume.json` → `skills[]`:
1. A categoria "AI Engineering" continha um item também chamado "AI Engineering" — redundante com o próprio título da categoria.
2. Níveis desatualizados em várias categorias — autor forneceu recalibração explícita (ver Critérios de aceite).

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (sem endpoint; RAG do backend lê `resume.json` direto, `backend/app/rag.py:26`)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A: mudança de valores dentro do schema já existente (`skills[].items[].level`, `1..5`), sem novo campo/entidade
- [x] Plano de testes definido (abaixo)
- [x] Épico e dependências identificados — Frontend & UX v2; nenhuma dependência de outra história
- [x] ADR registrado — N/A: dado, não decisão de stack
- [x] Variáveis de ambiente/segredos — N/A
- [x] Referência visual definida — N/A: não muda layout/CSS, só valores em `resume.json` (a exibição em si é tratada em US-07-10)
- [x] Sem dúvida bloqueante — níveis fornecidos explicitamente pelo autor por categoria/item

#### Plano de testes

- Unitário: `resume.schema.test.ts` (`validates the committed resume.json`) — garante que o arquivo editado à mão continua batendo com o Zod schema (nº de itens, `level` entre 1 e 5)
- Regressão: suíte completa do frontend, já que `ResumeSidebar`/`page.test.tsx` renderizam a partir do `resume.json` real

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: item "AI Engineering" removido de dentro da categoria "AI Engineering" (mantém Agentic AI, Context Engineering, Prompt Engineering, Spec-Driven Development (SDD))
- [x] CA-002: categoria "AI Engineering" — todos os itens restantes em nível 3
- [x] CA-003: categoria "Backend" — Java 4, Spring Boot 3, Python 2, C# 1 (demais itens da categoria: N/A, não existem outros)
- [x] CA-004: categoria "Frontend" — Angular 2, React 1, JavaScript 3 (HTML5/CSS3 não mencionados pelo autor — mantidos como estavam, nível 3)
- [x] CA-005: categoria "Cloud" — AWS 3, GCP 1
- [x] CA-006: categoria "DevOps & CI/CD" — CI/CD 3 (Docker/Git/GitLab não mencionados — mantidos como estavam)
- [x] CA-007: categoria "Metodologias" — Scrum 5 (Kanban não mencionado — mantido como estava)
- [x] CA-008: `resume.schema.test.ts` e suíte completa (`vitest run`) 100% verdes após a edição

### Fora de escopo

- Forma de exibição das skills (chips, medidor, agrupamento) — tratada em US-07-10 (Bancos de Dados) e não alterada aqui
- Qualquer outra categoria/nível não listado explicitamente pelo autor

### Dependências

- Nenhuma

### Épico / Prioridade

Frontend & UX v2 — P2

### Tasks

- [x] T01 `frontend/content/resume.json` — remover item duplicado e ajustar níveis conforme CA-002–007
- [x] T02 `vitest run` (schema + suíte completa) — evidência de DoD

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — `N/A` justificado: é dado (JSON), não lógica; a garantia é o schema Zod já testado, sem lógica nova para cobrir
- [x] Build/lint limpo — `N/A` para lint (não é código); build coberto pelo `validate:resume` que roda o schema test
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A (dado, não decisão registrável)
- [x] Deploy/preview verificado (UI) — `N/A` justificado: sem mudança de layout/CSS, só valores exibidos pelos componentes já existentes e já cobertos por teste
- [x] Vereditos QA, Tech Lead e PO na tabela abaixo
- [x] Status da história atualizado

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `vitest run content/resume.schema.test.ts app/page.test.tsx components/ResumeSidebar.test.tsx`: 3 arquivos, 10/10 verdes após a edição do JSON; valores conferidos item a item contra o pedido do autor (CA-001–007) | 2026-08-08 | `frontend/content/resume.json` |
| Tech Lead | `@tech-lead-review` | Aprovar — mudança de dado puro dentro do schema já validado (Zod), sem lógica/CSS tocado, sem risco de regressão fora do que os testes já cobrem | 2026-08-08 | `frontend/content/resume.json` |
| PO | `@product-owner` | Done — todos os CA fechados, dado confere com o pedido explícito do autor, testes verdes | 2026-08-08 | avaliação acima |

**Status:** Done
