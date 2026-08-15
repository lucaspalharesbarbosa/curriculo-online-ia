# ADR-005 — Adotar deps do template personal-resume (framer-motion + ícones)

**Status:** Aceita  
**Data:** 2026-08-07  
**Contexto:** US-07-03 (redesign visual — clonagem do template [personal-resume](https://github.com/giasinguyen/personal-resume))

## Contexto

O redesign da US-07-03 passa a clonar o layout do template MIT `giasinguyen/personal-resume`. Esse template usa:

- `framer-motion` — entrada/whileInView das seções e da sidebar
- `lucide-react` — ícones de contato, seções e meta de projetos
- `clsx` + `tailwind-merge` (+ opcionalmente `class-variance-authority`) — utilitário `cn` e primitives `ui/*`

O frontend atual (`frontend/package.json`) só tem Next.js + React + Zod. Sem ADR, a introdução dessas libs quebraria a regra de “decisão de stack nova documentada”.

## Decisão

1. **Adotar `framer-motion`** para animações equivalentes ao template, sempre com respeito a `prefers-reduced-motion` (reduzir/desligar motion no CSS e/ou variantes estáticas).
2. **Adotar `lucide-react@0.562.0`** (mesma major do template) para ícones — versões mais novas removeram ícones de marca (`Github`, `Linkedin`), necessários ao clone visual.
3. **Adotar `clsx` + `tailwind-merge`** (e `class-variance-authority` somente se portarmos os `components/ui` do template).
4. **Não** adotar o modelo de dados TypeScript monolítico `data/resume.ts` do template como fonte de verdade — permanece `frontend/content/resume.json` + Zod; a UI recebe props ou um adapter fino.
5. **Não** adicionar libs de UI kit além do necessário para clonar o layout (sem shadcn completo, sem tema Framer).

## Alternativas consideradas

| Opção | Prós | Contras |
|---|---|---|
| A) Reimplementar animações só com CSS | Zero deps novas | Mais esforço para igualar whileInView/stagger do template; maior risco de “quase igual” |
| B) Copiar o template inteiro como app paralelo | Clone rápido | Duplica stack, abandona `resume.json`/testes/ChatWidget já existentes |
| C) **Portar layout + deps mínimas (escolhida)** | Clone fiel, mantém monorepo/dados/chat | Bundle de motion; precisa ADR e cuidado com a11y |

## Consequências

- Bundle do client cresce (Framer Motion); mitigar com tree-shaking, seções `"use client"` só onde há motion, e reduced-motion.
- ChatWidget e restante do App Router continuam no mesmo `frontend/`.
- Atribuição MIT do template deve aparecer em README ou comentário de crédito no layout.
- Remoção da identidade PortfolioHub (Clash Grotesk, tokens ciano) fica no escopo da US-07-03, não deste ADR.

## Referências

- Template: https://github.com/giasinguyen/personal-resume (MIT)
- Demo: https://cv.nguyentrangiasi.id.vn/
- História: `docs/product/backlog/archive/fase-07/US-07-03-redesign-visual.md`
