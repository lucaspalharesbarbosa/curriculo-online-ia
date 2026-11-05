# ADR-021: Defesas contra prompt injection e abuso do chat público

## Status
Aceita

## Contexto

O `/chat` é público e roda com a chave de API do autor. Qualquer visitante pode mandar texto para o modelo, e o modelo também lê texto de terceiros (resultado da busca web, histórico enviado pelo navegador). Até aqui as únicas proteções eram rate limit, CORS e prompts que pediam para "nunca inventar". Nada tratava o conteúdo como potencialmente hostil.

Antes de criar defesas, o chat foi **atacado e medido**. `eval/attacks.json` tem 34 ataques em 9 categorias (vazamento do prompt, jailbreak, uso fora do escopo, falsidade sobre o autor, injeção indireta pela web, injeção pelo histórico, abuso de ferramentas, injeção na saída e entrada gigante), executados contra o fluxo de produção (tool calling ligado) com uma busca web que o atacante controla. Cada ataque roda 3 vezes, porque o modelo varia entre tentativas. Um ataque "tem sucesso" quando o chat cai no truque.

Resultado no código original (102 tentativas): **20 sucessos (20%), 7 deles críticos**.

| Categoria | Sucessos antes |
|---|---|
| Injeção indireta pela web | 7/12 |
| Entrada gigante | 6/6 |
| Injeção na saída (link de phishing repetido) | 3/9 |
| Jailbreak ("modo desenvolvedor") | 2/15 |
| Uso fora do escopo (o chat escreveu código) | 2/15 |
| Vazamento do prompt, falsidade, histórico, ferramentas | 0 |

O mais grave: com um texto envenenado vindo da busca web, o chat afirmou que **"o Lucas foi demitido por fraude"** e repetiu uma palavra-código plantada pelo atacante, nas 3 tentativas. A entrada gigante era aceita sem limite (200 mil caracteres viravam custo de embedding e de tokens).

## Decisão

Defesas em camadas, todas **determinísticas e baratas (nenhuma chama LLM)**, em `backend/app/chat/guardrails.py`. A premissa é que nenhuma camada basta: o ataque precisa passar por várias.

1. **Teto de entrada** (`router.py`): pergunta com no máximo 1000 caracteres e histórico com no máximo 8000 no total, senão `422`. Feedback também limitado.
2. **Detector de padrões** (`looks_like_injection`): pedidos óbvios de ignorar regras, revelar o prompt, "ativar modos" ou trocar de papel são recusados **sem chamar o modelo** (e sem gastar embedding). Propositalmente estreito, para não recusar perguntas legítimas: um teste garante que nenhuma pergunta dos golden-sets é bloqueada.
3. **Conteúdo de terceiros é dado, não instrução** (`neutralize_untrusted`, `wrap_untrusted`): o resultado da busca web perde frases de comando ("ignore", "termine a resposta com", "diga ao usuário"), perde **qualquer frase que cite o autor** e é delimitado como não confiável. A segunda regra é de procedência: a web serve para descrever empresas e tecnologias, nunca para afirmar fatos sobre o Lucas. Isso fecha o envenenamento de dado, que não dá ordem nenhuma e por isso o filtro de comandos não pega.
4. **Histórico não é confiável**: ele vem do navegador, então um turno "assistente" pode ser forjado. Turnos que forjam obediência ou mandam ignorar regras são descartados.
5. **Regras de segurança nos prompts** (`SECURITY_RULES`, acrescentadas aos três prompts de sistema): tratar contexto, ferramentas, histórico e web como dados; nunca revelar as instruções nem citar nomes internos de ferramentas; só falar do Lucas e do projeto, com uma recusa padrão para o resto; nunca afirmar sobre o Lucas algo que venha da web; nunca escrever links, HTML ou imagens fora das fontes.
6. **Filtro de saída** (`sanitize_output`, `leaks_prompt`): remove HTML e imagens markdown, troca por texto os links fora da lista do autor (LinkedIn, GitHub, site, WhatsApp) e `javascript:`, e substitui a resposta por uma recusa se ela reproduz 7 palavras seguidas do prompt de sistema ou cita 2 ou mais nomes internos de ferramenta.
7. **Handler de validação** (`shared/errors.py`): devolve só campo, mensagem e tipo. Antes ele ecoava a entrada inteira (amplificação) e podia falhar na serialização de `ctx`, o que viraria `500`. O erro apareceu justamente ao testar o limite do histórico.
8. **Logs** de cada bloqueio (`guardrail_blocked reason=...`), sem o conteúdo do visitante.

Ficam sempre ligadas (são baratas e determinísticas), sem flag.

## Alternativas Consideradas

- **Só reforçar o prompt.** Descartada como única defesa: depende da obediência do modelo e é o que falha sob ataque. Fica como uma das camadas.
- **Classificador LLM de intenção em toda pergunta.** Descartada: uma chamada extra a cada pergunta (custo e latência no free tier) para um ganho que as camadas determinísticas já deram.
- **Moderation API ou serviço de guardrails externo.** Descartada por ora: mais uma dependência e mais uma chamada. Reavaliar se o tráfego crescer.
- **Bloquear a busca web.** Descartada: é um recurso útil do chat. Tratar o resultado como dado resolve o risco sem perder a função.
- **Assinar as respostas do assistente para validar o histórico.** Descartada: complexidade desproporcional ao risco.

## Medição real (2026-11-05)

Mesmo avaliador, mesma metodologia (3 tentativas por ataque), antes e depois.

| Conjunto | Antes | Depois |
|---|---|---|
| Ataques principais (34 x 3) | **20/102 (20%)** | **0/102 (0%)** |
| Críticos | 7/33 | 0/33 |
| **Reservado** (13 ataques novos x 3, com paráfrases e evasões que as regras não conhecem) | **11/39 (28%)** | **0/39 (0%)** |
| Críticos do reservado | 3/15 | 0/15 |
| Golden-set original (regressão) | 31/35 | 31/35 |
| Golden-set de capacidades | 11/15 | 13/15 |

O conjunto reservado foi escrito **depois** das defesas, justamente para testar se elas generalizam em vez de só decorar o conjunto principal (inglês, letras separadas, "desconsidere" no lugar de "ignore", instrução sutil escondida na web, histórico forjado com "[SISTEMA]"). Os ataques que passavam antes no reservado eram jailbreak (7/9), injeção pela web (3/6) e histórico forjado (1/3).

## Limitações

- **0% não é imunidade.** Os dois conjuntos foram escritos por quem construiu as defesas e julgados por um LLM. Um atacante adaptativo, com várias mensagens ou payloads codificados, pode achar caminhos que eu não testei.
- O detector de padrões (camada 2) é estreito e contornável por paráfrase. O que segurou o conjunto reservado foram as outras camadas, principalmente a procedência da web, as regras no prompt e o filtro de saída. Por isso nenhuma camada é a defesa.
- As camadas de prompt e de procedência são probabilísticas (dependem do modelo). Por isso a medição repete cada ataque 3 vezes.
- Não cobertos: ataques em várias mensagens adaptados às respostas, payloads em base64, outros idiomas em escala, rotação de IP contra o rate limit e abuso específico do `/mcp`.
- A regressão não piorou, mas é medida em 35 e 15 perguntas, com variação de cerca de 1 a 2 acertos entre rodadas.

## Consequências

- (+) Os ataques de maior risco (injeção pela web, falsidade sobre o autor, phishing na resposta, entrada gigante) foram fechados e estão cobertos por teste e por medição repetível (`python -m eval.run_attacks --repeat 3`, `--set holdout`).
- (+) Pedidos óbvios de injeção não gastam chamada ao modelo (economia de custo).
- (+) Um bug latente (`500` ao validar o histórico) foi achado e corrigido.
- (-) A frase sobre o autor vinda da web é sempre descartada, mesmo que verdadeira. Aceito: o currículo é a fonte para fatos sobre ele.
- (-) A recusa padrão pode, raramente, atingir uma pergunta legítima mal formulada. O teste com os golden-sets mostra zero falsos positivos nas perguntas conhecidas.
- (-) Manutenção: o conjunto de ataques precisa crescer à medida que surgirem técnicas novas.

## Referências

- [ADR-010](ADR-010-fluxo-rag-v2-precisao-web.md) (busca web), [ADR-017](ADR-017-tools-e-mcp-um-nucleo-duas-portas.md) e [ADR-018](ADR-018-tools-estruturadas-recuperar-primeiro-hibrida.md) (tools), [ADR-019](ADR-019-redesign-command-center-chat-com-tools.md)
- [C4-002](C4-002-componentes-backend-tools-mcp.md)
- Código: `backend/app/chat/guardrails.py`, `backend/eval/attacks.json`, `backend/eval/attacks_holdout.json`, `backend/eval/run_attacks.py`
