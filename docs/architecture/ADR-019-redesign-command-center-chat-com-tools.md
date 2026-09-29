# ADR-019: Redesign "command center" com chat lateral e resposta com tools

## Status
Aceita

## Contexto

A home era um currículo com um widget de chat flutuante. Com o `ADR-018`, o backend passou a responder com ferramentas exatas (duração, tecnologia, empresa, linha do tempo, ADRs), mas o visitante não via isso: a resposta chegava como texto, sem sinal de onde veio o dado. O autor pediu um redesign profissional em que o chat seja protagonista e que mostre, de forma elegante, que a resposta foi ancorada em dados.

Foram prototipadas três direções em Next.js real (rota descartável `/prototipo/redesign`): A "command center" (denso, chat lateral fixo), B "editorial" (papel claro, chat em gaveta) e C "conversacional" (a home é o chat, o currículo vira cards). O autor escolheu **A como base, com os cards do C dentro do chat**.

## Decisão

### 1. Contrato aditivo no `/chat`

`ChatResponse` ganha `tools: [{name, arguments, result}]` (`ToolUse`, `router.py`), preenchido por `service.answer_question(..., tool_trace=...)`. É um campo **aditivo**: vazio quando o pipeline determinístico respondeu, então clientes antigos que o ignoram continuam funcionando.

- `result` é o texto que a tool devolveu, cortado em 1500 caracteres; `read_adr` vai com só 300 (é um sinal, não o documento).
- Só dados públicos do currículo e dos ADRs. Se o tool calling cair para o pipeline, o trace é limpo (nenhuma tool é anunciada sem ter sido usada).

### 2. Frontend

- **Layout A:** hero com contadores animados, linha do tempo estilo Gantt, stack, projetos, certificações e um chat lateral fixo no desktop (tela cheia no mobile), tema Deep Ice.
- **Chips de tool** (botões com `aria-expanded`) que expandem nome, argumentos e resultado. Rótulos: "Calculou experiência", "Buscou tecnologia", "Consultou a empresa", "Montou a linha do tempo", "Leu as decisões de arquitetura", "Consultou o currículo", "Pesquisou na web". Tool desconhecida cai em "Usou uma ferramenta".
- **Cards ricos** (estilo C, carregados com `next/dynamic`) para `calculate_experience`, `find_technology`, `get_experience` e `career_timeline`, gerados por **parsers puros** (`modules/chat/lib/tool-results.ts`) sobre o texto estável das tools. Formato não reconhecido, ou resultado cortado no meio, devolve `null` e a UI mostra o bloco de detalhe simples.
- **Selo de fonte:** "Fonte: currículo" ou "Fonte: web".
- Acessibilidade: `role="log"` com `aria-live` no chat, foco visível, Esc para fechar, `prefers-reduced-motion`.

### 3. Por que parsear texto em vez de devolver dados estruturados

As tools devolvem texto para o modelo (é o que ele consome). Duplicar cada tool para também devolver JSON dobraria a superfície de manutenção no backend. Os parsers vivem no frontend, têm fixtures com os textos reais das tools e degradam para o detalhe simples. O risco (mudar o formato do texto e quebrar um card) fica coberto por testes com os textos reais.

## Alternativas Consideradas

- **B "editorial":** o mais elegante, mas o chat fica escondido até o clique e o visual se afasta mais do atual.
- **C "conversacional" sozinho:** o mais impressionante em vídeo, mas o currículo depende de perguntas e piora para recrutador com pressa e para SEO.
- **Manter o widget flutuante:** não dá protagonismo ao chat nem espaço para os cards.
- **JSON estruturado por tool:** descartado (ver seção 3).

## Consequências

- (+) O visitante vê de onde veio cada dado, com detalhe técnico sob demanda.
- (+) Contrato aditivo: sem risco para clientes existentes.
- (+) Cards com cálculo exato (ex.: "3 anos e 8 meses") são também o melhor material de divulgação.
- (-) Os parsers dependem do formato textual das tools. Mudar o texto no backend exige atualizar as fixtures e os parsers.
- (-) O ícone de cada skill (`react-icons`, `ADR-007`) deixou de ser usado na seção de stack, que agora mostra o nível em pontos. O `ADR-007` fica parcialmente superado para essa seção (a dependência continua usada nos links de contato e projetos).
- (-) O mês de referência dos contadores é calculado no build (a página é estática): "atual" é o mês do último deploy.
- (-) O chat em tela cheia no mobile não tem `aria-modal` nem armadilha de foco (só Esc, bloqueio de rolagem e retorno de foco). Melhoria futura.
- Não medido: Lighthouse e o payload de JS contra o orçamento da `US-08-10`.

## Referências

- [ADR-018](ADR-018-tools-estruturadas-recuperar-primeiro-hibrida.md), [ADR-011](ADR-011-modularizacao-ddd-lite.md), [ADR-012](ADR-012-clean-architecture-chat.md), [ADR-007](ADR-007-dep-react-icons-skills.md)
- [C4-002](C4-002-componentes-backend-tools-mcp.md)
- Código: `frontend/modules/chat/` (chips, cards, parsers, `ChatAside`), `frontend/modules/resume/` (home), `backend/app/chat/router.py` (`ToolUse`)
