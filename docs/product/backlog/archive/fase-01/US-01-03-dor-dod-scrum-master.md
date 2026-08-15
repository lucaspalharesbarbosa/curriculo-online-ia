# US-01-03 — DoR/DoD formal e quadro de tarefas

**Fase:** Fase 01 — Descoberta e planejamento
**Área de origem:** Processo (`scrum-master`) — não bloqueia as demais fases

**Como** time do projeto (o próprio autor, solo),
**quero** DoR/DoD formal e um quadro de tarefas leve definidos,
**para** ter um processo mínimo de acompanhamento, proporcional a um projeto pessoal.

### Critérios de aceite
- [x] CA-001: DoR/DoD padrão do projeto revisado e confirmado (já existe uma versão embutida em `references/story-template.md` do `@product-owner`; falta uma passada formal do `@scrum-master`)
- [x] CA-002: cadência de acompanhamento definida (ex.: ciclos semanais, não sprints de time)

### Fora de escopo
- DoR/DoD específico de cada história (já vive em cada arquivo de backlog)

### Dependências
- Nenhuma

### Área / Prioridade
Processo — P3

### Tasks
- [x] T01 Revisão formal do DoR/DoD padrão pelo `@scrum-master`
- [x] T02 Definir cadência de acompanhamento

### Revisão formal (Scrum Master)

**T01 — DoR/DoD padrão (`@product-owner`, `references/story-template.md`)**

Confirmado sem alteração estrutural. Avaliação:
- Proporcional ao projeto: nenhum item pressupõe capacidade de time, alocação por pessoa ou pareamento — consistente com o contexto solo do `@scrum-master`.
- Gate coerente entre skills: o DoR ("100% fechado antes da Fase 3") e o DoD ("Critérios de aceite + DoD 100% fechados antes da Fase 6") já são aplicados como gates não-negociáveis pelo `@orquestrador` (`references/pipeline-flows.md`) — a revisão apenas formaliza o que já estava em uso, não introduz processo novo.
- Risco identificado: a tabela "Vereditos" exige QA + Tech Lead + PO em toda história, mesmo em mudanças pequenas (ex.: texto em `resume.json`). Não é motivo para alterar o template agora — histórias assim já tendem a ter DoD com itens `N/A` justificados (ex.: cobertura de teste) — mas é um ponto a observar se virar atrito real ao longo da Fase 03.
- Quadro de tarefas leve: confirmado que os próprios arquivos de backlog (`docs/product/backlog/fase-FF/US-FF-NN-*.md`, checkboxes `[ ]`/`[x]`) somados ao `references/progress-dashboard.md` do `@product-owner` cumprem esse papel. Não há necessidade de ferramenta externa (Trello/Jira/GitHub Projects) para um backlog de uma pessoa só.

**T02 — Cadência de acompanhamento**

- **Ciclo:** semanal, substituindo o conceito de sprint — sem capacidade de time fixa, dimensionado pela disponibilidade real do autor na semana.
- **Início de ciclo:** revisão leve do backlog da fase corrente e seleção das próximas tasks a puxar — não uma Sprint Planning formal com estimativa de pontos.
- **Fim de ciclo:** autoavaliação objetiva (substitui retrospectiva em grupo): o que fluiu, o que travou, uma ação de melhoria para o próximo ciclo. Ver `@scrum-master`, `references/sprint-retrospective.md`, adaptado para execução solo.
- **Métricas:** Throughput (tasks `[X]` concluídas por ciclo) e Lead Time (dias entre task criada e marcada `[X]`) — apuradas via `references/progress-dashboard.md`. Velocity e CFD entre pessoas não se aplicam.
- **Frequência de checkpoint:** ao fim de cada ciclo semanal (dia flexível, conforme disponibilidade do autor), não em dia fixo de calendário.

**Riscos:**
- Cadência semanal pode ficar sem dono se não houver hábito de revisão — sem time para cobrar, o ciclo só funciona se o checkpoint virar rotina.
- Observar ao longo da Fase 03 (maior volume de histórias) se o gate de Vereditos (QA+TL+PO por história) gera atrito desproporcional em mudanças pequenas; se sim, tratar como ADR/ajuste de processo, não silenciosamente pular o gate.

**Próximos passos:**
- Aplicar o ciclo semanal a partir da Fase 02 (setup do projeto).
- Reavaliar o ritmo (Throughput/Lead Time) ao fim da Fase 03, quando houver volume suficiente de histórias concluídas para o dado ser útil.

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | N/A — história de processo/documentação (revisão de DoR/DoD, cadência), sem código a testar | 2026-08-04 | — |
| Tech Lead | `@tech-lead-review` | N/A — sem diff de código de produto | 2026-08-04 | — |
| PO | `@product-owner` | Done | 2026-08-04 | Critérios de aceite e tasks 100% `[x]`; revisão formal do `@scrum-master` acima |

**Status:** Done — DoR/DoD confirmado pelo `@scrum-master`, cadência de acompanhamento definida, aceito pelo `@product-owner`
