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

**URL de produção:** https://curriculo-online-ia.vercel.app

> ℹ️ **Nota (2026-08-04):** o domínio `lucas-palhares-dev.vercel.app`, documentado anteriormente, é um alias órfão de um nome de projeto antigo (residual dos deploys via CLI feitos antes de conectar o GitHub) e continua atrás do Vercel Deployment Protection (SSO) — **não usar/divulgar essa URL**. A URL de produção acima é a atual (confirmada via `vercel project ls`), sem proteção, smoke revalidado. Ver [US-03-17](../docs/product/backlog/fase-03/US-03-17-deploy-inicial-vercel.md) (CA-003).

Configuração do projeto (`lucas-palhares-dev` na conta Vercel do autor):

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
