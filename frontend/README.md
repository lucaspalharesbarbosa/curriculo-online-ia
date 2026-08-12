# Frontend — Currículo Online

Next.js + TypeScript + Tailwind CSS.

## Pré-requisitos

- Node.js **22+** (exigido por Vitest, jsdom e Testing Library v7)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Validação do currículo: Zod (`content/resume.schema.ts`)
- Testes: Vitest + Testing Library (colocation com o componente)
- Lint/format: ESLint + Prettier

## Comandos

```bash
npm run dev              # servidor local
npm run lint             # ESLint
npm run format           # Prettier (check)
npm run format:write     # Prettier (aplica formatação)
npm test                 # Vitest
npm run validate:resume  # valida resume.json contra o schema Zod
npm run build            # validate:resume + build de produção
```

Após `npm install`, o Husky configura o hook `pre-commit` (Prettier + ESLint nos arquivos staged via `lint-staged`), para o mesmo tipo de problema do CI falhar no commit — antes de abrir o PR.

## Deploy (Vercel)

**URL de produção:** https://lucas-palhares-cv.vercel.app

> ℹ️ **Nota (2026-08-10):** URL de produção atual é `https://lucas-palhares-cv.vercel.app` (projeto Vercel renomeado). URLs antigas (`curriculo-online-ia.vercel.app`, alias órfão `lucas-palhares-dev.vercel.app`) não devem ser usadas na divulgação. Ver [US-03-17](../docs/product/backlog/fase-03/US-03-17-deploy-inicial-vercel.md) (histórico) e Fase 06.

Configuração do projeto (`lucas-palhares-cv` na conta Vercel do autor):

1. Framework preset: Next.js
2. **Root Directory:** `frontend/` — confirmado (`vercel project inspect`)
3. Production Branch: `main` — conectado ao GitHub (`lucaspalharesbarbosa/curriculo-online-ia`), deploy automático a cada push habilitado

Deploy inicial feito via CLI (`vercel deploy --prod`) a partir de `frontend/`; GitHub conectado posteriormente pelo painel da Vercel. Decisão de hospedagem: [ADR-002](../docs/architecture/ADR-002-hospedagem-gratuita.md).

História de backlog: [US-03-17](../docs/product/backlog/fase-03/US-03-17-deploy-inicial-vercel.md).

## Estrutura

```
frontend/
├── app/                 # layout, page, globals
├── components/          # Hero, ExperienceCard, Education, SkillBadge,
│                        # Certifications, ProjectCard, Contact, SiteHeader
├── content/
│   ├── resume.json      # fonte da verdade dos dados do currículo
│   ├── resume.schema.ts # schema Zod
│   └── resume.ts        # parse tipado usado pela UI
└── public/              # PDF do currículo e assets estáticos
```

Convenções completas em [`docs/agents/CONTEXTO-PROJETO.md`](../docs/agents/CONTEXTO-PROJETO.md).
