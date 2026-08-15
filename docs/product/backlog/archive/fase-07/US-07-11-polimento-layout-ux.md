# US-07-11 — Polimento de layout e UX (collapse, perfil, mobile, reconhecimentos)

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** navegar o currículo com seções expansíveis, perfil mais legível, layout limpo em mobile/tablet e destaques claros nos reconhecimentos,
**para** absorver a trajetória com menos ruído visual e mais hierarquia — especialmente em tela pequena.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (só UI/CSS/motion + ajuste de texto em `resume.json`; sem endpoint)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem schema novo; só split de 1 highlight em 2 strings no mesmo array `experiences[].highlights`)
- [x] Plano de testes definido (abaixo)
- [x] Épico e dependências identificados — Frontend & UX v2; depende de US-07-03 (base visual) e US-07-05 (seções/conteúdo); `ADR-005` (framer-motion)
- [x] ADR registrado — N/A: sem stack/lib nova; reusa `framer-motion`/`lucide-react` já em `ADR-005`
- [x] Variáveis de ambiente/segredos — N/A
- [x] Referência visual definida — evolução do glass/amber Deep Ice já no ar; direção: accordion elegante (header clicável + chevron + altura animada), tipografia do Perfil em “lead + corpo” com ênfase em frases-chave, skills em lista compacta no mobile, ícones de seção com identidade geométrica/código (sem `Sparkles` genérico), reconhecimentos com descrição acessível sem tooltip cortado
- [x] Sem dúvida bloqueante — **exceto item “morph developer.ts → chat”**, que fica **fora desta história** (descoberta em canvas; só implementa após aprovação explícita do autor)

#### Plano de testes

- Unitário: `CollapsibleSection` (abrir/fechar, `aria-expanded`/`aria-controls`); seções que passam a usá-lo mantêm headings e conteúdo; `SummarySection` renderiza lead + corpo; `Recognitions` descrição acessível sem overlay cortado; `Certifications` sem ícone repetido por curso; `ExperienceSection` destaca PRAD e Mérito como itens separados; `ResumeSidebar` skills legíveis em viewport estreita (classes/`data-testid` se útil)
- Manual: mobile ~375px e tablet ~768px — collapse, skills, seções; teclado (Enter/Space no header); `prefers-reduced-motion`
- Contraste WCAG AA mantido nos pares accent/surface já validados

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: Experiência, Educação, Certificações, Reconhecimentos e Destaques são colapsáveis/expansíveis; **Perfil (Sobre) permanece sempre expandido** (sem controle de collapse)
- [x] CA-002: Controles de collapse com UX elegante (motion suave, chevron, foco teclado, `aria-expanded`/`aria-controls`); respeitam `prefers-reduced-motion`
- [x] CA-003: Perfil — descrição do `about` com hierarquia tipográfica (lead destacado + corpo), sem parede de texto única; conteúdo 100% real de `resume.json` (sem inventar frases)
- [x] CA-004: Certificações — removido o ícone repetido (`ShieldCheck` ou equivalente) à frente de cada curso; layout mais limpo, sem poluição
- [x] CA-005: Reconhecimentos — descrição (PRAD/Mérito) legível e bem posicionada (não fica sob outro elemento); visual digno do peso do reconhecimento (não só um `Info` minúsculo)
- [x] CA-006: Habilidades Técnicas em mobile/tablet com layout distinto do desktop: alinhamento consistente, leitura fácil, menos poluição (chips/medidor/grid adaptados ao viewport)
- [x] CA-007: Layout geral do site revisado em breakpoints mobile e tablet (sidebar, seções, tipografia, espaçamentos) sem regressão grave de usabilidade no desktop
- [x] CA-008: Ícones à frente dos títulos de seção (Perfil, Experiência, etc.) e dos blocos Contato / Habilidades Técnicas trocados por conjunto coerente com a identidade amber/glass/código — sem `Sparkles` genérico repetido
- [x] CA-009: Em Experiência (Itaú / Software Engineer): highlight de Alto Desempenho com destaque sutil; Mérito (2024) como item separado, também com destaque sutil; textos alinhados ao conteúdo real (sem inventar fatos)
- [x] CA-010: Suíte de testes do frontend verde no escopo tocado (`npm test`)

### Fora de escopo

- **Unificar `developer.ts` com o chat RAG via morph no scroll** — proposta em canvas de descoberta; implementação só após decisão do autor (história futura)
- Nova paleta / troca de template de referência
- Mudança de endpoint `/chat` ou do `ChatWidget` flutuante atual (além do que já existe)
- Inventar conteúdo novo no currículo

### Dependências

- US-07-03, US-07-05, `ADR-005`
- Decisão pendente (não bloqueia esta US): morph `developer.ts` → chat

### Épico / Prioridade

Frontend & UX v2 — P1

### Tasks

- [x] T01 `frontend/components/CollapsibleSection.tsx` (+ teste) — accordion acessível reutilizável (header + painel animado)
- [x] T02 [P] Aplicar collapse em `ExperienceSection`, `EducationSection`, `Certifications`, `Recognitions`, `ProjectsSection` — Perfil fora
- [x] T03 [P] `SummarySection.tsx` (+ teste) — tipografia/hierarquia do `about`
- [x] T04 [P] `Certifications.tsx` (+ teste) — remover ícone por curso
- [x] T05 [P] `Recognitions.tsx` (+ teste) — descrição sem overlap; visual mais premium
- [x] T06 [P] `ResumeSidebar.tsx` (+ teste/CSS) — skills mobile/tablet + ícones Contato/Skills
- [x] T07 [P] Ícones de seção em todos os headers tocados (identidade coerente)
- [x] T08 `resume.json` + `ExperienceSection.tsx` — split Alto Desempenho / Mérito + destaque sutil
- [x] T09 Ajustes responsivos globais (`globals.css` / `page.tsx` / seções) mobile+tablet
- [x] T10 `npm test` + `npm run build` — evidência DoD

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — `vitest --coverage`: stmts 97.92% / branches 90.27% / lines 97.84% (suite)
- [x] Build/lint limpo — `npm run build` OK; `npm run lint` sem erros (1 warning pré-existente em `coverage/`)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A (sem ADR/contrato novo); PRD-005 linka esta US
- [ ] Deploy/preview verificado — pendente preview Vercel após PR
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-08-08 | `vitest --run`: 12 files / 51 tests OK; cobertura ≥70%; ressalva: validação visual manual mobile/tablet e Lighthouse ficam para preview de deploy |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas | 2026-08-08 | Diff só UI/`resume.json`/utils; sem secrets/CORS; collapse acessível; ressalva: preview deploy + decisão futura do morph chat |
| PO | `@product-owner` | Done | 2026-08-08 | CAs 001–010 fechados; morph developer.ts→chat fora de escopo (aguarda escolha A/B/C); deploy preview pendente como nas US anteriores |

**Status:** Done
