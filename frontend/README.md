# Frontend — Currículo Online

Next.js + TypeScript + Tailwind CSS.

Esqueleto da aplicação ainda não criado (ver Fase 2 do [plano do projeto](../docs/plano-projeto-curriculo-online.md)).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Testes: Vitest/Jest + Testing Library (colocation com o componente)
- Lint/format: ESLint + Prettier

## Estrutura prevista

```
frontend/
├── app/
├── components/     # Hero, ExperienceCard, SkillBadge, ChatWidget...
└── content/
    └── resume.json # fonte da verdade dos dados do currículo
```

Convenções completas em [`docs/agents/CONTEXTO-PROJETO.md`](../docs/agents/CONTEXTO-PROJETO.md).
