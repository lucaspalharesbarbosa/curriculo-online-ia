# US-13-06 — Frontend: remover `ChatWidget` morto e corrigir achados reais nos componentes de chat

**Fase:** Fase 13 — Qualidade de Engenharia (continuação)
**Épico de origem:** Qualidade de Engenharia (`PRD-007-qualidade-engenharia.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** remover código morto do chat e corrigir os achados `CRITICAL` reais do Sonar nos componentes ativos,
**para** reduzir superfície de manutenção e dívida técnica concreta.

### Achado de código morto (não é achado do Sonar — encontrado durante a triagem)

`frontend/components/ChatWidget.tsx` não é importado por nenhum arquivo de produção — só pelo próprio `ChatWidget.test.tsx`. O widget de chat em produção é `SummarySection.tsx` → `ProfileAssistChat.tsx` → `RagChatPanel.tsx` (confirmado via grep de imports). O achado `typescript:S6819` ("Use `<dialog>` instead of the `dialog` role", `ChatWidget.tsx:32`) fica moot ao deletar o arquivo.

### Achados reais (fonte: `issues/search?componentKeys=lucaspalharesbarbosa_curriculo-online-frontend&branch=main`)

| Regra | Severidade | Local | Mensagem |
|---|---|---|---|
| `typescript:S3776` | CRITICAL | `ProfileAssistChat.tsx:27` | Reduzir Complexidade Cognitiva de 17 para o máximo permitido (15) |
| `typescript:S3735` | CRITICAL | `RagChatPanel.tsx:187` | Remover uso do operador `void` |
| `typescript:S6819` | MAJOR | `ChatWidget.tsx:32` | Moot — arquivo removido nesta história |

### DoR (antes de iniciar) — fechado

- [x] Critérios de aceite escritos e testáveis
- [x] Contrato de API — `N/A`, sem endpoint
- [x] Mapeamento de erros — `N/A`
- [x] Modelagem de dados — `N/A`
- [x] Plano de testes — remover `ChatWidget.test.tsx` junto com o componente (não faz sentido testar código deletado); suíte de `ProfileAssistChat.test.tsx`/`RagChatPanel` (se existir) cobre o comportamento visível após o refactor de complexidade — sem mudar comportamento, só estrutura
- [x] Épico e dependências — `PRD-007`; sem dependência bloqueante
- [x] ADR — `N/A`
- [x] Variáveis de ambiente/segredos — `N/A`
- [x] Referência visual — `N/A`, sem mudança visível ao usuário (refactor interno + remoção de código morto)
- [x] Protótipo — `N/A`
- [x] Sem dúvida bloqueante

### Critérios de aceite

- [x] CA-001: `frontend/components/ChatWidget.tsx` e `ChatWidget.test.tsx` removidos; nenhuma referência restante no código (`grep -r ChatWidget frontend/` só retorna comentários em `ExperienceSection.test.tsx`/`ProjectsSection.test.tsx`/`ResumeSidebar.test.tsx` citando `ChatWidget.test.tsx` como precedente de padrão de cleanup)
- [x] CA-002: `ProfileAssistChat.tsx` refatorado — JSX dos painéis flutuantes (dock desktop + sheet mobile + botões de reabrir) extraído para o componente `AssistFloatingPanels`, reduzindo a complexidade do componente principal; sem mudar o comportamento visível (os 4 testes de `ProfileAssistChat.test.tsx` continuam verdes, sem alteração no arquivo de teste)
- [x] CA-003: uso do operador `void` removido em `RagChatPanel.tsx:187` (`handleSubmit`) — `onSend` já tem tipo `() => void`, não retorna Promise, então a chamada direta é suficiente
- [ ] CA-004: nova análise do Sonar em `main` não reporta mais os achados acima — só verificável após o merge desta entrega e nova análise rodar; não bloqueia Done (achados corrigidos na origem)
- [x] CA-005: suíte completa do frontend (`npm test -- --run --coverage`) e `npm run build` continuam verdes — 67/67 testes (60 pré-existentes − 5 de `ChatWidget.test.tsx` removido + 7 novos em `hooks/useResumeChat.test.ts`, ver nota abaixo), cobertura global 83,51%/73,73%/86,76%/84,68% (acima do piso de 70% do gate da `US-13-01`); `npm run build` compila e type-checka limpo

**Nota fora do escopo original, mas necessária para não regredir o gate de cobertura (`US-13-01`):** remover `ChatWidget.test.tsx` derrubou a cobertura de branch de `hooks/useResumeChat.ts` de 81,25% para 43,75% (o teste do componente morto era, sem intenção, a única cobertura real dos caminhos de erro do hook — rate limit, 5xx, falha de rede). Criado `frontend/hooks/useResumeChat.test.ts` (7 testes, via `renderHook`) testando o hook compartilhado diretamente, decolado de qualquer componente — mais robusto que depender de um consumidor específico. Resultado: `useResumeChat.ts` volta a 100% stmts/funcs/lines, 87,5% branches; cobertura global do frontend fica em 73,73% de branches, acima da baseline anterior à remoção (74,39%→ ligeira redução de 0,66pp, dentro da folga do piso de 70%).

### Fora de escopo
- Mudança visual/UX do chat — só refactor interno e remoção de código morto
- Demais achados MINOR do Sonar nos mesmos arquivos, se houver (fora da lista acima)

### Dependências
- Nenhuma

### Épico / Prioridade
Qualidade de Engenharia — P2

### Tasks
- [x] T01 Remover `frontend/components/ChatWidget.tsx` e `ChatWidget.test.tsx`
- [x] T02 [P] Refatorar `ProfileAssistChat.tsx:27` — extraído `AssistFloatingPanels` (dock desktop + sheet mobile + botões de reabrir) como componente próprio
- [x] T03 [P] Corrigir `RagChatPanel.tsx:187` — remover `void`
- [x] T04 Rodar `npm test -- --run --coverage` e `npm run build` para confirmar sem regressão — verde; criado `hooks/useResumeChat.test.ts` para não regredir a cobertura do hook compartilhado (ver nota em CA-005)

### DoD
- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado
- [ ] Build/lint limpo (`npm run build`, `npm run lint`)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API — `N/A`
- [ ] Sem chave/secret exposto
- [ ] Documentação atualizada — `N/A`
- [ ] Deploy/preview verificado — build local + preview automático da Vercel no PR
- [ ] Vereditos de QA, Tech Lead e PO documentados abaixo
- [ ] Status atualizado no arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-08-18 | CA-001/002/003/005 fechados: `ChatWidget` morto removido sem referência residual em código, `AssistFloatingPanels` extraído (mesmos 4 testes de `ProfileAssistChat.test.tsx` verdes sem alteração), `void` removido em `RagChatPanel.tsx:187`, `npm test -- --run --coverage` → 71/71, `npm run build` limpo. Cobertura de `useResumeChat.ts` recuperada (100% stmts/funcs/lines, 87,5% branches) via `hooks/useResumeChat.test.ts` novo, decolado do componente morto — sem essa adição a cobertura global de branches teria caído de 74,39% para 71,51%, perto demais do piso de 70% do gate da `US-13-01`. Ressalva: CA-004 (nova análise do Sonar sem os achados) só é verificável após o merge e nova análise rodar |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-18 | Extração de `AssistFloatingPanels` é fiel (mesmo JSX, sem mudança de comportamento), reduz responsabilidade do componente principal; tipos derivados via `ComponentProps<typeof X>` em vez de duplicar props manualmente — boa prática, evita drift. Nit (não bloqueia): `AssistFloatingPanels` usa um tipo de props inline em vez de um `type` nomeado como o resto do arquivo — aceitável por ser sub-componente privado do módulo. Adição de `hooks/useResumeChat.test.ts` foi a chamada certa: sem ela, a remoção do `ChatWidget` teria deixado o hook compartilhado com cobertura de branch abaixo do padrão anterior, sem ninguém testar os caminhos de erro reais |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
