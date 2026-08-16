# Roadmap — Currículo Online

Status de execução por fase, do início do projeto até a evolução pós-lançamento. Cada fase linka para o backlog (histórias) ou PRD (quando o backlog ainda não foi decomposto) — o "porquê" de cada decisão de stack/arquitetura vive nos ADRs (`docs/architecture/`) e nos PRDs (`docs/product/`), não neste arquivo.

Convenção de status: `Done` · `Em andamento` · `Não iniciada` · `Draft` (PRD existe, sem histórias ainda) · `Bloqueada`.

---

## Fase 0 — Preparação: agentes + repositório

**Status:** Done
**Backlog:** [`docs/product/backlog/archive/fase-00/`](backlog/archive/fase-00/) (US-00-01 a US-00-02) — arquivada 2026-08-15

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
**Backlog:** [`docs/product/backlog/archive/fase-01/`](backlog/archive/fase-01/) (US-01-01 a US-01-03) — arquivada 2026-08-15

- [x] PRD do site + backlog inicial (épicos: Conteúdo, Frontend, RAG, Deploy)
- [x] DoR/DoD e quadro de tarefas
- [x] ADR da stack (Next.js + Python/FastAPI) + diagrama C4 de contexto

## Fase 2 — Setup do projeto

**Status:** Done
**Backlog:** [`docs/product/backlog/archive/fase-02/`](backlog/archive/fase-02/) (US-02-01 a US-02-04) — arquivada 2026-08-15

- [x] `create-next-app` (TS + Tailwind) em `frontend/` + esqueleto FastAPI em `backend/`
- [x] ESLint/Prettier conectados aos workflows de CI da Fase 0
- [x] PR do esqueleto das duas aplicações

## Fase 3 — MVP estático

**Status:** Done (17/17 histórias)
**Backlog:** [`docs/product/backlog/archive/fase-03/`](backlog/archive/fase-03/) (US-03-01 a US-03-17) — arquivada 2026-08-15

- [x] Histórias de usuário por seção (Hero, Experiência, Skills...)
- [x] `content/resume.json` + componentes da UI
- [x] Testes dos componentes principais
- [x] Revisão antes do merge
- [x] Deploy inicial na Vercel — [US-03-17](backlog/archive/fase-03/US-03-17-deploy-inicial-vercel.md)

## Fase 4 — Polimento

**Status:** Done (2/2 histórias)
**Backlog:** [`docs/product/backlog/archive/fase-04/`](backlog/archive/fase-04/) (US-04-01 a US-04-02) — arquivada 2026-08-15

- [x] SEO básico (meta tags, Open Graph) — [US-04-01](backlog/archive/fase-04/US-04-01-seo-basico.md)
- [x] Acessibilidade básica (contraste, alt, navegação por teclado) — [US-04-02](backlog/archive/fase-04/US-04-02-acessibilidade-basica.md)

## Fase 5 — Feature de IA (RAG)

**Status:** Done (9/9 histórias)
**Backlog:** [`docs/product/backlog/archive/fase-05/`](backlog/archive/fase-05/) (US-05-01 a US-05-09)

- [x] ADR do fluxo de RAG (chunking, embeddings, custo)
- [x] Endpoint `/chat` no FastAPI + geração de embeddings
- [x] Widget de chat no frontend
- [x] Testes do fluxo de chat (respostas, fallback, custo/latência)
- [x] Segurança (chaves de API, CORS, rate limit)
- [x] Deploy do backend no Render — [US-05-08](backlog/archive/fase-05/US-05-08-deploy-backend.md) (2026-08-05)

## Fase 6 — Divulgação

**Status:** Done (2 Done · 1 Cancelada)
**Backlog:** [`docs/product/backlog/archive/fase-06/`](backlog/archive/fase-06/) (US-06-01 a US-06-03)

- [x] README com a seção "Como este projeto foi construído com agentes de IA" — [US-06-01](backlog/archive/fase-06/US-06-01-readme-agentes-ia.md)
- [x] Link do site no LinkedIn e no GitHub — [US-06-02](backlog/archive/fase-06/US-06-02-links-github-linkedin.md)
- [x] Feedback de 2-3 pessoas antes de divulgar amplamente — [US-06-03](backlog/archive/fase-06/US-06-03-feedback-pre-divulgacao.md) (**Cancelada** em 2026-08-11 — autor não fará a coleta formal)

## Fase 7 — Frontend & UX v2

**Status:** Done (15/15 histórias)
**Backlog:** [`docs/product/backlog/archive/fase-07/`](backlog/archive/fase-07/) (US-07-01 a US-07-15)
**PRD:** [`PRD-005-frontend-ux-v2.md`](PRD-005-frontend-ux-v2.md)

- [x] Seção de Contato: adicionar WhatsApp — [US-07-01](backlog/archive/fase-07/US-07-01-contato-whatsapp.md) (`Done`)
- [x] Auditoria e correção de responsividade (mobile/tablet/desktop) — [US-07-02](backlog/archive/fase-07/US-07-02-auditoria-responsividade.md) (`Done`)
- [x] Redesign visual (clonagem estrutural do template personal-resume) — [US-07-03](backlog/archive/fase-07/US-07-03-redesign-visual.md), P2 (`Done`; referência: [giasinguyen/personal-resume](https://github.com/giasinguyen/personal-resume); paleta D1 Deep Ice)
- [x] Revisão de uso de recursos do Next.js (`next/image`, fontes, Server Components) — [US-07-04](backlog/archive/fase-07/US-07-04-revisao-nextjs.md), P3 (`Done`)
- [x] Conteúdo novo: reconhecimentos, formação, artigos — [US-07-05](backlog/archive/fase-07/US-07-05-conteudo-reconhecimentos-formacao-artigos.md) (`Done`; `ADR-006`)
- [x] Layout mais dinâmico e chamativo — [US-07-06](backlog/archive/fase-07/US-07-06-layout-dinamico-chamativo.md) (`Done`; Lighthouse produção Perf 66 — trade-off motion aceito)
- [x] Redesign do bloco abaixo do nome (sidebar) — [US-07-07](backlog/archive/fase-07/US-07-07-redesign-info-abaixo-nome.md) (`Done`)
- [x] Recalibrar níveis de skills — [US-07-08](backlog/archive/fase-07/US-07-08-ajuste-niveis-skills.md) (`Done`)
- [x] Timeline de Experiência mais clara/marcante — [US-07-09](backlog/archive/fase-07/US-07-09-timeline-experiencia-mais-clara-marcante.md) (`Done`)
- [x] Exibição Bancos de Dados SQL/NoSQL — [US-07-10](backlog/archive/fase-07/US-07-10-exibicao-bancos-de-dados-sql-nosql.md) (`Done`; `ADR-007`)
- [x] Polimento de layout e UX — [US-07-11](backlog/archive/fase-07/US-07-11-polimento-layout-ux.md) (`Done`)
- [x] Refino Experiência/Educação/Certificações — [US-07-12](backlog/archive/fase-07/US-07-12-refino-experiencia-educacao-certificacoes.md) (`Done`)
- [x] Polimento UX: hero, seções e Assistente RAG — [US-07-13](backlog/archive/fase-07/US-07-13-polimento-ux-chat-hero-secoes.md) (`Done`)
- [x] Ajuste fino hero/probes/certs — [US-07-14](backlog/archive/fase-07/US-07-14-ajuste-hero-probes-certs-destaques.md) (`Done`)
- [x] Redesign radical UX mobile-first — [US-07-15](backlog/archive/fase-07/US-07-15-redesign-mobile-first.md), P0 (`Done`)

## Fase 8 — Segurança & Performance

**Status:** Concluída e arquivada (2026-08-16) — 11/11 histórias Done
**PRD:** [`PRD-006-seguranca-performance.md`](PRD-006-seguranca-performance.md)
**Backlog:** [`docs/product/backlog/archive/fase-08/`](backlog/archive/fase-08/) (US-08-01 a US-08-11)
**ADR:** [`ADR-008`](../architecture/ADR-008-mitigacao-cold-start-render.md) (cold start); timeout/retry já em [`ADR-004`](../architecture/ADR-004-resiliencia-backend-chat.md)

- [x] Auditoria de segurança (headers, CORS, dependências, docs) — [US-08-01](backlog/archive/fase-08/US-08-01-auditoria-seguranca.md) (`Done`)
- [x] Timeout e retry limitado no client de IA do `/chat` (`ADR-004`) — [US-08-02](backlog/archive/fase-08/US-08-02-timeout-retry-openai.md) (`Done`)
- [x] Mitigação de cold start do backend no Render free tier (`ADR-008`) — [US-08-03](backlog/archive/fase-08/US-08-03-mitigacao-cold-start-render.md) (`Done`)
- [x] Auditoria de performance (Lighthouse Home, bundle, cache) — [US-08-04](backlog/archive/fase-08/US-08-04-auditoria-performance.md) (`Done`)
- [x] Atualizar `nanoid` transitivo — [US-08-05](backlog/archive/fase-08/US-08-05-atualizar-nanoid-transitivo.md) (`Done`)
- [x] Desativar documentação OpenAPI em produção — [US-08-06](backlog/archive/fase-08/US-08-06-desativar-docs-openapi-producao.md) (`Done`)
- [x] Headers de segurança HTTP (frontend e backend) — [US-08-07](backlog/archive/fase-08/US-08-07-headers-seguranca-http.md) (`Done`)
- [x] Atualizar FastAPI/Starlette (e deps de dev com CVE) — [US-08-08](backlog/archive/fase-08/US-08-08-atualizar-fastapi-starlette.md) (`Done`)
- [x] Corrigir CSP que bloqueava hidratação do Next.js em produção — [US-08-09](backlog/archive/fase-08/US-08-09-fix-csp-bloqueava-hidratacao.md), P0 (`Done`)
- [x] Reduzir payload de JS client-side da Home — [US-08-10](backlog/archive/fase-08/US-08-10-reduzir-payload-js-home.md) (`Done`; CA-002/CA-003 por risco aceito)
- [x] Corrigir prefetch indevido do botão de download do CV — [US-08-11](backlog/archive/fase-08/US-08-11-fix-prefetch-download-cv.md) (`Done`)

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
