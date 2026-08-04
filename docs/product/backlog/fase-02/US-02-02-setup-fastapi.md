# US-02-02 — Setup do esqueleto do serviço FastAPI

**Fase:** Fase 02 — Setup do projeto
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R02

**Como** desenvolvedor,
**quero** o esqueleto do serviço FastAPI (`backend/app/main.py`) rodando,
**para** ter uma base para o endpoint `/chat` e para o CI de backend validar lint/testes desde já.

### Critérios de aceite
- [ ] CA-001: `backend/app/main.py` sobe uma aplicação FastAPI mínima (health check em `/health`)
- [ ] CA-002: `requirements.txt` com dependências mínimas
- [ ] CA-003: ruff/black configurados
- [ ] CA-004: `backend-ci.yml` (esqueleto criado na Fase 00) passa a rodar lint + testes reais

### Fora de escopo
- Endpoint `/chat` e lógica de RAG (US-05-02 em diante)

### Dependências
- Nenhuma (independente do ADR de RAG)

### Épico / Prioridade
RAG — P1

### Tasks
- [ ] T01 Criar `backend/app/main.py` com health check
- [ ] T02 [P] Configurar `requirements.txt`, ruff, black
- [ ] T03 Conectar `backend-ci.yml` ao lint + testes reais

**Status:** Ready for Agent
