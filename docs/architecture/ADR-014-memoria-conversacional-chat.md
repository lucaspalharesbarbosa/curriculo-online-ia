# ADR-014: Memória conversacional no `/chat`

## Status
Aceita

## Contexto

O `/chat` (`backend/app/chat/`) é stateless por requisição: `ChatRequest` só carrega `question: str` (`router.py`), `service.answer_question` monta `messages` sempre com 2 elementos (`system` + pergunta atual, `_generate_answer`/`_generate_web_answer`) e `rag.search_with_routing` embeda só o texto isolado da pergunta atual. Isso quebra correferência entre turnos — exemplo relatado pelo autor:

1. "Onde Lucas trabalha?" → resposta correta, ex. "NA Engineering Brasil"
2. "Onde fica a matriz da empresa?" → falha: o retrieval busca só "onde fica a matriz da empresa" (sem "NA Engineering Brasil"), não encontra o chunk certo, e o LLM não recebe a troca anterior para inferir a quem "a empresa" se refere

O frontend (`frontend/hooks/useResumeChat.ts`) já mantém `messages` em estado local, mas o port `ChatClient.sendMessage` (`frontend/modules/chat/lib/chat-client.ts`) nunca os envia — o dado existe no cliente e se perde a cada requisição.

Decisão já tomada pelo autor, fora de escopo desta ADR (não reaberta aqui): o backend continua **sem sessão persistida em servidor** — é um chat de currículo pessoal, sem necessidade de continuidade entre visitas; o histórico trafega do cliente a cada requisição.

Restrições que moldam a decisão: Render free tier, single worker, já sensível a latência (`ADR-008`, cold start) e a chamadas externas lentas (`ADR-004`, timeout/retry). O `/chat` já pode fazer até duas chamadas de IA por request (embedding + geração, mais busca web condicional de `ADR-010`) — qualquer chamada nova precisa justificar o custo extra, não ser adicionada por completude.

## Decisão

### 1. Contrato — `history` opcional, janela de 3 pares (6 mensagens)

`ChatRequest` ganha `history: list[HistoryMessage] | None = None`, com `HistoryMessage = { role: "user" | "assistant", content: str }`. Request sem o campo (ou `None`/lista vazia) mantém o comportamento atual byte a byte — retrocompatível.

Limites, aplicados via `Field` do Pydantic (rejeitam com `422` antes de qualquer processamento, não silenciosamente):
- `history`: no máximo **20 mensagens** no request (`max_length=20`) — teto de abuso, não a janela funcional; existe para rejeitar cedo um payload claramente fora do uso normal de um chat de currículo (o front-end nunca deveria enviar mais que isso)
- `content` de cada mensagem: no máximo **4000 caracteres** (`max_length=4000`) — generoso para uma resposta de chat, protege contra payload desproporcional

Da lista validada, o **service** usa só a **janela funcional das últimas 3 trocas (6 mensagens)** — `MAX_HISTORY_MESSAGES = 6` em `service.py`. Histórico entre 6 e 20 mensagens não é rejeitado, só truncado à cauda (últimas 6) antes de entrar no retrieval e no prompt.

Trade-off custo/robustez: 3 pares cobre o cenário relatado (referência ao turno imediatamente anterior) e a maioria das conversas de acompanhamento em um chat de currículo, que na prática são curtas (visitante faz 2-4 perguntas, não uma entrevista longa). Janela maior (5+ pares, como sugerido inicialmente) aumenta tokens enviados ao LLM em toda troca subsequente sem ganho proporcional de precisão — a informação relevante para resolver uma referência anafórica quase sempre está no turno imediatamente anterior, raramente 4-5 turnos atrás. Se o autor observar em uso real perguntas que dependem de contexto mais antigo, a janela é um único número (`MAX_HISTORY_MESSAGES`) fácil de ajustar sem mudar contrato.

### 2. Query condensation via LLM (reaproveitando `ChatCompletionProvider`), só quando há histórico

Antes do retrieval, se `history` não estiver vazio, `service.py` gera uma "standalone question" chamando `chat_completion_provider.generate_completion` com um prompt dedicado de reformulação (mesmo port de `ports.py`, nenhuma mudança de assinatura) — equivalente ao "condense question chain" padrão em RAG conversacional.

Por quê LLM em vez de heurística de concatenação (a alternativa mais barata que o autor propôs): a heurística injeta contexto do turno anterior **sempre**, mesmo quando a pergunta atual já é standalone ou muda de assunto — nesse caso ela contamina a busca vetorial com entidades irrelevantes e pode piorar a precisão que a Fase 11 (`ADR-010`) acabou de corrigir. A reformulação via LLM decide, por pergunta, se e como resolver a referência, preservando o comportamento correto quando não há ambiguidade a resolver. Como o `/chat` já é um fluxo de poucas requisições por minuto (rate limit de `ADR-004`), o custo de uma chamada `gpt-4o-mini` extra — só nas perguntas de acompanhamento, não em toda pergunta — é marginal frente ao ganho de robustez, e seguro o padrão já estabelecido no projeto de reaproveitar o port existente em vez de introduzir lógica nova de string matching.

A pergunta reformulada é usada **só para o retrieval**: substitui a pergunta crua em toda a chamada de `rag.search_with_routing` (embedding **e** detecção de seção/recência por palavra-chave de `ADR-010` — um único texto de entrada, sem caminho duplo). A pergunta original do usuário continua para exibição/log e como base do prompt final ao LLM (`_build_user_prompt`).

### 3. Histórico nas `messages` finais

Em `_generate_answer` e `_generate_web_answer` (`service.py`), a lista `messages` passa a ser: `[system, *históricas (user/assistant alternados, mais antiga → mais recente), user atual]` — o histórico entra **entre** o `system prompt` e a pergunta atual, mantendo a ordem cronológica das trocas anteriores.

### 4. Fallback e contrato de resposta inalterado

- Falha na chamada de condensation (exceção do provider, resposta vazia) → usa a `question` crua no retrieval, sem propagar erro ao cliente — mesmo padrão de resiliência de `ADR-004` (falha de uma chamada auxiliar não derruba o fluxo principal)
- `history` malformado (`role`/`content` ausente, tipo errado, ou acima dos limites do `Field`) → `422` padrão do FastAPI/Pydantic, igual a qualquer outro erro de validação do `ChatRequest` hoje
- `ChatResponse` (`{ answer: string, source: "resume" | "web" }`) **não muda** — a memória conversacional é só um refinamento de como a resposta é gerada, não do shape da resposta

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| Heurística de concatenação (sem chamada extra ao LLM) | Zero latência/custo adicional; mais simples | Injeta contexto do turno anterior mesmo quando a pergunta já é standalone ou muda de assunto — risco real de regressão na precisão de retrieval que `ADR-010` acabou de corrigir |
| Janela de 5 pares (10 mensagens), conforme sugestão inicial do autor | Cobre conversas mais longas | Mais tokens em toda troca subsequente sem ganho proporcional — referência anafórica quase sempre resolve com o turno imediatamente anterior num chat de currículo |
| Sessão persistida no servidor (Redis/DB, chave por visitante) | Payload de request menor a cada troca | Contradiz decisão já tomada pelo autor (backend stateless); exige infra nova incompatível com o Render free tier e sem necessidade real (chat de portfólio, não produto com contas de usuário) |
| Query condensation via LLM, janela de 3 pares (6 mensagens), teto de validação de 20 mensagens/4000 caracteres (escolhida) | Resolve o cenário relatado sem regredir perguntas standalone; custo extra só nas perguntas de acompanhamento; limites protegem contra abuso sem exigir autenticação | Uma chamada LLM extra por pergunta de acompanhamento (latência/custo, mitigado por só disparar quando há histórico) |

## Consequências

- `backend/app/chat/router.py`: `ChatRequest` ganha `history: list[HistoryMessage] | None = None`, com `HistoryMessage` novo (`Pydantic BaseModel`), `max_length=20` na lista e `max_length=4000` no `content` de cada mensagem
- `backend/app/chat/service.py`: nova constante `MAX_HISTORY_MESSAGES = 6`; nova função de condensation (prompt dedicado, reaproveita `ChatCompletionProvider`); `answer_question` recebe `history` e o repassa truncado; `_build_user_prompt`/`_generate_answer`/`_generate_web_answer` passam a montar `messages` com as trocas históricas entre `system` e a pergunta atual
- `backend/app/chat/rag.py`: `search_with_routing` não muda de assinatura — quem chama passa a pergunta condensada como `question` quando há histórico
- `ChatResponse` inalterado — nenhum cliente existente quebra
- `frontend/modules/chat/lib/chat-client.ts`/`http-chat-client.ts`/`frontend/hooks/useResumeChat.ts` passam a enviar `history` truncado à mesma janela de 6 mensagens (US-15-03) — duplicar o limite no cliente evita depender só da validação do servidor para a experiência normal (o servidor continua sendo a fonte de verdade, truncando/validando de qualquer forma)
- Reavaliar esta ADR se: o volume real de perguntas de acompanhamento tornar o custo da chamada de condensation perceptível no painel do provider; ou se visitantes reais precisarem de referências a mais de 3 trocas atrás (ajustar `MAX_HISTORY_MESSAGES`, sem mudar contrato)

## Referências

- `docs/agents/CONTEXTO-PROJETO.md`
- `docs/product/PRD-013-memoria-conversacional-rag.md`, `docs/product/backlog/fase-15/US-15-01-adr-memoria-conversacional-rag.md`
- [ADR-003](ADR-003-fluxo-rag.md) (fluxo de RAG original, sem banco vetorial)
- [ADR-004](ADR-004-resiliencia-backend-chat.md) (timeout/retry, fallback gracioso — padrão reaproveitado aqui)
- [ADR-010](ADR-010-fluxo-rag-v2-precisao-web.md) (roteamento por seção/recência, busca web — `search_with_routing` recebe a pergunta condensada)
- [ADR-012](ADR-012-clean-architecture-chat.md) (Ports & Adapters no domínio `chat` — condensation reaproveita `ChatCompletionProvider` de `ports.py`, sem porta nova)
- `backend/app/chat/router.py`, `backend/app/chat/service.py`, `backend/app/chat/rag.py`, `backend/app/chat/ports.py`
- `frontend/hooks/useResumeChat.ts`, `frontend/modules/chat/lib/chat-client.ts`
