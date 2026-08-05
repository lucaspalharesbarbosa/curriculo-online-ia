# US-04-01 — SEO básico

**Fase:** Fase 04 — Polimento
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F10

**Como** visitante que encontra o site via busca ou compartilhamento,
**quero** que o link tenha título, descrição e preview corretos,
**para** reconhecer do que se trata antes de clicar.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (sem endpoint novo/alterado)
- [x] Modelagem de dados documentada — N/A (sem entidade nova; só leitura do `resume.json` já existente)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Frontend; US-03-10 (Done)
- [x] ADR registrado se envolve decisão de stack nova — N/A (usa `Metadata` nativo do Next.js, já em uso em `frontend/app/layout.tsx`; nenhuma lib nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A (título/descrição/OG são texto estático, sem chave/serviço externo)
- [x] Referência visual definida — N/A (não cria UI nova; imagem de OG usa placeholder, conforme Fora de escopo)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: N/A (Next.js `Metadata` é config estática, sem lógica ramificada a testar; risco de regressão coberto pelo build)
- Integração: N/A
- Smoke manual (obrigatório para aceite): `npm run build` sem erro; inspecionar `<head>` renderizado (`view-source`/devtools) confirmando `<title>`, `<meta name="description">` e tags `og:*` (`og:title`, `og:description`, `og:image`) com dados reais do Hero (não placeholder de template)
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done
- [x] CA-001: `metadata` do Next.js (title, description) preenchido com dados reais do Hero — verificado no HTML gerado por `npm run build` (`.next/server/app/index.html`): `<title>` e `<meta name="description">` com `hero.name`/`hero.title`/`hero.summary` reais
- [x] CA-002: Open Graph tags configuradas (título, descrição, imagem) — `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`, `og:type`, `og:image` presentes no HTML gerado; imagem é placeholder (`/globe.svg`), conforme Fora de escopo

### Fora de escopo
- Imagem de OG customizada (pode usar placeholder inicialmente)

### Dependências
- US-03-10

### Épico / Prioridade
Frontend — P2

### Tasks
- [X] T01 Configurar `metadata` e Open Graph em `frontend/app/layout.tsx` — título/descrição derivados de `resume.hero` (`@/content/resume`), `metadataBase`, `openGraph` (title/description/url/siteName/locale/type/images) com `/globe.svg` como placeholder de imagem

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — N/A (config estática de metadata, sem lógica testável; ver Plano de testes); suíte geral segue em 92% stmts
- [x] Build/lint limpo (`npm run build`, type checking estrito) — `npm run lint` e `npm run build` sem erro
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — Aprovar com ressalvas, só achados Low
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A, nada mudou fora do código (`frontend/README.md` já documenta a URL desde US-03-17)
- [x] Deploy/preview verificado (UI) — tags de `<head>` verificadas no HTML estático gerado pelo build (`.next/server/app/index.html`); confirmação em produção ocorre automaticamente no próximo deploy Vercel após merge para `main`, mesmo padrão de US-03-17
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-04 | `npm test -- run --coverage`: 12/12 testes passando, 92% stmts / 100% funcs (piso 70% ok); `npm run build`: schema + `next build` sem erro; smoke: `<title>`, `<meta name="description">` e `og:*` inspecionados em `.next/server/app/index.html` com dados reais de `resume.hero` (não placeholder de template) |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas | 2026-08-04 | Diff em `frontend/app/layout.tsx` (dados agora vêm de `resume.hero`, não mais hardcoded — melhoria em relação ao estado anterior). Sem secret/CORS, sem regressão de teste, build ok. Achados Low (não bloqueiam): (1) `title` combina nome + `hero.title` completo (~140 chars), acima do recomendado (~60 chars) para não truncar em resultados de busca — sugerido follow-up de título mais curto específico para SEO, distinto do `hero.title` da UI; (2) `siteUrl` duplica a URL já documentada em `frontend/README.md` (US-03-17) como string literal — baixo risco hoje (muda raramente), mas se divergir no futuro os dois lugares dessincronizam |
| PO | `@product-owner` | Done | 2026-08-04 | CA-001/002 fechados com evidência (build + inspeção do HTML gerado); DoD 100% fechado; sem Critical/High do Tech Lead (só 2 nits Low, não bloqueiam); QA aprovou sem ressalva |

**Status:** Done — CA-001/002 fechados e DoD 100% fechado em 2026-08-04. Achados Low do Tech Lead (título longo para SEO; URL duplicada como literal) registrados como follow-up não bloqueante, não geram nova história por serem triviais — endereçar na próxima vez que `frontend/app/layout.tsx` for tocado
