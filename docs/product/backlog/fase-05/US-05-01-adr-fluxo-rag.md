# US-05-01 — ADR do fluxo de RAG

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R01

**Como** desenvolvedor,
**quero** uma decisão registrada de chunking, provider de embeddings e formato de armazenamento,
**para** implementar o RAG sem reabrir a decisão a cada história.

### Critérios de aceite
- [ ] CA-001: ADR em `docs/architecture/` cobre estratégia de chunking, escolha de embeddings (ex.: `text-embedding-3-small` vs. modelo local), formato de armazenamento (JSON em memória) e estimativa de custo
- [ ] CA-002: decide onde fica a chave de API (variável de ambiente / serverless function, nunca client)

### Fora de escopo
- Implementação (US-05-02 em diante)

### Dependências
- Nenhuma

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 ADR do fluxo de RAG em `docs/architecture/` — **bloqueia as demais histórias desta fase**

**Status:** Draft — a ser conduzida por `@arquiteto-ia-senior` quando o épico RAG entrar em execução (Fase 05)
