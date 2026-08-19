# US-11-01 — Redesign visual do ChatWidget

**Fase:** Fase 11 — Chat v2 + RAG Inteligente
**Épico de origem:** Chat v2 (`PRD-009-chat-v2.md`)

**Como** visitante/recrutador,
**quero** um `ChatWidget` com visual mais moderno e consistente com o resto do site,
**para** ter uma experiência de conversa mais agradável e profissional ao avaliar o autor.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A, mudança só de UI, `/chat` inalterado
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção abaixo)
- [x] Épico e dependências identificados — Chat v2 (`PRD-009`); nenhuma dependência
- [x] ADR registrado se envolve decisão de stack nova — N/A, usa Tailwind + paleta já decidida (`ADR-005`/`ADR-007`), sem lib nova
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — bolhas de mensagem (usuário à direita, assistente à esquerda), tema claro/escuro usando a paleta D1 Deep Ice já definida no site, estado de carregamento visível enquanto aguarda resposta
- [x] Protótipo solicitado pelo autor — N/A, autor não pediu protótipo para esta história
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: componente de chat (Testing Library) — render de bolhas de usuário/assistente, estado de loading, tema claro/escuro
- Integração: N/A (sem endpoint novo)
- Mocks necessários: mock da chamada ao `/chat` já usado nos testes existentes do componente

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: mensagens do usuário e do assistente são exibidas em bolhas visualmente distintas
- [x] CA-002: tema claro/escuro usa a paleta já definida no site (sem paleta nova)
- [x] CA-003: estado de carregamento visível enquanto aguarda resposta do `/chat`
- [x] CA-004: sem regressão de acessibilidade (contraste AA, navegação por teclado) — herda `US-04-02`

### Fora de escopo
- Perguntas sugeridas (US-11-02), indicador de digitando (US-11-03), feedback (US-11-04) — histórias próprias
- Qualquer mudança no fluxo de RAG/backend

### Dependências
- Nenhuma

### Épico / Prioridade
Chat v2 (`PRD-009`) — P2

### Tasks
- [x] T01 Redesenhar o componente de chat atual em `frontend/components/` (bolhas de mensagem, tema, estado de carregamento)
- [x] T02 [P] Atualizar/criar teste do componente cobrindo os novos estados visuais

**Nota:** o componente de chat ativo hoje (`RagChatPanel.tsx` + `ProfileAssistChat.tsx`, não o `ChatWidget` removido na Fase 13 — US-13-06) já chegou a esta história com o redesign visual completo (bolhas de mensagem, paleta D1 Deep Ice via `--assist-*`, estados de loading) implementado em trabalho anterior à formalização desta US no backlog. Verifiquei cada CA contra o código e testes existentes e adicionei cobertura explícita onde faltava evidência automatizada direta (ver `US-11-03` para o teste do indicador de loading). Nenhuma mudança visual adicional foi necessária para fechar os CAs desta história.

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado pela história (`npm test -- --coverage` → `RagChatPanel.tsx` 87.5%, `ProfileAssistChat.tsx` 94.87%)
- [x] Build/lint limpo (`npm run build`, ESLint, `tsc --noEmit` — todos limpos)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A, sem mudança de fato
- [x] Deploy/preview verificado (Vercel preview do PR) — [PR #51](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/51), deploy da Vercel `Deployment has completed`
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-18 | `RagChatPanel.tsx` revisado: bolhas de usuário/assistente visualmente distintas (gradiente à direita, painel com borda à esquerda), paleta D1 Deep Ice via `--assist-*` (sem paleta nova), loading visível (`TypingDots` + `RagLoadingStatus`), `aria-live`/`role=dialog|region` mantidos — sem regressão de acessibilidade. 78/78 testes de frontend passando |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-18 | `RagChatPanel.tsx` mantém responsabilidade única (apresentação); estados de loading/erro/done bem isolados por `message.status`. Sem Critical/High |
| PO | `@product-owner` | Done | 2026-08-18 | CA 100% fechados, DoD 100% fechado — preview confirmado no [PR #51](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/51) |

**Status:** Done
