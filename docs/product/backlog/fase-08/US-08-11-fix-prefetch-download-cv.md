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

- [ ] CA-001: `ResumeSidebar.tsx` usa `<a href={contact.resumePdfUrl} download>` nativo em vez de `next/link` `Link` para o botão "Baixar CV"
- [ ] CA-002: `MobileHero.tsx` usa a mesma troca (`<a>` nativo) no botão equivalente
- [ ] CA-003: Lighthouse mobile em produção real, pós-deploy, não reporta nenhum item de `errors-in-console` relacionado ao arquivo PDF do currículo
- [ ] CA-004: Boas Práticas do Lighthouse mobile em produção chega a 100 (paridade com desktop, que já estava em 100 em `QA-006`)
- [ ] CA-005: suíte de testes do frontend (`npm test`) permanece 100% verde após a troca

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

- [ ] T01 Trocar `Link` (`next/link`) por `<a>` nativo em `ResumeSidebar.tsx` (mantendo `href`, `download` e classes CSS existentes)
- [ ] T02 [P] Mesma troca em `MobileHero.tsx`
- [ ] T03 [P] Ajustar/confirmar testes existentes (`ResumeSidebar.test.tsx`, `MobileHero.test.tsx`) continuam passando com a nova tag
- [ ] T04 Lighthouse mobile + desktop em produção pós-deploy confirmando CA-003/CA-004

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — testes existentes já cobrem os componentes tocados
- [ ] Build/lint limpo (`npm run build`, `npm run lint`)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API — N/A
- [ ] Sem chave de API/secret exposto
- [ ] Documentação atualizada — N/A (troca pontual de tag, sem mudança de comportamento público além da correção do bug)
- [ ] Deploy/preview verificado — Lighthouse real em produção pós-deploy
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
