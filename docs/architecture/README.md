# Architecture

Saída do `arquiteto-ia-senior`: ADRs (Architecture Decision Records) e diagramas C4.

## ADRs
- [ADR-001 — Stack inicial e monorepo](ADR-001-stack-inicial-monorepo.md)
- [ADR-002 — Hospedagem gratuita (Vercel + Render)](ADR-002-hospedagem-gratuita.md) — Aceita
- [ADR-003 — Fluxo de RAG (chunking, embeddings, geração, custo)](ADR-003-fluxo-rag.md) — Aceita
- [ADR-004 — Padrões de resiliência do backend (endpoint `/chat`)](ADR-004-resiliencia-backend-chat.md) — Aceita
- [ADR-005 — Deps do template personal-resume (framer-motion + ícones)](ADR-005-deps-template-personal-resume.md) — Aceita
- [ADR-006 — Extensão de conteúdo (articles, credentialUrl) e chunking do RAG](ADR-006-extensao-conteudo-articles-rag.md) — Aceita
- [ADR-007 — `react-icons` para logos das habilidades técnicas](ADR-007-dep-react-icons-skills.md) — Aceita

## Diagramas
- [C4-001 — Contexto e Containers](C4-001-contexto-containers.md)

## Convenção de nomenclatura
`ADR-NNN-<titulo>.md` e `C4-NNN-<titulo>.md`, `NNN` nunca reaproveitado. Detalhes: [`docs/agents/CONTEXTO-PROJETO.md`](../agents/CONTEXTO-PROJETO.md#convenção-de-nomenclatura-de-documentos).
