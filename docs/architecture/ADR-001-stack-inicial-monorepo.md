# ADR-001: Stack inicial e monorepo (Next.js + FastAPI)

## Status
Aceita

## Contexto

O Currículo Online é um produto pessoal solo: site de currículo com um assistente de chat (RAG) sobre a trajetória do autor. A decisão de stack foi tomada durante o planejamento inicial e documentada em `docs/agents/CONTEXTO-PROJETO.md`, mas nunca tinha sido registrada como ADR formal. Este documento formaliza retroativamente essa decisão, que já está em vigor desde a Fase 0 (estrutura de pastas, `.gitignore`, CI esqueleto já criados sobre ela).

O autor atua profissionalmente com Java e Python; o ecossistema de RAG/embeddings/LLM (LangChain, LlamaIndex, SDKs de IA) é majoritariamente Python, mais maduro para esse fim do que o equivalente em Java.

## Decisão

- **Frontend**: Next.js + TypeScript + Tailwind CSS, hospedado na Vercel
- **Backend de IA (RAG)**: Python + FastAPI, hospedado no Render (free tier) ou Google Cloud Run
- **Estrutura**: monorepo (`frontend/`, `backend/`, `e2e/`, `docs/`) — um repositório só, cada serviço com seu próprio pipeline de CI (`frontend-ci.yml`, `backend-ci.yml`)
- **Dados**: `frontend/content/resume.json` como fonte única de verdade do conteúdo do currículo, consumido pelo frontend (import direto) e pelo backend (chunking para RAG)
- **Java fica fora deste projeto**: reservado para o projeto #2 do portfólio (ex.: API Spring Boot), para não forçar duas linguagens de backend no mesmo produto pequeno

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| 100% Python (Flask/FastAPI + Jinja2, sem Next.js) | Mais simples, um serviço só, mais rápido de montar sozinho | Visual mais tradicional; frontend fica sem TypeScript/componentização; menos aderente ao que o mercado espera de um site de portfólio moderno |
| Java (Spring Boot) para o backend de RAG | Aproveita a stack forte atual do autor | Ecossistema de RAG/embeddings em Java é bem mais imaturo; aumentaria o custo de aprendizado justo na parte que é o diferencial do projeto |
| Multi-repo (frontend e backend em repositórios separados) | Pipelines de CI totalmente isolados | Overhead de coordenação desproporcional para um projeto solo com dois serviços pequenos e interligados |
| GitHub Pages para hospedagem do frontend | Simples, direto do repo | Só serve site 100% estático — não suporta Serverless Functions, necessárias para não expor chave de API no client durante o fluxo de chat |

## Consequências

- Dois pipelines de CI (`frontend-ci.yml`, `backend-ci.yml`) e um workflow de E2E dedicado (`e2e/`), todos vivendo no mesmo repositório
- PRs que tocam frontend e backend ao mesmo tempo (quando a feature exigir) passam pelos dois checks de CI
- Qualquer decisão de mudar frontend (ex.: sair de Next.js) ou backend (ex.: sair de FastAPI) exige novo ADR — não deve ser reaberta em uma história comum
- RAG segue "do zero", sem framework pesado (LangChain/LlamaIndex) nem banco vetorial — decisão detalhada em ADR futuro do fluxo de RAG ([US-05-01](../product/backlog/fase-05/US-05-01-adr-fluxo-rag.md)), quando essa fase entrar em execução

## Referências
- `docs/agents/CONTEXTO-PROJETO.md`
- `docs/product/PRD-003-rag.md` e [`docs/product/backlog/fase-05/US-05-01-adr-fluxo-rag.md`](../product/backlog/fase-05/US-05-01-adr-fluxo-rag.md) (ADR do fluxo de RAG, decisão futura e específica)
