# curriculo-online-ia
Currículo pessoal com assistente de IA (RAG) sobre minha trajetória. Construído com pipeline de agentes de IA (PO, arquiteto, dev, QA, tech lead) e boas práticas de engenharia de software. Frontend em Next.js, backend em Python/FastAPI.

## Variáveis de ambiente / segredos

Nenhum valor real é commitado no repositório — cada serviço tem seu `.env.example` (sem valores reais) e as chaves de fato ficam configuradas no painel da respectiva plataforma de hospedagem.

| Variável | Serviço | Onde configurar | Segredo? |
|---|---|---|---|
| `LLM_API_KEY` | Backend | `backend/.env` local (dev) / painel do **Render** → Environment (produção) | Sim — chave da OpenAI (embeddings + geração, [ADR-003](docs/architecture/ADR-003-fluxo-rag.md) seção 5) |
| `ALLOWED_ORIGIN` | Backend | `backend/.env` local (dev) / painel do **Render** → Environment (produção) | Não — só a origem permitida no CORS do `/chat` |
| `NEXT_PUBLIC_API_URL` | Frontend | `frontend/.env.local` local (dev) / painel da **Vercel** → Project Settings → Environment Variables (produção) | Não — URL pública do backend, embutida no bundle do client |
| `NEXT_PUBLIC_SITE_URL` | Frontend | `frontend/.env.local` local (dev) / painel da **Vercel** → Project Settings → Environment Variables (produção) | Não — URL pública do site, usada em metadata/Open Graph |

Setup local: copiar `backend/.env.example` → `backend/.env` e `frontend/.env.example` → `frontend/.env.local`, preenchendo com valores reais (a chave da OpenAI é a única de fato sensível). Detalhes de deploy do backend: [`backend/README.md`](backend/README.md#deploy).
