# US-07-07 — Redesign do bloco de informações abaixo do nome (sidebar)

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** que o bloco logo abaixo do nome (cargos + informações complementares) tenha mais presença visual e elegância,
**para** que a primeira impressão do topo da sidebar seja tão forte quanto o resto do redesign (US-07-03/US-07-06), em vez de discreta/apagada.

### Contexto

Após validar manualmente US-07-03 e US-07-06, o autor achou o trecho abaixo do `<h1>{hero.name}</h1>` em `ResumeSidebar.tsx` (linhas 88-109) "muito discreto e xoxo": os `primaryRoles` (texto `gradient-text text-sm/base`, separados por `•`) e o `secondaryInfo` (`text-[11px] text-neutral-500 uppercase`) não têm o mesmo destaque visual (glow/glass/hover) já aplicado em avatar, botões e cards de contato/skills.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (só UI/CSS, sem endpoint)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem mudança de `resume.json`/schema; consome `hero.title` já existente via `parseHeroTitle`)
- [x] Plano de testes definido (abaixo)
- [x] Épico e dependências identificados — depende de US-07-03 (base visual/paleta) e US-07-06 (motion) já entregues; não conflita com nenhuma história aberta
- [x] ADR registrado — N/A: usa só o já aprovado em `ADR-005` (`framer-motion`, tokens de `globals.css`), sem lib nova
- [x] Variáveis de ambiente/segredos — N/A
- [x] Referência visual definida — autor aprovou a opção **B3 "duas linhas simultâneas"**: `Tech Lead` e `Senior Software Engineer` digitados ao mesmo tempo (efeito typewriter), sem alternar/esconder um pelo outro, a partir de 4 variações da opção B mostradas em artifact comparativo
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `ResumeSidebar.test.tsx` continua cobrindo que `hero.name`, cargos (`primaryRoles`) e info complementar (`secondaryInfo`) renderizam com o texto correto — asserção por conteúdo/`aria-*`, não por classe CSS
- Manual: comparação visual antes/depois; checagem de contraste WCAG AA do novo estilo (chips/badges) contra `background`/`surface`; `prefers-reduced-motion: reduce` se a opção escolhida usar `framer-motion`
- Lighthouse mobile — mesma ressalva de ambiente já registrada em US-07-06 (CA-005): não bloqueia, mas deve ser reconfirmada no preview de deploy

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: bloco abaixo do nome usa o layout aprovado pelo autor (opção B3): `primaryRoles` renderizados um por linha, cada um com efeito de digitação (`role-typewriter` em `globals.css`) disparado simultaneamente para todas as linhas (sem stagger/alternância); `secondaryInfo` mantido como estava (fora de escopo)
- [x] CA-002: contraste WCAG AA mantido — mesmos tokens já validados em US-07-03 (`gradient-text`/`accent-300` sobre `glass`, > 10:1); nenhuma cor nova introduzida
- [x] CA-003: nenhuma quebra de responsividade — `role-typewriter` usa `max-width: 100%` + `overflow: hidden` + fonte mono (1 caractere = 1ch, sem estouro de largura calculada); largura final fixa via `animation-fill-mode: forwards`, sem layout shift após o load
- [x] CA-004: animação em CSS puro (`@keyframes role-typewriter`), adicionada ao bloco `@media (prefers-reduced-motion: reduce)` já existente em `globals.css` — reduzida, o texto aparece com a largura final direto, sem digitação
- [x] CA-005: `ResumeSidebar.test.tsx` e suíte completa (`vitest run`) 100% verdes — 11 arquivos, 41/41
- [x] CA-006: `npm run build` e `npm run lint` limpos (mesmo warning pré-existente em `coverage/`, não relacionado a esta história); TypeScript sem erro (build roda `tsc` internamente via Next)

### Fora de escopo

- Mudança de paleta (mantém D1 Deep Ice, `ADR-005`)
- Mudança de conteúdo/dados do `resume.json` (só apresentação de `hero.title` já existente)
- Redesign de qualquer outra seção da sidebar (avatar, contato, skills, download CV) — só o trecho entre o nome e o bloco de Contato

### Dependências

- US-07-03 (base visual), US-07-06 (motion), `ADR-005` (framer-motion já aprovado)

### Épico / Prioridade

Frontend & UX v2 — P2

### Tasks

- [x] T01 `frontend/components/ResumeSidebar.tsx` (+ teste existente) — bloco de `primaryRoles` reescrito para o layout B3 (linhas simultâneas com typewriter)
- [x] T02 `frontend/app/globals.css` — `@keyframes role-typewriter` + `.role-typewriter`, atrás de `prefers-reduced-motion`
- [x] T03 `npm test`, `npm run build`, `npm run lint` — evidência de DoD (ver Vereditos)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — `N/A` justificado: mudança é markup/CSS de apresentação sobre um componente já coberto pelos 3 testes existentes de `ResumeSidebar.test.tsx` (que continuam verdes com o texto renderizado); nenhuma lógica nova (só JSX + `role.length` para a variável CSS)
- [x] Build/lint limpo — `npm run build` (inclui `validate:resume` + `next build`, TS incluso) e `npm run lint` OK
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A (só motion/CSS, sem ADR/contrato novo)
- [x] Deploy/preview verificado (UI) — autor confirmou preview/produção 2026-08-11
- [x] Vereditos QA, Tech Lead e PO na tabela abaixo
- [x] Status da história atualizado

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalva — `vitest run`: 11 arquivos, 41/41 verdes (inclui os 3 testes de `ResumeSidebar.test.tsx`, sem alteração de asserção necessária); `npm run build`/`lint` limpos; contraste inalterado (nenhuma cor nova, mesmos tokens de US-07-03); `prefers-reduced-motion` coberto (`.role-typewriter` no bloco existente + fallback de largura fixa, evitando o texto sumir com `animation: none`); ressalva única: sem browser headless neste ambiente para confirmar visualmente o timing/alinhamento das duas linhas simultâneas e o comportamento em telas estreitas — recomendo checar no preview Vercel antes do aceite final de UI | 2026-08-08 | `ResumeSidebar.tsx`, `globals.css`, saída de `vitest run`/`next build` |
| Tech Lead | `@tech-lead-review` | Aprovar — diff é local e reversível: 1 keyframe CSS novo + troca de markup de um único bloco (`primaryRoles`) em `ResumeSidebar.tsx`, sem tocar contato/skills/download; usa `ch`+fonte mono para a largura final bater exatamente com o texto (evita o risco de clipping de texto em fonte proporcional); `--role-chars` calculado a partir de `role.length` no próprio componente, sem dado novo; segue o mesmo padrão de motion-atrás-de-`prefers-reduced-motion` já estabelecido em US-07-06; nenhuma chave/CORS tocado | 2026-08-08 | `frontend/app/globals.css`, `frontend/components/ResumeSidebar.tsx` |
| PO | `@product-owner` | Aceito/Done — autor confirmou preview/produção 2026-08-11; DoD completo | 2026-08-11 | preview/produção |

**Status:** Done
