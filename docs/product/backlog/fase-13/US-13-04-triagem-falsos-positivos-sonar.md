# US-13-04 — Triagem de falsos positivos no dashboard do Sonar

**Fase:** Fase 13 — Qualidade de Engenharia (continuação)
**Épico de origem:** Qualidade de Engenharia (`PRD-007-qualidade-engenharia.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** marcar como falso positivo os achados do Sonar que não representam risco real,
**para** o dashboard refletir dívida técnica de verdade, sem ruído que desvie a atenção de achados reais.

Esta história **não gera diff de código** — é uma ação no dashboard do sonarcloud.io (marcar issue → "Mark as" → "False Positive", com o comentário de justificativa abaixo). Ação do autor (precisa de login); eu não tenho token com permissão de admin de issues para fazer isso pela API pública.

### Achados a marcar

| Projeto | Achado | Local | Justificativa |
|---|---|---|---|
| Backend | `pythonsecurity:S2083` (BLOCKER/VULNERABILITY) — "Change this code to not construct the path from user-controlled data" | `backend/app/env_bootstrap.py:33` | `_ENV_PATH`/`_EXAMPLE_PATH` são `Path` fixos derivados de `Path(__file__).resolve().parent.parent` — não há nenhum dado de request/usuário envolvido; a função roda uma vez no bootstrap do processo (`ensure_local_env()`, chamada antes da criação do `FastAPI app` em `main.py`), nunca por request. Taint analysis do Sonar parece ter associado o arquivo à proximidade de `app/` (FastAPI) sem seguir o fluxo real |
| Frontend | `typescript:S1186` (CRITICAL) x3 — "Unexpected empty method" | `frontend/vitest.setup.ts:13-15` | `observe`/`unobserve`/`disconnect` vazios são o stub intencional do mock de `IntersectionObserver` usado nos testes — corpo vazio é o comportamento correto do mock, não uma omissão |

### Critérios de aceite

- [x] CA-001: os 4 achados acima aparecem como "Falso Positivo" no dashboard do Sonar (`Issues` filtrado por `status=RESOLVED` + `resolution=FALSE-POSITIVE`), com o comentário de justificativa da tabela acima — confirmado via API (`issues/search?rules=pythonsecurity:S2083`/`rules=typescript:S1186`): os 4 achados retornam `status=RESOLVED`, `resolution=FALSE-POSITIVE`
- [x] CA-002: `main` sem esses 4 achados na visão padrão (issues não-resolvidos) — confirmado via `issues/search?branch=main&resolved=false&rules=...`: `total: 0` para as duas regras, nos dois projetos (2026-08-18)

### Fora de escopo
- Qualquer mudança de código — se a investigação encontrar que algum desses achados é real depois de tudo, vira história própria em vez de forçar o falso positivo

### Épico / Prioridade
Qualidade de Engenharia — P1

### Tasks
- [x] T01 (autor) Marcar os 4 achados como Falso Positivo no dashboard, com o texto de justificativa
- [x] T02 `@product-owner` confirmar via API (`issues/search`) que os 4 saíram da lista de não-resolvidos — confirmado 2026-08-18

### DoD

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes — `N/A`, sem diff de código
- [x] Build/lint limpo — `N/A`, sem diff de código
- [x] Review do `@tech-lead-review` — `N/A`, história é ação de dashboard, sem diff de código para revisar
- [x] Contrato de API — `N/A`
- [x] Sem chave/secret exposto — `N/A`
- [x] Documentação atualizada — esta própria história
- [x] Deploy/preview verificado — `N/A`
- [x] Vereditos de QA, Tech Lead e PO documentados abaixo
- [x] Status atualizado no próprio arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | `N/A` | 2026-08-18 | Sem diff de código para testar — verificação é a própria consulta à API do Sonar (CA-001/CA-002) |
| Tech Lead | `@tech-lead-review` | `N/A` | 2026-08-18 | Sem diff de código para revisar — ação de dashboard do autor |
| PO | `@product-owner` | Done | 2026-08-18 | 2/2 CA fechados com evidência real (API `issues/search`): os 4 achados em `RESOLVED/FALSE-POSITIVE`, 0 achados não-resolvidos para as 2 regras nos 2 projetos |

**Status:** Done
