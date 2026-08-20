# Artigo 1 — Loop Engineering: como fiz meus agentes de IA corrigirem os próprios erros até o merge

> Lastro: `docs/architecture/ADR-015-loop-engineering-pipeline.md`. Publicar como artigo LinkedIn (long-form). Link do projeto no primeiro comentário.

---

Nos últimos meses venho construindo meu portfólio pessoal — um site de currículo com um assistente de chat que responde perguntas sobre a minha própria trajetória — usando um pipeline de agentes de IA especializados, cada um com um papel bem definido: um atua como Product Owner, outro como arquiteto, outro implementa, outro testa, outro revisa o código como tech lead. Eu fico no topo, como dono técnico do produto — quem decide.

Esse formato já me ensinou bastante coisa, mas o aprendizado que mais mudou a velocidade real do projeto foi outro: parar de tratar cada etapa do pipeline como uma parada obrigatória e passar a tratá-la como um loop.

## O problema que eu não tinha percebido

No começo, o fluxo era simples: o dev implementa, o QA testa, o tech lead revisa. Quando o QA reprovava ou o tech lead pedia mudança, o protocolo mandava parar tudo e esperar eu voltar para decidir o próximo passo.

Parece prudente. Na prática, é desperdício de tempo.

Porque a maior parte das reprovações não dependia do meu julgamento. Era um teste quebrado, uma cobertura abaixo do piso combinado, um erro de lint, um contrato que já estava documentado e simplesmente não bateu com a implementação. Problemas objetivamente corrigíveis, com um sinal de verificação claro — o próprio `pytest`, o próprio `eslint`, a própria suíte de cobertura já apontavam exatamente o que estava errado. Mesmo assim, o pipeline parava e ficava esperando eu aparecer para autorizar o óbvio.

O mesmo valia para depois do push: quando o CI do GitHub Actions falhava, era eu quem lia o log, entendia o erro e corrigia — trabalho manual para resolver um problema que o próprio agente que escreveu o código já tinha toda a informação necessária para resolver sozinho.

## A virada: tratar sinal verificável como loop, não como parada

A ideia por trás do Loop Engineering é direta: toda etapa do pipeline que produz um sinal de feedback rápido e verificável — um teste, um lint, uma cobertura, um veredito estruturado de review — não precisa da minha aprovação para ser corrigida. Precisa só ser corrigida, testada de novo e, se passar, seguir em frente sozinha, quantas vezes forem necessárias dentro de um limite razoável.

Formalizei isso em três níveis:

**Loop interno da fase.** Dentro do próprio desenvolvimento — lint, teste unitário, build, type-check. O agente corrige e reexecuta sem sair da etapa.

**Loop entre fases.** Quando o QA reprova ou o tech lead pede mudança com um achado estruturado — não uma opinião solta, um veredito com evidência —, o orquestrador reabre o desenvolvimento automaticamente, repassa o achado, e o ciclo roda de novo sem eu precisar entrar no meio.

**Loop de CI.** Depois do push, se o GitHub Actions falha, o agente lê o log, diagnostica, corrige e faz o repush sozinho.

## O único ponto onde eu insisto em ficar no controle

Autonomia de ponta a ponta não é autonomia sem limite. Existe um único gate humano, não negociável: o merge de `develop` para `main`. É o momento em que o deploy de produção acontece de verdade — a ação de maior impacto de todo o pipeline, a única realmente difícil de desfazer depois. Só ali o orquestrador para, me mostra o relatório completo do que foi feito em cada fase, com evidência, e espera minha confirmação explícita.

Tudo antes disso — implementar, testar, corrigir, revisar, resolver reprovação, corrigir CI — roda sozinho, desde que cada etapa tenha um sinal objetivamente verificável para se apoiar.

E há uma regra a mais que considero essencial, porque autonomia sem critério de parada vira o oposto de confiabilidade: no máximo três tentativas por loop. Na terceira falha sem convergir, o loop para e me escala o histórico completo — o que foi tentado, o que falhou, o diagnóstico. Se a mesma falha se repete com a mesma assinatura (mesmo teste, mesmo erro), nem espera as três tentativas: escala na hora, porque insistir do mesmo jeito não vai destravar nada. E código sensível — chave de API, CORS, segredo — nunca entra em loop automático: é sempre revisão humana, sem exceção.

## O que isso muda de verdade

O ganho mais óbvio é velocidade — não esperar eu aparecer para autorizar a correção de um teste quebrado já devolve um tempo considerável. Mas o ganho maior é outro: onde a minha atenção é gasta.

Antes, eu era interrompido tanto para decisões que exigiam meu julgamento de verdade — qual variante de protótipo escolher, uma ambiguidade de escopo, uma troca de stack — quanto para decisões que não exigiam julgamento nenhum, porque um lint quebrado tem uma resposta certa, não uma opinião. Depois de aplicar Loop Engineering, só sou chamado para o primeiro grupo, mais o único gate que decidi manter sempre humano: o merge em produção.

Isso não é terceirizar julgamento. É reconhecer que revisar cada correção de lint nunca foi julgamento — era fricção disfarçada de cuidado.

## Por que estou contando isso

Esse projeto é meu laboratório real de IA Engineering, não um side project decorativo. É onde eu testo, na prática, que tipo de processo funciona de verdade quando você constrói produto de IA sozinho, sem equipe, com sinal de verificação real — testes, cobertura, CI — já disponível e, até pouco tempo atrás, subaproveitado.

No próximo artigo da série conto o que esse pipeline efetivamente produziu: como cheguei na estratégia de RAG do projeto — chunking, embeddings e, principalmente, a memória conversacional que faltava para o assistente entender uma pergunta de acompanhamento como "onde fica a matriz da empresa?" depois de "onde você trabalha?".

#AIEngineering #EngenhariaDeIA #LLM #DesenvolvimentoDeSoftware #PortfolioProject
