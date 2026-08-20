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

- [x] CA-001: `frontend/modules/chat/lib/chat-client.ts` criado com a interface `ChatClient` (`sendMessage(question): Promise<ChatResponse>`, `sendFeedback(payload): Promise<void>`) — `modules/chat/` já existe (`US-14-02`, mergeado), sem ambiguidade de path
- [x] CA-002: `frontend/modules/chat/lib/http-chat-client.ts` criado, implementando `ChatClient` com os mesmos `fetch` para `RESUME_CHAT_ENDPOINT`/`RESUME_CHAT_FEEDBACK_ENDPOINT` hoje em `useResumeChat.ts`, incluindo `publicErrorMessage`/`ChatApiError`
- [x] CA-003: `hooks/useResumeChat.ts` para de chamar `fetch` direto — recebe `ChatClient` (parâmetro opcional com default = instância do adapter HTTP, para não quebrar quem já usa o hook sem argumento)
- [x] CA-004: comportamento do hook idêntico ao atual — mensagens, loading, erro, rate limit, feedback otimista (nenhuma mudança de UX)
- [x] CA-005: `useResumeChat.test.ts` usando fake de `ChatClient`; novo `http-chat-client.test.ts` cobrindo o adapter isoladamente
- [x] CA-006: `npm test` roda 100% verde, com o mesmo número de testes de antes do refactor (mais o teste novo do adapter)
- [x] CA-007: `npm run build` e `npm run lint` limpos após a reorganização
- [x] CA-008: `docs/agents/CONTEXTO-PROJETO.md` (seção "Estrutura — monorepo") atualizado refletindo `chat-client.ts`/`http-chat-client.ts`

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
- [x] T01 Criar `chat-client.ts` (interface) — path conforme CA-001 (T01)
- [x] T02 [P] Criar `http-chat-client.ts` (adapter), migrando lógica de `fetch`/erro de `useResumeChat.ts` (CA-002)
- [x] T03 Ajustar `useResumeChat.ts` para receber `ChatClient` com default (CA-003, CA-004)
- [x] T04 Reescrever `useResumeChat.test.ts` com fake de `ChatClient`; criar `http-chat-client.test.ts` (CA-005)
- [x] T05 Rodar `npm test`, `npm run build`, `npm run lint` confirmando sem regressão (CA-006, CA-007)
- [x] T06 Atualizar `docs/agents/CONTEXTO-PROJETO.md` (CA-008)

### DoD (antes de concluir) — precisa estar 100% fechado para Done
- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — sem lógica nova além do adapter, mantém/supera baseline (`US-13-01`) — 100% em `chat-client.ts`/`http-chat-client.ts`, 100% linhas em `useResumeChat.ts` (ver veredito QA)
- [x] Build/lint limpo (`npm run build`, `npm run lint`, type checking estrito)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API bate com o documentado — `N/A`, sem mudança de contrato (confirmado: nenhuma rota `app/api/chat/**` tocada)
- [x] Sem chave/secret exposto
- [x] Documentação atualizada — `CONTEXTO-PROJETO.md` (CA-008)
- [ ] Deploy/preview verificado — pendente: depende de preview real gerado a partir do PR
- [ ] Vereditos de QA, Tech Lead e PO documentados abaixo — QA e Tech Lead documentados; PO pendente (fora desta sessão)
- [ ] Status atualizado no arquivo — pendente: fica "Ready for Agent"/status a ser decidido por quem orquestra a Fase 14 como um todo, junto do aceite do PO

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — verificação independente: `npm test -- --run` 89/89 testes verdes em 19 arquivos (baseline pré-refactor era 82; `useResumeChat.test.ts` foi de 10 para 11 casos, `http-chat-client.test.ts` novo com 6 casos — sem teste perdido/pulado, nenhum `.skip`/`.todo` nos dois arquivos). `npm test -- --run --coverage`: `modules/chat/lib/chat-client.ts` 4/4 linhas (100%), `modules/chat/lib/http-chat-client.ts` 11/11 linhas, 100% funções, 100% branches (confirmado via `coverage/lcov.info`, não aparece na tabela-texto por quirk de largura do reporter v8), `hooks/useResumeChat.ts` 100% linhas/funções, 76,47% branches — todos acima do piso de 70%; cobertura global da suíte 85,48% stmts / 74,33% branches. Confirmado via `grep` que `hooks/useResumeChat.ts` não tem mais nenhuma chamada `fetch(` direta (CA-003). Nomenclatura de teste conforme convenção: `describe`/identificadores em inglês, título do `it()` em PT-BR nos dois arquivos tocados. `npm run build`/`npm run lint` limpos (2 warnings pré-existentes, sem regressão) | 2026-08-19 | commits `98e7644`, `9dca0ee`, `b272521` |
| Tech Lead | `@tech-lead-review` | Aprovar — revisão de `chat-client.ts`, `http-chat-client.ts`, `useResumeChat.ts` via `git diff` contra o merge-base real (`34e792a`; a branch `feature/us-14-03-ports-adapters-chat-backend` avançou em outro worktree após esta branch ser criada, então o diff foi tirado contra o ponto real de bifurcação para isolar só as mudanças desta história — confirmado que `roadmap.md`/`US-14-03.md` não foram tocados aqui). Contrato `ChatClient` (`sendMessage`/`sendFeedback`) espelha fielmente o padrão `Protocol` do backend (`ports.py`, US-14-03); `HttpChatClient` migra `fetch`/`ChatApiError`/`publicErrorMessage` de `useResumeChat.ts` sem alterar lógica (status 429 → rate limit, qualquer outro erro/exceção → mensagem genérica, nunca repassa `detail` do backend); `sendFeedback` do adapter não engole erro — o fire-and-forget (`.catch(() => {})`) continua no hook, mesmo comportamento de antes. Confirmado via `grep` que `hooks/useResumeChat.ts` não chama mais `fetch(` direto (CA-003) e que nenhuma rota `app/api/chat/**` foi tocada (contrato inalterado, CA-009 equivalente do backend). `ResumeChatFeedback` (tipo público consumido por `RagChatPanel.tsx`) preservado via alias de `ChatFeedbackRating`, sem breaking change de tipo — confirmado pelo `npm run build` (type check estrito) limpo. Sem chave/secret exposto (`grep -iE "api[_-]?key\|secret\|token\|password"` no diff, vazio). `httpChatClient` é singleton simples, sem I/O no import. Sem achado Critical/High | 2026-08-19 | commits `98e7644`, `9dca0ee`, `b272521`, `3f88a47` |
| PO | `@product-owner` | Quase lá — verificação independente confirma o que QA e Tech Lead reportaram: `npm test -- --run --coverage` 89/89 verdes em 19 arquivos; conferido `coverage/lcov.info` diretamente — `chat-client.ts` `LF:4 LH:4` (100%), `http-chat-client.ts` `FNF:3 FNH:3` (100% funções), confirmando que a ausência das duas linhas na tabela-texto do reporter é mesmo um quirk de largura, não um gap real; `npm run build` limpo; `npm run lint` com só os 2 warnings pré-existentes; `grep "fetch("` em `hooks/useResumeChat.ts` vazio (CA-003 real). Todos os CA e tasks `[x]`. Falta fechar só "Deploy/preview verificado" — depende do preview real gerado a partir do PR (Vercel comenta a URL automaticamente ao abrir). Branch ainda sem PR — abrir contra `feature/us-14-03-ports-adapters-chat-backend` (que ainda não está em `develop`) e retargetar para `develop` quando o PR #54 mergear | 2026-08-19 | `npm test -- --run --coverage`, `npm run build`, `npm run lint`, `coverage/lcov.info` (execução independente nesta sessão) |

**Status:** Quase lá — Dev/QA/Tech Lead aprovados; pendente abrir PR (stacked sobre US-14-03) e validar preview real da Vercel antes de fechar Done
