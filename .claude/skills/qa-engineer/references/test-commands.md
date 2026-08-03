# Comandos de Teste — Currículo Online

## Frontend

```bash
cd frontend
npm test                      # suite completa
npm test -- ExperienceCard    # arquivo específico
npm run lint
```

## Backend

```bash
cd backend
pytest                        # suite completa
pytest tests/test_chat.py     # arquivo específico
pytest -k "fallback"          # por nome
ruff check .
```

## Rodar tudo (pré-deploy)

```bash
cd frontend && npm run lint && npm test && npm run build
cd ../backend && ruff check . && pytest
```

## Lighthouse (acessibilidade/performance)

```bash
npx lighthouse http://localhost:3000 --view
```

## O que não fazer

- Não bater na API real do LLM em teste automatizado — mockar
- Não pular teste do componente/endpoint principal alterado só porque "é simples"
- Não rodar Lighthouse contra ambiente de produção sem necessidade (usar preview local ou de deploy)
