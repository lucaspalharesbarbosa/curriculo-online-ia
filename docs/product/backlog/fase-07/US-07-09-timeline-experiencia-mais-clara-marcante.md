# US-07-09 — Timeline de Experiência mais clara (ordem) e mais marcante (usabilidade/visual)

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** entender de cara que a timeline de Experiência vai da passagem mais recente para a mais antiga, e ter uma experiência de leitura mais marcante que uma lista de cards,
**para** que a trajetória profissional cause impacto nos primeiros segundos, não só transmita informação.

### Contexto

Autor apontou dois problemas em `ExperienceSection.tsx`:
1. A ordem (mais recente → mais antiga, já é a ordem real de `experiences[]`/`groupExperiencesByCompany`) não é evidente visualmente — nada no layout comunica "isso é uma linha do tempo andando para trás no tempo".
2. A experiência de leitura é "career page" genérica (trilha vertical + cards) — autor quer algo que **surpreenda** quem acessa, não só um polimento a mais.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem mudança de `resume.json`/schema; usa `experiences[]` já existente)
- [x] Plano de testes definido (abaixo)
- [x] Épico e dependências identificados — depende de US-07-03 (base visual) e US-07-06 (motion) já entregues
- [x] ADR registrado — N/A esperado (segue `framer-motion` já aprovado em `ADR-005`); reavaliar apenas se a direção escolhida exigir lib nova (ex.: scroll-linked library dedicada)
- [x] Variáveis de ambiente/segredos — N/A
- [x] Referência visual definida — autor aprovou a opção **A "eixo do tempo com anos"**: coluna de anos ao lado da trilha + trilha se desenhando de cima para baixo uma única vez ao entrar na viewport, a partir de 4 conceitos mostrados em artifact comparativo
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `ExperienceSection.test.tsx` continua cobrindo que cada empresa/cargo/destaque/tecnologia renderiza a partir das props, incluindo o agrupamento de promoções (`groupExperiencesByCompany`) — asserção por conteúdo, não por classe CSS
- Manual: comparação visual antes/depois; confirmar que a ordem cronológica (mais recente primeiro) fica evidente sem precisar ler as datas linha a linha
- `prefers-reduced-motion: reduce` se a direção escolhida usar motion novo

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: a ordem "mais recente → mais antiga" é comunicada visualmente — eyebrow "Mais recente no topo" + coluna de anos (`formatYear(primaryRole.startDate)`) ao lado da trilha, ano em destaque (`accent-400`) para a posição atual
- [x] CA-002: layout usa o conceito aprovado pelo autor (opção A) — coluna de anos + ícone/logo + trilha, mesma estrutura de conteúdo (cargo, destaques, tecnologias) preservada
- [x] CA-003: agrupamento de promoções (mesma empresa, múltiplos cargos) continua funcionando sem regressão — `groupExperiencesByCompany` inalterado, teste "agrupa promoções..." verde
- [x] CA-004: contraste WCAG AA mantido — só reposiciona elementos existentes (`text-neutral-500`/`text-accent-400`) e adiciona ano no mesmo tom já usado em datas (`text-neutral-500`); sem cor nova
- [x] CA-005: trilha usa `framer-motion` (`scaleY` 0→1, `whileInView`, `once: true`) — animação de entrada única, coberta pelo `MotionConfig reducedMotion="user"` já global em `layout.tsx`; sem CSS `@keyframes` novo que precisasse de guarda manual
- [x] CA-006: `ExperienceSection.test.tsx` e suíte completa (`vitest run`) 100% verdes — 11 arquivos, 41/41
- [x] CA-007: `npm run build` e `npm run lint` limpos

### Fora de escopo

- Mudança de conteúdo/dados de `experiences[]`
- Mudança de paleta (mantém D1 Deep Ice)
- Redesign de outras seções (`EducationSection`, `Certifications`, `ProjectsSection`)

### Dependências

- US-07-03 (base visual), US-07-06 (motion), `ADR-005`

### Épico / Prioridade

Frontend & UX v2 — P2

### Tasks

- [x] T01 Propor 4 conceitos visuais (artifact comparativo) e obter aprovação do autor — opção A escolhida
- [x] T02 `frontend/components/ExperienceSection.tsx` — coluna de anos, eyebrow de direção, trilha com reveal único via `framer-motion`
- [x] T03 `frontend/app/globals.css` — `N/A`: reveal implementado via `framer-motion` (`whileInView`/`scaleY`), sem `@keyframes` CSS novo
- [x] T04 `npm test`, `npm run build`, `npm run lint` — evidência de DoD (ver Vereditos)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — `N/A` justificado: mudança é reposicionamento de markup + 1 prop de motion sobre componente já coberto pelos 4 testes existentes de `ExperienceSection.test.tsx` (todos continuam verdes); nenhuma lógica nova além de `formatYear`, já testada em `utils.test.ts`
- [x] Build/lint limpo — `npm run build` e `npm run lint` OK (mesmo warning pré-existente em `coverage/`)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A (só motion/markup, sem ADR/contrato novo)
- [x] Deploy/preview verificado (UI) — autor confirmou preview/produção 2026-08-11
- [x] Vereditos QA, Tech Lead e PO na tabela abaixo
- [x] Status da história atualizado

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalva — `vitest run`: 11 arquivos, 41/41 verdes (inclui os 4 testes de `ExperienceSection.test.tsx`, sem alteração de asserção necessária); `npm run build`/`lint` limpos; agrupamento de promoções, selo "Atual" e logo/ícone decorativo continuam funcionando; contraste inalterado; ressalva única: sem browser headless neste ambiente para confirmar visualmente o alinhamento da coluna de anos com o ícone/trilha em telas estreitas — recomendo checar em `npm run dev` ou no preview Vercel | 2026-08-08 | `ExperienceSection.tsx`, saída de `vitest run`/`next build`/`eslint` |
| Tech Lead | `@tech-lead-review` | Aprovar — diff local a um componente (`ExperienceSection.tsx`), sem tocar `resume.json`/schema/outros componentes; reveal da trilha via `framer-motion` (`whileInView` + `once: true`) evita o problema já visto em US-07-06 de motion infinito custando performance — aqui dispara uma vez só; offsets de `left`/`pl-*` recalculados de forma consistente (ano w-11 + gap + ícone left-14/w-12 = `pl-28`), sem número mágico solto; nenhuma chave/CORS tocado | 2026-08-08 | `frontend/components/ExperienceSection.tsx` |
| PO | `@product-owner` | Aceito/Done — autor confirmou preview/produção 2026-08-11; DoD completo | 2026-08-11 | preview/produção |

**Status:** Done
