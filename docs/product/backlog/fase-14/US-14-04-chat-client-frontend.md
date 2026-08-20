# US-14-04 — Port `ChatClient` no domínio chat do frontend

**Fase:** Fase 14 — Arquitetura & Modularização
**Épico de origem:** Arquitetura & Modularização (`PRD-012-arquitetura-modularizacao.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** que `useResumeChat.ts` dependa de uma interface `ChatClient` em vez de chamar `fetch` direto,
**para** testar o estado do chat com um fake de client, e ganhar simetria com o padrão adotado no backend (`US-14-03`) para quando `admin`/observabilidade chegarem.

### DoR (antes de iniciar) — fechado

- [x] Critérios de aceite escritos e testáveis
- [x] Contrato de API documentado — `N/A`, `app/api/chat/**` (rotas Next.js) não mudam; o `ChatClient` só encapsula as mesmas chamadas `fetch` já existentes
- [x] Mapeamento de erros documentado — `N/A`, mesmo tratamento de erro hoje em `useResumeChat.ts` (`ChatApiError`, `publicErrorMessage`), só move de lugar
- [x] Modelagem de dados — `N/A`
- [x] Plano de testes — ver subseção abaixo
- [x] Épico e dependências — `PRD-012`; depende de `ADR-012` (Aceita) e `US-14-02` ([PR #53](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/53) já mergeado em `develop` — `frontend/modules/chat/` já existe, sem ambiguidade de path)
- [x] ADR registrado — sim, `ADR-012-clean-architecture-chat.md` (Aceita)
- [x] Variáveis de ambiente/segredos — `N/A`
- [x] Referência visual — `N/A`, sem mudança visual/comportamental
- [x] Protótipo — `N/A`
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `useResumeChat.test.ts` passa a injetar um `ChatClient` fake (implementa a interface sem chamar `fetch`/`msw`) em vez de mockar `global.fetch` — mesmos casos hoje cobertos (sucesso, erro, rate limit 429, feedback otimista)
- Unitário: `http-chat-client.ts` (adapter) ganha teste próprio, isolado, cobrindo só a tradução de `fetch`/status HTTP para o contrato do `ChatClient` (o que hoje está misturado em `useResumeChat.ts`)
- Mocks necessários: fake de `ChatClient` no teste do hook; `fetch` mockado só no teste do adapter (`http-chat-client.test.ts`)
- Critério de sucesso: `npm test` com o mesmo número de testes (ou mais, com o teste novo do adapter) passando; `npm run build` sem erro de import

### Critérios de aceite

- [ ] CA-001: `frontend/modules/chat/lib/chat-client.ts` criado com a interface `ChatClient` (`sendMessage(question): Promise<ChatResponse>`, `sendFeedback(payload): Promise<void>`) — `modules/chat/` já existe (`US-14-02`, mergeado), sem ambiguidade de path
- [ ] CA-002: `frontend/modules/chat/lib/http-chat-client.ts` criado, implementando `ChatClient` com os mesmos `fetch` para `RESUME_CHAT_ENDPOINT`/`RESUME_CHAT_FEEDBACK_ENDPOINT` hoje em `useResumeChat.ts`, incluindo `publicErrorMessage`/`ChatApiError`
- [ ] CA-003: `hooks/useResumeChat.ts` para de chamar `fetch` direto — recebe `ChatClient` (parâmetro opcional com default = instância do adapter HTTP, para não quebrar quem já usa o hook sem argumento)
- [ ] CA-004: comportamento do hook idêntico ao atual — mensagens, loading, erro, rate limit, feedback otimista (nenhuma mudança de UX)
- [ ] CA-005: `useResumeChat.test.ts` usando fake de `ChatClient`; novo `http-chat-client.test.ts` cobrindo o adapter isoladamente
- [ ] CA-006: `npm test` roda 100% verde, com o mesmo número de testes de antes do refactor (mais o teste novo do adapter)
- [ ] CA-007: `npm run build` e `npm run lint` limpos após a reorganização
- [ ] CA-008: `docs/agents/CONTEXTO-PROJETO.md` (seção "Estrutura — monorepo") atualizado refletindo `chat-client.ts`/`http-chat-client.ts`

### Fora de escopo
- Qualquer mudança de comportamento/UX do `ChatWidget`/`ProfileAssistChat`/`RagChatPanel`
- Mudança em `app/api/chat/**` (rotas Next.js continuam como proxy, sem alteração)
- Aplicar port equivalente a `resume/` no frontend — sem I/O externo, ver `ADR-012`
- Construir client para `admin`/observabilidade — `ADR-012` registra a convenção, não abre trabalho aqui
- Modularização de `components/`/`lib/` de currículo — `US-14-02`, história separada

### Dependências
- `ADR-012-clean-architecture-chat.md` (Aceita)
- `US-14-02-modularizacao-frontend-dominio.md` (implementada, PR #53 mergeado em `develop`; `modules/chat/` já existe)

### Épico / Prioridade
Arquitetura & Modularização — P2

### Tasks
- [ ] T01 Criar `chat-client.ts` (interface) — path conforme CA-001 (T01)
- [ ] T02 [P] Criar `http-chat-client.ts` (adapter), migrando lógica de `fetch`/erro de `useResumeChat.ts` (CA-002)
- [ ] T03 Ajustar `useResumeChat.ts` para receber `ChatClient` com default (CA-003, CA-004)
- [ ] T04 Reescrever `useResumeChat.test.ts` com fake de `ChatClient`; criar `http-chat-client.test.ts` (CA-005)
- [ ] T05 Rodar `npm test`, `npm run build`, `npm run lint` confirmando sem regressão (CA-006, CA-007)
- [ ] T06 Atualizar `docs/agents/CONTEXTO-PROJETO.md` (CA-008)

### DoD (antes de concluir) — precisa estar 100% fechado para Done
- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — sem lógica nova além do adapter, mantém/supera baseline (`US-13-01`)
- [ ] Build/lint limpo (`npm run build`, `npm run lint`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API bate com o documentado — `N/A`, sem mudança de contrato
- [ ] Sem chave/secret exposto
- [ ] Documentação atualizada — `CONTEXTO-PROJETO.md` (CA-008)
- [ ] Deploy/preview verificado — preview da Vercel confirmando chat funcionando igual ao de produção
- [ ] Vereditos de QA, Tech Lead e PO documentados abaixo
- [ ] Status atualizado no arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
