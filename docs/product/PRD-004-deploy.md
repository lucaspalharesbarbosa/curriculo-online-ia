# PRD-004 — Deploy

**Status:** Done (CI real, deploy Vercel e Render — Fases 02, 03 e 05)
**Épico:** Deploy
**Prioridade:** P1 (CI real) / P2 (deploy inicial) / P3 (deploy do backend com RAG)

## Problema

CI e hospedagem são esqueleto (Fase 0): workflows existem mas só com lint placeholder, e nada está publicado ainda. Sem isso, cada feature entregue não tem como ser validada automaticamente nem vista no ar.

## Objetivo

`frontend-ci.yml` e `backend-ci.yml` rodam lint + build/testes reais a cada PR; o site (mesmo incompleto) está publicado na Vercel; o backend é publicado quando o `/chat` existir.

## Escopo

### Incluído
- Conectar os workflows de CI já existentes ao lint/build/teste reais de cada serviço
- Deploy do frontend na Vercel (Root Directory = `frontend/`) — decisão formalizada em [ADR-002](../architecture/ADR-002-hospedagem-gratuita.md)
- Deploy do backend no Render free (preferência) ou Cloud Run (fallback), Root Directory = `backend/`, quando o épico RAG tiver o esqueleto do FastAPI — ver ADR-002
- Variáveis de ambiente / segredos documentados (nunca no client)

### Excluído
- Domínio customizado (fica no `.vercel.app` gratuito por enquanto, conforme seção 7 do plano)
- Infra além de free tier (sem Kubernetes/Terraform — fora de proporção)

## Persona

Visitante/recrutador acessando o site publicado; o próprio autor validando PRs via CI.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| Conectar `frontend-ci.yml` ao lint + build reais | P1 | [US-02-03](backlog/fase-02/US-02-03-ci-frontend-real.md) |
| Conectar `backend-ci.yml` ao lint + testes reais | P1 | [US-02-04](backlog/fase-02/US-02-04-ci-backend-real.md) |
| Deploy inicial do frontend na Vercel | P2 | [US-03-17](backlog/fase-03/US-03-17-deploy-inicial-vercel.md) |
| Deploy do backend no Render/Cloud Run | P3 | [US-05-08](backlog/fase-05/US-05-08-deploy-backend.md) |
| Documentar variáveis de ambiente / segredos | P3 | [US-05-09](backlog/fase-05/US-05-09-env-vars-segredos.md) |

## Riscos

- US-02-03/US-02-04 dependem do esqueleto de cada app existir (US-02-01 no Frontend, US-02-02 no RAG) — sem código para lintar/buildar, o workflow não tem o que rodar de fato.
- US-05-08 só faz sentido publicar quando o backend tiver ao menos o esqueleto (US-02-02); antes disso não há nada relevante para hospedar.

## DoR
- [x] Critérios de aceite claros
- [x] ADR se envolve decisão de stack nova — [ADR-002](../architecture/ADR-002-hospedagem-gratuita.md) (hospedagem gratuita; Aceita)
- [x] Tasks decompostas (ver `docs/product/backlog/fase-02/`, `fase-03/US-03-17-deploy-inicial-vercel.md` e `fase-05/`)
