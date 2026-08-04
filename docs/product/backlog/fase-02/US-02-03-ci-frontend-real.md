# US-02-03 — Conectar frontend-ci.yml ao lint + build reais

**Fase:** Fase 02 — Setup do projeto
**Épico de origem:** Deploy (`PRD-004-deploy.md`) — ex-US-D01

**Como** desenvolvedor,
**quero** que o CI do frontend rode lint e build de verdade a cada PR,
**para** pegar erro antes do merge, não depois do deploy.

### DoR (antes de iniciar)

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (workflow CI)
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido — validação local dos mesmos comandos do workflow
- [x] Épico e dependências identificados — Deploy; depende de US-02-01 (concluída)
- [x] ADR registrado se envolve decisão de stack nova — N/A
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — N/A
- [x] Sem dúvida bloqueante

#### Plano de testes

- Validar localmente: `npm ci`, `npm run lint`, `npm run format`, `npm test -- --run`, `npm run build`
- Workflow: `.github/workflows/frontend-ci.yml` sem guards condicionais de esqueleto

### Critérios de aceite

- [x] CA-001: `frontend-ci.yml` roda `npm run lint` e `npm run build` do projeto real (pós US-02-01)
- [x] CA-002: PR com lint/build quebrado falha o check

### Fora de escopo

- Deploy em si (US-03-17)

### Dependências

- US-02-01

### Épico / Prioridade

Deploy — P1

### Tasks

- [x] T01 Atualizar `.github/workflows/frontend-ci.yml` com lint + build reais

### DoD (antes de concluir)

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — N/A (história de CI; cobertura validada em US-02-01)
- [x] Build/lint limpo — comandos do workflow passando localmente
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — workflow documentado implicitamente no próprio YAML
- [x] Deploy/preview verificado — N/A
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-04 | Comandos do workflow (`lint`, `format`, `test`, `build`) executados localmente com sucesso |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-04 | Removidos `if: hashFiles(...)` condicionais; steps obrigatórios em PR/push |
| PO | `@product-owner` | Done | 2026-08-04 | Critérios de aceite e DoD 100% fechados |

**Status:** Done
