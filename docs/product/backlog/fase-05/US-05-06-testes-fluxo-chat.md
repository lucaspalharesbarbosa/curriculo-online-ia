# US-05-06 — Testes do fluxo de chat

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R07

**Como** time do projeto,
**quero** testes automatizados do fluxo de chat (unitário e integração),
**para** ter confiança de que respostas, fallback e latência estão dentro do esperado.

### Critérios de aceite
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

**Status:** Blocked — aguarda US-05-04
