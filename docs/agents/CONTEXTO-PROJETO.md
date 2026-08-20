# Contexto do Projeto — Currículo Online

Arquivo de referência obrigatório para todos os agentes deste repositório. Qualquer skill que precise de contexto de stack, branching ou convenções deve **referenciar este arquivo** em vez de repetir/reinventar o contexto no próprio prompt.

## O que é

Site pessoal de currículo (projeto #1 do portfólio) com um assistente de chat (RAG) que responde perguntas sobre a trajetória profissional do autor. É um **produto pessoal, solo**, não corporativo — processo e cerimônias devem ser enxutos, proporcionais ao tamanho do projeto.

## Stack decidida (não reabrir sem ADR)

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js + TypeScript + Tailwind CSS |
| Backend de IA (RAG) | Python + FastAPI |
| Dados do currículo | `frontend/content/resume.json` (fonte da verdade, separada da UI) |
| RAG | Chunking do `resume.json` → embeddings → similaridade em memória/JSON (sem banco vetorial — volume pequeno) |
| Testes frontend | Vitest/Jest + Testing Library |
| Testes backend | pytest |
| Lint/format frontend | ESLint + Prettier |
| Lint/format backend | ruff (ou flake8) + black |
| CI | GitHub Actions — `frontend-ci.yml` (lint + build) e `backend-ci.yml` (lint + testes), um workflow por serviço |
| Análise estática | SonarCloud — dois projetos (um por serviço), rodando em `pull_request` e push `main`/`develop`, condicionado ao `paths-filter` de cada workflow (`ADR-009`) |

## Estrutura — monorepo

```
curriculo-online-ia/
├── frontend/           # Next.js + TS + Tailwind
│   ├── app/
│   │   └── prototipo/  # rotas temporárias de exploração visual (@ux-designer) — limpar após decisão
│   ├── modules/         # organização por domínio de negócio (ADR-011, DDD-lite)
│   │   ├── resume/       # domínio "currículo"
│   │   │   ├── components/ # ExperienceSection, EducationSection, Skills...
│   │   │   └── lib/         # skill-icons.ts, skill-blocks.tsx, mobile-nav.ts
│   │   └── chat/          # domínio "chat/RAG"
│   │       ├── components/ # ProfileAssistChat, RagChatPanel
│   │       └── lib/         # chat-client.ts (port ChatClient), http-chat-client.ts (adapter HTTP) — ADR-012, US-14-04
│   ├── hooks/            # useResumeChat (recebe ChatClient por parâmetro, default = adapter HTTP — ADR-012)
│   ├── components/     # só protótipos (ver abaixo) — sem componente de domínio
│   │   └── prototypes/ # UI descartável de protótipo — não acumular após promover/descartar
│   ├── lib/             # só utilitário genérico de verdade (utils.ts) — nada de domínio aqui
│   ├── content/
│   │   ├── resume.json
│   │   ├── resume.schema.ts   # Zod
│   │   └── resume.ts
│   └── public/         # PDF e assets
├── backend/            # Python + FastAPI
│   ├── app/
│   │   ├── main.py         # composition root: FastAPI, CORS, /health
│   │   ├── shared/          # cross-cutting, sem regra de negócio de domínio
│   │   │   ├── errors.py
│   │   │   └── env_bootstrap.py
│   │   ├── resume/           # domínio "currículo"
│   │   │   └── models.py     # Pydantic (espelha Zod)
│   │   └── chat/              # domínio "chat/RAG" (Fase 05; Ports & Adapters na Fase 14, ADR-012)
│   │       ├── router.py       # camada HTTP: endpoint /chat, rate limit, Depends()
│   │       ├── service.py      # use case: orquestra pergunta → resposta
│   │       ├── ports.py        # Protocol: EmbeddingProvider, ChatCompletionProvider, WebSearchProvider
│   │       ├── adapters/
│   │       │   ├── openai_adapter.py  # EmbeddingProvider + ChatCompletionProvider (openai.OpenAI)
│   │       │   └── tavily_adapter.py   # WebSearchProvider (Tavily)
│   │       └── rag.py          # chunking, ranking, roteamento (recebe EmbeddingProvider por parâmetro)
│   └── requirements.txt
├── e2e/                # Playwright — testa frontend + backend juntos
│   └── playwright.config.ts
├── docs/
│   ├── product/        # PRD, backlog (product-owner)
│   ├── architecture/   # ADRs + C4 (arquiteto-ia-senior)
│   ├── qa/             # planos/relatórios de teste (qa-engineer)
│   └── agents/          # prompts dos agentes (este arquivo + PROCESSO-PROTOTIPO.md)
└── .github/workflows/
```

Frontend e backend evolvem no mesmo repositório e, quando a feature exigir, no mesmo PR — mas cada um com seu próprio pipeline de CI.

**Protótipos visuais:** sob **pedido explícito** do autor (`@ux-designer`). Processo e ciclo de vida: [`PROCESSO-PROTOTIPO.md`](./PROCESSO-PROTOTIPO.md). Após aprovar ou descartar, limpar código do protótipo no **mesmo PR** — a decisão fica só na US/histórico.

## Convenção de nomenclatura de documentos

Todo documento gerado por um agente (PO, Arquiteto, QA) segue `TIPO-NNN-slug.md`: `NNN` sequencial com 3 dígitos, **nunca reaproveitado** (mesmo se o documento for descontinuado, o número não volta a ser usado); `slug` em `kebab-case`, minúsculo.

| Tipo | Local | Padrão | Exemplo |
|---|---|---|---|
| PRD (épico) | `docs/product/` | `PRD-NNN-<epico>.md` | `PRD-001-conteudo.md` |
| Backlog (histórias/tasks) | `docs/product/backlog/fase-NN/` | `US-FF-NN-<slug>.md` — uma história por arquivo; `FF` é o número da fase de implementação (não do épico) e `NN` a sequência dentro dela, então o ID já é único no backlog inteiro (`US-03-01` ≠ `US-05-01`); `slug` descreve a história no nome do arquivo. A tabela "Histórias" do PRD de origem linka para o arquivo | `docs/product/backlog/fase-03/US-03-01-schema-resume-json.md` |
| ADR | `docs/architecture/` | `ADR-NNN-<titulo>.md` | `ADR-001-stack-inicial-monorepo.md` |
| Diagrama C4 | `docs/architecture/` | `C4-NNN-<titulo>.md` | `C4-001-contexto-containers.md` |
| Imagem de diagrama C4 (renderizada, embutida no `.md` correspondente) | `docs/architecture/images/` | `C4-NNN-<slug-diagrama>.svg`, com `slug-diagrama` sempre prefixado pelo nível C4 (`n1`/`n2`/`n3`/`n4`/`seq`) | `C4-001-n1-contexto.svg` |
| Diagrama de dados (ER) — DoR de história que introduz/altera entidades relacionadas | `docs/architecture/` | `DATA-NNN-<titulo>.md` | `DATA-001-schema-curriculo.md` |
| Imagem de diagrama de dados (renderizada) | `docs/architecture/images/` | `DATA-NNN-<slug-diagrama>.svg` | `DATA-001-er.svg` |
| Relatório QA (quando salvo em arquivo, não só handoff) | `docs/qa/` | `QA-NNN-<escopo>.md` | `QA-001-hero-sobre.md` |

Fase com **todas** as histórias `Done` é candidata a arquivamento em `docs/product/backlog/archive/fase-NN/` (mesmo nome de arquivo e ID, IDs nunca renumerados) — workflow completo em `.claude/skills/product-owner/references/archive-workflow.md`.

Numeração de épico (PRD/Backlog) é fixa pela ordem em que cada épico foi refinado — um épico novo recebe o próximo `NNN` livre; os já existentes não são renumerados:

| NNN | Épico |
|---|---|
| 001 | Conteúdo |
| 002 | Frontend |
| 003 | RAG |
| 004 | Deploy |
| 005 | Frontend & UX v2 |
| 006 | Segurança & Performance |
| 007 | Qualidade de Engenharia |
| 008 | Observabilidade |
| 009 | Chat v2 |
| 010 | Área Administrativa |
| 011 | RAG Inteligente |
| 012 | Arquitetura & Modularização |

`ADR-NNN`, `C4-NNN` e `DATA-NNN` têm sequência própria, independente da numeração de épico (ex.: `ADR-001` é sobre a stack, não sobre o épico 001).

## Branching e commits

- `main` e `develop` protegidas: exigem PR + CI passando; bloqueiam push direto e force-push
- Features em `feature/*`, correções em `fix/*`
- Commits em **Conventional Commits**, mensagens em **português brasileiro** (`feat:`, `fix:`, `docs:`, `chore:`...)
- PR mesmo trabalhando sozinho — é hábito deliberado, não burocracia

## Convenções de código

- Identificadores (variáveis, funções, classes, arquivos) em **inglês**
- Comentários no código, quando necessários, em **português brasileiro** — por consistência com commits, PRs e documentação do projeto
- Comentário só quando o *porquê* não for óbvio pelo código; não descrever o que o código já diz por si

### Nomenclatura — Frontend (Next.js/TS)

| Elemento | Padrão | Exemplo |
|---|---|---|
| Componente | `PascalCase`, arquivo com mesmo nome | `ExperienceCard.tsx` |
| Hook | `camelCase`, prefixo `use` | `useChatWidget.ts` |
| Tipo/Interface | `PascalCase`, sem prefixo `I` | `Experience` (não `IExperience`) |
| Arquivo de rota | Convenção do App Router | `page.tsx`, `layout.tsx` |
| Teste | Mesmo nome do arquivo + `.test` | `ExperienceCard.test.tsx` |

### Nomenclatura — Backend (Python/FastAPI)

| Elemento | Padrão | Exemplo |
|---|---|---|
| Módulo/função | `snake_case` | `rag.py`, `get_relevant_chunks()` |
| Classe | `PascalCase` | `EmbeddingIndex` |
| Pydantic model | `PascalCase`, sufixo por responsabilidade | `ChatRequest`, `ChatResponse` (não `ChatDTO`) |
| Teste | `test_` + módulo espelhado | `tests/test_rag.py` |

## Estrutura de testes

| Camada | Local | Ferramenta | Observação |
|---|---|---|---|
| Unitário frontend | Colocation com o componente | Vitest/Jest + Testing Library | `ExperienceCard.tsx` + `ExperienceCard.test.tsx` lado a lado — **não** usar pasta `__tests__` separada. Testar comportamento visível ao usuário, não detalhe de implementação |
| Unitário backend | `backend/tests/`, espelhando `backend/app/` | pytest | `tests/test_rag.py`, `tests/test_chat.py`; padrão **AAA** (Arrange-Act-Assert); mocks de embeddings/LLM via fixtures — nunca bater na API real da IA em teste automatizado |

**Nome de teste — código em inglês, display em PT-BR:** identificadores (nome de função, variável, `describe`) sempre em inglês; o **display** — o que aparece rodando o teste — em português brasileiro. No Vitest, o título do `it()`/`test()` já é o display. No pytest, o nome da função continua em inglês (precisa continuar sendo identificador válido e consistente para `-k`/node id) e o display vira uma docstring de uma linha em PT-BR logo abaixo da assinatura. Exemplos completos: `.claude/skills/qa-engineer/references/test-naming-convention.md`.
| Integração backend | `backend/tests/` | `TestClient` (FastAPI) | Endpoint `/chat` completo, LLM mockado |
| E2E | `e2e/` na raiz do repo (fora de `frontend/` e `backend/`) | Playwright | Ver justificativa abaixo |
| Acessibilidade/Performance | Navegador/CI | Lighthouse | Antes de deploy relevante |

**Onde fica o E2E e por quê:** `e2e/` como diretório próprio na raiz, com seu `package.json`/`playwright.config.ts` e workflow de CI dedicado (`e2e-ci.yml`). O E2E do fluxo de chat testa frontend **e** backend juntos (sobe os dois serviços, ou aponta para um preview de deploy) — colocá-lo dentro de `frontend/` o acoplaria ao pipeline/lint de um único serviço e obrigaria o backend a subir num contexto que não é dele. Um diretório neutro mantém a suíte de integração desacoplada de qualquer um dos dois serviços e alinhada ao fato de que é o **sistema** que está sendo testado, não uma camada isolada.

**Meta de cobertura:** 70% nos módulos de lógica principal (`backend/app/rag.py`, `backend/app/chat.py`, componentes centrais do frontend). Não é meta global do repositório nem justificativa para perseguir 100% — projeto pessoal, não sistema crítico.

## Boas práticas a aprofundar

- **Pré-commit hooks**: `husky` + `lint-staged` no frontend, `pre-commit` com `ruff`/`black` no backend — pega lint/format antes do push, não só no CI
- **Type checking estrito**: `strict: true` no `tsconfig.json`; `mypy` ou `pyright` no backend — o RAG lida com dados estruturados (`resume.json`), tipagem forte evita bug de schema silencioso
- **Validação de schema do `resume.json`**: Pydantic no backend, Zod no frontend — é a fonte da verdade dos dois lados, então schema quebrado deve falhar cedo (build/teste), não em runtime
- **ADRs desde já**: registrar mesmo que curto para decisões que ainda vão surgir (provedor de embeddings, estratégia de rate limit do `/chat`, etc.) — não esperar o projeto crescer para começar a documentar

## Hospedagem

Decisão formal: [`ADR-002`](../architecture/ADR-002-hospedagem-gratuita.md) (**Aceita**).

- Frontend → **Vercel** Hobby (deploy automático a cada push, Root Directory = `frontend/`)
- Backend → **Render** free (preferência); Google Cloud Run como fallback — build a partir de `backend/`
- API keys de IA nunca expostas no client; sempre via variável de ambiente / serverless function

## Governança sobre os agentes

O dono técnico final é o autor (humano). Sugestões dos agentes (arquitetura, código, testes) são propostas, não aprovação automática — decisões de escopo/stack ficam registradas em ADR/PRD, inclusive quando uma sugestão é rejeitada.

## Fase atual

Fase 0 (preparação) **concluída e arquivada** (2026-08-15) — registrada retroativamente em `docs/product/backlog/archive/fase-00/` ([US-00-01](../product/backlog/archive/fase-00/US-00-01-customizacao-agentes-ia.md): agentes customizados; [US-00-02](../product/backlog/archive/fase-00/US-00-02-estrutura-inicial-repositorio.md): monorepo, `.gitignore`, branch protection, CI esqueleto, PR inicial).

Fase 1 (descoberta e planejamento) **concluída e arquivada** (2026-08-15) — registrada retroativamente em `docs/product/backlog/archive/fase-01/`: PRD criado pelo `product-owner` para os 4 épicos ([US-01-01](../product/backlog/archive/fase-01/US-01-01-prd-backlog-inicial.md)), `ADR-001` + diagramas C4 de contexto/containers registrados pelo `arquiteto-ia-senior` ([US-01-02](../product/backlog/archive/fase-01/US-01-02-adr-stack-c4-contexto.md)) e DoR/DoD padrão + cadência de acompanhamento revisados formalmente pelo `scrum-master` ([US-01-03](../product/backlog/archive/fase-01/US-01-03-dor-dod-scrum-master.md) — Done). Pendências de conteúdo do autor (projetos/contato/PDF) foram resolvidas na Fase 03 — ver `docs/product/README.md`.

Fase 2 (setup do projeto) **concluída e arquivada** (2026-08-15) — [US-02-01](../product/backlog/archive/fase-02/US-02-01-setup-nextjs.md) (Next.js + TS + Tailwind), [US-02-02](../product/backlog/archive/fase-02/US-02-02-setup-fastapi.md) (FastAPI + health check), [US-02-03](../product/backlog/archive/fase-02/US-02-03-ci-frontend-real.md) e [US-02-04](../product/backlog/archive/fase-02/US-02-04-ci-backend-real.md) (CI real) — Done.

Fase 3 (MVP estático) **concluída e arquivada** (2026-08-15) — 17/17 histórias Done (PR #4 mergeado em `develop`; [US-03-17](../product/backlog/archive/fase-03/US-03-17-deploy-inicial-vercel.md) — deploy Vercel — Done em 2026-08-04, já mergeado em `develop`). URL de produção atual (desde 2026-08-10): https://lucas-palhares-cv.vercel.app (antes `curriculo-online-ia.vercel.app`, domínio removido do painel Vercel em 2026-08-15).

Fase 4 (polimento) **concluída e arquivada** (2026-08-15) — 2/2 histórias Done: [US-04-01](../product/backlog/archive/fase-04/US-04-01-seo-basico.md) (SEO básico — metadata/Open Graph derivados de `resume.hero`) e [US-04-02](../product/backlog/archive/fase-04/US-04-02-acessibilidade-basica.md) (acessibilidade — contraste AA corrigido em modo escuro; `alt` e navegação por teclado já conformes; follow-up de auditoria Lighthouse resolvido em 2026-08-15), ambas em 2026-08-04.

Fase 5 (RAG) **concluída e arquivada** (2026-08-11) — 9/9 histórias Done em `docs/product/backlog/archive/fase-05/`: [US-05-01](../product/backlog/archive/fase-05/US-05-01-adr-fluxo-rag.md) (ADR-003), [US-05-02](../product/backlog/archive/fase-05/US-05-02-chunking-resume-json.md) (chunking), [US-05-03](../product/backlog/archive/fase-05/US-05-03-geracao-embeddings.md) (embeddings), [US-05-04](../product/backlog/archive/fase-05/US-05-04-endpoint-chat.md) (endpoint `/chat`), [US-05-05](../product/backlog/archive/fase-05/US-05-05-chat-widget-frontend.md) (`ChatWidget`), [US-05-06](../product/backlog/archive/fase-05/US-05-06-testes-fluxo-chat.md) (testes do fluxo), [US-05-07](../product/backlog/archive/fase-05/US-05-07-seguranca-chat.md) (CORS + rate limit), [US-05-09](../product/backlog/archive/fase-05/US-05-09-env-vars-segredos.md) (`.env.example` + docs de segredos) e [US-05-08](../product/backlog/archive/fase-05/US-05-08-deploy-backend.md) (deploy do backend no Render — Done em 2026-08-05).

Fase 6 (divulgação) **concluída e arquivada** (2026-08-11) — [US-06-01](../product/backlog/archive/fase-06/US-06-01-readme-agentes-ia.md) e [US-06-02](../product/backlog/archive/fase-06/US-06-02-links-github-linkedin.md) Done; [US-06-03](../product/backlog/archive/fase-06/US-06-03-feedback-pre-divulgacao.md) **Cancelada** — em `docs/product/backlog/archive/fase-06/`.

Fase 7 (Frontend & UX v2) **concluída e arquivada** (2026-08-11) — 15/15 histórias Done em `docs/product/backlog/archive/fase-07/` (`PRD-005`). Referência visual **personal-resume** ([repo](https://github.com/giasinguyen/personal-resume)); paleta **D1 Deep Ice**; deps em `ADR-005`/`ADR-006`/`ADR-007`.

Fase 8 (Segurança & Performance) **concluída e arquivada** (2026-08-16) — 11/11 histórias Done em `docs/product/backlog/archive/fase-08/` (US-08-01 a US-08-11); todas verificadas com evidência real de produção (`curl -I`, Lighthouse mobile+desktop real, smoke `/health`/`/chat`, CI real do GitHub Actions) após merge `develop`→`main` (PR #44) e configuração de `ENVIRONMENT=production` no Render; US-08-10 fechada com CA-002/CA-003 por risco aceito (decisão do autor — sem alavanca de código disponível, ver investigação na própria história). `PRD-006` Done; cold start em [`ADR-008`](../architecture/ADR-008-mitigacao-cold-start-render.md); timeout/retry em `ADR-004`. Fase 9 (Qualidade de Engenharia) **concluída e arquivada** (2026-08-16) — 1/1 história Done em `docs/product/backlog/archive/fase-09/` (US-09-01, SonarCloud no CI); demais frentes do `PRD-007` decompostas na Fase 13 (número `09` não reaproveitado). Fase 13 (Qualidade de Engenharia — continuação) **concluída e arquivada** (2026-08-18) — `docs/product/backlog/archive/fase-13/`: 7/8 histórias `Done` ([US-13-01](../product/backlog/archive/fase-13/US-13-01-gate-cobertura-ci.md) gate de cobertura, [US-13-02](../product/backlog/archive/fase-13/US-13-02-boas-praticas-rest-backend.md) shape de erro/status codes REST, [US-13-04](../product/backlog/archive/fase-13/US-13-04-triagem-falsos-positivos-sonar.md) falsos positivos, [US-13-05](../product/backlog/archive/fase-13/US-13-05-backend-achados-chat-py.md) achados `chat.py`, [US-13-06](../product/backlog/archive/fase-13/US-13-06-frontend-chat-widget-morto-achados.md) `ChatWidget` morto, [US-13-07](../product/backlog/archive/fase-13/US-13-07-frontend-regex-lib-utils.md) regex `lib/utils.ts`, [US-13-08](../product/backlog/archive/fase-13/US-13-08-frontend-migracao-zod.md) migração Zod); [US-13-03](../product/backlog/archive/fase-13/US-13-03-refactor-modularizacao-sonarcloud.md) `Cancelada`, decomposta nas demais após triagem real do autor no dashboard do SonarCloud. Implementação entregue no [PR #49](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/49) — CI real e análise do Sonar escopada ao PR confirmaram todos os achados corrigidos, Quality Gate `OK` nos dois projetos. `PRD-007` (Qualidade de Engenharia) **Done**. Fase 11 (Chat v2 + RAG Inteligente) **concluída e arquivada** (2026-08-18) — 7/7 histórias `Done` em `docs/product/backlog/archive/fase-11/` (`PRD-009` + `PRD-011`, este último novo, criado para a frente de precisão de recuperação e acesso à web do RAG; `ADR-010`). Implementação (roteamento por seção/recência no RAG, busca web via Tavily, redesign do chat, feedback do usuário) entregue no [PR #51](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/51), CI verde (SonarCloud `OK` nos dois projetos após corrigir gap real de `new_coverage`), aguardando merge do autor. Fases 10 e 12 seguem em `draft` (`PRD-008`, `PRD-010`). Fase 14 (Arquitetura & Modularização) criada em 2026-08-18 a partir de `ADR-011` (Aceita) — reorganização de backend/frontend por domínio de negócio (DDD-lite, sem padrões táticos completos), preparando terreno para as Fases 12 e 10; `PRD-012`, backlog `docs/product/backlog/fase-14/`. `US-14-01` (backend) e `US-14-02` (frontend) implementadas — Dev, QA e Tech Lead aprovados, [PR #52](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/52)/[#53](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/53) mergeados em `develop` — aguardando merge `develop`→`main`, validação de deploy/preview real e aceite do PO para fechar `Done`. Ampliada em 2026-08-19 com `ADR-012` (Aceita): Ports & Adapters (Clean Architecture seletiva) no domínio `chat`, backend e frontend — `US-14-03` (backend) implementada, Dev/QA/Tech Lead aprovados, PR para `develop` e aceite do PO pendentes; `US-14-04` (frontend) em implementação; `resume/` fica fora dos dois lados; convenção de port/adapter registrada para quando `admin` (Fase 12) e observabilidade (Fase 10) saírem de `draft`.

## Fases do roadmap e backlog correspondente

| Fase | Escopo | Backlog |
|---|---|---|
| Fase 0 — Preparação | Agentes + repositório | `docs/product/backlog/archive/fase-00/` (US-00-01 a US-00-02) — Arquivada |
| Fase 1 — Descoberta e planejamento | PRD, ADR, C4 | `docs/product/backlog/archive/fase-01/` (US-01-01 a US-01-03) — Arquivada |
| Fase 2 — Setup do projeto | Esqueleto Next.js + FastAPI, CI real | `docs/product/backlog/archive/fase-02/` (US-02-01 a US-02-04) — Arquivada |
| Fase 3 — MVP estático | Conteúdo real + componentes de UI + deploy inicial | `docs/product/backlog/archive/fase-03/` (US-03-01 a US-03-17) — 17/17 Arquivada |
| Fase 4 — Polimento | SEO, acessibilidade | `docs/product/backlog/archive/fase-04/` (US-04-01 a US-04-02) — 2/2 Arquivada |
| Fase 5 — Feature de IA (RAG) | ADR de RAG, chunking, embeddings, `/chat`, `ChatWidget`, deploy do backend | `docs/product/backlog/archive/fase-05/` (US-05-01 a US-05-09) — Arquivada |
| Fase 6 — Divulgação | README, LinkedIn, feedback | `docs/product/backlog/archive/fase-06/` (US-06-01–02 Done; US-06-03 Cancelada) — Arquivada |
| Fase 7 — Frontend & UX v2 | Contato (WhatsApp), responsividade, redesign, conteúdo, polimentos UX, mobile-first | `docs/product/backlog/archive/fase-07/` (US-07-01 a US-07-15) — Arquivada |
| Fase 8 — Segurança & Performance | Auditoria de segurança e performance, cold start do Render free tier, timeout OpenAI | `docs/product/backlog/archive/fase-08/` (US-08-01 a US-08-11 — 11/11 Done) — Arquivada |
| Fase 9 — Qualidade de Engenharia | SonarCloud no CI | `docs/product/backlog/archive/fase-09/` (US-09-01 — 1/1 Done) — Arquivada; demais frentes seguiram para a Fase 13 |
| Fase 10 — Observabilidade | Dashboard Grafana + logs centralizados | `PRD-008` — draft, sem histórias ainda; depende de ADR de stack |
| Fase 11 — Chat v2 + RAG Inteligente | Redesign e novas funcionalidades do `ChatWidget`; precisão de recuperação e acesso à web do RAG | `docs/product/backlog/archive/fase-11/` (US-11-01 a US-11-07 — 7/7 Done) — Arquivada; `PRD-009` + `PRD-011`, `ADR-010` |
| Fase 12 — Área Administrativa | Login + dashboard de métricas (sem lista de contatos — decisão 2026-08-06) | `PRD-010` — draft; bloqueada até ADRs de auth/persistência |
| Fase 13 — Qualidade de Engenharia (continuação) | Gate de cobertura no CI, boas práticas REST, achados reais do Sonar (backend/frontend) | `docs/product/backlog/archive/fase-13/` (US-13-01 a US-13-08, `US-13-03` cancelada/decomposta) — 7/7 histórias ativas Done — Arquivada |
| Fase 14 — Arquitetura & Modularização | Reorganização de backend/frontend por domínio (`resume`/`chat`, preparado para `admin`), DDD-lite; Ports & Adapters (Clean Architecture seletiva) no domínio `chat` | `docs/product/backlog/fase-14/` (US-14-01 a US-14-04) — US-14-01/02/03 com Dev/QA/Tech Lead aprovados, aguardando merge `develop`→`main`, validação de deploy/preview e aceite do PO; US-14-04 em implementação |

Fases 7-12 são a evolução pós-lançamento negociada em 2026-08-05 (ideias do autor) — ordem escolhida: valor visível ao visitante primeiro (UX), depois proteção do que já está no ar (segurança/performance), depois hardening de engenharia, antes de somar a maior feature nova (área administrativa). Detalhe completo do roadmap: `docs/product/roadmap.md`.
