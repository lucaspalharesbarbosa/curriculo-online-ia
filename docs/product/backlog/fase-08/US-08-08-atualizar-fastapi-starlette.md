# US-08-08 — Atualizar FastAPI/Starlette (e dependências de dev com CVE)

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** dono do produto,
**quero** que `fastapi`/`starlette` — e as dependências de dev com CVE conhecido (`python-dotenv`, `pytest`, `black`) — estejam em versões sem vulnerabilidade reportada,
**para** reduzir o risco residual acumulado sem quebrar o backend em produção, mesmo sabendo que a exploração hoje é de baixa probabilidade (API mínima, já protegida por CORS + rate limit).

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (bump de versão de framework/deps já usadas na stack; nenhuma mudança de request/response é esperada — se a implementação revelar breaking change de fato, ela entra como nota na "Documentação atualizada" do DoD, não como novo contrato)
- [x] Mapeamento de erros documentado — N/A (shape de erro público inalterado; ver plano de testes para verificação de regressão)
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance (`PRD-006`); origem dos achados: [US-08-01](US-08-01-auditoria-seguranca.md) / [`QA-005`](../../../qa/QA-005-auditoria-seguranca.md), achados L2 (`starlette`, agrupando o bump de `fastapi` que o fixa) e L1 (`python-dotenv`/`pytest`/`black`, agrupado nesta história conforme sugerido no relatório)
- [x] ADR registrado se envolve decisão de stack nova — N/A (bump de versão de dependência já decidida na stack — `ADR-001` já fixa FastAPI/Python; não é troca de framework nem escolha nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A (nenhuma env nova)
- [x] Referência visual definida — N/A (sem UI)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário/integração: suíte completa de `backend/tests/` (29 testes) rodada após o bump — cobre `/health`, `/chat` (mockado) e o restante da lógica de RAG/chat, servindo como regressão para o bump de major version do Starlette
- Regressão manual: como `starlette` sobe de major version (0.41.x → 1.x), revisar changelog de breaking changes antes de aplicar; smoke manual do `/chat` em produção (ou preview) pós-deploy, além dos testes automatizados
- Lint/format: `ruff check` e `black --check` (ou `black --check` na nova versão, se `black` também mudar formatação de linha) rodados pós-bump — reformatar com o `black` novo se necessário
- Mocks: LLM/OpenAI já mockado nos testes existentes — nenhuma chamada real durante a validação

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: `pip-audit -r backend/requirements.txt` não reporta CVE para `fastapi`/`starlette` após o bump — `pip-audit` → `No known vulnerabilities found` (fastapi `0.115.6`→`0.141.1`, starlette resolvido transitivamente `0.41.3`→`1.6.0`)
- [x] CA-002: `pip-audit -r backend/requirements.txt` não reporta CVE para `python-dotenv`, `pytest` e `black` após o bump (achado L1, agrupado) — mesma execução do `pip-audit` acima, sem CVE reportado para nenhuma das 5 libs do escopo
- [x] CA-003: os 29 testes de `backend/tests/` continuam verdes após o bump — suíte cresceu para 32 (3 testes novos adicionados por `US-08-06`/`US-08-07` desde que este CA foi escrito); `pytest -q` → `32 passed`
- [ ] CA-004: CI backend (`backend-ci.yml`) verde no PR do bump (lint + testes) — **pendente de ação humana**: os mesmos comandos do job (`pip install -r requirements.txt`, `ruff check .`, `black --check .`, `pytest`) foram rodados localmente e passaram, mas o workflow real do GitHub Actions só roda em push/PR — não autorizado nesta sessão (histórico local, sem push). Diferença adicional de ambiente: venv local usa Python 3.13, CI real usa 3.12 (`backend-ci.yml:25`) — mitigado verificando que `fastapi`/`starlette`/`python-dotenv`/`pytest`/`black` e a dependência transitiva nova (`pytokens`, puxada por `black`) declaram `requires-python >= 3.10` e publicam wheel `cp312` (inclusive `manylinux` para o runner `ubuntu-latest`), mas isso é evidência indireta, não a execução real do CI
- [ ] CA-005: smoke manual do `/health` e `/chat` (produção ou preview) sem regressão de comportamento observável após a mudança de major version do Starlette — **pendente de ação humana**: agente não tem acesso a produção real (Render); validado localmente com `TestClient` real (suíte de 32 testes cobre `/health` e `/chat`, incluindo CORS e headers de segurança)

### Fora de escopo

- Migrar para outro framework web — fora de proporção, `fastapi` continua sendo a escolha da stack (`ADR-001`)
- Reescrever endpoints para usar features novas do Starlette 1.x — só o bump de versão, sem refactor de funcionalidade
- Qualquer outro achado da auditoria (`QA-005`) além de `fastapi`/`starlette`/`python-dotenv`/`pytest`/`black`

### Dependências

- [PRD-006](../../PRD-006-seguranca-performance.md)
- [US-08-01](US-08-01-auditoria-seguranca.md) (Done) — origem dos achados L1 e L2
- [`QA-005`](../../../qa/QA-005-auditoria-seguranca.md) — evidência dos achados

### Épico / Prioridade

Segurança & Performance — P2

### Tasks

- [X] T01 Checar changelog de breaking changes do Starlette 0.41 → versão-alvo (≥ 1.0) e do FastAPI compatível, antes de aplicar o bump — changelog oficial (`docs/release-notes.md` do repo `Kludex/starlette`, via `gh api`) lido integralmente de `0.42.0` a `1.6.0`. Único bloco de breaking changes real é o do `1.0.0rc1` (remoção de `on_startup`/`on_shutdown`/`on_event`/`add_event_handler`/`@app.route()`/`@app.websocket_route()`/`@app.exception_handler()`/`@app.middleware()` do `Starlette`/`Router`, em favor de `lifespan`/`routes`/`exception_handlers`/`middleware`; mudanças em `Jinja2Templates`). Nenhum desses símbolos é usado por `backend/app/` — confirmado por grep: `backend/app/main.py` usa `app.add_middleware(CORSMiddleware, ...)` (parâmetro, não decorator removido) e `@app.middleware("http")`, que é a API **própria do FastAPI** (`fastapi/applications.py:4683`, reimplementada independente da de Starlette, documentada e usada no próprio exemplo oficial do FastAPI) — não afetada pela remoção do lado Starlette. Sem uso de `Jinja2Templates`/templates (API só serve JSON). Resultado: nenhuma refatoração de aplicação necessária, apenas o bump de versão em `requirements.txt`
- [X] T02 Atualizar `fastapi` (e `starlette` transitivo) em `backend/requirements.txt` para versões sem os CVEs listados no `QA-005` — `fastapi==0.115.6`→`0.141.1` (versão estável mais recente no PyPI, `requires-python >= 3.10`); `starlette` não é linha direta do arquivo (era e continua transitivo), resolvido para `1.6.0` pelo `pip install` (constraint do `fastapi 0.141.1` é `starlette>=0.46.0`, sem teto) — confirmado via `pip show starlette` pós-install
- [X] T03 [P] Atualizar `python-dotenv`, `pytest`, `black` em `backend/requirements.txt` (achado L1, agrupado) — `python-dotenv==1.0.1`→`1.2.2`, `pytest==8.3.4`→`9.0.3`, `black==24.10.0`→`26.3.1` (cobre os dois CVEs listados no `QA-005`, corrigidos em `26.3.0` e `26.3.1`)
- [X] T04 Rodar `pytest` completo (29 testes), `ruff check` e `black --check` pós-bump; corrigir regressões/reformatação encontradas — `pytest -q` → `32 passed` (nenhuma regressão; suíte cresceu desde a escrita do CA-003 por causa de `US-08-06`/`US-08-07`); `ruff check .` → `All checks passed!`; `black --check .` → `12 files would be left unchanged` (nenhuma reformatação necessária com o `black` novo — nenhum fix a commitar)
- [X] T05 Rodar `pip-audit -r backend/requirements.txt` e confirmar ausência dos CVEs listados no `QA-005` (`fastapi`, `starlette`, `python-dotenv`, `pytest`, `black`) — `pip-audit -r backend/requirements.txt` → `No known vulnerabilities found` (zero CVE em qualquer dependência resolvida, direta ou transitiva)
- [ ] T06 Smoke manual de `/health` e `/chat` (produção ou preview) pós-deploy — **pendente de ação humana**: sem acesso a produção/preview real (Render); ver CA-005

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]` — CA-001/CA-002/CA-003 fechados; CA-004 e CA-005 abertos (ver justificativa em cada um)
- [x] Cobertura de testes ≥ 70% no código tocado — N/A justificado: bump de dependência, sem lógica de aplicação nova; cobertura existente da suíte de 32 testes é a evidência de regressão (CA-003); `pytest --cov=app` local → 97% (290 stmts, 10 miss) como evidência de apoio
- [x] Build/lint limpo (`ruff check`, `black --check` com a versão nova) — ambos limpos, ver T04
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — atenção redobrada ao risco de breaking change de major version (Starlette 0.x → 1.x) — ver Vereditos
- [x] Contrato de API implementado bate com o documentado — N/A (shape público mantido; nenhuma divergência encontrada — `/health` e `/chat` sem mudança de request/response/headers observados pela suíte de testes)
- [x] Sem chave de API/secret exposto (client bundle ou repo) — único arquivo alterado é `backend/requirements.txt` (só nomes/versões de pacote)
- [x] Documentação atualizada — `backend/requirements.txt` versionado no PR; nenhum breaking change real de comportamento público identificado durante o bump (ver T01 e Vereditos Tech Lead), então sem nota de changelog/README necessária; único achado a registrar é não-funcional: `pytest` emite `StarletteDeprecationWarning: Using httpx with starlette.testclient is deprecated; install httpx2 instead` — fora do escopo desta história (só as 5 libs listadas), fica como observação para follow-up futuro, não bloqueia
- [ ] Deploy/preview verificado — smoke `/health`/`/chat` em produção (Render) ou preview pós-deploy — **pendente de ação humana**, mesma justificativa de CA-005
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-15 | `pytest -q` → `32 passed` (29 originais do plano de testes + 3 adicionados por `US-08-06`/`US-08-07`, nenhum quebrado pelo bump); `pytest --cov=app --cov-report=term-missing` → 97% (290 stmts, 10 miss, todos pré-existentes em `chat.py`/`env_bootstrap.py`/`rag.py`, nenhum novo gap introduzido pelo bump). `ruff check .` → `All checks passed!`; `black --check .` → `12 files would be left unchanged` (nenhuma reformatação disparada pelo `black` novo). `pip-audit -r backend/requirements.txt` → `No known vulnerabilities found`, confirmando ausência dos 11 CVEs-alvo do `QA-005` (1× `python-dotenv`, 1× `pytest`, 2× `black` — achado L1 — e 7× `starlette` — achado L2) nas 5 dependências do escopo. Testes de `/health` e `/chat` (incluindo CORS preflight aceito/rejeitado, headers de segurança do middleware `@app.middleware("http")`, docs condicionais por `ENVIRONMENT`) passam sem alteração de asserção — nenhuma regressão de comportamento observável. Único achado não-bloqueante: `StarletteDeprecationWarning` sobre `httpx` no `TestClient` (sugere migrar para `httpx2`), fora do escopo desta história. Sem achado bloqueante |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-15 | Diff mínimo e correto: `backend/requirements.txt` é o único arquivo alterado (`git diff --stat`), nenhum código de aplicação tocado — condizente com T01 ter concluído que nenhum breaking change do Starlette 1.0 atinge o código deste projeto. Verificação própria do changelog oficial (release-notes do `Kludex/starlette`, versões `0.42.0`→`1.6.0`): o único bloco de remoções é do `1.0.0rc1` (`on_startup`/`on_shutdown`/`on_event`/`add_event_handler`/`@app.route()`/`@app.websocket_route()`/`@app.exception_handler()`/`@app.middleware()` do `Starlette`/`Router` nativo, e mudanças em `Jinja2Templates`); `backend/app/main.py:27` usa `app.add_middleware(CORSMiddleware, ...)` (parâmetro, nunca decorator) e `backend/app/main.py:53` usa `@app.middleware("http")`, que é decorator **próprio do FastAPI** (`fastapi/applications.py`, independente do de Starlette, ainda documentado e usado no exemplo oficial do FastAPI 0.141.1) — confirmado por leitura direta do pacote instalado, não é o símbolo removido. Nenhum uso de `on_event`/rotas via decorator de app/templates Jinja2 no projeto. `pydantic>=2.9.0` exigido pelo `fastapi` novo é satisfeito pelo `pydantic==2.10.4` já pinado — sem bump adicional necessário fora do escopo. CORS sem `allow_credentials=True`, então a mudança de comportamento do Starlette 1.0 ("Return explicit origin in CORS response when credentials are allowed") não se aplica aqui — testes de CORS confirmam header inalterado. Sem chave de API tocada, sem mudança de contrato público de `/health`/`/chat`. Nit (não bloqueante): a suíte emite `StarletteDeprecationWarning` sobre `httpx`/`TestClient` — vale um item de backlog futuro para avaliar `httpx2`, fora do escopo fechado desta história (só as 5 libs listadas). Sem achado Critical/High |
| PO | `@product-owner` | Quase lá | 2026-08-15 | CA-001, CA-002 e CA-003 genuinamente fechados, com evidência real (`pip-audit`, `pytest`, ambos executados, não apenas descritos). CA-004 fica `[ ]`: os comandos do `backend-ci.yml` foram replicados localmente e passaram, mas a execução real do GitHub Actions depende de push/PR, não autorizado nesta sessão (histórico local apontado nas instruções da tarefa); diferença de versão Python (venv 3.13 local vs. 3.12 do runner) foi mitigada verificando `requires-python` e disponibilidade de wheel `cp312`/`manylinux` de toda dependência nova (inclusive a transitiva `pytokens`), mas não substitui a execução real — não forço Done nesse ponto. CA-005 fica `[ ]` pela mesma razão já usada em `US-08-06`/`US-08-07`: agente sem acesso a produção real (Render). T06 e o item de DoD "Deploy/preview verificado" ficam pendentes pela mesma razão. Restante do DoD fechado, com destaque para o resultado mais importante desta história: **nenhum breaking change de aplicação foi necessário** — o bump de major version do Starlette (0.41.3→1.6.0, via `fastapi` 0.115.6→0.141.1) e os 3 bumps de dev-deps (`python-dotenv` 1.0.1→1.2.2, `pytest` 8.3.4→9.0.3, `black` 24.10.0→26.3.1) foram absorvidos com uma única linha de diff em `requirements.txt`, sem revert nem escopo reduzido. Falta, para Done: (1) abrir PR real e confirmar `backend-ci.yml` verde no GitHub Actions; (2) deploy do backend no Render com este `requirements.txt`; (3) `curl -I`/chamada real em `/health` e `/chat` na URL de produção confirmando ausência de regressão; (4) marcar CA-004, CA-005, T06 e o item de DoD correspondente como concluídos com essa evidência |

**Status:** Quase lá
