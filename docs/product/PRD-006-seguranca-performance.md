# PRD-006 — Segurança & Performance

**Status:** draft
**Épico:** Segurança & Performance
**Prioridade:** P1

## Problema

Frontend e backend estão em produção (Vercel + Render) há semanas com hardening pontual (CORS + rate limit do `/chat`, na Fase 5), mas sem uma auditoria dedicada de segurança e performance cobrindo o restante da superfície: headers HTTP, dependências desatualizadas, cold start do plano gratuito do Render, orçamento de performance do site como um todo.

## Objetivo

Auditoria formal de segurança e performance concluída, com achados classificados por severidade e virando histórias concretas de correção — não um épico "faça tudo melhor" sem critério de aceite verificável.

## Escopo

### Incluído
- Auditoria de segurança: headers HTTP (CSP, HSTS, X-Content-Type-Options etc.), CORS em todos os endpoints (não só `/chat`), dependências desatualizadas/vulneráveis (`npm audit`, `pip-audit`/`safety`)
- Auditoria de performance: Lighthouse (todas as páginas, não só a Home), tamanho de bundle, cache de assets estáticos
- Mitigação de cold start do backend no Render free tier (o plano gratuito hiberna após inatividade — impacto direto na primeira resposta do `/chat`)

### Excluído
- Migração de hospedagem (o `ADR-002` já decide Render/Vercel — mudança de provedor precisaria de novo ADR)
- WAF/CDN dedicado — fora de proporção para um projeto pessoal gratuito

## Persona

Visitante/recrutador (experiência de carregamento) e o próprio autor (superfície de ataque do site).

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| Auditoria de segurança do frontend e backend (headers, dependências, CORS) | P1 | — |
| Plano de mitigação de cold start do backend gratuito (Render free tier) | P2 | — |
| Auditoria de performance (Lighthouse em todas as páginas, bundle, cache) | P2 | — |

Nota: a auditoria (primeira história) é um spike — o resultado dela é que decide se nascem novas histórias de correção específica (achado por achado), em vez de tentar prever agora todo problema de segurança/performance que ainda não foi medido.

## Riscos

- Épico "segurança e performance" sem escopo é terreno fértil para virar trabalho infinito — o guardrail é: toda correção nasce de um achado real da auditoria, não de suposição
- Mitigar cold start pode exigir gasto (upgrade de plano) — decisão de custo cabe ao autor, não é automática

## DoR do épico
- [ ] Toda história do épico tem seu próprio DoR fechado
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
- [ ] Auditoria (spike) rodada antes de criar histórias de correção específicas
