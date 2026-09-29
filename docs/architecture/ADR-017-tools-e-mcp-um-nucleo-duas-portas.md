# ADR-017: Tools e MCP, um núcleo e duas portas

## Status
Aceita

## Contexto

Hoje o `/chat` decide **no código** de onde vem cada resposta: o roteamento por seção usa um dicionário de palavras-chave (`ADR-010`, `ADR-013`), a busca web é acionada por substring de entidade (`_mentions_known_entity`) e a auto-crítica (`ADR-016`) cobre a faixa ambígua. O LLM só entra no fim, para redigir. Isso é barato, previsível e testável, mas tem dois limites concretos:

1. **Aritmética de datas.** "Quantos anos de experiência com Python?" exige somar períodos do `resume.json`. O RAG devolve o trecho certo e o modelo estima a conta. É uma classe de erro que retrieval não resolve; só código resolve.
2. **Consumo por outras IAs.** O currículo só é acessível pela interface do site. Não há uma forma padronizada de um agente (Claude Desktop, Cursor, outros) consultar esses dados.

Restrições que seguem valendo: Render free tier com worker único (`ADR-002`, `ADR-008`), resiliência do `ADR-004` (timeout curto, no máximo 1 retry), Ports & Adapters (`ADR-012`).

## Decisão

### 1. Um núcleo de tools, sem conhecer protocolo

`backend/app/tools/` define o núcleo: uma `Tool` é nome, descrição, JSON Schema dos argumentos e uma função Python pura (`registry.py`). O núcleo não importa `openai`, `httpx` nem `mcp`. Cada protocolo é um adapter fino que traduz `Tool` para o seu formato, na mesma regra do `ADR-012`.

| Tool | O que faz | Reaproveita |
|---|---|---|
| `search_resume(query, section?)` | Busca semântica nos chunks do currículo | `rag.search_with_routing` / `rag.search` |
| `calculate_experience(skill_or_company)` | Soma exata dos períodos dos cargos que usam a tecnologia/empresa | novo (`experience.py`) |
| `search_web(query)` | Busca pública sobre entidade citada no currículo | `WebSearchProvider` (Tavily) |

`calculate_experience` casa por **conjunto de tokens** (não substring): "java" casa "Java 11" e "Java (Spring Boot)", mas não "JavaScript". Períodos sobrepostos ou contíguos são unidos antes da soma, e cargo sem `end_date` conta até o mês corrente.

### 2. Porta 1: tool calling no `/chat` (opt-in)

Novo port `ToolCallingProvider` (`chat/ports.py`) com adapter OpenAI (`OpenAIToolCallingProvider`). O loop vive em `service._answer_with_tools`. Fica **atrás de flag** (`CHAT_TOOL_CALLING=true`), desligada por padrão: o pipeline determinístico continua sendo o caminho padrão e o plano B.

Guard rails do loop:

- No máximo `MAX_TOOL_ITERATIONS = 3` turnos e `MAX_TOOL_CALLS = 3` execuções por pergunta. Estourado o limite, um turno final **sem tools** força a resposta.
- O 1º turno usa `tool_choice="required"`: a resposta é sempre ancorada em dado de uma tool, nunca só na memória do modelo.
- Argumentos de texto têm teto de 300 caracteres (`MAX_QUERY_LENGTH`): o `/mcp` é público e sem isso um cliente gera custo de embedding ou de busca web com texto enorme.
- Todas as tools são **somente leitura**. Nenhuma escreve estado nem executa código.
- Argumentos do modelo são não confiáveis: `execute_tool` valida JSON, nome e argumentos contra o schema e converte qualquer erro em texto devolvido ao modelo (nunca levanta).
- `search_web` mantém o gatilho do `ADR-010`: a consulta precisa conter uma entidade do currículo, senão a tool recusa. Assim o modelo não vira um buscador genérico.
- Falha do provider (`OpenAIError`) no loop cai para o pipeline determinístico. O contrato de resposta (`answer` + `source`) não muda; `source="web"` só quando `search_web` devolveu conteúdo.

### 3. Porta 2: servidor MCP

`backend/app/mcp_server/` expõe o **mesmo** registro de tools no protocolo MCP, com o SDK oficial (`FastMCP`), mais dois recursos de leitura (`resume://experiencias`, `resume://skills`). Todas as tools levam `readOnlyHint`.

- **stdio** (`python -m app.mcp_server`): para clientes locais como Claude Desktop e Cursor.
- **Streamable HTTP** em `/mcp`, montado no FastAPI, **opt-in** por `MCP_HTTP_ENABLED=true`. Modo `stateless` com resposta JSON, coerente com o worker que dorme (`ADR-008`).
- Rate limit próprio por IP na frente do `/mcp` (30 requisições por minuto, maior que o do `/chat` porque um uso de cliente MCP faz 3 a 4 requests). Cada `search_resume` custa um embedding, então o teto existe.
- A proteção de DNS rebinding do SDK (pensada para servidor local) é desligada só no modo HTTP: não há cookie nem credencial, os dados são públicos, e ela bloquearia o `Host` real da hospedagem.

Uma única fonte de verdade para o schema: o JSON Schema do registro alimenta o OpenAI; o MCP o deriva da assinatura da função. Um teste garante que os dois nunca divergem (nomes e obrigatoriedade dos argumentos).

## Alternativas Consideradas

- **Só tool calling, sem MCP.** Mais rápido, mas perde o ganho de padronização: o dado só serviria ao próprio chat.
- **Trocar o pipeline pelo loop de tools de vez.** Descartada: adiciona pelo menos uma chamada extra ao LLM por pergunta (latência e centavos no free tier) e o pipeline atual foi medido por golden-set (`ADR-016`). Tool calling só entra como padrão depois de medido.
- **Framework (LangChain, LlamaIndex, agent SDK).** Descartada pelo mesmo motivo do `ADR-003`: o loop tem ~40 linhas e o projeto tem valor didático em mostrar o mecanismo.
- **FastMCP com decorators direto nas funções, sem registro.** Descartada: duplicaria a definição das tools entre OpenAI e MCP e permitiria drift.
- **Tool com escrita (ex.: enviar contato).** Fora de escopo: superfície de risco sem necessidade.

## Consequências

- (+) `calculate_experience` troca estimativa do modelo por resultado verificável e coberto por teste.
- (+) O currículo passa a ser consumível por qualquer cliente MCP, sem novo backend.
- (+) Terceiro protocolo futuro é mais um adapter, não uma reescrita.
- (-) Nova dependência `mcp` (e `pydantic` sobe de `2.10.4` para `2.11.10`, exigido pelo SDK). Mais superfície de dependência no free tier.
- (-) Tool calling custa uma chamada a mais ao LLM por pergunta. Por isso é opt-in.
- (-) `/mcp` é uma superfície pública nova. Mitigada por rate limit, somente leitura e ausência de segredos nas respostas, mas vale monitorar o custo de embeddings.
- Tool calling foi medido contra o pipeline no golden-set real (ver abaixo): sem ganho de acerto, por isso segue desligado.

## Resultado real da medição (golden-set, 2026-09-29)

`python -m eval.run_golden_set --tools`, 24 perguntas, `gpt-4o-mini`, julgamento por LLM-as-judge.

| Modo | Acertos |
|---|---|
| Pipeline determinístico atual (`ADR-016`) | **18/24 (75%)** |
| Tool calling (`ADR-017`) | **17/24 (71%)** |

Quatro veredictos mudaram, dois para cada lado:

- **Tool calling acertou e o pipeline errou:** q14 ("onde trabalhava antes do Itaú Unibanco?") e q22 ("onde fica o Itaú Unibanco em que trabalhei?"). São perguntas de duas etapas, que o modelo resolve encadeando tools; o pipeline se abstém.
- **Pipeline acertou e tool calling errou:** q06 (listou "Java 21" entre as tecnologias do Banco BV: o termo aparece no currículo, mas só dentro de um highlight sobre pipelines quebrando com essa versão, não na lista de tecnologias usadas, então o modelo tratou um detalhe solto como tecnologia), q07 e q18 (disse "não encontrei" para a cidade da WebPic e para Kubernetes, que existem no currículo, provavelmente por buscar com termos ruins).

Leitura: com 24 perguntas, um acerto de diferença está dentro do ruído. A conclusão defensável é que o tool calling é **equivalente em acerto, com mais chamadas ao LLM por pergunta**, sem ganho que justifique ligá-lo em produção. Ele ajuda em perguntas encadeadas e piora em recuperação simples, onde o modelo escolhe mal a consulta ou mistura detalhes soltos com fatos.

**Decisão:** `CHAT_TOOL_CALLING` permanece **desligada** (padrão). O caminho fica no código, testado, como opção. Reabrir quando houver um golden-set maior ou uma versão do loop que force a busca inicial no currículo e deixe ao modelo só o encadeamento. O `calculate_experience` e o servidor MCP não dependem dessa flag e seguem ativos.

## Referências

- `ADR-004` (resiliência), `ADR-010` (busca web e roteamento), `ADR-012` (Ports & Adapters), `ADR-016` (auto-crítica e golden-set)
- Model Context Protocol: https://modelcontextprotocol.io
- Código: `backend/app/tools/`, `backend/app/mcp_server/`, `backend/app/chat/service.py` (`_answer_with_tools`)
