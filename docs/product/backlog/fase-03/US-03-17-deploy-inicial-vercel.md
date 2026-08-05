# US-03-17 — Deploy inicial do frontend na Vercel

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Deploy (`PRD-004-deploy.md`) — ex-US-D03

**Como** dono do produto,
**quero** o site no ar, mesmo incompleto,
**para** validar o pipeline de deploy cedo e já ter algo publicável.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (deploy de hospedagem; sem endpoint novo)
- [x] Modelagem de dados documentada — N/A (sem entidade nova)
- [x] Plano de testes definido — smoke manual na URL publicada (ver subseção)
- [x] Épico e dependências identificados — Deploy; US-02-01, US-03-09 (ambas Done); MVP US-03-01…16 Done
- [x] ADR registrado se envolve decisão de stack nova — [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) (hospedagem gratuita; Aceita)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A neste MVP estático (sem API keys no frontend; RAG é Fase 05)
- [x] Referência visual definida — N/A (não cria UI nova; publica o que já existe)
- [x] Sem dúvida bloqueante — Production Branch = `main`; Root Directory = `frontend/`; domínio customizado fora de escopo; aceite do ADR-002 (Vercel Hobby) durante o deploy (passo 0 do guia)

#### Plano de testes

- Unitário: N/A (sem código de aplicação novo)
- Integração: N/A
- Smoke manual (obrigatório para aceite):
  1. Abrir a URL `.vercel.app` em navegador anônimo
  2. Confirmar que a home carrega (Hero / nome do autor)
  3. Navegar por ao menos 2 âncoras do header (ex.: Experiência, Contato)
  4. Confirmar que o link/botão de PDF do currículo responde (download ou abertura)
- Build pré-deploy (sanidade local, opcional mas recomendado): em `frontend/`, `npm run build` deve passar antes de confiar no deploy
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: projeto Vercel criado com Root Directory = `frontend/` (Framework preset Next.js) — confirmado via `vercel project inspect lucas-palhares-dev` (Root Directory: `frontend`, Framework Preset: Next.js)
- [x] CA-002: deploy automático a cada push na Production Branch `main` — GitHub conectado (`lucaspalharesbarbosa/curriculo-online-ia`) e Production Branch = `main` confirmados no painel pelo autor; comportamento de auto-deploy é o padrão da Vercel ao conectar um repo (não observado um push real disparando deploy nesta sessão — próxima confirmação natural será no push de merge desta PR para `main`)
- [x] CA-003: URL `.vercel.app` publicada e acessível (smoke do plano de testes acima) — **revalidado em 2026-08-04:** a URL de produção atual do projeto é `https://curriculo-online-ia.vercel.app` (confirmada via `vercel project ls`), não a antes documentada `lucas-palhares-dev.vercel.app`. Smoke completo: home `200` com conteúdo real (título, nav com âncoras `#about #experience #education #skills #projects #certifications #contact`), PDF `200` (`Lucas_Palhares_Barbosa_Engenheiro_De_Software.pdf` — nome real; o `curriculo-lucas-palhares.pdf` do plano de testes original estava desatualizado). `lucas-palhares-dev.vercel.app` é alias órfão de um nome de projeto anterior e segue com SSO ativo — não é mais a URL de produção, não deve ser usada
- [x] CA-004: URL pública registrada em `frontend/README.md` (seção Deploy) — atualizada para a URL de produção correta

### Fora de escopo

- Domínio customizado
- Deploy do backend / variáveis de IA (Fase 05 — US-05-08 / US-05-09)
- Preview deployments em PRs (nice-to-have da Vercel; não bloqueia aceite)

### Dependências

- US-02-01 (Done), US-03-09 (Done) — restante do MVP estático (US-03-01…16) Done e disponível em `main`/`develop`

### Épico / Prioridade

Deploy — P2

### Tasks

- [X] T01 Criar projeto na Vercel (`curriculo-online-ia`, Framework = Next.js) — deploy CLI a partir de `frontend/`; GitHub conectado e Root Directory = `frontend/` confirmados no painel (2026-08-04)
- [X] T02 Confirmar Production Branch = `main` e deploy automático habilitado — confirmado pelo autor no painel (Login Connection GitHub resolvida)
- [X] T03 Validar smoke na URL `.vercel.app` (plano de testes) — **revalidado (2026-08-04):** URL de produção correta é `https://curriculo-online-ia.vercel.app` (não a antiga `lucas-palhares-dev.vercel.app`, que é alias órfão ainda protegido por SSO). Smoke completo passou: home 200, âncoras Experiência/Contato presentes, PDF 200
- [X] T04 [P] Atualizar `frontend/README.md` com a URL pública e marcar esta história como concluída no texto da seção Deploy

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — N/A (história de hospedagem; sem lógica de aplicação nova)
- [x] Build/lint limpo — N/A no repo para esta história se não houver diff de app; pré-condição: último build do frontend em CI/`npm run build` ok (validado na rodada anterior: `next build` sem erro)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — `frontend/README.md` com URL correta; história atualizada com o resultado da revalidação
- [x] Deploy/preview verificado — URL `.vercel.app` acessível (smoke revalidado 2026-08-04)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Reprovado | 2026-08-04 | Smoke do plano de testes falhou: `curl -D-` em `/`, `/curriculo-lucas-palhares.pdf` e `/robots.txt` retorna `302` → `vercel.com/sso-api` (Vercel Deployment Protection/SSO ativa). CA-003/T03 reabertos. Build local ok (`npm run build`: valida `resume.schema.test.ts` + `next build` sem erro) — não bloqueante, mas não substitui o smoke público |
| Tech Lead | `@tech-lead-review` | Solicitar mudanças | 2026-08-04 | Diff só documentação (`docs/**`, `frontend/README.md`) + `ADR-002` novo; sem secret exposto, sem código de app tocado. Achado High: `frontend/README.md` e a própria história afirmavam CA-003 fechado ("URL pública... acessível") divergente do estado real verificado agora (site atrás de SSO da Vercel) — mesma classe de "contrato implementado diverge do documentado". Achado Low: `Status` da história citava só o bloqueio de CA-002, subestimando o de CA-003. Sem Critical (nenhuma chave/CORS envolvida nesta história) |
| PO | `@product-owner` | Bloqueado | 2026-08-04 | CA-001/CA-002 seguem bloqueados por ação humana (Login Connection GitHub na conta Vercel); CA-003 reaberto por regressão de configuração (Deployment Protection) que também exige ação humana no painel Vercel — nenhum dos três é resolvível pelo pipeline de agentes. DoD não fechado (CA e vereditos QA/TL agora registrados, mas critérios de aceite seguem `[ ]`). Não é Done nem "Quase lá" — falta ação de conta, não trabalho de agente |
| QA (revalidação) | `@qa-engineer` | Aprovado com ressalvas | 2026-08-04 | Autor conectou o GitHub ao projeto e ajustou Root Directory/Production Branch no painel. Smoke repetido na URL antes documentada (`lucas-palhares-dev.vercel.app`) ainda deu `302` SSO — investigação mostrou que essa URL é um alias órfão de um nome de projeto antigo, e a URL de produção real do projeto (`vercel project ls`) é `curriculo-online-ia.vercel.app`. Smoke nessa URL passou: home `200` com conteúdo real e âncoras `#experience`/`#contact` presentes, PDF `200` no nome de arquivo correto (`Lucas_Palhares_Barbosa_Engenheiro_De_Software.pdf`; o nome no plano de testes original estava desatualizado). Ressalva: recomendar remover/ignorar o alias órfão no painel da Vercel para evitar confusão futura (não bloqueante) |
| Tech Lead (revalidação) | `@tech-lead-review` | Aprovar com ressalvas | 2026-08-04 | Diff segue só documentação (`frontend/README.md` + esta história) — sem secret, sem CORS, sem código de app tocado. Achado High da rodada anterior (doc divergindo da realidade) está resolvido: `README.md` e a história agora apontam a URL de produção real, verificada por smoke nesta sessão. Ressalva Low: existência de aliases/projetos Vercel órfãos (`lucas-palhares-dev`, `lucas-palhares-curriculo`) é dívida de configuração fora do repo — sugerido follow-up de limpeza no painel, não bloqueia esta história |
| PO (revalidação) | `@product-owner` | Done | 2026-08-04 | CA-001/002/003/004 fechados com evidência (CLI + smoke). DoD 100% fechado. Único ponto não coberto por teste automatizado nesta sessão é a observação de um push real disparando o auto-deploy (CA-002) — comportamento padrão da Vercel após conectar o Git, será confirmado organicamente no próximo merge para `main` |

### Nota de arquitetura (Fase 2 do pipeline)

Trade-off de hospedagem gratuita documentado em [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) (status **Aceita**). Frontend na Vercel Hobby; não reabrir sem novo ADR.

**Status:** Done — CA-001/002/003/004 fechados e DoD 100% fechado em 2026-08-04 (revalidação pós ação humana no painel Vercel: GitHub conectado, Root Directory/Production Branch ajustados). URL de produção: https://curriculo-online-ia.vercel.app. Pendência não bloqueante: alias órfão `lucas-palhares-dev.vercel.app` (nome de projeto antigo) segue com SSO ativo — recomenda-se removê-lo/ignorá-lo no painel da Vercel para não ser confundido com a URL oficial
