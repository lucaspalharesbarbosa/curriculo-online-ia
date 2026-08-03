---
name: git-rebase-feature-develop
description: Executa rebase seguro da branch feature sobre develop atualizada, com pré-voo, validação de sincronismo remoto e resolução de conflitos. Use quando o usuário pedir rebase de feature em develop, atualizar feature com develop, sincronizar branch com develop, ou mencionar @git-rebase-feature-develop.
---

# Rebase seguro — feature sobre develop

## Quando usar

Acione com `@git-rebase-feature-develop` ou quando o usuário pedir rebase da branch feature na `develop`.

**Objetivo:** reaplicar os commits da feature em cima da `develop` mais recente, com ambas as branches atualizadas e working tree limpo.

**Não usar** para rebase em `main`/`master`/`develop` (branch compartilhada) nem sem confirmação explícita do usuário.

## Parâmetros

| Parâmetro | Padrão | Descrição |
|-----------|--------|-----------|
| `FEATURE_BRANCH` | branch atual ou nome informado pelo usuário | Branch a rebasar |
| `BASE_BRANCH` | `develop` | Branch base |
| `REMOTE` | `origin` | Remote Git |

Se o usuário não informar a feature branch, usar a branch atual após `git branch --show-current`.

## Regras invioláveis

- **Nunca** `git push --force` em `main`, `master` ou `develop`
- **Nunca** `git push --force` sem pedido explícito do usuário (após rebase, feature reescrita exige `--force-with-lease`)
- **Nunca** `--no-verify`, `--amend` em rebase alheio, nem alterar `git config`
- **Nunca** `git rebase -i` salvo pedido explícito
- **Nunca** continuar com working tree sujo sem stash ou commit deliberado
- Preferir `git pull --ff-only` (evita merge commit acidental na base)
- Preferir `git push --force-with-lease` (não `--force` puro) quando push for autorizado

## Pré-voo (obrigatório)

Executar e analisar **antes** de qualquer checkout/rebase:

```bash
git status
git branch --show-current
git remote -v
git fetch origin
```

Verificar e **parar** se alguma condição falhar (informar o usuário):

| Verificação | Comando | Ação se falhar |
|-------------|---------|----------------|
| Rebase/merge em andamento | `test -d .git/rebase-merge -o -d .git/rebase-apply` (ou `git status` mostra "rebase in progress") | `git rebase --abort` ou `git merge --abort` **somente se o usuário pedir** |
| Working tree limpo | `git status --porcelain` vazio | Stash (`git stash push -u -m "pre-rebase"`) **só com aprovação**; senão parar |
| Remote acessível | `git fetch origin` sem erro | Diagnosticar rede/credenciais |
| Feature branch existe | `git rev-parse --verify origin/FEATURE` ou branch local | Confirmar nome com usuário |

Registrar estado inicial:

```bash
git log --oneline -3 develop 2>/dev/null || true
git log --oneline -3 FEATURE_BRANCH 2>/dev/null || true
```

## Fluxo principal

Copiar checklist e marcar progresso:

```
Rebase feature ← develop:
- [ ] 1. Pré-voo OK
- [ ] 2. develop atualizada
- [ ] 3. feature sincronizada com remoto
- [ ] 4. Rebase executado
- [ ] 5. Pós-rebase validado
```

### 1. Atualizar `develop`

```bash
git checkout develop
git pull --ff-only origin develop
```

Se `--ff-only` falhar: **parar**. A `develop` local divergiu do remoto — pedir ao usuário como proceder (reset, merge manual, etc.). Não fazer merge automático na `develop`.

Confirmar:

```bash
git status
# deve mostrar: On branch develop, up to date with 'origin/develop'
```

### 2. Preparar branch feature

```bash
git checkout FEATURE_BRANCH
git fetch origin
```

Avaliar sincronismo com o remoto:

```bash
git status -sb
git rev-list --left-right --count origin/FEATURE_BRANCH...HEAD 2>/dev/null || echo "branch só local"
```

| Situação | Ação |
|----------|------|
| Commits locais não commitados | Parar ou stash com aprovação |
| `ahead` (commits locais não no remoto) | OK — rebase permitido |
| `behind` (remoto à frente) | **Parar** — `git pull --rebase origin FEATURE` ou alinhar com usuário antes |
| `diverged` (ahead e behind) | **Parar** — pedir estratégia ao usuário |
| Só local (sem remote tracking) | OK — avisar que push inicial será normal (sem force) |

**Meta:** feature sem alterações pendentes, sem necessidade de pull, pronta para rebase.

### 3. Executar rebase

```bash
git rebase develop
```

**Sucesso (sem conflitos):** ir para [Pós-rebase](#pós-rebase).

**Conflitos:** seguir [Resolução de conflitos](#resolução-de-conflitos).

## Resolução de conflitos

1. Listar arquivos em conflito:

```bash
git status
```

2. Para cada arquivo, resolver marcadores `<<<<<<<`, `=======`, `>>>>>>>` (ou usar ferramenta de merge se o usuário preferir).

3. Marcar resolvidos e continuar:

```bash
git add <arquivos-resolvidos>
git rebase --continue
```

4. Repetir até o rebase terminar.

**Abortar** (somente se o usuário pedir):

```bash
git rebase --abort
```

Após abort, a branch volta ao estado pré-rebase.

**Dica:** após resolver cada conflito, rodar testes relevantes se o projeto tiver suite rápida — reduz retrabalho.

## Pós-rebase

```bash
git status
git log --oneline develop..HEAD
```

Reportar ao usuário:

- Quantos commits foram reaplicados
- Se houve conflitos e como foram resolvidos
- Se a feature já existia no remoto (histórico reescrito)

### Push (somente com pedido explícito)

Se a feature **já tinha** push anterior:

```bash
git push --force-with-lease origin FEATURE_BRANCH
```

Se `--force-with-lease` falhar: **parar** — outra pessoa atualizou o remoto; investigar com `git fetch` e `git log`.

Se a feature **nunca** foi enviada ao remoto:

```bash
git push -u origin FEATURE_BRANCH
```

### Restaurar stash (se aplicável)

```bash
git stash list
git stash pop   # só se stash foi criado no pré-voo com aprovação
```

## Resumo para o usuário

Ao concluir, entregar:

```markdown
## Rebase concluído

- **Base:** develop @ `<hash curto>`
- **Feature:** FEATURE_BRANCH @ `<hash curto>`
- **Commits reaplicados:** N
- **Conflitos:** nenhum | resolvidos em: ...
- **Push:** não executado | force-with-lease OK | pendente ação do usuário
- **Próximo passo sugerido:** ...
```

## Comandos proibidos (salvo pedido explícito)

| Comando | Motivo |
|---------|--------|
| `git push --force` (sem `--force-with-lease`) | Pode sobrescrever trabalho alheio |
| `git push --force` em develop/main/master | Branch compartilhada |
| `git rebase -i` | Reescreve histórico além do escopo |
| `git reset --hard` | Destrutivo |
| `git checkout -- .` em massa durante conflito | Perda de resolução manual |

## Exemplo completo

```bash
# Pré-voo
git fetch origin
git status   # working tree clean

# Atualizar develop
git checkout develop
git pull --ff-only origin develop

# Preparar feature
git checkout feat/minha-feature
git status -sb   # sem behind, sem changes

# Rebase
git rebase develop

# Pós (push só se usuário pedir)
git push --force-with-lease origin feat/minha-feature
```
