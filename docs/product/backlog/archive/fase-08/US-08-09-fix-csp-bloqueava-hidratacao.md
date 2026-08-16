# US-08-09 — Corrigir CSP que bloqueava hidratação do Next.js em produção

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** dono do produto,
**quero** que a CSP configurada na US-08-07 não bloqueie os scripts inline que o próprio Next.js injeta para hidratar a página,
**para** que o site volte a carregar em produção sem perder a defesa em profundidade que a CSP existe para dar.

### Origem — incidente pós-deploy

Durante o smoke manual pendente da US-08-07 (CA-003/T04 — navegação real em produção, marcado como "pendente de ação humana" porque o agente não tinha acesso a produção real), o autor deployou a branch com os headers de segurança para validar e encontrou o site em branco. Console do navegador:

```
Executing inline script violates the following Content Security Policy directive
'script-src 'self''. Either the 'unsafe-inline' keyword, a hash (...), or a nonce
(...) is required to enable inline execution. The action has been blocked.
Uncaught (in promise) Error: Minified React error #412
```

**Causa raiz:** `script-src 'self'` (sem `'unsafe-inline'`, nonce ou hash) bloqueia os scripts inline que o Next.js App Router injeta na própria página para o payload de streaming/hidratação RSC (`self.__next_f.push(...)`). Sem eles a hidratação nunca completa; o erro minificado #412 do React é **"Connection closed"** — a stream de dados foi cortada no meio porque o script que a carregava foi bloqueado pelo browser. Confirmado lendo o código-fonte (`react.dev/errors/412` via `codes.json` do repo `facebook/react`) e a doc local do Next.js instalado (`frontend/node_modules/next/dist/docs/.../content-security-policy.md`) — necessário porque o `AGENTS.md` do frontend avisa que esta versão do Next.js (16.3.0) tem breaking changes vs. conhecimento de treinamento (confirmado: `middleware.ts` foi renomeado para `proxy.ts` nesta versão).

Esta história não teve DoR clássico prévio (é correção de incidente, não feature planejada) — os itens abaixo documentam o que seria o DoR retroativamente, para manter o rastro exigido pelo processo do projeto.

### DoR (retroativo) — incidente já diagnosticado antes de iniciar a correção

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (não altera nenhum endpoint; só o valor de um header de resposta)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance (`PRD-006`); origem: [US-08-07](US-08-07-headers-seguranca-http.md) (CA-003 pendente que teria pego este bug antes do deploy manual)
- [x] ADR registrado se envolve decisão de stack nova — N/A. Decisão de manter `next.config.ts` `headers()` (sem lib nova) e relaxar `script-src` para `'unsafe-inline'`, em vez da alternativa mais estrita (nonce por requisição via `proxy.ts` + `'strict-dynamic'`), porque esta última exige renderização dinâmica em **todas** as páginas — perde o SSG do site, trade-off arquitetural desproporcional para um portfólio estático e que mereceria ADR próprio se adotado; ver comparação completa registrada no código (`frontend/next.config.ts`)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — N/A (sem UI nova)
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Plano de testes

- Build de produção real: `npm run build` (SSG continua funcionando, `/` continua estático) + `npx next start` + `curl -I` confirmando `script-src` com `'unsafe-inline'` na resposta real do servidor (mesma técnica de validação já usada na US-08-07)
- Regressão: `npm test` (suíte completa) e `npm run lint` sem quebrar
- Manual: navegação real em produção pós-deploy confirmando ausência do erro de CSP e do React #412 no console — é exatamente o smoke que faltou na US-08-07 e que expôs este bug

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: `script-src` da CSP em `frontend/next.config.ts` inclui `'unsafe-inline'`, preservando `'self'` e o `'unsafe-eval'` condicional de dev — confirmado no código e no `curl -I` do build de produção local
- [x] CA-002: build de produção (`npm run build`) continua gerando `/` como página estática (SSG), sem forçar renderização dinâmica — confirmado (`Route (app)` lista `○ /` como `Static`)
- [x] CA-003: suíte de testes do frontend (`npm test`) e lint (`npm run lint`) permanecem verdes após a mudança
- [x] CA-004: navegação real no site publicado, pós-deploy, sem erro de CSP nem React #412 no console — confirmado em 2026-08-16 via Lighthouse real (Chrome headless local) mobile+desktop contra `https://lucas-palhares-cv.vercel.app`: audit `errors-in-console` score **1**, `details.items: []` (zero erros, nenhum CSP/React #412); `curl -sI` confirma `Content-Security-Policy` real com `script-src 'self' 'unsafe-inline'` e a página `/` retorna 200 com HTML completo (não em branco) — site hidratando normalmente em produção

### Fora de escopo

- CSP estrita com nonce por requisição (`proxy.ts` + `'strict-dynamic'`) — implica perder SSG em todo o site; fica registrada como alternativa conhecida, não implementada agora (ver DoR acima)
- Qualquer outro achado de segurança fora da CSP do frontend
- Mudança na CSP do backend (`backend/app/main.py`) — API JSON pura, sem HTML/scripts inline, não afetada por este bug

### Dependências

- [US-08-07](US-08-07-headers-seguranca-http.md) — história que introduziu a regressão (CA-003 dela permanece pendente pela mesma razão: validação real de produção fora do alcance do agente)
- [PRD-006](../../PRD-006-seguranca-performance.md)

### Épico / Prioridade

Segurança & Performance — P0 (site em produção estava em branco)

### Tasks

- [X] T01 Diagnosticar a causa raiz a partir do log de console reportado pelo autor (CSP + React #412)
- [X] T02 Corrigir `script-src` em `frontend/next.config.ts`, adicionando `'unsafe-inline'` com comentário explicando o trade-off e a alternativa mais estrita descartada
- [X] T03 [P] Validar build de produção real (`npm run build` + `npx next start` + `curl -I`) confirmando o header corrigido e que `/` continua estática
- [X] T04 [P] Rodar `npm test` e `npm run lint` para regressão
- [x] T05 Smoke manual pós-deploy em produção real — feito em 2026-08-16, ver CA-004

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]` — CA-001 a CA-004 fechados com evidência real
- [x] Cobertura de testes ≥ 70% no código tocado — N/A justificado: `next.config.ts` é configuração declarativa do Next.js (mesma justificativa aceita na US-08-07), sem lógica de aplicação isolada a cobrir por unit test; validado por build de produção real + `curl -I`
- [x] Build/lint limpo (`npm run build`, `npm run lint`) — ver Vereditos QA
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado — N/A
- [x] Sem chave de API/secret exposto (client bundle ou repo)
- [x] Documentação atualizada — comentário no `next.config.ts` explicando o incidente e o trade-off; esta história registra o incidente e a correção
- [x] Deploy/preview verificado — Lighthouse real + `curl -I` em produção confirmam ausência de erro de CSP/React #412 (ver CA-004)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-08-16 | `npm run build` → sucesso, `/` continua `○ (Static)` (SSG preservado); `npm test -- --run` → 65 passed (17 arquivos), nenhum quebrado; `npm run lint` → sem erros. Validação real do header: `npx next start` (build de produção real) + `curl -I http://localhost:3902/` confirma `Content-Security-Policy: ...script-src 'self' 'unsafe-inline'...` na resposta real do servidor. Ressalva: CA-004 (smoke real em produção) segue pendente de ação humana — mesma lacuna que já havia deixado passar o bug original da US-08-07; recomendação registrada no relatório é que o autor faça a navegação manual antes/imediatamente depois do deploy desta correção, já que foi exatamente a ausência desse passo que causou o incidente |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-16 | Diff mínimo e cirúrgico: único arquivo de código alterado é `frontend/next.config.ts` (uma linha funcional — adição de `'unsafe-inline'` ao `script-src` — mais comentário explicando causa raiz e trade-off). Escolha correta entre as duas alternativas documentadas pelo próprio Next.js (`node_modules/next/dist/docs/.../content-security-policy.md`, seções "Without Nonces" vs. "Nonces"): optar por `'unsafe-inline'` em vez de nonce+`proxy.ts`+`'strict-dynamic'` evita forçar renderização dinâmica em 100% das páginas de um portfólio estático — trade-off proporcional ao projeto, com risco residual analisado corretamente (sem `dangerouslySetInnerHTML` em nenhum componente, então não há vetor de HTML/script não confiável injetado no DOM que o `'unsafe-inline'` passe a habilitar). Mesmo padrão de risco aceito já usado e aprovado para `style-src` na US-08-07, mantendo consistência de decisão dentro do próprio arquivo. Nenhuma lib nova, nenhum secret tocado, build e testes verdes. Sem achado Critical/High |
| PO | `@product-owner` | **Aceite (Done)** | 2026-08-16 | CA-001 a CA-004 fechados com evidência real. Rodei Lighthouse mobile+desktop real (Chrome headless) contra a produção: `errors-in-console` limpo (score 1, 0 itens) — sem erro de CSP nem React #412; `curl -I` confirma o header corrigido servido de verdade e a página carregando completa (200, não em branco). O smoke que faltou na US-08-07 e causou este incidente foi feito desta vez antes de fechar. DoD 100% fechado |

**Status:** Done — CA-004 confirmado em produção real em 2026-08-16 (Lighthouse + `curl -I`, sem erro de CSP/React #412).
