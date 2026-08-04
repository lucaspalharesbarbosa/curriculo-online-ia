# Template de Handoff — Orquestrador (Currículo Online)

```markdown
## Handoff — Fase [N] → Fase [N+1]

**Escopo:** US-XX / componente / endpoint / bug

### Gate desta transição
- DoR fechado? sim/não — obrigatório antes da Fase 3 (Dev)
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

### Bloqueios para a próxima fase
1. ...

### Sugestão à próxima fase
- ...
```
