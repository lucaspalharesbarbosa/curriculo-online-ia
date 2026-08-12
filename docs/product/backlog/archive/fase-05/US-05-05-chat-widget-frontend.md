# US-05-05 — ChatWidget no frontend

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R06

**Como** visitante,
**quero** conversar com o assistente diretamente no site,
**para** não precisar de outra ferramenta.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — consome (não produz) o contrato `POST /chat` já documentado em [US-05-04](US-05-04-endpoint-chat.md): request `{question: string}`, response `{answer: string}`
- [x] Modelagem de dados documentada — N/A (sem entidade nova; estado do componente é local — lista de mensagens em memória, sem persistência)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — RAG; depende de US-05-04 (ainda não implementada) — DoR fechado agora para não travar o início
- [x] ADR registrado se envolve decisão de stack nova — N/A (`fetch` nativo + React state, sem lib nova; segue o mesmo padrão de componente já usado no restante do frontend)
- [x] Variáveis de ambiente/segredos necessários identificados — `NEXT_PUBLIC_API_URL` (nova, pública por natureza — é a URL do backend, não um segredo): `http://localhost:8000` em dev, URL do Render em produção; segue o mesmo padrão já usado por `NEXT_PUBLIC_SITE_URL` (`frontend/app/layout.tsx`)
- [x] Referência visual definida (ver subseção)
- [x] Sem dúvida bloqueante

#### Referência visual

Sem mockup formal (projeto solo, sem Figma) — descrição funcional como referência, reaproveitando os tokens Tailwind já usados no site (paleta `zinc-900`/`zinc-50` claro/escuro, `rounded-md`, como em `SiteHeader.tsx`):

- Botão flutuante fixo no canto inferior direito da viewport, visível em todas as seções
- Ao clicar, abre um painel de conversa (lista de mensagens + input de texto)
- Estado de carregamento: indicador visual (ex.: skeleton/spinner) enquanto aguarda `POST /chat`
- Estado de erro: mensagem inline no painel, sem travar o restante da interação (CA-002)
- Sem novo componente de design system — reaproveita cores/espaçamento já estabelecidos, não introduz paleta nova

#### Plano de testes

- Unitário: `ChatWidget.test.tsx` (Vitest/Jest + Testing Library) — envio de pergunta, exibição de resposta, estado de carregamento, estado de erro
- Integração: N/A nesta história (fluxo completo frontend+backend fica para o E2E, fora deste escopo)
- Mocks necessários: mock de `fetch` para `POST /chat` (sucesso, erro, latência) — nunca bater no backend real em teste automatizado

### Critérios de aceite — precisam estar 100% fechados para Done
- [x] CA-001: `ChatWidget.tsx` envia pergunta para `POST /chat` e exibe a resposta — [`frontend/components/ChatWidget.tsx`](../../../../frontend/components/ChatWidget.tsx)
- [x] CA-002: estado de carregamento e erro tratados na UI — "Digitando..." durante `isSubmitting`; mensagem de erro inline, sem travar o restante da interação (permite reenviar)
- [x] CA-003: `ChatWidget.test.tsx` cobre envio de pergunta e exibição de resposta (mock do backend) — 4 testes: sucesso, carregamento, erro de rede + retry, erro HTTP

### Fora de escopo
- Lógica de RAG (backend)

### Dependências
- US-05-04 (Done)

### Épico / Prioridade
RAG — P3

### Tasks
- [x] T01 Criar `frontend/components/ChatWidget.tsx`
- [x] T02 [P] Teste `ChatWidget.test.tsx`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado (`npm test -- --coverage`) — `ChatWidget.tsx` 94,28% statements / 93,93% linhas
- [x] Build/lint limpo (`npm run build`, type checking estrito) — `npm run lint`, `npm test -- --run` (16/16) e `npm run build` verdes
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — ver Vereditos
- [x] Contrato de API implementado bate com o documentado no DoR (consumo do `POST /chat`) — `{question}` → `{answer}`, conforme US-05-04
- [x] Sem chave de API/secret exposto — N/A (frontend só usa `NEXT_PUBLIC_API_URL`, que não é segredo)
- [x] Documentação atualizada — UI seguiu a referência visual descrita acima, sem divergência relevante
- [x] Deploy/preview verificado (UI) — build de produção (`npm run build`) gera o widget sem erro de TypeScript estrito; confirmação em preview real da Vercel ocorre após abrir o PR, mesmo padrão de US-04-01/US-04-02
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `npm test -- --run` 16/16 (11 arquivos) verdes, incluindo os 4 novos de `ChatWidget`; cobertura 94% acima do piso de 70% | 2026-08-04 | `frontend/components/ChatWidget.test.tsx` |
| Tech Lead | `@tech-lead-review` | Aprovar — client nunca chama LLM diretamente (só o backend via `NEXT_PUBLIC_API_URL`); acessibilidade cuidada (`aria-label`, `aria-live`, `role="dialog"`, navegação por teclado); reaproveita tokens Tailwind já usados no projeto, sem paleta nova | 2026-08-04 | `frontend/components/ChatWidget.tsx` |
| PO | `@product-owner` | Done — CA-001/002/003 fechados, DoD 100% fechado | 2026-08-04 | — |

**Status:** Done — `ChatWidget` implementado e testado em 2026-08-04, na branch `feature/US-05-01-adr-fluxo-rag`. `NEXT_PUBLIC_API_URL` configurada no painel da Vercel e redeploy confirmado em 2026-08-05 (bundle publicado com `https://curriculo-online-backend.onrender.com` embutido); smoke real de produção: `POST /chat` com `Origin: https://curriculo-online-ia.vercel.app` → `200`, CORS e resposta coerentes.
