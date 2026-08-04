# Guia de Decomposição em Tasks — Currículo Online

## Princípios

1. Teste na mesma história que o código, quando fizer sentido para o risco do componente/endpoint
2. Task verificável: path real ou comando de teste (`npm test`, `pytest`)
3. Uma task = um entregável concreto

## Estrutura no backlog

Arquivo: `docs/product/backlog/fase-FF/US-FF-NN-<slug>.md` — uma história por arquivo, tasks **dentro** da própria história (não num arquivo de tasks separado por épico). `FF` é a fase de implementação, `NN` a sequência dentro dela (ver `docs/agents/CONTEXTO-PROJETO.md` e `references/story-template.md`).

```markdown
# US-03-11 — Componente de Experiência Profissional

...(demais seções da história — ver references/story-template.md)...

### Tasks
- [ ] T01 Criar `frontend/components/ExperienceCard.tsx`
- [ ] T02 [P] Teste `ExperienceCard.test.tsx`
```

Tasks usam ID local `T01`, `T02`... (não precisam ser globalmente únicas no backlog — já vivem dentro do arquivo da própria história). `[P]` marca task paralelizável com a anterior.

## Tamanho ideal

| Tipo | Exemplo |
|---|---|
| Componente de UI | 1 task (+ 1 de teste) |
| Endpoint FastAPI | 1 task (+ 1 de teste) |
| Seção do `resume.json` | 1 task |
| Deploy/config de CI | 1 task de verificação |

## Evitar

- "Fazer o frontend inteiro" numa única task
- Tasks sem path real (`frontend/...` ou `backend/...`)
- Misturar RAG (épico futuro) em história do MVP estático sem marcar a dependência
