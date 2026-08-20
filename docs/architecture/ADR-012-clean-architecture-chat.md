# ADR-012: Elementos de Clean Architecture (Ports & Adapters) no domínio `chat` (backend + frontend) e convenção para módulos futuros

## Status
Aceita

## Contexto

`ADR-011` (Aceita) decidiu **DDD-lite / modularização por domínio** para backend e frontend, rejeitando explicitamente os padrões táticos completos de DDD por desproporção ao domínio atual (currículo estático + chat/RAG). `US-14-01` (backend) já está `Done`: `backend/app/` reorganizado em `resume/`, `chat/`, `shared/`. `US-14-02` (frontend) segue `Ready for Agent`.

O autor pediu para reavaliar aplicando **Clean Architecture** (Uncle Bob) — camadas concêntricas sob a **Regra de Dependência** (código de domínio não conhece framework/infra; interfaces/ports são implementadas por adapters externos) — e explicitamente pensando no **crescimento** da aplicação, front e back, não só no estado hoje.

### Dor de hoje (concreta, já existe)

`backend/app/chat/` acopla direto a SDKs externos em 3 pontos, sem interface entre a lógica de negócio (ranking, roteamento por seção/recência — `ADR-010`) e o I/O:

| Arquivo | Acoplamento externo direto |
|---|---|
| `rag.py:174` | `get_client()` instancia `openai.OpenAI` direto |
| `router.py:117,132` | `rag.get_client().chat.completions.create(...)` direto |
| `web_search.py:39` | `httpx.post` direto para a API do Tavily |

No frontend, `hooks/useResumeChat.ts` chama `fetch("/api/chat")`/`fetch("/api/chat/feedback")` direto (linhas 83, 137) — mesma forma de acoplamento, um nível abaixo: a lógica de estado do chat (mensagens, loading, feedback otimista) está misturada com o detalhe de transporte HTTP.

### Crescimento já mapeado (não hipotético — já está no roadmap)

- `PRD-010` (Área Administrativa, Fase 12, `draft`): autenticação single-user **ainda não decidida** (NextAuth com allowlist? magic link?) e persistência de métricas **ainda não decidida** (Postgres gerenciado — Neon/Supabase? SQLite no Render? ou só analytics externo sem persistência própria). Duas dependências externas novas, ambas com mais de uma opção concreta em aberto.
- `PRD-008` (Observabilidade, Fase 10, `draft`): stack de métricas/logs **ainda não decidida** (Grafana Cloud? Better Stack? Axiom? Loki?). Mais uma dependência externa trocável.

Ou seja: o projeto já sabe, pelo próprio backlog, que vai ganhar 2-3 dependências externas novas (auth, persistência, observabilidade) cujo provider concreto ainda está em aberto — exatamente o cenário em que um port (interface) paga o investimento: a ADR de auth/persistência/observability, quando escrita, escolhe a implementação sem precisar redesenhar como o resto do código consome esses serviços.

## Decisão

Aplicar Clean Architecture **seletivamente e de forma leve** — não as 4 camadas completas em pastas próprias (`entities/`, `usecases/`, `adapters/`, `frameworks/`) espalhadas pelo repo inteiro, mas o conceito central (Regra de Dependência via **Ports & Adapters**) em dois lugares:

1. **Agora, no domínio `chat`** (backend e frontend) — onde a dor já existe hoje, código real, sem especulação.
2. **Como convenção documentada para quando `admin` (Fase 12) e observabilidade (Fase 10) forem implementados** — não construída antecipadamente (não existe código de admin/observability ainda; criar ports para uma implementação que não existe seria a mesma especulação que `ADR-011` já rejeitou para DDD tático).

**`resume/` (backend e frontend) continua fora de escopo** — dado estático, sem I/O externo, sem provider trocável no horizonte. Aplicar port ali seria abstrair uma leitura de JSON que só terá uma implementação possível.

### 1. Backend — `backend/app/chat/`

```
backend/app/chat/
├── router.py              # Frameworks & Drivers: FastAPI, rate limit, HTTP, wiring via Depends()
├── service.py               # Use Case: orquestra pergunta → resposta (hoje inline em router.py)
├── ports.py                  # Interfaces (typing.Protocol): EmbeddingProvider, ChatCompletionProvider, WebSearchProvider
├── adapters/
│   ├── openai_adapter.py       # implementa EmbeddingProvider + ChatCompletionProvider com openai.OpenAI
│   └── tavily_adapter.py        # implementa WebSearchProvider (era web_search.py)
└── rag.py                        # domínio: chunking, ranking, roteamento — passa a receber EmbeddingProvider por parâmetro em vez de chamar get_client() direto
```

### 2. Frontend — `frontend/modules/chat/` (após `US-14-02`)

```
frontend/modules/chat/
├── components/              # ProfileAssistChat, RagChatPanel (US-14-02, sem mudança aqui)
├── lib/
│   ├── chat-client.ts          # port: interface ChatClient { sendMessage(question), sendFeedback(...) }
│   └── http-chat-client.ts      # adapter: implementa ChatClient via fetch para /api/chat, /api/chat/feedback
└── hooks/
    └── useResumeChat.ts          # use case: orquestra estado (mensagens, loading, feedback otimista), recebe ChatClient em vez de chamar fetch direto
```

`app/api/chat/**` (rotas Next.js) continuam como estão — já são a camada "Frameworks & Drivers" (proxy HTTP same-origin para o FastAPI), não precisam mudar.

### 3. Convenção para módulos futuros (documentada, não implementada agora)

Quando `admin` (Fase 12) e observabilidade (Fase 10) saírem de `draft`, a ADR de cada um define o port correspondente **como parte da própria decisão de stack**, seguindo o mesmo padrão do item 1:

- Auth (Fase 12): port `AuthProvider` (ex.: `login`, `getSession`) — a ADR de auth escolhe NextAuth/magic link/outro como adapter, sem vazar a escolha para os componentes do dashboard
- Persistência de métricas (Fase 12): port `MetricsRepository`, se a ADR decidir por banco (Postgres gerenciado ou SQLite) em vez de só analytics externo
- Observabilidade (Fase 10): port `LogSink`/`MetricsSink` — a ADR de stack (Grafana/Better Stack/Axiom/Loki) escolhe o adapter

Este item **não abre trabalho novo agora** — só registra que a próxima ADR dessas fases deve nascer já no formato port/adapter, evitando o retrofit que `chat/` está passando agora.

### Ports em `Protocol`, sem framework de DI

- `ports.py`/`chat-client.ts`: `typing.Protocol` (Python) / `interface` (TypeScript) — fakes de teste implementam a forma sem herdar nada
- Sem framework de DI em nenhum dos dois lados — FastAPI `Depends()` resolve a injeção no backend; no frontend, a instância do adapter é passada como parâmetro/prop (React já resolve isso sem lib extra)

### Fora de escopo desta decisão

- Camada de Entities separada — `Chunk`/`EmbeddedChunk` já são dataclasses simples, ficam onde estão
- Aplicar a `resume/` (backend e frontend) — sem I/O externo, sem ganho
- Construir ports de `admin`/observabilidade agora — não há implementação real para abstrair ainda; vira parte da ADR de cada fase quando ela sair de `draft`
- Framework de DI (`dependency-injector`, `InversifyJS` etc.)
- Mudar o algoritmo de ranking/roteamento (`ADR-010`) ou o comportamento visível do chat — só muda de onde o código busca a dependência externa

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| Manter como está | Zero esforço/risco | Dor de hoje (teste via monkeypatch de SDK, troca de provider tocando múltiplos arquivos) não resolvida; cada ADR futura (auth/persistência/observability) reabre a mesma discussão do zero |
| Clean Architecture completa, 4 camadas, em todo o backend+frontend (`resume` incluso, `admin`/observability construídos preventivamente) | Rigor "de livro" | Cerimônia desproporcional — `resume/` sem I/O não ganha nada; construir ports para `admin`/observability sem implementação real é abstração especulativa (YAGNI), o mesmo erro que `ADR-011` já rejeitou para DDD tático |
| Ports & Adapters em `chat/` (backend + frontend) agora + convenção documentada para `admin`/observability quando saírem de `draft` (**escolhida**) | Resolve a dor real hoje nos dois lados; simétrico front/back; deixa a próxima ADR de auth/persistência/observability nascer no formato certo sem trabalho extra agora | Não é Clean Architecture "completa" — mitigado por ser exatamente esse o objetivo (aplicar o princípio onde há dependência real, documentar o padrão para o resto) |

## Consequências

**Positivas**
- `service.py` (backend) e `useResumeChat.ts` (frontend) testáveis com fakes simples, sem tocar rede/SDK/`fetch` global
- Trocar provider (LLM, embeddings, busca web, e futuramente auth/persistência/observability) vira escrever um novo adapter, sem tocar a lógica de orquestração
- Simetria de padrão entre backend e frontend facilita a leitura cruzada (e o pipeline de agentes navegando o código)
- `admin` (Fase 12) e observabilidade (Fase 10) nascem já desacopladas do provider escolhido — a ADR de cada uma decide o adapter, não precisa redesenhar a estrutura depois

**Negativas / custos**
- Mais um nível de indireção para 3 chamadas externas no backend + 2 no frontend — ganho compensa se o autor valoriza testabilidade/troca de provider sobre simplicidade máxima
- Toca `router.py`, `rag.py`, `web_search.py` (backend) e `useResumeChat.ts` (frontend) — precisa rodar suíte completa (pytest + Vitest) antes de considerar concluído
- Duas histórias de refactor não previstas no `PRD-012` original (backend e frontend) — viram `US-14-03`/`US-14-04` se aprovado

**Depende de quê**
- Aprovação do autor sobre este escopo (chat-only nos dois lados agora; convenção para o resto). Se aprovado, `@product-owner` decompõe as histórias na Fase 14; `@senior-developer` implementa depois/em paralelo de `US-14-02` (arquivos distintos, baixo risco de conflito); sem mudança de comportamento observável, `@qa-engineer` valida suíte completa verde nos dois serviços.
- Se o autor preferir escopo diferente (ex.: só backend agora, frontend depois; ou incluir `resume/`), este ADR é revisado antes de virar `Aceita`.

## Referências
- docs/agents/CONTEXTO-PROJETO.md
- docs/architecture/ADR-011-modularizacao-ddd-lite.md
- docs/architecture/ADR-010-fluxo-rag-v2-precisao-web.md
- docs/product/PRD-012-arquitetura-modularizacao.md
- docs/product/PRD-010-area-administrativa.md (autenticação/persistência ainda em `draft`)
- docs/product/PRD-008-observabilidade.md (stack de observabilidade ainda em `draft`)
