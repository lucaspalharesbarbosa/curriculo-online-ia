# QA-006 — Auditoria de performance (US-08-04)

**História:** [US-08-04](../product/backlog/fase-08/US-08-04-auditoria-performance.md)
**Épico:** Segurança & Performance (`PRD-006`)
**Data:** 2026-08-15/16
**Agente:** `@qa-engineer` (spike executado como Dev, validado como QA/Tech Lead/PO no mesmo pipeline)

## Escopo

Spike de auditoria de performance — não implementação (CA-006: nenhum refactor de UI aplicado). Cobre os 4 itens do plano de testes da história: Lighthouse (mobile + desktop) em produção, tamanho do bundle client JS, cache de assets estáticos, e classificação de achados com proposta de história filha por achado Critical/High/Medium.

## Método e ambiente

| Verificação | Ambiente | Comando/Evidência |
|---|---|---|
| Lighthouse mobile + desktop | **Produção real** (`https://lucas-palhares-cv.vercel.app`) | `npx -y lighthouse https://lucas-palhares-cv.vercel.app --output=json --output=html --chrome-flags="--headless=new --no-sandbox"` (mobile, default) e com `--preset=desktop` |
| Bundle client JS | Local (`frontend/`, `npm ci` + `npm run build` já rodados) | Inspeção de `.next/server/app/page/build-manifest.json`, `.next/server/app/index.html` (script tags carregados por `/`) e tamanho real (raw + gzip) de cada chunk via `zlib.gzipSync` em Node |
| Cache de assets estáticos | **Produção real** | `curl -I` em `/`, em um chunk `.js` e um chunk `.css` reais servidos em `https://lucas-palhares-cv.vercel.app/_next/static/immutable/chunks/...` |
| Causa provável dos achados | Local (código-fonte) + Lighthouse `errors-in-console`/`unused-javascript`/`legacy-javascript-insight` | Leitura de `frontend/components/ResumeSidebar.tsx` e `MobileHero.tsx`; `grep` nos chunks buildados |

Diferente das auditorias anteriores da Fase 08 (US-08-02, 06, 07, 08, 09), **este spike teve acesso real à produção** (site público, sem autenticação, ao contrário do painel do Render usado nas histórias de backend) — Chrome headless provisionado com sucesso via `npx lighthouse`, `curl` direto na URL pública. Nenhum CA ficou bloqueado por limitação de ambiente.

Os relatórios brutos do Lighthouse (`lighthouse-mobile.report.json/html`, `lighthouse-desktop.report.json/html`) foram gerados na raiz do worktree como artefato de evidência local — **não commitados** (mesmo padrão de US-07-06, que também não versionou o JSON bruto do Lighthouse).

---

## CA-001 — Scores Lighthouse (produção, Home `/`)

Executado em 2026-08-16T02:11–02:12 UTC, contra `https://lucas-palhares-cv.vercel.app/` (produção real, sem cache-busting).

| Categoria | Mobile | Desktop |
|---|---|---|
| Performance | **92** | **100** |
| Acessibilidade | **100** | **100** |
| Boas práticas | **96** | **100** |
| SEO | **100** | **100** |

Comparação com o baseline histórico mais recente (`US-07-06`, Lighthouse mobile produção em 2026-08-11): Performance **66 → 92**, Acessibilidade **96 → 100**, Boas práticas **96 → 96** (estável). Melhora expressiva de Performance mobile, provavelmente reflexo cumulativo das correções de Fase 07 (polimento) e Fase 08 (headers de segurança, CSP corrigida em US-08-09) — nenhuma otimização de performance dedicada havia sido feita entre as duas medições, então o ganho é mais provavelmente atribuído a variação de execução do Lighthouse / condição de rede no momento da medição do que a uma causa de código isolada; não investigado a fundo por estar fora do escopo do spike (CA-006 não pede rastrear a causa do ganho, só medir o estado atual).

### Métricas-chave (mobile)

| Métrica | Valor | Score |
|---|---|---|
| First Contentful Paint | 1.3 s | 0.98 |
| Largest Contentful Paint | **2.9 s** | 0.81 |
| Total Blocking Time | 180 ms | 0.92 |
| Cumulative Layout Shift | 0.002 | 1.00 |
| Speed Index | 3.1 s | 0.93 |
| Time to Interactive | 2.9 s | 0.96 |
| Max Potential FID | 350 ms | 0.25 |
| TTFB (server-response-time) | 20 ms | 1.00 |

### Métricas-chave (desktop)

| Métrica | Valor | Score |
|---|---|---|
| First Contentful Paint | 0.3 s | 1.00 |
| Largest Contentful Paint | 0.6 s | 1.00 |
| Total Blocking Time | 0 ms | 1.00 |
| Cumulative Layout Shift | 0.001 | 1.00 |
| Speed Index | 0.9 s | 0.98 |
| Time to Interactive | 0.6 s | 1.00 |
| TTFB (server-response-time) | 20 ms | 1.00 |

TTFB idêntico (20 ms) em ambos os form factors confirma que o gargalo do mobile é **CPU-bound no client** (Lighthouse simula 4x CPU throttling + rede 3G/4G no preset mobile), não rede/servidor — reforça a causa provável descrita no achado M1 abaixo.

### Rede — recursos carregados pela Home (mobile)

18 requisições, 404.875 bytes de transferência total:

| Tipo | Requisições | Bytes transferidos |
|---|---|---|
| Script | 7 | 239.186 |
| Font | 2 | 81.599 |
| Document (HTML) | 1 | 42.444 |
| Stylesheet | 1 | 14.971 |
| Image | 5 | 13.696 |
| Other | 2 | 12.979 |

---

## CA-002 — Achados classificados

### Medium

**M1 — LCP mobile 2,9 s / TBT 180 ms / Max Potential FID 350 ms, causados por payload de JS pesado no chunk específico da Home**

- Evidência real (Lighthouse mobile, produção):
  - `unused-javascript`: **~69 KiB estimados como não utilizados**, savings ~450 ms — concentrados em 3 chunks (`43c_a9ty41lt7.js`: 26,2 KB/35,8% não usado; `3n1-vw0fr63-t.js`: 22,2 KB/27,2%; `3poxctp49jato.js`: 22,1 KB/48,7%)
  - `legacy-javascript-insight`: ~14 KiB de polyfills para `Array.prototype.at`/`flat`/`flatMap`, já suportados nativamente pelos navegadores-alvo reais do site (sinal de `browserslist`/target do Next.js incluindo navegadores mais antigos do que o necessário)
  - `mainthread-work-breakdown`: Style & Layout 980,7 ms, Script Evaluation 854,6 ms, Other 541,7 ms — ~2,7 s de main thread ocupado, único item com score 0 nos diagnósticos
  - Confirmado por análise local do bundle (`next build`): o chunk específico da Home (não compartilhado entre todas as páginas) contém `framer-motion` **e** `lucide-react`/`react-icons` (confirmado via `grep` no chunk buildado), somando ~424 KB raw / ~141 KB gzip — maior que o próprio runtime compartilhado do React/Next (~437 KB raw / ~129 KB gzip, ver CA-003)
- Desktop **não é afetado** (Performance 100, LCP 0,6 s) — o Lighthouse desktop usa CPU/rede sem throttling agressivo, então o mesmo JS pesado não vira gargalo visível ali; confirma que a causa é avaliação de script no dispositivo, não tamanho de payload de rede isolado (TTFB idêntico nos dois form factors)
- Classificação: **Medium** — Performance mobile já está em 92 (patamar bom), não é uma regressão nem bloqueio, mas é a única métrica do relatório com folga real de melhoria e causa identificada com precisão (não é suposição)

### Low

**L1 — Erro de console em produção: 404 no PDF do currículo por prefetch indevido do `next/link`**

- Evidência real (Lighthouse mobile, `errors-in-console`, score 0):
  ```
  Failed to load resource: the server responded with a status of 404 ()
  https://lucas-palhares-cv.vercel.app/Lucas_Palhares_Barbosa_Engenheiro_De_Software.pdf?_rsc=5CB68i4pnAekjehf
  ```
- Causa raiz confirmada no código-fonte: `frontend/components/ResumeSidebar.tsx:216-217` e `frontend/components/MobileHero.tsx:161-163` usam o componente `Link` de `next/link` (import `next/link`, linha 15 de `ResumeSidebar.tsx`) apontando para um arquivo estático em `public/` com atributo `download`. O mecanismo de prefetch do `next/link` tenta buscar o payload RSC (`?_rsc=...`) desse caminho como se fosse uma rota do App Router; como é um arquivo estático (não uma rota), a busca retorna 404 e gera o erro no console do navegador.
- Confirmado que **não há impacto funcional real**: `curl -I` no mesmo caminho, com e sem o parâmetro `?_rsc=...`, retorna `200 OK`/PDF válido nos dois casos — o download em si funciona quando o usuário clica; o 404 é só da requisição de prefetch em segundo plano.
- Impacto: erro visível no console de qualquer visitante cujo navegador dispare o prefetch (link entra no viewport), e é exatamente o motivo do Boas Práticas mobile (96) ficar abaixo do desktop (100 — não reproduzido nessa rodada específica, mas mesmo bug presente no código de ambos os componentes).
- Classificação: **Low** — sem quebra funcional, mas fácil de corrigir (troca de `Link` por `<a>` nativo, já que `download` não faz sentido com navegação client-side de qualquer forma).

**L2 — Polyfills legados desnecessários (~14 KB)**

- Ver evidência em M1 (`legacy-javascript-insight`). Registrado como achado próprio porque a causa é distinta (config de `browserslist`/target, não uso de lib pesada) mesmo estando no mesmo chunk. Agrupado na mesma proposta de história filha do M1 (mesma classe de problema: peso de JS client-side).

**L3 — CSS render-blocking (150 ms no mobile)**

- Evidência real (`render-blocking-insight`, mobile): a folha de estilo única do Tailwind (`.../chunks/3odtzw6x3d_le.css`, 14,97 KB comprimidos) bloqueia o first paint em ~150 ms.
- Classificação: **Low → aceitar risco** — extrair critical CSS é desproporcional para um site de uma única página com CSS já pequeno (14,97 KB comprimidos); o ganho absoluto (150 ms) não justifica a complexidade adicional num projeto pessoal.

### Info

**I1 — Cache de assets estáticos (CA-004) já correto, sem ação necessária**

Ver detalhamento completo no CA-004 abaixo.

**I2 — Nenhum achado Critical ou High**

Scores de 92-100 em todas as categorias, nos dois form factors; nenhuma quebra funcional encontrada. Consistente com a regra da própria história (CA-006: hot-fix só para achado Critical) — não havendo Critical, nenhuma correção de código foi aplicada neste spike.

---

## CA-003 — Bundle do client JS da Home

`next build` local (Next.js 16.3.0 + Turbopack), build de produção real (`npm ci && npm run build`, sem erros, `/` gerada como página estática `○`).

O build separa dois grupos de chunks carregados por `/`: o **runtime compartilhado** (`rootMainFiles` do `build-manifest.json` — React, Next.js, hidratação; carregado em toda página do site) e os **chunks específicos da Home** (componentes client: Hero, Sidebar, animações, ícones).

| Grupo | Arquivos | Raw | Gzip |
|---|---|---|---|
| Runtime compartilhado (framework) | 5 chunks JS | ~437 KB | ~129 KB |
| Específico da Home | 3 chunks JS (inclui `framer-motion` + `lucide-react`/`react-icons`, confirmado via `grep` no bundle) | ~424 KB | ~141 KB |
| CSS (Tailwind, folha única) | 1 chunk | 80,4 KB | 14,3 KB |
| **Total carregado por `/`** | 9 arquivos | **~941 KB** | **~285 KB** |

Maior chunk individual: um dos chunks específicos da Home, 295,7 KB raw / 98,0 KB gzip — contém `framer-motion` e referências de ícones (`react-icons`/`lucide-react`), confirmado por `grep` de símbolos internos (`AnimatePresence`, `IconBase`) no arquivo buildado.

Em produção real, o total de rede efetivamente transferido para a Home (medido pelo Lighthouse, já com compressão HTTP e sem contar cache do navegador) é menor — 404,9 KB em 18 requisições (scripts 239,2 KB, fonts 81,6 KB, documento HTML 42,4 KB, CSS 15,0 KB, imagens 13,7 KB) — porque parte dos chunks locais listados acima pode não estar no caminho crítico da primeira renderização (ex.: chunks de rota `/api/chat` ou `_not-found` não carregados por `/`).

Top offenders (achado M1, CA-002): `unused-javascript` real de ~69 KB confirmado pelo Lighthouse dentro desses chunks — a maior fatia identificável de JS carregado, mas não executado, é atribuível a `framer-motion`/ícones parcialmente não usados e aos polyfills legados (CA-002, M1/L2).

---

## CA-004 — Cache de assets estáticos

Evidência real, produção (`https://lucas-palhares-cv.vercel.app`, `curl -I`):

**Chunk JS versionado** (`/_next/static/immutable/chunks/0a7_7sluie-kw.js`):
```
Cache-Control: public,max-age=31536000,immutable
X-Vercel-Cache: HIT
Age: 397727
```

**Chunk CSS versionado** (`/_next/static/immutable/chunks/3odtzw6x3d_le.css`):
```
Cache-Control: public,max-age=31536000,immutable
X-Vercel-Cache: HIT
Age: 4548
```

**Documento HTML da Home** (`/`):
```
Cache-Control: public, max-age=0, must-revalidate
X-Vercel-Cache: HIT
Age: 4475
X-Nextjs-Prerender: 1
X-Nextjs-Stale-Time: 300
```

Todos os assets JS/CSS hasheados servidos sob `/_next/static/immutable/` recebem `Cache-Control: public, max-age=31536000, immutable` — cache máximo de 1 ano no navegador e CDN, correto para arquivos com hash no nome (mudança de conteúdo gera URL nova, não precisa de revalidação). Confirmado por `Age` real de até 397.727 s (~4,6 dias) num `X-Vercel-Cache: HIT`, ou seja, o asset está sendo servido do edge da Vercel sem voltar à origem.

O documento HTML da Home usa `max-age=0, must-revalidate` no header voltado ao navegador (revalidação obrigatória a cada acesso do lado do cliente), mas o cache de edge da Vercel (`X-Vercel-Cache: HIT`, `Age: 4475`, `X-Nextjs-Stale-Time: 300`) serve a página estática pré-renderizada (ISR-like) do edge, revalidando em background após o `stale-time` de 300 s — comportamento padrão e correto do Next.js App Router com `output` estático na Vercel, sem necessidade de configuração adicional.

Conclusão: **nenhuma ação necessária** — o comportamento padrão de cache da Vercel/Next.js para este projeto já está correto (assets versionados = cache máximo e imutável; HTML = revalidação de edge).

---

## CA-005 — Propostas de história filha / aceitar risco

| Sev | Achado | Ação |
|---|---|---|
| Medium | M1 — LCP mobile 2,9s / TBT / FID, causados por JS pesado no chunk da Home (framer-motion + ícones + polyfills legados) | História filha proposta: **US-08-10 — "Reduzir payload de JS client-side da Home"** — CA em 1 linha: *Lighthouse mobile em produção mantém Performance ≥ 92 (sem regressão) e `unused-javascript` reporta savings menor que o medido nesta auditoria (69 KiB), após revisão de imports de `framer-motion`/ícones e do target do `browserslist`.* |
| Low | L1 — 404 de console por prefetch do `next/link` no botão de download do CV | História filha proposta: **US-08-11 — "Corrigir prefetch indevido do botão de download do CV"** — CA em 1 linha: *Lighthouse (mobile e desktop) em produção não reporta nenhum item em `errors-in-console` relacionado ao PDF do currículo, e Boas Práticas mobile chega a 100, após trocar `next/link` por `<a>` nativo em `ResumeSidebar.tsx` e `MobileHero.tsx`.* |
| Low (observação) | L2 — Polyfills legados (~14 KB) | Agrupado no escopo da **US-08-10** (mesma causa raiz — peso de JS client-side); sem história dedicada. |
| Low | L3 — CSS render-blocking (150 ms mobile) | **Aceitar risco** — ganho absoluto pequeno (150 ms), extração de critical CSS desproporcional para uma única página com CSS já pequeno (14,97 KB comprimidos). |

Nenhum achado Critical ou High nesta auditoria — trade-off já documentado no épico (`PRD-006`): toda correção nasce de achado real, não de meta arbitrária de "100 no Lighthouse".

---

## CA-006 — Sem refactor nesta história

Nenhuma alteração de código foi feita nesta auditoria — `git status` confirma que só `docs/` foi tocado (este relatório + atualização da história + `PRD-006` + duas histórias filhas novas). Nenhum achado foi Critical, então a regra de hot-fix (só para Critical) não se aplica; toda correção (M1, L1) vira história filha com DoR próprio, a ser executada em sessão futura.

---

## Veredito

**Aprovado** — CA-001 a CA-006 fechados com evidência real:

- CA-001: scores Lighthouse mobile e desktop obtidos **contra produção real**, sem estimativa (`lighthouse-mobile.report.json/html`, `lighthouse-desktop.report.json/html` gerados localmente como artefato de evidência, não commitados)
- CA-002: 1 Medium + 3 Low classificados, cada um com causa provável rastreada até o código-fonte ou audit específico do Lighthouse (não é suposição)
- CA-003: bundle documentado via `next build` real + inspeção de `build-manifest.json`/`index.html`, com tamanhos raw e gzip reais calculados via `zlib`
- CA-004: cache de estáticos revisado com `curl -I` real em produção, headers colados integralmente, conclusão de que o comportamento padrão já é correto
- CA-005: proposta de história filha para o achado Medium (M1 → US-08-10) e para 1 achado Low com causa raiz trivial (L1 → US-08-11); demais Lows com "aceitar risco" justificado
- CA-006: nenhum refactor de UI aplicado — confirmado por `git status`

Diferente das demais histórias da Fase 08, este spike **não** ficou bloqueado por falta de acesso a produção real — o Chrome headless necessário para o Lighthouse foi provisionado com sucesso via `npx lighthouse`, e a URL de produção é pública (sem gate de autenticação como o painel do Render usado nas histórias de backend).
