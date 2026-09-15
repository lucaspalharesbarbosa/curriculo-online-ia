# ADR-016: RAG agêntico com auto-crítica seletiva

## Status
Aceita

## Contexto

`ADR-010` resolveu perguntas objetivas que caíam fora do que a similaridade de cosseno pura conseguia diferenciar ("onde estudei?", "última empresa") com um roteamento por seção/recência baseado em **dicionário de palavras-chave** (`SECTION_INTENT_KEYWORDS`, `detect_section_intent`, `rag.py`), deliberadamente descartando ali um classificador de intenção via LLM por custo/latência desproporcional ao ganho observado. `ADR-013` reforçou esse mesmo dicionário (casamento por conjunto de tokens em vez de substring literal), corrigindo um bug de roteamento sem reabrir a decisão de fundo.

Essa abordagem cobre bem o vocabulário previsto, mas por definição não cobre o que está fora dele:

- **Sinônimos/frases não previstas**: uma pergunta que não bate em nenhuma keyword de `_EDUCATION_INTENT_KEYWORDS`/`_EXPERIENCE_INTENT_KEYWORDS` cai em `search()` sem `section` restrito (`detect_section_intent` retorna `None`), voltando ao comportamento de similaridade pura que o próprio `ADR-010` documentou como insuficiente para esses casos.
- **Perguntas compostas entre seções**: ex. "que skills usei na Itaú Unibanco?" cruza `experience` (a empresa) e `skill` (as tecnologias) — nenhuma keyword do dicionário atual mapeia para uma combinação de duas seções, e mesmo se mapeasse, o dicionário é por design uma correspondência 1:1 pergunta→seção (`SECTION_INTENT_KEYWORDS: dict[str, set[str]]`), não uma composição.

Em ambos os casos, o sistema **não tem nenhum sinal interno** de que o contexto recuperado pode estar incompleto ou na seção errada — `service.answer_question` só decide entre responder com o contexto do `top_k` ou cair no fallback de busca web quando `results[0][1] < SIMILARITY_THRESHOLD` (0.2, claramente baixo). Entre "claramente baixo" e "claramente bom", existe uma faixa onde o contexto pode estar incompleto (contém alguns chunks relevantes, mas não todos os necessários) sem que o score agregado sinalize isso.

Restrições que seguem valendo (mesmas de `ADR-010`/`ADR-004`/`ADR-008`): Render free tier, single worker sensível a latência; `/chat` já pode disparar até 3 chamadas de IA por requisição hoje (condensação de histórico quando há `history`, `ADR-014`; embedding; geração) mais a busca web condicional — qualquer chamada nova precisa ser seletiva, não constante.

## Decisão

### 1. Auto-crítica como passo adicional, não substituto do roteamento por palavra-chave

A auto-crítica roda **depois** de `rag.search_with_routing` (que já aplica o roteamento por seção/recência de `ADR-010`/`ADR-013`), nunca no lugar dele. O dicionário de keywords continua sendo o primeiro filtro, de custo zero; a auto-crítica é a rede de segurança para o que ele deixa passar — mesma relação de complementaridade que `ADR-010` já estabeleceu entre similaridade pura e roteamento por seção.

### 2. Critério seletivo de acionamento — só na faixa ambígua

Dois patamares de confiança, acima do `SIMILARITY_THRESHOLD` (0.2, que já decide "tenta busca web"):

```python
# backend/app/chat/service.py
SELF_CRITIQUE_HIGH_CONFIDENCE_THRESHOLD = 0.5   # score alto o bastante por si só
SELF_CRITIQUE_SECTION_CONFIDENCE_THRESHOLD = 0.35  # score "bom" quando já há seção roteada
```

A auto-crítica roda **somente quando todas as condições abaixo são verdadeiras**:

1. `results[0][1] >= SIMILARITY_THRESHOLD` — já passou do patamar mínimo que hoje decide entre resposta local e busca web (não faz sentido gastar uma chamada de auto-crítica quando o contexto já está claramente insuficiente; esse caso já cai direto no fluxo de busca web existente, inalterado)
2. **E** `results[0][1] < SELF_CRITIQUE_HIGH_CONFIDENCE_THRESHOLD` — um score muito alto (>= 0.5) já é confiável **por si só**, com ou sem seção roteada (uma pergunta pode não bater em nenhuma keyword do dicionário e ainda assim ter uma correspondência de similaridade muito forte — não faz sentido de segunda-adivinhar esse caso)
3. **E** `not (section_routed and results[0][1] >= SELF_CRITIQUE_SECTION_CONFIDENCE_THRESHOLD)` — quando há seção roteada por keyword (`detect_section_intent` não é `None`), o patamar de corte cai para 0.35 (o próprio roteamento já é um sinal de confiança adicional, então um score mais modesto ainda é aceitável sem checar)

Em outras palavras, a auto-crítica só roda na faixa realmente ambígua: score entre 0.2 e 0.5 **sem** seção roteada (pergunta fora do vocabulário do dicionário, ex. sinônimo ou pergunta composta entre seções), ou score entre 0.2 e 0.35 **com** seção roteada (o roteamento acertou a seção, mas o chunk específico ainda não parece muito bom). Pergunta com seção roteada e score >= 0.35, ou qualquer pergunta com score >= 0.5, são os casos felizes que já funcionam hoje (`ADR-010`/`ADR-013`) — pulam a auto-crítica, zero custo extra. Pergunta com score já abaixo de 0.2 mantém o comportamento atual (fallback web) sem passar pela auto-crítica.

Os dois valores (`0.5`/`0.35`) são estimativa de engenharia inicial, não calibração estatística — `US-16-03` (golden-set + LLM-as-judge) é o mecanismo para validar/ajustar esses números com dado real; são duas constantes, fáceis de tunar sem mudar contrato.

### 3. Iteração: reescrever a query, depois relaxar a seção — teto de 2 iterações

```python
MAX_SELF_CRITIQUE_ITERATIONS = 2
```

A cada iteração, uma **única chamada** ao `ChatCompletionProvider` faz o papel de crítico e de reformulador ao mesmo tempo (não duas chamadas separadas de "julgar" + "reformular" — reduz pela metade o custo por iteração): o prompt pede que o modelo responda `SUFICIENTE` se o contexto (chunks recuperados) responde à pergunta, ou `INSUFICIENTE: <query reformulada>` caso contrário. `service.py` faz o parsing dessa resposta (prefixo, case-insensitive) — falha ao parsear (resposta fora do formato esperado) é tratada como `SUFICIENTE` (aceita o contexto que já tem), nunca como erro que interrompe o fluxo.

Mecanismo de cada iteração, para não repetir a mesma busca:

- **Iteração 1** — reformula a query (reescreve incorporando sinônimos/termos que possam faltar) e repete `rag.search_with_routing` com a query reformulada — deixa o roteamento por seção rodar de novo sobre o novo texto (uma reformulação pode, ela mesma, acertar uma keyword do dicionário que a pergunta original não continha)
- **Iteração 2** (só se a 1ª ainda for `INSUFICIENTE`) — usa a query reformulada da iteração 1, mas chama `rag.search` diretamente com `section=None` (ignora a restrição de seção, mesmo que o roteamento tenha identificado uma) e `top_k` do módulo (3) — cobre o caso de pergunta composta entre seções, onde restringir a uma seção só é exatamente o que está excluindo o chunk certo

Se a 2ª iteração ainda for avaliada como `INSUFICIENTE`, ou se `MAX_SELF_CRITIQUE_ITERATIONS` for atingido, o fluxo segue para o passo 4.

### 4. Esgotou as iterações → fallback web existente, inalterado

Sem convergência dentro do teto de iterações, `service.answer_question` segue **exatamente** o fluxo já existente de `ADR-010` seção 2: verifica se a pergunta cita uma entidade conhecida (`_mentions_known_entity`) e, se sim, aciona `web_search_provider.search_web`; senão, `FALLBACK_ANSWER`. Nenhuma mudança no gatilho, no provider (Tavily) ou no contrato de `source` (`"resume" | "web"`).

### 5. Convivência com a condensação de pergunta (`ADR-014`)

A auto-crítica opera sobre a **pergunta já condensada** (`search_question`, resultado de `_condense_question`), não sobre a `question` crua do usuário — é a mesma variável que já alimenta `rag.search_with_routing` hoje. Isso evita um segundo caminho de reformulação de texto: a condensação (`ADR-14`) resolve correferência de histórico; a auto-crítica (este ADR) resolve insuficiência de contexto dentro de uma única pergunta (já condensada) — são passos sequenciais e ortogonais, não dois mecanismos concorrentes. A cada iteração de auto-crítica, a query reformulada substitui `search_question` só para as chamadas de retrieval subsequentes daquela requisição; a pergunta original do usuário continua sendo a base do prompt final ao LLM (`_build_user_prompt`), como já acontece hoje.

### 6. Reaproveitamento de porta — sem mudança em `ports.py`

A chamada de auto-crítica usa `chat_completion_provider.generate_completion(model=GENERATION_MODEL, messages=[...])` — a mesma assinatura já usada por `_condense_question`/`_generate_answer`/`_generate_web_answer`. Nenhuma porta nova, nenhuma dependência direta de SDK no domínio `chat` (`ADR-012`).

### 7. Resiliência — mesmo padrão de `ADR-004`/`ADR-014`

Falha da chamada de auto-crítica (exceção do provider, resposta vazia) é tratada como `SUFICIENTE` — aceita o contexto que já tem e segue para a geração normal, em vez de propagar erro ou interromper o fluxo. Consistente com o padrão já estabelecido em `_condense_question`: uma chamada auxiliar nunca pode ser o motivo de uma falha visível ao cliente.

### 8. Parâmetro para comparação antes/depois (`US-16-03`)

`service.answer_question` ganha um parâmetro `enable_self_critique: bool = True`. Com `False`, o fluxo é **byte a byte** o comportamento anterior a este ADR (sem a auto-crítica) — usado pelo golden-set (`US-16-03`) para medir "antes" e "depois" contra a mesma implementação, sem duas cópias de código nem dois deploys.

## Alternativas Consideradas

| Alternativa | Prós | Contras | Veredito |
|---|---|---|---|
| Auto-crítica seletiva pós-retrieval, teto de 2 iterações, crítico+reformulador numa única chamada (escolhida) | Cobre o gap real (fora de vocabulário/perguntas compostas) sem tocar no dicionário de `ADR-010`/`ADR-013`; custo extra só na faixa ambígua; reaproveita port existente | Introduz uma constante de confiança (`0.35`) sem calibração estatística prévia — mitigado por medir/ajustar com o golden-set real (`US-16-03`) | **Escolhida** |
| Auto-crítica em toda pergunta, sem critério seletivo | Mais simples de implementar (uma condição a menos) | Dobra o custo/latência de toda pergunta, inclusive as que já funcionam bem hoje — contraria a restrição de custo do Render free tier e o próprio pedido do autor de auto-crítica seletiva | Descartada |
| Reabrir `ADR-010` e substituir o dicionário por um classificador de intenção via LLM (a alternativa que `ADR-010` já havia descartado) | Resolveria sinônimos/composição de forma mais geral | É exatamente o trade-off de custo/latência que `ADR-010` já rejeitou para o caso comum; descartaria um mecanismo de custo zero que funciona para a maioria das perguntas reais | Descartada |
| Duas chamadas por iteração (uma para julgar suficiência, outra para reformular a query) | Prompt mais simples cada um, responsabilidade única por chamada | Dobra o custo de cada iteração sem ganho real — um único prompt bem desenhado (`SUFICIENTE` / `INSUFICIENTE: <query>`) resolve as duas tarefas numa chamada | Descartada |
| Teto de 3+ iterações | Mais chances de convergir | Custo/latência crescente sem ganho proporcional — se 2 iterações (reformular + relaxar seção) não bastarem, o fallback web (`ADR-010`) já é o mecanismo certo para "resume não tem essa informação" | Descartada |
| Sumarizar/reescrever a query só uma vez, sem a etapa de relaxar a seção | Mais simples | Não cobre o caso de pergunta composta entre seções (ex. "skills na Itaú Unibanco") — é exatamente esse caso que a restrição de seção do `ADR-010` pode estar sabotando, e só relaxar a seção resolve, não só reescrever o texto | Descartada |

## Consequências

- `backend/app/chat/service.py`: novas constantes `SELF_CRITIQUE_HIGH_CONFIDENCE_THRESHOLD` (0.5), `SELF_CRITIQUE_SECTION_CONFIDENCE_THRESHOLD` (0.35) e `MAX_SELF_CRITIQUE_ITERATIONS` (2); nova função de auto-crítica (prompt dedicado, parsing `SUFICIENTE`/`INSUFICIENTE: <query>`); `answer_question` ganha `enable_self_critique: bool = True` e passa a rodar o laço de auto-crítica entre o retrieval inicial e a decisão de fallback web, só dentro da faixa seletiva definida acima
- `backend/app/chat/rag.py`: nenhuma mudança de assinatura — `search_with_routing`/`search` já aceitam os parâmetros (`section`, `top_k`) que a auto-crítica reaproveita na iteração 2 (relaxamento de seção)
- `ChatRequest`/`ChatResponse` do `/chat` (`router.py`) — inalterados; a auto-crítica é interna a `service.py`, invisível ao cliente
- `US-16-02` implementa esta decisão; `US-16-03` mede o resultado real (golden-set + LLM-as-judge) e, depois de rodar, esta ADR deve ser atualizada (seção de Consequências) com o número real de melhoria encontrado e qualquer ajuste feito em `SELF_CRITIQUE_CONFIDENCE_THRESHOLD` a partir do dado real
- Reavaliar esta ADR se: o golden-set mostrar que `0.5`/`0.35` geram falsos positivos/negativos frequentes (sinal de recalibrar as constantes, não de mudar o mecanismo); o custo médio de chamadas extras por pergunta (medido em `US-16-03`) se mostrar desproporcional ao ganho de precisão; ou se o padrão de perguntas reais mostrar necessidade de mais de 2 iterações — nesse último caso, reavaliar se um classificador de intenção completo (a alternativa que `ADR-010` já descartou) passaria a valer o custo

## Referências

- `docs/agents/CONTEXTO-PROJETO.md`
- `docs/product/PRD-014-rag-agentico-auto-critica.md`, `docs/product/backlog/fase-16/US-16-01-adr-rag-agentico-auto-critica.md`
- [ADR-003](ADR-003-fluxo-rag.md) (fluxo de RAG original)
- [ADR-004](ADR-004-resiliencia-backend-chat.md) (padrão de resiliência de chamada auxiliar — reaproveitado aqui)
- [ADR-010](ADR-010-fluxo-rag-v2-precisao-web.md) (roteamento por seção/recência + fallback web — decisão que este ADR complementa, não substitui)
- [ADR-012](ADR-012-clean-architecture-chat.md) (Ports & Adapters no domínio `chat` — auto-crítica reaproveita `ChatCompletionProvider`, sem porta nova)
- [ADR-013](ADR-013-correcao-roteamento-rag-e-melhorias-chunking.md) (casamento por token no roteamento — dicionário que este ADR não reabre)
- [ADR-014](ADR-014-memoria-conversacional-chat.md) (condensação de pergunta — auto-crítica opera sobre a pergunta já condensada)
- `backend/app/chat/service.py`, `backend/app/chat/rag.py`, `backend/app/chat/ports.py`
