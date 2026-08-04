# Frontend — Currículo Online

Next.js + TypeScript + Tailwind CSS.

## Pré-requisitos

- Node.js **22+** (exigido por Vitest, jsdom e Testing Library v7)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Testes: Vitest + Testing Library (colocation com o componente)
- Lint/format: ESLint + Prettier

## Comandos

```bash
npm run dev      # servidor local
npm run lint     # ESLint
npm run format   # Prettier (check)
npm test         # Vitest
npm run build    # build de produção
```

## Estrutura

```
frontend/
├── app/
├── components/     # Hero, ExperienceCard, SkillBadge, ChatWidget...
└── content/
    └── resume.json # fonte da verdade dos dados do currículo
```

Convenções completas em [`docs/agents/CONTEXTO-PROJETO.md`](../docs/agents/CONTEXTO-PROJETO.md).
