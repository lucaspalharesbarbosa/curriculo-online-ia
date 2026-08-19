# US-14-01 — Modularização do backend por domínio (`resume`/`chat`/`shared`)

**Fase:** Fase 14 — Arquitetura & Modularização
**Épico de origem:** Arquitetura & Modularização (`PRD-012-arquitetura-modularizacao.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** reorganizar `backend/app/` por domínio de negócio (`resume/`, `chat/`, `shared/`) em vez de arquivos soltos por tipo técnico,
**para** ter limites claros prontos para receber o domínio `admin` (Fase 12) sem misturar com o código de currículo/chat existente.

### DoR (antes de iniciar) — fechado

- [x] Critérios de aceite escritos e testáveis
- [x] Contrato de API documentado — `N/A`, nenhuma rota muda de path, método, request ou response; só o arquivo que a implementa muda de lugar
- [x] Mapeamento de erros documentado — `N/A`, nenhum erro novo/alterado
- [x] Modelagem de dados — `N/A`, nenhuma entidade nova
- [x] Plano de testes — ver subseção abaixo
- [x] Épico e dependências — `PRD-012`; depende de `ADR-011` (Aceita)
- [x] ADR registrado — sim, `ADR-011-modularizacao-ddd-lite.md` (Aceita)
- [x] Variáveis de ambiente/segredos — `N/A`
- [x] Referência visual — `N/A`, sem UI
- [x] Protótipo — `N/A`
- [x] Sem dúvida bloqueante

#### Plano de testes

- Reorganizar `backend/tests/` espelhando a nova árvore de `app/`: `tests/chat/test_chat.py` (era `test_chat.py`, testa `chat/router.py`), `tests/chat/test_rag.py`, `tests/chat/test_web_search.py`, `tests/resume/test_resume_schema.py`; `tests/test_main.py` e `tests/conftest.py` continuam na raiz de `tests/` (testam/servem o composition root)
- Sem teste novo — é o mesmo teste, em outro path, com imports atualizados
- Critério de sucesso: `pytest -q` com o mesmo número de testes passando antes e depois

### Critérios de aceite

- [x] CA-001: `backend/app/shared/` criado com `errors.py` e `env_bootstrap.py` (movidos de `app/`); imports em `main.py` atualizados
- [x] CA-002: `backend/app/resume/` criado com `models.py` (movido de `app/models/resume.py`); imports em `chat/rag.py` e nos testes atualizados
- [x] CA-003: `backend/app/chat/` criado com `router.py` (movido de `app/chat.py`), `rag.py` e `web_search.py` (movidos de `app/`, sem split interno); imports internos entre eles e em `main.py` atualizados
- [x] CA-004: `backend/tests/` reorganizado conforme o plano de testes acima, sem perder nenhum teste existente
- [x] CA-005: `pytest -q` roda 100% verde, com o mesmo número de testes de antes do refactor (sem teste perdido ou pulado)
- [x] CA-006: `ruff check .` e `black --check .` limpos após a reorganização
- [x] CA-007: `docs/agents/CONTEXTO-PROJETO.md` (seção "Estrutura — monorepo") atualizado com a árvore nova do backend

### Fora de escopo
- Qualquer padrão tático de DDD (Aggregates, Repositories, Value Objects) — ver `ADR-011`
- Split interno de `chat/rag.py` em múltiplos arquivos
- Modularização do frontend — `US-14-02`, história separada
- Mudança de comportamento/contrato de qualquer rota

### Dependências
- `ADR-011-modularizacao-ddd-lite.md` (Aceita)

### Épico / Prioridade
Arquitetura & Modularização — P2

### Tasks
- [x] T01 Criar `backend/app/shared/`, mover `errors.py` e `env_bootstrap.py`, atualizar imports em `main.py`
- [x] T02 [P] Criar `backend/app/resume/`, mover `models/resume.py` → `resume/models.py`, atualizar imports em `chat.py`/`rag.py` e testes
- [x] T03 Criar `backend/app/chat/`, mover `chat.py` → `chat/router.py`, `rag.py` → `chat/rag.py`, `web_search.py` → `chat/web_search.py`; atualizar imports internos e em `main.py`
- [x] T04 Reorganizar `backend/tests/` espelhando a árvore nova (`tests/chat/`, `tests/resume/`), mantendo `conftest.py` e `test_main.py` na raiz
- [x] T05 Rodar `pytest -q`, `ruff check .` e `black --check .` confirmando sem regressão
- [x] T06 Atualizar `docs/agents/CONTEXTO-PROJETO.md` (estrutura do backend)

### DoD (antes de concluir) — precisa estar 100% fechado para Done
- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — sem lógica nova, mantém a cobertura já existente (baseline: backend 96%, `US-13-01`; medido agora: 97%)
- [x] Build/lint limpo (`ruff check`, `black --check`)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API bate com o documentado — `N/A`, nenhum contrato muda
- [x] Sem chave/secret exposto
- [x] Documentação atualizada — `CONTEXTO-PROJETO.md` (CA-007)
- [ ] Deploy/preview verificado — `N/A`, sem UI; validar que `/health` e `/chat` continuam respondendo após deploy do PR — **pendente**: só validável após merge para `main` e deploy real no Render
- [ ] Vereditos de QA, Tech Lead e PO documentados abaixo — QA e Tech Lead preenchidos; PO não fez parte deste pipeline (Dev→QA→Tech Lead), veredito de PO pendente
- [x] Status atualizado no arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `pytest -q` 68/68 verdes (mesmo total do baseline pré-refactor, 0 falha/skip), cobertura 97% (`--cov=app`, piso DoD 70%), `ruff check .` e `black --check .` limpos, árvore de `app/`/`tests/` bate 1:1 com o plano da história e nenhuma referência a módulo antigo (`app.models`/`app.rag`/`app.chat.<file>` solto) restante | 2026-08-18 | `pytest -q`, `pytest --cov=app --cov-report=term-missing`, `ruff check .`, `black --check .` |
| Tech Lead | `@tech-lead-review` | Aprovar — diff revisado (`git diff --cached`, 19 arquivos) é 100% reposicionamento de arquivo + ajuste de import/path-depth (`parents[2]`→`parents[3]` em `chat/rag.py` e `tests/resume/test_resume_schema.py`, coerente com a nova profundidade de pasta); sem lógica de negócio alterada, sem chave/secret exposto, CORS inalterado, `__init__.py` presentes em todos os pacotes novos (`app/shared`, `app/resume`, `app/chat`, `tests/chat`, `tests/resume`), sem `app/models`/arquivos soltos órfãos, `.gitignore` do `rag_index.json` e `backend/README.md` atualizados para o novo caminho | 2026-08-18 | `git diff --cached` (backend + `.gitignore` + `CONTEXTO-PROJETO.md`) |
| PO | `@product-owner` | — | — | — |

**Status:** Em revisão — aguardando merge e validação de deploy/preview no Render (`/health`, `/chat`)
