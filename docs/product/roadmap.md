# Roadmap — Currículo Online

Status de execução por fase, do início do projeto até a evolução pós-lançamento. Cada fase linka para o backlog (histórias) ou PRD (quando o backlog ainda não foi decomposto) — o "porquê" de cada decisão de stack/arquitetura vive nos ADRs (`docs/architecture/`) e nos PRDs (`docs/product/`), não neste arquivo.

Convenção de status: `Done` · `Em andamento` · `Não iniciada` · `Draft` (PRD existe, sem histórias ainda) · `Bloqueada`.

---

## Fase 0 — Preparação: agentes + repositório

**Status:** Done
**Backlog:** [`docs/product/backlog/fase-00/`](backlog/fase-00/) (US-00-01 a US-00-02)

- [x] Criar `docs/agents/CONTEXTO-PROJETO.md` com stack, branching, hospedagem, convenções
- [x] Ajustar cada agente conforme checklist de customização
- [x] Dry-run do pipeline completo numa tarefa fake (ex.: "criar Footer")
- [x] Corrigir o que saiu fora do esperado antes de seguir
- [x] Repo criado no GitHub (`curriculo-ia`, público, README + licença MIT)
- [x] Estrutura de pastas do monorepo (`frontend/`, `backend/`, `docs/`)
- [x] `.gitignore` combinado (Node + Python)
- [x] Git flow: branch `develop` a partir de `main`, convenção `feature/`/`fix/`
- [x] Branch protection em `main` e `develop` (PR + CI obrigatórios, sem push direto/force-push)
- [x] Arquivos base: `.editorconfig`, template de PR/issue
- [x] Esqueleto de CI (`frontend-ci.yml`, `backend-ci.yml`)
- [x] Primeiro commit/PR: "chore: estrutura inicial do repositório"

## Fase 1 — Descoberta e planejamento

**Status:** Done
**Backlog:** [`docs/product/backlog/fase-01/`](backlog/fase-01/) (US-01-01 a US-01-03)

- [x] PRD do site + backlog inicial (épicos: Conteúdo, Frontend, RAG, Deploy)
- [x] DoR/DoD e quadro de tarefas
- [x] ADR da stack (Next.js + Python/FastAPI) + diagrama C4 de contexto

## Fase 2 — Setup do projeto

**Status:** Done
**Backlog:** [`docs/product/backlog/fase-02/`](backlog/fase-02/) (US-02-01 a US-02-04)

- [x] `create-next-app` (TS + Tailwind) em `frontend/` + esqueleto FastAPI em `backend/`
- [x] ESLint/Prettier conectados aos workflows de CI da Fase 0
- [x] PR do esqueleto das duas aplicações

## Fase 3 — MVP estático

**Status:** Done (17/17 histórias)
**Backlog:** [`docs/product/backlog/fase-03/`](backlog/fase-03/) (US-03-01 a US-03-17)

- [x] Histórias de usuário por seção (Hero, Experiência, Skills...)
- [x] `content/resume.json` + componentes da UI
- [x] Testes dos componentes principais
- [x] Revisão antes do merge
- [x] Deploy inicial na Vercel — [US-03-17](backlog/fase-03/US-03-17-deploy-inicial-vercel.md)

## Fase 4 — Polimento

**Status:** Done (2/2 histórias)
**Backlog:** [`docs/product/backlog/fase-04/`](backlog/fase-04/) (US-04-01 a US-04-02)

- [x] SEO básico (meta tags, Open Graph) — [US-04-01](backlog/fase-04/US-04-01-seo-basico.md)
- [x] Acessibilidade básica (contraste, alt, navegação por teclado) — [US-04-02](backlog/fase-04/US-04-02-acessibilidade-basica.md)

## Fase 5 — Feature de IA (RAG)

**Status:** Done (9/9 histórias)
**Backlog:** [`docs/product/backlog/fase-05/`](backlog/fase-05/) (US-05-01 a US-05-09)

- [x] ADR do fluxo de RAG (chunking, embeddings, custo)
- [x] Endpoint `/chat` no FastAPI + geração de embeddings
- [x] Widget de chat no frontend
- [x] Testes do fluxo de chat (respostas, fallback, custo/latência)
- [x] Segurança (chaves de API, CORS, rate limit)
- [x] Deploy do backend no Render — [US-05-08](backlog/fase-05/US-05-08-deploy-backend.md) (2026-08-05)

## Fase 6 — Divulgação

**Status:** Não iniciada
**Backlog:** sem backlog formal (checklist de lançamento, não histórias de dev)

- [ ] README com a seção "Como este projeto foi construído com agentes de IA" (prints do pipeline, ADRs, PRD)
- [ ] Link do site no LinkedIn e no GitHub
- [ ] Feedback de 2-3 pessoas antes de divulgar amplamente

## Fase 7 — Frontend & UX v2

**Status:** Em andamento (2/4 histórias com DoR fechado, leva P1)
**Backlog:** [`docs/product/backlog/fase-07/`](backlog/fase-07/) (US-07-01, US-07-02)
**PRD:** [`PRD-005-frontend-ux-v2.md`](PRD-005-frontend-ux-v2.md)

- [ ] Seção de Contato: adicionar WhatsApp — [US-07-01](backlog/fase-07/US-07-01-contato-whatsapp.md)
- [ ] Auditoria e correção de responsividade (mobile/tablet/desktop) — [US-07-02](backlog/fase-07/US-07-02-auditoria-responsividade.md)
- [ ] Redesign visual (paleta, tipografia, hero) — P2, história ainda não criada
- [ ] Revisão de uso de recursos do Next.js (`next/image`, fontes, Server Components) — P3, história ainda não criada

## Fase 8 — Segurança & Performance

**Status:** Draft, sem histórias criadas
**PRD:** [`PRD-006-seguranca-performance.md`](PRD-006-seguranca-performance.md)

- [ ] Auditoria de segurança (headers, CORS em todos os endpoints, dependências)
- [ ] Auditoria de performance (Lighthouse, bundle, cache)
- [ ] Mitigação de cold start do backend no Render free tier
- [ ] Timeout e retry limitado no client de IA do `/chat` (`ADR-004`)

## Fase 9 — Qualidade de Engenharia

**Status:** Draft, sem histórias criadas
**PRD:** [`PRD-007-qualidade-engenharia.md`](PRD-007-qualidade-engenharia.md)

- [ ] SonarCloud no CI (frontend e backend)
- [ ] Gate de cobertura mínima automatizado no CI
- [ ] Boas práticas REST no backend (status codes, shape de erro padronizado)
- [ ] Refactor/modularização guiado pelos achados do SonarCloud

## Fase 10 — Observabilidade

**Status:** Draft, sem histórias criadas
**PRD:** [`PRD-008-observabilidade.md`](PRD-008-observabilidade.md)

- [ ] ADR de stack de observabilidade (métricas + logs, tier gratuito)
- [ ] Instrumentar backend com métricas básicas
- [ ] Dashboard Grafana
- [ ] Logs estruturados + integração com ferramenta gratuita

## Fase 11 — Chat v2

**Status:** Draft, sem histórias criadas
**PRD:** [`PRD-009-chat-v2.md`](PRD-009-chat-v2.md)

- [ ] Redesign visual do `ChatWidget`
- [ ] Perguntas sugeridas (quick replies)
- [ ] Indicador de digitando / streaming de resposta
- [ ] Feedback do usuário na resposta

## Fase 12 — Área Administrativa

**Status:** Bloqueada até resolver pré-requisito de captura de contato (Fase 7) + ADRs de auth/persistência
**PRD:** [`PRD-010-area-administrativa.md`](PRD-010-area-administrativa.md)

- [ ] ADR: estratégia de autenticação single-user
- [ ] ADR: onde persistir dados (contatos/métricas)
- [ ] Formulário de contato com persistência (depende da Fase 7)
- [ ] Login da área administrativa
- [ ] Dashboard: lista de contatos recebidos
- [ ] Dashboard: métricas de acesso e de uso do chat
