# PRD-007 — Qualidade de Engenharia

**Status:** em andamento — `US-09-01` Done (Fase 9 arquivada); demais frentes ainda em draft, sem história (herdam novo número de fase quando priorizadas — `09` não é reaproveitado)
**Épico:** Qualidade de Engenharia
**Prioridade:** P2

## Problema

O CI atual (`frontend-ci.yml`/`backend-ci.yml`) roda lint e testes, mas não tem gate automático de qualidade (SonarCloud, cobertura mínima bloqueante) — o piso de 70% de cobertura hoje é regra do DoD verificada manualmente pelo `@qa-engineer`/`@tech-lead-review`, não travada no pipeline. O backend também ainda não teve uma revisão dedicada de boas práticas REST.

## Objetivo

CI com gate automático de qualidade (lint + Sonar + cobertura mínima bloqueando merge), backend seguindo boas práticas REST de forma consistente, e eventuais refactors feitos a partir de achados reais do SonarCloud — não de uma reescrita especulativa.

## Escopo

### Incluído
- SonarCloud (grátis para repositório público) integrado a `frontend-ci.yml` e `backend-ci.yml`
- Gate de cobertura mínima automatizado no CI (hoje é só checklist do DoD — vira `--coverage`/`--cov` com threshold que falha o pipeline abaixo de 70% no código tocado)
- Revisão de boas práticas REST no backend: status codes consistentes, shape de erro padronizado (conecta direto com a nova regra de mapeamento de erros no DoR de toda história de endpoint), versionamento de API se fizer sentido
- Refactor/modularização pontual, guiado pelos achados do SonarCloud — não big-bang

### Excluído
- Reescrita de arquitetura sem achado concreto que a justifique (seguindo a postura padrão do `@senior-developer`: diff mínimo, sem over-engineering)
- Migração de framework de teste ou de CI (GitHub Actions e Vitest/pytest continuam)

## Persona

O próprio autor, como mantenedor do código a médio prazo.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| Adicionar SonarCloud ao CI (frontend e backend) | P1 | [US-09-01](backlog/archive/fase-09/US-09-01-sonarcloud-ci.md) (Done) |
| Gate de cobertura mínima automatizado no CI (frontend e backend) | P1 | — |
| Revisão de boas práticas REST no backend (status codes, shape de erro padronizado) | P2 | — |
| Refactor/modularização guiado pelos achados do SonarCloud | P3 | — |

## Riscos

- Ativar gate de cobertura mínima retroativamente pode quebrar o CI se algum módulo já existente estiver abaixo de 70% — rodar a métrica antes de tornar o gate bloqueante, para não travar todo PR futuro por dívida antiga
- SonarCloud pode acusar findings de baixo valor (nit) em massa na primeira análise — priorizar por severidade real, não tentar zerar tudo de uma vez

## DoR do épico
- [ ] Toda história do épico tem seu próprio DoR fechado
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
- [ ] Cobertura atual medida antes de tornar o gate de CI bloqueante
