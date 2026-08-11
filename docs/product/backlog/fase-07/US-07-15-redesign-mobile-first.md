# US-07-15 — Redesign radical UX mobile-first

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador no smartphone,
**quero** navegar o currículo de forma fluida, com hierarquia clara e assistente usável,
**para** preferir a experiência mobile à desktop e divulgar o site com confiança (pré Fase 06).

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (só UX frontend; `/chat` inalterado)
- [x] Mapeamento de erros documentado — N/A (sem endpoint novo)
- [x] Modelagem de dados documentada — N/A (sem mudança em `resume.json`)
- [x] Plano de testes definido — ver subseção abaixo
- [x] Épico e dependências identificados (`PRD-005`, US-07-02/11/13 como base)
- [x] ADR registrado se envolve decisão de stack nova — N/A (Deep Ice + Next/Tailwind/Framer; sem lib nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — Deep Ice evoluí­do; mobile-first (hero compacto + bottom nav + chat sheet); tipografia display+sans; sem purple/cream/AI-slop
- [x] Protótipo solicitado pelo autor — N/A (autor pediu implementação direta em produção)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `MobileBottomNav` (scroll/active), `MobileHero` (CTAs/skills sheet), `ProfileAssistChat` (minimize/sheet), regressão `ResumeSidebar` (desktop), touch targets em `RagChatPanel`
- Integração: N/A (sem backend)
- Mocks: já existentes em hooks de chat
- Manual: breakpoints 375 / 390–430 / 768 / 1024 / 1280; teclado iOS/Android; `prefers-reduced-motion`

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: Em 375px, o primeiro viewport comunica identidade (foto/nome/papel) + CTAs sem “muro” de skills
- [x] CA-002: Dá para ir a qualquer seção principal em ≤2 toques (nav mobile)
- [x] CA-003: Chat usável com teclado aberto (sheet ajusta via `visualViewport`; input ≥44px; safe-area) — smoke em device real ainda recomendado
- [x] CA-004: Controles críticos ≥ ~44×44px; labels de UI ≥11–12px (não 10px)
- [x] CA-005: Sem overflow horizontal; `safe-area` e padding inferior para dock/chat
- [x] CA-006: `prefers-reduced-motion` reduz animações sem quebrar layout (`MotionConfig` + CSS)
- [x] CA-007: Desktop (`lg+`) permanece coerente (sidebar sticky + chat lateral `xl`)
- [x] CA-008: Visual Deep Ice evoluído com motion memorável (entrada, nav pill, sheet)
- [x] CA-009: Build do frontend passa; testes do escopo tocado passam (64/64)

### Fora de escopo

- Inventar conteúdo em `resume.json`
- Backend RAG / prompts
- Divulgação LinkedIn/GitHub
- Reativar `ChatWidget` legado
- Dashboard admin

### Dependências

- US-07-02, US-07-11, US-07-13 (base de layout/chat)
- `ADR-005` (framer-motion) — sem ADR novo

### Épico / Prioridade

Frontend & UX v2 — **P0** (bloqueia divulgação)

### Tasks

- [X] T01 Hero mobile compacto + CTAs (`MobileHero`)
- [X] T02 Bottom nav com scroll-spy (`MobileBottomNav`)
- [X] T03 Skills em sheet/accordion (fora do first viewport)
- [X] T04 Chat como bottom sheet + `visualViewport` / safe-area
- [X] T05 Seções: experiência timeline mobile, CTAs/tap targets, collapse
- [X] T06 Tokens/tipografia/motion em `globals.css` + `layout.tsx`
- [X] T07 Corrigir `overflow-hidden` root; padding dock
- [X] T08 Testes + build

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — ~74.7% stmts no escopo da suíte mobile (Vitest + v8)
- [x] Build/lint limpo — `npm run build` OK
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — PRD-005 linka esta US; sem ADR novo
- [ ] Deploy/preview verificado — pendente confirmação do autor no preview/Vercel
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-08-11 | `docs/qa/QA-004-us-07-15-redesign-mobile-first.md` |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas | 2026-08-11 | Sem Critical/High; ressalva = preview device + dual h1 no DOM |
| PO | `@product-owner` | Quase lá | 2026-08-11 | Falta smoke/preview do autor nos breakpoints |

**Status:** Quase lá

### Arquitetura mobile (decisão de UX — Orquestrador / Dev)

| Peça | Escolha |
|---|---|
| First viewport | `MobileHero`: foto + nome + typewriter + CTAs (contato/PDF/Assistente/Skills) |
| Skills | Bottom sheet (não carrossel mural no topo) |
| Wayfinding | Bottom nav sticky + scroll-spy (polegar) |
| Chat | Bottom sheet + FAB; `visualViewport`; forceOpen via evento do hero |
| Desktop | Sidebar (`lg+`); chat flutuante `xl+` |
| Tipografia | Outfit (display) + Inter (body) |
| Orbs/glass | Reduzidos no mobile |

### Changelog técnico (Fase 3)

**Novos:** `MobileHero`, `MobileBottomNav`, `SkillsBottomSheet`, `lib/skill-blocks.tsx`, `lib/mobile-nav.ts`, `hooks/useVisualViewportOffset.ts` + testes  
**Alterados:** `page.tsx`, `layout.tsx`, `globals.css`, `ResumeSidebar`, `ProfileAssistChat`, `RagChatPanel`, `CollapsibleSection`, seções (ids), `ExperienceSection`, `PRD-005`, esta US
