# US-07-06 — Layout mais dinâmico e chamativo

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** que o site tenha mais movimento, profundidade e destaque visual do que o redesign estático atual,
**para** ter uma impressão mais forte e memorável logo nos primeiros segundos.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (só UI/CSS/motion, sem endpoint)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem mudança de `resume.json`/schema)
- [x] Plano de testes definido (abaixo)
- [x] Épico e dependências identificados — depende de US-07-03 (base visual) e US-07-05 (conteúdo/estrutura final dos cards) já fechados antes de mexer em motion, para não retrabalhar cards que ainda vão mudar de forma
- [x] ADR registrado — N/A: usa só a lib já aprovada em `ADR-005` (`framer-motion`), sem stack nova
- [x] Variáveis de ambiente/segredos — N/A
- [x] Referência visual definida — evolução do padrão glass/accent já usado (`ADR-005`, US-07-03), não uma referência nova; direção: mais profundidade (parallax leve/hover 3D sutil), stagger de entrada mais expressivo, glow/gradiente mais presente, `prefers-reduced-motion` sempre respeitado
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: componentes tocados continuam renderizando o mesmo conteúdo (testes existentes não podem quebrar por causa de motion); nenhum teste novo de animação em si (Vitest não roda motion real) — cobrir só que elementos/`aria-*` continuam presentes
- Manual: Lighthouse mobile em build de produção (não pode regredir Performance/A11y da baseline CA-014 de US-07-03: A11y 100, BP 100, Perf 81); comparação visual antes/depois; teste de `prefers-reduced-motion: reduce` no DevTools
- Contraste WCAG AA mantido (não pode regredir os 8 pares validados em US-07-03)

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: `ResumeSidebar` com efeito de destaque adicional no avatar/nome (`pulse-glow` + hover `scale-105` no avatar, `glow-text` no nome), sem quebrar sticky/responsividade já validados
- [x] CA-002: `ExperienceSection`, `EducationSection`, `Certifications` e `ProjectsSection` com stagger de entrada mais expressivo (curva expo-out/`spring`, `whileHover`) e hover mais rico nos cards (`icon-glow` nos logos, `scale`/`y` no hover), mantendo `glass`/`accent` já definidos
- [x] CA-003: background da página (`page.tsx`) com mais profundidade — 2 dos 3 orbs com `orb-drift`/`orb-drift-delayed` (drift lento via `transform`), sem gerar layout shift nem prejudicar leitura de texto
- [x] CA-004: todo motion novo respeita `prefers-reduced-motion` — classes CSS novas (`orb-drift`, `orb-drift-delayed`) adicionadas ao bloco `@media (prefers-reduced-motion: reduce)` existente; `<MotionConfig reducedMotion="user">` adicionado em `layout.tsx` envolvendo `children` + `ChatWidget`, para que `whileHover`/`whileInView` do `framer-motion` (não cobertos pela media query CSS) também respeitem a preferência do SO em todo o app
- [~] CA-005: Lighthouse mobile (build de produção, headless local) — **não confirmável com confiança nesta máquina**: a mesma medição na `develop` sem nenhuma mudança desta história já retorna Performance 56 neste ambiente (headless Chrome + throttling 4x, notebook em uso), longe dos 81 documentados em US-07-03/CA-014, e o score varia ±10 pontos entre execuções idênticas consecutivas (ruído de ambiente). Dois anti-padrões de performance reais foram identificados e corrigidos durante o QA: `pulse-glow` (animação de `box-shadow`, cara para repaint) estava aplicado em 11 badges de certificação simultâneas — removido; os orbs de fundo acumulavam 2 animações infinitas simultâneas (`pulse-slow` + `orb-drift`) no mesmo elemento — resolvido para 1 animação por orbe. Após as correções, o score local ficou em 48 (vs. 56 da própria `develop` neste ambiente) — ainda com uma diferença que não dá pra atribuir só a ruído, mas sem regressão qualitativa nova (A11y 100, Best Practices 100 mantidos). Verificação definitiva fica para o preview de deploy real (Vercel + Lighthouse CI ou PageSpeed Insights), item já pendente no DoD
- [x] CA-006: contraste WCAG AA mantido — nenhuma cor foi alterada nesta história (só motion/CSS de animação), os 8 pares já validados em US-07-03 continuam os mesmos (recalculados por amostragem: accent-400/background 12.04:1, muted/surface 6.16:1 — idêntico ao registro anterior)
- [x] CA-007: suíte de testes existente (frontend) continua 100% verde após as mudanças de motion/estilo — `vitest --run`: 10 arquivos, 27/27

### Fora de escopo

- Mudança de conteúdo/dados (já coberta por US-07-05)
- Nova paleta de cor (mantém D1 Deep Ice)
- Troca de lib de animação
- Redesign estrutural (grid sidebar+main, seções) — só polimento visual/motion sobre o que já existe

### Dependências

- US-07-03 (base visual), US-07-05 (conteúdo/estrutura final dos cards que vão ganhar motion)
- `ADR-005` (framer-motion já aprovado)

### Épico / Prioridade

Frontend & UX v2 — P2

### Tasks

- [x] T01 `frontend/app/globals.css` — novos keyframes/utilitários de motion (`orb-drift`/`orb-drift-delayed`), sempre atrás de `prefers-reduced-motion` (fundação; bloqueia T02–T05 usarem as classes novas)
- [x] T02 [P] `frontend/components/ResumeSidebar.tsx` (+ teste) — destaque no avatar/nome
- [x] T03 [P] `frontend/components/ExperienceSection.tsx` (+ teste) — stagger/hover mais expressivo
- [x] T04 [P] `frontend/components/EducationSection.tsx` + `Certifications.tsx` (+ testes) — stagger/hover mais expressivo
- [x] T05 [P] `frontend/components/ProjectsSection.tsx` (+ teste) — stagger/hover mais expressivo
- [x] T06 `frontend/app/page.tsx` — orbs com movimento sutil; `layout.tsx` — `MotionConfig reducedMotion="user"`
- [x] T07 `npm test`, `npm run build`, Lighthouse mobile, checagem de contraste — evidência de DoD (CA-005 com ressalva documentada)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]` — exceto CA-005, marcado `[~]` com ressalva documentada (ambiente local não reproduz a baseline; verificação real fica para o preview de deploy)
- [x] Cobertura de testes ≥ 70% no código tocado — `N/A` justificado: mudanças são classes CSS/props de motion sobre componentes já cobertos por teste existente, sem lógica nova; suíte completa (94,62% stmts) não regrediu
- [x] Build/lint limpo — `npm run build` OK, `npm run lint` sem erro (1 warning pré-existente em `coverage/`)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A (sem ADR/contrato novo; só motion/CSS)
- [ ] Deploy/preview verificado (UI) — pendente preview Vercel após PR (inclui reconfirmar CA-005 em ambiente real)
- [x] Vereditos QA, Tech Lead e PO na tabela abaixo
- [x] Status da história atualizado

### Ajustes pós-entrega (2026-08-08 — pós-validação manual, via `@orquestrador`)

Autor validou manualmente o resultado desta história e confirmou explicitamente que aceita o custo de performance do motion adicional (item 9 do pedido: "sei que isso impacta performa, não tem problema, faça mesmo assim"). Sem novo CA — reforço pontual sobre o que já estava entregue, feito em conjunto com os ajustes de `US-07-03`:

- Halo giratório sutil (`spin-slow`, `globals.css`, atrás do halo pulsante do avatar em `ResumeSidebar`) e leve rotação em `whileHover` nos ícones de logo (`ExperienceSection`) e medalha (`Recognitions`, seção nova de `US-07-05`) — todos atrás do bloco `@media (prefers-reduced-motion: reduce)` já existente (CA-004 continua respeitado).
- Suíte completa (`vitest run`) permanece 100% verde após os novos elementos de motion: 12 arquivos, 33/33 testes.
- CA-005 (Lighthouse) mantém a mesma ressalva já registrada — ambiente local não reproduz a baseline de produção; sem nova medição feita nesta rodada (autor já sinalizou aceitar o trade-off).

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalva — `vitest --run`: 10 arquivos, 27/27 verdes; `npm run build`/`lint`/`tsc --noEmit` limpos; contraste inalterado (sem mudança de cor); Lighthouse mobile local inconclusivo (ver CA-005) — ambiente de desenvolvimento não reproduz a baseline documentada de 81 (a própria `develop` mede 56 aqui); 2 anti-padrões de performance reais identificados e corrigidos no processo (`pulse-glow` em 11 badges simultâneas; dupla animação infinita nos orbs de fundo); recomendo Lighthouse real no preview Vercel antes do aceite final de performance | 2026-08-08 | CA-001–007; `lh-baseline.json` (develop, Perf 56) vs `lh-report5.json` (branch, Perf 48) neste ambiente |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalva — diff usa quase só classes/keyframes já existentes em `globals.css` (`pulse-glow`, `icon-glow`, `.project-card`) e `whileHover`/curvas de `framer-motion`, sem lib nova (`ADR-005` já cobria); `MotionConfig reducedMotion="user"` é a forma correta/idiomática de estender `prefers-reduced-motion` para animações JS do framer-motion, boa adição; ressalva única: performance não pôde ser confirmada localmente com confiança — não é motivo para bloquear o merge de código (sem regressão de A11y/BP, testes verdes, sem chave/CORS tocado), mas o autor deve olhar o Lighthouse do preview Vercel antes de considerar CA-005 fechado de fato | 2026-08-08 | `globals.css`, `layout.tsx`, diffs dos 5 componentes |
| PO | `@product-owner` | Quase lá — CA-001–004/006/007 fechados; CA-005 fica `[~]` (ressalva de ambiente, não de regressão confirmada); layout mais dinâmico entregue conforme pedido (glow, hover expressivo, stagger, drift de background), sem mudar paleta/estrutura; falta preview de deploy para reconfirmar performance e fechar o CA-005 em definitivo | 2026-08-08 | avaliação acima |
| QA (reforço motion, pós-validação) | `@qa-engineer` | Aprovado — `vitest run`: 12 arquivos, 33/33 verdes após halo giratório e rotação em hover; novas classes atrás do bloco `prefers-reduced-motion` existente; sem regressão visual nos breakpoints testados (desktop/mobile via CDP) | 2026-08-08 | `globals.css`, `ResumeSidebar.tsx` |
| Tech Lead (reforço motion, pós-validação) | `@tech-lead-review` | Aprovar — adição pontual de 1 keyframe CSS + `whileHover` em 2 componentes, mesmo padrão de `ADR-005`; nenhuma mudança de estrutura/paleta; risco de performance já é uma decisão explícita e informada do autor, não uma lacuna de review | 2026-08-08 | `globals.css` |
| PO (reforço motion, pós-validação) | `@product-owner` | Aceito — autor confirmou aceitar o trade-off de performance por um visual mais chamativo; status da história permanece Quase lá (mesma pendência de preview Vercel para reconfirmar CA-005) | 2026-08-08 | pedido explícito do autor |

**Status:** Quase lá — implementação, testes e review fechados; falta preview de deploy (Vercel) para reconfirmar Lighthouse (CA-005) e fechar o DoD
