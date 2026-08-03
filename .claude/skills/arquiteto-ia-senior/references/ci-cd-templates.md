# CI/CD Templates — Referência (Currículo Online)

> **Escopo:** **GitHub Actions**, um workflow por serviço do monorepo (`frontend/`, `backend/`).

---

## `frontend-ci.yml` — lint + build (Next.js)

```yaml
name: frontend-ci

on:
  pull_request:
    paths:
      - "frontend/**"
  push:
    branches: [main, develop]
    paths:
      - "frontend/**"

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --run
      - run: npm run build
```

---

## `backend-ci.yml` — lint + testes (FastAPI)

```yaml
name: backend-ci

on:
  pull_request:
    paths:
      - "backend/**"
  push:
    branches: [main, develop]
    paths:
      - "backend/**"

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: ruff check .
      - run: pytest
```

---

## Gates alinhados ao projeto

| Gate | Critério |
|---|---|
| Frontend | `npm run lint` + `npm test` + `npm run build` sem falha |
| Backend | `ruff check .` + `pytest` sem falha |
| Branch protection | `main` e `develop` exigem PR + CI verde antes de merge; push direto e force-push bloqueados |

`paths:` em cada workflow evita rodar CI de um serviço quando só o outro mudou.

---

## Deploy (fora do CI de PR)

- **Frontend**: Vercel conecta direto no repositório, Root Directory = `frontend/`, deploy automático a cada push em `main`
- **Backend**: Render/Cloud Run builda a partir de `backend/` — configurar via painel da plataforma, sem necessidade de step de deploy no GitHub Actions

---

## Checklist ao propor CI/CD

1. Workflow separado por serviço (`paths:` restringe o trigger)
2. Sem exigir infraestrutura própria (self-hosted runner, Docker registry privado) — usar `ubuntu-latest` e cache padrão
3. Nenhuma chave de API em `env:` do workflow sem ser via GitHub Secrets
4. Evitar: pipelines Maven/GitLab CI, jobs para stacks que não existem no projeto (Java, .NET)
