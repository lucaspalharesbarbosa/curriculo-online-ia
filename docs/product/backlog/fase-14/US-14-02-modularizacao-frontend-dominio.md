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

- [ ] CA-001: `frontend/modules/resume/components/` criado com as seções de currículo (`ExperienceSection`, `EducationSection`, `ProjectsSection`, `Certifications`, `Recognitions`, `SummarySection`, `ResumeSidebar`, `MobileHero`, `RoleTypewriter`, `SectionHeading`, `CollapsibleSection`, `MobileBottomNav`, `SkillsBottomSheet`, `LinkButton`) + seus testes colocados, movidos de `components/`
- [ ] CA-002: `frontend/modules/resume/lib/` criado com `skill-icons.ts`, `skill-blocks.tsx`, `mobile-nav.ts`, movidos de `lib/`
- [ ] CA-003: `frontend/modules/chat/components/` criado com `ProfileAssistChat.tsx` e `RagChatPanel.tsx` + seus testes colocados, movidos de `components/`
- [ ] CA-004: `frontend/lib/` mantém só utilitário genérico de verdade (`utils.ts`) — nada específico de domínio sobra ali
- [ ] CA-005: imports atualizados em todos os consumidores (`app/page.tsx`, `app/layout.tsx`, `app/api/chat/**` se aplicável, e entre os próprios componentes movidos)
- [ ] CA-006: `npm test` roda 100% verde, com o mesmo número de testes de antes do refactor
- [ ] CA-007: `npm run build` e `npm run lint` limpos após a reorganização
- [ ] CA-008: `docs/agents/CONTEXTO-PROJETO.md` (seção "Estrutura — monorepo") atualizado com a árvore nova do frontend

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
- [ ] T01 Criar `frontend/modules/resume/components/`, mover as ~13 seções de currículo + testes colocados
- [ ] T02 [P] Criar `frontend/modules/resume/lib/`, mover `skill-icons.ts`, `skill-blocks.tsx`, `mobile-nav.ts`
- [ ] T03 [P] Criar `frontend/modules/chat/components/`, mover `ProfileAssistChat.tsx`, `RagChatPanel.tsx` + testes colocados
- [ ] T04 Atualizar imports em `app/page.tsx`, `app/layout.tsx` e demais consumidores dos paths antigos
- [ ] T05 Rodar `npm test`, `npm run build` e `npm run lint` confirmando sem regressão
- [ ] T06 Atualizar `docs/agents/CONTEXTO-PROJETO.md` (estrutura do frontend)

### DoD (antes de concluir) — precisa estar 100% fechado para Done
- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — sem lógica nova, mantém a cobertura já existente (baseline frontend: 82,18%/74,39%/84,72%/83,18%, `US-13-01`)
- [ ] Build/lint limpo (`npm run build`, `npm run lint`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API bate com o documentado — `N/A`
- [ ] Sem chave/secret exposto
- [ ] Documentação atualizada — `CONTEXTO-PROJETO.md` (CA-008)
- [ ] Deploy/preview verificado — sim, preview da Vercel confirmando que o site renderiza igual ao de produção
- [ ] Vereditos de QA, Tech Lead e PO documentados abaixo
- [ ] Status atualizado no arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
