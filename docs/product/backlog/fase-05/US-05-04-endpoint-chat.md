# US-05-04 — Endpoint /chat

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R05

**Como** visitante,
**quero** enviar uma pergunta sobre a trajetória do autor e receber uma resposta,
**para** obter informação específica sem ler o site inteiro.

### Critérios de aceite
- [ ] CA-001: `POST /chat` recebe `{question}` e retorna `{answer}` (`ChatRequest`/`ChatResponse` em Pydantic)
- [ ] CA-002: busca os chunks mais relevantes (US-05-03) e gera resposta com esse contexto
- [ ] CA-003: fallback definido para pergunta fora do escopo do currículo (não alucina resposta)

### Fora de escopo
- `ChatWidget` no frontend (US-05-05)

### Dependências
- US-05-01, US-05-02, US-05-03

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 Criar endpoint `/chat` em `backend/app/chat.py`
- [ ] T02 [P] Modelos `ChatRequest`/`ChatResponse`

**Status:** Blocked — aguarda US-05-01
