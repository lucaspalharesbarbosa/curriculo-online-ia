# Padrões de Arquitetura de IA — RAG do Currículo Online

> Este é o **material central** do projeto (seção 3 do plano), não um anexo opcional. O objetivo é um RAG **simples, construído do zero**, sobre o `resume.json` — sem framework pesado (LangChain/LlamaIndex) e sem banco vetorial de verdade.

---

## 1. Arquitetura do RAG deste projeto

```
[resume.json] → [Chunking por seção] → [Embedding Model] → [Array em memória/JSON]
                                                                    ↓
     [Pergunta do visitante] → [Embedding Model] → [Similaridade de cosseno] → [Top-K chunks]
                                                                                      ↓
                                                        [LLM] ← [Prompt + chunks como contexto]
                                                          ↓
                                                     [Resposta]
```

## 2. Chunking

| Estratégia | Uso neste projeto |
|---|---|
| Por seção | Cada experiência, skill-group e projeto vira um chunk próprio — o `resume.json` já é estruturado, então chunking semântico por campo é natural |
| Tamanho | Pequeno (1-3 frases por chunk) — volume total do currículo é baixo, não precisa de overlap nem chunking hierárquico |

Não usar fixed-size/overlap de documentos longos — não se aplica a um JSON estruturado e pequeno.

## 3. Embeddings e armazenamento

- Gerar embeddings **uma vez** (na inicialização do backend ou via script), cachear em arquivo (JSON/pickle) — não recalcular a cada request
- Armazenamento: **array em memória carregado do JSON** — o volume (dezenas de chunks) não justifica pgvector/Pinecone/Weaviate/Qdrant
- Reindexar só quando `resume.json` mudar

## 4. Geração de resposta

1. `chat.py` recebe a pergunta
2. `rag.py` calcula o embedding da pergunta e retorna os top-k chunks mais similares (cosseno)
3. `chat.py` monta o prompt (pergunta + chunks) e chama o LLM
4. Resposta retorna ao frontend

## 5. Integração com APIs de IA (Python/FastAPI)

Padrões de resiliência avaliados e decididos em `ADR-004` — resumo aplicado ao client OpenAI (`rag.get_client()`):

- **Timeout**: explícito e curto (ordem de segundos) no client — o SDK OpenAI sem override usa default na casa de minutos, o que trava o único worker do Render free tier numa chamada lenta
- **Retry**: no máximo 1 tentativa extra, só para erro transitório do provider (429/503), sem backoff exponencial — o timeout curto já limita o custo de esperar. Isso é o "sem retry agressivo": uma tentativa extra bem escopada, não múltiplas com backoff
- Erro 429/5xx que sobrar após o retry único vira mensagem de fallback amigável ("não consegui responder agora, tente de novo"), não propagação de stack trace
- Credenciais via variável de ambiente (`LLM_API_KEY`) — nunca hardcoded, nunca no client
- **Rate limiter** (por IP, em memória, US-05-07) e **cache-aside** do índice de embeddings (calculado uma vez, cacheado em JSON, US-05-03) já cobrem seus respectivos padrões — nada novo a fazer aqui
- **Circuit breaker** e **bulkhead** avaliados e descartados por ora (`ADR-004`): uma única dependência externa, um único endpoint, uma única instância de baixo tráfego não justificam a complexidade desses padrões — reavaliar só diante de evidência real de necessidade, não por completude teórica

## 6. Custo e latência

| Preocupação | Como tratar neste projeto |
|---|---|
| Custo | Volume baixo (visitantes ocasionais) — modelo de embedding/chat mais barato é suficiente |
| Latência | Cache de embeddings elimina o maior custo; resposta do LLM é o gargalo natural — aceitável sem streaming no MVP |
| Streaming | Opcional, só se quiser melhorar percepção de velocidade — SSE simples do FastAPI, sem introduzir WebSocket |

## 7. Observabilidade (proporcional)

Não é necessário OpenTelemetry/tracing para este projeto. Suficiente:
- Log simples de cada pergunta + tempo de resposta + erro (se houver)
- Acompanhar manualmente custo/uso no painel do provider

## 8. RAG vs. fine-tuning

| Critério | RAG (escolhido) | Fine-tuning |
|---|---|---|
| Dados dinâmicos (currículo muda) | Ideal — só atualiza `resume.json` | Exigiria retreino a cada atualização |
| Custo/complexidade | Baixo, adequado a um projeto de portfólio | Alto, não se justifica aqui |
| Auditabilidade | Resposta rastreável aos chunks usados | Caixa-preta |

## 9. Fora de escopo deste projeto

- Agentes com tool-calling / ReAct — o assistente só responde perguntas sobre o currículo, não executa ações
- MLOps / pipeline de treino — não há modelo próprio, só chamadas a uma API de LLM
- Banco vetorial gerenciado — reconsiderar **apenas** se o conteúdo crescer muito além de um currículo pessoal (registrar em ADR se isso acontecer)
