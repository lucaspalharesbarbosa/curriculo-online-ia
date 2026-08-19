# US-14-02 — Modularização do frontend por domínio (`modules/resume`/`modules/chat`)

**Fase:** Fase 14 — Arquitetura & Modularização
**Épico de origem:** Arquitetura & Modularização (`PRD-012-arquitetura-modularizacao.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** reorganizar `frontend/components/` e `frontend/lib/` por domínio de negócio (`modules/resume/`, `modules/chat/`) em vez de uma pasta única misturando seções de currículo e chat,
**para** ter limites claros prontos para receber o domínio `admin` (Fase 12) sem misturar com o código de currículo/chat existente.

### DoR (antes de iniciar) — fechado

- [x] Critérios de aceite escritos e testáveis
- [x] Contrato de API documentado — `N/A`, nenhuma rota de `app/api/**` muda de contrato; só passam a chamar código que mudou de pasta
- [x] Mapeamento de erros documentado — `N/A`
- [x] Modelagem de dados — `N/A`
- [x] Plano de testes — ver subseção abaixo
- [x] Épico e dependências — `PRD-012`; depende de `ADR-011` (Aceita)
- [x] ADR registrado — sim, `ADR-011-modularizacao-ddd-lite.md` (Aceita)
- [x] Variáveis de ambiente/segredos — `N/A`
- [x] Referência visual — `N/A`, sem mudança visual (é reposicionamento de arquivo, mesmo componente/mesmo output)
- [x] Protótipo — `N/A`
- [x] Sem dúvida bloqueante

#### Plano de testes

- Testes continuam colocados junto do componente (convenção do projeto — `CONTEXTO-PROJETO.md`), só mudam de pasta junto com o componente que testam
- Sem teste novo, sem teste reescrito — mesmo teste, outro path, imports atualizados
- Critério de sucesso: `npm test` com o mesmo número de testes passando antes e depois; `npm run build` sem erro de import quebrado

### Critérios de aceite

- [x] CA-001: `frontend/modules/resume/components/` criado com as seções de currículo (`ExperienceSection`, `EducationSection`, `ProjectsSection`, `Certifications`, `Recognitions`, `SummarySection`, `ResumeSidebar`, `MobileHero`, `RoleTypewriter`, `SectionHeading`, `CollapsibleSection`, `MobileBottomNav`, `SkillsBottomSheet`, `LinkButton`) + seus testes colocados, movidos de `components/`
- [x] CA-002: `frontend/modules/resume/lib/` criado com `skill-icons.ts`, `skill-blocks.tsx`, `mobile-nav.ts`, movidos de `lib/`
- [x] CA-003: `frontend/modules/chat/components/` criado com `ProfileAssistChat.tsx` e `RagChatPanel.tsx` + seus testes colocados, movidos de `components/`
- [x] CA-004: `frontend/lib/` mantém só utilitário genérico de verdade (`utils.ts`) — nada específico de domínio sobra ali
- [x] CA-005: imports atualizados em todos os consumidores (`app/page.tsx`, `app/layout.tsx`, `app/api/chat/**` se aplicável, e entre os próprios componentes movidos) — `app/layout.tsx` e `app/api/chat/**` não referenciavam paths movidos, confirmado por busca em todo o repo
- [x] CA-006: `npm test` roda 100% verde, com o mesmo número de testes de antes do refactor (18 arquivos / 82 testes, baseline igual ao pós-refactor)
- [x] CA-007: `npm run build` e `npm run lint` limpos após a reorganização (lint com os 2 warnings pré-existentes, 0 erros, idêntico ao baseline)
- [x] CA-008: `docs/agents/CONTEXTO-PROJETO.md` (seção "Estrutura — monorepo") atualizado com a árvore nova do frontend

### Fora de escopo
- Qualquer padrão tático de DDD — ver `ADR-011`
- Mudança em `app/` (rotas do App Router continuam onde estão, é convenção do framework) além de ajuste de import
- Mudança em `content/` (já é fonte de verdade isolada, não precisa mexer)
- Modularização do backend — `US-14-01`, história separada
- Qualquer mudança visual/comportamental

### Dependências
- `ADR-011-modularizacao-ddd-lite.md` (Aceita)

### Épico / Prioridade
Arquitetura & Modularização — P2

### Tasks
- [x] T01 Criar `frontend/modules/resume/components/`, mover as ~13 seções de currículo + testes colocados
- [x] T02 [P] Criar `frontend/modules/resume/lib/`, mover `skill-icons.ts`, `skill-blocks.tsx`, `mobile-nav.ts`
- [x] T03 [P] Criar `frontend/modules/chat/components/`, mover `ProfileAssistChat.tsx`, `RagChatPanel.tsx` + testes colocados
- [x] T04 Atualizar imports em `app/page.tsx`, `app/layout.tsx` e demais consumidores dos paths antigos
- [x] T05 Rodar `npm test`, `npm run build` e `npm run lint` confirmando sem regressão
- [x] T06 Atualizar `docs/agents/CONTEXTO-PROJETO.md` (estrutura do frontend)

### DoD (antes de concluir) — precisa estar 100% fechado para Done
- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — sem lógica nova, mantém a cobertura já existente (baseline frontend: 82,18%/74,39%/84,72%/83,18%, `US-13-01`; medido pós-refactor: 85,39%/74,26%/88,88%/86,59%)
- [x] Build/lint limpo (`npm run build`, `npm run lint`, type checking estrito)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API bate com o documentado — `N/A`
- [x] Sem chave/secret exposto
- [x] Documentação atualizada — `CONTEXTO-PROJETO.md` (CA-008)
- [ ] Deploy/preview verificado — **pendente**: depende do preview real da Vercel gerado a partir do PR, que só existe após o push/abertura do PR; conferir a URL que a Vercel comenta automaticamente no PR assim que aberto
- [x] Vereditos de QA e Tech Lead documentados abaixo (PO não fez parte deste pipeline — pipeline executado: Dev → QA → Tech Lead)
- [x] Status atualizado no arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `npm test` 18 arquivos/82 testes verdes (igual ao baseline pré-refactor), `npm run build` limpo, `npm run lint` com os mesmos 2 warnings pré-existentes (0 erros), cobertura 85,39%/74,26%/88,88%/86,59% (stmts/branch/funcs/lines, acima do piso de 70% e em linha com baseline `US-13-01`), testes continuam colocados junto do componente movido, nenhum teste perdido/pulado | 2026-08-19 | commit `9c2505b` |
| Tech Lead | `@tech-lead-review` | Aprovar — diff (`git diff feature/fase-14-arquitetura-modularizacao...HEAD`) revisado: 35 arquivos, mudança restrita a `git mv` + linha de import (nenhum trecho de lógica/JSX/markup alterado), nenhum componente/lib esquecido em `components/`/`lib/` antigo (confirmado por busca de `@/components/` e paths antigos de `@/lib/*` em todo o repo — zero ocorrências), sem chave/secret exposto, sem CORS tocado (fora de escopo). Sem achado Critical/High | 2026-08-19 | commit `9c2505b` |
| PO | `@product-owner` | — | — | — |

**Status:** Aguardando validação de preview
