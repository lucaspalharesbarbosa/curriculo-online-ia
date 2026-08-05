# US-05-03 — Geração de embeddings

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R04

**Como** sistema de RAG,
**quero** gerar embeddings dos chunks do currículo,
**para** viabilizar busca por similaridade semântica.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (função interna em `backend/app/rag.py`, sem endpoint HTTP próprio; consome a API de embeddings da OpenAI como cliente externo — request/response desse cliente é do SDK oficial, não um contrato deste projeto)
- [x] Modelagem de dados documentada — N/A (sem entidade relacionada; estrutura de armazenamento `{chunk, vetor}` cacheada em JSON já descrita no [ADR-003](../../../architecture/ADR-003-fluxo-rag.md) seção 3, não justifica diagrama ER)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — RAG; depende de US-05-01 (Done) e US-05-02 (Ready for Agent, ainda não implementada) — DoR fechado agora para não travar o início assim que US-05-02 concluir
- [x] ADR registrado se envolve decisão de stack nova — [ADR-003](../../../architecture/ADR-003-fluxo-rag.md) já define o provider (`text-embedding-3-small` da OpenAI, seção 2) e o formato de armazenamento (seção 3)
- [x] Variáveis de ambiente/segredos necessários identificados — `LLM_API_KEY` (backend, variável de ambiente; local via `.env` não versionado; produção configurada no painel do Render — detalhado em US-05-09)
- [x] Referência visual definida — N/A (sem UI, história de backend)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `backend/tests/test_rag.py` — client OpenAI mockado, valida dimensão do vetor retornado e associação correta chunk↔embedding
- Integração: N/A nesta história (integração completa do fluxo fica para US-05-06)
- Mocks necessários: mock do client `openai` (nunca bater na API real de embeddings em teste automatizado, por convenção do projeto)

### Critérios de aceite — precisam estar 100% fechados para Done
- [ ] CA-001: embeddings gerados conforme provider definido no ADR (US-05-01)
- [ ] CA-002: embeddings armazenados em JSON/memória, sem banco vetorial

### Fora de escopo
- Endpoint `/chat` (US-05-04)

### Dependências
- US-05-01 (Done), US-05-02 (Ready for Agent)

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 Implementar geração de embeddings em `backend/app/rag.py`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado (`pytest --cov`)
- [ ] Build/lint limpo (`ruff check`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [ ] Sem chave de API/secret exposto (client bundle ou repo)
- [ ] Documentação atualizada — só se o formato de armazenamento divergir da ADR-003 durante a implementação
- [ ] Deploy/preview verificado — N/A (sem UI)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Blocked — aguarda US-05-02 (implementação). DoR fechado em 2026-08-04; pronta para "Ready for Agent" assim que US-05-02 concluir.
