# PRD-017: Redesign "command center" com resposta do chat mostrando as tools

**Status:** implementado (`ADR-019`)
**Épico:** Frontend e UX
**Prioridade:** P1

## Problema

O chat responde com ferramentas exatas desde o `ADR-018`, mas a interface não mostra isso: a resposta chega como texto e o visitante não vê de onde veio o dado. O layout também tratava o chat como um widget secundário.

## Objetivo

Um redesign profissional em que o chat é protagonista e cada resposta mostra, de forma discreta e acessível, as ferramentas usadas e um card com o dado exato.

## Escopo

### Incluído

- Home no layout "command center" (variante A escolhida entre três protótipos), com chat lateral fixo no desktop e tela cheia no mobile
- Chips de tool expansíveis e cards ricos (experiência, tecnologia, empresa, linha do tempo), com selo de fonte
- Campo aditivo `tools` no `/chat`
- Sugestões de perguntas que acionam as tools
- Remoção do layout antigo e do código de protótipo

### Excluído

- Tema claro e o estilo editorial (variante B)
- Home 100% conversacional (variante C)
- Dados estruturados por tool no backend (os cards parseiam o texto)

## Critérios de aceite

- [x] O chat lateral responde com o backend real e mostra chips e cards
- [x] Resposta sem `tools` (pipeline) continua funcionando
- [x] Formato de tool não reconhecido cai no detalhe simples
- [x] Acessibilidade: `aria-live`, foco visível, teclado, `prefers-reduced-motion`
- [x] Mobile-first verificado em 375, 768 e 1440
- [x] tsc, lint, testes (114) e build verdes
- [ ] Lighthouse e payload de JS medidos (pendente)

## Riscos

- Parsers acoplados ao formato textual das tools (mitigado com fixtures reais)
- Conteúdo do `resume.json` com travessões aparece na tela (conteúdo do autor, não alterado)

## Referências

- [`ADR-019`](../architecture/ADR-019-redesign-command-center-chat-com-tools.md), [`ADR-018`](../architecture/ADR-018-tools-estruturadas-recuperar-primeiro-hibrida.md)
