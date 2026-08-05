# US-05-04 — Endpoint /chat

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R05

**Como** visitante,
**quero** enviar uma pergunta sobre a trajetória do autor e receber uma resposta,
**para** obter informação específica sem ler o site inteiro.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado (ver subseção)
- [x] Modelagem de dados documentada — N/A (reaproveita os chunks/embeddings gerados em US-05-02/US-05-03, sem entidade nova)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — RAG; depende de US-05-01 (Done), US-05-02 e US-05-03 (ainda não implementadas) — DoR fechado agora para não travar o início
- [x] ADR registrado se envolve decisão de stack nova — [ADR-003](../../../architecture/ADR-003-fluxo-rag.md) já define geração via `gpt-4o-mini` da OpenAI (seção 2) e estimativa de custo (seção 4)
- [x] Variáveis de ambiente/segredos necessários identificados — `LLM_API_KEY` (mesma variável de US-05-03, único provider para embeddings e geração — [ADR-003](../../../architecture/ADR-003-fluxo-rag.md) seção 5)
- [x] Referência visual definida — N/A (sem UI, história de backend)
- [x] Sem dúvida bloqueante

#### Contrato de API

`POST /chat`

- Request: `{ question: string }`
- Response 200: `{ answer: string }`
- Erros: `422` (Pydantic — `question` ausente/vazia), `500` (falha ao chamar o provider de IA — mensagem genérica ao cliente, sem vazar detalhe interno/stack trace); pergunta fora do escopo do currículo **não** é erro HTTP — é resposta 200 com fallback textual (CA-003)

#### Plano de testes

- Unitário: coberto em profundidade por US-05-06; nesta história, smoke mínimo do handler antes do handoff
- Integração: `TestClient` do FastAPI no endpoint completo (`backend/tests/test_chat.py`), LLM mockado
- Mocks necessários: client OpenAI mockado (geração de resposta); busca por similaridade determinística com fixture pequena de chunks/embeddings

### Critérios de aceite — precisam estar 100% fechados para Done
- [x] CA-001: `POST /chat` recebe `{question}` e retorna `{answer}` (`ChatRequest`/`ChatResponse` em Pydantic) — [`backend/app/chat.py`](../../../../backend/app/chat.py)
- [x] CA-002: busca os chunks mais relevantes (US-05-03) e gera resposta com esse contexto — `rag.search()` + `_generate_answer()` (contexto injetado no prompt, `gpt-4o-mini`)
- [x] CA-003: fallback definido para pergunta fora do escopo do currículo (não alucina resposta) — `SIMILARITY_THRESHOLD`: abaixo do limiar retorna `FALLBACK_ANSWER` sem chamar o LLM

### Fora de escopo
- `ChatWidget` no frontend (US-05-05)

### Dependências
- US-05-01 (Done), US-05-02 (Done), US-05-03 (Done)

### Épico / Prioridade
RAG — P3

### Tasks
- [x] T01 Criar endpoint `/chat` em `backend/app/chat.py`
- [x] T02 [P] Modelos `ChatRequest`/`ChatResponse`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado (`pytest --cov`) — `chat.py` 100%
- [x] Build/lint limpo (`ruff check`, type checking estrito) — `ruff check .` e `black --check .` sem erros
- [x] Review do `@tech-lead-review` sem Critical/High em aberto (atenção especial: chave de API não vaza em log/erro) — ver Vereditos; erro 500 usa mensagem genérica (`GENERIC_ERROR_MESSAGE`), sem repassar exceção/stack trace ao cliente
- [x] Contrato de API implementado bate com o documentado no DoR — request/response e códigos de erro (422/500/200 com fallback) conforme especificado
- [x] Sem chave de API/secret exposto (client bundle ou repo) — `LLM_API_KEY` só via `os.environ`, chamada só do backend
- [x] Documentação atualizada — contrato implementado sem divergência do DoR; `backend/README.md` documenta a tabela de endpoints
- [x] Deploy/preview verificado — N/A (sem UI; deploy do backend é US-05-08)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `pytest backend/tests/test_chat.py`: caso feliz, fallback (CA-003), 422 (vazio/ausente) e 500 genérico, LLM/embeddings mockados via `TestClient` | 2026-08-04 | `backend/tests/test_chat.py` |
| Tech Lead | `@tech-lead-review` | Aprovar — mensagem de erro 500 genérica não vaza detalhe interno; contrato bate com o DoR; sem chave hardcoded | 2026-08-04 | `backend/app/chat.py` |
| PO | `@product-owner` | Done — CA-001/002/003 fechados, DoD 100% fechado | 2026-08-04 | — |

**Status:** Done — endpoint `/chat` implementado e testado em 2026-08-04, na branch `feature/US-05-01-adr-fluxo-rag`.
