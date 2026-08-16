# PRD-006 — Segurança & Performance

**Status:** review (discover — aguardando aprovação do autor para `implement`)
**Épico:** Segurança & Performance
**Prioridade:** P1

## Problema

Frontend e backend estão em produção (Vercel + Render) há semanas com hardening pontual (CORS + rate limit do `/chat`, na Fase 5), mas sem uma auditoria dedicada de segurança e performance cobrindo o restante da superfície: headers HTTP, dependências desatualizadas, cold start do plano gratuito do Render, orçamento de performance do site como um todo. O client OpenAI ainda usa timeout implícito do SDK ([ADR-004](../architecture/ADR-004-resiliencia-backend-chat.md) Aceita, código pendente).

## Objetivo

Auditoria formal de segurança e performance concluída, com achados classificados por severidade e virando histórias concretas de correção — não um épico "faça tudo melhor" sem critério de aceite verificável. Fechar a lacuna de resiliência do `/chat` (timeout + retry limitado) e decidir mitigação de cold start com custo explícito.

## Escopo

### Incluído
- Auditoria de segurança: headers HTTP (CSP, HSTS, X-Content-Type-Options etc.), CORS em todos os endpoints (não só `/chat`), dependências desatualizadas/vulneráveis (`npm audit`, `pip-audit`/`safety`), exposição de docs OpenAPI em produção
- Auditoria de performance: Lighthouse (Home `/` — única page App Router hoje), tamanho de bundle, cache de assets estáticos
- Mitigação de cold start do backend no Render free tier ([ADR-008](../architecture/ADR-008-mitigacao-cold-start-render.md))
- Timeout explícito e retry limitado no client OpenAI (`rag.get_client()`) — [ADR-004](../architecture/ADR-004-resiliencia-backend-chat.md)

### Incluído (adicional — `ADR-004`)
- Timeout explícito e curto no client OpenAI (`rag.get_client()`) usado pelo `/chat` — hoje sem override, cai no default do SDK (minutos), risco real de travar o único worker do Render free tier
- Retry único e limitado (só erro transitório 429/503, sem backoff) no mesmo client — refina, sem contradizer, a diretriz "sem retry agressivo" já registrada em `ai-architecture-patterns.md`

### Excluído
- Migração de hospedagem por gosto (o `ADR-002` já decide Render/Vercel — Cloud Run só como opção C da US-08-03 / ADR-008)
- WAF/CDN dedicado — fora de proporção para um projeto pessoal gratuito
- Circuit breaker e bulkhead no backend — avaliados em `ADR-004` e descartados
- Cache-aside de respostas do `/chat` — ideia futura em `ADR-004`, não história ativa
- Timeout no `fetch` do frontend / proxy Vercel — fora do ADR-004 (opcional futuro)
- Histórias filhas de correção nascidas das auditorias — criadas **depois** dos spikes (US-08-01 / US-08-04)

## Persona

Visitante/recrutador (experiência de carregamento) e o próprio autor (superfície de ataque do site).

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| Auditoria de segurança do frontend e backend (headers, dependências, CORS, docs) | P1 | [US-08-01](backlog/fase-08/US-08-01-auditoria-seguranca.md) |
| Timeout e retry limitado no client de IA do `/chat` (`ADR-004`) | P2 | [US-08-02](backlog/fase-08/US-08-02-timeout-retry-openai.md) |
| Plano de mitigação de cold start do backend gratuito (Render free tier) | P2 | [US-08-03](backlog/fase-08/US-08-03-mitigacao-cold-start-render.md) |
| Auditoria de performance (Lighthouse Home, bundle, cache) | P2 | [US-08-04](backlog/fase-08/US-08-04-auditoria-performance.md) |
| Atualizar `nanoid` transitivo (`npm audit fix`) | P1 | [US-08-05](backlog/fase-08/US-08-05-atualizar-nanoid-transitivo.md) |
| Desativar documentação OpenAPI em produção | P1 | [US-08-06](backlog/fase-08/US-08-06-desativar-docs-openapi-producao.md) |
| Headers de segurança HTTP (frontend e backend) | P1 | [US-08-07](backlog/fase-08/US-08-07-headers-seguranca-http.md) |
| Atualizar FastAPI/Starlette (e deps de dev com CVE) | P2 | [US-08-08](backlog/fase-08/US-08-08-atualizar-fastapi-starlette.md) |
| Reduzir payload de JS client-side da Home | P2 | [US-08-10](backlog/fase-08/US-08-10-reduzir-payload-js-home.md) |
| Corrigir prefetch indevido do botão de download do CV | P3 | [US-08-11](backlog/fase-08/US-08-11-fix-prefetch-download-cv.md) |

Nota: US-08-01 e US-08-04 são spikes — o resultado decide se nascem histórias de correção específica (achado por achado). US-08-02 pode rodar em paralelo aos spikes (lacuna já decidida no ADR-004). US-08-03 depende da escolha de custo do autor (A/B/C ou aceitar risco — ADR-008). US-08-05 a US-08-08 nasceram dos achados da auditoria US-08-01 (ver nota abaixo). US-08-10 e US-08-11 nasceram dos achados da auditoria US-08-04 (ver nota abaixo).

### Histórias filhas propostas (achados de US-08-01)

Origem: `docs/qa/QA-005-auditoria-seguranca.md`. Formalizadas em **US-08-05 a US-08-08** em 2026-08-15, cada uma com DoR próprio fechado — ver arquivos linkados na tabela "Histórias" acima.

Achado Low L1 (`python-dotenv`/`pytest`/`black`, uso local/dev) — agrupado na US-08-08 junto com o bump de Starlette (achado L2), conforme sugerido no relatório do QA.

### Histórias filhas propostas (achados de US-08-04)

Origem: `docs/qa/QA-006-auditoria-performance.md`. Formalizadas em **US-08-10 e US-08-11** em 2026-08-16, cada uma com DoR próprio fechado — ver arquivos linkados na tabela "Histórias" acima.

Achado Medium M1 (LCP mobile 2,9s / TBT / FID por JS pesado no chunk da Home) → US-08-10 (agrupa também o achado Low L2, polyfills legados, mesma causa raiz). Achado Low L1 (404 de console por prefetch do `next/link` no botão de download do CV) → US-08-11. Achado Low L3 (CSS render-blocking, 150 ms mobile) — aceitar risco, sem história filha (ganho pequeno, desproporcional para o tamanho do projeto).

## Ordem sugerida de implementação (após aprovação do discover)

1. **US-08-01** (P1 — spike segurança) e/ou **US-08-02** (timeout — paralelo)
2. **US-08-04** (spike performance)
3. **US-08-03** (cold start — após decisão de custo do autor)
4. US filhas de correção (se houver) — DoR próprio por achado; as nascidas de **US-08-01** já formalizadas (US-08-05 a US-08-08); as de **US-08-04** (performance), se houver, seguem o mesmo processo quando o spike rodar

## Riscos

- Épico "segurança e performance" sem escopo é terreno fértil para virar trabalho infinito — o guardrail é: toda correção nasce de um achado real da auditoria, não de suposição
- Mitigar cold start pode exigir gasto (upgrade de plano) — decisão de custo cabe ao autor (`ADR-008`)
- Keep-alive no free tier pode conflitar com limites/ToS do Render — registrar e reavaliar se a plataforma restringir

## DoR do épico

- [x] Toda história do épico tem seu próprio DoR fechado
- [x] Tasks decompostas (`references/task-breakdown-guide.md`)
- [x] Auditoria (spike) rodada antes de criar histórias de correção específicas — US-08-01 (segurança) Done, histórias filhas formalizadas (US-08-05 a US-08-08); US-08-04 (performance) Done, histórias filhas formalizadas (US-08-10 e US-08-11)
