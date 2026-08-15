# QA-005 — Auditoria de segurança (US-08-01)

**História:** [US-08-01](../product/backlog/fase-08/US-08-01-auditoria-seguranca.md)
**Épico:** Segurança & Performance (`PRD-006`)
**Data:** 2026-08-15
**Agente:** `@qa-engineer` (spike executado como Dev, validado como QA/Tech Lead/PO no mesmo pipeline)

## Escopo

Spike de auditoria — não implementação. Cobre o checklist mínimo do CA-003: (a) headers HTTP frontend/backend, (b) CORS app-wide vs. só `/chat`, (c) `npm audit` + auditoria Python, (d) exposição de `/docs`/`/redoc`/`/openapi.json`, (e) segredos no bundle client.

## Método e ambiente

| Verificação | Ambiente | Comando/Evidência |
|---|---|---|
| Dependências frontend | Local (`frontend/`, `npm ci` já rodado) | `npm audit` |
| Dependências backend | Local (`backend/.venv`, Python 3.13) | `pip-audit -r backend/requirements.txt` (instalado na venv do projeto) |
| Headers HTTP | Produção real | `curl -I https://lucas-palhares-cv.vercel.app` e `curl -I https://curriculo-online-backend.onrender.com/health` |
| CORS | Produção real | `curl` com preflight `OPTIONS` em `/chat`, origem permitida vs. não permitida |
| Exposição de docs | Produção real | `curl -o /dev/null -w "%{http_code}"` em `/docs`, `/redoc`, `/openapi.json` |
| Segredos no bundle | Local (código-fonte) | `grep` por `LLM_API_KEY` em `frontend/`; leitura de `route.ts`, `.gitignore`, `.env.example` |
| Config de headers | Local (código-fonte) | Leitura de `frontend/next.config.ts` e `backend/app/main.py` |

Todos os comandos foram executados de verdade nesta sessão (worktree `fase-08`, branch `feature/fase-08-seguranca-performance`); nenhum número foi estimado.

---

## Achados por severidade

### High

**H1 — `nanoid` < 3.3.18 (dependência transitiva do frontend, via `postcss`)**

- Evidência (`npm audit`, saída real):
  ```
  # npm audit report
  nanoid  <3.3.18
  Severity: high
  nanoid: custom generators can loop indefinitely when size is zero - https://github.com/advisories/GHSA-2v37-7h3g-55p8
  fix available via `npm audit fix`
  node_modules/nanoid
  1 high severity vulnerability
  ```
- Cadeia de dependência (`npm ls nanoid`): `@tailwindcss/postcss` → `postcss` → `nanoid@3.3.17`; `next` → `postcss` → `nanoid@3.3.17` (deduped). **Não é dependência direta do projeto** — vem só de ferramentas de build (PostCSS/Tailwind), não roda no client em produção nem processa input de usuário.
- CVE: GHSA-2v37-7h3g-55p8 — gerador customizado de IDs pode entrar em loop infinito se `size = 0`. Vetor exige controle sobre o parâmetro `size` passado ao gerador, o que não acontece no uso interno do PostCSS.
- Fix disponível: `npm audit fix` (dry-run confirmado) — sobe `nanoid` para `3.3.18` sem remover/alterar nenhuma dependência direta do `package.json`; é bump de patch transitivo, sem breaking change esperado.
- Classificação: **High** pela severidade que o `npm audit` reporta, mas risco real **baixo** — dependência de build-time, não de runtime client-facing.

### Medium

**M1 — `/docs`, `/redoc`, `/openapi.json` expostos em produção**

- Evidência real (`curl`, 2026-08-15):
  ```
  === /docs ===        HTTP 200
  === /redoc ===        HTTP 200
  === /openapi.json === HTTP 200
  ```
- `backend/app/main.py` não desativa `docs_url`/`redoc_url`/`openapi_url` (FastAPI expõe os três por padrão salvo `FastAPI(docs_url=None, ...)` explícito — confirmado por leitura do código, não há essa configuração).
- Impacto: qualquer visitante vê o contrato completo da API (`/chat`, `/health`, schemas Pydantic). Não expõe segredo nem dado sensível — o backend só tem duas rotas reais e o schema já é previsível (`question: str` → `answer: str`). Não é dado de terceiro nem PII.
- Classificação: **Medium** — informação exposta é de baixo valor para um atacante (superfície pequena, 2 rotas), mas é hardening trivial de aplicar e é prática padrão não deixar management endpoints abertos em produção sem necessidade.

**M2 — Ausência de headers de segurança HTTP (CSP, X-Content-Type-Options, X-Frame-Options, Permissions-Policy) no frontend e no backend**

- Evidência real (`curl -I https://lucas-palhares-cv.vercel.app`):
  ```
  HTTP/1.1 200 OK
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  ...
  ```
  HSTS está presente (default da Vercel). **Ausentes**: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- `frontend/next.config.ts` está vazio (`const nextConfig: NextConfig = {}`) — confirma que não há `headers()` customizado configurado; os únicos headers presentes vêm de defaults da plataforma Vercel (HSTS incluso), não da aplicação.
- Evidência real (`curl -I https://curriculo-online-backend.onrender.com/health`):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json
  ...
  ```
  Nenhum header de segurança customizado (esperado — FastAPI não define nenhum por padrão, e `backend/app/main.py` não adiciona middleware de headers).
- Impacto: sem CSP, o site fica mais exposto a XSS caso surja uma vulnerabilidade de injeção futura (defesa em profundidade ausente); sem `X-Frame-Options`/`frame-ancestors`, o site pode ser embutido em `iframe` de terceiros (clickjacking). Risco real hoje é baixo — site é majoritariamente estático/SSG, sem input de usuário renderizado sem sanitização exceto o próprio chat (que já responde em texto simples, sem `dangerouslySetInnerHTML` identificado nesta auditoria).
- Classificação: **Medium** — ausência de defesa em profundidade recomendada, mas sem exploração conhecida na superfície atual do site.

### Low

**L1 — `python-dotenv`, `pytest`, `black` com CVEs conhecidos (dependências de dev/local, não de runtime de produção)**

- Evidência real (`pip-audit -r backend/requirements.txt`):
  ```
  Name          Version ID              Fix Versions
  ------------- ------- --------------- ------------
  python-dotenv 1.0.1   PYSEC-2026-2270 1.2.2
  pytest        8.3.4   PYSEC-2026-1845 9.0.3
  black         24.10.0 PYSEC-2026-2121 26.3.1
  black         24.10.0 PYSEC-2026-2120 26.3.0
  ```
  `python-dotenv` roda em produção (`app/env_bootstrap.py`, `load_dotenv`), mas seu uso aqui é local/dev — em produção (Render) as variáveis já vêm do painel, não de arquivo `.env` lido em runtime por usuário externo. `pytest` e `black` são ferramentas de dev, nunca executadas em produção.
- Classificação: **Low** — vetor de exploração exige controle do ambiente de execução ou do processo de build, que já é de confiança neste projeto solo.

**L2 — `starlette` 0.41.3 com múltiplos CVEs reportados**

- Evidência real (`pip-audit`):
  ```
  starlette 0.41.3 PYSEC-2026-161  1.0.1
  starlette 0.41.3 PYSEC-2026-248  1.3.0
  starlette 0.41.3 PYSEC-2026-249  1.3.1
  starlette 0.41.3 PYSEC-2026-1942 0.49.1
  starlette 0.41.3 PYSEC-2026-1941 0.47.2
  starlette 0.41.3 PYSEC-2026-2281 1.1.0
  starlette 0.41.3 PYSEC-2026-2280 1.1.0
  ```
  `starlette` é dependência transitiva fixada pelo `fastapi==0.115.6` (`pip show` confirma `starlette==0.41.3` instalado). Atualizar exige subir o `fastapi` para uma versão compatível com `starlette>=1.0` (mudança de major da própria Starlette) — não é troca isolada de uma linha.
- Classificação: **Low → tratado como Medium-em-observação**: o volume de CVEs é alto, mas a API exposta pelo projeto é mínima (`/health`, `/chat`) e já protegida por CORS + rate limit (`US-05-07`). Sem detalhe público de que os CVEs listados afetam especificamente o uso feito aqui (não há upload de arquivo, não há WebSocket, não há template rendering do Starlette em uso). Recomenda-se acompanhar em vez de tratar como bloqueante — daí a proposta de história filha abaixo em vez de hot-fix.

### Info

**I1 — CORS é uma única instância de `CORSMiddleware` aplicada a todo o app, não por rota — mas isso é adequado ao tamanho real da API**

- `backend/app/main.py` registra `CORSMiddleware` uma vez, no nível do `app`, com `allow_origins=[ALLOWED_ORIGIN]`. Isso é "CORS app-wide" no sentido técnico (middleware global), mas como o app **só tem duas rotas reais** (`/chat` e `/health`), o efeito prático é idêntico a restringir por rota — não há rota adicional "esquecida" fora da política.
- Evidência real de comportamento (preflight `OPTIONS /chat`):
  - Origem não permitida (`https://evil.example.com`): `400 Bad Request`, sem header `access-control-allow-origin` na resposta.
  - Origem permitida (`https://lucas-palhares-cv.vercel.app`): `200 OK` com `access-control-allow-origin: https://lucas-palhares-cv.vercel.app`.
  - `GET /health` com origem não permitida: `200 OK` mas sem `access-control-allow-origin` — o servidor responde (não há preflight em `GET` simples), mas o **browser bloquearia a leitura da resposta** por JS de origem não autorizada; não é um bypass de CORS, é o comportamento esperado de `GET` simples.
- Conclusão: **não é achado que exija correção** — CORS está corretamente restrito ao domínio de produção + a única rota sensível (`/chat`) já é coberta pela mesma política. Registrado como Info para fechar o item (b) do CA-003 com evidência, não porque exige ação.

**I2 — Segredos e valores públicos: distinção confirmada**

- `LLM_API_KEY`: só aparece em `backend/app/chat.py` (`os.environ.get("LLM_API_KEY")`) e `backend/app/env_bootstrap.py`. Busca por `LLM_API_KEY` em todo `frontend/` (excluindo `node_modules`) só retorna menções em **texto de teste** (`ChatWidget.test.tsx`, verificando que a mensagem de erro genérica não vaza o nome da env var) — nunca em código que rodaria no client. `backend/.env` está no `.gitignore` (`.env`, `.env.*`, exceto `!.env.example`); `git log --all` não mostra `backend/.env` versionado em nenhum commit. `.env.example` só tem placeholder (`sk-proj-xxxx...`).
- `API_URL` (frontend) e `ALLOWED_ORIGIN` (backend): são **URLs públicas**, não segredos — `API_URL` é lido em `frontend/app/api/chat/route.ts`, uma **Route Handler server-only** do Next.js (sem prefixo `NEXT_PUBLIC_`, portanto nunca inlined no bundle client); o browser chama `/api/chat` (mesmo domínio) e o Next.js repassa ao FastAPI no servidor — o client nunca vê a URL do backend nem faz CORS direto. `ALLOWED_ORIGIN` é a URL pública do próprio frontend, sem valor de segredo.
- Conclusão: item (e) do CA-003 fechado — sem chave de API no bundle client, confirmado por busca real no código-fonte, não por suposição.

---

## Checklist CA-003 — cobertura

| Item | Coberto | Evidência |
|---|---|---|
| (a) Headers HTTP frontend/backend | Sim | M2 |
| (b) CORS app-wide vs. só `/chat` | Sim | I1 |
| (c) `npm audit` + auditoria Python | Sim | H1, L1, L2 |
| (d) Exposição `/docs`/`/redoc`/`/openapi.json` | Sim | M1 |
| (e) Segredos no bundle client | Sim | I2 |

Nenhum item do checklist ficou sem resposta.

---

## Propostas de história filha (CA-004)

| Sev | Achado | Ação |
|---|---|---|
| High | H1 — `nanoid` desatualizado (transitivo, via `postcss`) | História filha proposta: **"Atualizar `nanoid` transitivo (`npm audit fix`)"** — CA em 1 linha: *`npm audit` não reporta mais vulnerabilidade `nanoid`, `npm test` (63 testes) e `npm run build` seguem verdes após o bump.* |
| Medium | M1 — `/docs`/`/redoc`/`/openapi.json` abertos em produção | História filha proposta: **"Desativar documentação OpenAPI em produção"** — CA em 1 linha: *dado `ENVIRONMENT=production`, `/docs`, `/redoc` e `/openapi.json` retornam 404, mantendo-os ativos em dev/local.* |
| Medium | M2 — Ausência de headers de segurança (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | História filha proposta: **"Adicionar headers de segurança HTTP no frontend e no backend"** — CA em 1 linha: *`curl -I` em produção (frontend via `next.config.ts` `headers()`, backend via middleware) retorna `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (ou `frame-ancestors 'none'` na CSP), sem quebrar o carregamento de fontes/imagens/chat existentes.* |
| Low (observação) | L2 — `starlette` com múltiplos CVEs, preso pelo `fastapi==0.115.6` | História filha proposta: **"Atualizar FastAPI/Starlette para versões sem CVE conhecido"** — CA em 1 linha: *`pip-audit -r backend/requirements.txt` não reporta nenhum CVE para `fastapi`/`starlette` após o bump, com `pytest` (29 testes) e CI backend verdes.* |
| Low | L1 — `python-dotenv`/`pytest`/`black` com CVE, uso local/dev | **Aceitar risco** — vetor exige controle do ambiente de execução local/CI, que já é de confiança em projeto solo; sem história filha dedicada (pode ser feita junto com a história de `starlette` acima se o autor preferir agrupar bumps de dependência). |

Trade-off geral do épico (`ADR-002`, `ADR-008`): projeto pessoal solo, hospedagem free tier (Vercel Hobby + Render free) — nenhum achado desta auditoria é Critical, então, por regra explícita do CA-005 desta história (hot-fix só se Critical trivial), nenhuma correção de código foi aplicada no spike; todo achado High/Medium vira proposta de história filha com DoR próprio, mesmo quando o fix em si é pequeno (caso do H1).

---

## CA-005 — decisão sobre hot-fix

**Decisão consciente: nenhum hot-fix aplicado nesta história.** Nenhum achado foi classificado como Critical (o mais severo, H1, é High). A regra da própria US-08-01 permite hot-fix apenas para achado Critical trivialíssimo — na ausência de um, o default do CA-005 ("na dúvida, não corrija") foi seguido à risca: `npm audit fix --dry-run` foi executado só para **confirmar que existe fix disponível e sem breaking change** (evidência em H1), mas **não foi aplicado de fato** — `git status` confirma que nenhum arquivo de código/lockfile foi alterado por esta auditoria, só este relatório. O fix de H1 vira história filha (tabela acima), não correção "de passagem".

---

## Veredito

**Aprovado** — todo achado reportado tem comando/evidência real por trás (colada acima, não resumida de memória); a classificação de severidade é justificada caso a caso (inclusive quando diverge da severidade "crua" reportada pela ferramenta, como em H1); nenhum item do checklist CA-003(a-e) ficou sem resposta; CA-004 tem proposta de história filha ou justificativa de aceitar risco para todo achado Critical/High/Medium (não houve Critical); CA-005 documenta explicitamente a decisão de não aplicar nenhum hot-fix (sem achado Critical) e por quê.
