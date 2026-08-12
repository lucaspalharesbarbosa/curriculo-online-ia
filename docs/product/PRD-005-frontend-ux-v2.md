# PRD-005 — Frontend & UX v2

**Status:** Done (15/15 histórias — Fase 07 concluída em 2026-08-11)
**Épico:** Frontend & UX v2
**Prioridade:** P1

## Problema

O site está publicado e funcional (Fase 3-4), mas ainda não passou por um ciclo dedicado de responsividade real em todos os breakpoints, o canal de contato é limitado (sem WhatsApp) e o layout não teve uma passada de design intencional além do polimento básico de acessibilidade da Fase 4. A primeira tentativa de redesign (PortfolioHub/Framer) foi descartada pelo autor em favor de um template open-source mais alinhado a currículo.

## Objetivo

Site mais fácil de contatar (e-mail + WhatsApp), responsivo de verdade em mobile/tablet/desktop, com visual baseado no template de referência **personal-resume** (paleta definitiva **D1 Deep Ice**), aproveitando melhor os recursos do Next.js já adotado como stack.

## Escopo

### Incluído
- Seção de Contato: adicionar canal direto de WhatsApp (`wa.me`), mantendo e-mail/LinkedIn/GitHub/PDF já existentes
- Auditoria e correção de responsividade em mobile, tablet e desktop (breakpoints reais, não só visual em uma resolução)
- Redesign visual: **clonagem estrutural** do template [personal-resume](https://github.com/giasinguyen/personal-resume) ([demo](https://cv.nguyentrangiasi.id.vn/)) — sidebar sticky, cards glass, seções About/Experience/Education/Certifications/Projects — com dados reais de `resume.json` (sem inventar conteúdo); paleta supersede amber do template → **D1 Deep Ice** (`#04080e` / accent `#38bdf8`)
- Revisão de uso de recursos do Next.js já adotado (`next/image`, fontes otimizadas, Server Components onde fizer sentido) — ver nota abaixo
- Extensões de conteúdo e polimentos UX posteriores (US-07-05 a US-07-15): artigos, reconhecimentos, motion, skills, timeline, mobile-first

### Excluído
- Formulário de contato com persistência de dados (isso era pré-requisito da Fase 12 — Área Administrativa; decisão 2026-08-06: mantém link direto; Fase 12 fica só com métricas)
- Troca de framework — o projeto já usa Next.js (`docs/agents/CONTEXTO-PROJETO.md`); esta fase é sobre aproveitar melhor a stack já decidida, não reabri-la
- Seções do template sem dado real (Languages, Soft Skills)
- Manter identidade visual PortfolioHub (ciano, Clash Grotesk, ticker, stats, tools grid)

## Persona

Visitante/recrutador navegando o site, em qualquer dispositivo.

## Nota — "Next.js tem vantagem?"

O frontend já é Next.js (App Router) desde o `ADR-001`. Não é uma decisão em aberto. O que fica como tarefa nesta fase é auditar se o projeto usa os recursos que justificam a escolha (otimização de imagem, fontes, Server Components) em vez de tratá-lo como um SPA React genérico.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| Ampliar seção de Contato com link direto para WhatsApp | P1 | [US-07-01](backlog/fase-07/US-07-01-contato-whatsapp.md) |
| Auditoria e correção de responsividade (mobile/tablet/desktop) | P1 | [US-07-02](backlog/fase-07/US-07-02-auditoria-responsividade.md) |
| Redesign visual do site (clonagem do template personal-resume) | P2 | [US-07-03](backlog/fase-07/US-07-03-redesign-visual.md) |
| Revisão de uso de recursos do Next.js (`next/image`, fontes, Server Components) | P3 | [US-07-04](backlog/fase-07/US-07-04-revisao-nextjs.md) |
| Conteúdo novo: reconhecimentos, formação técnica, cursos livres e artigos | P1 | [US-07-05](backlog/fase-07/US-07-05-conteudo-reconhecimentos-formacao-artigos.md) |
| Layout mais dinâmico e chamativo | P2 | [US-07-06](backlog/fase-07/US-07-06-layout-dinamico-chamativo.md) |
| Redesign do bloco de informações abaixo do nome (sidebar) | P2 | [US-07-07](backlog/fase-07/US-07-07-redesign-info-abaixo-nome.md) |
| Remover duplicidade em AI Engineering e recalibrar níveis de skills | P2 | [US-07-08](backlog/fase-07/US-07-08-ajuste-niveis-skills.md) |
| Timeline de Experiência mais clara e marcante | P2 | [US-07-09](backlog/fase-07/US-07-09-timeline-experiencia-mais-clara-marcante.md) |
| Melhorar a exibição de Bancos de Dados (SQL/NoSQL) | P2 | [US-07-10](backlog/fase-07/US-07-10-exibicao-bancos-de-dados-sql-nosql.md) |
| Polimento de layout e UX (collapse, perfil, mobile, reconhecimentos) | P1 | [US-07-11](backlog/fase-07/US-07-11-polimento-layout-ux.md) |
| Refino visual: destaques PRAD/Mérito, Educação e Certificações | P1 | [US-07-12](backlog/fase-07/US-07-12-refino-experiencia-educacao-certificacoes.md) |
| Polimento UX: hero typewriter, seções e Assistente RAG | P1 | [US-07-13](backlog/fase-07/US-07-13-polimento-ux-chat-hero-secoes.md) |
| Ajuste fino: hero em linhas, probes 3ª pessoa, certs e label Artigo | P1 | [US-07-14](backlog/fase-07/US-07-14-ajuste-hero-probes-certs-destaques.md) |
| Redesign radical UX mobile-first (hero, bottom nav, chat sheet) | P0 | [US-07-15](backlog/fase-07/US-07-15-redesign-mobile-first.md) |

## Riscos

- Redesign pode regredir contraste/acessibilidade já corrigidos na Fase 4 — re-rodar Lighthouse é obrigatório no DoD dessas histórias
- Adotar `framer-motion` (do template) aumenta bundle — mitigado por `ADR-005` e `prefers-reduced-motion`
- ~~WhatsApp expõe um número pessoal publicamente~~ — autor confirmou publicação do número via `@orquestrador` em 2026-08-06 ([US-07-01](backlog/fase-07/US-07-01-contato-whatsapp.md))
- ~~Decisão "link direto vs. formulário" no Contato~~ — resolvida em 2026-08-06: mantém link direto (mailto/wa.me), sem formulário com persistência; Fase 12 fica sem lista de contatos recebidos, só métricas de acesso/uso do chat
- ~~Referência visual~~ — fechada em 2026-08-07: template **personal-resume** (substitui Omnira e PortfolioHub)

## DoR do épico
- [x] Toda história do épico tem seu próprio DoR fechado — US-07-01 a US-07-15
- [x] Tasks decompostas (`references/task-breakdown-guide.md`) — 15 histórias em `backlog/fase-07/`
- [x] Decisão "link direto (mailto/wa.me) vs. formulário com persistência" tomada antes de abrir a história de Contato — impacta o PRD-010 — resolvida em 2026-08-06: link direto
- [x] Referência visual do redesign — template personal-resume (MIT) + ADR-005 para deps
