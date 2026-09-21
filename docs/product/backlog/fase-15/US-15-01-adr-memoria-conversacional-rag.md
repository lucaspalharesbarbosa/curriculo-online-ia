# US-15-01 — ADR: memória conversacional no fluxo de RAG

**Fase:** Fase 15 — Memória Conversacional (RAG)
**Épico de origem:** RAG (`PRD-013-memoria-conversacional-rag.md`)

**Como** autor do projeto,
**quero** uma decisão de arquitetura registrada sobre como o `/chat` passa a lidar com histórico de conversa,
**para** que a implementação siga uma estratégia avaliada (contrato de API, ponto de reformulação da pergunta, limites de custo) — não um patch ad-hoc — e o backend continue stateless, previsível e barato de operar.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A, esta história produz um ADR, não código
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A, sem entidade nova (histórico trafega no `ChatRequest`, não é persistido)
- [x] Plano de testes definido — N/A, decisão de arquitetura; validação é dos CAs abaixo
- [x] Épico e dependências identificados — RAG (`PRD-013`); nenhuma dependência de outra história
- [x] ADR registrado se envolve decisão de stack nova — é a própria história (auto-referente)
- [x] Variáveis de ambiente/segredos necessários identificados — nenhuma nova (reaproveita `ChatCompletionProvider`/`LLM_API_KEY` já existentes)
- [x] Referência visual definida — N/A, não é UI
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante — investigação inicial já feita (ver seção "Evidência" abaixo)

#### Evidência do problema (ponto de partida da investigação)

`backend/app/chat/router.py` define `ChatRequest` só com `question: str`. `backend/app/chat/service.py` (`answer_question`, `_build_user_prompt`, `_generate_answer`/`_generate_web_answer`) monta `messages` sempre com 2 elementos (`system` + pergunta atual) — nenhum turno anterior chega ao LLM. `backend/app/chat/rag.py` (`search_with_routing`) embeda a `question` crua para o retrieval. Resultado: pergunta com referência anafórica ao turno anterior (ex.: "Onde fica a matriz da empresa?" depois de "Onde Lucas trabalha?") não encontra o chunk certo no retrieval e o LLM não tem contexto para inferir a que "a empresa" se refere. O frontend (`useResumeChat`) já mantém `messages` em estado local, mas `ChatClient.sendMessage` (`chat-client.ts`) nunca os envia — o dado existe no cliente e se perde a cada requisição.

#### Plano de testes
- N/A — este item do DoR não se aplica a uma história de ADR.

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: ADR registrada em `docs/architecture/ADR-014-memoria-conversacional-chat.md`, descrevendo a causa raiz da falha de correferência com o exemplo relatado ("Onde Lucas trabalha?" → "Onde fica a matriz da empresa?")
- [x] CA-002: ADR decide o contrato — `ChatRequest.history` opcional (`list[{role, content}]`), janela deslizante com limite explícito de turnos/tokens (a ADR fixa o número, avaliando o trade-off custo/robustez levantado pelo autor) — mantendo o backend sem sessão persistida em servidor. Decidido: janela funcional de 3 pares (6 mensagens, `MAX_HISTORY_MESSAGES`), com teto de validação de 20 mensagens/4000 caracteres por mensagem no `Field` do Pydantic (rejeita `422` acima do teto; trunca à cauda entre o teto e a janela funcional)
- [x] CA-003: ADR decide o mecanismo de reformulação da pergunta para o retrieval (query condensation via LLM reaproveitando `ChatCompletionProvider`, vs. heurística sem chamada extra) com justificativa de custo/latência/robustez, e onde o histórico entra nas `messages` da geração final. Decidido: condensation via LLM (`generate_completion`), disparada só quando há histórico; pergunta condensada substitui a crua em todo `search_with_routing` (embedding + roteamento por seção/recência), pergunta original preservada para exibição/log; histórico entra nas `messages` finais entre `system` e a pergunta atual, em `_generate_answer`/`_generate_web_answer`
- [x] CA-004: ADR define o comportamento de fallback se a reformulação falhar ou o histórico vier malformado (usa a pergunta crua, sem quebrar o `/chat` — mesmo padrão de `ADR-004`) e confirma que o contrato de resposta (`ChatResponse`) não muda. Decidido: falha na condensation cai para a pergunta crua (nunca propaga erro); `history` malformado ou acima do teto de validação vira `422` padrão do Pydantic; `ChatResponse` inalterado

### Fora de escopo
- Implementação do código — feita em US-15-02 (backend) e US-15-03 (frontend), a partir desta ADR
- Sessão/histórico persistido no servidor — decisão já tomada pelo autor (fora de escopo, ver `PRD-013`)

### Dependências
- Nenhuma. Bloqueia US-15-02 e US-15-03.

### Épico / Prioridade
RAG (`PRD-013`) — P1

### Tasks
- [x] T01 Reproduzir o cenário de correferência relatado ("Onde Lucas trabalha?" → "Onde fica a matriz da empresa?") contra o `/chat` atual e confirmar a causa raiz (retrieval sem contexto + `messages` sem histórico)
- [x] T02 [P] Avaliar estratégia de query condensation (chamada LLM dedicada vs. heurística de concatenação) e registrar a escolha com justificativa de custo/latência/robustez
- [x] T03 Registrar `docs/architecture/ADR-014-memoria-conversacional-chat.md` com as decisões dos CA-001 a CA-004

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — N/A, história não produz código
- [x] Build/lint limpo — N/A
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto — coerência da ADR com `ADR-003`/`ADR-004`/`ADR-010`/`ADR-012`
- [x] Contrato de API implementado bate com o documentado no DoR — N/A (a ADR é o documento, não uma implementação)
- [x] Sem chave de API/secret exposto — N/A, nenhuma chave é criada nesta história
- [x] Documentação atualizada — sim, `docs/architecture/ADR-014-memoria-conversacional-chat.md`
- [x] Deploy/preview verificado — N/A
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | N/A | 2026-08-19 | História produz um documento de arquitetura, não código/comportamento executável — fora do escopo de validação do QA. Comportamento resultante da decisão (cenário de correferência, roteamento com histórico) será validado nas histórias de implementação (`US-15-02`, `US-15-03`) |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-19 | `ADR-014` coerente com `ADR-003` (mantém provider único OpenAI, sem infra nova), `ADR-004` (fallback gracioso da condensation reaproveita o mesmo padrão de resiliência, timeout/retry herdado do adapter existente), `ADR-010` (não contradiz roteamento por seção/recência) e `ADR-012` (reaproveita `ChatCompletionProvider` sem porta nova, sem sessão persistida). Sem Critical/High. Observação não bloqueante para US-15-02: como a pergunta condensada por LLM substitui a crua também na detecção de seção/recência por palavra-chave de `ADR-010` (não só no embedding), o prompt de condensation deveria preservar termos-gatilho da pergunta original sempre que possível — a suíte de regressão já exigida no plano de testes de US-15-02 (CA-002/CA-004) precisa cobrir explicitamente perguntas de acompanhamento com intenção de seção (ex.: "e a formação, onde foi?" após pergunta sobre experiência), não só o caso de entidade relatado |
| PO | `@product-owner` | Done | 2026-08-19 | CA-001 a CA-004 fechados com evidência (`ADR-014`); DoD 100% (itens N/A justificados: história produz documento, não código); QA (N/A justificado) e Tech Lead (Aprovar, com observação não bloqueante repassada ao plano de testes de `US-15-02`) preenchidos |

**Status:** Done
