# Artigo 1 — Loop Engineering: como fiz meus agentes de IA corrigirem os próprios erros até o merge

> Lastro: `docs/architecture/ADR-015-loop-engineering-pipeline.md`. Publicar como artigo LinkedIn (long-form). Link do projeto no primeiro comentário.

---

Nos últimos meses eu venho construindo meu portfólio pessoal — um site de currículo com um assistente de chat que responde perguntas sobre a minha própria trajetória — usando algo que decidi levar a sério: um pipeline de agentes de IA especializados, cada um com um papel bem definido. Um faz de Product Owner. Outro de arquiteto. Outro implementa. Outro testa. Outro revisa código como tech lead. Eu fico no topo, como dono técnico do produto.

Esse formato já me ensinou muita coisa, mas o aprendizado que eu quero contar hoje foi o que mais mudou a velocidade real do projeto: parar de tratar cada etapa do pipeline como uma parada obrigatória e começar a tratá-la como um **loop**.

## O problema que eu não tinha percebido

No começo, o fluxo era mais ou menos assim: o dev implementa, o QA testa, o tech lead revisa. Se o QA reprovava ou o tech lead pedia mudança, o protocolo mandava parar e esperar eu voltar para decidir o que fazer.

Isso parece prudente. Na prática, é desperdício.

Porque a maioria das reprovações não era uma decisão que dependia de mim. Era um teste quebrado. Uma cobertura abaixo do piso combinado. Um erro de lint. Um contrato que já estava documentado e só não bateu na implementação. Coisas **objetivamente corrigíveis**, com um sinal de verificação claro — o próprio `pytest`, o próprio `eslint`, a própria suíte de cobertura já diziam exatamente o que estava errado. E mesmo assim o pipeline parava e ficava esperando eu aparecer para autorizar o óbvio.

O mesmo acontecia depois do push: se o CI do GitHub Actions falhava, era eu quem ia lá, lia o log, entendia o erro e corrigia. Todo esse trabalho manual, para um problema que o próprio agente que escreveu o código tinha toda a informação para resolver sozinho.

## A virada: tratar sinal verificável como loop, não como parada

A ideia de Loop Engineering, no fundo, é simples: **toda ação do pipeline que produz um sinal de feedback rápido e verificável não deveria depender de mim para ser corrigida — deveria ser corrigida, testada de novo e só então seguir em frente**, sozinha, quantas vezes forem necessárias dentro de um limite razoável.

Formalizei isso em três níveis de loop:

**Loop interno da fase.** Dentro do próprio desenvolvimento — lint, teste unitário, build, type-check. O agente que está implementando corrige e reexecuta sem nem sair da própria etapa.

**Loop entre fases.** Quando o QA reprova ou o tech lead pede mudança com um achado estruturado (não uma opinião solta, um veredito com evidência), o orquestrador reabre a fase de desenvolvimento automaticamente, passa o achado, e o ciclo roda de novo — sem eu precisar aparecer no meio.

**Loop de CI.** Depois do push, se o GitHub Actions falha, o agente lê o log da falha, diagnostica, corrige e faz o repush sozinho.

## O único ponto onde eu insisti em ficar no controle

Autonomia de ponta a ponta não significa autonomia sem limite. Existe **um único gate humano, não-negociável**: o merge de `develop` para `main`. É o momento em que o deploy de produção real acontece — a ação de maior "blast radius" de todo o pipeline. Nesse ponto, e só nesse ponto, o orquestrador para, me mostra o relatório completo do que foi feito em cada fase, com evidência, e espera minha confirmação explícita.

Tudo antes disso — implementar, testar, corrigir, revisar, resolver reprovação, corrigir CI — roda sozinho, desde que cada etapa tenha um sinal objetivamente verificável para se basear.

E teve mais um cuidado que achei importante deixar explícito, porque autonomia sem regra de escalonamento vira o oposto de confiabilidade: **no máximo três tentativas por loop**. Na terceira falha sem convergir, o loop para e me escala o histórico completo — o que foi tentado, o que falhou, o diagnóstico. Se a mesma falha se repete com a mesma assinatura (mesmo teste, mesmo erro), nem espera as três tentativas — escala na hora, porque insistir do mesmo jeito não vai destravar nada. E código sensível — chave de API, CORS, segredo — nunca entra em loop automático, ponto final, sempre revisão humana.

## O que isso muda de verdade

O ganho não é só velocidade, embora seja bastante velocidade — deixar de esperar eu aparecer para autorizar a correção de um teste quebrado é tempo puro devolvido. O ganho maior é **onde a minha atenção é gasta**.

Antes, eu era interrompido tanto para decisões que exigiam meu julgamento real (qual variante de protótipo escolher, uma ambiguidade de escopo, uma troca de stack) quanto para decisões que não exigiam julgamento nenhum (um lint quebrado tem uma resposta certa, não uma opinião). Depois de aplicar Loop Engineering, só sou chamado para o primeiro grupo — e para o único gate que decidi manter sempre humano, o merge em produção.

Isso não é terceirizar julgamento. É reconhecer que "revisar cada correção de lint" nunca foi julgamento — era fricção disfarçada de cuidado.

## Por que estou contando isso

Esse projeto é meu laboratório real de IA Engineering — não é side project decorativo, é onde eu testo, na prática, que tipo de processo realmente funciona quando você constrói produto de IA sozinho, sem equipe, com sinal de verificação real (testes, cobertura, CI) já disponível e subaproveitado.

No próximo artigo da série eu conto o que esse pipeline efetivamente construiu: como cheguei na estratégia de RAG do projeto — chunking, embeddings, e principalmente a memória conversacional que faltava para o assistente entender uma pergunta de acompanhamento como "onde fica a matriz da empresa?" depois de "onde eu trabalho?".

#AIEngineering #EngenhariaDeIA #LLM #DesenvolvimentoDeSoftware #PortfolioProject
