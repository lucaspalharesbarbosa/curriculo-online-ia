# PRD-005 — Frontend & UX v2

**Status:** ready-for-agent (histórias P1, P3 decompostas; P2 decomposta com DoR pendente de referência visual)
**Épico:** Frontend & UX v2
**Prioridade:** P1

## Problema

O site está publicado e funcional (Fase 3-4), mas ainda não passou por um ciclo dedicado de responsividade real em todos os breakpoints, o canal de contato é limitado (sem WhatsApp) e o layout não teve uma passada de design intencional além do polimento básico de acessibilidade da Fase 4.

## Objetivo

Site mais fácil de contatar (e-mail + WhatsApp), responsivo de verdade em mobile/tablet/desktop, com um visual mais moderno e criativo, aproveitando melhor os recursos do Next.js já adotado como stack.

## Escopo

### Incluído
- Seção de Contato: adicionar canal direto de WhatsApp (`wa.me`), mantendo e-mail/LinkedIn/GitHub/PDF já existentes
- Auditoria e correção de responsividade em mobile, tablet e desktop (breakpoints reais, não só visual em uma resolução)
- Redesign visual: paleta, tipografia, hero, microinterações — sem trocar a stack
- Revisão de uso de recursos do Next.js já adotado (`next/image`, fontes otimizadas, Server Components onde fizer sentido) — ver nota abaixo

### Excluído
- Formulário de contato com persistência de dados (isso é pré-requisito da Fase 12 — Área Administrativa; decisão de ter ou não formulário fica registrada aqui, mas a implementação de persistência é escopo do PRD-010)
- Troca de framework — o projeto já usa Next.js (`docs/agents/CONTEXTO-PROJETO.md`); esta fase é sobre aproveitar melhor a stack já decidida, não reabri-la

## Persona

Visitante/recrutador navegando o site, em qualquer dispositivo.

## Nota — "Next.js tem vantagem?"

O frontend já é Next.js (App Router) desde o `ADR-001`. Não é uma decisão em aberto. O que fica como tarefa nesta fase é auditar se o projeto usa os recursos que justificam a escolha (otimização de imagem, fontes, Server Components) em vez de tratá-lo como um SPA React genérico.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| Ampliar seção de Contato com link direto para WhatsApp | P1 | [US-07-01](backlog/fase-07/US-07-01-contato-whatsapp.md) |
| Auditoria e correção de responsividade (mobile/tablet/desktop) | P1 | [US-07-02](backlog/fase-07/US-07-02-auditoria-responsividade.md) |
| Redesign visual do site (paleta, tipografia, hero, microinterações) | P2 | [US-07-03](backlog/fase-07/US-07-03-redesign-visual.md) — `Ready for Agent` |
| Revisão de uso de recursos do Next.js (`next/image`, fontes, Server Components) | P3 | [US-07-04](backlog/fase-07/US-07-04-revisao-nextjs.md) |

## Riscos

- Redesign pode regredir contraste/acessibilidade já corrigidos na Fase 4 — re-rodar Lighthouse é obrigatório no DoD dessas histórias
- ~~WhatsApp expõe um número pessoal publicamente~~ — autor confirmou publicação do número via `@orquestrador` em 2026-08-06 ([US-07-01](backlog/fase-07/US-07-01-contato-whatsapp.md))
- ~~Decisão "link direto vs. formulário" no Contato~~ — resolvida em 2026-08-06: mantém link direto (mailto/wa.me), sem formulário com persistência; Fase 12 fica sem lista de contatos recebidos, só métricas de acesso/uso do chat

## DoR do épico
- [x] Toda história do épico tem seu próprio DoR fechado — P1 (US-07-01, US-07-02), P2 (US-07-03) e P3 (US-07-04) fechados; US-07-03 fechou em 2026-08-06 com a referência visual (template Omnira/Framer) recebida do autor via `@orquestrador`
- [x] Tasks decompostas (`references/task-breakdown-guide.md`) — todas as 4 histórias já criadas
- [x] Decisão "link direto (mailto/wa.me) vs. formulário com persistência" tomada antes de abrir a história de Contato — impacta o PRD-010 — resolvida em 2026-08-06: link direto
