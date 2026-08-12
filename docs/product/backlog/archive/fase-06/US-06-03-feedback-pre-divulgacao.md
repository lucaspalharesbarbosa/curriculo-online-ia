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

- [x] CA-001: existe um registro em `docs/product/backlog/archive/fase-06/` (esta história) com roteiro curto para o revisor
- [N/A] CA-002: pelo menos **2** feedbacks distintos registrados — **cancelada** (decisão do autor 2026-08-11)
- [N/A] CA-003: disposition por feedback — **cancelada** (decisão do autor 2026-08-11)
- [N/A] CA-004: link US/PR de ajuste ou `N/A` — **cancelada** (decisão do autor 2026-08-11)

### Fora de escopo

- Divulgação ampla (post público, grupos grandes) — só após este gate
- Pesquisa quantitativa / NPS formal
- Implementação de melhorias grandes (viram US de fases posteriores)

### Dependências

- Site em produção (US-03-17) e chat utilizável (Fase 05)
- US-06-01 e US-06-02 podem avançar em paralelo; divulgação ampla espera este gate — **gate removido** com o cancelamento desta US

### Área / Prioridade

Divulgação — P3

### Tasks

- [x] T01 Escrever roteiro curto de review nesta história
- [N/A] T02 Autor coleta e registra ≥ 2 feedbacks — cancelada pelo autor (2026-08-11)
- [N/A] T03 Marcar disposition / abrir US/fix — cancelada pelo autor (2026-08-11)

### Roteiro para o revisor (5–10 min)

> Mantido só como referência histórica; coleta formal não será feita nesta US.

1. Abrir https://lucas-palhares-cv.vercel.app no celular e no desktop (se possível)
2. Conferir se nome, papel e contatos fazem sentido
3. Percorrer Experiência e Habilidades — algo confuso ou desatualizado?
4. Abrir o assistente e perguntar algo factual (ex.: última experiência, stack)
5. Anotar: o que funcionou, o que atrapalhou, nota subjetiva 1–5

### Registro de feedbacks

| # | Quem (iniciais/nome) | Data | Canal | Pontos | Disposition |
|---|---|---|---|---|---|
| — | _não coletado_ | — | — | US cancelada | N/A |

### Motivo do cancelamento

Autor decidiu **não** executar a coleta formal de 2–3 feedbacks antes da divulgação (2026-08-11). README + links GitHub/LinkedIn (US-06-01/02) bastam para fechar a Fase 6. Feedback espontâneo pode entrar depois via histórias da Fase 7+ se necessário.

### DoD (antes de concluir)

- [N/A] Todos os critérios de aceite acima `[x]` — escopo restante cancelado; CA-001 mantido; CA-002–004 `N/A`
- [N/A] Cobertura de testes ≥ 70% — processo de lançamento
- [N/A] Build/lint
- [N/A] Review do `@tech-lead-review` sem Critical/High — cancelamento de escopo, sem entrega nova
- [N/A] Contrato de API
- [x] Sem chave de API/secret exposto
- [x] Roadmap atualizado se a Fase 6 fechar
- [N/A] Deploy/preview de UI nova
- [x] Vereditos de QA, Tech Lead e PO na tabela abaixo
- [x] Status da história atualizado neste arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas — CA-002–004 pendentes (feedbacks) | 2026-08-10 | `docs/qa/QA-003-fase-06-divulgacao.md` |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas — roteiro ok; Done espera ≥2 feedbacks | 2026-08-10 | review branch `feature/fase-06-divulgacao` |
| PO | `@product-owner` | **Cancelada** — autor desistiu da coleta formal de feedback; não bloqueia Fase 6 | 2026-08-11 | decisão do autor no chat |

**Status:** Cancelada
