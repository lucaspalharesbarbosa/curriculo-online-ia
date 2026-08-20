# US-15-03 — Frontend: enviar histórico ao backend

**Fase:** Fase 15 — Memória Conversacional (RAG)
**Épico de origem:** RAG (`PRD-013-memoria-conversacional-rag.md`)

**Como** visitante/recrutador,
**quero** que o assistente lembre o que perguntei antes na mesma conversa,
**para** poder fazer perguntas de acompanhamento naturais sem repetir contexto já dado.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — consome o contrato de `ChatRequest.history` definido em `ADR-014` (janela de 6 mensagens, teto de 20/4000 caracteres); documentado como consumidor, não como origem
- [x] Mapeamento de erros documentado — N/A, nenhum erro novo tratado no cliente além dos já existentes em `http-chat-client.ts`
- [x] Modelagem de dados documentada — N/A, sem entidade nova; reaproveita `messages` já mantido em `useResumeChat`
- [x] Plano de testes definido (ver subseção abaixo)
- [x] Épico e dependências identificados — RAG (`PRD-013`); depende de **US-15-02** (contrato do backend) — implementação de US-15-02 é pré-requisito de *início do Dev* desta história (ver Dependências), não do fechamento do DoR
- [x] ADR registrado se envolve decisão de stack nova — N/A, nenhuma decisão de stack nova nesta história (consome `ADR-014`, já registrada em US-15-01)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A, nenhuma nova
- [x] Referência visual definida — N/A, sem mudança visual (só payload enviado)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `frontend/modules/chat/lib/chat-client.test.ts` (novo ou existente) — port `ChatClient.sendMessage` aceita e repassa `history` no formato acordado com o backend
- Unitário: `frontend/modules/chat/lib/http-chat-client.test.ts` — adapter HTTP inclui `history` no body da requisição, truncado à janela definida em `ADR-014`
- Unitário: `frontend/hooks/useResumeChat.test.ts` — hook serializa as últimas N trocas de `messages` (role `user`/`assistant`) e as passa para `sendMessage`; hook sem histórico anterior (primeira pergunta) envia `history` vazio/ausente sem quebrar
- Mocks necessários: `ChatClient` mockado nos testes do hook, evitando chamada HTTP real (padrão de testes já usado no domínio `chat`)

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: port `ChatClient.sendMessage` (`chat-client.ts`) passa a aceitar `history` opcional, seguindo o shape definido em `ADR-014` — `ChatHistoryMessage`/`ChatHistoryRole` novos, `MAX_HISTORY_MESSAGES = 6` exportado
- [x] CA-002: adapter `http-chat-client.ts` inclui `history` no body de `POST /chat` quando fornecido, respeitando a janela deslizante (últimas N trocas) definida na ADR — `test_trunca o history às últimas MAX_HISTORY_MESSAGES trocas antes de enviar`
- [x] CA-003: `useResumeChat.ts` serializa o `messages` já mantido em estado local para o formato `history` esperado pelo `ChatClient`, e o envia a cada nova pergunta — exclui turnos com erro (não são resposta real de contexto)
- [x] CA-004: primeira pergunta de uma conversa nova (sem histórico anterior) continua funcionando sem erro, enviando `history` vazio ou omitido — teste original do hook mantido, agora com `history: []` explícito
- [x] CA-005: cenário relatado validado ponta a ponta no frontend — pergunta 1 sobre onde o autor trabalha, pergunta 2 "onde fica a matriz da empresa?" recebe resposta que resolve a referência. `envia o histórico da troca anterior na segunda pergunta (CA-003/CA-005, ADR-014)` em `useResumeChat.test.ts`

### Fora de escopo
- Lógica de reformulação/retrieval (US-15-02, backend)
- `frontend/app/api/chat/route.ts` — proxy já repassa o body recebido sem alteração; nenhuma mudança necessária, só confirmar em teste que o campo novo passa incólume

### Dependências
- US-15-02 (backend: contrato `history` implementado) — bloqueante

### Épico / Prioridade
RAG (`PRD-013`) — P1

### Tasks
- [x] T01 Ajustar a interface do port `ChatClient` em `frontend/modules/chat/lib/chat-client.ts` para aceitar `history` opcional
- [x] T02 [P] Ajustar `frontend/modules/chat/lib/http-chat-client.ts` para incluir `history` no body da requisição
- [x] T03 Ajustar `frontend/hooks/useResumeChat.ts` para serializar e truncar `messages` na janela definida pela ADR antes de chamar `sendMessage`
- [x] T04 Confirmar em teste que `frontend/app/api/chat/route.ts` repassa o campo `history` sem alteração
- [x] T05 Testes automatizados cobrindo CA-001 a CA-005

Implementação: `chat-client.ts` ganhou `ChatHistoryRole`, `ChatHistoryMessage`, `MAX_HISTORY_MESSAGES = 6` e `MAX_HISTORY_CONTENT_LENGTH = 4000` (mesma janela/teto do backend); `ChatClient.sendMessage` aceita `history?: ChatHistoryMessage[]`. `http-chat-client.ts` trunca à janela (`slice(-MAX_HISTORY_MESSAGES)`) e só inclui `history` no body quando não vazio (retrocompatível byte a byte quando ausente). `useResumeChat.ts` deriva `history` de `messages` (só turnos `status === "done"` com resposta real — turnos com erro ficam de fora), truncando `question`/`answer` a `MAX_HISTORY_CONTENT_LENGTH` cada (achado do Tech Lead: resposta do assistente maior que 4000 chars, reenviada sem corte como histórico, causaria `422` na pergunta seguinte — corrigido antes do aceite), e passa a chamar `chatClient.sendMessage(trimmedQuestion, history)`; `messages` entrou nas deps do `useCallback`. `frontend/app/api/chat/route.test.ts` criado (não existia) confirmando que o proxy repassa `history` sem alteração. Testes novos: `http-chat-client.test.ts` (+3), `useResumeChat.test.ts` (+3, incluindo o cenário relatado ponta a ponta e o truncamento de `content`), `route.test.ts` (arquivo novo, 4 casos). Suíte completa do frontend: 99 testes, verde; `chat-client.ts`/`http-chat-client.ts` 100% linhas/branches/funções (confirmado via `coverage/lcov.info` — a tabela resumida do terminal não lista o diretório `modules/chat/lib` por um bug de agrupamento do reporter v8, sem relação com cobertura real).

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado pela história (`chat-client.ts`/`http-chat-client.ts` 100%, `useResumeChat.ts` 100%, `route.ts` novo com teste dedicado — ver `coverage/lcov.info`)
- [x] Build/lint limpo (`npx eslint`, `npx tsc --noEmit` limpos; suíte completa `npx vitest run` — 98 testes — verde)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A, nenhuma mudança de ADR/contrato além do já registrado em `ADR-014`
- [ ] Deploy/preview verificado (comportamento sem mudança visual, mas fluxo de conversa testado no preview) — pendente, depende de push/PR e preview da Vercel
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-19 | `npx vitest run --coverage` (98 testes, verde), `npx tsc --noEmit`, `npx eslint .` (0 erros; 2 warnings pré-existentes sem relação com esta história) e `npm run build` (produção) re-executados de forma independente. `chat-client.ts`/`http-chat-client.ts` 100% linhas/branches/funções confirmado direto no `coverage/lcov.info` (a tabela resumida do terminal do vitest não lista o diretório por bug de agrupamento do reporter v8, sem relação com cobertura real — confirmado). Cenário relatado validado ponta a ponta no hook (`envia o histórico da troca anterior na segunda pergunta`) |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-19 | Sem Critical/High. Achado Medium encontrado e corrigido antes do aceite: `useResumeChat.ts` reenviava `message.answer` como `content` do histórico sem truncar — resposta do assistente acima de 4000 caracteres causaria `422` na pergunta seguinte (`HistoryMessage.content` do backend tem `max_length=4000`, `ADR-014`). Corrigido truncando `question`/`answer` a `MAX_HISTORY_CONTENT_LENGTH` (novo, `chat-client.ts`) antes de montar `history`, com teste dedicado (`trunca content do histórico a 4000 caracteres`). `messages` nas deps do `useCallback` de `sendQuestion` não introduz re-render problemático — `chatProps` em `ProfileAssistChat.tsx` já é recriado a cada render, nenhum efeito depende de `sendQuestion` na dep array. Contrato implementado bate com o documentado no DoR (CA-001 a CA-005) |
| PO | `@product-owner` | Quase lá | 2026-08-19 | CA-001 a CA-005 fechados com evidência de teste; QA e Tech Lead aprovaram (achado Medium corrigido antes deste aceite). Único item de DoD em aberto: deploy/preview verificado — segue o padrão já usado nas demais histórias de frontend da Fase 14 (`US-14-02`/`US-14-04`), fechamento fica para depois do push/PR e validação do preview real da Vercel |

**Status:** Quase lá — Dev/QA/Tech Lead aprovados; falta push/PR, preview da Vercel e aceite final do PO
