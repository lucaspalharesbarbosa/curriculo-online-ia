# ADR-018: Tools estruturadas, recuperar primeiro e busca híbrida

## Status
Aceita. Substitui a decisão de manter o tool calling desligado do [ADR-017](ADR-017-tools-e-mcp-um-nucleo-duas-portas.md).

## Contexto

O ADR-017 mediu o tool calling contra o pipeline atual e não achou ganho (17/24 contra 18/24), então manteve `CHAT_TOOL_CALLING` desligada. Um rastreio das chamadas mostrou que os erros não eram "a IA escolhe mal", e sim que as tools eram **genéricas demais**:

| Pergunta | O que aconteceu | Causa real |
|---|---|---|
| "Já trabalhou com Kubernetes?" | `search_resume("Kubernetes")` só trouxe chunks de skills | busca semântica não acha termo exato |
| "Cidade da WebPic?" | o modelo foi direto à busca web e nunca olhou o currículo | nada o obrigava a consultar a fonte certa |
| "Tecnologias no Banco BV?" | leu o chunk corrido e misturou "Java 21" (de uma conquista) | tecnologias e conquistas vêm no mesmo texto |
| "Antes do Itaú?" | buscou só o Itaú e chutou a empresa anterior | falta uma visão ordenada da carreira |

Além disso, "quantos anos de Python?" e perguntas sobre o próprio projeto são capacidades que o pipeline não tem por construção.

## Decisão

### 1. Tools estruturadas e determinísticas (código puro, sem LLM)

Em `backend/app/tools/`, sobre o `Resume` (campos, não texto corrido):

| Tool | Resolve |
|---|---|
| `find_technology(name)` | "já usou X", "onde usou X", "há quanto tempo": cargos, skills e projetos, casando por token inteiro na lista de tecnologias (não no texto das conquistas) |
| `get_experience(company)` | cidade, modalidade, cargo, período e tecnologias de uma empresa, cada um em seu campo |
| `career_timeline(around?)` | ordem da carreira, primeira e mais recente, quantas empresas, quem veio antes e depois |
| `list_adrs()` e `read_adr(number)` | o chat explica o próprio projeto lendo `docs/architecture/` (arquivo escolhido por número inteiro, sem caminho do usuário; conteúdo truncado em 8000 caracteres) |

Somam-se a `calculate_experience`, `search_resume` e `search_web` do ADR-017: são 8 tools no núcleo, expostas também pelo MCP.

### 2. Recuperar primeiro, tools depois

`service.answer_question` roda o retrieval do pipeline (com auto-crítica do ADR-016) **antes** do modelo, e o contexto vai junto da pergunta. As tools entram como reforço para o que exige precisão. Efeitos:

- o modelo não consegue mais ignorar o currículo (caso da cidade da WebPic);
- no caso comum (contexto basta) continua sendo 1 chamada de LLM, como no pipeline;
- sem contexto confiável, o 1º turno exige uma tool (`tool_choice=required`);
- abstenção forçada pela auto-crítica vira "sem contexto" e não "abstenção": as tools exatas ainda podem responder (ex.: linha do tempo).

O prompt do modelo manda usar `list_adrs`/`read_adr` sempre que a pergunta for sobre "este projeto", mesmo havendo contexto do currículo, porque esse contexto não cobre o assunto.

### 3. Busca híbrida (semântica mais léxica)

`rag.search` aceita `lexical_weight` (`LEXICAL_WEIGHT = 0.2`, ligada por `HYBRID_RETRIEVAL_ENABLED`): o score de cada chunk ganha um bônus proporcional à fração de termos distintivos da pergunta (sem stopwords) presentes no texto. Ajuda termo exato ("Kubernetes"), que o embedding sozinho às vezes não prioriza.

### 4. Correção da seleção por recência (bug do ADR-010)

Para perguntas de recência ("última empresa"), o `rag.search` escolhia os `top_k` chunks de experiência mais **similares** e só depois reordenava por data. Como os scores das experiências ficam próximos (cerca de 0,48), o cargo atual nem entrava nos 3. Agora, quando a pergunta pede recência, seleciona-se as `top_k` experiências de maior `recency_key`. O ADR-010 dizia "sem mudar quais chunks foram selecionados"; isso deixa de valer e está coberto por teste de regressão.

### 5. Guard rails mantidos

Teto de 3 turnos e 3 execuções, tools somente leitura, entrada do LLM validada, teto de 300 caracteres nos argumentos de texto, fallback para o pipeline se o provider falhar, e `search_web` só para entidades do currículo.

## Alternativas Consideradas

- **Manter tools genéricas e tentar melhorar o prompt.** Descartada: o rastreio mostrou que o problema era de ferramenta, não de instrução.
- **Trocar o pipeline de vez.** Descartada: o pipeline segue como plano B automático e como caminho quando a flag está desligada.
- **Reranker ou LLM de reescrita para todo retrieval.** Descartada por custo e latência no free tier; o bônus léxico custa zero.
- **Índice separado para os ADRs.** Descartada: são poucos arquivos e a leitura direta por número dispensa embeddings.

## Medição real (golden-set, 2026-09-29)

Novo `python -m eval.compare_modes`, com juiz LLM, dois conjuntos: as 24 perguntas originais (**regressão**, não pode cair) e 15 perguntas de capacidades novas (**ganho**, em `eval/golden_set_capabilities.json`). Critério de ligar em produção, definido antes de medir: regressão sem queda e ganho claro.

| Conjunto | Pipeline | Tools + híbrida | Observação |
|---|---|---|---|
| Regressão (24) | 19/24 | **21/24** | sem queda |
| Capacidades (15) | 3/15 | **14/15** | duração, tecnologia, cronologia, campos de empresa, ADRs |
| Latência média (regressão) | 1,79 s | 1,71 s | |
| Chamadas de LLM (regressão) | 1,58 | 1,58 | |
| Latência média (capacidades) | 2,13 s | 3,28 s | mais chamadas quando a tool é necessária |

Modos intermediários (mesma medição, rodadas anteriores): a busca híbrida sozinha não mudou o acerto (19/24 e 4/15), e as tools sem híbrida ficaram em 21/24 e 14/15, com mais chamadas de LLM por pergunta (2,17 contra 1,67). A combinação foi escolhida por acertar igual ou mais com menos chamadas.

**Limitações honestas.** Há variação entre rodadas (o mesmo pipeline deu 18 e 19 de 24), então diferenças de 1 acerto são ruído. Das 4 falhas finais, 3 são falsos negativos do juiz, que considera datas de 2025 e 2026 "no futuro" (respostas corretas); a restante (q12, "quantos anos de experiência eu tenho?") é uma limitação real: não há tool de experiência total. O conjunto de capacidades foi escrito por quem construiu as tools, então mede o ganho nas capacidades novas, não superioridade geral: a evidência de que não piora é o conjunto de regressão.

**Decisão:** `CHAT_TOOL_CALLING` passa a `true` no `render.yaml`, e `HYBRID_RETRIEVAL_ENABLED = True`.

## Consequências

- (+) O chat responde duração, "já usou X", cronologia e decisões do projeto com fatos exatos.
- (+) Uma correção de bug de recência beneficia também o pipeline.
- (+) O mesmo núcleo serve o MCP: clientes externos ganham as 8 tools.
- (-) Perguntas que exigem tool custam mais chamadas e cerca de 1 segundo a mais.
- (-) Mais superfície: 8 tools e leitura de `docs/architecture/` em produção (somente leitura, degrada com mensagem se a pasta não existir).
- (-) O juiz do golden-set precisa de um ajuste sobre datas para não penalizar respostas corretas (pendente).

## Referências

- [ADR-010](ADR-010-fluxo-rag-v2-precisao-web.md), [ADR-016](ADR-016-rag-agentico-auto-critica.md), [ADR-017](ADR-017-tools-e-mcp-um-nucleo-duas-portas.md)
- [C4-002](C4-002-componentes-backend-tools-mcp.md)
- Código: `backend/app/tools/`, `backend/app/chat/service.py`, `backend/app/chat/rag.py`, `backend/eval/compare_modes.py`
