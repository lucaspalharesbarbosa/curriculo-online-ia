# ADR-010: Fluxo de RAG v2 — precisão de recuperação e acesso à web

## Status
Aceita

## Contexto

O autor reportou que o assistente de chat erra perguntas objetivas básicas sobre a própria trajetória — ex.: **"onde estudei?"** e **"qual a última empresa que trabalhei?"** — e pediu, na mesma frente, que o assistente possa buscar na web dados públicos sobre empresas, instituições de ensino, cursos, certificados e habilidades citados no currículo, quando o `resume.json` sozinho não bastar (`docs/product/PRD-011-rag-inteligente.md`).

### Causa raiz do erro de recuperação

`backend/app/chat.py` e `backend/app/rag.py` implementam o fluxo decidido em `ADR-003`: chunking por seção → embeddings (`text-embedding-3-small`) → busca por similaridade de cosseno pura (`rag.search()`, `TOP_K=3`, `SIMILARITY_THRESHOLD=0.2`) → geração (`gpt-4o-mini`). Não há **nenhum roteamento por seção** (`build_chunks` em `rag.py` gera chunks de `experience`, `education`, `skill`, `project`, `certification`, `recognition`, `article`, mas `search()` os trata como um único espaço vetorial homogêneo) nem **ordenação por recência** (o campo `end_date` de `Experience`, `None` quando o cargo é o atual, nunca é usado para desempatar ou priorizar).

Reproduzindo os dois exemplos:

- **"onde estudei?"** — a similaridade semântica entre a pergunta e um chunk de `education` (ex.: `"Formação: Bacharelado em Ciência da Computação em Universidade X, 2016 a 2020."`) compete, no mesmo espaço vetorial, com chunks de `experience`/`skill` que também mencionam termos educacionais incidentalmente (cursos internos, tecnologias aprendidas). Como `TOP_K=3` e não há nenhum peso por seção, o chunk de `education` nem sempre entra no top-3, ou entra empatado/atrás de chunks de outra seção.
- **"qual a última empresa que trabalhei?"** — todos os chunks de `experience` são semanticamente próximos entre si (mesma estrutura de frase, vocabulário de cargo/tecnologia repetido), então a similaridade de cosseno não diferencia "a mais recente" de "qualquer uma". O LLM recebe até 3 chunks de experiências (possivelmente não incluindo a mais recente, se outra teve score de similaridade marginalmente maior) e não tem como saber qual é "a última" só pelo texto — a ordem de chegada no prompt não é a ordem cronológica.

Em resumo: **busca por similaridade pura resolve bem perguntas específicas** ("já trabalhou com Kubernetes?"), mas **não resolve perguntas que dependem de uma seção certa ou de ordenação temporal**, porque similaridade semântica não é a mesma coisa que "seção correta" ou "mais recente".

### Restrições que moldam a decisão

1. Manter o padrão "RAG simples, do zero" (`ADR-003`, `references/ai-architecture-patterns.md`) — sem banco vetorial, sem LangChain/LlamaIndex, sem reescrever o índice de embeddings já cacheado
2. Backend no Render free tier (512 MB / 0,1 vCPU, uma instância) — qualquer chamada externa nova precisa de timeout curto e nunca travar o único worker (mesmo critério de `ADR-004`)
3. Produto pessoal solo — custo de qualquer serviço novo deve caber num tier gratuito real, sem cartão de crédito surpresa
4. O assistente **não pode virar um agente de busca genérico** — só busca na web quando a pergunta cita uma entidade que já existe no currículo (empresa, instituição, curso, certificado, habilidade) e o RAG local não tem contexto suficiente

## Decisão

### 1. Precisão de recuperação — roteamento por seção + recência (sem mudar o índice)

Adicionar uma camada de **roteamento por intenção** em `rag.py`, executada **antes** da busca por similaridade, sem alterar o formato do índice de embeddings cacheado (`rag_index.json` continua sendo um array plano de `EmbeddedChunk`):

- **Detecção de intenção por palavra-chave**, não por classificador novo: um dicionário pequeno de termos → seção (ex.: `{"estudei", "estudou", "formação", "faculdade", "graduação"} → "education"`; `{"empresa", "trabalho atual", "última empresa", "onde trabalho"} → "experience"`). Quando a pergunta bate em um desses termos, a busca por similaridade é **restrita aos chunks da seção correspondente** antes de aplicar `top_k` — não descarta a similaridade, só reduz o espaço de busca à seção certa primeiro.
- **Desempate por recência para a seção `experience`**: quando a intenção detectada envolve "atual/última/recente", os chunks de `experience` retornados são reordenados por `end_date` (chunk sem `end_date`, ou com a maior data, primeiro) antes de virar contexto do prompt — não é mais só "os 3 mais similares", é "os mais similares, com a mais recente em primeiro quando a pergunta pede recência".
- **Fallback**: pergunta sem palavra-chave reconhecida segue exatamente o comportamento atual (busca por similaridade em todos os chunks, sem restrição de seção) — sem regressão para perguntas específicas que já funcionam hoje (ex.: "já trabalhou com Kubernetes?").

Isso é um refinamento da função `search()` existente (parâmetro opcional de seção-alvo + critério de ordenação), não uma reescrita do fluxo de `ADR-003` — o cache de embeddings, o modelo (`text-embedding-3-small`) e o armazenamento em JSON continuam exatamente como estão.

### 2. Acesso à web — provider, gatilho e contrato

#### Provider: Tavily

| Opção avaliada | Veredito |
|---|---|
| **Tavily** (`api.tavily.com`) | **Escolhida** — API REST simples desenhada especificamente para consumo por LLMs/RAG (retorna conteúdo já resumido/relevante, não HTML cru para parsear); tier gratuito de 1.000 créditos de busca/mês, suficiente para o volume de visitantes ocasionais de um portfólio; sem necessidade de scraping/parsing adicional no backend, mantendo o princípio "RAG simples, do zero" |
| Serper (Google Search API wrapper) | Descartada — também viável, mas retorna resultados brutos de SERP (precisa de mais lógica no backend para extrair conteúdo relevante de cada link); sem vantagem clara sobre o Tavily para este caso de uso |
| Bing Web Search API | Descartada — a Microsoft **aposentou** a família Bing Search APIs (retirement em 2025); não é uma opção viável para uma decisão tomada agora |
| Não implementar busca web | Descartada — é pedido explícito do autor (`PRD-011`), com valor real: enriquecer respostas sobre entidades públicas citadas no currículo |

Variável de ambiente: **`WEB_SEARCH_API_KEY`** — segue o mesmo padrão de nomenclatura de `LLM_API_KEY` (nome pela capacidade, não pelo vendor), só no backend, documentada em `.env.example` (US-11-07).

#### Critério objetivo de quando acionar

A busca web só é acionada quando **as duas condições** abaixo são verdadeiras:

1. `rag.search()` (já com o roteamento da seção 1 aplicado) retorna score de similaridade do melhor chunk **abaixo de `SIMILARITY_THRESHOLD` (0.2)** — ou seja, o RAG local já foi tentado e não achou contexto suficiente
2. A pergunta cita, por correspondência de texto (case-insensitive, substring), o **nome de uma entidade que já existe no `resume.json`** — nome de empresa (`Experience.company`), instituição (`Education.institution`), certificação/curso (`Certification.name`/`issuer`), habilidade (`SkillItem.name`) ou projeto (`Project.title`). Essa lista de entidades é extraída do currículo no momento da indexação (`build_index()`), não hardcoded

Perguntas genéricas sem nenhuma entidade reconhecida **não** acionam busca web — caem no `FALLBACK_ANSWER` atual, exatamente como hoje. Isso é o que impede o assistente de virar um agente de busca genérico.

#### Contrato do `/chat`

O request **não muda**. O response ganha um campo opcional, mantendo compatibilidade:

```
Response 200: { answer: string, source: "resume" | "web" }
```

`source` é `"web"` só quando a resposta usou contexto vindo da busca externa; `"resume"` em todos os outros casos (comportamento atual). O frontend usa esse campo para exibir a atribuição de fonte (US-11-07); clientes que ignorarem o campo continuam funcionando (é aditivo, não *breaking*).

#### Resiliência (mesmo padrão de `ADR-004`)

| Padrão | Decisão |
|---|---|
| Timeout | Explícito e curto (8 s) — busca web é enriquecimento opcional, nunca pode ser o motivo de uma resposta lenta |
| Retry | **Nenhum** — diferente do client OpenAI (`ADR-004`, 1 retry para erro transitório), a busca web é opcional: qualquer falha (timeout, erro do provider, 4xx/5xx) cai direto no fallback, sem gastar uma segunda tentativa numa chamada que não é o caminho principal da resposta |
| Fallback | Falha da busca web nunca vira erro HTTP para o client — `/chat` responde com o contexto local disponível (ou `FALLBACK_ANSWER`, se não houver nenhum), com `source: "resume"` |
| Rate limit | Reaproveita o rate limit por IP já existente no `/chat` (`_is_rate_limited`) — sem limite adicional dedicado, o volume de portfólio não justifica |

### 3. O que não muda

- Índice de embeddings, modelo de embeddings/geração e armazenamento em JSON (`ADR-003`) — inalterados
- Banco vetorial continua fora de escopo
- Nenhuma nova dependência pesada (`openai` já é dependência; cliente Tavily é uma chamada HTTP simples via `httpx`, já presente em `requirements.txt` — sem SDK novo)

## Alternativas consideradas

| Alternativa | Prós | Contras | Veredito |
|---|---|---|---|
| Roteamento por seção/recência + busca web condicional (escolhida) | Resolve a causa raiz sem reescrever o índice; busca web contida a um gatilho objetivo, sem virar agente genérico | Exige manter o pequeno dicionário de palavras-chave atualizado se novas seções/intenções surgirem | **Escolhida** |
| Reescrever a recuperação com um classificador de intenção (LLM call extra para rotear) | Mais flexível a frases não previstas no dicionário | Uma chamada de LLM a mais por pergunta (custo e latência dobrados) para resolver um problema que um dicionário pequeno já resolve nos casos reais reportados — desproporcional | Descartada |
| Aumentar `TOP_K` para reduzir a chance do chunk certo ficar de fora | Mudança de uma linha | Não resolve a causa raiz (falta de seção/recência) — só dilui o contexto com mais chunks irrelevantes e aumenta custo de tokens do prompt | Descartada |
| Busca web sempre que a similaridade for baixa, sem exigir entidade conhecida | Mais simples de implementar (uma condição, não duas) | Transformaria o assistente num agente de busca genérico, respondendo qualquer pergunta não relacionada ao currículo — contraria o objetivo do produto (`PRD-011`, escopo excluído) | Descartada |
| Serper como provider de busca | Também dentro de orçamento | Exige mais lógica de parsing de SERP bruto no backend; Tavily já entrega conteúdo pronto para uso como contexto de LLM | Descartada |

## Consequências

- [US-11-06](../product/backlog/fase-11/US-11-06-precisao-recuperacao-rag.md) implementa o roteamento por seção/recência descrito na seção 1, em `backend/app/rag.py`/`backend/app/chat.py`
- [US-11-07](../product/backlog/fase-11/US-11-07-web-search-fallback.md) implementa o cliente Tavily (`backend/app/web_search.py`) e o acionamento condicional descrito na seção 2, incluindo o campo `source` na resposta do `/chat`
- `WEB_SEARCH_API_KEY` precisa ser gerada no painel do Tavily e configurada no Render (produção) e em `.env.example`/`.env` local (US-11-07) — mesmo processo já documentado para `LLM_API_KEY` em `US-05-09`
- `references/ai-architecture-patterns.md` (seção 1, diagrama do fluxo) deve ganhar uma nota sobre o roteamento por seção e o fallback de busca web quando `US-11-06`/`US-11-07` forem implementadas, para não ficar desatualizado
- Nenhuma mudança em `docs/agents/CONTEXTO-PROJETO.md` — a stack decidida (Next.js/FastAPI/OpenAI) não muda; Tavily é uma dependência de escopo estritamente do fluxo de RAG, não uma mudança de stack do projeto
- Reavaliar esta ADR se: o dicionário de palavras-chave crescer a ponto de ficar difícil de manter (sinal de que um classificador de intenção passaria a valer a pena); o tier gratuito do Tavily deixar de ser suficiente; ou o critério de "entidade conhecida" gerar falsos negativos/positivos frequentes reportados pelo autor

## Referências

- `docs/agents/CONTEXTO-PROJETO.md`
- `.claude/skills/arquiteto-ia-senior/references/ai-architecture-patterns.md`
- [ADR-003](ADR-003-fluxo-rag.md) (fluxo de RAG original — chunking, embeddings, provider)
- [ADR-004](ADR-004-resiliencia-backend-chat.md) (padrão de timeout/retry/fallback reaproveitado aqui)
- `docs/product/PRD-011-rag-inteligente.md`
- [US-11-05](../product/backlog/fase-11/US-11-05-adr-rag-v2-precisao-web.md), [US-11-06](../product/backlog/fase-11/US-11-06-precisao-recuperacao-rag.md), [US-11-07](../product/backlog/fase-11/US-11-07-web-search-fallback.md)
- `backend/app/rag.py`, `backend/app/chat.py`, `backend/app/models/resume.py`
