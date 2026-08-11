# curriculo-online-ia

Currículo pessoal com assistente de IA (RAG) sobre minha trajetória profissional.

**Site em produção:** [https://lucas-palhares-cv.vercel.app](https://lucas-palhares-cv.vercel.app)

Frontend em Next.js · Backend em Python/FastAPI · Dados em `frontend/content/resume.json`.

## Como este projeto foi construído com agentes de IA

Este repositório é ao mesmo tempo o **produto** (site + chat) e um **estudo de caso** de engenharia com agentes: um pipeline enxuto, proporcional a um projeto solo, com papéis claros e artefatos auditáveis — sem virar processo de squad grande.

### Pipeline

Orquestrado por `@orquestrador` (skill em `.claude/skills/orquestrador/`):

```
PO → Arquiteto? → [UX Designer?] → Dev → QA → Tech Lead → PO (aceite)
```

| Papel | Skill | Entrega típica |
|---|---|---|
| Product Owner | `@product-owner` | PRD, histórias com DoR/DoD, aceite |
| Arquiteto | `@arquiteto-ia-senior` | ADR / C4 quando há decisão de stack |
| UX Designer | `@ux-designer` | Protótipo visual **só sob pedido** |
| Dev | `@senior-developer` | Código + testes do escopo |
| QA | `@qa-engineer` | Relatório e veredito na história |
| Tech Lead | `@tech-lead-review` | Review e veredito de merge |

Contexto obrigatório dos agentes: [`docs/agents/CONTEXTO-PROJETO.md`](docs/agents/CONTEXTO-PROJETO.md) · índice: [`docs/agents/README.md`](docs/agents/README.md).

### Produto vs. método

| | O quê |
|---|---|
| **Produto** | Currículo online + assistente que responde com RAG sobre `resume.json` |
| **Método** | Histórias INVEST, DoR/DoD, ADRs, CI por serviço, PRs mesmo trabalhando sozinho |

### Onde estão as decisões e o plano

- Roadmap e status por fase: [`docs/product/roadmap.md`](docs/product/roadmap.md)
- PRDs (épicos): [`docs/product/`](docs/product/) — ex. [PRD-001 Conteúdo](docs/product/PRD-001-conteudo.md), [PRD-003 RAG](docs/product/PRD-003-rag.md), [PRD-004 Deploy](docs/product/PRD-004-deploy.md)
- ADRs principais:
  - [ADR-001 — Stack inicial (monorepo Next.js + FastAPI)](docs/architecture/ADR-001-stack-inicial-monorepo.md)
  - [ADR-002 — Hospedagem gratuita (Vercel + Render)](docs/architecture/ADR-002-hospedagem-gratuita.md)
  - [ADR-003 — Fluxo de RAG](docs/architecture/ADR-003-fluxo-rag.md)
  - Índice completo (incl. ADR-004 a ADR-007): [`docs/architecture/`](docs/architecture/)
- Backlog por fase: [`docs/product/backlog/`](docs/product/backlog/)

Cada história de backlog carrega tabela **Vereditos** (QA, Tech Lead, PO) — o aceite não fica só no chat.

## Variáveis de ambiente / segredos

Nenhum valor real é commitado no repositório — cada serviço tem seu `.env.example` (sem valores reais) e as chaves de fato ficam configuradas no painel da respectiva plataforma de hospedagem.

| Variável | Serviço | Onde configurar | Segredo? |
|---|---|---|---|
| `LLM_API_KEY` | Backend | **Dev:** `backend/.env`. **Produção / fonte do valor:** [Render](https://dashboard.render.com) → Web Service **`curriculo-online-backend`** → **Environment** → variável **`LLM_API_KEY`** (revelar/copiar no painel e colar no `.env` local se for o caso) | Sim — chave da OpenAI (embeddings + geração, [ADR-003](docs/architecture/ADR-003-fluxo-rag.md) seção 5) |
| `ALLOWED_ORIGIN` | Backend | `backend/.env` local (dev) / Render → `curriculo-online-backend` → Environment (produção) | Não — só a origem permitida no CORS do `/chat` |
| `NEXT_PUBLIC_API_URL` | Frontend | `frontend/.env.local` local (dev) / painel da **Vercel** → Project Settings → Environment Variables (produção) | Não — URL pública do backend, embutida no bundle do client |
| `NEXT_PUBLIC_SITE_URL` | Frontend | `frontend/.env.local` local (dev) / painel da **Vercel** → Project Settings → Environment Variables (produção) | Não — URL pública do site, usada em metadata/Open Graph |

Setup local: o backend cria `backend/.env` a partir de `.env.example` na primeira subida. Preencha `LLM_API_KEY` com o valor da secret no Render (caminho acima) ou com uma chave nova da [OpenAI Platform](https://platform.openai.com/api-keys). Detalhes: [`backend/README.md`](backend/README.md#setup-local-obrigatório-para-o-chat).
