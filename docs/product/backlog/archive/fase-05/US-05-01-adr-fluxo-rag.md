# US-05-01 — ADR do fluxo de RAG

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R01

**Como** desenvolvedor,
**quero** uma decisão registrada de chunking, provider de embeddings e formato de armazenamento,
**para** implementar o RAG sem reabrir a decisão a cada história.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (história produz um documento de decisão, não um endpoint)
- [x] Modelagem de dados documentada — N/A (chunking de campos já existentes do `resume.json`; sem entidade nova/relacionada — diagrama ER não se aplica)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — RAG; nenhuma dependência (primeira história da Fase 05)
- [x] ADR registrado se envolve decisão de stack nova — N/A (a própria história É a produção do ADR; não há ADR anterior a referenciar)
- [x] Variáveis de ambiente/segredos necessários identificados — nome ainda não fixado (decisão de provider define se é `LLM_API_KEY` único ou `EMBEDDING_API_KEY` + `LLM_API_KEY` separados); local de configuração é justamente o CA-002 desta história
- [x] Referência visual definida — N/A (sem UI nova)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: N/A (entregável é um documento ADR, sem código)
- Integração: N/A
- Smoke manual (obrigatório para aceite): revisão do ADR — link para `docs/agents/CONTEXTO-PROJETO.md` e `docs/product/PRD-003-rag.md` corretos, tabela de alternativas com trade-offs reais (não genéricos), decisão final coerente com o perfil do projeto (solo, orçamento próximo de zero, volume baixíssimo)
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done
- [x] CA-001: ADR em `docs/architecture/` cobre estratégia de chunking, escolha de embeddings (ex.: `text-embedding-3-small` vs. modelo local), formato de armazenamento (JSON em memória) e estimativa de custo — [ADR-003](../../../architecture/ADR-003-fluxo-rag.md)
- [x] CA-002: decide onde fica a chave de API (variável de ambiente / serverless function, nunca client) — ADR-003 seção 5: `LLM_API_KEY` só no backend FastAPI, via variável de ambiente, configurada no painel do Render

### Fora de escopo
- Implementação (US-05-02 em diante)

### Dependências
- Nenhuma

### Épico / Prioridade
RAG — P3

### Tasks
- [x] T01 ADR do fluxo de RAG em `docs/architecture/` — **bloqueia as demais histórias desta fase** — [ADR-003](../../../architecture/ADR-003-fluxo-rag.md)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — N/A (documento, sem código)
- [x] Build/lint limpo (`npm run build`, type checking estrito) — N/A (documento, sem código tocado)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — N/A (artefato de arquitetura, sem diff de código — ver Vereditos)
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto — ADR não expõe chave; apenas nomeia a variável de ambiente
- [x] Documentação atualizada — `docs/architecture/README.md` indexa a ADR-003; `docs/agents/CONTEXTO-PROJETO.md` já refletia o desenho de alto nível, sem necessidade de alteração
- [x] Deploy/preview verificado (UI) — N/A
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | N/A — artefato de arquitetura (ADR), sem código a testar | 2026-08-04 | — |
| Tech Lead | `@tech-lead-review` | N/A — decisão de stack/provider registrada em ADR, não em diff de código; ponto de segurança do CA-002 (chave só no backend, via env var) já revisado dentro da própria ADR | 2026-08-04 | [ADR-003](../../../architecture/ADR-003-fluxo-rag.md) |
| PO | `@product-owner` | Done | 2026-08-04 | CA-001/002 fechados com ADR-003 registrada e indexada; DoD 100% fechado; sem código tocado, então gates de teste/build/TL ficam N/A com justificativa, seguindo o precedente de `US-01-02` |

**Status:** Done — ADR-003 (fluxo de RAG) registrada e aceita em 2026-08-04. US-05-02 a US-05-07 desbloqueadas para implementação.
