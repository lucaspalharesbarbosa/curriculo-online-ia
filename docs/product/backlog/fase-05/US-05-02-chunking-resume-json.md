# US-05-02 — Chunking do resume.json

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R03

**Como** sistema de RAG,
**quero** transformar o `resume.json` em pedaços de texto (chunks),
**para** viabilizar a busca por similaridade.

### Critérios de aceite
- [ ] CA-001: `rag.py` gera chunks a partir de cada seção do `resume.json`
- [ ] CA-002: estratégia de chunking segue o ADR de US-05-01

### Fora de escopo
- Geração de embeddings (US-05-03)

### Dependências
- US-05-01, US-02-02

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 Implementar chunking em `backend/app/rag.py`

**Status:** Blocked — aguarda US-05-01
