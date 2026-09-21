# PRD-014 — RAG Agêntico (Auto-Crítica)

**Status:** ready-for-agent
**Épico:** RAG Agêntico (Auto-Crítica)
**Prioridade:** P1

## Problema

O `ADR-010` resolveu o roteamento por seção/recência via dicionário de palavras-chave (`SECTION_INTENT_KEYWORDS`, `rag.py`) — decisão que, deliberadamente, descartou um classificador de intenção via LLM por custo/latência desproporcional ao ganho, para os casos relatados então ("onde estudei?", "última empresa"). O `ADR-013` reforçou esse mesmo dicionário (casamento por token em vez de substring), corrigindo um bug de roteamento.

Essa abordagem continua correta para perguntas dentro do vocabulário do dicionário, mas **não cobre por natureza** perguntas fora dele: sinônimos não previstos, perguntas compostas que cruzam duas seções (ex.: "que skills usei na Itaú Unibanco?", que precisa de `experience` **e** `skill` juntos) ou frases que não contêm nenhuma das palavras-chave cadastradas. Essas perguntas caem direto na busca por similaridade pura (sem restrição de seção), que — como o próprio `ADR-010` documentou — nem sempre traz o chunk certo no `top_k`, retornando contexto insuficiente ou da seção errada, sem que o sistema tenha qualquer sinal de que isso aconteceu.

## Objetivo

Adicionar um passo de **auto-crítica seletiva** depois do retrieval atual: uma chamada ao `ChatCompletionProvider` avalia se o contexto recuperado é suficiente para responder à pergunta; se não for, reformula a query (ou relaxa a restrição de seção) e tenta de novo, no máximo 1-2 iterações, antes de cair no fallback de busca web já existente (`ADR-010`) — sem alterar esse fallback nem o contrato de resposta do `/chat`. Medir o ganho real com um golden-set de perguntas reais sobre o currículo, avaliado por LLM-as-judge, comparando a taxa de acerto **antes** (arquitetura atual, sem auto-crítica) e **depois** (com auto-crítica) — número real, não estimado, para servir de evidência num post de storytelling técnico.

## Escopo

### Incluído

- ADR da estratégia de auto-crítica: quando ela roda (critério seletivo, para não gerar custo/latência em toda pergunta), quantas iterações no máximo, como a query é reformulada/relaxada a cada iteração, e o que acontece se as iterações se esgotarem (cai no fallback web existente do `ADR-010`, inalterado)
- Passo de auto-crítica em `backend/app/chat/service.py`, reaproveitando o `ChatCompletionProvider` já existente (`ports.py`) — sem porta nova, sem dependência de SDK direto no domínio (`ADR-012`)
- Critério objetivo e seletivo de quando acionar a auto-crítica (ex.: só quando a similaridade do top-k já é "razoável" mas não confiante o bastante, ou quando o roteamento por seção do `ADR-010` não identificou seção com confiança) — decisão de engenharia do arquiteto/dev, documentada no ADR
- Reformulação de query com no máximo 1-2 iterações — teto fixo para não gerar custo/latência descontrolados
- Golden-set de ~20-30 perguntas reais sobre o currículo do autor (`frontend/content/resume.json`), cobrindo: (a) casos que hoje falham por estarem fora do vocabulário do dicionário de `ADR-010` (sinônimos, perguntas compostas entre seções), e (b) casos que já funcionam bem hoje, para garantir não-regressão
- Rotina de avaliação via LLM-as-judge que roda o golden-set contra a arquitetura **antes** (sem auto-crítica) e **depois** (com auto-crítica) e reporta taxa de acerto de cada uma, com os casos individuais (pergunta, resposta, veredito do judge)
- Testes determinísticos com fakes (padrão já usado no projeto) cobrindo: contexto suficiente (não aciona auto-crítica), contexto insuficiente com reformulação bem-sucedida, limite de iterações esgotado caindo no fallback web, fallback web preservado sem regressão

### Excluído

- Mudança no contrato do `/chat` (`ChatRequest`/`ChatResponse` continuam exatamente como estão — `ADR-010`, `ADR-014`) — a auto-crítica é interna ao `service.py`, invisível ao cliente
- Substituir o dicionário de palavras-chave do `ADR-010`/`ADR-013` por um classificador de intenção via LLM — a auto-crítica é um passo **adicional e seletivo** pós-retrieval, não uma reabertura daquela decisão
- Mudança no fallback de busca web (Tavily, `ADR-010`) — a auto-crítica só decide se reformula/tenta de novo antes de chegar até ele; o gatilho e o comportamento do fallback web em si não mudam
- Mudança de frontend — nenhuma UI nova, nenhum campo novo na resposta consumido pelo cliente
- Automatizar a publicação do post no LinkedIn com os resultados — a análise numérica fica pronta como evidência; a publicação em si é ação humana posterior, fora deste PRD

## Persona

Visitante/recrutador conversando com o assistente de chat — beneficiado indiretamente por respostas mais precisas em perguntas fora do vocabulário do roteamento atual.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| ADR: RAG agêntico com auto-crítica seletiva | P1 | [US-16-01](backlog/fase-16/US-16-01-adr-rag-agentico-auto-critica.md) |
| Backend: passo de auto-crítica + reformulação de query | P1 | [US-16-02](backlog/fase-16/US-16-02-backend-auto-critica-retrieval.md) |
| Golden-set + avaliação LLM-as-judge (antes/depois) | P1 | [US-16-03](backlog/fase-16/US-16-03-golden-set-avaliacao-llm-judge.md) |

## Riscos

- Custo/latência adicional por chamada extra de auto-crítica — mitigado pelo critério seletivo (só roda nos casos ambíguos) e pelo teto de 1-2 iterações; medir no golden-set o número médio de chamadas extras por pergunta
- Auto-crítica mal calibrada pode reformular query desnecessariamente e piorar precisão em perguntas que já funcionavam — exige suíte de regressão cobrindo casos que hoje funcionam bem, não só os que falham
- Golden-set pequeno (~20-30 perguntas) tem variância estatística real — o resultado é uma evidência direcional de projeto pessoal, não um benchmark estatisticamente robusto; reportar o número exato encontrado, sem arredondar ou inflar
- LLM-as-judge tem seu próprio viés/erro de avaliação — mitigado registrando pergunta+resposta+veredito de cada caso individual no relatório, para inspeção manual dos casos de fronteira

## DoR do épico

- [ ] Toda história do épico tem seu próprio DoR fechado (checklist por história abaixo — este item é só o guarda-chuva)
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
- [ ] ADR (US-16-01) registrada antes de US-16-02/US-16-03 iniciarem implementação
