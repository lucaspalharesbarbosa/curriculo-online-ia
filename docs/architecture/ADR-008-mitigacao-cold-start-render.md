# ADR-008 — Mitigação de cold start do backend (Render free)

## Status

Aceita — decisão final do autor em [US-08-03](../product/backlog/archive/fase-08/US-08-03-mitigacao-cold-start-render.md) (2026-08-15): **aceitar risco**, sem mitigação ativa (ver seção "Decisão do autor" abaixo)

## Contexto

O backend FastAPI roda no **Render free** ([ADR-002](ADR-002-hospedagem-gratuita.md)): após ~15 min de inatividade o serviço hiberna; o próximo request sofre cold start típico de ~30–60 s. Impacto direto na **primeira** pergunta do `/chat` — pior impressão para recrutador.

Já existe `GET /health` (`backend/app/main.py`) e `healthCheckPath: /health` no `render.yaml` — suficiente para readiness do deploy, **insuficiente** para impedir hibernação (o health check da plataforma não substitui tráfego periódico externo no free tier).

`PRD-006` / [US-08-03](../product/backlog/archive/fase-08/US-08-03-mitigacao-cold-start-render.md) pedem plano de mitigação sem reabrir hospedagem “por gosto” — só com trade-off explícito de custo.

## Decisão

| Opção | O quê | Custo | Quando |
|---|---|---|---|
| **A — Keep-alive gratuito (recomendado default)** | Monitor externo (ex.: UptimeRobot, cron-job.org, GitHub scheduled workflow apontando só a `/health`) com intervalo **&lt; 14 min** | $0 | Primeira tentativa; proporcional a projeto solo |
| **B — Upgrade Render** | Plano pago always-on | Pago mensal | Se A for bloqueado pelo ToS/limites do free ou insuficiente |
| **C — Migrar Cloud Run** | Plano B já previsto no ADR-002 | Free tier GCP (cartão/conta) | Se A falhar e B não valer a pena; exige novo esforço de deploy |

**Recomendação:** começar por **A**. Ping **somente** `GET /health` (barato, sem OpenAI/embeddings). Não usar `POST /chat` como keep-alive (custo de LLM + rate limit).

**Aceitar risco** (não mitigar) é válido se o autor registrar explicitamente na US-08-03 — cold start permanece trade-off do free tier.

Fora desta ADR: mudar código do RAG, aumentar timeout do client OpenAI ([ADR-004](ADR-004-resiliencia-backend-chat.md) / US-08-02), WAF/CDN.

## Alternativas consideradas

| Alternativa | Prós | Contras | Veredito |
|---|---|---|---|
| Keep-alive em `/health` (A) | $0, simples, sem mudar app | Depende de ToS/limites do Render free e do monitor; pode “acordar” o free tier além do uso orgânico | **Escolhida como default** |
| Render paid (B) | Always-on previsível | Custo contínuo para portfólio de baixo tráfego | Reserva se A insuficiente |
| Cloud Run (C) | Cold start em geral menor; ADR-002 já prevê | Setup GCP + cartão; migração de env/deploy | Plano B de hospedagem, não primeiro passo |
| Cron interno na app | Controle no repo | Free tier ainda hiberna o processo — cron interno não roda dormindo | Descartada |
| Ping em `/chat` | “Exercita” o caminho real | Gasta LLM, polui rate limit, risco de custo OpenAI | Descartada |

## Decisão do autor (US-08-03)

Volumetria atual do site é baixíssima (poucos visitantes/dia). Manter a opção A (keep-alive) rodando 24h/dia para evitar um cold start que, na prática, raramente seria atingido (poucas visitas já reduzem a chance de coincidir com o servidor hibernado) é desproporcional: gasta instance-hours do Render continuamente, adiciona uma dependência externa (conta de monitor) e vai contra o próprio propósito do free tier (hibernar app ocioso).

**Decisão: aceitar o risco.** Sem keep-alive, sem upgrade, sem migração. Cold start (~30–60s na primeira mensagem após idle) permanece um trade-off consciente do free tier enquanto o tráfego for baixo.

Reabrir esta ADR se o volume de acesso crescer de forma sustentada (ex.: divulgação ativa em processo seletivo) — nesse cenário, a opção A (keep-alive) volta a ser a recomendação default.

## Consequências

- US-08-03 implementa A (ou B/C / aceitar risco) e documenta ferramenta + intervalo em `backend/README.md` **sem** credenciais no git
- Não introduz lib nova no monorepo para o caminho A (config externa)
- Reabrir esta ADR se o Render mudar política de free tier ou se o keep-alive for considerado abuso pela plataforma
- Migração Cloud Run, se escolhida, atualiza ADR-002 / deploy docs no mesmo esforço da US-08-03

## Referências

- [ADR-002](ADR-002-hospedagem-gratuita.md)
- [ADR-004](ADR-004-resiliencia-backend-chat.md) (timeout — complementar, não substitui cold start)
- `docs/product/PRD-006-seguranca-performance.md`
- [US-08-03](../product/backlog/archive/fase-08/US-08-03-mitigacao-cold-start-render.md)
- `backend/app/main.py` (`/health`), `render.yaml`
