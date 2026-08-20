# ADR-013: Correção do roteamento por seção do RAG + melhorias de chunking (guia AWS)

## Status
Aceita

## Contexto

O autor reportou que a primeira pergunta testada no chat de produção — **"Onde Lucas trabalha hoje?"** — foi respondida incorretamente: *"Lucas atualmente trabalha como Web Developer na Shift"*, uma experiência encerrada em 2022, em vez de *"Tech Lead na Engineering Brasil"*, a experiência atual (`endDate: null` em `frontend/content/resume.json`).

### Causa raiz

O roteamento por seção/recência decidido em [ADR-010](ADR-010-fluxo-rag-v2-precisao-web.md) (`backend/app/chat/rag.py`, `detect_section_intent`) casava a pergunta contra um dicionário de palavras-chave por **substring literal** (`keyword in normalized_question`). A pergunta normalizada foi `"onde lucas trabalha hoje?"` — a palavra **"lucas"**, inserida entre "onde" e "trabalha", quebrou a adjacência exigida pela keyword `"onde trabalha"`. Nenhuma keyword do dicionário bateu, então `detect_section_intent` retornou `None`, o que desligou em cascata:

1. A restrição de busca à seção `experience` (`section=None` em `search_with_routing`)
2. O desempate por recência (`sort_by_recency` só é avaliado quando `section == "experience"`)

Sem esses dois filtros, a pergunta caiu em busca por similaridade de cosseno pura e irrestrita — exatamente o comportamento pré-ADR-010 que aquela ADR já havia identificado como causa do bug original de "última empresa". O chunk da Shift venceu por proximidade textual, sem nenhum boost de recência para corrigir.

Nenhum teste existente cobria uma pergunta com o nome do currículo inserido no meio da frase (todos usavam "você" — ex. "Onde você trabalha atualmente?") — um gap real, já que perguntar pelo nome da pessoa ("Onde Lucas trabalha?") é o padrão natural num chat sobre alguém específico, mais natural até que "onde você trabalha".

Adicionalmente, o autor pediu para avaliar o guia da AWS *"Prescriptive Guidance — Writing best practices to optimize RAG applications"* e aplicar o que fizesse sentido para este projeto.

## Decisão

### 1. Casamento por conjunto de tokens em vez de substring literal

`detect_section_intent` (`backend/app/chat/rag.py`) passa a comparar a pergunta contra cada keyword por **conjunto de tokens** (`_tokenize`, via `re.findall(r"\w+", ...)`): a keyword bate se todas as suas palavras existem em qualquer posição da pergunta, não mais adjacentes. "onde trabalha" agora bate com "onde **Lucas** trabalha hoje" porque os tokens `{"onde", "trabalha"}` são subconjunto dos tokens da pergunta.

Mantém o espírito do ADR-010 ("dicionário pequeno de keywords, não um classificador novo") — só troca o algoritmo de casamento, sem mudar a arquitetura de roteamento nem o índice de embeddings.

### 2. Invalidação do cache do índice por hash do `resume.json`

Achado secundário durante a investigação: `load_or_build_index` só checava `path.exists()` para decidir se reaproveitava o cache (`rag_index.json`, gitignored) — uma edição no `resume.json` não invalidava um índice já cacheado em disco, exigindo apagar o arquivo manualmente ou reiniciar o processo para refletir a mudança.

`resume_hash(resume)` calcula um SHA-256 do `Resume` serializado; `save_index`/`load_index` agora carregam esse hash junto com os chunks (`{"resume_hash": ..., "chunks": [...]}`, com fallback para o formato antigo — lista solta — por compatibilidade); `load_or_build_index` reconstrói o índice sempre que o hash salvo não bate com o hash do `resume.json` atual.

### 3. Melhorias de chunking inspiradas no guia da AWS

Avaliação do guia da AWS contra a arquitetura atual: como o `resume.json` já é dado estruturado (não PDF/manual bruto), a maior parte do guia — headings/metadados em documentos crus, tratamento de imagens/gráficos — não se aplica; o chunking 1-por-entidade com `Chunk.section` como metadado já é, na prática, o que a AWS recomenda fazer manualmente em texto não estruturado. Dois pontos, porém, eram aplicáveis e de baixo esforço:

- **Resumos após cada seção → chunk de resumo/bio.** `Resume.hero.summary` e `Resume.about` são texto livre que já descreve a atuação atual em prosa (ex. *"Atualmente lidera tecnicamente squads na Engineering Brasil..."*), mas `build_chunks()` nunca gerava chunk a partir deles — esse sinal redundante forte para perguntas gerais ficava invisível à busca. Novo `_chunk_resume_summary` gera um chunk `section="summary"` a partir dos dois campos.
- **Listas bem formatadas → highlights como bullets.** `_chunk_experience` fazia `" ".join(experience.highlights)`, achatando a lista em uma frase corrida. Passa a gerar `"\n".join(f"- {h}" for h in highlights)`, preservando a estrutura de itens distintos no texto do chunk.

O chunk de resumo **não** entra no roteamento por seção (`SECTION_INTENT_KEYWORDS`) — é um sinal adicional na busca por similaridade geral, não uma seção alvo de keyword, para não expandir o escopo do roteamento por palavra-chave além do que este ADR se propõe a resolver.

### 4. Cobertura de teste ampliada

`backend/tests/chat/test_rag.py` ganhou uma bateria parametrizada cobrindo múltiplas formas de perguntar sobre experiência atual e formação — incluindo variações com nome próprio/pronome inserido entre as palavras da keyword — mais um teste de ponta a ponta (`search_with_routing`) que reproduz o cenário exato do bug relatado (chunk antigo com similaridade de cosseno maior que o chunk atual) para várias dessas frases, e um teste de invalidação de cache por hash do `resume.json`.

## Alternativas consideradas

| Alternativa | Prós | Contras | Veredito |
|---|---|---|---|
| Casamento por conjunto de tokens (escolhida) | Resolve a causa raiz de forma geral (qualquer palavra inserida), baixo risco de regressão, mantém o dicionário simples do ADR-010 | Mais permissivo que substring — tokens espalhados na frase podem casar sem relação direta entre si | **Escolhida** |
| Regex com wildcard entre as palavras de cada keyword (ex. `onde.*trabalha`) | Também resolve o caso relatado | Mais frágil para manter (cada keyword vira um padrão regex, não uma string simples) e não generaliza para inserções antes da primeira palavra da keyword | Descartada |
| Classificador de intenção via LLM | Mais flexível a frases não previstas | Uma chamada de LLM a mais por pergunta (custo/latência) para resolver um problema que o dicionário já resolve com o ajuste de casamento — desproporcional, mesmo argumento do ADR-010 | Descartada |
| Reescrever todo o guia da AWS (headings sintéticos, sumários por seção, tratamento de imagem) | Mais alinhado ao guia na íntegra | A maior parte não se aplica a dado JSON já estruturado; teria sido esforço sem ganho real, ou pior, chunking artificialmente mais verboso sem necessidade | Descartada |

## Consequências

- `backend/app/chat/rag.py`: `detect_section_intent`/`_tokenize` (casamento por token), `resume_hash`/`load_cached_resume_hash`/`load_or_build_index` (invalidação de cache), `_chunk_resume_summary` e `build_chunks` (chunk de resumo), `_chunk_experience` (highlights como lista)
- `backend/tests/chat/test_rag.py`: bateria parametrizada de regressão para o bug relatado + testes de invalidação de cache + testes do novo chunk de resumo/highlights estruturados
- Formato de `rag_index.json` (gitignored, regenerado sob demanda) muda de lista solta para `{"resume_hash": ..., "chunks": [...]}`; `load_index` mantém compatibilidade com o formato antigo por `isinstance` check, então um cache de produção pré-existente não quebra — só é tratado como "hash desconhecido" e reconstruído uma vez
- Reavaliar esta ADR se: o dicionário de palavras-chave continuar crescendo a ponto de o casamento por token gerar falsos positivos reportados na prática (sinal de que valeria um classificador de intenção, mesmo trade-off já descartado no ADR-010); ou se novas seções do currículo precisarem do mesmo tratamento de "resumo/bio" aplicado aqui só a `hero.summary`/`about`

## Referências

- [ADR-003](ADR-003-fluxo-rag.md) (fluxo de RAG original)
- [ADR-010](ADR-010-fluxo-rag-v2-precisao-web.md) (roteamento por seção/recência — decisão que este ADR corrige)
- `backend/app/chat/rag.py`, `backend/tests/chat/test_rag.py`
- AWS Prescriptive Guidance — *Writing best practices to optimize RAG applications*
