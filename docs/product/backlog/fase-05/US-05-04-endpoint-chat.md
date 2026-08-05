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
- [ ] CA-001: `POST /chat` recebe `{question}` e retorna `{answer}` (`ChatRequest`/`ChatResponse` em Pydantic)
- [ ] CA-002: busca os chunks mais relevantes (US-05-03) e gera resposta com esse contexto
- [ ] CA-003: fallback definido para pergunta fora do escopo do currículo (não alucina resposta)

### Fora de escopo
- `ChatWidget` no frontend (US-05-05)

### Dependências
- US-05-01 (Done), US-05-02, US-05-03

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 Criar endpoint `/chat` em `backend/app/chat.py`
- [ ] T02 [P] Modelos `ChatRequest`/`ChatResponse`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado (`pytest --cov`)
- [ ] Build/lint limpo (`ruff check`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto (atenção especial: chave de API não vaza em log/erro)
- [ ] Contrato de API implementado bate com o documentado no DoR
- [ ] Sem chave de API/secret exposto (client bundle ou repo)
- [ ] Documentação atualizada — se o contrato do endpoint divergir do DoR durante a implementação
- [ ] Deploy/preview verificado — N/A (sem UI; deploy do backend é US-05-08)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Blocked — aguarda US-05-03 (implementação). DoR fechado em 2026-08-04; pronta para "Ready for Agent" assim que US-05-02/US-05-03 concluírem.
