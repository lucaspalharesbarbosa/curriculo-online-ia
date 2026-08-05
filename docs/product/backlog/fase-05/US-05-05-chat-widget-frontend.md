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
- [ ] CA-001: `ChatWidget.tsx` envia pergunta para `POST /chat` e exibe a resposta
- [ ] CA-002: estado de carregamento e erro tratados na UI
- [ ] CA-003: `ChatWidget.test.tsx` cobre envio de pergunta e exibição de resposta (mock do backend)

### Fora de escopo
- Lógica de RAG (backend)

### Dependências
- US-05-04

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 Criar `frontend/components/ChatWidget.tsx`
- [ ] T02 [P] Teste `ChatWidget.test.tsx`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado (`npm test -- --coverage`)
- [ ] Build/lint limpo (`npm run build`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR (consumo do `POST /chat`)
- [ ] Sem chave de API/secret exposto — N/A (frontend só usa `NEXT_PUBLIC_API_URL`, que não é segredo)
- [ ] Documentação atualizada — se a UI divergir da referência visual descrita acima de forma relevante
- [ ] Deploy/preview verificado (UI)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Blocked — aguarda US-05-04 (implementação). DoR fechado em 2026-08-04; pronta para "Ready for Agent" assim que US-05-04 concluir.
