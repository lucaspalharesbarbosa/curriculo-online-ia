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

**Status:** Em andamento
**Backlog:** [`docs/product/backlog/fase-06/`](backlog/fase-06/) (US-06-01 a US-06-03) — branch `feature/fase-06-divulgacao`

- [x] README com a seção "Como este projeto foi construído com agentes de IA" — [US-06-01](backlog/fase-06/US-06-01-readme-agentes-ia.md)
- [ ] Link do site no LinkedIn e no GitHub — [US-06-02](backlog/fase-06/US-06-02-links-github-linkedin.md) (Quase lá — falta confirmação do autor)
- [ ] Feedback de 2-3 pessoas antes de divulgar amplamente — [US-06-03](backlog/fase-06/US-06-03-feedback-pre-divulgacao.md) (Quase lá — falta registro)

## Fase 7 — Frontend & UX v2

**Status:** Em andamento (15 histórias: 3 Done · 10 Quase lá · 1 In Progress · 1 Ready for Agent)
**Backlog:** [`docs/product/backlog/fase-07/`](backlog/fase-07/) (US-07-01 a US-07-15)
**PRD:** [`PRD-005-frontend-ux-v2.md`](PRD-005-frontend-ux-v2.md)

- [ ] Seção de Contato: adicionar WhatsApp — [US-07-01](backlog/fase-07/US-07-01-contato-whatsapp.md) (`Quase lá`)
- [ ] Auditoria e correção de responsividade (mobile/tablet/desktop) — [US-07-02](backlog/fase-07/US-07-02-auditoria-responsividade.md) (`Quase lá`)
- [ ] Redesign visual (clonagem estrutural do template personal-resume) — [US-07-03](backlog/fase-07/US-07-03-redesign-visual.md), P2 (`Quase lá`; referência: [giasinguyen/personal-resume](https://github.com/giasinguyen/personal-resume); paleta D1 Deep Ice)
- [ ] Revisão de uso de recursos do Next.js (`next/image`, fontes, Server Components) — [US-07-04](backlog/fase-07/US-07-04-revisao-nextjs.md), P3 (`Ready for Agent`)
- [ ] Conteúdo novo: reconhecimentos, formação, artigos — [US-07-05](backlog/fase-07/US-07-05-conteudo-reconhecimentos-formacao-artigos.md) (`Quase lá`; `ADR-006`)
- [ ] Layout mais dinâmico e chamativo — [US-07-06](backlog/fase-07/US-07-06-layout-dinamico-chamativo.md) (`Quase lá`)
- [ ] Redesign do bloco abaixo do nome (sidebar) — [US-07-07](backlog/fase-07/US-07-07-redesign-info-abaixo-nome.md) (`Quase lá`)
- [x] Recalibrar níveis de skills — [US-07-08](backlog/fase-07/US-07-08-ajuste-niveis-skills.md) (`Done`)
- [ ] Timeline de Experiência mais clara/marcante — [US-07-09](backlog/fase-07/US-07-09-timeline-experiencia-mais-clara-marcante.md) (`Quase lá`)
- [ ] Exibição Bancos de Dados SQL/NoSQL — [US-07-10](backlog/fase-07/US-07-10-exibicao-bancos-de-dados-sql-nosql.md) (`Quase lá`; `ADR-007`)
- [x] Polimento de layout e UX — [US-07-11](backlog/fase-07/US-07-11-polimento-layout-ux.md) (`Done`)
- [ ] Refino Experiência/Educação/Certificações — [US-07-12](backlog/fase-07/US-07-12-refino-experiencia-educacao-certificacoes.md) (`In Progress`)
- [ ] Polimento UX: hero, seções e Assistente RAG — [US-07-13](backlog/fase-07/US-07-13-polimento-ux-chat-hero-secoes.md) (`Quase lá`)
- [x] Ajuste fino hero/probes/certs — [US-07-14](backlog/fase-07/US-07-14-ajuste-hero-probes-certs-destaques.md) (`Done`)
- [ ] Redesign radical UX mobile-first — [US-07-15](backlog/fase-07/US-07-15-redesign-mobile-first.md), P0 (`Quase lá`)

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

**Status:** Bloqueada até ADRs de auth/persistência de métricas (pré-requisito de captura de contato resolvido em 2026-08-06: sem formulário — só métricas)
**PRD:** [`PRD-010-area-administrativa.md`](PRD-010-area-administrativa.md)

- [ ] Formulário de contato com persistência — **fora de escopo** (decisão 2026-08-06: Contato permanece link direto; ver `PRD-005` / `PRD-010`)
- [ ] Login da área administrativa
- [ ] Dashboard: métricas de acesso e de uso do chat
- [ ] ADR: estratégia de autenticação single-user
- [ ] ADR: onde persistir métricas
