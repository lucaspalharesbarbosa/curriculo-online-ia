# US-13-01 — Gate de cobertura mínima automatizado no CI

**Fase:** Fase 13 — Qualidade de Engenharia (continuação)
**Épico de origem:** Qualidade de Engenharia (`PRD-007-qualidade-engenharia.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** que o CI falhe automaticamente quando a cobertura de testes cair abaixo do piso de 70%,
**para** que a regra de cobertura do DoD deixe de depender só de checagem manual do `@qa-engineer`/`@tech-lead-review`.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — `N/A`, história de config de CI/testes, sem endpoint novo/alterado
- [x] Mapeamento de erros documentado — `N/A`, mesmo motivo acima
- [x] Modelagem de dados documentada — `N/A`, sem entidade nova
- [x] Plano de testes definido — ver subseção "Plano de testes"
- [x] Épico e dependências identificados — épico Qualidade de Engenharia (`PRD-007`); reaproveita os relatórios de cobertura (`lcov.info`, `coverage.xml`) já gerados desde [US-09-01](../archive/fase-09/US-09-01-sonarcloud-ci.md) — sem dependência bloqueante de história em aberto
- [x] ADR registrado se envolve decisão de stack nova — `N/A`, usa flags nativas das ferramentas já em uso (`pytest-cov`, `@vitest/coverage-v8`), sem lib nova nem mudança de arquitetura
- [x] Variáveis de ambiente/segredos necessários identificados — `N/A`, nenhum segredo novo
- [x] Referência visual definida — `N/A`, sem UI nova
- [x] Protótipo solicitado pelo autor — `N/A`, sem pedido
- [x] Sem dúvida bloqueante — único ponto a confirmar durante o Dev (não bloqueia início): checar se o Quality Gate padrão ("Sonar way") dos dois projetos SonarCloud já inclui uma condição de cobertura sobre código novo, como reforço complementar ao gate local — não substitui o gate desta história

#### Plano de testes

- Unitário: `N/A` — mudança de config de CI/testes, não de código de produção
- Integração: validar localmente que `pytest --cov=app --cov-report=xml --cov-fail-under=70` e `npm test -- --run --coverage` retornam código de saída não-zero quando a cobertura é forçada abaixo do piso (ex.: reduzir temporariamente o threshold local para 99% só para confirmar a falha, depois reverter) — evidência real de que o gate quebra o build, não só a config presente no arquivo
- Mocks: `N/A`

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: `backend-ci.yml` falha (exit code ≠ 0) quando a cobertura de `backend/app/` cai abaixo de 70% — `pytest --cov-fail-under=70` adicionado ao step de teste
- [ ] CA-002: `frontend-ci.yml` falha quando a cobertura do frontend cai abaixo de 70% — `coverage.thresholds` (`lines`/`branches`/`functions`/`statements` ≥ 70) configurado em `vitest.config.ts`
- [ ] CA-003: cobertura atual dos dois serviços medida e documentada nesta história **antes** do gate virar bloqueante, confirmando que nenhum dos dois está abaixo de 70% hoje (baseline de `US-09-01`: frontend 82,18%, backend 96%, medidos em 2026-08-16) — evita quebrar CI por dívida antiga (risco já registrado no `PRD-007`)
- [ ] CA-004: validado em execução real de CI (PR de teste) que o step de testes quebra quando um teste é comentado/removido temporariamente (cobertura forçada abaixo do piso) e volta a passar depois de revertido
- [ ] CA-005: CI existente (lint, format, build, SonarCloud Quality Gate) continua passando sem regressão

### Fora de escopo

- Cobertura por diff/PR ("código tocado" no sentido estrito de linhas alteradas) — o gate desta história é global por serviço (mede o projeto inteiro, não só o diff); cobertura só do código novo já é papel do Quality Gate do SonarCloud (ver ponto de verificação no DoR), sem duplicar ferramenta (`diff-cover`/Codecov) num projeto solo
- Reconfigurar o Quality Gate do SonarCloud no dashboard (ação administrativa em sonarcloud.io, fora do código versionado)
- Corrigir cobertura de módulos específicos abaixo do piso — não se aplica hoje (CA-003), mas se aparecer, vira história própria

### Dependências

- [US-09-01](../archive/fase-09/US-09-01-sonarcloud-ci.md) — gerou os relatórios de cobertura (`lcov.info`, `coverage.xml`) que este gate reaproveita (Done)

### Épico / Prioridade

Qualidade de Engenharia — P1

### Tasks

- [ ] T01 Adicionar `--cov-fail-under=70` ao step "Test" de `.github/workflows/backend-ci.yml`
- [ ] T02 [P] Adicionar `coverage.thresholds` (70% em lines/branches/functions/statements) a `frontend/vitest.config.ts`
- [ ] T03 Medir e documentar a cobertura atual dos dois serviços nesta história (CA-003)
- [ ] T04 Validar localmente e num PR real que o gate quebra o build quando forçado abaixo do piso, depois reverter (CA-004)
- [ ] T05 Checar (dashboard SonarCloud) se o Quality Gate padrão já cobre "Coverage on New Code" e documentar o achado nesta história — não bloqueia Done, é só registro para não duplicar controle no futuro

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado pela história — `N/A`: história de config de CI/testes, sem lógica de produção nova
- [ ] Build/lint limpo (`npm run build`, `ruff check`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR — `N/A`
- [ ] Sem chave de API/secret exposto (client bundle ou repo)
- [ ] Documentação atualizada (ADR/contrato/diagrama ER) se algo mudou de fato durante a implementação
- [ ] Deploy/preview verificado — `N/A`, sem UI
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
