# Fluxos de Pipeline — Orquestrador (Currículo Online)

## Modo `full`

```
Fase 1 PO
  ├─ docs/agents/CONTEXTO-PROJETO.md
  ├─ História/tasks em docs/product/
  └─ DoR 100% fechado (todo item [x]/N/A justificado) → handoff

Fase 2 Arquiteto (se preciso)
  ├─ ADR / C4 / trade-offs
  └─ handoff

Fase 2b UX Designer (somente se o autor pediu protótipo)
  ├─ /prototipo/<slug> + variantes
  ├─ Gate humano (letra ou descarte)
  └─ handoff (não avança Dev de prod sem escolha)

Fase 3 Dev
  ├─ Implementar em frontend/ ou backend/
  ├─ Se houve protótipo: promover variante (se aprovada) + limpar protótipo no mesmo PR
  ├─ npm test / pytest do escopo tocado
  ├─ Marcar [X] no backlog
  └─ handoff

Fase 4 QA
  ├─ Suite + cenário manual relevante (references/e2e-scenarios.md do qa-engineer)
  ├─ veredito QA
  │   ├─ Reprovado com sinal verificável (teste, cobertura) → reabre Fase 3 automaticamente (até 3 tentativas)
  │   └─ Reprovado sem sinal verificável / mesma falha repetida / 3ª tentativa → escala ao autor
  └─ registra linha "QA" na tabela Vereditos da história

Fase 5 Tech Lead
  ├─ Review diff (correção, segurança de API key/CORS, testes)
  ├─ veredito merge
  │   ├─ Solicitar mudanças (High/Medium) → reabre Fase 3 automaticamente (até 3 tentativas)
  │   └─ Bloquear (Critical: API key, CORS) → nunca auto-loop, escala direto ao autor
  └─ registra linha "Tech Lead" na tabela Vereditos da história

Fase 6 PO
  ├─ Critérios de aceite + DoD 100% fechados (todo item [x]/N/A justificado) + % backlog
  ├─ Confere linhas QA e Tech Lead já preenchidas na tabela Vereditos — sem elas, não é Done
  ├─ registra linha "PO" na tabela Vereditos da história
  └─ Done / Quase lá / ...

Fase 7 Merge em `main` (gate humano fixo — ADR-015)
  ├─ PR develop→main aberto, CI verde, Fase 6 Done
  ├─ Apresenta relatório final do pipeline ao autor
  └─ Aguarda confirmação explícita — nunca executa/solicita merge sem ela, mesmo com todas as fases anteriores em loop autônomo aprovado
```

## Modo `implement`

Pula PO de criação se história/tasks `ready-for-agent` já existem. Mantém 2?→2b?→3→4→5→6.

## Modo `prototype`

Só Fase 2b (`@ux-designer`). Para no gate humano. Não implementa produção nem limpa até o autor decidir; o PR seguinte (ou a continuação pedida) faz promover/descartar + limpar juntos.

## Modo `validate` / `review`

Só QA (+ TL). Útil pós-fix.

## Modo `discover`

PO + Arquiteto; **não** implementa até o usuário aprovar.

## Modo `fix`

Dev→QA→TL. Arquiteto só se decisão de stack/estrutura for afetada. UX Designer só se o autor pedir protótipo no meio do fix (raro).

## Gates

| Gate | Critério | Bloqueio → |
|---|---|---|
| Pré-dev (Fase 1→2/3) | DoR 100% fechado (todo item `[x]`/`N/A` justificado) | Reabre `@product-owner` (sinal verificável: item de DoR faltando) |
| Pré-dev após protótipo (2b→3) | Escolha do autor registrada; sem escolha não avança | Escala ao autor — decisão subjetiva, nunca loop automático |
| Pós-dev | Teste do escopo tocado passando ou lacuna documentada aceita; se houve protótipo decidido, código `/prototipo` removido no mesmo PR | Loop interno em `@senior-developer` (até 3 tentativas) |
| Pós-QA | Sem reprovação em fluxo crítico (chat/RAG, dados do currículo) e linha "QA" da tabela Vereditos preenchida na história | Reabre Fase 3 automaticamente (até 3 tentativas); escala no estouro ou achado sem sinal verificável |
| Pós-TL | Sem Critical/High abertos (especialmente chave de API / CORS) e linha "Tech Lead" da tabela Vereditos preenchida na história | High → reabre Fase 3 automaticamente (até 3 tentativas); Critical → nunca auto-loop, escala direto |
| Pré-Done (Fase 6) | Critérios de aceite + DoD 100% fechados (todo item `[x]`/`N/A` justificado), incluindo as 3 linhas da tabela Vereditos (QA, Tech Lead, PO) preenchidas | Reabre a fase com item aberto |
| Pré-merge `main` (Fase 7) | Confirmação humana explícita do autor | Sempre humano — nunca automatizado, sem exceção (`ADR-015`) |

Loop Engineering completo (níveis, regras de escalonamento): `orquestrador/SKILL.md` (seção "Loop Engineering") e `docs/architecture/ADR-015-loop-engineering-pipeline.md`.
