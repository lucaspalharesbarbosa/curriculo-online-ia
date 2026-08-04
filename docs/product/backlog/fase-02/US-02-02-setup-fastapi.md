# US-02-02 — Setup do esqueleto do serviço FastAPI

**Fase:** Fase 02 — Setup do projeto
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R02

**Como** desenvolvedor,
**quero** o esqueleto do serviço FastAPI (`backend/app/main.py`) rodando,
**para** ter uma base para o endpoint `/chat` e para o CI de backend validar lint/testes desde já.

### DoR (antes de iniciar)

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — `GET /health` → `200 {"status": "ok"}`
- [x] Modelagem de dados documentada — N/A (health check sem entidade)
- [x] Plano de testes definido — pytest + `TestClient`: `tests/test_main.py`
- [x] Épico e dependências identificados — RAG, sem dependências
- [x] ADR registrado se envolve decisão de stack nova — N/A (stack em `ADR-001`)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A nesta história
- [x] Referência visual definida — N/A (backend)
- [x] Sem dúvida bloqueante

#### Contrato de API

`GET /health`

- Response 200: `{ "status": "ok" }`

#### Plano de testes

- Unitário/integração: `tests/test_main.py` — status 200 e body esperado
- Mocks necessários: N/A

### Critérios de aceite

- [x] CA-001: `backend/app/main.py` sobe uma aplicação FastAPI mínima (health check em `/health`)
- [x] CA-002: `requirements.txt` com dependências mínimas
- [x] CA-003: ruff/black configurados
- [x] CA-004: `backend-ci.yml` (esqueleto criado na Fase 00) passa a rodar lint + testes reais

### Fora de escopo

- Endpoint `/chat` e lógica de RAG (US-05-02 em diante)

### Dependências

- Nenhuma (independente do ADR de RAG)

### Épico / Prioridade

RAG — P1

### Tasks

- [x] T01 Criar `backend/app/main.py` com health check
- [x] T02 [P] Configurar `requirements.txt`, ruff, black
- [x] T03 Conectar `backend-ci.yml` ao lint + testes reais

### DoD (antes de concluir)

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — 100% em `app/main.py` (`pytest --cov=app`)
- [x] Build/lint limpo (`ruff check .`, `black --check .`, `pytest`)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — `backend/README.md`
- [x] Deploy/preview verificado — N/A (deploy na Fase 05)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-04 | `ruff check .`, `black --check .`, `pytest --cov=app` (100% em `app/main.py`) — todos passando |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-04 | FastAPI mínimo, teste com TestClient, ruff/black em `pyproject.toml`, sem secrets |
| PO | `@product-owner` | Done | 2026-08-04 | Critérios de aceite e DoD 100% fechados |

**Status:** Done
