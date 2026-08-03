# Template — História de Usuário e PRD (Currículo Online)

## PRD (`docs/product/<epico>.md`)

```markdown
# PRD — [Nome do épico]

**Status:** draft | review | approved | ready-for-agent
**Épico:** Conteúdo | Frontend | RAG | Deploy
**Prioridade:** P0 | P1 | P2 | P3

## Problema
[Dor / necessidade]

## Objetivo
[Mensurável — ex.: "site publica as 4 seções principais do currículo com dados reais"]

## Escopo
### Incluído
- ...

### Excluído
- ...

## Persona
Visitante/recrutador navegando o site.

## Histórias
| ID | Título | Prioridade |
|----|--------|------------|
| US-01 | ... | P0 |

## Riscos
- ...

## DoR
- [ ] Critérios de aceite claros
- [ ] ADR se envolve decisão de stack nova
- [ ] Tasks decompostas
```

## História de usuário

```markdown
## US-N — [Título]

**Como** visitante/recrutador,
**quero** [ação],
**para** [valor].

### Critérios de aceite
- [ ] CA-001: ...
- [ ] CA-002: ...

### Fora de escopo
- ...

### Dependências
- US-XX, ADR-XXX (se houver)

### Épico / Prioridade
[Conteúdo | Frontend | RAG | Deploy] — P0 | P1 | P2 | P3
```
