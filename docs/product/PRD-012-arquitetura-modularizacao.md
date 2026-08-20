# PRD-012 — Arquitetura & Modularização

**Status:** ready-for-agent
**Épico:** Arquitetura & Modularização
**Prioridade:** P2

## Problema

Backend (`backend/app/*.py`) e frontend (`frontend/components/`, `frontend/lib/`) organizam o código por tipo técnico, não por domínio de negócio. Isso funciona hoje (domínio simples: currículo estático + chat/RAG), mas a Fase 12 (Área Administrativa: login + dashboard) e a Fase 10 (Observabilidade) vão introduzir domínios/preocupações novas que não têm lugar natural na estrutura atual — nasceriam misturadas com o código de currículo/chat existente.

## Objetivo

Backend e frontend organizados por domínio de negócio (`resume`, `chat`, preparado para `admin` futuramente), sem mudança de comportamento observável — mesmo comportamento, estrutura de pastas diferente. Base documentada em [`ADR-011`](../architecture/ADR-011-modularizacao-ddd-lite.md) (Aceita).

## Escopo

### Incluído
- Backend: `app/resume/`, `app/chat/` (router + rag + web_search), `app/shared/` (errors, env_bootstrap) — conforme `ADR-011`
- Frontend: `modules/resume/` (componentes de seção + lib específica), `modules/chat/` (componentes de chat) — conforme `ADR-011`
- Reorganização dos testes espelhando a nova árvore, nos dois lados
- Ports & Adapters (Clean Architecture seletiva) no domínio `chat`, backend e frontend — conforme `ADR-012`: interfaces para os providers externos (OpenAI, Tavily, HTTP do chat) e use case explícito, sem tocar `resume/`
- Atualização de `docs/agents/CONTEXTO-PROJETO.md` (seção "Estrutura — monorepo") refletindo a estrutura nova

### Excluído
- Padrões táticos completos de DDD (Aggregates, Repositories genéricos, Value Objects sistemáticos, bounded contexts formais) — decisão registrada em `ADR-011`, desproporcional ao domínio atual
- Fragmentação interna de `backend/app/chat/rag.py` (371 linhas) em múltiplos arquivos além do necessário para receber `EmbeddingProvider` por parâmetro (`US-14-03`) — chunking/ranking continuam no mesmo arquivo
- Value Object para resultado de recuperação do RAG (`RetrievedChunk`/`RetrievalResult`) — sugestão pontual de aprendizado registrada em `ADR-011`, **opcional**, não faz parte do DoD deste épico; vira história própria só se o autor pedir explicitamente
- Clean Architecture completa (4 camadas) em `resume/` ou no restante do frontend — decisão registrada em `ADR-012`, sem I/O externo a abstrair
- Ports/adapters para `admin` (Fase 12) ou observabilidade (Fase 10) — `ADR-012` registra a convenção a seguir quando essas fases saírem de `draft`; não é trabalho deste épico
- Qualquer mudança de comportamento/UI/contrato de API — é reposicionamento/desacoplamento de código, não feature nova

## Persona

O próprio autor, como mantenedor do código a médio prazo, e o pipeline de agentes (Dev/QA/Tech Lead) que passa a navegar a árvore nova.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| Modularização do backend por domínio (`resume`/`chat`/`shared`) | P2 | [US-14-01](backlog/fase-14/US-14-01-modularizacao-backend-dominio.md) |
| Modularização do frontend por domínio (`modules/resume`/`modules/chat`) | P2 | [US-14-02](backlog/fase-14/US-14-02-modularizacao-frontend-dominio.md) |
| Ports & Adapters no domínio chat do backend | P2 | [US-14-03](backlog/fase-14/US-14-03-ports-adapters-chat-backend.md) |
| Port `ChatClient` no domínio chat do frontend | P2 | [US-14-04](backlog/fase-14/US-14-04-chat-client-frontend.md) |

## Riscos

- PR de escopo amplo tocando quase todo import do repo — mitigação: rodar suíte completa (unitário + integração + e2e) antes de considerar concluído, não só os arquivos movidos
- Conflito com trabalho em paralelo em `chat.py`/`components/` — mitigação: as duas histórias (backend/frontend) são independentes entre si, mas cada uma deve ser um PR próprio, mergeado rápido, para minimizar janela de conflito
- Tentação de aproveitar o PR pra "melhorar mais um pouco" além do reposicionamento — fora de escopo por definição (ver "Excluído"); qualquer achado real durante o refactor vira história separada, não é resolvido inline

## DoR do épico
- [x] Toda história do épico tem seu próprio DoR fechado — ver `US-14-01`/`US-14-02`/`US-14-03`/`US-14-04`
- [x] Tasks decompostas (`references/task-breakdown-guide.md`)
