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

- [ ] CA-001: `frontend/components/ChatWidget.tsx` e `ChatWidget.test.tsx` removidos; nenhuma referência restante no código (`grep -r ChatWidget frontend/` só retorna, no máximo, comentários/changelog)
- [ ] CA-002: `ProfileAssistChat.tsx` refatorado para Complexidade Cognitiva ≤ 15 (extrair função auxiliar), sem mudar o comportamento visível (mesmos testes de `ProfileAssistChat.test.tsx` continuam verdes, sem alteração)
- [ ] CA-003: uso do operador `void` removido/substituído em `RagChatPanel.tsx:187` por forma equivalente sem o code smell
- [ ] CA-004: nova análise do Sonar em `main` não reporta mais os achados acima
- [ ] CA-005: suíte completa do frontend (`npm test -- --run`) e `npm run build` continuam verdes

### Fora de escopo
- Mudança visual/UX do chat — só refactor interno e remoção de código morto
- Demais achados MINOR do Sonar nos mesmos arquivos, se houver (fora da lista acima)

### Dependências
- Nenhuma

### Épico / Prioridade
Qualidade de Engenharia — P2

### Tasks
- [ ] T01 Remover `frontend/components/ChatWidget.tsx` e `ChatWidget.test.tsx`
- [ ] T02 [P] Refatorar `ProfileAssistChat.tsx:27` — extrair sub-função para reduzir complexidade cognitiva
- [ ] T03 [P] Corrigir `RagChatPanel.tsx:187` — remover `void`
- [ ] T04 Rodar `npm test -- --run --coverage` e `npm run build` para confirmar sem regressão

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
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
