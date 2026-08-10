# Product

Saída do `product-owner`: PRD, épicos, histórias de usuário e backlog.

Status de execução por fase (0 a 12): [`roadmap.md`](roadmap.md).

## PRDs por épico

### Roadmap original (MVP + RAG)
- [PRD-001 — Conteúdo](PRD-001-conteudo.md)
- [PRD-002 — Frontend](PRD-002-frontend.md)
- [PRD-003 — RAG](PRD-003-rag.md)
- [PRD-004 — Deploy](PRD-004-deploy.md)

### Evolução pós-lançamento (draft — sem histórias criadas ainda)
- [PRD-005 — Frontend & UX v2](PRD-005-frontend-ux-v2.md)
- [PRD-006 — Segurança & Performance](PRD-006-seguranca-performance.md)
- [PRD-007 — Qualidade de Engenharia](PRD-007-qualidade-engenharia.md)
- [PRD-008 — Observabilidade](PRD-008-observabilidade.md)
- [PRD-009 — Chat v2](PRD-009-chat-v2.md)
- [PRD-010 — Área Administrativa](PRD-010-area-administrativa.md)

## Backlog — organizado por fase de implementação (não por épico)

Cada história vive em `backlog/fase-FF/US-FF-NN-<slug>.md`: um arquivo por história, com ID `US-<fase>-<sequência>` (ex.: `US-03-10`) e um slug descritivo no nome do arquivo. O ID já carrega o número da fase, então não há ambiguidade entre `US-03-01` (fase 03) e `US-05-01` (fase 05). A tabela "Histórias" de cada PRD linka para o arquivo correspondente.

- [Fase 00 — Preparação](backlog/fase-00/) (2 histórias — Done)
- [Fase 01 — Descoberta e planejamento](backlog/fase-01/) (3 histórias — Done)
- [Fase 02 — Setup do projeto](backlog/fase-02/) (4 histórias — Done)
- [Fase 03 — MVP estático](backlog/fase-03/) (17 histórias — 17/17 Done)
- [Fase 04 — Polimento](backlog/fase-04/) (2 histórias — 2/2 Done)
- [Fase 05 — Feature de IA (RAG)](backlog/fase-05/) (9 histórias — 9/9 Done)

Fase 06 (divulgação) é checklist de lançamento, sem histórias formais de backlog — ver [`roadmap.md`](roadmap.md#fase-6--divulgação).

- [Fase 07 — Frontend & UX v2](backlog/fase-07/) (US-07-01 a US-07-04 — DoR fechado; US-07-03 = clonagem do template [personal-resume](https://github.com/giasinguyen/personal-resume))

### Fases planejadas (draft, sem histórias — ver PRD de cada uma)

- Fase 08 — Segurança & Performance (`PRD-006`)
- Fase 09 — Qualidade de Engenharia (`PRD-007`)
- Fase 10 — Observabilidade (`PRD-008`)
- Fase 11 — Chat v2 (`PRD-009`)
- Fase 12 — Área Administrativa (`PRD-010`)

Histórias dessas fases são criadas pelo `@product-owner` quando cada fase entrar em execução (DoR completo, contrato de API + mapeamento de erros quando aplicável) — os PRDs acima têm só a lista de frentes e riscos conhecidos até aqui.

## Convenção de nomenclatura
- PRD (por épico): `PRD-NNN-<epico>.md`
- Backlog (por fase de implementação, um arquivo por história): `backlog/fase-FF/US-FF-NN-<slug>.md`, ID `US-<fase>-<sequência>`

Detalhes: [`docs/agents/CONTEXTO-PROJETO.md`](../agents/CONTEXTO-PROJETO.md#convenção-de-nomenclatura-de-documentos).

Protótipos visuais (sob pedido, `@ux-designer`): [`docs/agents/PROCESSO-PROTOTIPO.md`](../agents/PROCESSO-PROTOTIPO.md). Índice dos agentes: [`docs/agents/README.md`](../agents/README.md).

## Pendências para o autor

Nenhuma pendência ativa de conteúdo. Resolvidas na Fase 03:

- ~~Repositórios extras para Projetos~~ — autor confirmou único projeto (`curriculo-online-ia`) — [US-03-07](backlog/fase-03/US-03-07-dados-projetos.md)
- ~~E-mail público e GitHub~~ — [US-03-08](backlog/fase-03/US-03-08-dados-contato.md)
- ~~PDF do currículo~~ — [US-03-16](backlog/fase-03/US-03-16-componente-contato-pdf.md)

Deploy Vercel ([US-03-17](backlog/fase-03/US-03-17-deploy-inicial-vercel.md)) — Done em 2026-08-04, branch `feature/US-03-17-deploy-inicial-vercel` aguardando PR para `develop`.
