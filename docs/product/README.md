# Product

Saída do `product-owner`: PRD, épicos, histórias de usuário e backlog.

## PRDs por épico
- [PRD-001 — Conteúdo](PRD-001-conteudo.md)
- [PRD-002 — Frontend](PRD-002-frontend.md)
- [PRD-003 — RAG](PRD-003-rag.md)
- [PRD-004 — Deploy](PRD-004-deploy.md)

## Backlog — organizado por fase de implementação (não por épico)

Cada história vive em `backlog/fase-FF/US-FF-NN-<slug>.md`: um arquivo por história, com ID `US-<fase>-<sequência>` (ex.: `US-03-10`) e um slug descritivo no nome do arquivo. O ID já carrega o número da fase, então não há ambiguidade entre `US-03-01` (fase 03) e `US-05-01` (fase 05). A tabela "Histórias" de cada PRD linka para o arquivo correspondente.

- [Fase 00 — Preparação](backlog/fase-00/) (2 histórias — Done)
- [Fase 01 — Descoberta e planejamento](backlog/fase-01/) (3 histórias — Done)
- [Fase 02 — Setup do projeto](backlog/fase-02/) (4 histórias — Done)
- [Fase 03 — MVP estático](backlog/fase-03/) (17 histórias — 17/17 Done)
- [Fase 04 — Polimento](backlog/fase-04/) (2 histórias)
- [Fase 05 — Feature de IA (RAG)](backlog/fase-05/) (9 histórias)

Fase 06 (divulgação) é checklist de lançamento, sem histórias formais de backlog — ver [`docs/plano-projeto-curriculo-online.md`](../plano-projeto-curriculo-online.md#8-roadmap-to-do-por-fases).

## Convenção de nomenclatura
- PRD (por épico): `PRD-NNN-<epico>.md`
- Backlog (por fase de implementação, um arquivo por história): `backlog/fase-FF/US-FF-NN-<slug>.md`, ID `US-<fase>-<sequência>`

Detalhes: [`docs/agents/CONTEXTO-PROJETO.md`](../agents/CONTEXTO-PROJETO.md#convenção-de-nomenclatura-de-documentos).

## Pendências para o autor

Nenhuma pendência ativa de conteúdo. Resolvidas na Fase 03:

- ~~Repositórios extras para Projetos~~ — autor confirmou único projeto (`curriculo-online-ia`) — [US-03-07](backlog/fase-03/US-03-07-dados-projetos.md)
- ~~E-mail público e GitHub~~ — [US-03-08](backlog/fase-03/US-03-08-dados-contato.md)
- ~~PDF do currículo~~ — [US-03-16](backlog/fase-03/US-03-16-componente-contato-pdf.md)

Deploy Vercel ([US-03-17](backlog/fase-03/US-03-17-deploy-inicial-vercel.md)) — Done em 2026-08-04, branch `feature/US-03-17-deploy-inicial-vercel` aguardando PR para `main`. PR da Fase 03 para `develop` já mergeado.
