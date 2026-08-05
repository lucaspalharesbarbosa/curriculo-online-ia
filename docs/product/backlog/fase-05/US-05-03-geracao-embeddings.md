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
- [x] CA-001: embeddings gerados conforme provider definido no ADR (US-05-01) — `embed_text()`/`embed_chunks()` usam `text-embedding-3-small` via SDK `openai` em [`backend/app/rag.py`](../../../../backend/app/rag.py)
- [x] CA-002: embeddings armazenados em JSON/memória, sem banco vetorial — `save_index()`/`load_index()`/`load_or_build_index()` cacheiam em `backend/app/rag_index.json`, gerado 1x

### Fora de escopo
- Endpoint `/chat` (US-05-04)

### Dependências
- US-05-01 (Done), US-05-02 (Done)

### Épico / Prioridade
RAG — P3

### Tasks
- [x] T01 Implementar geração de embeddings em `backend/app/rag.py`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado (`pytest --cov`) — `rag.py` 94%
- [x] Build/lint limpo (`ruff check`, type checking estrito) — `ruff check .` e `black --check .` sem erros
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — ver Vereditos
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto (client bundle ou repo) — `LLM_API_KEY` só lida via `os.environ`, nunca hardcoded; client OpenAI mockado em todos os testes
- [x] Documentação atualizada — sem divergência do formato de armazenamento descrito na ADR-003
- [x] Deploy/preview verificado — N/A (sem UI)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `pytest backend/tests/test_rag.py` cobre `embed_text`, `embed_chunks`, `save_index`/`load_index` (round-trip) com client OpenAI mockado; nenhuma chamada real à API em teste | 2026-08-04 | `backend/tests/test_rag.py` |
| Tech Lead | `@tech-lead-review` | Aprovar — chave só via env var, client lazy (`get_client()`), cache em JSON evita recálculo por request, conforme ADR-003 | 2026-08-04 | `backend/app/rag.py` |
| PO | `@product-owner` | Done — CA-001/002 fechados, DoD 100% fechado | 2026-08-04 | — |

**Status:** Done — embeddings implementados e testados em 2026-08-04, na branch `feature/US-05-01-adr-fluxo-rag`.
