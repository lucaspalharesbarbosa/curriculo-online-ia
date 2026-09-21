# US-15-02 — Backend: histórico + query condensation + prompt com contexto

**Fase:** Fase 15 — Memória Conversacional (RAG)
**Épico de origem:** RAG (`PRD-013-memoria-conversacional-rag.md`)

**Como** visitante/recrutador,
**quero** que o assistente entenda perguntas de acompanhamento que se referem à resposta anterior (ex.: "onde fica a matriz **da empresa**?" depois de perguntar onde o autor trabalha),
**para** conversar de forma natural, sem repetir o nome completo da entidade em cada pergunta.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado (ver subseção abaixo) — confirmado por `ADR-014` (US-15-01, Done)
- [x] Mapeamento de erros documentado (ver subseção abaixo)
- [x] Modelagem de dados documentada — N/A, `history` trafega no request, não é persistido (nenhuma entidade nova)
- [x] Plano de testes definido (ver subseção abaixo)
- [x] Épico e dependências identificados — RAG (`PRD-013`); depende de **US-15-01** (ADR) — Done
- [x] ADR registrado se envolve decisão de stack nova — [ADR-014](../../../architecture/ADR-014-memoria-conversacional-chat.md)
- [x] Variáveis de ambiente/segredos necessários identificados — nenhuma nova (reaproveita `ChatCompletionProvider`/`LLM_API_KEY` existentes, `backend/app/chat/ports.py`)
- [x] Referência visual definida — N/A, sem UI
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Contrato de API

`POST /chat`

- Request: `{ question: string, history?: { role: "user" | "assistant", content: string }[] }` — `history` opcional (retrocompatível: request sem o campo continua funcionando como hoje). `ADR-014`: lista com no máximo 20 mensagens (`max_length=20`) e `content` de até 4000 caracteres por mensagem, validados no `Field` do Pydantic; janela funcional usada pelo `service` é das últimas 3 trocas (6 mensagens, `MAX_HISTORY_MESSAGES`) — histórico entre 6 e 20 mensagens é truncado à cauda, não rejeitado
- Response 200: `{ answer: string }` — **sem mudança** de shape
- Mapeamento de erros:

| Exceção/causa | Código HTTP | Body do erro | Mensagem |
|---|---|---|---|
| `history` com item malformado (`role`/`content` ausente ou tipo errado) ou acima do teto (`max_length=20` na lista, `max_length=4000` no `content`) | 422 | `{ "detail": [...] }` | erro padrão de validação do Pydantic/FastAPI |
| Falha na chamada de reformulação (query condensation) | — (sem erro exposto ao cliente) | — | fallback interno: usa a `question` crua no retrieval, resposta segue normalmente (mesmo padrão de resiliência de `ADR-004`) |

#### Plano de testes

- Unitário: `backend/tests/test_rag.py` — retrieval com `history` encontra o chunk certo para pergunta com referência anafórica (reproduz o cenário relatado: "onde Lucas trabalha?" → "onde fica a matriz da empresa?"); retrieval sem `history` mantém comportamento atual byte a byte
- Unitário/regressão (ressalva do Tech Lead em `US-15-01`): pergunta de acompanhamento com intenção de seção/recência (`ADR-010`) via `history` — ex. "e a formação, onde foi?" depois de uma pergunta sobre experiência — mantém o roteamento correto após passar pela pergunta condensada, já que `search_with_routing` usa o mesmo texto condensado tanto para embedding quanto para `detect_section_intent`/`wants_recency`
- Unitário: `backend/tests/test_chat.py` (ou equivalente em `backend/tests/`, espelhando `backend/app/chat/`) — `_build_user_prompt`/`_generate_answer`/`_generate_web_answer` incluem as trocas do `history` nas `messages` enviadas ao `ChatCompletionProvider`, respeitando a janela definida na ADR
- Integração: `TestClient` do FastAPI no endpoint `/chat` — request com `history` completo, request sem `history` (retrocompatibilidade), request com `history` malformado (422)
- Mocks necessários: `ChatCompletionProvider`/`EmbeddingProvider` mockados via fixture (nunca bater na API real da IA em teste automatizado, padrão já usado no projeto)

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: cenário relatado reproduzido em teste automatizado — pergunta 1 "Onde Lucas trabalha?" (resposta correta sobre a empresa atual) seguida da pergunta 2 "Onde fica a matriz da empresa?" com o `history` da troca 1 — a resposta da troca 2 resolve corretamente a referência a "a empresa" (não retorna fallback de "não sei" nem contexto de outra empresa). `test_answer_question_resolves_anaphora_using_condensed_question_for_retrieval` (`test_service.py`) e `test_chat_resolves_anaphora_reference_using_history` (`test_chat.py`, ponta a ponta via `/chat`)
- [x] CA-002: retrieval (`rag.search_with_routing`) usa a pergunta reformulada/contextualizada quando há `history`, mantendo a pergunta original do usuário só para exibição/log — validado comparando os chunks retornados com e sem `history` para a mesma pergunta ambígua. Mesmo teste do CA-001 (embeddings ortogonais provam que só a pergunta condensada casa com o chunk certo) + `test_answer_question_includes_history_turns_between_system_and_current_question` (prompt final usa a pergunta original)
- [x] CA-003: `messages` enviadas ao LLM em `_generate_answer`/`_generate_web_answer` incluem as trocas do `history` (respeitando a janela/limite definidos na ADR) entre o `system prompt` e a pergunta atual. `test_answer_question_includes_history_turns_between_system_and_current_question`
- [x] CA-004: request sem `history` (ou com `history` vazio) mantém o comportamento atual do `/chat` sem regressão — suíte de regressão das perguntas de turno único (roteamento por seção/recência da Fase 11) continua passando. `test_answer_question_without_history_does_not_call_condensation` + suíte completa de `US-11-06`/`US-11-07` em `test_chat.py`/`test_service.py` (117 testes do domínio `chat`, todos verdes) sem alteração
- [x] CA-005: falha simulada na reformulação da pergunta (se a estratégia da ADR usar chamada LLM) cai no fallback (pergunta crua) sem erro 5xx ao cliente. `test_answer_question_falls_back_to_raw_question_when_condensation_fails`
- [x] CA-006: `history` maior que a janela definida na ADR é truncado às últimas N trocas antes de chegar ao retrieval e ao prompt. `test_answer_question_truncates_history_to_last_window`

### Fora de escopo
- Envio do histórico pelo frontend (US-15-03)
- Persistência de histórico no servidor (fora de escopo do `PRD-013`)
- Sumarização de histórico longo (fora de escopo do `PRD-013`)

### Dependências
- US-15-01 (ADR de memória conversacional) — bloqueante

### Épico / Prioridade
RAG (`PRD-013`) — P1

### Tasks
- [x] T01 Adicionar `history` opcional ao `ChatRequest` em `backend/app/chat/router.py`, com validação de tamanho/shape conforme `ADR-014`
- [x] T02 Implementar a reformulação da pergunta (query condensation) decidida na ADR — chamada dedicada via `ChatCompletionProvider` (`ports.py`) ou heurística equivalente — usada só para o retrieval, com fallback para a pergunta crua em caso de falha
- [x] T03 [P] Ajustar `rag.search_with_routing` (ou o ponto de chamada em `service.py`) para receber a pergunta reformulada
- [x] T04 [P] Incluir as trocas do `history` (truncadas pela janela da ADR) nas `messages` de `_generate_answer`/`_generate_web_answer` em `service.py`, entre o `system` e a pergunta atual
- [x] T05 Testes automatizados cobrindo CA-001 a CA-006 em `backend/tests/`

Implementação: `router.py` ganhou `HistoryMessage` (Pydantic, `role: Literal["user","assistant"]`, `content` até 4000 chars) e `ChatRequest.history` (`list[HistoryMessage] | None`, até 20 itens), convertido para `service.HistoryTurn` (dataclass do domínio, sem depender do `BaseModel` de `router.py`) antes de chamar `service.answer_question`. `service.py` ganhou `MAX_HISTORY_MESSAGES = 6`, `_condense_question` (chama `ChatCompletionProvider.generate_completion` com `CONDENSE_SYSTEM_PROMPT`; `except OpenAIError` cai para a pergunta crua) e `_history_messages`; `_generate_answer`/`_generate_web_answer` passaram a montar `messages` como `[system, *histórico, user atual]`; `answer_question` trunca `history` à janela antes de condensar/retrieval. `rag.search_with_routing` recebe a pergunta condensada (ou crua) sem mudança de assinatura. Testes novos em `backend/tests/chat/test_service.py` (6 casos, CA-001 a CA-006) e `backend/tests/chat/test_chat.py` (cenário relatado ponta a ponta via `/chat`, regressão de roteamento por seção/recência com pergunta condensada — ressalva do Tech Lead —, retrocompatibilidade sem `history`, 3 casos de `422`); fakes novos em `backend/tests/chat/fakes.py` (`SequentialChatCompletionProvider`, `FailFirstThenAnswerChatCompletionProvider`) para distinguir a chamada de condensation da chamada de geração final.

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado pela história (`pytest --cov` → `router.py` 100%, `service.py` 100%)
- [x] Build/lint limpo (`ruff check` limpo; `black` aplicado; suíte completa do backend — 125 testes — verde)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A, nenhuma mudança de fato em relação ao decidido em `ADR-014`
- [x] Deploy/preview verificado — N/A, sem UI nesta história (validação via `/chat` e testes automatizados)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-19 | `pytest` (125 testes, verde) e `ruff check`/`black` limpos re-executados de forma independente; `router.py`/`service.py` 100% cobertura (`--cov`). Casos-chave confirmados: CA-001/CA-002 (`test_answer_question_resolves_anaphora_using_condensed_question_for_retrieval`, `test_chat_resolves_anaphora_reference_using_history` — cenário relatado reproduzido ponta a ponta), CA-005 (`test_answer_question_falls_back_to_raw_question_when_condensation_fails`, sem 5xx), retrocompatibilidade sem `history` (`test_chat_accepts_request_without_history_field`), e a ressalva do Tech Lead sobre roteamento por seção/recência com pergunta condensada (`test_chat_keeps_section_routing_for_follow_up_question_via_condensed_text`). Suíte de regressão completa da Fase 11 (US-11-06/US-11-07, 7 testes de roteamento/web search) roda verde sem alteração |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-19 | Sem Critical/High. Camadas ok — `HistoryTurn` (dataclass) definido em `service.py`, `router.py` converte `HistoryMessage` (Pydantic) para `HistoryTurn` antes de chamar o use case (ADR-012 respeitada, use case não depende do `BaseModel` do router). `_condense_question` captura só `OpenAIError`, consistente com o resto do domínio `chat`; falha nunca propaga (fallback para a pergunta crua). Teto de validação (`max_length=20`/`4000`) limita a exposição de custo mesmo sem autenticação — só as últimas 6 mensagens truncadas (`MAX_HISTORY_MESSAGES`) chegam de fato ao LLM, o resto é descartado sem custo de chamada extra. Contrato implementado bate com o documentado no DoR (CA-001 a CA-006). Achado real encontrado no lado frontend (US-15-03) — resposta do assistente sem truncamento antes de reenviar como histórico, risco de `422` na troca seguinte — não afeta este arquivo/história, corrigido em US-15-03 antes do aceite |
| PO | `@product-owner` | Done | 2026-08-19 | CA-001 a CA-006 fechados com evidência de teste; DoD 100% (itens N/A justificados: sem UI nesta história); QA e Tech Lead aprovaram sem Critical/High. Sem deploy próprio — segue o mesmo padrão de histórias de backend anteriores (ex. `US-11-06`), validação de produção fica a cargo do aceite da Fase 15 completa, após merge |

**Status:** Done
