# US-06-03 — Feedback de 2–3 pessoas antes da divulgação ampla

**Fase:** Fase 06 — Divulgação
**Área de origem:** Divulgação / lançamento (checklist do roadmap; sem PRD de épico)

**Como** autor do portfólio,
**quero** validar o site e o chat com 2–3 pessoas de confiança antes de divulgar amplamente,
**para** corrigir atritos óbvios e não queimar a primeira impressão.

### DoR (antes de iniciar) — 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [N/A] Contrato de API — sem endpoint
- [N/A] Mapeamento de erros — sem endpoint
- [N/A] Modelagem de dados — sem entidade
- [x] Plano de testes definido — smoke manual com roteiro curto para os revisores
- [x] Épico e dependências identificados — Divulgação; site + chat em produção
- [N/A] ADR — sem stack nova
- [N/A] Variáveis de ambiente/segredos
- [N/A] Referência visual
- [N/A] Protótipo — não solicitado
- [x] Sem dúvida bloqueante — coleta de feedback é ação do autor; o repo só guarda o registro

#### Plano de testes

- Unitário: N/A
- Manual (revisores): abrir o site; ler Hero/Experiência; enviar 1–2 perguntas no chat; anotar atritos (mobile, clareza, bugs)

### Critérios de aceite

- [x] CA-001: existe um registro em `docs/product/backlog/fase-06/` (esta história) com roteiro curto para o revisor
- [ ] CA-002: pelo menos **2** feedbacks distintos registrados (nome/iniciais, data, canal, 1–3 pontos)
- [ ] CA-003: cada feedback tem disposition: `ok` | `ajuste feito` | `adiado` (com motivo curto se adiado)
- [ ] CA-004: se houver ajuste de produto derivado do feedback, link da US/PR correspondente — ou `N/A` se só validação

### Fora de escopo

- Divulgação ampla (post público, grupos grandes) — só após este gate
- Pesquisa quantitativa / NPS formal
- Implementação de melhorias grandes (viram US de fases posteriores)

### Dependências

- Site em produção (US-03-17) e chat utilizável (Fase 05)
- US-06-01 e US-06-02 podem avançar em paralelo; divulgação ampla espera este gate

### Área / Prioridade

Divulgação — P3

### Tasks

- [x] T01 Escrever roteiro curto de review nesta história
- [ ] T02 Autor coleta e registra ≥ 2 feedbacks na tabela abaixo
- [ ] T03 Marcar disposition de cada item; abrir US/fix só se necessário

### Roteiro para o revisor (5–10 min)

1. Abrir https://lucas-palhares-cv.vercel.app no celular e no desktop (se possível)
2. Conferir se nome, papel e contatos fazem sentido
3. Percorrer Experiência e Habilidades — algo confuso ou desatualizado?
4. Abrir o assistente e perguntar algo factual (ex.: última experiência, stack)
5. Anotar: o que funcionou, o que atrapalhou, nota subjetiva 1–5

### Registro de feedbacks

| # | Quem (iniciais/nome) | Data | Canal | Pontos | Disposition |
|---|---|---|---|---|---|
| 1 | _pendente_ | | | | |
| 2 | _pendente_ | | | | |
| 3 | _opcional_ | | | | |

### DoD (antes de concluir)

- [ ] Todos os critérios de aceite acima `[x]`
- [N/A] Cobertura de testes ≥ 70% — processo de lançamento
- [N/A] Build/lint
- [ ] Review do `@tech-lead-review` sem Critical/High (escopo docs)
- [N/A] Contrato de API
- [ ] Sem chave de API/secret exposto
- [ ] Roadmap atualizado se a Fase 6 fechar
- [N/A] Deploy/preview de UI nova
- [ ] Vereditos de QA, Tech Lead e PO na tabela abaixo
- [ ] Status da história atualizado neste arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas — CA-002–004 pendentes (feedbacks) | 2026-08-10 | `docs/qa/QA-003-fase-06-divulgacao.md` |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas — roteiro ok; Done espera ≥2 feedbacks | 2026-08-10 | review branch `feature/fase-06-divulgacao` |
| PO | `@product-owner` | Quase lá — falta registro de ≥2 feedbacks (CA-002–004) | 2026-08-10 | |

**Status:** Quase lá
