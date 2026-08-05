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
- [x] CA-001: `tests/test_rag.py` cobre chunking e busca por similaridade (LLM/embeddings mockados) — 12 testes: chunking, `embed_text`/`embed_chunks`, `cosine_similarity`, `search`, round-trip do cache (`save_index`/`load_index`), `load_or_build_index` (ambos os branches)
- [x] CA-002: `tests/test_chat.py` cobre o endpoint `/chat` via `TestClient` (LLM mockado) — 8 testes: caso feliz, 422 (vazio/ausente), 500 (falha de busca e falha de geração), 429 (rate limit), cache do índice em memória
- [x] CA-003: cenário de fallback (pergunta fora de escopo) coberto — `test_chat_retorna_fallback_para_pergunta_fora_do_escopo`, com assert explícito de que o LLM de geração **não** é chamado (`call_count == 0`)

### Fora de escopo
- Testes E2E completos (cobertos em `e2e/`, ver épico Deploy/QA)

### Dependências
- US-05-04 (Done)

### Épico / Prioridade
RAG — P3

### Tasks
- [x] T01 [P] Teste `backend/tests/test_rag.py`
- [x] T02 [P] Teste `backend/tests/test_chat.py`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado por esta história — N/A como piso adicional (esta história *é* a cobertura de teste); resultado: `rag.py` 94%, `chat.py` 100%, total do backend 97%
- [x] Build/lint limpo (`ruff check`, `pytest` verde) — 25/25 testes passando, `ruff check .` e `black --check .` sem erros
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — ver Vereditos
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto — confirmado: todos os testes usam client OpenAI mockado (`monkeypatch.setattr(rag, "get_client", ...)`), nenhuma chamada real à API
- [x] Documentação atualizada — N/A
- [x] Deploy/preview verificado — N/A (sem UI)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `pytest --cov=app` no backend: 25 testes passando, cobertura 97% total (`chat.py` 100%, `rag.py` 94%); CA-001/002/003 evidenciados por teste nomeado | 2026-08-04 | `backend/tests/test_rag.py`, `backend/tests/test_chat.py` |
| Tech Lead | `@tech-lead-review` | Aprovar — testes determinísticos (fixtures de embeddings fixos, sem I/O externo real), nomes descrevem o comportamento, sem chave real em nenhum mock | 2026-08-04 | `backend/tests/` |
| PO | `@product-owner` | Done — CA-001/002/003 fechados, DoD 100% fechado | 2026-08-04 | — |

**Status:** Done — testes do fluxo de chat implementados em 2026-08-04, na branch `feature/US-05-01-adr-fluxo-rag`.
