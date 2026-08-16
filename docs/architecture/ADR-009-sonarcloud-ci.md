# ADR-009: SonarCloud como análise estática no CI (2 projetos, um por serviço)

## Status
Aceita

## Contexto

`PRD-007` (Qualidade de Engenharia) pede um gate automático de qualidade no CI — hoje `frontend-ci.yml`/`backend-ci.yml` só rodam lint, format check, testes e build, sem nenhuma análise estática de bugs/code smells/vulnerabilidades nem gate de cobertura bloqueante (piso de 70% é checklist manual do DoD). `US-09-01` decompõe a primeira história desse épico: adicionar SonarCloud a ambos os workflows.

Duas decisões precisam ficar registradas antes do Dev:

1. **Ferramenta**: SonarCloud é grátis para repositório público (`lucaspalharesbarbosa/curriculo-online-ia` é público) e tem action oficial (`SonarSource/sonarcloud-github-action`) — não há motivo para avaliar alternativa paga (SonarQube self-hosted, Codacy) num projeto solo com hospedagem free-tier.
2. **Organização dos projetos**: o repositório é um monorepo com dois serviços de linguagens diferentes (`frontend/` Next.js+TS, `backend/` Python+FastAPI), cada um já com seu próprio workflow de CI, `paths-filter` e piso de cobertura avaliado separadamente. A dúvida é se o Sonar deve analisar os dois como **um único projeto** (uma chave, um dashboard) ou **dois projetos independentes** (uma chave por serviço).

## Decisão

**Dois projetos SonarCloud**, um por serviço, espelhando a separação que já existe no CI:

- `curriculo-online-ia-frontend` — analisa só `frontend/`
- `curriculo-online-ia-backend` — analisa só `backend/`

Cada workflow (`frontend-ci.yml`/`backend-ci.yml`) roda a análise do seu próprio projeto Sonar, condicionada ao mesmo `paths-filter` que já existe (só roda se o serviço correspondente mudou). Cada serviço aponta para seu relatório de cobertura próprio (`lcov.info` do Vitest, `coverage.xml` do pytest).

`SONAR_TOKEN` é um único secret de organização/repositório no GitHub, reutilizado pelos dois workflows (o token é da conta SonarCloud, não por projeto).

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| **Dois projetos, um por serviço (escolhida)** | Espelha a separação já existente no CI (workflows, `paths-filter`, piso de cobertura por serviço); Quality Gate e achados não se misturam entre TS e Python; cobertura calculada corretamente por linguagem | Dois dashboards para acompanhar em vez de um |
| Um único projeto cobrindo o monorepo inteiro | Um dashboard só | Mistura métricas de duas linguagens/toolchains num único Quality Gate; cobertura global dilui o piso de 70% por serviço; não reflete a separação real do CI |
| SonarQube self-hosted | Controle total | Precisa de infra própria rodando 24/7 — incompatível com hospedagem free-tier (`ADR-002`) e desproporcional a um projeto solo |

## Consequências

- `frontend/sonar-project.properties` e `backend/sonar-project.properties` (ou parâmetros equivalentes inline no step da action) guardam a chave de cada projeto
- `SONAR_TOKEN` precisa ser gerado pelo autor em sonarcloud.io e configurado como secret do repositório no GitHub antes do Dev conseguir validar o workflow fim a fim (`US-09-01`, T01/T03)
- Vitest e pytest precisam gerar relatório de cobertura em formato que o Sonar consome (`lcov.info`, `coverage.xml`) — hoje nenhum dos dois gera (`US-09-01`, T05/T06); isso também é pré-requisito de `US-09-02` (gate de cobertura bloqueante), que reaproveita os mesmos relatórios
- Achados da primeira análise (bugs/code smells/vulnerabilidades) alimentam a próxima história do épico (`US-09-04`, refactor guiado pelos achados) — sem refactor especulativo até essa análise existir

## Referências
- `docs/agents/CONTEXTO-PROJETO.md`
- `docs/product/PRD-007-qualidade-engenharia.md`
- `docs/product/backlog/archive/fase-09/US-09-01-sonarcloud-ci.md`
- `ADR-002` (hospedagem free-tier)
