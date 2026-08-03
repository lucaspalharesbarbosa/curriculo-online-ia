# Fluxos de Pipeline — Orquestrador (Currículo Online)

## Modo `full`

```
Fase 1 PO
  ├─ docs/agents/CONTEXTO-PROJETO.md
  ├─ História/tasks em docs/product/
  └─ DoR → handoff

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
  └─ veredito QA

Fase 5 Tech Lead
  ├─ Review diff (correção, segurança de API key/CORS, testes)
  └─ veredito merge

Fase 6 PO
  ├─ DoD + % backlog
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
| Pós-dev | Teste do escopo tocado passando ou lacuna documentada aceita |
| Pós-QA | Sem reprovação em fluxo crítico (chat/RAG, dados do currículo) |
| Pós-TL | Sem Critical/High abertos (especialmente chave de API / CORS) |
