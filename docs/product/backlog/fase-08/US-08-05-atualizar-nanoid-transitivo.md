# US-08-05 — Atualizar `nanoid` transitivo

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** dono do produto,
**quero** que a dependência transitiva `nanoid` (via `postcss`/`@tailwindcss/postcss`) esteja atualizada para a versão sem a vulnerabilidade reportada,
**para** eliminar o alerta do `npm audit` sem quebrar build/testes, mesmo sabendo que o risco real é baixo (dependência de build-time, não roda no client).

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (bump de dependência transitiva de build; não cria/altera endpoint)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance (`PRD-006`); origem do achado: [US-08-01](US-08-01-auditoria-seguranca.md) / [`QA-005`](../../../qa/QA-005-auditoria-seguranca.md), achado H1
- [x] ADR registrado se envolve decisão de stack nova — N/A (bump de patch de dependência transitiva já existente na stack, não é escolha de lib nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A (não introduz env var)
- [x] Referência visual definida — N/A (sem UI)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário/integração: nenhum teste novo — bump é de dependência transitiva de build (`postcss`/`nanoid`), sem lógica de aplicação tocada. Evidência = execução real dos comandos abaixo.
- Regressão: `npm test` (suíte completa, 63 testes) e `npm run build` (produção) após o `npm audit fix`, confirmando que o bump de patch não quebrou nada
- Mocks: nenhum

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: `npm audit` (em `frontend/`) não reporta mais a vulnerabilidade de `nanoid` (GHSA-2v37-7h3g-55p8)
- [x] CA-002: `npm test` continua verde com os 63 testes existentes (nenhuma regressão introduzida pelo bump)
- [x] CA-003: `npm run build` conclui sem erro após o bump
- [x] CA-004: nenhuma dependência **direta** do `package.json` foi alterada manualmente — só o lockfile reflete o bump transitivo de `nanoid` (via `npm audit fix`, sem `--force`)

### Fora de escopo

- Qualquer outra vulnerabilidade reportada pelo `npm audit`/`pip-audit` além de `nanoid` (tratadas em histórias próprias — ver `QA-005`)
- Substituir PostCSS/Tailwind ou mudar cadeia de dependências de build

### Dependências

- [PRD-006](../../PRD-006-seguranca-performance.md)
- [US-08-01](US-08-01-auditoria-seguranca.md) (Done) — origem do achado H1
- [`QA-005`](../../../qa/QA-005-auditoria-seguranca.md) — evidência do achado

### Épico / Prioridade

Segurança & Performance — P1

### Tasks

- [x] T01 Rodar `npm audit fix` em `frontend/` (bump de patch do `nanoid` transitivo, sem `--force`)
- [x] T02 [P] Rodar `npm test` e confirmar os 63 testes verdes
- [x] T03 [P] Rodar `npm run build` e confirmar build de produção sem erro
- [x] T04 Rodar `npm audit` novamente e confirmar ausência do achado `nanoid`/GHSA-2v37-7h3g-55p8

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — N/A (só lockfile de dependência transitiva de build, sem código de aplicação tocado)
- [x] Build/lint limpo (`npm run build`, lint do frontend)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado — N/A
- [x] Sem chave de API/secret exposto (client bundle ou repo)
- [x] Documentação atualizada — N/A (bump pontual de lockfile; sem mudança de comportamento a documentar)
- [x] Deploy/preview verificado — `npm run build` local já cobre o gate de build; próximo deploy Vercel automático confirma em produção (sem mudança de comportamento visível esperada)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-15 | `npm audit` antes: 1 high (`nanoid` GHSA-2v37-7h3g-55p8); após `npm audit fix`: 0 vulnerabilidades. `npm test -- --run`: 16 arquivos, 63/63 testes verdes. `npm run build`: sucesso (validate:resume + `next build`). Diff de `frontend/package-lock.json` revisado: única mudança é `nanoid` 3.3.17 → 3.3.18 (3 linhas alteradas); `frontend/package.json` sem diff — sem reinstalação ampla nem dependência direta tocada |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-15 | Diff revisado: `frontend/package-lock.json` só reflete bump transitivo de patch do `nanoid` (via `postcss`/`@tailwindcss/postcss`), sem alteração de dependência direta em `package.json`, sem mudança de comportamento de build (`next build` e `npm run lint` seguem limpos, únicos 2 warnings pré-existentes e não relacionados). Sem achado Critical/High |
| PO | `@product-owner` | Done | 2026-08-15 | CAs 100% `[x]`, DoD 100% fechado, vereditos QA e Tech Lead sem bloqueio, escopo respeitado (só bump do `nanoid`) |

**Status:** Done
