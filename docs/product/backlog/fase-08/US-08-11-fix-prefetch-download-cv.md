# US-08-11 — Corrigir prefetch indevido do botão de download do CV

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** dono do produto,
**quero** que o botão "Baixar CV" não dispare uma requisição que sempre falha (404) em segundo plano,
**para** eliminar o erro de console real que baixa o score de Boas Práticas do Lighthouse mobile e evitar tráfego desperdiçado.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (troca de componente de navegação, sem endpoint)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance (`PRD-006`); origem do achado: [US-08-04](US-08-04-auditoria-performance.md) / [`QA-006`](../../../qa/QA-006-auditoria-performance.md), achado L1
- [x] ADR registrado se envolve decisão de stack nova — N/A (troca de `next/link` por `<a>` nativo é uso padrão documentado do próprio Next.js para links de download/arquivo estático, não decisão de stack)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — N/A (mesmo botão, mesmo visual — só troca a tag/comportamento de navegação por baixo)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Causa raiz (já diagnosticada em `QA-006`)

`frontend/components/ResumeSidebar.tsx:216-217` e `frontend/components/MobileHero.tsx:161-163` usam `Link` de `next/link` (import `next/link`) com `href={contact.resumePdfUrl}` (arquivo estático em `public/`) e atributo `download`. O prefetch automático do `next/link` tenta buscar o payload RSC (`?_rsc=...`) desse caminho como se fosse uma rota do App Router, recebendo 404 porque é um arquivo estático, não uma rota — gera erro real no console do navegador (capturado pelo audit `errors-in-console` do Lighthouth, score 0 no mobile em `QA-006`). O download em si funciona (confirmado via `curl`), o problema é só o prefetch em segundo plano.

#### Plano de testes

- Unitário: `ResumeSidebar.test.tsx` e `MobileHero.test.tsx` (já existem, cobrem `resumePdfUrl`) — ajustar asserção se necessário para verificar que o elemento renderizado é `<a>` (não `next/link`), mantendo `href`/`download`
- Manual: Lighthouse mobile e desktop em produção pós-deploy confirmando ausência de item em `errors-in-console` relacionado ao PDF
- Mocks: nenhum

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: `ResumeSidebar.tsx` usa `<a href={contact.resumePdfUrl} download>` nativo em vez de `next/link` `Link` para o botão "Baixar CV" — confirmado no código-fonte (`frontend/components/ResumeSidebar.tsx:216-236`) e no HTML estático gerado por `next build` (`.next/server/app/index.html`): `<a href="/Lucas_Palhares_Barbosa_Engenheiro_De_Software.pdf" download="" class="group relative ...">`, sem nenhum atributo de prefetch do Next
- [x] CA-002: `MobileHero.tsx` usa a mesma troca (`<a>` nativo) no botão equivalente — confirmado no código-fonte (`frontend/components/MobileHero.tsx:161-182`) e no mesmo HTML estático: `<a href="/Lucas_Palhares_Barbosa_Engenheiro_De_Software.pdf" download="" class="tap-target group relative ...">`
- [ ] CA-003: Lighthouse mobile em produção real, pós-deploy, não reporta nenhum item de `errors-in-console` relacionado ao arquivo PDF do currículo — **pendente**: exige deploy em produção (Vercel), que só ocorre após merge `develop` → `main`; não executável nesta sessão (agente não deployou sozinho)
- [ ] CA-004: Boas Práticas do Lighthouse mobile em produção chega a 100 (paridade com desktop, que já estava em 100 em `QA-006`) — **pendente**, mesma dependência de CA-003
- [x] CA-005: suíte de testes do frontend (`npm test`) permanece 100% verde após a troca — 17/17 arquivos, 65/65 testes (`npx vitest run --no-file-parallelism`, ver evidência abaixo)

### Fora de escopo

- Qualquer outro uso de `next/link` no site (só os dois componentes que apontam para o PDF)
- Mudança visual do botão

### Dependências

- [PRD-006](../../PRD-006-seguranca-performance.md)
- [US-08-04](US-08-04-auditoria-performance.md) (Done) — origem do achado L1
- [`QA-006`](../../../qa/QA-006-auditoria-performance.md) — evidência do achado, causa raiz já diagnosticada

### Épico / Prioridade

Segurança & Performance — P3

### Tasks

- [x] T01 Trocar `Link` (`next/link`) por `<a>` nativo em `ResumeSidebar.tsx` (mantendo `href`, `download` e classes CSS existentes)
- [x] T02 [P] Mesma troca em `MobileHero.tsx`
- [x] T03 [P] Ajustar/confirmar testes existentes (`ResumeSidebar.test.tsx`, `MobileHero.test.tsx`) continuam passando com a nova tag — nenhum ajuste necessário: os testes já verificavam comportamento (`getByRole("link", ...)` + `toHaveAttribute("href", ...)`), não a implementação interna, e continuam verdes com a tag `<a>`
- [ ] T04 Lighthouse mobile + desktop em produção pós-deploy confirmando CA-003/CA-004 — **pendente**, depende de deploy em produção (fora do alcance desta sessão)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]` — CA-001/CA-002/CA-005 fechados; CA-003/CA-004 pendentes (dependem de Lighthouse pós-deploy em produção)
- [x] Cobertura de testes ≥ 70% no código tocado — testes existentes já cobrem os componentes tocados (`ResumeSidebar.test.tsx`, `MobileHero.test.tsx`), ambos verdes
- [x] Build/lint limpo (`npm run build` — build de produção real, `next build` com Turbopack, sem erros; `npm run lint` — 0 erros, 2 warnings pré-existentes não relacionados aos arquivos tocados)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — ver veredito abaixo
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A (troca pontual de tag, sem mudança de comportamento público além da correção do bug)
- [ ] Deploy/preview verificado — Lighthouse real em produção pós-deploy — **pendente**, depende do autor mergear `develop` → `main` (Vercel faz deploy automático); evidência de apoio coletada localmente (HTML estático gerado por `next build` confirma `<a href=... download>` puro, sem atributo de prefetch do Next), mas isso não substitui o Lighthouse real em produção pedido por CA-003/CA-004
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Evidência de execução (Dev)

- `npm ci` — 483 pacotes instalados, 0 vulnerabilidades
- `npx vitest run --no-file-parallelism` (suíte completa) — **17/17 arquivos, 65/65 testes passando**, incluindo `ResumeSidebar.test.tsx` e `MobileHero.test.tsx`. Observação: `npm test` (padrão, com paralelismo de workers) apresentou timeouts de infraestrutura (`[vitest-pool-runner]: Timeout waiting for worker to respond`) neste ambiente de sandbox — não relacionado à mudança de código; a suíte completa com `--no-file-parallelism` confirma 100% verde
- `npm run lint` — 0 erros, 2 warnings pré-existentes (`MobileBottomNav.test.tsx`, `RoleTypewriter.tsx`) não relacionados a este diff
- `npm run build` — build de produção real (`next build`, Turbopack, Next.js 16.3.0) concluído sem erros; `/` gerada como página estática (`○`)
- Inspeção manual do HTML estático gerado (`.next/server/app/index.html`) confirma que o botão "Baixar CV" renderiza como `<a href="/Lucas_Palhares_Barbosa_Engenheiro_De_Software.pdf" download="" class="...">` puro nos dois componentes (desktop `ResumeSidebar` e mobile `MobileHero`), sem `data-next-prefetch` ou qualquer atributo de prefetch do Next — evidência de apoio local, **não substitui** o Lighthouse real em produção exigido por CA-003/CA-004

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | **Aprovado com pendência** — CA-001/CA-002/CA-005 fechados com evidência real (código-fonte, HTML estático pós-build, suíte de testes 100% verde). CA-003/CA-004 não puderam ser executados: exigem Lighthouse contra produção real pós-deploy, e este agente não tem acesso a deploy (Vercel deploya automaticamente só após merge `develop`→`main`). Nenhuma regressão encontrada; escopo respeitado (só os dois componentes do achado L1 tocados, nenhuma mudança visual, import `Link` mantido nos dois arquivos por seguir em uso em outros links). | 2026-08-15 | Este arquivo, seção "Evidência de execução" |
| Tech Lead | `@tech-lead-review` | **Aprovado** — diff mínimo e cirúrgico (só as duas tags `Link`→`a` trocadas, atributos/classes preservados integralmente); causa raiz do achado L1 (`QA-006`) corretamente endereçada — `<a download>` nativo não dispara prefetch RSC, elimina o 404 de console; sem uso indevido de `Link` restante para o PDF; imports não removidos indevidamente (`Link` segue necessário para email/WhatsApp/LinkedIn/GitHub/mapa em ambos os arquivos); testes validam comportamento (`href`/`role=link`), não implementação — sem acoplamento a `next/link`. Nenhum Critical/High. Único ponto de atenção (não bloqueante): CA-003/CA-004 seguem pendentes de validação pós-deploy, fora do alcance desta sessão. | 2026-08-15 | Diff `ResumeSidebar.tsx`/`MobileHero.tsx` |
| PO | `@product-owner` | **Quase lá** — a correção de código está completa e verificada (CA-001, CA-002, CA-005, DoD de build/lint/teste/review todos fechados com evidência real). CA-003 e CA-004 ficam `[ ]` porque exigem Lighthouse real em produção **após deploy**, e este agente não pode deployar sozinho (depende do autor mergear `develop`→`main`; Vercel deploya automaticamente a partir daí). Não fabricado nenhum resultado de Lighthouse. Próximo passo: após merge deste PR em `develop` e posterior merge/deploy em `main`, rodar Lighthouse mobile+desktop em produção e fechar CA-003/CA-004 nesta mesma história antes de marcar Done. | 2026-08-15 | CA-003/CA-004 acima |

**Status:** Quase lá — CA-001/CA-002/CA-005 e DoD de código fechados com evidência real; CA-003/CA-004 pendentes de Lighthouse real em produção pós-deploy (fora do alcance desta sessão, depende do autor mergear até `main`).
