# US-08-07 — Headers de segurança HTTP (frontend e backend)

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** dono do produto,
**quero** que frontend e backend enviem os headers de segurança HTTP recomendados (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy),
**para** ter defesa em profundidade contra clickjacking, MIME sniffing e XSS, mesmo sem exploração conhecida hoje, sem quebrar o carregamento de fontes/imagens/chat existentes.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (não altera request/response de nenhum endpoint; só acrescenta headers de resposta HTTP, transversal a todas as rotas)
- [x] Mapeamento de erros documentado — N/A (nenhum erro novo; headers não alteram fluxo de sucesso/falha)
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance (`PRD-006`); origem do achado: [US-08-01](US-08-01-auditoria-seguranca.md) / [`QA-005`](../../../qa/QA-005-auditoria-seguranca.md), achado M2
- [x] ADR registrado se envolve decisão de stack nova — N/A. Decisão consciente de **não** introduzir lib nova (ex.: pacote de middleware de security headers para FastAPI, ou lib de CSP para Next.js): implementação via `headers()` nativo do `next.config.ts` (frontend) e middleware custom simples em `backend/app/main.py` (backend) — escopo mínimo, sem dependência nova a manter
- [x] Variáveis de ambiente/segredos necessários identificados — N/A (política de headers é estática, sem valor sensível; não depende de env var nova)
- [x] Referência visual definida — N/A (sem UI nova; headers HTTP não são visíveis na interface)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Plano de testes

- Integração (backend): `backend/tests/test_main.py` — request a `/health` (e/ou `/chat` mockado) confirma presença de `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy` no response do middleware
- Config (frontend): `next.config.ts` `headers()` é configuração declarativa do Next.js, sem lógica testável isoladamente por unit test — validação é por smoke real (ver "Manual" abaixo), consistente com o que a própria auditoria (`QA-005`) já fez via `curl -I`
- Manual: smoke pós-deploy em produção real — `curl -I` no frontend (Vercel) e no backend (`/health`, Render) confirmando os headers; navegação manual pelo site (fontes, imagens, `ChatWidget`) sem erro de CSP no console do navegador
- Mocks: nenhum

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: `curl -I` no frontend em produção retorna `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (ou `frame-ancestors 'none'` na própria CSP), `Referrer-Policy` e `Permissions-Policy`
- [ ] CA-002: `curl -I` no backend em produção (`/health` e/ou `/chat`) retorna os mesmos headers, adicionados via middleware FastAPI
- [ ] CA-003: após o deploy, fontes, imagens e o fluxo do `ChatWidget` continuam funcionando normalmente — sem erro de CSP bloqueando recurso no console do navegador (smoke manual documentado no PR/QA)
- [ ] CA-004: HSTS **não** é duplicado/sobrescrito pela configuração nova — já vem por default da Vercel (confirmado em `QA-005`), então a política adicionada não inclui `Strict-Transport-Security` próprio
- [ ] CA-005: nenhuma dependência nova é adicionada a `package.json`/`requirements.txt` — headers implementados via `next.config.ts` `headers()` e middleware custom no FastAPI

### Fora de escopo

- Lib/pacote dedicado de security headers (ex.: `secure`, `starlette-csp`) — decisão consciente de código próprio, ver DoR acima
- CSP em modo `report-only` / endpoint de report de violação — fora de proporção para o tamanho do site
- WAF/CDN dedicado (já excluído no `PRD-006`)
- Headers de cache/performance (ETag, Cache-Control agressivo) — fora do escopo deste achado (M2 é sobre headers de segurança, não performance)

### Dependências

- [PRD-006](../../PRD-006-seguranca-performance.md)
- [US-08-01](US-08-01-auditoria-seguranca.md) (Done) — origem do achado M2
- [`QA-005`](../../../qa/QA-005-auditoria-seguranca.md) — evidência do achado (inclusive confirmação de que HSTS já vem por default da Vercel)

### Épico / Prioridade

Segurança & Performance — P1

### Tasks

- [ ] T01 Configurar `headers()` em `frontend/next.config.ts` com CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`
- [ ] T02 [P] Adicionar middleware de headers de segurança em `backend/app/main.py` (mesmo conjunto de headers, aplicado a todas as rotas)
- [ ] T03 [P] Teste em `backend/tests/test_main.py` validando presença dos headers na resposta
- [ ] T04 Smoke manual pós-deploy: `curl -I` em produção (frontend e backend) + navegação verificando fontes/imagens/chat sem erro de CSP no console
- [ ] T05 Atualizar `backend/README.md`/`frontend/README.md` citando os headers adicionados (referência rápida, não obrigatório se README não documenta esse nível de detalhe hoje — avaliar na implementação)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado (backend) — frontend `N/A` justificado (config declarativa do `next.config.ts`, sem lógica de aplicação isolada a cobrir por unit test; validado por smoke manual real, CA-003)
- [ ] Build/lint limpo (`npm run build`, `ruff check`, `black --check`)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado — N/A
- [ ] Sem chave de API/secret exposto (client bundle ou repo)
- [ ] Documentação atualizada, se aplicável (README com os headers adicionados)
- [ ] Deploy/preview verificado — `curl -I` real em produção (frontend Vercel + backend Render) e navegação manual sem erro de CSP
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
