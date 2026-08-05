# PRD-008 — Observabilidade

**Status:** draft
**Épico:** Observabilidade
**Prioridade:** P2

## Problema

Hoje não há visibilidade sobre disponibilidade, taxa de erro ou latência do backend em produção, nem log centralizado — se o `/chat` começar a falhar silenciosamente (ex.: `LLM_API_KEY` expirada, cold start do Render), a única forma de descobrir é um visitante reportar ou o autor testar manualmente.

## Objetivo

Dashboard com métricas básicas (disponibilidade, taxa de erro, latência) e logs centralizados numa ferramenta gratuita, cobrindo pelo menos o backend (FastAPI) e o fluxo de chat.

## Escopo

### Incluído
- ADR de escolha de stack de observabilidade (métricas + logs), avaliando opções gratuitas compatíveis com Render/Vercel (ex.: Grafana Cloud free tier, Better Stack, Axiom, Grafana Loki) — decisão de stack nova exige ADR (`docs/agents/CONTEXTO-PROJETO.md`)
- Instrumentação básica do backend: disponibilidade (`/health` já existe), taxa de erro por endpoint, latência
- Dashboard Grafana com essas métricas
- Logs estruturados da aplicação (backend, no mínimo) integrados à ferramenta escolhida

### Excluído
- Observabilidade de frontend (Web Vitals reais de usuário) — pode virar história futura, não é o foco desta fase
- Alerta automático (PagerDuty etc.) — desproporcional a um projeto pessoal; no máximo notificação simples, se a ferramenta escolhida já oferecer de graça

## Persona

O próprio autor, monitorando a saúde do backend.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| ADR: escolha de stack de observabilidade (métricas + logs, tier gratuito) | P1 | — |
| Instrumentar backend com métricas básicas (disponibilidade, taxa de erro, latência) | P1 | — |
| Dashboard Grafana com as métricas básicas | P2 | — |
| Logs estruturados da aplicação + integração com ferramenta gratuita | P2 | — |

## Riscos

- Free tier de qualquer ferramenta de observabilidade tem limite de volume/retenção — a ADR precisa registrar o limite escolhido, não só "é grátis"
- Instrumentação mal feita pode logar dado sensível do visitante (pergunta feita ao chat) — respeitar a regra de "sem PII de terceiros logada" já registrada em `@tech-lead-review`

## DoR do épico
- [ ] Toda história do épico tem seu próprio DoR fechado
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
- [ ] ADR de stack de observabilidade registrada antes de instrumentar código
