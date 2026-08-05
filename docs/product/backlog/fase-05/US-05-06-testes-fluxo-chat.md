# US-05-06 — Testes do fluxo de chat

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R07

**Como** time do projeto,
**quero** testes automatizados do fluxo de chat (unitário e integração),
**para** ter confiança de que respostas, fallback e latência estão dentro do esperado.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (consome o contrato `POST /chat` já documentado em [US-05-04](US-05-04-endpoint-chat.md), não produz um novo)
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido — a própria história é o plano de testes; escopo: `test_rag.py` (chunking + busca por similaridade, embeddings mockados) e `test_chat.py` (endpoint via `TestClient`, LLM mockado), incluindo o cenário de fallback (CA-003); latência não é asserção formal de tempo nesta história (fora de proporção medir SLA em projeto solo) — cobertura fica em CA-001/CA-002/CA-003
- [x] Épico e dependências identificados — RAG; depende de US-05-04 (ainda não implementada) — DoR fechado agora para não travar o início
- [x] ADR registrado se envolve decisão de stack nova — N/A (pytest/`TestClient` já são o padrão de testes do backend, sem lib nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A (testes usam mocks, nunca batem na API real de IA)
- [x] Referência visual definida — N/A (sem UI)
- [x] Sem dúvida bloqueante

### Critérios de aceite — precisam estar 100% fechados para Done
- [ ] CA-001: `tests/test_rag.py` cobre chunking e busca por similaridade (LLM/embeddings mockados)
- [ ] CA-002: `tests/test_chat.py` cobre o endpoint `/chat` via `TestClient` (LLM mockado)
- [ ] CA-003: cenário de fallback (pergunta fora de escopo) coberto

### Fora de escopo
- Testes E2E completos (cobertos em `e2e/`, ver épico Deploy/QA)

### Dependências
- US-05-04

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 [P] Teste `backend/tests/test_rag.py`
- [ ] T02 [P] Teste `backend/tests/test_chat.py`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado por esta história — N/A como piso adicional (esta história *é* a cobertura de teste; ver CA-001/CA-002/CA-003)
- [ ] Build/lint limpo (`ruff check`, `pytest` verde)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [ ] Sem chave de API/secret exposto — confirmar que nenhum teste usa chave real
- [ ] Documentação atualizada — N/A
- [ ] Deploy/preview verificado — N/A (sem UI)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Blocked — aguarda US-05-04 (implementação). DoR fechado em 2026-08-04; pronta para "Ready for Agent" assim que US-05-04 concluir.
