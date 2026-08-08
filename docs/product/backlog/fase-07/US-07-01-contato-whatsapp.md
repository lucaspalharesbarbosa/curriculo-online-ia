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

- [x] CA-001: `contactSchema` (`frontend/content/resume.schema.ts`) tem campo `whatsapp: z.string().url().nullable()`, e o tipo `Contact` reflete o novo campo
- [x] CA-002: `frontend/content/resume.json` populado com `"whatsapp": "https://wa.me/5517991123547"`
- [x] CA-003: `ContactSection` (`frontend/components/Contact.tsx`) renderiza um item "WhatsApp" com link para `contact.whatsapp`, abrindo em nova aba (`target="_blank"`, `rel="noopener noreferrer"`), seguindo o mesmo padrão visual/acessível dos demais itens da lista
- [x] CA-004: item de WhatsApp só renderiza quando `contact.whatsapp` não é `null` (mesmo padrão condicional de `email`/`github`)
- [x] CA-005: teste de componente cobre a renderização condicional do link de WhatsApp (presente e ausente)

### Fora de escopo

- Formulário de contato com persistência de dados (Fase 12 — Área Administrativa, `PRD-010`)
- Botão flutuante/widget de WhatsApp separado da seção de Contato — fica só como item da lista, mesmo tratamento dos demais canais

### Dependências

- US-03-08 (dados de Contato), US-03-16 (componente de Contato) — ambas Done

### Épico / Prioridade

Frontend & UX v2 — P1

### Tasks

- [x] T01 Adicionar campo `whatsapp` em `contactSchema`/tipo `Contact` (`frontend/content/resume.schema.ts`)
- [x] T02 [P] Popular `whatsapp` em `frontend/content/resume.json` com `https://wa.me/5517991123547`
- [x] T03 Renderizar item de WhatsApp em `frontend/components/Contact.tsx` (condicional, mesmo padrão de `email`/`github`)
- [x] T04 [P] Atualizar `frontend/components/Contact.test.tsx` e `frontend/content/resume.schema.test.ts` com os casos de WhatsApp

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado (`npm test -- --coverage`) — `Contact.tsx` e `resume.schema.ts` em 100% (sem linhas descobertas no relatório)
- [x] Build/lint limpo (`npm run build`, type checking estrito) — `next build` e `eslint .` sem erros (1 warning pré-existente em `coverage/block-navigation.js`, gerado, fora do escopo)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — ver Vereditos
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto (número de WhatsApp é dado público, não é segredo)
- [ ] Documentação atualizada (ADR/contrato/diagrama ER) se algo mudou de fato durante a implementação — N/A esperado
- [ ] Deploy/preview verificado (UI) — pendente: verificar preview do Vercel após abertura do PR
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `npm test -- --run --coverage`: 11 arquivos, 21 testes, 100% em `Contact.tsx`/`resume.schema.ts` | 2026-08-06 | 21/21 testes verdes |
| Tech Lead | `@tech-lead-review` | Aprovar — dado vem de `resume.json` (sem hardcode), mesmo padrão visual/acessível dos demais itens, `npm run build`/`eslint .` limpos, sem secret exposto | 2026-08-06 | build + lint OK |
| PO | `@product-owner` | Aprovado — CAs e DoR/DoD fechados; pendente apenas verificação de preview de deploy (fora do controle local) | 2026-08-06 | — |

**Status:** Quase lá — falta verificar preview de deploy (Vercel) após abertura do PR
