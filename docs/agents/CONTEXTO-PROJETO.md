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
│   ├── components/     # Hero, ExperienceCard, SkillBadge, ChatWidget...
│   └── content/resume.json
├── backend/            # Python + FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── rag.py      # embeddings + busca por similaridade
│   │   └── chat.py     # endpoint /chat
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

- Frontend → Vercel (deploy automático a cada push, Root Directory = `frontend/`)
- Backend → Render (free tier) ou Google Cloud Run, build a partir de `backend/`
- API keys de IA nunca expostas no client; sempre via variável de ambiente / serverless function

## Governança sobre os agentes

O dono técnico final é o autor (humano). Sugestões dos agentes (arquitetura, código, testes) são propostas, não aprovação automática — decisões de escopo/stack ficam registradas em ADR/PRD, inclusive quando uma sugestão é rejeitada.

## Fase atual

Fase 0 (preparação): agentes sendo customizados para este projeto; estrutura de pastas do monorepo, `.gitignore`, branch protection e esqueleto de CI ainda não criados.
