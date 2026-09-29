# PRD-015: Tools e MCP (um núcleo, duas portas)

**Status:** implementado e medido (`ADR-017`); tool calling permanece desligado por decisão baseada no golden-set
**Épico:** Tools e MCP
**Prioridade:** P1

## Problema

O `/chat` decide no código de onde vem cada resposta (dicionário de palavras-chave, gatilho de entidade para a busca web) e o LLM só redige. Isso deixa dois problemas:

- **Aritmética de datas.** "Quantos anos de experiência com Python?" exige somar períodos do `resume.json`. O RAG devolve o trecho certo e o modelo estima a conta.
- **Sem acesso padronizado para outras IAs.** O currículo só é consumível pela interface do site.

## Objetivo

Extrair as capacidades do assistente para **tools** somente leitura e expô-las por duas portas: tool calling no chat do site e um servidor **MCP** para clientes compatíveis (Claude Desktop, Cursor), sem reescrever o que já funciona.

## Escopo

### Incluído

- Núcleo de tools (`search_resume`, `calculate_experience`, `search_web`) sem dependência de protocolo
- `calculate_experience` determinístico (períodos sobrepostos contados uma vez; cargo atual até o mês corrente)
- Tool calling no `/chat` atrás de flag, com guard rails e fallback para o pipeline atual
- Servidor MCP em stdio e em Streamable HTTP (`/mcp`), com rate limit, e recursos `resume://experiencias` e `resume://skills`
- Testes com fakes (sem chamada real a LLM) e rotina de comparação no golden-set (`--tools`)

### Excluído

- Tools com escrita ou execução de código
- Autenticação no `/mcp` (dados públicos, somente leitura)
- Trocar o pipeline determinístico pelo tool calling como padrão, antes de medir

## Critérios de aceite

- [x] `calculate_experience("Python")` devolve o total exato em anos e meses, coberto por testes de borda
- [x] O mesmo registro de tools alimenta OpenAI e MCP, com teste contra drift de schema
- [x] Falha do provider no tool calling cai para o pipeline, sem erro ao visitante
- [x] Cliente MCP real (stdio) lista as tools, chama `calculate_experience` e lê os recursos
- [x] Tool calling medido contra o pipeline no golden-set real: 17/24 (71%) contra 18/24 (75%), sem ganho, então a flag fica desligada

## Riscos

- `/mcp` é superfície pública nova: mitigado por rate limit, somente leitura e nenhuma resposta com segredo
- Custo: `search_resume` gera um embedding por chamada; tool calling adiciona uma chamada de LLM por pergunta (por isso é opt-in)
- Nova dependência (`mcp`) e `pydantic` 2.11 no free tier

## Referências

- [`ADR-017`](../architecture/ADR-017-tools-e-mcp-um-nucleo-duas-portas.md)
