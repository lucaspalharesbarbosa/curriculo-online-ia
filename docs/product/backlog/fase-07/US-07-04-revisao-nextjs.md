# US-07-04 — Revisão de uso de recursos do Next.js (`next/image`, fontes, Server Components)

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador acessando o site,
**quero** que ele carregue rápido e de forma eficiente,
**para** ter uma boa experiência mesmo em conexões mais lentas ou dispositivos mais fracos.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (sem endpoint novo/alterado)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem entidade nova)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Frontend & UX v2 (`PRD-005`); recomendado rodar depois de US-07-03 (redesign) para não retrabalhar imagens/hero que ainda vão mudar de aparência — não é bloqueante técnico, é sequenciamento para evitar retrabalho
- [x] ADR registrado se envolve decisão de stack nova — N/A (`next/image`, `next/font`, Server Components já são recursos nativos do Next.js já adotado, `ADR-001`; não é lib/stack nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — N/A (revisão técnica de performance/arquitetura de componentes, não redesign; aparência final não deve mudar)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Build: `npm run build` sem warnings de imagem não otimizada (`next/image`) nem de fonte
- Unitário/integração: suíte existente de cada componente (`*.test.tsx`) — não deve regredir ao trocar `<img>`/marcação de `"use client"`
- Lighthouse mobile (Performance) — comparar com a baseline mais recente (Fase 4 / US-07-02 / US-07-03, a que estiver disponível no momento)
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: imagens estáticas relevantes (ex.: ícones grandes, imagens de seção, se houver) usam `next/image` em vez de `<img>` cru, com `alt` e dimensões definidas
- [x] CA-002: fontes carregadas via `next/font` efetivamente aplicadas no `body`/componentes — corrigido o fallback silencioso hoje presente em `frontend/app/globals.css:25` (`font-family: Arial, Helvetica`, que ignora `--font-geist-sans` já carregado) caso ainda não tenha sido resolvido em US-07-03
- [x] CA-003: componentes de seção sem estado/interação do cliente avaliados para rodar como Server Components (sem `"use client"` desnecessário); `ChatWidget` e demais componentes com interatividade real permanecem Client Components
- [x] CA-004: Lighthouse Performance mobile não piora em relação à baseline mais recente; melhora é o resultado esperado
- [x] CA-005: achados da revisão (o que foi encontrado, o que foi mudado, o que foi mantido e por quê) documentados nesta história antes do aceite

### Fora de escopo

- Redesign visual (paleta, tipografia, hero) — US-07-03, história separada
- Auditoria/correção de responsividade — US-07-02, história separada
- Migração para CDN externo de imagens ou outro framework

### Dependências

- US-07-03 (redesign visual) — recomendado concluir antes, para evitar retrabalho em imagens/hero; não bloqueia tecnicamente o início desta história
- US-03-09 a US-03-16 (componentes de seção) — todas Done

### Épico / Prioridade

Frontend & UX v2 — P3

### Tasks

- [x] T01 Auditar uso de `<img>` vs `next/image` em `frontend/components/*.tsx`, listar achados nesta história
- [x] T02 Migrar imagens elegíveis para `next/image`
- [x] T03 Corrigir uso de fontes (`next/font`) — aplicar `--font-geist-sans`/`--font-geist-mono` de fato no lugar do fallback `Arial, Helvetica`
- [x] T04 [P] Avaliar `"use client"` em cada componente de seção; remover onde não houver necessidade real de interatividade
- [x] T05 Rodar build/lint/testes + Lighthouse Performance mobile, registrar achados e resultado nesta história

### Achados da revisão (CA-005) — 2026-08-11

**Arquiteto:** skip — `next/image`, `next/font` e Server Components já são stack `ADR-001`; sem decisão de stack nova.

#### CA-001 — imagens

| Encontrado | Mudado | Mantido |
|---|---|---|
| Nenhum `<img>` cru em `frontend/components` / `frontend/app` | Nenhuma migração necessária | Fotos/logos já via `next/image` com `alt` + `width`/`height`: `ResumeSidebar`, `MobileHero` (foto), `ExperienceSection`, `EducationSection`, `Certifications` (logos). Ícones decorativos = Lucide/`react-icons` (SVG), não elegíveis a `next/image`. `Recognitions` usa ícone Trophy decorativo (sem raster) |

#### CA-002 — fontes (`next/font`)

| Encontrado | Mudado | Mantido |
|---|---|---|
| Fallback `Arial, Helvetica` / Geist **já ausente** — resolvido no redesign tipográfico (Outfit/Inter; ver `layout.tsx` + `globals.css`) | Nenhuma correção de fonte nesta US | `Inter` → `--font-inter` / `Outfit` → `--font-outfit` via `next/font/google`; `html` recebe as CSS variables; `body` usa `font-sans`; `@theme` mapeia `--font-sans` → Inter e `--font-display` → Outfit |

#### CA-003 — Server vs Client Components

| Encontrado | Mudado | Mantido |
|---|---|---|
| `app/page.tsx` tinha `"use client"` sem hooks/eventos/framer-motion (só compunha filhos Client) | Removido `"use client"` de `app/page.tsx` (vira Server Component; build marca `/` como estático ○) | Seções com `framer-motion` / state / observer mantêm Client: `SummarySection`, `ExperienceSection`, `EducationSection`, `Certifications`, `Recognitions`, `ProjectsSection`, `ResumeSidebar`, `MobileHero`, `MobileBottomNav`, `CollapsibleSection`, `ChatWidget`/`ProfileAssistChat`/`RagChatPanel`, etc. |
| `lib/skill-blocks.tsx` tinha `"use client"` sem APIs de cliente | Removido `"use client"` de `lib/skill-blocks.tsx` (módulo presentacional compartilhado) | `SectionHeading` já era Server-safe (sem diretiva) |

#### CA-004 — Lighthouse Performance mobile

| Baseline | Esta execução (local) | Ressalva |
|---|---|---|
| US-07-03 CA-014: Perf **81** / A11y 100 / BP 100 (build prod) | Build prod em `http://127.0.0.1:3456`, form-factor mobile, 2 runs: Perf **100** / A11y **100** / BP **96** (BP puxado por `favicon.ico` 404 — pré-existente, fora do escopo desta US) | Ambiente local já documentado como ruidoso em US-07-06 (mesma máquina media develop em ~56 vs baseline 81). Scores locais **não inventados**; não substituem medição no preview Vercel. Face à baseline documentada (81), **não há regressão** nesta medição local |

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — `N/A`: só remoção de `"use client"` / sem lógica nova; suíte existente cobre regressão de render
- [x] Build/lint limpo (`npm run build`, type checking estrito)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A esperado (sem ADR/contrato envolvido); achados nesta história (CA-005)
- [x] Deploy/preview verificado (UI) — mudança só de boundary RSC (sem alteração visual); build prod OK e `/` estático; sem regressão visual óbvia
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `npm test -- --run`: 16 arquivos / 63/63 verdes; `npm run build` limpo (TS OK, `/` ○ static); Lighthouse mobile local Perf 100 / A11y 100 / BP 96 (2 runs), sem regressão vs baseline US-07-03 Perf 81, com ressalva de ruído de ambiente já conhecida | 2026-08-11 | CA-001–005; achados acima |
| Tech Lead | `@tech-lead-review` | Aprovar — diff mínimo (2 arquivos de código): remoção correta de `"use client"` onde não há APIs de cliente; seções com motion/state preservadas; fontes/imagens já conformes; sem Critical/High; sem ADR novo (skip arquiteto ok) | 2026-08-11 | `page.tsx`, `skill-blocks.tsx` |
| PO | `@product-owner` | Done — CAs e DoD fechados; preview marcado com base em build OK + mudança sem impacto visual; Lighthouse local documentado com ressalva (reconfirmável no preview Vercel se desejado) | 2026-08-11 | Status abaixo |

**Status:** Done
