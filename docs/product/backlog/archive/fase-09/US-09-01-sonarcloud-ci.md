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
- [x] ADR registrado se envolve decisão de stack nova — [`ADR-009`](../../../../architecture/ADR-009-sonarcloud-ci.md) (Aceita): dois projetos SonarCloud, um por serviço, espelhando o CI existente
- [x] Variáveis de ambiente/segredos necessários identificados — `SONAR_TOKEN` (gerado pelo autor em sonarcloud.io, configurado como secret do repositório no GitHub — nunca no client bundle nem hardcoded no workflow)
- [x] Referência visual definida — `N/A`, sem UI nova
- [x] Protótipo solicitado pelo autor — `N/A`, sem pedido
- [x] Sem dúvida bloqueante — única pendência é o `ADR-009` (Fase 2), não uma dúvida em aberto

#### Plano de testes

- Unitário: `N/A` — mudança de infraestrutura de CI, não de código de produção
- Integração: execução real do workflow no PR de teste desta própria história — evidência é o link do run do GitHub Actions com o Quality Gate do SonarCloud aparecendo como status check
- Mocks: `N/A`

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: SonarCloud analisa o código do frontend a cada `pull_request` e push em `main`/`develop`, publicando resultado no dashboard do SonarCloud — validado em [PR #46](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/46) (análise na abertura do PR) e no push de merge em `develop` (run [31926781365](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/actions/runs/31926781365), `frontend-ci` verde com step "SonarQube Cloud Scan")
- [x] CA-002: SonarCloud analisa o código do backend a cada `pull_request` e push em `main`/`develop`, publicando resultado no dashboard do SonarCloud — validado no PR #46 (log do job confirma `ANALYSIS SUCCESSFUL` para `lucaspalharesbarbosa_curriculo-online-backend`) e no push de merge em `develop` (run [31926781377](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/actions/runs/31926781377))
- [x] CA-003: Quality Gate do SonarCloud aparece como status check no PR do GitHub, sem quebrar o CI existente (lint/format/testes/build continuam passando como hoje) — `gh pr checks 46`: `SonarCloud Code Analysis` (pass), `lint-and-build` (pass), `lint-and-test` (pass); Quality Gate `OK` para os dois projetos via API (`qualitygates/project_status?pullRequest=46`)
- [x] CA-004: `SONAR_TOKEN` configurado como secret do repositório no GitHub (confirmado via `gh secret list`) — não exposto em log de CI, código ou client bundle
- [x] CA-005: Baseline da primeira análise documentado — ver subseção "Baseline da primeira análise" abaixo

#### Baseline da primeira análise

Fonte: API pública do SonarCloud (`project_branches/list` para bugs/vulnerabilidades/code smells da branch `develop`; `coverage.xml`/`lcov.info` locais — mesmos artefatos que alimentaram o scan do CI — para cobertura).

| Métrica | Frontend | Backend |
|---|---|---|
| Bugs | 0 | 0 |
| Code smells | 0 | 0 |
| Vulnerabilidades | 0 | 0 |
| Security hotspots | 0 | 0 |
| Cobertura | 82,18% (linhas) | 96% |
| Duplicação (diff do PR #46) | 0% | 0% |

**Gap conhecido (não bloqueante para esta história, registrado para follow-up):** os dois projetos SonarCloud nasceram com a branch principal apontando para `master` (padrão do provedor), branch que não existe neste repo — nunca analisada, 0/0/0 por ausência de dado, não por qualidade real. A branch `develop`, que recebeu a análise completa real, ficou registrada como *short-lived*, o que bloqueia a API pública de métricas agregadas (`measures/component`) para ela ("Organization is not allowed to access data from non main branches"). Os números de bugs/code smells/vulnerabilidades acima vieram de `project_branches/list` (não bloqueado); cobertura/duplicação do código pré-existente como um todo só ficam visíveis no dashboard autenticado até a branch principal do projeto ser corrigida em Administration → Branches no sonarcloud.io (ação do autor, precisa de login — não executável via API/token de CI). Não impede CA-001/002/003 (análise roda e publica; Quality Gate aparece no PR), só limita a leitura histórica agregada da branch `develop` por enquanto.

**Causa raiz corrigida (2026-08-18, investigada na Fase 13 — [US-13-03](../../fase-13/US-13-03-refactor-modularizacao-sonarcloud.md)):** o gap acima não era config de branch quebrada — é limite do **Free plan padrão** do SonarQube Cloud (antigo SonarCloud), que só analisa a branch marcada como principal; branch analysis para qualquer outra branch (`develop`) só existe no plano pago (Team/Enterprise) ou no **Free OSS plan** (o que `ADR-009` pressupôs ao decidir "grátis para repositório público" — os projetos acabaram criados no Free padrão, não no OSS). Não há caminho de auto-serviço para migrar um org existente de Free → OSS (só o inverso é documentado pela Sonar); abrir chamado de suporte não é ágil para este projeto. Fix aplicado sem depender de suporte: autor renomeou a branch principal de `master` → `main` nos dois projetos SonarCloud (Administration → Branches → Rename), alinhando com a branch real de produção do repo — a próxima análise real (push em `main`, ex. PR de release `develop → main`) passa a popular dados de verdade nessa branch. `develop` continua "Not analyzed" como branch permanente (limite aceito do Free padrão); a análise de PR (Quality Gate por PR, já validada em CA-003) não é afetada por esse limite.

### Fora de escopo

- Gate de cobertura mínima bloqueante no CI (`US-09-02`)
- Correção dos findings reportados pelo Sonar (`US-09-04`)
- Revisão de boas práticas REST (`US-09-03`)

### Dependências

- [`ADR-009`](../../../../architecture/ADR-009-sonarcloud-ci.md) — dois projetos SonarCloud, um por serviço (registrado)

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
- [x] T09 Validar em PR real que o Quality Gate aparece como status check e o CI existente continua verde — [PR #46](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/46), merged
- [x] T10 Documentar baseline da primeira análise (CA-005) nesta história — ver subseção "Baseline da primeira análise"

**Ajustes colaterais durante a implementação:** `frontend/eslint.config.mjs` e `frontend/.prettierignore` passaram a ignorar `coverage/**` (a pasta gerada pelo Vitest estava sendo lintada/formatada por engano assim que a cobertura foi ligada).

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado pela história — `N/A`: história de infraestrutura de CI, sem lógica de produção nova
- [x] Build/lint limpo (`npm run build`, `ruff check`, type checking estrito) — verde em CI real no PR #46 (`lint-and-build`, `lint-and-test`) e localmente (frontend 65/65 testes, backend 34/34 testes)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — Aprovado, ver tabela Vereditos
- [x] Contrato de API implementado bate com o documentado no DoR — `N/A`
- [x] Sem chave de API/secret exposto (client bundle ou repo) — `SONAR_TOKEN` só via `secrets.SONAR_TOKEN` no workflow, confirmado no diff e no log de CI (mascarado)
- [x] Documentação atualizada — `ADR-009` registrado e linkado; `CONTEXTO-PROJETO.md` atualizado (linha "Análise estática" na tabela de stack + status da Fase 9 na tabela de roadmap)
- [x] Deploy/preview verificado — `N/A`, sem UI
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-08-16 | Suítes locais verdes (frontend 65/65, cobertura 82,18%; backend 34/34, cobertura 96%); CA-001/002/003/005 validados com evidência real no [PR #46](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/46) e no push de merge em `develop`. Ressalva: branch principal dos projetos SonarCloud ainda aponta para `master` (inexistente neste repo) — ver "Gap conhecido" na subseção Baseline; não bloqueia CI/Quality Gate, mas limita leitura histórica agregada da `develop` até o autor corrigir em Administration → Branches no sonarcloud.io |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-16 | Diff enxuto (`.github/workflows/*.yml`, `sonar-project.properties`, `vitest.config.ts`, `requirements.txt`, `.prettierignore`/`eslint.config.mjs`); sem Critical/High. `SONAR_TOKEN` só via `secrets.*`, sem exposição; escopo do PR respeitado (só CI/config, sem código de produção); ADR-009 seguido (dois projetos, um por serviço). Nit: chaves reais dos projetos SonarCloud (`lucaspalharesbarbosa_curriculo-online-*`) diferem do nome ilustrativo em ADR-009 (`curriculo-online-ia-*`) — esperado, SonarCloud prefixa com a org no onboarding via GitHub Actions; não requer mudança |
| PO | `@product-owner` | Done | 2026-08-16 | 5/5 CA fechados com evidência real (PR #46 + push de merge em `develop`); DoD 100% fechado (itens `N/A` justificados); QA e Tech Lead aprovaram sem Critical/High. Gap de config de branch no SonarCloud (main branch = `master` inexistente) aceito como follow-up de baixo risco — não bloqueia CI nem Quality Gate, só limita leitura histórica agregada por ora |

**Status:** Done
