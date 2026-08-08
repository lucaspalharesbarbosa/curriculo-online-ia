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

- [x] CA-001: paleta amber/dark do template em `globals.css`; identidade PortfolioHub (ciano/Clash) removida do fluxo ativo
- [x] CA-002: glass, orbs, glow, skill-tag/project-card; `prefers-reduced-motion` em `globals.css`
- [x] CA-003: layout sidebar sticky + main; empilha em mobile
- [x] CA-004: contato na sidebar (e-mail, WhatsApp, LinkedIn, GitHub, PDF)
- [x] CA-005: skills como tags por categoria a partir de `skills[]`
- [x] CA-006: About no padrão Summary (sem passion inventada)
- [x] CA-007: Experience com as 6 experiências reais
- [x] CA-008: Education com `education[]`
- [x] CA-009: Certificações no layout Awards
- [x] CA-010: Projects no padrão featured cards
- [x] CA-011: ChatWidget funcional na paleta amber
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
- [ ] Deploy/preview verificado (UI) — pendente preview Vercel após PR
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

**Status:** Quase lá — implementação e aceite locais fechados (incl. paleta D1 Deep Ice); falta preview de deploy (Vercel) após abertura do PR
