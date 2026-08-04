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
npm test                 # Vitest
npm run validate:resume  # valida resume.json contra o schema Zod
npm run build            # validate:resume + build de produção
```

## Deploy (Vercel)

1. Criar projeto na [Vercel](https://vercel.com) apontando para este repositório
2. **Root Directory:** `frontend/`
3. Framework preset: Next.js (detectado automaticamente)
4. Deploy automático a cada push em `main`

História de backlog: [US-03-17](../docs/product/backlog/fase-03/US-03-17-deploy-inicial-vercel.md) — adiada pelo autor.

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
