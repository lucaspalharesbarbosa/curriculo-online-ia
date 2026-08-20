# Artigo 2 — RAG na prática: memória conversacional, chunking e embeddings sem exagero de engenharia

> Lastro: `docs/architecture/ADR-003-fluxo-rag.md`, `ADR-014-memoria-conversacional-chat.md`, `PRD-013-memoria-conversacional-rag.md`, US-15-01/02/03. Publicar como artigo LinkedIn (long-form). Link do chat/projeto no primeiro comentário.

---

No meu portfólio pessoal tem um assistente de chat que responde perguntas sobre a minha própria trajetória profissional — onde trabalhei, o que estudei, com quais tecnologias já mexi. É RAG: Retrieval-Augmented Generation, meu currículo real como base de conhecimento. Nesse artigo eu quero contar três decisões concretas por trás disso — chunking, embeddings e memória conversacional — e por que a mais recente das três (memória) foi a que mais me ensinou sobre RAG de verdade.

## Chunking: resistir à tentação de complicar

Quando comecei a Fase de RAG do projeto, a primeira decisão foi como transformar o `resume.json` em pedaços de texto pesquisáveis. A tentação natural, se você já leu qualquer material sobre RAG, é pensar em chunking de texto livre com overlap, tamanho de janela em tokens, sobreposição entre chunks vizinhos.

Eu não fiz isso. O meu currículo já é dado estruturado — cada experiência, cada grupo de skills, cada projeto já é uma unidade de sentido bem definida. Então a decisão foi chunking por seção: **um chunk por experiência, um por grupo de skills, um por projeto**. Sem overlap, sem chunking de texto corrido. Simples porque o dado de entrada já é simples — e forçar uma técnica pensada para texto não estruturado em cima de um JSON estruturado seria complexidade sem ganho nenhum.

## Embeddings: um vendor, uma chave, sem exagero de infraestrutura

Para gerar os vetores de embedding eu escolhi a OpenAI (`text-embedding-3-small`) e também uso a OpenAI para a geração da resposta (`gpt-4o-mini`). Decisão que parece óbvia mas teve um motivo específico: eu queria usar a Anthropic para a parte de geração, porque é o ecossistema que mais uso hoje — só que a Anthropic não tem API própria de embeddings. Usar dois vendors diferentes (um para gerar, outro para embedar) significaria duas chaves, dois SDKs, dois painéis de billing, para uma feature que processa dezenas de chunks, não milhares. Para um projeto pessoal solo, um único vendor venceu — mesmo sem ser "o mais barato do mundo" isoladamente em cada peça.

O índice de embeddings inteiro é gerado **uma vez** e cacheado em JSON, carregado na inicialização do backend. Nada de banco vetorial: meu backend roda no tier gratuito do Render (512 MB de RAM), o volume é de dezenas de chunks, e reindexar a cada request seria pagar um custo que o problema não pede. Resultado: o custo estimado do RAG inteiro fica na casa de centavos de dólar por mês, mesmo em dia de pico de visita de recrutador.

A lição que fico repetindo para mim mesmo: **a arquitetura certa é a proporcional ao volume real do problema**, não a mais sofisticada que existe.

## O problema que só apareceu depois: o assistente "esquecia" a conversa

O RAG funcionava bem para pergunta isolada. O problema apareceu quando testei uma sequência natural de perguntas: "Onde você trabalha?" — respondia certo, "NA Engineering Brasil". Em seguida: "Onde fica a matriz da empresa?" — e aí ele simplesmente não sabia do que eu estava falando.

Fui investigar a causa raiz e era exatamente o que eu suspeitava: o backend era **stateless por requisição**. A busca vetorial embedava só o texto da pergunta atual — "onde fica a matriz da empresa?" sozinha, sem "NA Engineering Brasil" — então não encontrava o chunk certo no índice. E o LLM recebia só `system prompt + pergunta atual`, sem nenhuma troca anterior, então não tinha como inferir que "a empresa" se referia à resposta de antes. O frontend até mantinha o histórico da conversa localmente, mas nunca o enviava de volta ao backend — o dado existia no cliente e se perdia a cada requisição.

## A decisão: histórico do cliente, sem sessão no servidor

Antes de sair codando o primeiro patch que resolvesse o sintoma, registrei a decisão como ADR — porque não é um ajuste qualquer, é uma mudança no contrato do fluxo de RAG. E a decisão mais importante nem foi técnica, foi de produto: eu **não queria** sessão persistida no servidor. Chat de currículo pessoal não precisa de histórico entre visitas, e persistir sessão traria complexidade (armazenamento, expiração, limpeza) para um ganho que o produto não pede.

A solução ficou assim:

- `ChatRequest` ganhou um campo `history` opcional — lista de mensagens `{role, content}` — retrocompatível: quem não manda o campo continua funcionando exatamente como antes
- Janela deslizante das últimas 3 trocas (6 mensagens), com teto de validação de 20 mensagens / 4000 caracteres por mensagem — acima disso o Pydantic rejeita com 422; entre o teto e a janela funcional, trunca à cauda em vez de rejeitar
- Antes do retrieval, se existe histórico, a pergunta passa por **query condensation**: uma chamada ao LLM reformula a pergunta atual incorporando o contexto necessário — "onde fica a matriz da empresa?" vira algo como "onde fica a matriz da NA Engineering Brasil?" — e é essa versão condensada que é embedada para a busca vetorial, nunca a pergunta crua
- A pergunta original (não a condensada) é preservada para exibição e log — o usuário nunca vê a versão reescrita
- O histórico entra nas mensagens finais enviadas ao LLM, entre o `system prompt` e a pergunta atual
- E o mais importante para mim, como princípio: **se a condensation falhar, cai para a pergunta crua, sem quebrar o chat** — o mesmo padrão de resiliência que já uso em qualquer chamada externa do projeto. Uma feature de conforto nunca pode ser motivo de indisponibilidade.

## Um detalhe que quase passou despercebido e o tech lead (agente) pegou

Durante a revisão dessa implementação, apareceu um achado que eu não tinha visto: o frontend reenviava a **resposta do assistente** como parte do histórico sem truncar. Se uma resposta passasse de 4000 caracteres, a pergunta seguinte quebraria com 422 — porque o teto de validação vale para qualquer mensagem do histórico, inclusive as do assistente, não só as minhas. Foi corrigido antes de eu aceitar a entrega. É exatamente o tipo de achado pequeno, fácil de esquecer, que uma revisão dedicada existe para pegar.

## O que eu levo disso para qualquer RAG que eu for construir de novo

Três princípios que vou repetir em qualquer produto de IA que eu construir depois deste:

1. **Chunking segue a estrutura real do dado** — não a técnica mais falada sobre o assunto
2. **Escolha de vendor é decisão de produto, não só de qualidade de modelo** — para volume baixo, menos vendors quase sempre vence sobre "o melhor modelo isolado de cada peça"
3. **Memória conversacional não precisa de sessão persistida** — histórico do cliente, reenviado a cada request, resolve o problema real (correferência entre turnos) sem o custo operacional de guardar estado no servidor

No próximo artigo da série eu conto o que aconteceu quando "buscar por similaridade" parou de ser suficiente — o assistente errava perguntas básicas tipo "onde estudei?" mesmo com o RAG funcionando certo, e a causa raiz não era o que eu esperava.

#AIEngineering #RAG #EngenhariaDeIA #LLM #PortfolioProject
