# ADR-003: Fluxo de RAG (chunking, embeddings, geração, custo)

## Status
Aceita

## Contexto

A Fase 05 (RAG) implementa o diferencial de AI Engineering do projeto: um assistente de chat que responde perguntas sobre a trajetória do autor com base no `resume.json` real (`docs/product/PRD-003-rag.md`). [US-05-01](../product/backlog/archive/fase-05/US-05-01-adr-fluxo-rag.md) — esta história — **bloqueia** todas as demais da fase (US-05-02 a US-05-07): nenhuma delas pode decidir sozinha estratégia de chunking, provider de embeddings ou onde fica a chave de API, sob risco de reabrir a decisão a cada história.

`docs/agents/CONTEXTO-PROJETO.md` já fixa o desenho de alto nível — chunking do `resume.json` → embeddings → similaridade em memória/JSON, sem banco vetorial — e `references/ai-architecture-patterns.md` (arquiteto) detalha o padrão. Falta apenas a decisão concreta de **qual provider de embeddings/LLM** usar e **onde ficam as chaves**, que é o objeto desta ADR.

**Restrições do projeto que moldam a decisão:**

1. Produto pessoal solo — sem orçamento de infraestrutura de IA; custo deve ficar próximo de $0 em uso real (visitantes ocasionais de portfólio, não tráfego de produto)
2. Backend roda no **Render free tier** (512 MB RAM / 0,1 vCPU, cold start ~30–60 s — [ADR-002](ADR-002-hospedagem-gratuita.md)) — descarta qualquer opção que exija carregar um modelo pesado (ex.: `sentence-transformers` + PyTorch) em memória
3. Volume de conteúdo é baixíssimo — dezenas de chunks do currículo, não milhares de documentos
4. RAG "do zero", sem LangChain/LlamaIndex nem banco vetorial gerenciado (`references/ai-architecture-patterns.md`)
5. Complexidade proporcional a projeto solo: menos vendors/chaves para gerenciar é melhor, mesmo que um único vendor não seja o "mais barato do mundo" em cada peça isolada

**Levantamento que motivou esta ADR:** a Anthropic (Claude) **não oferece API de embeddings própria** — só Messages API, Batches, Files, Token Counting e Models. Qualquer decisão que use Claude para geração de resposta ainda precisa de um provider de embeddings à parte.

## Decisão

### 1. Chunking

Chunking **por seção estruturada** do `resume.json` — cada experiência, cada grupo de skills e cada projeto vira um chunk próprio (1–3 frases). Não há chunking de texto livre nem overlap: o `resume.json` já é estruturado e o volume é baixo, então chunking semântico por campo é natural e barato (`references/ai-architecture-patterns.md`, seção 2).

### 2. Embeddings e geração — provider único (OpenAI)

| Uso | Escolha | Modelo |
|---|---|---|
| Embeddings | **OpenAI** | `text-embedding-3-small` |
| Geração de resposta (LLM) | **OpenAI** | `gpt-4o-mini` (ou modelo mini equivalente vigente no momento da implementação) |

Um único vendor para embeddings **e** geração — não dois. Critério decisivo para um projeto solo: **um provider, uma chave, um SDK, um painel de billing**, em vez de gerenciar Anthropic (geração) + OpenAI/Voyage (embeddings, já que a Anthropic não tem API própria) como dois vendors distintos para uma feature de baixíssimo volume.

### 3. Armazenamento

Array em memória, gerado uma vez e cacheado em JSON (`backend/app/rag_index.json` ou equivalente) — carregado na inicialização do backend. Reindexar só quando `resume.json` mudar (script manual ou hook de build), nunca a cada request. Sem banco vetorial (`references/ai-architecture-patterns.md`, seção 3).

### 4. Custo estimado

Volume esperado: dezenas de chunks (embedding gerado **uma vez**, não por request) + visitantes ocasionais fazendo poucas perguntas por sessão.

| Item | Estimativa |
|---|---|
| Embeddings (dezenas de chunks, gerados 1x + reindexação ocasional) | Centavos de dólar por ano — `text-embedding-3-small` é cobrado por token de entrada, na faixa de US$ 0,02 por milhão de tokens |
| Embedding da pergunta do visitante (1 por pergunta) | Irrelevante — poucos tokens por request |
| Geração de resposta (`gpt-4o-mini`, poucos milhares de tokens por conversa) | Ordem de US$ 0,001–0,01 por conversa completa, mesmo em dias de pico de visitas de recrutadores |

Custo total esperado: **sub-dólar por mês**, mesmo com tráfego de lançamento do portfólio. Preços exatos devem ser confirmados no momento da implementação (US-05-03/US-05-04) direto na página de pricing do provider, já que tendem a cair com o tempo — a ordem de grandeza aqui é o que importa para a decisão, não o valor exato.

### 5. Onde fica a chave de API (CA-002)

A chave (`LLM_API_KEY`, cobrindo embeddings + geração já que é o mesmo provider) fica **só no backend FastAPI**, como variável de ambiente — nunca em código, nunca no bundle do frontend/client. Em produção, configurada no painel do Render (`docs/product/backlog/archive/fase-05/US-05-09-env-vars-segredos.md` documenta o `.env.example` e o passo a passo). Não há necessidade de Serverless Function/BFF intermediário na Vercel: o frontend já fala com o backend FastAPI via HTTPS (mesmo padrão de CORS do restante do projeto), e é o FastAPI — não o Next.js — quem faz as chamadas ao provider de IA.

## Alternativas consideradas

| Alternativa | Prós | Contras | Veredito |
|---|---|---|---|
| **OpenAI para embeddings + geração** (`text-embedding-3-small` + `gpt-4o-mini`) | Um único vendor/chave/SDK; API de embeddings nativa; custo desprezível no volume do projeto; modelos "mini" já otimizados para tarefas simples como Q&A sobre um currículo | Não é o modelo de geração mais capaz do mercado — irrelevante aqui, a tarefa é responder perguntas sobre um documento curto | **Escolhida** |
| **Anthropic (Claude Haiku 4.5) para geração + OpenAI/Voyage AI só para embeddings** | Claude é ótimo em seguir instruções e tem custo baixo ($1/$5 por MTok no Haiku 4.5); mostra domínio do ecossistema Anthropic no portfólio | A Anthropic **não tem API de embeddings** — obrigaria um segundo vendor só para essa peça, dobrando chaves/SDKs/paineis de billing para uma feature de baixíssimo volume; complexidade extra sem ganho de qualidade perceptível na tarefa (responder sobre um currículo, não raciocínio complexo) | Descartada — mais vendors do que o projeto justifica |
| **Modelo de embeddings local** (`sentence-transformers`, ex. `all-MiniLM-L6-v2`) | Custo $0 de API; sem dependência de rede para embeddings | `sentence-transformers` + PyTorch facilmente ultrapassam os 512 MB de RAM do Render free tier ([ADR-002](ADR-002-hospedagem-gratuita.md)); aumenta tempo de build/deploy e cold start; complexidade de empacotamento incompatível com "RAG simples, do zero" | Descartada para o MVP — reconsiderar só se o Render free tier deixar de ser viável por outro motivo |
| **Google Gemini (embeddings + geração)** | Também oferece embeddings nativos; tier gratuito generoso | Terceiro ecossistema de SDK/autenticação no projeto sem motivo forte; nenhuma vantagem sobre OpenAI no critério de custo/simplicidade para este volume | Descartada — não agrega sobre a opção já simples da OpenAI |
| **Banco vetorial gerenciado** (Pinecone, Qdrant Cloud, pgvector) | Escala bem, busca por similaridade otimizada | Complexidade e (em geral) custo incompatíveis com dezenas de chunks; contraria `references/ai-architecture-patterns.md` explicitamente | Descartada — só reconsiderar se o volume de conteúdo crescer muito (item já previsto no plano) |

## Consequências

- [US-05-02](../product/backlog/archive/fase-05/US-05-02-chunking-resume-json.md) implementa o chunking por seção descrito aqui
- [US-05-03](../product/backlog/archive/fase-05/US-05-03-geracao-embeddings.md) usa `text-embedding-3-small` da OpenAI, cacheado em JSON
- [US-05-04](../product/backlog/archive/fase-05/US-05-04-endpoint-chat.md) usa `gpt-4o-mini` da OpenAI para geração, chamado via `httpx` assíncrono com timeout curto (`references/ai-architecture-patterns.md`, seção 5)
- [US-05-09](../product/backlog/archive/fase-05/US-05-09-env-vars-segredos.md) documenta `LLM_API_KEY` no `.env.example` do backend e no README de deploy
- `backend/requirements.txt` ganha a dependência do SDK oficial da OpenAI (`openai`) quando US-05-03/US-05-04 forem implementadas
- Nenhuma chave de API é exposta no client — todas as chamadas de IA passam pelo FastAPI
- Reavaliar esta ADR (novo ADR) se: o volume de conteúdo crescer a ponto de justificar banco vetorial; o custo real observado destoar da estimativa; ou o Render free tier deixar de comportar o backend, forçando reconsiderar a decisão de embeddings locais

## Referências

- `docs/agents/CONTEXTO-PROJETO.md` (seção RAG)
- `.claude/skills/arquiteto-ia-senior/references/ai-architecture-patterns.md`
- `docs/product/PRD-003-rag.md`
- [ADR-002](ADR-002-hospedagem-gratuita.md) (restrições de memória do Render free tier)
- [US-05-01](../product/backlog/archive/fase-05/US-05-01-adr-fluxo-rag.md), [US-05-02](../product/backlog/archive/fase-05/US-05-02-chunking-resume-json.md), [US-05-03](../product/backlog/archive/fase-05/US-05-03-geracao-embeddings.md), [US-05-04](../product/backlog/archive/fase-05/US-05-04-endpoint-chat.md), [US-05-09](../product/backlog/archive/fase-05/US-05-09-env-vars-segredos.md)
