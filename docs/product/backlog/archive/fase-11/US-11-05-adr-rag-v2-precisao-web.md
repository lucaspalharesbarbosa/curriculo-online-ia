# US-11-05 — ADR: fluxo de RAG v2 (precisão de recuperação + acesso à web)

**Fase:** Fase 11 — Chat v2 + RAG Inteligente
**Épico de origem:** RAG (`PRD-011-rag-inteligente.md`)

**Como** autor do projeto,
**quero** uma decisão de arquitetura registrada sobre como corrigir a recuperação de contexto do RAG e sobre como (e quando) o assistente pode buscar dados na web,
**para** que a implementação siga uma estratégia avaliada — não um patch ad-hoc — e o `/chat` continue seguro, previsível e barato de operar.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A, esta história produz um ADR, não código
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A, sem entidade nova
- [x] Plano de testes definido — N/A, decisão de arquitetura; validação é dos CAs abaixo
- [x] Épico e dependências identificados — RAG (`PRD-011`); nenhuma dependência de outra história
- [x] ADR registrado se envolve decisão de stack nova — é a própria história (auto-referente)
- [x] Variáveis de ambiente/segredos necessários identificados — a ADR **decide** o nome (ex.: variável para a chave do provedor de busca web); não precisa existir antes
- [x] Referência visual definida — N/A, não é UI
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante — investigação inicial já feita (ver seção "Evidência" abaixo)

#### Evidência do problema (ponto de partida da investigação)

`backend/app/chat.py` busca contexto via `rag.search()` (similaridade de cosseno pura, `TOP_K=3`, `SIMILARITY_THRESHOLD=0.2`) sem nenhum roteamento por seção (`experience`, `education`, `skill`...) nem ordenação por recência. Para perguntas como "onde estudei?" ou "qual a última empresa que trabalhei?", a similaridade semântica da pergunta com os chunks não garante que o chunk certo — o da seção `education`, ou o `experience` com a data mais recente — fique entre os 3 primeiros.

#### Plano de testes
- N/A — este item do DoR não se aplica a uma história de ADR.

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: ADR registrada em `docs/architecture/ADR-010-fluxo-rag-v2-precisao-web.md`, descrevendo a causa raiz do erro de recuperação atual com pelo menos os dois exemplos reportados pelo autor ("onde estudei?", "qual a última empresa que trabalhei?")
- [x] CA-002: ADR define a estratégia de correção da recuperação — como o roteamento por seção/palavra-chave e a ordenação por recência (para perguntas de "último/atual") se encaixam no índice de embeddings já existente, sem exigir banco vetorial novo
- [x] CA-003: ADR decide o mecanismo de busca web (Tavily, tier gratuito de 1.000 créditos/mês), nome da variável de ambiente (`WEB_SEARCH_API_KEY`), critério objetivo de quando acionar (`rag.search()` abaixo do `SIMILARITY_THRESHOLD` **e** pergunta cita entidade do `resume.json`) e como a resposta sinaliza fonte externa (campo `source: "resume" | "web"`)
- [x] CA-004: ADR avalia o impacto no contrato do `/chat` (response ganha campo aditivo `source`, request inalterado) e define timeout (8s, sem retry) e fallback da chamada de busca web, seguindo o padrão de `ADR-004`

### Fora de escopo
- Implementação do código — feita em US-11-06 (recuperação) e US-11-07 (busca web), a partir desta ADR
- Decisão sobre streaming de resposta do `/chat` — fora do escopo desta ADR (ver US-11-03, que evita essa mudança de contrato)

### Dependências
- Nenhuma. Bloqueia US-11-06 e US-11-07.

### Épico / Prioridade
RAG (`PRD-011`) — P1

### Tasks
- [x] T01 Reproduzir os casos que falham ("onde estudei?", "qual a última empresa que trabalhei?" e variações) contra o `/chat` atual e documentar a causa raiz observada
- [x] T02 [P] Avaliar provedores de busca web viáveis no tier gratuito/baixo custo (Tavily, Serper, Bing Search API) e registrar a escolha com justificativa de custo/limite de uso — Tavily escolhido (Bing Search API está aposentada pela Microsoft)
- [x] T03 Registrar `docs/architecture/ADR-010-fluxo-rag-v2-precisao-web.md` com as decisões dos CA-001 a CA-004

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — N/A, história não produz código
- [x] Build/lint limpo — N/A
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — coerência confirmada: a implementação de `US-11-06`/`US-11-07` segue a ADR sem contradição, sem conflito com `ADR-003`/`ADR-004`
- [x] Contrato de API implementado bate com o documentado no DoR — N/A (a ADR é o documento, não uma implementação)
- [x] Sem chave de API/secret exposto — N/A, nenhuma chave é criada nesta história
- [x] Documentação atualizada — sim, `docs/architecture/ADR-010-fluxo-rag-v2-precisao-web.md`
- [x] Deploy/preview verificado — N/A
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — falta linha do PO (Fase 6)
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | N/A | 2026-08-18 | História produz um documento de arquitetura, não código/comportamento executável — fora do escopo de validação do QA. Comportamento resultante da decisão foi validado nas histórias de implementação (`US-11-06`, `US-11-07`) |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-18 | `ADR-010` coerente com `ADR-003`/`ADR-004`; implementação em `US-11-06`/`US-11-07` não diverge do decidido. Sem Critical/High |
| PO | `@product-owner` | Done | 2026-08-18 | CA-001 a CA-004 fechados; DoD 100% (itens N/A justificados: história produz documento, não código); QA/Tech Lead preenchidos |

**Status:** Done
