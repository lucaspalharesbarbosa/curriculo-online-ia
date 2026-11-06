# PRD-018: Defesas contra prompt injection e abuso do chat público

**Status:** implementado e medido (`ADR-021`)
**Épico:** Segurança
**Prioridade:** P1

## Problema

O `/chat` é público, roda com a chave de API do autor e lê texto de terceiros (busca web, histórico do navegador). Não havia defesa específica contra prompt injection, uso do chat como GPT gratuito, afirmações falsas sobre o autor, links de phishing na resposta ou entrada gigante. O ataque foi medido: 20% das tentativas tinham sucesso no código original, incluindo o chat afirmar que o autor "foi demitido por fraude" a partir de um texto envenenado da web.

## Objetivo

Reduzir a taxa de sucesso dos ataques para perto de zero nas categorias críticas, sem piorar as respostas legítimas, e deixar a medição repetível.

## Escopo

### Incluído

- Conjunto de ataques (34 principais e 13 reservados) e avaliador (`eval/run_attacks.py`), com 3 tentativas por ataque
- Camadas determinísticas em `guardrails.py`: teto de entrada, detector de padrões, web e histórico como dado, regras de segurança nos prompts, filtro de saída
- Correção do handler de validação (sem `500` e sem eco da entrada)
- Testes unitários, de integração e um teste contra falsos positivos nos golden-sets

### Excluído

- Classificador LLM, moderation API ou serviço externo de guardrails
- Ataques adaptativos em várias mensagens, payloads codificados e abuso do `/mcp`

## Critérios de aceite

- [x] Ataques principais: de 20/102 para 0/102; críticos de 7/33 para 0/33
- [x] Conjunto reservado (paráfrases): de 11/39 para 0/39
- [x] Golden-sets sem regressão (31/35 e 13/15)
- [x] Nenhuma pergunta dos golden-sets recusada por engano
- [x] Pergunta gigante e histórico gigante retornam `422`
- [x] ADR-021, C4-002 e READMEs atualizados

## Riscos

- 0% não é imunidade: conjuntos escritos pelo mesmo autor e julgados por LLM
- Camadas de prompt são probabilísticas; o detector de padrões é contornável
- Frase verdadeira sobre o autor vinda da web é descartada (aceito)

## Referências

- [`ADR-021`](../architecture/ADR-021-defesas-contra-prompt-injection-e-abuso.md), [`C4-002`](../architecture/C4-002-componentes-backend-tools-mcp.md)
