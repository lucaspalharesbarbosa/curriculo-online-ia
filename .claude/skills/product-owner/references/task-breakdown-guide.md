# Guia de Decomposição em Tasks — Currículo Online

## Princípios

1. Teste na mesma história que o código, quando fizer sentido para o risco do componente/endpoint
2. Task verificável: path real ou comando de teste (`npm test`, `pytest`)
3. Uma task = um entregável concreto

## Estrutura no backlog

```markdown
# Tarefas: [História / Épico]

**Entrada**: docs/product/<epico>.md
**Pré-requisitos**: PRD, ADR se envolver decisão de stack

## Frontend
- [ ] T001 [US1] Criar `frontend/components/ExperienceCard.tsx`
- [ ] T002 [P] [US1] Teste `ExperienceCard.test.tsx`

## Backend
- [ ] T010 [US2] Criar endpoint `/chat` em `backend/app/chat.py`
- [ ] T011 [P] [US2] Teste `test_chat.py`

## Conteúdo
- [ ] T020 [US1] Popular `frontend/content/resume.json` com dados reais
```

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
