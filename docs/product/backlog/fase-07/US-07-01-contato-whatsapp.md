# US-07-01 — Ampliar seção de Contato com WhatsApp

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** um link direto de WhatsApp na seção de Contato,
**para** conseguir falar com o autor no canal que ele preferir, sem depender só de e-mail/LinkedIn.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (sem endpoint novo/alterado; dado estático em `resume.json`, mesmo padrão de `linkedin`/`github`/`email`)
- [x] Mapeamento de erros documentado — N/A (sem endpoint)
- [x] Modelagem de dados documentada — N/A (novo campo `whatsapp` em `contactSchema`, mesma forma dos campos já existentes; sem entidade relacionada)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Frontend & UX v2 (`PRD-005`); sem dependência bloqueante (seção de Contato já existe desde US-03-08/US-03-16)
- [x] ADR registrado se envolve decisão de stack nova — N/A (novo campo em schema já existente, sem lib/stack nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A (número de WhatsApp é dado público, publicado no `resume.json` da mesma forma que e-mail/GitHub; autor confirmou publicação do número via `@orquestrador` em 2026-08-06)
- [x] Referência visual definida — N/A (reaproveita o padrão visual já existente da lista de Contato — item `label: link`, mesmo estilo de LinkedIn/E-mail/GitHub em `frontend/components/Contact.tsx`)
- [x] Sem dúvida bloqueante — decisões fechadas com o autor: publicar número (sim) e manter contato como link direto, sem formulário com persistência (formulário fica para a Fase 12, se vier a existir)

#### Plano de testes

- Unitário: `frontend/content/resume.schema.test.ts` — validar que `contactSchema` aceita `whatsapp` como URL `https://wa.me/<numero>` e aceita `null`
- Integração: `frontend/components/Contact.test.tsx` — renderiza o item de WhatsApp com o link correto quando `contact.whatsapp` está presente; não renderiza quando `null` (mesmo padrão condicional já usado para `email`/`github`)
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: `contactSchema` (`frontend/content/resume.schema.ts`) tem campo `whatsapp: z.string().url().nullable()`, e o tipo `Contact` reflete o novo campo
- [ ] CA-002: `frontend/content/resume.json` populado com `"whatsapp": "https://wa.me/5517991123547"`
- [ ] CA-003: `ContactSection` (`frontend/components/Contact.tsx`) renderiza um item "WhatsApp" com link para `contact.whatsapp`, abrindo em nova aba (`target="_blank"`, `rel="noopener noreferrer"`), seguindo o mesmo padrão visual/acessível dos demais itens da lista
- [ ] CA-004: item de WhatsApp só renderiza quando `contact.whatsapp` não é `null` (mesmo padrão condicional de `email`/`github`)
- [ ] CA-005: teste de componente cobre a renderização condicional do link de WhatsApp (presente e ausente)

### Fora de escopo

- Formulário de contato com persistência de dados (Fase 12 — Área Administrativa, `PRD-010`)
- Botão flutuante/widget de WhatsApp separado da seção de Contato — fica só como item da lista, mesmo tratamento dos demais canais

### Dependências

- US-03-08 (dados de Contato), US-03-16 (componente de Contato) — ambas Done

### Épico / Prioridade

Frontend & UX v2 — P1

### Tasks

- [ ] T01 Adicionar campo `whatsapp` em `contactSchema`/tipo `Contact` (`frontend/content/resume.schema.ts`)
- [ ] T02 [P] Popular `whatsapp` em `frontend/content/resume.json` com `https://wa.me/5517991123547`
- [ ] T03 Renderizar item de WhatsApp em `frontend/components/Contact.tsx` (condicional, mesmo padrão de `email`/`github`)
- [ ] T04 [P] Atualizar `frontend/components/Contact.test.tsx` e `frontend/content/resume.schema.test.ts` com os casos de WhatsApp

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado (`npm test -- --coverage`)
- [ ] Build/lint limpo (`npm run build`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [ ] Sem chave de API/secret exposto (número de WhatsApp é dado público, não é segredo)
- [ ] Documentação atualizada (ADR/contrato/diagrama ER) se algo mudou de fato durante a implementação — N/A esperado
- [ ] Deploy/preview verificado (UI)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
