# US-05-03 — Geração de embeddings

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R04

**Como** sistema de RAG,
**quero** gerar embeddings dos chunks do currículo,
**para** viabilizar busca por similaridade semântica.

### Critérios de aceite
- [ ] CA-001: embeddings gerados conforme provider definido no ADR (US-05-01)
- [ ] CA-002: embeddings armazenados em JSON/memória, sem banco vetorial

### Fora de escopo
- Endpoint `/chat` (US-05-04)

### Dependências
- US-05-01, US-05-02

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 Implementar geração de embeddings em `backend/app/rag.py`

**Status:** Blocked — aguarda US-05-01
