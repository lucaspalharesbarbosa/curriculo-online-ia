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

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — N/A (config estática de metadata, sem lógica testável; ver Plano de testes)
- [ ] Build/lint limpo (`npm run build`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [ ] Sem chave de API/secret exposto
- [ ] Documentação atualizada — N/A se nada mudar além do código
- [ ] Deploy/preview verificado (UI)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
