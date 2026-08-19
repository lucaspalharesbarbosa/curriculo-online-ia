# PRD-007 — Qualidade de Engenharia

**Status:** em andamento — `US-09-01` Done (Fase 9 arquivada); Fase 13: `US-13-02`/`US-13-04` Done; `US-13-01`/`US-13-05`/`US-13-06`/`US-13-07`/`US-13-08` Quase lá (código/QA/Tech Lead completos, falta CI real e/ou reanálise do Sonar pós-merge); `US-13-03` `Cancelada` (achados reais triados, decomposta em `US-13-04` a `US-13-08`)
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
| Gate de cobertura mínima automatizado no CI (frontend e backend) | P1 | [US-13-01](backlog/fase-13/US-13-01-gate-cobertura-ci.md) (Quase lá) |
| Padronizar shape de erro e status codes REST no backend | P2 | [US-13-02](backlog/fase-13/US-13-02-boas-praticas-rest-backend.md) (Done) |
| Refactor/modularização guiado pelos achados do SonarCloud (placeholder) | P3 | [US-13-03](backlog/fase-13/US-13-03-refactor-modularizacao-sonarcloud.md) (Cancelada — decomposta abaixo) |
| Triagem de falsos positivos do Sonar (ação do autor) | P1 | [US-13-04](backlog/fase-13/US-13-04-triagem-falsos-positivos-sonar.md) (Done) |
| Backend: achados reais em `chat.py` | P2 | [US-13-05](backlog/fase-13/US-13-05-backend-achados-chat-py.md) (Quase lá) |
| Frontend: remover `ChatWidget` morto + achados reais nos componentes de chat | P2 | [US-13-06](backlog/fase-13/US-13-06-frontend-chat-widget-morto-achados.md) (Quase lá) |
| Frontend: regex com risco de performance em `lib/utils.ts` | P2 | [US-13-07](backlog/fase-13/US-13-07-frontend-regex-lib-utils.md) (Quase lá) |
| Frontend: migrar API depreciada do Zod em `resume.schema.ts` | P2 | [US-13-08](backlog/fase-13/US-13-08-frontend-migracao-zod.md) (Quase lá) |

## Riscos

- Ativar gate de cobertura mínima retroativamente pode quebrar o CI se algum módulo já existente estiver abaixo de 70% — rodar a métrica antes de tornar o gate bloqueante, para não travar todo PR futuro por dívida antiga
- SonarCloud pode acusar findings de baixo valor (nit) em massa na primeira análise — priorizar por severidade real, não tentar zerar tudo de uma vez

## DoR do épico
- [ ] Toda história do épico tem seu próprio DoR fechado — `US-13-01`/`US-13-02` fechados; `US-13-03` aberto (aguardando T00, triagem de achados)
- [x] Tasks decompostas (`references/task-breakdown-guide.md`) — `US-13-01`/`US-13-02` com tasks reais; `US-13-03` só com a task de triagem (T00/T01) até os achados existirem
- [ ] Cobertura atual medida antes de tornar o gate de CI bloqueante — baseline de `US-09-01` (2026-08-16) documentada em `US-13-01`; nova medição em tempo real é T03 do Dev
