# US-08-10 — Reduzir payload de JS client-side da Home

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** visitante/recrutador acessando pelo celular,
**quero** que a Home carregue e fique interativa mais rápido,
**para** ter uma primeira impressão melhor do site em conexões/dispositivos mais lentos.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (só client JS/build, sem endpoint)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (nenhuma entidade nova/alterada)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance (`PRD-006`); origem do achado: [US-08-04](US-08-04-auditoria-performance.md) / [`QA-006`](../../../qa/QA-006-auditoria-performance.md), achado M1 (+ L2 agrupado)
- [x] ADR registrado se envolve decisão de stack nova — N/A (revisão de uso de libs já aprovadas — `framer-motion` em `ADR-005` — e de config de build já existente; sem lib nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — N/A (sem UI nova; CA-006 da US-08-04 já veda refactor visual — esta história otimiza o "como" carrega, não o "o quê" aparece)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Plano de testes

- Manual: Lighthouse mobile em produção (mesma técnica de `QA-006`) antes/depois, confirmando Performance ≥ 92 (sem regressão) e `unused-javascript` menor que o baseline de 69 KiB medido em `QA-006`
- Regressão: `npm test` (suíte completa) e `npm run build` sem quebrar; nenhuma mudança visível de UI (mesmo output renderizado)
- Mocks: nenhum

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: Lighthouse mobile em produção real mantém Performance ≥ 92 (não regride o baseline de `QA-006`)
- [ ] CA-002: `unused-javascript` do Lighthouse mobile reporta savings menor que 69 KiB (baseline de `QA-006`) após revisão de imports de `framer-motion`/`lucide-react`/`react-icons` (garantir tree-shaking — imports nomeados, não wildcard)
- [ ] CA-003: `legacy-javascript-insight` do Lighthouse não reporta mais polyfills para `Array.prototype.at`/`flat`/`flatMap` após revisão do `browserslist`/target de compilação do Next.js para navegadores modernos reais (sem suporte a IE11/legado, que este site nunca precisou suportar)
- [ ] CA-004: nenhuma mudança visível de UI — suíte de testes existente (`npm test`) permanece 100% verde, sem alterar snapshot/comportamento de nenhum componente

### Fora de escopo

- Redesign visual ou remoção de animações existentes (o motion em si já foi um trade-off aceito conscientemente em `US-07-06`) — esta história é sobre **como** o JS é entregue/tree-shaken, não sobre remover funcionalidade
- Trocar `framer-motion` por outra lib de animação — fora de proporção para o ganho esperado
- Lazy-loading de componentes abaixo da dobra, se exigir reestruturação de componente (avaliar caso a caso; só entra se for troca trivial de import)

### Dependências

- [PRD-006](../../PRD-006-seguranca-performance.md)
- [US-08-04](US-08-04-auditoria-performance.md) (Done) — origem do achado M1/L2
- [`QA-006`](../../../qa/QA-006-auditoria-performance.md) — evidência do achado e baseline numérico
- `ADR-005` (framer-motion já aprovado, sem reabrir decisão de stack)

### Épico / Prioridade

Segurança & Performance — P2

### Tasks

- [ ] T01 Revisar imports de `framer-motion`, `lucide-react` e `react-icons` nos componentes da Home (`Hero`, `MobileHero`, `ResumeSidebar`, etc.) garantindo import nomeado/tree-shakeable, não wildcard
- [ ] T02 [P] Revisar `browserslist`/target de compilação do Next.js (`package.json` ou `.browserslistrc`) para remover polyfills desnecessários de navegadores legados
- [ ] T03 Rodar Lighthouse mobile em produção pós-deploy e comparar com o baseline de `QA-006` (Performance, `unused-javascript`, `legacy-javascript-insight`)
- [ ] T04 [P] `npm test` e `npm run build` para regressão

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — N/A esperado se só forem ajustes de import/config de build, a confirmar durante a implementação
- [ ] Build/lint limpo (`npm run build`, `npm run lint`)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API — N/A
- [ ] Sem chave de API/secret exposto
- [ ] Documentação atualizada — `QA-006` referenciado como origem; resultado do Lighthouse pós-fix registrado no relatório de fechamento desta história
- [ ] Deploy/preview verificado — Lighthouse mobile real em produção pós-deploy
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
