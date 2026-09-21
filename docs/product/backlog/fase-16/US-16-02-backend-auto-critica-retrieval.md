# US-16-02 — Backend: passo de auto-crítica + reformulação de query

**Fase:** Fase 16 — RAG Agêntico (Auto-Crítica)
**Épico de origem:** RAG Agêntico (Auto-Crítica) (`PRD-014-rag-agentico-auto-critica.md`)

**Como** visitante/recrutador conversando com o assistente,
**quero** que o assistente reconheça quando o contexto recuperado é insuficiente para responder minha pergunta e tente de novo com uma busca melhor antes de desistir,
**para** obter respostas corretas mesmo em perguntas fora do vocabulário do roteamento por palavra-chave atual (sinônimos, perguntas compostas entre seções).

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — `N/A`: `/chat` request/response não muda (`ChatRequest`/`ChatResponse` idênticos ao atual, `ADR-010`/`ADR-014`); auto-crítica é lógica interna de `service.py`
- [x] Mapeamento de erros documentado — `N/A`: nenhum erro novo exposto ao cliente; falha da chamada de auto-crítica segue o mesmo padrão de resiliência já usado na condensação de pergunta (`ADR-014`) — cai para o fluxo sem auto-crítica, nunca propaga
- [x] Modelagem de dados documentada — `N/A`: sem entidade nova
- [x] Plano de testes definido — ver subseção abaixo
- [x] Épico e dependências identificados — depende de `ADR-016` (US-16-01)
- [x] ADR registrado — `ADR-016` (US-16-01)
- [x] Variáveis de ambiente/segredos necessários identificados — `N/A`: reaproveita `LLM_API_KEY`
- [x] Referência visual definida — `N/A`: sem UI
- [x] Protótipo solicitado pelo autor — `N/A`
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário (`backend/tests/chat/test_service.py`): contexto já suficiente não aciona auto-crítica (nenhuma chamada extra ao `ChatCompletionProvider` além da geração normal); contexto insuficiente aciona auto-crítica, reformula a query e o segundo retrieval encontra o chunk certo; limite de iterações (`ADR-016`) esgotado sem convergir cai no fallback de busca web já existente, sem regressão; pergunta com contexto já bom o bastante (fora da faixa seletiva do `ADR-016`) não gasta a chamada extra — prova do critério seletivo
- Integração: nenhuma nova — `TestClient` de `/chat` já existente (`backend/tests/chat/test_chat.py`) cobre que o contrato de resposta não mudou
- Regressão: reexecutar toda a suíte de `backend/tests/chat/` (roteamento do `ADR-010`/`ADR-013`, memória conversacional do `ADR-014`) para garantir que a auto-crítica não altera comportamento de perguntas que já funcionavam
- Mocks: `tests/chat/fakes.py` (`FakeChatCompletionProvider`, `SequentialChatCompletionProvider`, `RaisingChatCompletionProvider`, `FakeWebSearchProvider`, `FailIfCalledWebSearchProvider`) — sem tocar `openai`/`httpx` real

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: Depois do retrieval atual (`rag.search_with_routing`), o `service.py` avalia — só quando o critério seletivo do `ADR-016` for atendido — se o contexto recuperado é suficiente para responder à pergunta, via uma chamada ao `ChatCompletionProvider` (`_critique_context`, `_search_with_self_critique`)
- [x] CA-002: Quando o contexto é avaliado como insuficiente, a query é reformulada (reescrita e/ou relaxamento da restrição de seção, conforme `ADR-016`) e o retrieval é repetido, no máximo `MAX_SELF_CRITIQUE_ITERATIONS = 2`
- [x] CA-003: Se, mesmo após as iterações, o contexto continuar insuficiente, o fluxo cai no fallback de busca web já existente (`ADR-010`) — `forced_insufficient=True` força esse caminho independentemente do score bruto; gatilho/comportamento do fallback web inalterados (testado em `test_answer_question_falls_back_to_web_after_exhausting_self_critique_iterations`)
- [x] CA-004: A auto-crítica **não** roda em perguntas fora do critério seletivo do `ADR-016` — provado por `test_answer_question_skips_self_critique_when_score_already_high` e `test_answer_question_skips_self_critique_when_section_routed_with_confidence` (sem chamada extra ao `ChatCompletionProvider`)
- [x] CA-005: `ChatRequest`/`ChatResponse` do `/chat` permanecem exatamente como hoje — nenhum campo novo, nenhuma mudança de shape (`router.py` não tocado; suíte de `test_chat.py` inalterada e verde)
- [x] CA-006: Falha da chamada de auto-crítica nunca propaga como erro ao cliente — cai para "suficiente" (`test_answer_question_treats_self_critique_provider_failure_as_sufficient`)
- [x] CA-007: Toda a suíte existente de `backend/tests/chat/` continua passando — `123 passed` (ver evidência abaixo)

### Fora de escopo
- Mudança no dicionário de palavras-chave do `ADR-010`/`ADR-013`
- Mudança no fallback de busca web (gatilho, provider, contrato)
- Frontend — nenhuma mudança de UI ou de `ChatClient`
- Golden-set e avaliação LLM-as-judge — US-16-03

### Dependências
- US-16-01 (`ADR-016`), ADR-010, ADR-012, ADR-013, ADR-014

### Épico / Prioridade
RAG Agêntico (Auto-Crítica) — P1

### Tasks
- [x] T01 Implementar o passo de auto-crítica em `backend/app/chat/service.py` (prompt dedicado, critério seletivo de acionamento, reaproveitando `ChatCompletionProvider`)
- [x] T02 [P] Implementar a reformulação de query com teto de iterações (`ADR-016`)
- [x] T03 Testes unitários em `backend/tests/chat/test_service.py` cobrindo os CAs acima (usando `tests/chat/fakes.py`)
- [x] T04 [P] Rodar `ruff check .` e `pytest --cov` no backend, confirmar piso de 70% no código tocado
- [x] T05 Atualizar comentários/docstring de `service.py` referenciando `ADR-016`, seguindo o padrão já usado para `ADR-010`/`ADR-014`

### Evidências

- `ruff check .` (backend): `All checks passed!`
- `pytest tests/chat/ -q`: `123 passed`
- `pytest --cov=app.chat.service --cov-report=term-missing -q` (suíte completa, 131 testes): `app/chat/service.py 117 stmts, 0 miss, 100% cover` — acima do piso de 70% do DoD

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado (`pytest --cov`) — 100% em `app/chat/service.py`
- [x] Build/lint limpo (`ruff check .`, type checking estrito) — `All checks passed!`
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — Aprovar com ressalvas, 1 Low/Nit, 0 Critical/High
- [x] Contrato de API implementado bate com o documentado no DoR (inalterado) — confirmado: `router.py` não tocado, suíte de `test_chat.py` (contrato `/chat`) segue verde sem alteração
- [x] Sem chave de API/secret exposto — reaproveita `LLM_API_KEY` via `os.environ`, nenhuma chave nova
- [x] Documentação atualizada (`ADR-016` referenciado nos comentários do código tocado)
- [x] Deploy/preview verificado — `N/A`: sem UI
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-09-15 | `docs/qa/QA-007-fase-16-rag-agentico-auto-critica.md` |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas | 2026-09-15 | `docs/qa/QA-007-fase-16-rag-agentico-auto-critica.md` (seção Code Review) — 1 nit sem bloqueio (`service._index_cache` acessado de fora do módulo em `run_golden_set.py`) |
| PO | `@product-owner` | Done | 2026-09-15 | Critérios de aceite e DoD 100% fechados, cobertura 100% no código tocado, sem Critical/High |

**Status:** Done
