# PRD-009 — Chat v2

**Status:** draft
**Épico:** Chat v2
**Prioridade:** P3

## Problema

O `ChatWidget` (Fase 5) cobre o essencial — pergunta, resposta, fallback — mas com layout simples e sem funcionalidades que melhorem a experiência de quem está avaliando o autor via chat (recrutador testando o diferencial de IA Engineering do portfólio).

## Objetivo

`ChatWidget` com visual mais moderno e funcionalidades que tornem a conversa mais fluida e informativa, sem adicionar complexidade desproporcional ao RAG "simples, do zero" já decidido no `ADR-003`.

## Escopo

### Incluído
- Redesign visual do `ChatWidget` (bolhas de mensagem, tema claro/escuro consistente com o resto do site, estado de carregamento)
- Perguntas sugeridas (quick replies) para reduzir a barreira de "não sei o que perguntar"
- Indicador de "digitando"/streaming da resposta (percepção de latência menor)
- Feedback do usuário na resposta (ex.: 👍/👎) — sinal qualitativo de utilidade, sem virar sistema de rating complexo

### Excluído
- Histórico de conversa persistente entre sessões (exigiria backend com estado por usuário — desproporcional ao RAG atual, sem login de visitante)
- Multi-idioma no chat — fora de escopo enquanto o resto do site for só PT-BR

## Persona

Visitante/recrutador conversando com o assistente de chat.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| Redesign visual do ChatWidget | P2 | — |
| Perguntas sugeridas (quick replies) no ChatWidget | P2 | — |
| Indicador de digitando / streaming de resposta | P3 | — |
| Feedback do usuário na resposta (útil / não útil) | P3 | — |

## Riscos

- Streaming de resposta pode exigir mudança no contrato do endpoint `/chat` (de resposta única para streaming) — se acontecer, é decisão de arquitetura e precisa de ADR, não só ajuste de UI
- Feedback do usuário (👍/👎) introduz o primeiro dado de visitante persistido pelo backend — mesma dependência de decisão de persistência levantada no PRD-005/PRD-010 (evitar três decisões de "onde eu guardo dado de visitante" isoladas)

## DoR do épico
- [ ] Toda história do épico tem seu próprio DoR fechado
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
- [ ] Se streaming mudar o contrato do `/chat`: ADR registrada antes de implementar
