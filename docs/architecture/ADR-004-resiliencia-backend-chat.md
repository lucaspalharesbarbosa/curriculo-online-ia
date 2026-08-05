# ADR-004: Padrões de resiliência do backend (endpoint `/chat`)

## Status
Aceita

## Contexto

Ideia trazida pelo autor: avaliar padrões de arquitetura e resiliência — **circuit breaker, rate limiter, bulkhead, retry, timeout, cache-aside** — para o backend, com foco natural no endpoint `/chat`, que é o único ponto do sistema que depende de uma API externa (OpenAI, `ADR-003`).

Estado atual do código (`backend/app/rag.py`, `backend/app/chat.py`):
- `get_client()` cria o client OpenAI **sem** `timeout`/`max_retries` explícitos — usa o default do SDK (minutos, não segundos)
- Rate limiter em memória por IP já existe (`_is_rate_limited`, US-05-07)
- Índice de embeddings do `resume.json` já é cacheado em JSON e carregado uma vez na inicialização (US-05-03, `ADR-003`) — já é, na prática, cache-aside
- `ai-architecture-patterns.md` (seção 5) já orientava "timeout curto" e "sem retry agressivo", mas isso nunca virou código nem decisão formal — ficou como recomendação solta

Restrições que moldam a decisão (`ADR-002`): backend roda no Render free tier, 512 MB / 0,1 vCPU, uma única instância. Tráfego é de visitante ocasional de portfólio, não produto com escala.

## Decisão

Padrão a padrão:

| Padrão | Decisão | Motivo |
|---|---|---|
| **Timeout** | Adotar agora | Client OpenAI (embeddings + geração) passa a declarar timeout explícito e curto (ordem de segundos, não o default de minutos do SDK). Sem isso, uma chamada lenta do provider trava o único worker do Render free tier até a conexão cair sozinha — pior experiência do que um erro rápido com a mensagem de fallback que já existe. Fecha uma lacuna real entre o que `ai-architecture-patterns.md` já recomendava e o que o código faz. |
| **Retry** | Adotar, escopo limitado | No máximo 1 retry, só para erro transitório do provider (429/503), sem backoff exponencial — o timeout curto já limita o custo de esperar. Isso **refina**, não contradiz, a diretriz "sem retry agressivo" já registrada em `ai-architecture-patterns.md`: uma tentativa extra num erro claramente transitório não é agressivo; múltiplas tentativas com backoff, para um site de baixo tráfego, seria. |
| **Rate limiter** | Já implementado | US-05-07 (Fase 5) — limite em memória por IP no `/chat`. Nada novo a decidir aqui; citado só para registrar que o padrão já foi avaliado e adotado. |
| **Cache-aside** | Já implementado para embeddings; cache de resposta fica como ideia futura | O índice de embeddings do `resume.json` (`ADR-003`) já segue cache-aside: calculado uma vez, cacheado em JSON, carregado na inicialização, só reindexado quando o `resume.json` muda. Cache de **respostas completas** do `/chat` (para perguntas repetidas de visitantes) tem valor potencial, mas exige estratégia de invalidação quando o currículo muda, e o volume atual de tráfego não paga essa complexidade agora. |
| **Circuit breaker** | Descartar por ora | Protege contra sobrecarregar uma dependência já falhando e evita gastar recursos locais em chamadas fadadas ao erro. Com timeout curto + retry único já limitando o custo de cada falha, e tráfego real na casa de poucas requisições por minuto (contido ainda mais pelo rate limiter), o ganho de um circuit breaker é marginal frente à complexidade de manter uma state machine (closed/open/half-open) e, tipicamente, uma lib nova. Reavaliar só diante de evidência real de indisponibilidade prolongada do provider afetando visitantes — não como precaução especulativa. |
| **Bulkhead** | Descartar | Isola pools de recursos entre dependências para que a falha de uma não esgote recursos que outra precisa. O backend tem uma única dependência externa (OpenAI), chamada por um único endpoint, rodando numa única instância de 0,1 vCPU — não há um segundo workload concorrente para isolar. Particionar pool de conexões/threads aqui não traz isolamento real, só complexidade. |

## Alternativas consideradas

| Alternativa | Prós | Contras | Veredito |
|---|---|---|---|
| Adotar os 6 padrões (conjunto "completo" de resiliência) | Cobertura teórica ampla | Circuit breaker e bulkhead resolvem problemas de escala/topologia (múltiplas dependências, múltiplas instâncias, alto tráfego) que este projeto não tem — adicionar por completude, sem necessidade real, é exatamente o over-engineering que o papel de arquiteto deste projeto existe para evitar | Descartada |
| Não mudar nada (manter como está) | Zero esforço | Timeout implícito do SDK OpenAI (minutos) deixa o único worker do free tier vulnerável a travar numa chamada lenta — risco real, não teórico, dado o hardware do Render free tier | Descartada |
| Timeout + retry limitado agora; circuit breaker/bulkhead só se houver evidência futura de necessidade (escolhida) | Fecha a lacuna real (timeout) e agrega uma melhoria de baixo custo (retry limitado), sem complexidade sem uso comprovado | Exige reabrir esta ADR se o cenário mudar (mais dependências externas, mais tráfego, mais instâncias) | **Escolhida** |

## Consequências

- `backend/app/rag.py` (`get_client()`) e `backend/app/chat.py` passam a configurar timeout explícito e retry único quando a implementação for priorizada — ainda **não** decomposta em história de backlog; nasce como item novo em `PRD-006-seguranca-performance.md` (Fase 8)
- `ai-architecture-patterns.md` (seção 5, `@arquiteto-ia-senior`) atualizada para refletir timeout/retry como decisão concreta desta ADR, não só recomendação genérica
- `PRD-006-seguranca-performance.md` ganha história nova para a implementação e passa a listar circuit breaker/bulkhead como excluídos explicitamente, com o motivo desta ADR, para não serem repropostos sem sinal novo
- Cache de resposta (cache-aside de conversas do `/chat`) fica registrado aqui como ideia futura, não história ativa — só vira história se o volume de perguntas repetidas justificar
- Reavaliar esta ADR se: o backend passar a depender de mais de um serviço externo relevante; o tráfego crescer a ponto de picos de falha do provider afetarem múltiplos visitantes simultâneos; ou a hospedagem migrar para infra com múltiplas instâncias (cenário em que bulkhead volta a fazer sentido, de outra forma)

## Referências

- `docs/agents/CONTEXTO-PROJETO.md`
- `.claude/skills/arquiteto-ia-senior/references/ai-architecture-patterns.md` (seção 5)
- [ADR-002](ADR-002-hospedagem-gratuita.md) (restrições do Render free tier)
- [ADR-003](ADR-003-fluxo-rag.md) (cache-aside de embeddings já decidido; diretriz original "sem retry agressivo")
- `docs/product/PRD-006-seguranca-performance.md`
- `backend/app/chat.py`, `backend/app/rag.py`
