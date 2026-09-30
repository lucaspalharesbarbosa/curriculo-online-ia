# ADR-020: Perguntas básicas, listas completas e markdown no chat

## Status
Aceita

## Contexto

Com o chat no ar, o autor reportou dois defeitos visíveis: o assistente errava perguntas básicas ("onde ele mora?", "qual o e-mail?", "qual o LinkedIn?", "quais certificações ele tem?") e o `**negrito**` das respostas aparecia com os asteriscos literais.

Reproduzindo com o modelo real (tool calling ligado, como em produção), as causas foram quatro, todas de engenharia e nenhuma do modelo:

1. **Dado fora do índice.** Cidade (`hero.location`), cargo (`hero.title`) e contatos (`contact`) não viravam chunk nem eram acessados por nenhuma tool. A resposta certa não existia para o retrieval. O golden-set não pegava isso: nenhuma das 24 perguntas era de contato ou localização.
2. **`TOP_K=3` truncando listas.** O retrieval devolve 3 chunks. Para "quais certificações?" (9 no currículo) o modelo recebia 3 e respondia "as certificações são" com 2. Para skills (11 grupos), idem. A resposta saía confiante e incompleta.
3. **Roteamento por seção limitado.** O dicionário de intenção (`ADR-010`) só conhecia `experience` e `education`. Perguntas sobre contato, certificações, artigos ou "quem é ele" dependiam só de similaridade.
4. **Markdown tratado como texto.** `ChatMessage` renderizava `message.answer` num `<p>` com `whitespace-pre-line`. O modelo responde em markdown por natureza, então `**texto**`, listas e links chegavam crus.

Além disso, o juiz do golden-set não recebia a data de hoje e reprovava respostas corretas com datas de 2025 (q18/q21).

## Decisão

### 1. Completar o índice
- O chunk `summary` passa a incluir nome, cargo (só a parte do título antes do travessão) e cidade.
- Novo chunk `contact`: e-mail, LinkedIn, GitHub e WhatsApp, os mesmos links públicos do cabeçalho do site. `Contact` ganha `whatsapp` opcional. `contact` entra nas seções aceitas pela tool `search_resume`.
- `resume_hash` passa a cobrir também o texto dos chunks gerados. Antes só o conteúdo do `resume.json` era hasheado, então um índice antigo em disco sobreviveria a uma mudança de chunking e ignoraria o chunk novo. Teste de regressão incluído.

### 2. Roteamento por intenção ampliado
`SECTION_INTENT_KEYWORDS` ganha `contact`, `summary` (cidade, "quem é", "fala sobre ele"), `certification`, `article`, `recognition`, `project` (só o plural, para não capturar "este projeto", que é assunto de ADR) e `skill`. Educação e experiência continuam primeiro na ordem de avaliação.

### 3. Listas inteiras
Nas seções de lista (`certification`, `article`, `recognition`, `project`, `skill`), `search_with_routing` amplia o `top_k` para o tamanho da seção, com teto `MAX_LIST_TOP_K=12`.

**Guarda de empresa:** se a pergunta cita uma empresa do currículo ("que skills usei no Itaú?"), o roteamento para seção de lista é ignorado, porque a resposta está no chunk da experiência. Sem essa guarda, o golden-set q03 regrediria.

### 4. Markdown no chat
Renderizador próprio e mínimo (`modules/chat/lib/markdown.tsx`): `**negrito**`, `__negrito__`, `*itálico*`, `` `código` ``, listas com marcadores e numeradas, parágrafos e links `http(s)`. Sem dependência nova (orçamento de JS da home, `US-08-10`) e sem `dangerouslySetInnerHTML`: tudo vira elemento React, então HTML na resposta é exibido como texto. Link `javascript:` não vira link.

### 5. Prompt e avaliação
- `TOOLS_SYSTEM_PROMPT` proíbe afirmar "primeiro emprego", "anterior" ou "atual" a partir de um trecho solto (o modelo inventou "começou na WebPic").
- O golden-set (24 para 32 perguntas) ganha 8 perguntas da categoria `basicas` (cidade, e-mail, LinkedIn, GitHub, certificações, reconhecimentos, artigos, cargo) e o juiz passa a receber a data de hoje.

## Alternativas Consideradas

- **`react-markdown`:** completo, porém adiciona dependência e payload ao chat para cobrir um subconjunto pequeno. Reavaliar se o assistente passar a responder com tabelas ou blocos de código.
- **Subir o `TOP_K` global:** simples, mas piora a precisão das perguntas pontuais (mais ruído no contexto) e o custo de tokens em toda pergunta. O aumento só onde a pergunta pede lista é mais barato.
- **Uma tool `get_contact`:** exata, mas o dado já cabe num chunk e o retrieval responde sem gastar um turno de tool.
- **Pedir ao modelo para não usar markdown:** trata o sintoma e empobrece a resposta (listas ajudam a leitura).

## Consequências

- (+) Perguntas básicas de identidade e contato passam a ter resposta ancorada no currículo.
- (+) Listas saem completas.
- (+) `**negrito**`, listas e links renderizam; testes automatizados cobrem o renderizador, a integração no chat, o roteamento e o teto de itens.
- (-) `detect_section_intent` agora tem mais keywords por tokens e pode, em casos raros, rotear errado (ex.: "perfil" fora do contexto do currículo). Mitigado pela guarda de empresa e pela bateria de roteamento em `tests/chat/test_rag_basic_questions.py`.
- (-) Seções de lista trazem até 12 chunks, o que aumenta o contexto nessas perguntas.
- (-) O renderizador de markdown não cobre tabelas, cabeçalhos nem blocos de código. O que não reconhece aparece como texto, sem quebrar.
- Medição (golden-set, tool calling): de 21/24 (88%) para 30/32 (94%). As 2 falhas restantes (q02, q29) são falsos negativos do juiz: li as respostas e estão corretas (q29 lista as 9 certificações).
- Limite da medição: as 8 perguntas novas foram escritas pelo autor do sistema, e o golden-set varia cerca de 1 acerto entre rodadas por conta do modelo.

## Referências

- [ADR-010](ADR-010-fluxo-rag-v2-precisao-web.md), [ADR-013](ADR-013-correcao-roteamento-rag-e-melhorias-chunking.md), [ADR-016](ADR-016-rag-agentico-auto-critica.md), [ADR-018](ADR-018-tools-estruturadas-recuperar-primeiro-hibrida.md), [ADR-019](ADR-019-redesign-command-center-chat-com-tools.md)
- Código: `backend/app/chat/rag.py`, `backend/app/chat/service.py`, `frontend/modules/chat/lib/markdown.tsx`
- Testes: `backend/tests/chat/test_rag_basic_questions.py`, `frontend/modules/chat/lib/markdown.test.tsx`, `frontend/modules/chat/components/ChatAside.test.tsx`
