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

- [ ] CA-001: `pip-audit -r backend/requirements.txt` não reporta CVE para `fastapi`/`starlette` após o bump
- [ ] CA-002: `pip-audit -r backend/requirements.txt` não reporta CVE para `python-dotenv`, `pytest` e `black` após o bump (achado L1, agrupado)
- [ ] CA-003: os 29 testes de `backend/tests/` continuam verdes após o bump
- [ ] CA-004: CI backend (`backend-ci.yml`) verde no PR do bump (lint + testes)
- [ ] CA-005: smoke manual do `/health` e `/chat` (produção ou preview) sem regressão de comportamento observável após a mudança de major version do Starlette

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

- [ ] T01 Checar changelog de breaking changes do Starlette 0.41 → versão-alvo (≥ 1.0) e do FastAPI compatível, antes de aplicar o bump
- [ ] T02 Atualizar `fastapi` (e `starlette` transitivo) em `backend/requirements.txt` para versões sem os CVEs listados no `QA-005`
- [ ] T03 [P] Atualizar `python-dotenv`, `pytest`, `black` em `backend/requirements.txt` (achado L1, agrupado)
- [ ] T04 Rodar `pytest` completo (29 testes), `ruff check` e `black --check` pós-bump; corrigir regressões/reformatação encontradas
- [ ] T05 Rodar `pip-audit -r backend/requirements.txt` e confirmar ausência dos CVEs listados no `QA-005` (`fastapi`, `starlette`, `python-dotenv`, `pytest`, `black`)
- [ ] T06 Smoke manual de `/health` e `/chat` (produção ou preview) pós-deploy

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — N/A justificado: bump de dependência, sem lógica de aplicação nova; cobertura existente da suíte de 29 testes é a evidência de regressão (CA-003)
- [ ] Build/lint limpo (`ruff check`, `black --check` com a versão nova)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto — atenção redobrada ao risco de breaking change de major version (Starlette 0.x → 1.x)
- [ ] Contrato de API implementado bate com o documentado — N/A (shape público mantido; qualquer divergência encontrada durante a implementação vira nota na documentação, não um novo contrato)
- [ ] Sem chave de API/secret exposto (client bundle ou repo)
- [ ] Documentação atualizada — `backend/requirements.txt` versionado no PR; nota no changelog/README se algum breaking change real de comportamento for identificado durante o bump
- [ ] Deploy/preview verificado — smoke `/health`/`/chat` em produção (Render) ou preview pós-deploy
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
