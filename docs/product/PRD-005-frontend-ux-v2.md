# PRD-005 — Frontend & UX v2

**Status:** draft
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
| Ampliar seção de Contato com link direto para WhatsApp | P1 | — (a criar quando a fase entrar em execução) |
| Auditoria e correção de responsividade (mobile/tablet/desktop) | P1 | — |
| Redesign visual do site (paleta, tipografia, hero, microinterações) | P2 | — |
| Revisão de uso de recursos do Next.js (`next/image`, fontes, Server Components) | P3 | — |

## Riscos

- Redesign pode regredir contraste/acessibilidade já corrigidos na Fase 4 — re-rodar Lighthouse é obrigatório no DoD dessas histórias
- WhatsApp expõe um número pessoal publicamente — confirmar com o autor antes de implementar (mesma natureza da pendência de e-mail/GitHub resolvida na Fase 3)
- Decisão "link direto vs. formulário" no Contato afeta diretamente o que a Fase 12 (Área Administrativa) consegue listar — alinhar as duas fases antes de fechar o DoR da história de Contato

## DoR do épico
- [ ] Toda história do épico tem seu próprio DoR fechado (checklist por história abaixo — este item é só o guarda-chuva)
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
- [ ] Decisão "link direto (mailto/wa.me) vs. formulário com persistência" tomada antes de abrir a história de Contato — impacta o PRD-010
