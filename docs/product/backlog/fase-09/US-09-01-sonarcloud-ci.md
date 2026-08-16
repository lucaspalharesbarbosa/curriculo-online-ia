# US-09-01 — Adicionar SonarCloud ao CI (frontend e backend)

**Fase:** Fase 09 — Qualidade de Engenharia
**Épico de origem:** Qualidade de Engenharia (`PRD-007-qualidade-engenharia.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** análise estática automática (SonarCloud) rodando em `frontend-ci.yml` e `backend-ci.yml`,
**para** ter visibilidade contínua de bugs, code smells e vulnerabilidades reais, sem depender só de review manual.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — `N/A`, história de infraestrutura de CI, sem endpoint novo/alterado
- [x] Mapeamento de erros documentado — `N/A`, mesmo motivo acima
- [x] Modelagem de dados documentada — `N/A`, sem entidade nova
- [x] Plano de testes definido — ver subseção "Plano de testes"
- [x] Épico e dependências identificados — épico Qualidade de Engenharia (`PRD-007`); sem dependência de história anterior (primeira história da Fase 9)
- [x] ADR registrado se envolve decisão de stack nova — [`ADR-009`](../../../architecture/ADR-009-sonarcloud-ci.md) (Aceita): dois projetos SonarCloud, um por serviço, espelhando o CI existente
- [x] Variáveis de ambiente/segredos necessários identificados — `SONAR_TOKEN` (gerado pelo autor em sonarcloud.io, configurado como secret do repositório no GitHub — nunca no client bundle nem hardcoded no workflow)
- [x] Referência visual definida — `N/A`, sem UI nova
- [x] Protótipo solicitado pelo autor — `N/A`, sem pedido
- [x] Sem dúvida bloqueante — única pendência é o `ADR-009` (Fase 2), não uma dúvida em aberto

#### Plano de testes

- Unitário: `N/A` — mudança de infraestrutura de CI, não de código de produção
- Integração: execução real do workflow no PR de teste desta própria história — evidência é o link do run do GitHub Actions com o Quality Gate do SonarCloud aparecendo como status check
- Mocks: `N/A`

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: SonarCloud analisa o código do frontend a cada `pull_request` e push em `main`/`develop`, publicando resultado no dashboard do SonarCloud
- [ ] CA-002: SonarCloud analisa o código do backend a cada `pull_request` e push em `main`/`develop`, publicando resultado no dashboard do SonarCloud
- [ ] CA-003: Quality Gate do SonarCloud aparece como status check no PR do GitHub, sem quebrar o CI existente (lint/format/testes/build continuam passando como hoje)
- [x] CA-004: `SONAR_TOKEN` configurado como secret do repositório no GitHub (confirmado via `gh secret list`) — não exposto em log de CI, código ou client bundle
- [ ] CA-005: Baseline da primeira análise (contagem de bugs/code smells/vulnerabilidades/cobertura por severidade) documentado nesta história, para orientar `US-09-04` (refactor guiado pelos achados)

### Fora de escopo

- Gate de cobertura mínima bloqueante no CI (`US-09-02`)
- Correção dos findings reportados pelo Sonar (`US-09-04`)
- Revisão de boas práticas REST (`US-09-03`)

### Dependências

- [`ADR-009`](../../../architecture/ADR-009-sonarcloud-ci.md) — dois projetos SonarCloud, um por serviço (registrado)

### Épico / Prioridade

Qualidade de Engenharia — P1

### Tasks

- [x] T01 Autor cria organização e dois projetos públicos no SonarCloud, método "GitHub Actions" — organização `lucaspalharesbarbosa`, projetos `lucaspalharesbarbosa_curriculo-online-frontend` e `lucaspalharesbarbosa_curriculo-online-backend`
- [x] T02 `@arquiteto-ia-senior` registra `ADR-009` — `docs/architecture/ADR-009-sonarcloud-ci.md`
- [x] T03 Autor adiciona `SONAR_TOKEN` como secret do repositório no GitHub (confirmado via `gh secret list`)
- [x] T04 Criar arquivo(s) de config do Sonar com as chaves reais — `frontend/sonar-project.properties`, `backend/sonar-project.properties`
- [x] T05 [P] Cobertura do frontend — `@vitest/coverage-v8` já estava instalado; configurado `coverage.reporter: ["text", "lcov"]` em `vitest.config.ts`, validado localmente (`npm test -- --run --coverage` → 65/65, `coverage/lcov.info` gerado)
- [x] T06 [P] Adicionado `pytest-cov==6.0.0` a `backend/requirements.txt`; validado localmente (`pytest --cov=app --cov-report=xml` → 34/34, 96% cobertura, `coverage.xml` gerado)
- [x] T07 Step "SonarQube Cloud Scan" (`SonarSource/sonarqube-scan-action@v7`, `projectBaseDir: frontend`) adicionado em `.github/workflows/frontend-ci.yml`, condicionado ao `paths-filter` existente; `actions/checkout` com `fetch-depth: 0` (exigido pela análise)
- [x] T08 [P] Mesmo step em `.github/workflows/backend-ci.yml`, condicionado ao `paths-filter` existente, `projectBaseDir: backend`
- [ ] T09 Validar em PR real que o Quality Gate aparece como status check e o CI existente continua verde — pendente de push/PR
- [ ] T10 Documentar baseline da primeira análise (CA-005) nesta história — pendente do resultado do primeiro run real

**Ajustes colaterais durante a implementação:** `frontend/eslint.config.mjs` e `frontend/.prettierignore` passaram a ignorar `coverage/**` (a pasta gerada pelo Vitest estava sendo lintada/formatada por engano assim que a cobertura foi ligada).

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado pela história — `N/A`: história de infraestrutura de CI, sem lógica de produção nova
- [ ] Build/lint limpo (`npm run build`, `ruff check`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR — `N/A`
- [ ] Sem chave de API/secret exposto (client bundle ou repo)
- [ ] Documentação atualizada — `ADR-009` registrado e linkado; `CONTEXTO-PROJETO.md` atualizado se a tabela de stack mudar
- [ ] Deploy/preview verificado — `N/A`, sem UI
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** In Progress (Dev implementado localmente — testes/lint/format verdes nos dois serviços; falta abrir PR para validar CA-001/002/003/005 em CI real e fechar T09/T10)
