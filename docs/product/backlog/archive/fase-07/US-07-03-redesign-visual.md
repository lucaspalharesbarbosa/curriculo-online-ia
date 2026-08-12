# US-07-03 — Redesign visual do site (clonagem estrutural do template personal-resume)

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** que o site replique a estrutura, layout, paleta, efeitos e usabilidade do template de referência (não só a paleta/tipografia), preenchido com as informações reais do autor,
**para** perceber o site como um currículo visualmente equivalente ao template profissional de mercado, não uma adaptação parcial.

### Pivô de escopo (2026-08-07 — 2ª troca de referência)

A rodada anterior desta história (mesma branch `feature/fase-07-execucao`) entregou clonagem estrutural do template **PortfolioHub** (Framer). O autor escolheu nova referência: template open-source **personal-resume** ([GitHub](https://github.com/giasinguyen/personal-resume), [demo](https://cv.nguyentrangiasi.id.vn/)). Como o trabalho PortfolioHub ainda não chegou a PR aceito como referência final, o escopo foi **reescrito do zero** dentro da mesma história: Critérios de Aceite, Tasks, DoD e Vereditos abaixo substituem a rodada anterior.

**Estratégia de implementação (custo):** descartar o layout PortfolioHub (ticker/stats/tools/Clash Grotesk/nav pills) e **portar o layout do template** para `frontend/` (sidebar sticky + coluna principal com cards glass), alimentado por `resume.json`.

Decisões fechadas pelo `@product-owner` em 2026-08-07 (regra do projeto: nunca inventar conteúdo; só `resume.json`):

1. **Languages e Soft Skills** do template: **omitidas** — `resume.json` não tem esses campos.
2. **Awards & Scholarships** do template → seção **Certificações** com o mesmo layout de cards (dados de `certifications[]`).
3. **Experience:** incluída na coluna principal (entre About e Education), idioma visual glass/amber do template.
4. **Badges do perfil:** até 2 pills derivados de `hero.title` (split por `|`), sem emoji inventado.
5. **Bloco "developer.ts":** só `name` e `role` — sem `passion` fictício.
6. **Education:** só campos reais (`institution`, `degree`, `startDate`, `endDate`).
7. **Tema:** dark amber/gold do template como identidade principal.
8. **ChatWidget:** mantido e restilizado para amber/glass.
9. **WhatsApp / PDF / LinkedIn / GitHub / e-mail:** no bloco de contato da sidebar.
10. **Deps:** `framer-motion`, `lucide-react@0.562.0`, `clsx`, `tailwind-merge` — `ADR-005`.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (sem endpoint novo/alterado; só UI/CSS)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (adapter por props; `resume.json` inalterado)
- [x] Plano de testes definido
- [x] Épico e dependências identificados — Frontend & UX v2 (`PRD-005`); US-07-01/02; US-04-02
- [x] ADR registrado — **ADR-005**
- [x] Variáveis de ambiente/segredos — N/A
- [x] Referência visual definida — [personal-resume](https://github.com/giasinguyen/personal-resume) · [demo](https://cv.nguyentrangiasi.id.vn/)
- [x] Sem dúvida bloqueante

#### Mapeamento seção-a-seção (template → site)

| UI do template | Seção do site | Fonte de dado (`resume.json`) | CA |
|---|---|---|---|
| Sidebar — avatar, nome, título, badges | `ResumeSidebar` | `hero` | CA-003 |
| Sidebar — Contact + social | Contato na sidebar | `contact` (+ WhatsApp) | CA-004 |
| Sidebar — Technical Skills | Skills tags | `skills[]` | CA-005 |
| Sidebar — Languages / Soft Skills | **omitidas** | — | Fora de escopo |
| Sidebar — Download CV | Botão PDF | `contact.resumePdfUrl` | CA-004 |
| Main — About Me | `SummarySection` | `about` + `hero` | CA-006 |
| Main — Experience | `ExperienceSection` | `experiences[]` | CA-007 |
| Main — Education | `EducationSection` | `education[]` | CA-008 |
| Main — Awards | `Certifications` | `certifications[]` | CA-009 |
| Main — Featured Projects | `ProjectsSection` | `projects[]` | CA-010 |
| Orbs/grid/glass/glow/amber | `globals.css` + page | tokens | CA-001, CA-002 |
| Chat (só nosso produto) | `ChatWidget` | `/chat` | CA-011 |

#### Plano de testes

- Unitário: componentes novos + `lib/utils` + page
- Manual: comparação com demo do template
- Lighthouse mobile em build de produção
- Contraste WCAG AA

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: paleta do template em `globals.css` (inicialmente amber/dark; superseded por D1 Deep Ice — ver "Ajustes pós-entrega"); identidade PortfolioHub (ciano/Clash) removida do fluxo ativo
- [x] CA-002: glass, orbs, glow, skill-tag/project-card; `prefers-reduced-motion` em `globals.css`
- [x] CA-003: layout sidebar sticky + main; empilha em mobile
- [x] CA-004: contato na sidebar (e-mail, WhatsApp, LinkedIn, GitHub, PDF)
- [x] CA-005: skills como tags por categoria a partir de `skills[]`
- [x] CA-006: About no padrão Summary (sem passion inventada)
- [x] CA-007: Experience com as 6 experiências reais
- [x] CA-008: Education com `education[]`
- [x] CA-009: Certificações no layout Awards
- [x] CA-010: Projects no padrão featured cards
- [x] CA-011: ChatWidget funcional na paleta do site (amber na entrega inicial; D1 Deep Ice após ajuste)
- [x] CA-012: tipografia `Inter` via `next/font/google`; Clash fora do layout
- [x] CA-013: sem dados do autor do template (teste em `page.test.tsx`)
- [x] CA-014: Lighthouse mobile (build prod, porta 3456): A11y **100**, Best Practices **100**, Performance **81** (baseline anterior Perf 64 — sem regressão)
- [x] CA-015: contraste WCAG AA — 8 pares texto/fundo calculados, todos ≥ 4.5:1 (menor 7.84:1 muted/dark)

### Fora de escopo

- Languages e Soft Skills
- Conteúdo inventado
- Pixel-perfect de toda animação Framer Motion
- Identidade PortfolioHub
- Troca de framework
- Chat v2 / formulário com persistência

### Dependências

- US-07-01, US-07-02, US-04-02
- ADR-005
- Template MIT: https://github.com/giasinguyen/personal-resume

### Épico / Prioridade

Frontend & UX v2 — P2

### Tasks

- [x] T01 ADR-005 + deps instaladas (`framer-motion`, `lucide-react@0.562.0`, `clsx`, `tailwind-merge`)
- [x] T02 Tokens/efeitos em `globals.css`; `layout.tsx` só com Inter
- [x] T03 [P] `ResumeSidebar`
- [x] T04 [P] `SummarySection`
- [x] T05 `ExperienceSection`
- [x] T06 [P] Education + Certifications + Projects
- [x] T07 `page.tsx` no grid do template; seções PortfolioHub removidas
- [x] T08 `ChatWidget` restilizado
- [x] T09 Componentes órfãos PortfolioHub removidos
- [x] T10 Testes novos (CA-013 coberto)
- [x] T11 test/lint/build/Lighthouse/contraste
- [x] T12 Docs de produto + CONTEXTO + ADR atualizados

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura ≥ 70% no código tocado — statements **93,33%** / branches **79,16%** / funções **91,42%**
- [x] Build/lint limpo — `npm run build` OK; eslint só warning pré-existente em `coverage/`
- [x] Review do `@tech-lead-review` sem Critical/High
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada
- [x] Deploy/preview verificado (UI) — autor confirmou preview/produção 2026-08-11
- [x] Vereditos QA, Tech Lead e PO na tabela abaixo
- [x] Status da história atualizado

### Ajustes pós-entrega (2026-08-07 — mesmo dia, pedido direto do autor via `@orquestrador`)

Refinamentos de conteúdo/copy sobre a entrega já revisada acima, sem reabrir DoR (mudança de texto/dado, não de escopo/arquitetura):

- Labels de seção traduzidos EN→PT-BR: Perfil (antes "About Me"; ajustado de "Sobre Mim" a pedido do autor para não redundar com o subtítulo), Resumo Profissional, Experiência, Trajetória Profissional, Contato, Habilidades Técnicas, Educação, Formação Acadêmica, Certificações, Reconhecimentos e Conquistas, Projetos em Destaque, Trabalhos Recentes e Contribuições
- `skills` (Cloud): simplificado para `["AWS", "GCP"]`; nova categoria `Mensageria` (`Apache Kafka`, `RabbitMQ`, `AWS SQS`, `AWS SNS`) — tecnologias confirmadas pelo autor (não estavam em `resume.json`, então não podiam ser inferidas)
- `skills` (Linguagens): `"Java (Spring Boot)"` separado em `"Java"` + `"Spring Boot"`
- Cargos em inglês (decisão do autor, aplicada a todas as ocorrências, inclusive dentro de frases em PT-BR): "Engenheiro de Software Sênior" → "Senior Software Engineer"; "Engenheiro de Software Pleno" → "Software Engineer"; "Desenvolvedor Web Pleno" → "Web Developer"; "Desenvolvedor Web Junior" → "Junior Web Developer"
- Logo das empresas nos cards de `ExperienceSection`: novo campo opcional `logoUrl` em `experienceSchema` (frontend) e `Experience.logo_url` (backend, mesmo padrão de `hero.photoUrl`/`photo_url`); arquivos fornecidos pelo autor em `frontend/public/` (`engineeringbr_logo.jpg`, `bancobv_logo.jpg`, `itau_logo.jpg`, `shift_logo.jpg`, `grupowebpic_logo.jpg`, `wdgautomation_logo.jpg`); fallback com ícone `Building2` quando `logoUrl` é `null`
- Removida fonte `ClashGrotesk` órfã de `frontend/app/fonts/` (4 `.woff2` + `LICENSE.txt`) — não referenciada em nenhum componente/CSS desde que CA-012 trocou a tipografia para Inter

### Ajustes pós-entrega (2026-08-07 — paleta D1 Deep Ice, pedido via `@orquestrador`)

Troca de identidade de cor (layout/estrutura inalterados). Autor pediu sugestões, previewou A–E e variações D1–D8; escolha final **D1 — Deep Ice**.

- Tokens semânticos `accent-300…600` em `globals.css`; classes Tailwind `amber-*` substituídas por `accent-*` nos componentes
- Paleta: fundo `#04080e`, surface `#0a101a`, accent `#38bdf8`, muted `#8494a8`
- Decisão nº 7 do pivô (tema amber/gold do template) **superseded** pela escolha do autor — estrutura personal-resume mantida; só a cor muda
- Contraste WCAG AA: 8 pares recalculados, todos ≥ 4.5:1 (menor muted/surface 6.16:1)

### Ajustes pós-entrega (2026-08-08 — grid responsivo de Habilidades Técnicas, pedido via `@orquestrador`)

CA-005/CA-003 tinham regredido no mobile/tablet: a migração para `ResumeSidebar` (pivô de escopo acima) trouxe de volta o empilhamento em coluna única das 9 categorias de skills, o mesmo problema que já havia sido corrigido no componente antigo (`SkillBadge.tsx`, removido nesta história) pela auditoria de responsividade (`US-07-02`, achado #3). Sem grid, a lista de skills sozinha ocupava um trecho muito longo da tela em mobile/iPad antes do visitante chegar ao conteúdo principal (Perfil/Experiência).

- Diagnóstico visual via `next build` + `next start`/`next dev` e Chrome headless (`--headless=new --virtual-time-budget --window-size=<W>,<H> --screenshot`) nos breakpoints `375px`, `768px` e `1024px` — mesma limitação de emulação mobile via CLI já registrada em US-07-02 (usada aqui só para largura/layout, não para user-agent mobile)
- Correção em `frontend/components/ResumeSidebar.tsx`: bloco de categorias de skills envolvido em `grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1` — 1 coluna abaixo de `sm` (640px, telefones em retrato — mantido para não reabrir o overflow horizontal de tags longas como "Clean Architecture" já resolvido em US-07-02/CA-001), 2 colunas de `sm` a `md`, 3 colunas em `md`/iPad retrato (768px+), volta a 1 coluna em `lg` (1024px+, quando a sidebar vira coluna fixa estreita de 340–380px — comportamento desktop inalterado)
- Sem mudança de dados/props/lógica — só classes Tailwind no wrapper; `ResumeSidebar.test.tsx` cobre o componente sem alteração necessária

### Ajustes pós-entrega (2026-08-08 — pós-validação manual, via `@orquestrador`)

Refinamentos sobre a entrega já revisada (CA-003/004/005/007), sem reabrir DoR — ajuste de layout/UX/copy sobre o que já existe, não mudança de escopo/arquitetura:

- **Experiência em linha do tempo única** (`ExperienceSection.tsx`): os 8 cards separados viraram uma única trilha vertical dentro de um só `glass` card — logo/ícone da empresa alinhado a uma linha conectora, divisórias sutis entre itens em vez de cards distintos, selo "Atual" na posição em curso (`endDate: null`). Bug real encontrado e corrigido durante a implementação: o ícone `absolute left-0` de cada item acabava alinhado à mesma borda (a interna do padding) que o texto com `pl-16` no mesmo elemento, sobrepondo os dois — corrigido movendo o padding para um `div` de conteúdo separado do item, com o ícone fora dessa área com padding. Validado via captura real de página (Chrome headless + CDP, viewport completo e mobile 390px) — sem sobreposição em nenhuma experiência, "Atual" só na Engineering Brasil.
- **Localização clicável + ícone padronizado** (`ResumeSidebar.tsx`): `hero.location` perdeu o sufixo "(remoto)" (já redundante com `modality` de cada experiência); o bloco de localização no Contato virou link (`target="_blank"`) para busca no Google Maps (`buildGoogleMapsUrl`, novo helper em `lib/utils.ts`); ícone de localização passou de `bg-neutral-700/50`/`text-neutral-300` (cor destoante) para o mesmo padrão `bg-accent-500/20`/`text-accent-400` dos outros itens de contato (e-mail, WhatsApp).
- **Ícones de marca por habilidade técnica** (`ResumeSidebar.tsx` + novo `lib/skill-icons.ts`): cada item de `skills[].items` ganha um ícone antes do texto (`react-icons` para logos de marca — Java, Spring Boot, Docker, AWS etc. — com fallback a ícone genérico do `lucide-react` para itens sem logo oficial, como "SOLID"/"CI-CD", e um ícone default para qualquer item sem mapeamento). Nova dependência registrada em `ADR-007`.
- **Reorganização das categorias de skills** (`resume.json`): "Linguagens" dividida em **Backend** (Java, Spring Boot, Python, C#) e **Frontend** (Angular, React, JavaScript, HTML5, CSS3); "Devops"/"Arquitetura" renomeadas para "DevOps & CI/CD" e "Arquitetura & Padrões"; `CI/CD` deduplicado (só em DevOps & CI/CD, removido de Metodologias); ordem das categorias reorganizada (Backend, Frontend, Cloud, Mensageria, DevOps & CI/CD, Arquitetura & Padrões, Banco de Dados, Observabilidade, Metodologias) — sem adicionar/remover nenhuma tecnologia, só reclassificar as já existentes.
- Halo giratório sutil atrás do avatar (`spin-slow`, `globals.css`) e `whileHover` com leve rotação nos ícones de logo (Experience) e medalha (Recognitions) — parte do pedido de layout mais dinâmico (item 9 do pedido do autor), coberto em conjunto com `US-07-06`.
- QA visual feito com Chrome headless via CDP (`Page.captureScreenshot` full-page + scroll real, não só viewport inicial) nos breakpoints desktop (1440px) e mobile (390px), com `--force-prefers-reduced-motion` para distinguir bug real de artefato de timing de animação (`whileInView`/`animate` do framer-motion não terminam antes de uma captura headless "de tiro único" — mesma limitação de emulação já registrada em `US-07-02`).

### Ajustes pós-entrega (2026-08-08 — promoções, certificações agrupadas, título do hero e skills, via `@orquestrador`)

Refinamentos de layout sobre componentes já revisados (CA-005/007/009), sem reabrir DoR — ajuste visual/UX sobre o que já existe, não mudança de escopo/arquitetura. Arquiteto não acionado (sem stack/lib nova, sem ADR necessário).

- **Timeline de Experiência sem logo duplicado em promoções** (`ExperienceSection.tsx` + novo `groupExperiencesByCompany` em `lib/utils.ts`): passagens consecutivas na mesma empresa (Shift e WebPic, cada uma com um cargo Junior seguido de promoção) passam a compartilhar um único ícone/logo por empresa; os cargos dentro do grupo ficam empilhados com um selo discreto "Promovido" (ícone `TrendingUp`) entre eles, em vez de repetir o card/logo inteiro por cargo.
- **Certificações agrupadas por emissor, só o ano** (`Certifications.tsx` + novo `groupCertificationsByIssuer`/`formatYear` em `lib/utils.ts`): um card por emissor (AWS, SCRUMStudy, Full Cycle, Alura, Asimov Academy) com um único logo, listando os certificados daquele emissor (mais recente primeiro) com o ano de emissão discreto (`text-[11px] text-neutral-500`) em vez da data completa `AAAA-MM`; Alura (4 certificados) e Asimov Academy (2) deixam de repetir o mesmo logo em cards separados.
- **Ícones de habilidade com contraste consistente** (`ResumeSidebar.tsx`): cada ícone de `skills[].items` ganhou um chip com fundo `accent-500/15` atrás do glifo — corrige logos de marca com traço fino/monocromático (ex.: Git, GitLab) que ficavam quase invisíveis direto sobre o fundo escuro do tag.
- **Cabeçalho do hero dividido em cargos (destaque) e info complementar (discreta)** (`ResumeSidebar.tsx` + novo `parseHeroTitle` em `lib/utils.ts`, substitui `deriveProfileBadges`): `hero.title` ("Tech Lead | Senior Software Engineer — AI Engineering | Agentic AI | Java • Python | AWS Certified") passa a exibir só os cargos (antes do "—") em destaque, com separador `•` e gradiente; o restante (AI Engineering, Agentic AI, Java • Python, AWS Certified) vira uma linha discreta abaixo, em caixa alta e cor `neutral-500`. Substitui os badges/pills anteriores (derivados do mesmo título, mas cortados no meio pelo "—").
- **Nova categoria "AI Engineering" e split "Banco de Dados" em SQL/NoSQL** (`resume.json`): categoria com os termos já usados no `about`/highlights do autor (AI Engineering, Agentic AI, Context Engineering, Prompt Engineering, Spec-Driven Development (SDD)) — nenhum termo novo, só promovidos a skill explícita; "Banco de Dados" dividido em "Banco de Dados (SQL)" (SQL Server, PostgreSQL) e "Banco de Dados (NoSQL)" (Redis, DynamoDB — tecnologias confirmadas pelo autor). Ícones novos em `skill-icons.ts`: `Bot`/`Workflow`/`BookOpen`/`MessageSquare`/`FileCode2` (lucide, categoria AI Engineering) e `SiRedis`/`Database` (Redis/DynamoDB) — sem dependência nova, `react-icons`/`lucide-react` já estavam no projeto (`ADR-007`).
- QA visual via CDP direto (`Page.captureScreenshot` após espera real de ~3,5s, não `virtual-time-budget` — headless `--screenshot`/`virtual-time-budget` não avança corretamente as animações `rAF` do framer-motion nos novos itens de skill, mesma classe de limitação de emulação já registrada em US-07-02; confirmado como artefato de captura, não bug, ao re-renderizar com espera real) nos breakpoints desktop (1440px) e mobile (390px).
- Item pendente de aprovação do autor, **não implementado ainda**: layout tipo "medidor de proficiência" para Habilidades Técnicas — opções visuais preparadas à parte para validação antes de decidir (pedido explícito do autor: "preciso ver e aprovar antes de decidir").

### Ajustes pós-entrega (2026-08-08 — medidor de proficiência das Habilidades Técnicas, via `@orquestrador`)

Autor aprovou a opção "Barra segmentada" entre 4 alternativas visuais apresentadas (artifact com pontos/barra/anel/chip de texto + 1 bônus). Implementação sobre `ResumeSidebar.tsx` (CA-005), sem reabrir DoR — ajuste visual sobre o que já existe.

- **Schema:** `skills[].items` deixa de ser `string[]` e passa a ser `{ name, level }[]`, `level` inteiro 1–5 — `skillItemSchema` novo em `resume.schema.ts` (frontend/Zod) e `SkillItem` espelhado em `backend/app/models/resume.py` (Pydantic), mesmo padrão de espelhamento já usado no projeto.
- **UI:** cada categoria de Habilidades Técnicas deixou de ser uma lista de tags em `flex-wrap` e virou uma lista vertical de linhas (ícone + nome + barra de 5 segmentos preenchidos até `level`, gradiente `accent-400→accent-500`); `title`/`aria-label` com o rótulo do nível (`formatSkillLevel`, novo em `lib/utils.ts`) para acessibilidade. Grid responsivo de categorias (1/2/3/1 colunas) mantido; validado em 1440px, ~900px (3 colunas) e 390px via captura real (CDP) — nome trunca com `title` no hover quando a coluna é estreita (ex.: "Spec-Driven Development (SDD)" em 3 colunas).
- **RAG:** `_chunk_skill_group` em `backend/app/rag.py` passou a incluir o nível por extenso no texto do chunk (ex.: "Java (especialista), Python (avançado)"), então o chat passa a responder com sinal de proficiência, não só a lista de tecnologias.
- **Níveis atribuídos são um primeiro rascunho meu**, não uma autoavaliação do autor — critério usado: tempo de uso evidenciado em `experiences[].technologies`/`highlights`, certificações relacionadas e ênfase no `about`/`hero`. Nenhum item abaixo de nível 3 (nada listado como "iniciante"/"básico" numa lista de currículo). **Pendente:** autor revisar e corrigir os níveis reais antes de considerar este item fechado — a UI já está pronta para qualquer ajuste (só mudar o número em `resume.json`).
- QA visual via CDP (espera real ~3,2–3,5s) em 1440px, ~900px e 390px.

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `npm test -- --run`: 10 arquivos, 20/20 verdes; cobertura 93,33% statements no tocado; contraste 8 pares ≥ 4.5:1; Lighthouse mobile vs build prod: A11y 100, BP 100, Perf 81; sem dados do template no page test; ChatWidget suite intacta | 2026-08-07 | CA-001–015; `vitest --coverage` |
| Tech Lead | `@tech-lead-review` | Aprovar — layout portado com props/`resume.json` (sem hardcode do autor do template); deps alinhadas ao ADR-005 (`lucide-react` pinado em 0.562.0 por ícones de marca); build/test OK; ChatWidget sem mudança de contrato; ressalva: preview Vercel pendente (não bloqueia merge de código) | 2026-08-07 | ADR-005, `frontend/components/*`, `app/page.tsx` |
| PO | `@product-owner` | Quase lá — CAs e DoD de código fechados; referência personal-resume entregue; falta só verificar preview de deploy após PR | 2026-08-07 | pivô de escopo + mapeamento acima |
| QA (ajustes pós-entrega) | `@qa-engineer` | Aprovado — `vitest run`: 10 arquivos, 21/21 verdes (novo teste de fallback de logo em `ExperienceSection`); `npm run build` OK (schema válido, TS sem erro); labels/cargos/skills conferidos ao vivo no dev server; 6 logos servidos com HTTP 200 | 2026-08-07 | `frontend/content/resume.json`, `frontend/components/ExperienceSection.tsx` |
| Tech Lead (ajustes pós-entrega) | `@tech-lead-review` | Aprovar — `logoUrl` opcional/nullable espelhado corretamente entre Zod e Pydantic (mesmo padrão de `photoUrl`); sem regressão em `rag.py` (não referencia `logo_url`); remoção de `ClashGrotesk` confirmada sem referência residual antes da exclusão | 2026-08-07 | `resume.schema.ts`, `backend/app/models/resume.py` |
| QA (paleta D1) | `@qa-engineer` | Aprovado — `vitest --run`: 10 arquivos, 21/21 verdes; contraste D1 8 pares ≥ 4.5:1 (menor 6.16:1); sem `amber-*` residual no frontend ativo; layout/comportamento inalterados (só tokens/CSS) | 2026-08-07 | `frontend/app/globals.css`, componentes `accent-*` |
| Tech Lead (paleta D1) | `@tech-lead-review` | Aprovar — tokens semânticos (`--accent-*`) evitam hardcode de cor nos componentes; diff mínimo (CSS + classes Tailwind); sem impacto em schema/API/RAG; contraste AA ok | 2026-08-07 | `globals.css`, `ResumeSidebar`, `ChatWidget`, seções |
| PO (paleta D1) | `@product-owner` | Aceito — autor escolheu D1 Deep Ice após preview A–E e D1–D8; supersede tema amber do template; status da história permanece Quase lá (preview Vercel ainda pendente) | 2026-08-07 | escolha do autor no chat |
| QA (grid skills mobile/iPad) | `@qa-engineer` | Aprovado — `vitest run`: 10 arquivos, 21/21 verdes; `npm run build` OK; validação visual via Chrome headless em `375px`/`768px`/`1024px`: sem overflow horizontal (1 coluna preservada abaixo de `sm`), 3 colunas confirmadas em `768px`, sidebar desktop em `1024px` inalterada | 2026-08-08 | `frontend/components/ResumeSidebar.tsx` |
| Tech Lead (grid skills mobile/iPad) | `@tech-lead-review` | Aprovar — diff restrito a um wrapper `grid` (classes Tailwind) em torno do `.map` existente, sem mudança de props/dados/lógica; breakpoints escolhidos preservam o comportamento anti-overflow de `375px` já validado em US-07-02 (CA-001); sem impacto em schema/API/contraste | 2026-08-08 | `frontend/components/ResumeSidebar.tsx` |
| PO (grid skills mobile/iPad) | `@product-owner` | Aceito — layout de Habilidades Técnicas compactado em tablet/iPad (9 categorias em coluna única → 3 colunas a partir de 768px) sem regredir mobile estreito nem desktop; status da história permanece Quase lá (mesma pendência de preview Vercel, não relacionada a este ajuste) | 2026-08-08 | screenshots 375/768/1024px |
| QA (timeline/contato/skills, pós-validação) | `@qa-engineer` | Aprovado — `vitest run`: 12 arquivos, 33/33 verdes (2 casos novos em `ExperienceSection.test.tsx` cobrindo o selo "Atual"; 1 novo em `ResumeSidebar.test.tsx` cobrindo o link do Maps); `npm run build`/`lint` limpos; QA visual via Chrome headless (CDP `captureScreenshot`, full-page + scroll real, desktop 1440px e mobile 390px, `--force-prefers-reduced-motion`) confirmou a correção do bug de sobreposição ícone/texto na timeline e o funcionamento do link de mapa e dos ícones de skill em todos os breakpoints | 2026-08-08 | `frontend/components/ExperienceSection.tsx`, `ResumeSidebar.tsx`, capturas CDP |
| Tech Lead (timeline/contato/skills, pós-validação) | `@tech-lead-review` | Aprovar — diff de layout/copy sobre componentes já revisados, sem tocar contrato de props/dados; bug de containing-block (`absolute left-0` competindo com `pl-16` no mesmo elemento) identificado e corrigido corretamente (padding isolado num wrapper de conteúdo); nova dependência `react-icons` registrada em `ADR-007` (regra do projeto de sempre documentar dep nova, mesmo trivial); sem chave de API/CORS tocado; `resume.json` só reclassifica skills existentes, nenhuma tecnologia nova inventada | 2026-08-08 | `ADR-007`, diff de `ExperienceSection.tsx`/`ResumeSidebar.tsx`/`skill-icons.ts` |
| PO (timeline/contato/skills, pós-validação) | `@product-owner` | Aceito — timeline única, mapa clicável, ícone de localização padronizado e ícones por habilidade entregues conforme pedido do autor; status da história permanece Quase lá (mesma pendência de preview Vercel) | 2026-08-08 | avaliação acima |
| QA (promoções/certificações/hero/skills) | `@qa-engineer` | Aprovado — `vitest run`: 12 arquivos, 40/40 verdes (novos casos: agrupamento por promoção em `ExperienceSection`, agrupamento por emissor em `Certifications`, divisão do título em `ResumeSidebar`, helpers em `utils.test.ts`); `npm run build`/`lint`/`tsc --noEmit` limpos (só warning pré-existente em `coverage/`); QA visual via CDP (`Page.captureScreenshot`, espera real ~3,5s) em 1440px e 390px confirmou: logo único por empresa nas promoções (Shift, WebPic) com selo "Promovido", certificações agrupadas por emissor com ano discreto, ícones de skill com contraste visível em todas as categorias, título do hero dividido em cargo (destaque)/info (discreta) | 2026-08-08 | `ExperienceSection.tsx`, `Certifications.tsx`, `ResumeSidebar.tsx`, `lib/utils.ts`, `lib/skill-icons.ts`, capturas CDP |
| Tech Lead (promoções/certificações/hero/skills) | `@tech-lead-review` | Aprovar — agrupamentos (`groupExperiencesByCompany`/`groupCertificationsByIssuer`) e `parseHeroTitle` extraídos como funções puras testáveis em `lib/utils.ts`, seguindo o padrão já existente de `formatResumePeriod`/`deriveProfileBadges` (removida, sem uso residual); diff restrito a apresentação — sem mudança de schema/props externas; novos itens de `skills` (AI Engineering, Redis, DynamoDB) já suportados por dados reais existentes no `resume.json` (about/highlights) ou confirmados diretamente pelo autor, sem invenção de conteúdo; sem dependência nova (`ADR-007` já cobria `react-icons`); item do medidor de proficiência corretamente deixado fora desta entrega, aguardando aprovação visual do autor | 2026-08-08 | diff de `lib/utils.ts`, `ExperienceSection.tsx`, `Certifications.tsx`, `ResumeSidebar.tsx`, `resume.json`, `skill-icons.ts` |
| PO (promoções/certificações/hero/skills) | `@product-owner` | Aceito — promoções sem logo duplicado, certificações organizadas por emissor com ano discreto, ícones de skill legíveis e título do hero mais elegante entregues conforme pedido do autor; medidor de proficiência corretamente represado para aprovação visual separada; status da história permanece Quase lá (mesma pendência de preview Vercel, não relacionada a este ajuste) | 2026-08-08 | avaliação acima |
| QA (medidor de proficiência) | `@qa-engineer` | Aprovado — `vitest run`: 12 arquivos, 41/41 verdes (novo caso cobrindo a barra segmentada com `aria-label` de nível em `ResumeSidebar.test.tsx`); `pytest` backend 27/27 verdes (fixture de `test_rag.py` atualizada para `items` como objeto); `npm run build`/`lint`/`tsc --noEmit` limpos; QA visual via CDP em 1440px/~900px/390px confirmou barra preenchida corretamente por nível, truncamento com `title` no hover em colunas estreitas, sem regressão nas demais seções | 2026-08-08 | `ResumeSidebar.tsx`, `resume.schema.ts`, `backend/app/models/resume.py`, `backend/app/rag.py`, `backend/tests/test_rag.py` |
| Tech Lead (medidor de proficiência) | `@tech-lead-review` | Aprovar — mudança de schema (`items: string[]` → `{name, level}[]`) espelhada corretamente Zod/Pydantic, sem quebrar `rag.py` (chunk de skill atualizado para o novo shape, enriquecido com o nível por extenso); sem dependência nova; ressalva registrada e não bloqueante: níveis de proficiência são um rascunho do agente, não uma autoavaliação do autor — pendente de revisão antes de tratar este ajuste como definitivo | 2026-08-08 | diff de `resume.schema.ts`, `models/resume.py`, `rag.py`, `ResumeSidebar.tsx` |
| PO (medidor de proficiência) | `@product-owner` | Aceito com ressalva — formato "barra segmentada" aprovado pelo autor entre as opções apresentadas e implementado; níveis por habilidade são rascunho pendente de revisão do autor (não é Done deste sub-item até a revisão); status da história permanece Quase lá (preview Vercel) | 2026-08-08 | escolha do autor no chat + avaliação acima |
| PO | `@product-owner` | Aceito/Done — autor confirmou preview/produção 2026-08-11; DoD completo (níveis recalibrados em US-07-08) | 2026-08-11 | preview/produção |

**Status:** Done
