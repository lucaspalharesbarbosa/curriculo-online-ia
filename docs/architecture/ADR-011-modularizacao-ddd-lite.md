# ADR-011: Modularização por domínio (DDD-lite) no frontend e backend

## Status
Aceita

## Contexto

O autor propôs aplicar conceitos de DDD (Domain-Driven Design) e modularização no frontend (Next.js/TS) e no backend (Python/FastAPI), com o objetivo de deixar a aplicação mais organizada e preparada para crescer.

Motivação levantada pelo autor (não excludentes):
- **Aprendizado e portfólio** — praticar/demonstrar modularização por domínio como competência técnica.
- **Preparar para features futuras concretas** — Fase 12 (Área Administrativa: login + dashboard) e Fase 10 (Observabilidade), ambas ainda em `draft` no roadmap, introduzem domínios/preocupações que hoje não existem no código.

Nível de DDD escolhido pelo autor, dado que `docs/agents/CONTEXTO-PROJETO.md` orienta explicitamente contra over-engineering em projeto solo ("evitar processo/artefato de squad grande"): **DDD-lite / modularização por feature** — organização por domínio de negócio, sem os padrões táticos formais de DDD (Aggregates, Repositories genéricos, Value Objects sistemáticos, bounded contexts formais).

Estado atual do código (levantado nesta avaliação):

| Camada | Arquivos | Linhas |
|---|---|---|
| `backend/app/*.py` (flat) | `main.py`, `chat.py`, `rag.py`, `web_search.py`, `errors.py`, `env_bootstrap.py` | ~840 |
| `backend/app/models/resume.py` | 1 arquivo | 107 |
| `frontend/components/*` (flat) | ~15 componentes — seções de currículo (`ExperienceSection`, `EducationSection`, `ProjectsSection`, `Certifications`, `Recognitions`, `SummarySection`, `ResumeSidebar`, `MobileHero`, `RoleTypewriter`, `SectionHeading`, `CollapsibleSection`, `MobileBottomNav`, `SkillsBottomSheet`, `LinkButton`) + chat (`ProfileAssistChat`, `RagChatPanel`) | — |
| `frontend/lib/*.ts` | `utils.ts`, `skill-icons.ts`, `skill-blocks.tsx`, `mobile-nav.ts` | ~320 |
| `frontend/content/*` | `resume.json`, `resume.schema.ts`, `resume.ts` | já isolado como fonte de verdade |

Diagnóstico: o domínio de negócio hoje é simples — currículo (dado estático) + chat/RAG (recuperação + resposta). Não há entidades com invariantes/comportamento complexo que justifiquem os padrões táticos completos de DDD; o maior arquivo (`rag.py`, 371 linhas) já é internamente coeso (chunking → embeddings → busca de um único fluxo). Aplicar Aggregates/Repositories genéricos aqui geraria mais código de infraestrutura do que lógica de domínio resolvida.

Por outro lado, o sinal de crescimento é real e concreto: Fase 12 introduz um domínio genuinamente novo (autenticação, métricas de admin) que hoje **não tem lugar natural** na estrutura flat atual — ele nasceria misturado com `chat.py`/`components/`.

## Decisão

Adotar **modularização leve por domínio** (vertical slices) nos dois lados, sem os padrões táticos completos de DDD. Agrupar código por domínio de negócio (`resume`, `chat`, e futuramente `admin`) em vez de por tipo técnico (`components/`, `lib/` genéricos misturando tudo).

### Backend — proposta de estrutura

```
backend/app/
├── main.py              # composition root: cria o FastAPI, registra middlewares e routers
├── shared/               # cross-cutting, sem regra de negócio de domínio
│   ├── errors.py         # (era app/errors.py)
│   └── env_bootstrap.py  # (era app/env_bootstrap.py)
├── resume/                # domínio "currículo"
│   └── models.py          # (era app/models/resume.py)
└── chat/                  # domínio "chat/RAG"
    ├── router.py           # (era app/chat.py — rotas /chat, /chat/feedback)
    ├── rag.py              # chunking + embeddings + busca (move, sem split interno por ora)
    └── web_search.py       # Tavily (era app/web_search.py)
```

`backend/tests/` espelha a mesma árvore (`tests/chat/test_rag.py`, `tests/resume/test_resume_schema.py`, etc.), mantendo a convenção já registrada em `CONTEXTO-PROJETO.md`.

### Frontend — proposta de estrutura

```
frontend/
├── app/                    # rotas Next.js (App Router) — mantém como está, é convenção do framework
├── modules/
│   ├── resume/
│   │   ├── components/     # as ~13 seções de currículo listadas acima
│   │   └── lib/             # skill-icons.ts, skill-blocks.tsx, mobile-nav.ts
│   └── chat/
│       └── components/      # ProfileAssistChat, RagChatPanel
├── content/                 # mantém — já é a fonte de verdade isolada (resume.json/schema/ts)
└── lib/                     # só utilitário genérico de verdade (utils.ts), não específico de domínio
```

`app/api/chat/**` (rotas Next.js) continuam em `app/` por convenção do framework, mas passam a apenas orquestrar/chamar o módulo `modules/chat`.

### Fora de escopo desta decisão

- Aggregates, Repositories genéricos, Value Objects sistemáticos, bounded contexts formais, domain events — não entram agora.
- `rag.py` não é fragmentado internamente em múltiplos arquivos nesta rodada — só muda de pasta. Se crescer além do atual, split interno vira ADR/refactor separado.
- Estrutura de `content/` (resume.json/schema/ts) não muda — já resolve a separação dado × UI que motivou parte do pedido.

### Espaço para a motivação de aprendizado

Como o autor também citou aprendizado/portfólio como motivação, um lugar natural e proporcional para praticar **um** padrão tático de DDD (não o pacote completo) é o fluxo de RAG: expressar o resultado de recuperação como um Value Object explícito (ex.: `RetrievedChunk`/`RetrievalResult`, imutável, com as regras de ranking hoje implícitas em `rag.py`) em vez de dicts soltos. É uma aplicação pontual e opcional, não uma adoção geral de DDD tático — pode entrar como item separado da história de refactor, se o autor topar.

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| Manter estrutura atual (flat) | Zero esforço/risco imediato | Piora quando Fase 12 (admin) e Fase 10 (observabilidade) chegarem — domínios novos se misturariam no mesmo nível dos atuais |
| DDD tático completo (Entities, VOs, Aggregates, Repositories, bounded contexts formais) | Rigor "de livro"; mais superfície pra estudar os padrões | Cerimônia desproporcional a um domínio hoje simples (currículo estático + chat); volume de código de infraestrutura superaria o de lógica de negócio resolvida; contradiz a orientação explícita de `CONTEXTO-PROJETO.md` contra over-engineering em projeto solo |
| Modularização leve por domínio, sem DDD tático (**escolhida**) | Ganha limites claros de domínio para Fase 12/10 sem cerimônia extra; refactor é majoritariamente "mover arquivo" (baixo risco, comportamento não muda); segue a mesma lógica de organização por domínio que já existe no backlog (fases/épicos) | Não é "DDD" no sentido de manual — quem busca aprender os padrões táticos em si ganha menos disso (mitigado pela nota de "espaço para aprendizado" acima) |

## Consequências

**Positivas**
- Estrutura pronta para receber o módulo `admin/` (Fase 12) e transversais de observabilidade (Fase 10) sem precisar reabrir a árvore de pastas depois.
- Imports e limites de responsabilidade mais claros; menor acoplamento entre "seções de currículo" e "chat".
- Baixo risco funcional: é reposicionamento de arquivo + ajuste de imports, não reescrita de lógica.

**Negativas / custos**
- PR de escopo amplo tocando quase todo import do repo (frontend e backend) — precisa rodar a suíte completa (unitário + integração + e2e) antes de considerar concluído, não só os arquivos movidos.
- No frontend, `app/` continua no nível imposto pelo App Router — o ganho de modularização é parcial (só `components/`/`lib/` se beneficiam plenamente).
- Consome uma história de refactor dedicada (não é "de graça"); precisa de DoR/DoD como qualquer história, mesmo sendo reposicionamento.

**Depende de quê**
- Aprovação do autor sobre o nível adotado aqui (DDD-lite). Se decidir radicalizar para DDD tático depois, este ADR fica `Obsoleta` e um novo é aberto.
- Se aprovado, vira história(s) de refactor no backlog (`@product-owner` decompõe e numera a fase/épico) antes de `@senior-developer` implementar — sem mudança de comportamento observável, `@qa-engineer` valida que a suíte inteira segue verde após a movimentação.

## Referências
- docs/agents/CONTEXTO-PROJETO.md
- docs/architecture/ADR-003-fluxo-rag.md
- docs/architecture/ADR-010-fluxo-rag-v2-precisao-web.md
- docs/product/roadmap.md (Fase 10 — Observabilidade, Fase 12 — Área Administrativa)
