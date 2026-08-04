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

Fase 3 Dev
  ├─ Implementar em frontend/ ou backend/
  ├─ npm test / pytest do escopo tocado
  ├─ Marcar [X] no backlog
  └─ handoff

Fase 4 QA
  ├─ Suite + cenário manual relevante (references/e2e-scenarios.md do qa-engineer)
  ├─ veredito QA
  └─ registra linha "QA" na tabela Vereditos da história

Fase 5 Tech Lead
  ├─ Review diff (correção, segurança de API key/CORS, testes)
  ├─ veredito merge
  └─ registra linha "Tech Lead" na tabela Vereditos da história

Fase 6 PO
  ├─ Critérios de aceite + DoD 100% fechados (todo item [x]/N/A justificado) + % backlog
  ├─ Confere linhas QA e Tech Lead já preenchidas na tabela Vereditos — sem elas, não é Done
  ├─ registra linha "PO" na tabela Vereditos da história
  └─ Done / Quase lá / ...
```

## Modo `implement`

Pula PO de criação se história/tasks `ready-for-agent` já existem. Mantém 2?→3→4→5→6.

## Modo `validate` / `review`

Só QA (+ TL). Útil pós-fix.

## Modo `discover`

PO + Arquiteto; **não** implementa até o usuário aprovar.

## Modo `fix`

Dev→QA→TL. Arquiteto só se decisão de stack/estrutura for afetada.

## Gates

| Gate | Critério |
|---|---|
| Pré-dev (Fase 1→2/3) | DoR 100% fechado (todo item `[x]`/`N/A` justificado) |
| Pós-dev | Teste do escopo tocado passando ou lacuna documentada aceita |
| Pós-QA | Sem reprovação em fluxo crítico (chat/RAG, dados do currículo) e linha "QA" da tabela Vereditos preenchida na história |
| Pós-TL | Sem Critical/High abertos (especialmente chave de API / CORS) e linha "Tech Lead" da tabela Vereditos preenchida na história |
| Pré-Done (Fase 6) | Critérios de aceite + DoD 100% fechados (todo item `[x]`/`N/A` justificado), incluindo as 3 linhas da tabela Vereditos (QA, Tech Lead, PO) preenchidas |
