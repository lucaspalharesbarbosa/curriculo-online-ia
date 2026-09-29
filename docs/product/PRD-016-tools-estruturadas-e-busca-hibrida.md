# PRD-016: Tools estruturadas, recuperar primeiro e busca híbrida

**Status:** implementado e medido (`ADR-018`)
**Épico:** Tools e MCP
**Prioridade:** P1

## Problema

O tool calling do `ADR-017` não melhorou o chat (17/24 contra 18/24). O rastreio das falhas mostrou que as tools eram genéricas: busca semântica não acha termo exato, o modelo podia ignorar o currículo, tecnologias e conquistas vinham misturadas e não havia visão ordenada da carreira. Além disso, duração e perguntas sobre o próprio projeto são capacidades que o pipeline não tem.

## Objetivo

Fazer o uso de tools e MCP **melhorar de fato** o chat, com número: regressão sem queda nas 24 perguntas originais e ganho claro nas capacidades novas.

## Escopo

### Incluído

- Tools estruturadas e determinísticas: `find_technology`, `get_experience`, `career_timeline`, `list_adrs`, `read_adr`
- Recuperar primeiro, tools depois: contexto do retrieval junto da pergunta
- Busca híbrida (bônus léxico) no retrieval
- Correção da seleção por recência no `rag.search`
- Golden-set de capacidades novas e comparador de modos (`eval/compare_modes.py`)
- Tools também no servidor MCP; C4 de componentes

### Excluído

- Tools com escrita; autenticação no `/mcp`
- Reranker ou LLM extra em todo retrieval

## Critérios de aceite

- [x] Regressão sem queda: 21/24 contra 19/24 do pipeline
- [x] Ganho claro nas capacidades novas: 14/15 contra 3/15
- [x] Latência e chamadas de LLM na regressão iguais ou menores
- [x] Fallback para o pipeline se o provider falhar
- [x] Bug de recência coberto por teste de regressão
- [x] ADR-018, C4-002, READMEs e roadmap atualizados

## Riscos

- Variação entre rodadas de medição (uma diferença de 1 acerto é ruído)
- Juiz penaliza datas de 2025 e 2026 como "futuras" (falso negativo)
- Leitura de `docs/architecture/` em produção (somente leitura, degrada com mensagem)

## Referências

- [`ADR-018`](../architecture/ADR-018-tools-estruturadas-recuperar-primeiro-hibrida.md), [`C4-002`](../architecture/C4-002-componentes-backend-tools-mcp.md)
