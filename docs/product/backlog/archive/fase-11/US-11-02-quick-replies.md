# US-11-02 — Perguntas sugeridas (quick replies) no ChatWidget

**Fase:** Fase 11 — Chat v2 + RAG Inteligente
**Épico de origem:** Chat v2 (`PRD-009-chat-v2.md`)

**Como** visitante/recrutador,
**quero** ver perguntas sugeridas ao abrir o chat,
**para** saber o que perguntar sem precisar pensar do zero.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A, reusa `/chat` já existente
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção abaixo)
- [x] Épico e dependências identificados — Chat v2 (`PRD-009`); nenhuma dependência bloqueante (ver nota abaixo)
- [x] ADR registrado se envolve decisão de stack nova — N/A
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — chips/botões com 3-4 perguntas prontas abaixo do campo de input, somem ou ficam secundários após a primeira pergunta enviada
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

Nota: as perguntas sugeridas devem incluir os casos que hoje falham ("onde você estudou?", "qual sua última experiência?") — reforça visualmente a correção entregue em `US-11-06`, mas não bloqueia esta história (o texto do botão funciona independente da qualidade da resposta).

#### Plano de testes

- Unitário: componente de quick replies — render das sugestões, clique preenche/envia a pergunta, sugestões saem de destaque após primeira mensagem
- Mocks necessários: mock da chamada ao `/chat`

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: ao abrir o chat sem histórico, aparecem perguntas sugeridas clicáveis
- [x] CA-002: clicar numa sugestão envia a pergunta automaticamente
- [x] CA-003: sugestões ficam secundárias (ou somem) após a primeira pergunta enviada, sem competir visualmente com o histórico de conversa

### Fora de escopo
- Conteúdo dinâmico das sugestões (lista é estática, definida no frontend)

### Dependências
- Nenhuma (independente de `US-11-06`, embora reforce a mesma correção)

### Épico / Prioridade
Chat v2 (`PRD-009`) — P2

### Tasks
- [x] T01 Criar componente de quick replies em `frontend/components/`, integrado ao componente de chat
- [x] T02 [P] Teste do componente cobrindo render, clique e transição de estado

**Nota:** as quick replies (`chipSuggestions` em `RagChatPanel.tsx`, alimentadas por `suggestions`/`PROBES` em `ProfileAssistChat.tsx`) já existiam de trabalho anterior à formalização desta US — render, clique-envia (`onSuggestion`) e some após a primeira mensagem já implementados. Adicionei um teste dedicado (`"some com as sugestões após a primeira pergunta enviada"`) para fechar a evidência automatizada explícita do CA-003, que antes só era coberto indiretamente.

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado pela história (`npm test -- --coverage` → `RagChatPanel.tsx` 87.5%, `ProfileAssistChat.tsx` 94.87%)
- [x] Build/lint limpo (`npm run build`, ESLint, `tsc --noEmit` — todos limpos)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A
- [x] Deploy/preview verificado (Vercel preview do PR) — [PR #51](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/51), deploy da Vercel `Deployment has completed`
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-18 | `chipSuggestions` em `RagChatPanel.tsx` renderiza só quando `messages.length === 0`; clique chama `onSuggestion`/`setQuestion`; sugestões somem por completo (não só "secundárias") após a 1ª mensagem — satisfaz CA-003. Teste dedicado confirmando o comportamento passando |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-18 | Lógica de sugestões contida em `chipSuggestions`/props, sem estado duplicado. Sem Critical/High |
| PO | `@product-owner` | Done | 2026-08-18 | CA 100% fechados, DoD 100% fechado — preview confirmado no [PR #51](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/51) |

**Status:** Done
