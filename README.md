# curriculo-online-ia
Currículo pessoal com assistente de IA (RAG) sobre minha trajetória. Construído com pipeline de agentes de IA (PO, arquiteto, UX designer sob pedido, dev, QA, tech lead) e boas práticas de engenharia de software. Frontend em Next.js, backend em Python/FastAPI.

## Variáveis de ambiente / segredos

Nenhum valor real é commitado no repositório — cada serviço tem seu `.env.example` (sem valores reais) e as chaves de fato ficam configuradas no painel da respectiva plataforma de hospedagem.

| Variável | Serviço | Onde configurar | Segredo? |
|---|---|---|---|
| `LLM_API_KEY` | Backend | **Dev:** `backend/.env`. **Produção / fonte do valor:** [Render](https://dashboard.render.com) → Web Service **`curriculo-online-backend`** → **Environment** → variável **`LLM_API_KEY`** (revelar/copiar no painel e colar no `.env` local se for o caso) | Sim — chave da OpenAI (embeddings + geração, [ADR-003](docs/architecture/ADR-003-fluxo-rag.md) seção 5) |
| `ALLOWED_ORIGIN` | Backend | `backend/.env` local (dev) / Render → `curriculo-online-backend` → Environment (produção) | Não — só a origem permitida no CORS do `/chat` |
| `NEXT_PUBLIC_API_URL` | Frontend | `frontend/.env.local` local (dev) / painel da **Vercel** → Project Settings → Environment Variables (produção) | Não — URL pública do backend, embutida no bundle do client |
| `NEXT_PUBLIC_SITE_URL` | Frontend | `frontend/.env.local` local (dev) / painel da **Vercel** → Project Settings → Environment Variables (produção) | Não — URL pública do site, usada em metadata/Open Graph |

Setup local: o backend cria `backend/.env` a partir de `.env.example` na primeira subida. Preencha `LLM_API_KEY` com o valor da secret no Render (caminho acima) ou com uma chave nova da [OpenAI Platform](https://platform.openai.com/api-keys). Detalhes: [`backend/README.md`](backend/README.md#setup-local-obrigatório-para-o-chat).
