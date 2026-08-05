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

## Estrutura — monorepo

```
curriculo-online-ia/
├── frontend/           # Next.js + TS + Tailwind
│   ├── app/
│   ├── components/     # Hero, ExperienceCard, SkillBadge, Contact... (ChatWidget na Fase 05)
│   ├── content/
│   │   ├── resume.json
│   │   ├── resume.schema.ts   # Zod
│   │   └── resume.ts
│   └── public/         # PDF e assets
├── backend/            # Python + FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   │   └── resume.py   # Pydantic (espelha Zod)
│   │   ├── rag.py      # (Fase 05) embeddings + busca por similaridade
│   │   └── chat.py     # (Fase 05) endpoint /chat
│   └── requirements.txt
├── e2e/                # Playwright — testa frontend + backend juntos
│   └── playwright.config.ts
├── docs/
│   ├── product/        # PRD, backlog (product-owner)
│   ├── architecture/   # ADRs + C4 (arquiteto-ia-senior)
│   ├── qa/             # planos/relatórios de teste (qa-engineer)
│   └── agents/          # prompts dos agentes (este arquivo)
└── .github/workflows/
```

Frontend e backend evoluem no mesmo repositório e, quando a feature exigir, no mesmo PR — mas cada um com seu próprio pipeline de CI.

## Convenção de nomenclatura de documentos

Todo documento gerado por um agente (PO, Arquiteto, QA) segue `TIPO-NNN-slug.md`: `NNN` sequencial com 3 dígitos, **nunca reaproveitado** (mesmo se o documento for descontinuado, o número não volta a ser usado); `slug` em `kebab-case`, minúsculo.

| Tipo | Local | Padrão | Exemplo |
|---|---|---|---|
| PRD (épico) | `docs/product/` | `PRD-NNN-<epico>.md` | `PRD-001-conteudo.md` |
| Backlog (histórias/tasks) | `docs/product/backlog/fase-NN/` | `US-FF-NN-<slug>.md` — uma história por arquivo; `FF` é o número da fase de implementação (não do épico) e `NN` a sequência dentro dela, então o ID já é único no backlog inteiro (`US-03-01` ≠ `US-05-01`); `slug` descreve a história no nome do arquivo. A tabela "Histórias" do PRD de origem linka para o arquivo | `docs/product/backlog/fase-03/US-03-01-schema-resume-json.md` |

Fase com **todas** as histórias `Done` é candidata a arquivamento em `docs/product/backlog/archive/fase-NN/` (mesmo nome de arquivo e ID, IDs nunca renumerados) — workflow completo em `.claude/skills/product-owner/references/archive-workflow.md`.
| ADR | `docs/architecture/` | `ADR-NNN-<titulo>.md` | `ADR-001-stack-inicial-monorepo.md` |
| Diagrama C4 | `docs/architecture/` | `C4-NNN-<titulo>.md` | `C4-001-contexto-containers.md` |
| Imagem de diagrama C4 (renderizada, embutida no `.md` correspondente) | `docs/architecture/images/` | `C4-NNN-<slug-diagrama>.svg`, com `slug-diagrama` sempre prefixado pelo nível C4 (`n1`/`n2`/`n3`/`n4`/`seq`) | `C4-001-n1-contexto.svg` |
| Diagrama de dados (ER) — DoR de história que introduz/altera entidades relacionadas | `docs/architecture/` | `DATA-NNN-<titulo>.md` | `DATA-001-schema-curriculo.md` |
| Imagem de diagrama de dados (renderizada) | `docs/architecture/images/` | `DATA-NNN-<slug-diagrama>.svg` | `DATA-001-er.svg` |
| Relatório QA (quando salvo em arquivo, não só handoff) | `docs/qa/` | `QA-NNN-<escopo>.md` | `QA-001-hero-sobre.md` |

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

Fase 0 (preparação) concluída — registrada retroativamente em `docs/product/backlog/fase-00/` ([US-00-01](../product/backlog/fase-00/US-00-01-customizacao-agentes-ia.md): agentes customizados; [US-00-02](../product/backlog/fase-00/US-00-02-estrutura-inicial-repositorio.md): monorepo, `.gitignore`, branch protection, CI esqueleto, PR inicial).

Fase 1 (descoberta e planejamento) concluída — registrada retroativamente em `docs/product/backlog/fase-01/`: PRD criado pelo `product-owner` para os 4 épicos ([US-01-01](../product/backlog/fase-01/US-01-01-prd-backlog-inicial.md)), `ADR-001` + diagramas C4 de contexto/containers registrados pelo `arquiteto-ia-senior` ([US-01-02](../product/backlog/fase-01/US-01-02-adr-stack-c4-contexto.md)) e DoR/DoD padrão + cadência de acompanhamento revisados formalmente pelo `scrum-master` ([US-01-03](../product/backlog/fase-01/US-01-03-dor-dod-scrum-master.md) — Done). Pendências de conteúdo do autor (projetos/contato/PDF) foram resolvidas na Fase 03 — ver `docs/product/README.md`.

Fase 2 (setup do projeto) concluída — [US-02-01](../product/backlog/fase-02/US-02-01-setup-nextjs.md) (Next.js + TS + Tailwind), [US-02-02](../product/backlog/fase-02/US-02-02-setup-fastapi.md) (FastAPI + health check), [US-02-03](../product/backlog/fase-02/US-02-03-ci-frontend-real.md) e [US-02-04](../product/backlog/fase-02/US-02-04-ci-backend-real.md) (CI real) — Done.

Fase 3 (MVP estático) **concluída** — 17/17 histórias Done (PR #4 mergeado em `develop`; [US-03-17](../product/backlog/fase-03/US-03-17-deploy-inicial-vercel.md) — deploy Vercel — Done em 2026-08-04, já mergeado em `develop`). URL de produção: https://curriculo-online-ia.vercel.app.

Fase 4 (polimento) **concluída** — 2/2 histórias Done: [US-04-01](../product/backlog/fase-04/US-04-01-seo-basico.md) (SEO básico — metadata/Open Graph derivados de `resume.hero`) e [US-04-02](../product/backlog/fase-04/US-04-02-acessibilidade-basica.md) (acessibilidade — contraste AA corrigido em modo escuro; `alt` e navegação por teclado já conformes), ambas em 2026-08-04 na branch `feature/fase-04-polimento`, aguardando PR para `develop`.

Fase 5 (RAG) **concluída** — 9/9 histórias Done, na branch `feature/US-05-01-adr-fluxo-rag`: [US-05-01](../product/backlog/fase-05/US-05-01-adr-fluxo-rag.md) (ADR-003), [US-05-02](../product/backlog/fase-05/US-05-02-chunking-resume-json.md) (chunking), [US-05-03](../product/backlog/fase-05/US-05-03-geracao-embeddings.md) (embeddings), [US-05-04](../product/backlog/fase-05/US-05-04-endpoint-chat.md) (endpoint `/chat`), [US-05-05](../product/backlog/fase-05/US-05-05-chat-widget-frontend.md) (`ChatWidget`), [US-05-06](../product/backlog/fase-05/US-05-06-testes-fluxo-chat.md) (testes do fluxo — 20 testes, cobertura 97% no backend tocado), [US-05-07](../product/backlog/fase-05/US-05-07-seguranca-chat.md) (CORS + rate limit), [US-05-09](../product/backlog/fase-05/US-05-09-env-vars-segredos.md) (`.env.example` + docs de segredos) e [US-05-08](../product/backlog/fase-05/US-05-08-deploy-backend.md) (deploy do backend no Render, `curriculo-online-backend`, `/health` confirmado em produção — Done em 2026-08-05). Candidata a arquivamento (`references/archive-workflow.md`) — pendente de confirmação com o dono do produto.

Fase 6 (divulgação) ainda não iniciada formalmente — checklist em `docs/product/roadmap.md` (Fase 6), sem histórias de backlog. Fases 7 a 12 (evolução pós-lançamento: UX v2, segurança/performance, qualidade de engenharia, observabilidade, chat v2, área administrativa) estão em `draft` — PRDs criados (`PRD-005` a `PRD-010`), histórias ainda não decompostas.

## Fases do roadmap e backlog correspondente

| Fase | Escopo | Backlog |
|---|---|---|
| Fase 0 — Preparação | Agentes + repositório | `docs/product/backlog/fase-00/` (US-00-01 a US-00-02) — Done |
| Fase 1 — Descoberta e planejamento | PRD, ADR, C4 | `docs/product/backlog/fase-01/` (US-01-01 a US-01-03) — Done |
| Fase 2 — Setup do projeto | Esqueleto Next.js + FastAPI, CI real | `docs/product/backlog/fase-02/` (US-02-01 a US-02-04) — Done |
| Fase 3 — MVP estático | Conteúdo real + componentes de UI + deploy inicial | `docs/product/backlog/fase-03/` (US-03-01 a US-03-17) — 17/17 Done |
| Fase 4 — Polimento | SEO, acessibilidade | `docs/product/backlog/fase-04/` (US-04-01 a US-04-02) — 2/2 Done |
| Fase 5 — Feature de IA (RAG) | ADR de RAG, chunking, embeddings, `/chat`, `ChatWidget`, deploy do backend | `docs/product/backlog/fase-05/` (US-05-01 a US-05-09) — 9/9 Done |
| Fase 6 — Divulgação | README, LinkedIn, feedback | Checklist em `docs/product/roadmap.md`, sem histórias formais |
| Fase 7 — Frontend & UX v2 | Contato ampliado (WhatsApp), responsividade, redesign, uso mais completo do Next.js | `PRD-005` — draft, sem histórias ainda |
| Fase 8 — Segurança & Performance | Auditoria de segurança e performance, cold start do Render free tier | `PRD-006` — draft, sem histórias ainda |
| Fase 9 — Qualidade de Engenharia | SonarCloud, gate de cobertura no CI, boas práticas REST, refactor guiado por achados | `PRD-007` — draft, sem histórias ainda |
| Fase 10 — Observabilidade | Dashboard Grafana + logs centralizados | `PRD-008` — draft, sem histórias ainda; depende de ADR de stack |
| Fase 11 — Chat v2 | Redesign e novas funcionalidades do `ChatWidget` | `PRD-009` — draft, sem histórias ainda |
| Fase 12 — Área Administrativa | Login, dashboard, lista de contatos recebidos | `PRD-010` — draft, sem histórias ainda; bloqueada até decidir captura de contato (PRD-005) e ADR de auth/persistência |

Fases 7-12 são a evolução pós-lançamento negociada em 2026-08-05 (ideias do autor) — ordem escolhida: valor visível ao visitante primeiro (UX), depois proteção do que já está no ar (segurança/performance), depois hardening de engenharia, antes de somar a maior feature nova (área administrativa). Detalhe completo do roadmap: `docs/product/roadmap.md`.
