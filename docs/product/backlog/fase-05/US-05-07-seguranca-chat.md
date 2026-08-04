# US-05-07 — Segurança do /chat

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R08

**Como** dono do produto,
**quero** que o endpoint `/chat` tenha CORS restrito, chave de API protegida e rate limit básico,
**para** evitar abuso e vazamento de credenciais.

### Critérios de aceite
- [ ] CA-001: CORS restrito à origem do frontend em produção
- [ ] CA-002: chave de API de LLM/embeddings só existe como variável de ambiente no backend, nunca no client
- [ ] CA-003: rate limit básico por IP/sessão no `/chat`

### Fora de escopo
- WAF ou infra de segurança avançada — fora de proporção para o projeto

### Dependências
- US-05-04

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 Configurar CORS em `backend/app/main.py`
- [ ] T02 Rate limit básico no `/chat`

**Status:** Blocked — aguarda US-05-04
