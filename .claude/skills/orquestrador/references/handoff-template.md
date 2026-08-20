# Template de Handoff — Orquestrador (Currículo Online)

```markdown
## Handoff — Fase [N] → Fase [N+1]

**Escopo:** US-XX / componente / endpoint / bug

### Gate desta transição
- DoR fechado? sim/não — obrigatório antes da Fase 3 (Dev)
- Protótipo pedido pelo autor? sim/não/N/A — se sim: escolha (letra/descarte) registrada antes da Fase 3; limpeza de `/prototipo` no mesmo PR da promoção/descarte (`docs/agents/PROCESSO-PROTOTIPO.md`)
- Critérios de aceite + DoD fechados? sim/não — obrigatório antes da Fase 6 (Done)
- Veredito desta fase registrado na tabela Vereditos da história? sim/não — obrigatório saindo das Fases 4 (QA), 5 (Tech Lead) e 6 (PO)
- N/A se a transição não exige o gate acima

### Artefatos
- Criados/alterados: `frontend/...` ou `backend/...`
- Backlog: `docs/product/backlog/fase-FF/US-FF-NN-<slug>.md`
- ADR: `docs/architecture/ADR-NNN-<titulo>.md` (se houver)

### Decisões
- ...

### Evidências
- `npm test` / `pytest`: ...
- Deploy/preview (se UI): ...

### Riscos
- Chave de API / CORS tocados? ...
- Schema do `resume.json` mudou? ...

### Tentativas do loop
- Rodadas nesta fase: N (máx. 3 — `ADR-015`)
- O que falhou / o que corrigiu em cada tentativa: ...
- Escalou ao autor? sim/não — motivo (estouro de tentativas / mesma falha repetida / achado sem sinal verificável / código sensível)

### Bloqueios para a próxima fase
1. ...

### Sugestão à próxima fase
- ...
```
