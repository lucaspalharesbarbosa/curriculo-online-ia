# PRD-003 — RAG

**Status:** draft
**Épico:** RAG
**Prioridade:** P1 (setup do serviço) / P3 (fluxo de RAG completo)

## Problema

Um recrutador que visita o site pode ter perguntas específicas ("quanto tempo de experiência em Java?", "já trabalhou com Kubernetes?") que exigiriam ler o currículo inteiro para responder. Um assistente de chat que responde com base no conteúdo real do autor resolve isso e é o diferencial de AI Engineering do projeto (seção 3 do plano).

## Objetivo

Endpoint `/chat` no FastAPI responde perguntas sobre a trajetória do autor usando RAG simples (chunking do `resume.json` → embeddings → similaridade em memória → geração com contexto), exposto no site via `ChatWidget`.

## Escopo

### Incluído
- Esqueleto do serviço FastAPI (`backend/app/main.py`) — base para qualquer endpoint futuro, não só o `/chat`
- Chunking do `resume.json`, geração de embeddings, busca por similaridade
- Endpoint `/chat` e `ChatWidget` no frontend
- Segurança: CORS, chave de API via variável de ambiente, rate limit básico

### Excluído
- Banco vetorial de verdade (fora de escopo para o volume de dados do projeto — ver `docs/agents/CONTEXTO-PROJETO.md`)
- Qualquer decisão de stack nova sem ADR

## Persona

Visitante/recrutador conversando com o assistente.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| ADR do fluxo de RAG (chunking, embeddings, custo) | P3 | [US-05-01](backlog/fase-05/US-05-01-adr-fluxo-rag.md) |
| Setup do esqueleto do serviço FastAPI | P1 | [US-02-02](backlog/fase-02/US-02-02-setup-fastapi.md) |
| Chunking do `resume.json` | P3 | [US-05-02](backlog/fase-05/US-05-02-chunking-resume-json.md) |
| Geração de embeddings | P3 | [US-05-03](backlog/fase-05/US-05-03-geracao-embeddings.md) |
| Endpoint `/chat` | P3 | [US-05-04](backlog/fase-05/US-05-04-endpoint-chat.md) |
| `ChatWidget` no frontend | P3 | [US-05-05](backlog/fase-05/US-05-05-chat-widget-frontend.md) |
| Testes do fluxo de chat | P3 | [US-05-06](backlog/fase-05/US-05-06-testes-fluxo-chat.md) |
| Segurança do `/chat` (CORS, API key, rate limit) | P3 | [US-05-07](backlog/fase-05/US-05-07-seguranca-chat.md) |

## Riscos

- **US-05-01 é pré-requisito de US-05-02 a US-05-07**: o roadmap (Fase 5 do plano) define que o fluxo de RAG só é implementado depois de um ADR específico (estratégia de chunking, provider de embeddings, custo). Este PRD **não** substitui esse ADR — só organiza o backlog. Chamar `@arquiteto-ia-senior` antes de iniciar US-05-02.
- US-02-02 (esqueleto do FastAPI) é independente do ADR de RAG — pode ser feito já na Fase 2 (setup do projeto), sem decisão de RAG tomada ainda.

## DoR
- [x] Critérios de aceite claros para US-02-02
- [ ] US-05-02 a US-05-07: **ADR do fluxo de RAG ainda não existe** — DoR incompleto até `@arquiteto-ia-senior` produzir US-05-01
- [x] Tasks decompostas (ver `docs/product/backlog/fase-05/` e `docs/product/backlog/fase-02/US-02-02-setup-fastapi.md`)
