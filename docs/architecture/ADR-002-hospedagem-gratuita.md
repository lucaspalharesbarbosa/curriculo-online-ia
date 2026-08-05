# ADR-002: Hospedagem gratuita (frontend + backend)

## Status
Aceita

## Contexto

O Currículo Online é um produto pessoal solo: site Next.js + backend FastAPI (RAG na Fase 05), com meta explícita de **hospedagem gratuita**. O `ADR-001` já citava Vercel (frontend) e Render/Cloud Run (backend), mas sem trade-off formal das alternativas free-tier.

Antes do deploy inicial ([US-03-17](../product/backlog/fase-03/US-03-17-deploy-inicial-vercel.md)) e do deploy do backend ([US-05-08](../product/backlog/fase-05/US-05-08-deploy-backend.md)), a decisão precisa estar registrada: existem opções “melhores” que a Vercel no free tier? Em quais critérios?

**Requisitos que a hospedagem precisa atender:**

1. Custo $0 sustentado (não só crédito de trial)
2. Next.js (App Router) com DX previsível no monorepo (`frontend/` como Root Directory)
3. Caminho futuro para não expor chave de API no client (Serverless Function e/ou BFF → FastAPI)
4. Backend Python/FastAPI com deploy a partir de `backend/`
5. Complexidade proporcional a projeto solo — sem Kubernetes, Terraform ou multi-cloud

## Decisão

Manter a combinação já esboçada no planejamento inicial, agora formalizada:

| Camada | Plataforma | Plano |
|---|---|---|
| **Frontend** | **Vercel** | Hobby (gratuito) — Root Directory = `frontend/` |
| **Backend** | **Render** (preferência) | Free web service — build a partir de `backend/` |
| **Backend (alternativa)** | Google Cloud Run | Free tier generoso — só se cold start do Render ou limites do free tier atrapalharem o chat |

Domínio customizado continua fora de escopo do MVP (`.vercel.app` + URL do Render bastam).

## Alternativas consideradas — Frontend

| Alternativa | Prós | Contras | Veredito para este projeto |
|---|---|---|---|
| **Vercel (Hobby)** | Criadora do Next.js; App Router / Server Actions / Image Optimization sem adapter; git-push deploy; preview de PR; Functions para proxy de API no futuro; 100 GB bandwidth e minutos de build generosos para portfólio de baixo tráfego | Hobby restrito a uso **pessoal/não comercial** (ok para currículo); bandwidth capped vs Cloudflare; Pro caro se um dia virar produto pago | **Escolhida** |
| **Netlify** | Free tier maduro; Functions; commercial use ok no free; DX de deploy semelhante | Next.js via runtime próprio — ocasionalmente atrás da Vercel em features novas; menos “zero-config” para App Router | Alternativa sólida se Vercel Hobby deixar de servir |
| **Cloudflare Pages (+ Workers / OpenNext)** | Bandwidth ilimitado no free; edge global forte; commercial use ok; custo excelente em escala | Next.js exige adapter (`@opennextjs/cloudflare` / fluxo Pages); DX menos polida; risco de fricção com APIs Node-específicas — custo cognitivo alto para projeto solo | Melhor se tráfego/custo virarem problema; **não** agora |
| **GitHub Pages** | Grátis, nativo do GitHub, simples | Só estático; sem SSR/Serverless adequados para proxy de chat / features Next não-estáticas | Descartada (já no ADR-001) |
| **Azure Static Web Apps** | Free tier generoso | Ecossistema mais natural com .NET; pouco ganho vs Vercel para Next.js puro | Descartada para este stack |

## Alternativas consideradas — Backend (FastAPI)

| Alternativa | Prós | Contras | Veredito para este projeto |
|---|---|---|---|
| **Render (free)** | Free tier real contínuo; sem cartão em muitos casos; deploy Git + `requirements.txt`; Python nativo; alinhado ao plano | Spin-down ~15 min idle → cold start ~30–60 s; 512 MB / 0.1 vCPU — ok para RAG leve | **Preferida para MVP do `/chat`** |
| **Google Cloud Run** | Free tier generoso (vCPU-seg / requests); scale-to-zero; cold start menor que Render free; Docker | Exige conta GCP + cartão; IAM/console mais complexos para solo | **Plano B** se cold start do Render incomodar recrutadores no chat |
| **Railway** | DX excelente | Não é free sustentado de forma confiável (crédito trial / crédito mensal mínimo insuficiente para always-on) | Descartada como “gratuita” |
| **Fly.io** | Bom para containers globais | Free tier legado; contas novas tipicamente pagas | Descartada como free |
| **Hospedar FastAPI na Vercel (serverless)** | Um só vendor | ASGI/FastAPI em serverless perde startup events, background e modelo de processo longo; embeddings em memória ficam frágeis | Descartada — backend permanece processo/container separado |

## Por que Vercel + Render é a melhor opção *aqui*

Não é “a melhor hospedagem gratuita do mundo em abstrato” — é a melhor para **este** produto:

1. **O frontend é Next.js.** A Vercel é o caminho de menor atrito: o que o App Router promete funciona sem adapter. Cloudflare/Netlify competem bem em preço/bandwidth, mas cobram em complexidade ou em atraso de features — custo ruim para um autor solo.
2. **O site é pessoal.** Hobby da Vercel cobre exatamente o caso (portfólio/currículo, não SaaS comercial). Tráfego esperado (recrutadores, LinkedIn) cabe folgado nos limites free.
3. **O diferencial (RAG) mora no Python.** Manter FastAPI num PaaS simples (Render) evita forçar o chat em Serverless Node ou em edge incompatível. Cold start no primeiro hit do chat é aceitável num currículo; se deixar de ser, sobe para Cloud Run sem mudar o código da app.
4. **Dois free tiers, um monorepo.** Front e back com Root Directory distintos, CI já separado — sem unificar em um único vendor “mágico” que piora um dos lados.
5. **Já está no caminho crítico.** US-03-17 e documentação apontam Vercel; trocar agora só por bandwidth “ilimitado” que não vamos usar é retrabalho sem valor.

**Quando reavaliar (novo ADR):**

- Tráfego ou assets estourarem o Hobby / ToS da Vercel → Cloudflare Pages ou Netlify
- Cold start do Render atrapalhar demo do chat → Cloud Run
- Domínio customizado + necessidade comercial → planos pagos (fora do escopo atual)

## Consequências

- [US-03-17](../product/backlog/fase-03/US-03-17-deploy-inicial-vercel.md) segue com Vercel; DoR de ADR passa a apontar este documento
- [US-05-08](../product/backlog/fase-05/US-05-08-deploy-backend.md) prioriza Render free; Cloud Run documentado como fallback
- CORS: origem do frontend (`.vercel.app` ou domínio futuro) liberada no FastAPI
- Segredos de IA só no backend (e, se houver proxy, em env da Vercel Function) — nunca no bundle client ([US-05-09](../product/backlog/fase-05/US-05-09-env-vars-segredos.md))
- `docs/agents/CONTEXTO-PROJETO.md` e `PRD-004` refletem esta ADR (Aceita)
- Não introduz IaC pesada; deploy via UI/Git das plataformas free

## Referências

- `docs/agents/CONTEXTO-PROJETO.md` (seção Hospedagem)
- [ADR-001](ADR-001-stack-inicial-monorepo.md) (stack; hospedagem citada sem trade-off)
- `docs/product/PRD-004-deploy.md`
- [US-03-17](../product/backlog/fase-03/US-03-17-deploy-inicial-vercel.md), [US-05-08](../product/backlog/fase-05/US-05-08-deploy-backend.md)
