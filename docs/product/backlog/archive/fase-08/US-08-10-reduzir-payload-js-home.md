# US-08-10 — Reduzir payload de JS client-side da Home

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** visitante/recrutador acessando pelo celular,
**quero** que a Home carregue e fique interativa mais rápido,
**para** ter uma primeira impressão melhor do site em conexões/dispositivos mais lentos.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (só client JS/build, sem endpoint)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (nenhuma entidade nova/alterada)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance (`PRD-006`); origem do achado: [US-08-04](US-08-04-auditoria-performance.md) / [`QA-006`](../../../qa/QA-006-auditoria-performance.md), achado M1 (+ L2 agrupado)
- [x] ADR registrado se envolve decisão de stack nova — N/A (revisão de uso de libs já aprovadas — `framer-motion` em `ADR-005` — e de config de build já existente; sem lib nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — N/A (sem UI nova; CA-006 da US-08-04 já veda refactor visual — esta história otimiza o "como" carrega, não o "o quê" aparece)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Plano de testes

- Manual: Lighthouse mobile em produção (mesma técnica de `QA-006`) antes/depois, confirmando Performance ≥ 92 (sem regressão) e `unused-javascript` menor que o baseline de 69 KiB medido em `QA-006`
- Regressão: `npm test` (suíte completa) e `npm run build` sem quebrar; nenhuma mudança visível de UI (mesmo output renderizado)
- Mocks: nenhum

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: Lighthouse mobile em produção real mantém Performance ≥ 92 (não regride o baseline de `QA-006`) — N/A/justificado: nenhum código de produção mudou nesta história (`git diff` vazio em `frontend/`), então o bundle em produção é byte-idêntico ao medido em `QA-006` (92); não há como o score regredir sem mudança de código
- [x] CA-002: `unused-javascript` do Lighthouse mobile reporta savings menor que 69 KiB (baseline de `QA-006`) após revisão de imports de `framer-motion`/`lucide-react`/`react-icons` (garantir tree-shaking — imports nomeados, não wildcard) — **risco aceito**: investigação confirmou que os imports já são 100% tree-shakeable e que não há alavanca de código disponível para reduzir esse número (ver "Conclusão da investigação" e Task T01); decisão de produto de 2026-08-16 é não perseguir esse CA além do que a investigação já cobriu
- [x] CA-003: `legacy-javascript-insight` do Lighthouse não reporta mais polyfills para `Array.prototype.at`/`flat`/`flatMap` após revisão do `browserslist`/target de compilação do Next.js para navegadores modernos reais (sem suporte a IE11/legado, que este site nunca precisou suportar) — **risco aceito**: causa raiz é o arquivo `polyfillFiles` do próprio Next.js, injetado incondicionalmente pelo framework e servido via `<script nomodule>` (custo real zero para navegadores evergreen); não configurável via `browserslist`/target do projeto (ver "Conclusão da investigação" e Task T02); decisão de produto de 2026-08-16 é aceitar esse overhead fixo do framework
- [x] CA-004: nenhuma mudança visível de UI — suíte de testes existente (`npm test`) permanece 100% verde, sem alterar snapshot/comportamento de nenhum componente — `npm test -- --run` → 65 passed (17 arquivos), nenhum quebrado; nenhum código de produção alterado

### Fora de escopo

- Redesign visual ou remoção de animações existentes (o motion em si já foi um trade-off aceito conscientemente em `US-07-06`) — esta história é sobre **como** o JS é entregue/tree-shaken, não sobre remover funcionalidade
- Trocar `framer-motion` por outra lib de animação — fora de proporção para o ganho esperado
- Lazy-loading de componentes abaixo da dobra, se exigir reestruturação de componente (avaliar caso a caso; só entra se for troca trivial de import)

### Dependências

- [PRD-006](../../PRD-006-seguranca-performance.md)
- [US-08-04](US-08-04-auditoria-performance.md) (Done) — origem do achado M1/L2
- [`QA-006`](../../../qa/QA-006-auditoria-performance.md) — evidência do achado e baseline numérico
- `ADR-005` (framer-motion já aprovado, sem reabrir decisão de stack)

### Épico / Prioridade

Segurança & Performance — P2

### Tasks

- [x] T01 Revisar imports de `framer-motion`, `lucide-react` e `react-icons` nos componentes da Home (`Hero`, `MobileHero`, `ResumeSidebar`, etc.) garantindo import nomeado/tree-shakeable, não wildcard — **revisado, nenhuma mudança necessária**: `grep -rn "from ['\"]framer-motion|lucide-react|react-icons"` em todo `frontend/` confirma 100% dos imports já nomeados (`import { motion, useReducedMotion } from "framer-motion"`, `import { X } from "lucide-react"`, subpaths `react-icons/di`/`si`/`tb`); nenhum `import * as`. `lucide-react` e `react-icons/*` já estão na lista de pacotes otimizados por padrão do Next 16 (`node_modules/next/dist/docs/.../optimizePackageImports.md`), sem precisar de config extra. Testado empiricamente: adicionar `experimental.optimizePackageImports: ["framer-motion"]` (não incluído na lista padrão) a `next.config.ts` e comparar `npm run build` antes/depois — total de chunks JS idêntico byte a byte (875.302 B raw / 275.160 B gzip nos dois casos; chunk específico da Home 295.699 B nos dois). `framer-motion@13` já é `sideEffects: false` com `exports` ESM próprio — já tree-shakeado ao máximo pelo bundler. Mudança revertida por não ter efeito mensurável (evitar config morta)
- [x] T02 [P] Revisar `browserslist`/target de compilação do Next.js (`package.json` ou `.browserslistrc`) para remover polyfills desnecessários de navegadores legados — **revisado, achado da causa raiz diverge da hipótese original de `QA-006`**: não há `browserslist` no `package.json` nem `.browserslistrc`; o projeto já usa o target moderno padrão do Next 16 sem config (`chrome 111+`/`edge 111+`/`firefox 111+`/`safari 16.4+`, confirmado em `node_modules/next/dist/docs/03-architecture/supported-browsers.md`). O chunk que carrega os polyfills de `Array.prototype.at`/`flat`/`flatMap` (`.next/static/chunks/0cz1d0mv5g_q7.js`, core-js 3.38.1) é o arquivo **`polyfillFiles` do próprio Next.js** (`@next/polyfill-nomodule`, `node_modules/next/dist/build/polyfills/polyfill-nomodule.js`), injetado **incondicionalmente** em todo build client (`node_modules/next/dist/build/webpack-config.js:1770-1774`, `isClient && new CopyFilePlugin(...)`) — não é gerado a partir de `browserslist`/target do projeto e não existe flag pública no Next 16.3 para desativá-lo. É servido via `<script nomodule>` (confirmado no HTML gerado), então nenhum navegador evergreen real (Chrome/Edge/Firefox/Safari modernos, os únicos que visitam o site) o baixa ou executa — custo real para o usuário é zero. O Lighthouse ainda assim inspeciona estaticamente esse arquivo referenciado no HTML e o reporta em `legacy-javascript-insight`, independentemente de `nomodule`. Nenhuma alteração de `browserslist` no projeto muda esse comportamento — é overhead fixo do framework
- [x] T03 Rodar Lighthouse mobile em produção pós-deploy e comparar com o baseline de `QA-006` (Performance, `unused-javascript`, `legacy-javascript-insight`) — N/A/justificado: decisão de produto de 2026-08-16 aceitou o risco de CA-002/CA-003 sem perseguir fix de código; sem mudança de código nesta história, uma nova medição de Lighthouse não traria informação adicional além do já registrado em `QA-006`
- [x] T04 [P] `npm test` e `npm run build` para regressão — `npm run build` → sucesso (2 rodadas, com e sem a mudança revertida de T01); `npm test -- --run` → ver evidência de execução abaixo; `npm run lint` → ver evidência de execução abaixo

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]` — CA-001/CA-004 fechados com evidência; CA-002/CA-003 fechados por risco aceito (decisão do autor em 2026-08-16, ver justificativa em cada CA)
- [x] Cobertura de testes ≥ 70% no código tocado — N/A: nenhum código de produção foi alterado (mudança de `next.config.ts` testada e revertida por não ter efeito mensurável)
- [x] Build/lint limpo (`npm run build`, `npm run lint`) — `npm run build` 2x sucesso; `npm test -- --run` → 65 passed (17 arquivos); `npm run lint` → 0 erros, 3 warnings pré-existentes não relacionados a este escopo
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — ver Vereditos
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto — nenhuma alteração de código
- [x] Documentação atualizada — `QA-006` referenciado; achados de T01/T02 documentados na seção Tasks; conclusão da investigação abaixo
- [x] Deploy/preview verificado — N/A: nenhum código mudou, nada para deployar
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Conclusão da investigação (T01/T02) — por que CA-002/CA-003 ficam em aberto

A hipótese de causa raiz do `QA-006` (import não tree-shakeable / `browserslist` desatualizado) **não se confirmou** após investigação real no código e no framework instalado:

1. **`unused-javascript` (CA-002):** todos os imports de `framer-motion`/`lucide-react`/`react-icons` já são nomeados; `lucide-react` e `react-icons/*` já entram na lista de pacotes otimizados por padrão do Next 16; `framer-motion@13` é `sideEffects: false` com `exports` ESM próprio. Testei adicionar `framer-motion` a `experimental.optimizePackageImports` e comparei o build antes/depois byte a byte — **nenhuma diferença** (875.302 B raw / 275.160 B gzip nos dois casos). Não há alavanca de import/config disponível; o número medido pelo Lighthouse provavelmente reflete código de interação (chat, seções colapsáveis, bottom sheet) não exercido na janela curta de coverage do próprio Lighthouse, não desperdício real.
2. **`legacy-javascript-insight` (CA-003):** o chunk com polyfills de `Array.prototype.at`/`flat`/`flatMap` é o arquivo `polyfillFiles` do próprio Next.js (`@next/polyfill-nomodule`), injetado **incondicionalmente** em todo build de produção do framework (`node_modules/next/dist/build/webpack-config.js:1770-1774`), independente de `browserslist`/target do projeto. É servido com `<script nomodule>` — nenhum navegador evergreen real o baixa ou executa. Não existe config pública no Next 16.3 para removê-lo.
3. Avaliei também lazy-loading (`next/dynamic`) para o Assistente RAG (`ProfileAssistChat`/`RagChatPanel`, maior componente client abaixo do resumo) — descartado: ele renderiza conteúdo visível (`embedded`) imediatamente na carga da página, então `ssr: false` causaria pop-in/CLS (violaria CA-004) e `ssr: true` não reduz o JS carregado no hydrate inicial — não é uma "troca trivial de import" segura, conforme a ressalva já registrada em "Fora de escopo".

**Nenhuma alteração de código foi aplicada** (`git diff` vazio em `frontend/`, só esta história atualizada). Diferente de US-08-02/06/07/08/09/11, o bloqueio aqui não é falta de acesso à produção — é a ausência de um fix de código viável dentro do escopo proposto pela `QA-006`.

#### Addendum — medição real em produção pós-deploy (2026-08-16)

Após o merge `develop`→`main` (PR #44, inclui também US-08-11), rodei Lighthouse mobile real contra `https://lucas-palhares-cv.vercel.app` (Chrome headless local): Performance **92** (CA-001 confirmado, sem regressão) e `unused-javascript` **53.032 bytes (~51,8 KiB)** — abaixo do baseline de 69 KiB de `QA-006`, satisfazendo CA-002 na prática. Atribuição incerta: nenhuma mudança de código desta história poderia causar isso (nenhum código mudou aqui); mais provável é efeito cumulativo de US-08-11 (remoção da requisição de prefetch que falhava) ou variação normal de execução do Lighthouse — mesma cautela de atribuição já usada em `QA-006` para o salto de Performance 66→92. `legacy-javascript-insight` confirmado com o mesmo achado (14.013 bytes, chunk `polyfillFiles` do Next.js, sinais `Array.prototype.at`/`flat`/`flatMap`/`Object.fromEntries`/`Object.hasOwn`) — reforça a conclusão de CA-003 (overhead fixo do framework, risco aceito mantido).

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | **Aprovado com ressalvas** — `npm test -- --run` → 65 passed (17 arquivos), 0 quebrado; `npm run build` → sucesso (2x); `npm run lint` → 0 erros (3 warnings pré-existentes, fora do escopo). Nenhuma regressão possível de verificar por não haver diff de código. Reproduzi a comparação de bundle (`.next/static/chunks`, total idêntico com/sem `optimizePackageImports`) e confirmei a origem do polyfill via `build-manifest.json` (`polyfillFiles`) + grep do conteúdo do chunk (`core-js@3.38.1`, `target:"Array"`, `at`/`flatMap`/`flat`) — achados T01/T02 batem com a evidência real, não são só narrativa. Ressalva: CA-002/CA-003 seguem `[ ]`, sem caminho de código disponível; T03 não executável sem produção | 2026-08-16 | Seção "Conclusão da investigação" acima |
| Tech Lead | `@tech-lead-review` | **Aprovar** — `git diff --stat` mostra só este arquivo de backlog alterado; nenhum código de produção tocado. Decisão de reverter `experimental.optimizePackageImports` correta — evita config morta sem efeito mensurável no bundle (evidenciado, não hipótese). Investigação de T02 é sólida: aponta arquivo, linha e mecanismo exato do Next.js (`webpack-config.js:1770-1774`, `CopyFilePlugin` incondicional) em vez de afirmação genérica. Avaliação do `next/dynamic` para `ProfileAssistChat` correta em rejeitar `ssr:false` pelo risco de CLS/pop-in — coerente com CA-004 e com a ressalva já presente em "Fora de escopo" da própria história (só entra lazy-loading "se for troca trivial"). Sem achado Critical/High — não há diff de produção para revisar | 2026-08-16 | `git diff --stat` vazio em `frontend/` |
| PO | `@product-owner` | **Aceite (Done)** — T01/T02/T03/T04 fechados com evidência real; CA-001/CA-004 fechados (nenhuma regressão possível sem mudança de código); CA-002/CA-003 fechados por decisão explícita do autor em 2026-08-16: aceitar o risco, mesmo padrão já usado para o achado L3 em `QA-006` — a causa raiz investigada (não suposição) mostrou que não há alavanca de código disponível dentro do escopo desta história para reduzir `unused-javascript` (imports já ótimos) nem `legacy-javascript-insight` (polyfill fixo do próprio Next.js, custo real zero). Nenhum código de produção foi alterado. DoD 100% fechado | 2026-08-16 | Seção "Conclusão da investigação" acima |

**Status:** Done — CA-002/CA-003 fechados por risco aceito (decisão do autor, 2026-08-16); nenhuma mudança de código; achados documentados para referência futura caso uma iniciativa maior de code-splitting seja proposta.
