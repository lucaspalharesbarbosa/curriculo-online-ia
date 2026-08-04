---
name: open-merge-request
description: Abre pull request (GitHub) ou merge request (GitLab) automaticamente via CLI quando possível, com título intuitivo e descrição organizada (entrega + como testar). Use quando o usuário pedir abrir MR/PR, merge request, pull request, ou @open-merge-request.
---

# Abrir Merge Request

## Quando usar

Acione com `@open-merge-request` ou quando o usuário pedir abrir MR, merge request, PR ou pull request.

**Este repositório usa GitHub** (`github.com/lucaspalharesbarbosa/curriculo-online-ia`) — o fluxo é **pull request**, não merge request. Preferir **criação automática via `gh`**. O suporte a GitLab (`glab`) abaixo é só para reuso do skill em outros projetos.

**Não fazer push** salvo pedido explícito do usuário (ou se o pré-voo mostrar que a branch ainda não está no remote e o usuário pediu abrir o PR — aí fazer `git push -u origin HEAD` antes do `gh pr create`).

## Pré-requisito — GitHub CLI

Neste projeto o agente deve usar `gh` para abrir PR automaticamente.

1. Garantir `gh` no PATH (instalação preferencial sem UAC):
   - Portátil: `%LOCALAPPDATA%\Programs\gh\bin\gh.exe` (já usado neste ambiente)
   - Ou `winget install --id GitHub.cli -e` (pode pedir elevação)
2. Autenticado: `gh auth status` deve mostrar a conta; se não, `gh auth login --hostname github.com --git-protocol https --web`
3. Escopos mínimos: `repo` (e `read:org` se necessário)

Se `gh` não estiver autenticado, **iniciar o login web**, mostrar o one-time code + URL `https://github.com/login/device` ao usuário e **aguardar** a autenticação antes de criar o PR.

## Fluxo principal (obrigatório)

1. **Pré-voo** — analisar branch, remote e diff
2. **Redigir** — título e descrição a partir do diff/commits
3. **Criar via CLI** — `gh pr create` (GitHub) ou `glab mr create` (GitLab)
4. **Entregar** — URL do PR criado + título/descrição usados

**Fallback** (só se a CLI falhar ou não estiver disponível): montar URL compare + três blocos copiáveis (seção "Formato de saída — fallback").

## Pré-voo (obrigatório)

Executar em paralelo:

```bash
git status
git branch --show-current
git config --get remote.origin.url
git log -10 --oneline
```

Identificar branch base (padrão do projeto: `develop`; usar `main`/`master` só se for o fluxo do repositório):

```bash
git fetch origin
git log origin/develop..HEAD --oneline
git diff origin/develop...HEAD --stat
```

Verificar:

- [ ] Branch atual **não** é a base (`develop`, `main`, etc.)
- [ ] Há commits ou alterações a incluir no MR
- [ ] Working tree limpo ou alterações commitadas (avisar se houver mudanças não commitadas)
- [ ] Branch pushada no remote (avisar se `origin/<branch>` não existir — incluir comando `git push -u origin HEAD` como sugestão, sem executar)

Consultar quando relevante:

- `docs/agents/CONTEXTO-PROJETO.md` — stack, branching, convenções
- `docs/product/backlog/fase-FF/US-FF-NN-<slug>.md` — história/tasks da feature, para resumir entregas
- `docs/architecture/ADR-*.md` — se a mudança envolveu decisão de arquitetura

## Montar URL do MR

Detectar plataforma pelo remote (`git config --get remote.origin.url`):

| Plataforma | Padrão no remote |
|------------|------------------|
| GitLab | `gitlab.com` ou `gitlab.*` |
| GitHub | `github.com` |

### GitHub (padrão deste repositório)

```
https://github.com/{owner}/{repo}/compare/{target}...{source}?expand=1
```

Codificar `/` na branch source se necessário (`%2F`).

**Exemplo (URL apenas no bloco copiável):**

[Abrir PR no GitHub](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/compare/develop...feature%2Fadiciona-footer?expand=1)

```
https://github.com/lucaspalharesbarbosa/curriculo-online-ia/compare/develop...feature%2Fadiciona-footer?expand=1
```

### GitLab (só se o remote apontar para gitlab.*)

Extrair `host` e `path_with_namespace` do remote (remover `.git` e credenciais):

- SSH: `git@gitlab.com:namespace/projeto.git`
- HTTPS: `https://gitlab.com/namespace/projeto.git`

URL base do projeto: `https://{host}/{path_with_namespace}`

URL para nova MR (codificar branches com `encodeURIComponent` / equivalente):

```
https://{host}/{path}/-/merge_requests/new?merge_request%5Bsource_branch%5D={source_encoded}&merge_request%5Btarget_branch%5D={target_encoded}
```

Equivalente legível: `merge_request[source_branch]={source}` e `merge_request[target_branch]={target}`.

## Redigir título

Regras:

1. **Simples e intuitivo** — uma linha que responda "o que este MR entrega?"
2. **Português brasileiro**
3. Foco na **entrega**, não na lista de commits
4. Evitar jargão interno sem contexto; incluir spec/US só quando ajudar rastreabilidade

**Bons exemplos:**

```
Footer com links de contato
Endpoint /chat com RAG sobre o resume.json
Correção de layout quebrado no mobile
Seção de Skills agrupada por categoria
```

**Evitar:**

```
WIP fix stuff
PR da branch feature/footer
feat: implementado X, Y, Z, refatorado A, B, C
```

Prefixo Conventional Commits (`feat:`, `fix:`) é **opcional** no título; preferir clareza para o revisor.

## Redigir descrição

Usar este template:

```markdown
## O que está sendo entregue

- [bullet objetivo — comportamento ou artefato entregue]
- [bullet — impacto em API, worker, contrato, docs, etc.]

## Como testar

- [ ] [passo concreto — comando, endpoint, cenário]
- [ ] [passo — teste automatizado relevante]
- [ ] [passo — smoke manual se aplicável]

## Contexto

- Branch: `feature/...` → `develop`
- Spec/tasks: `docs/archive/specs/NNN-.../` (se houver)
```

Diretrizes:

- **O que está sendo entregue**: bullets com valor de negócio/técnico; derivar do diff e dos commits, não copiar mensagens de commit verbatim
- **Como testar**: passos acionáveis (`pytest ...`, `curl ...`, smoke script); referenciar `quickstart.md` da feature quando existir
- **Contexto**: branch origem → destino, spec, US, PRD, contrato/ADR
- Não incluir secrets, tokens ou dados sensíveis

## Formato de saída — fallback (obrigatório se a CLI falhar)

O objetivo é **copiar e colar com um clique** — sem selecionar texto manualmente, sem remover labels ou prefixos.

Apresentar **sempre** nesta ordem, com **três blocos separados** (nunca um único bloco grande com URL + título + descrição):

### 1. URL

- Link clicável em markdown para conveniência: `[Abrir MR no GitLab](url)` ou `[Abrir PR no GitHub](url)`
- **Imediatamente abaixo**, bloco de código contendo **somente** a URL (sem prefixo `URL para abrir MR:`, sem texto extra):

```
https://gitlab.com/.../-/merge_requests/new?...
```

### 2. Título

Texto curto fora do bloco (não copiável): `Copie o título abaixo e cole no campo **Title** do MR:`

Bloco de código com **uma linha** — apenas o título, sem aspas, sem `feat:`, sem label:

```
Cadastro atômico de tecnologias homologadas — wizard admin US-26
```

### 3. Descrição

Texto curto fora do bloco (não copiável): `Copie a descrição abaixo e cole no campo **Description** do MR:`

Bloco de código com **somente** o corpo markdown (começando em `## O que está sendo entregue`), sem cabeçalho "Descrição sugerida", sem URL, sem título:

```
## O que está sendo entregue
- ...

## Como testar
- [ ] ...

## Contexto
- Branch: `...` → `develop`
- ...
```

### Regras dos blocos copiáveis

- **Um bloco = um campo do formulário** (URL, título ou descrição)
- Usar fence ` ``` ` **sem** tag de linguagem (`markdown`, `text`, etc.) — conteúdo puro
- **Nunca** colocar labels (`Título sugerido`, `Descrição sugerida`, `URL para abrir MR:`) **dentro** do bloco copiável
- **Nunca** envolver URL + título + descrição no mesmo fence
- **Nunca** usar bloco copiável para avisos (push pendente, working tree sujo, DoD) — avisos ficam em texto normal **após** os três blocos

Após os três blocos, incluir avisos curtos se aplicável:

- Branch não pushada → sugerir `git push -u origin HEAD`
- Working tree sujo → pedir commit antes de abrir MR
- Checklist DoD pendente (testes, quickstart, contratos)

Checklist DoD (mencionar se faltar):

- [ ] Testes verdes para o componente/endpoint alterado (`npm test` / `pytest`)
- [ ] Sem chave de API exposta no diff (frontend nunca chama o LLM direto)
- [ ] História do backlog (`docs/product/backlog/fase-FF/US-FF-NN-<slug>.md`) marcada como concluída

## Push (somente se pedido)

Se o usuário pedir explicitamente push:

```bash
git push -u origin HEAD
```

Depois do push, **regenerar a URL** (mesma fórmula) e entregar novamente título + descrição.

## Criação via CLI (padrão neste repositório)

Após pré-voo e redação de título/descrição:

1. Confirmar `gh auth status` (GitHub) ou `glab auth status` (GitLab)
2. Se a branch não estiver no remote e o usuário pediu abrir o PR: `git push -u origin HEAD`
3. Criar o PR/MR

GitHub:

```bash
# Escrever corpo em arquivo temporário evita problemas de aspas no PowerShell
gh pr create --title "Título" --body-file .pr-body.md --base develop
```

GitLab:

```bash
glab mr create -t "Título" -F .mr-description.md --target-branch develop --remove-source-branch
```

4. Remover o arquivo temporário de body (`.pr-body.md`) se não for versionado
5. Entregar ao usuário a **URL do PR criado** (retorno do `gh pr create`)

Se a CLI falhar, **uma tentativa de diagnóstico** (`gh auth status`, branch pushada?) e então fallback para o formato de saída com URL compare + título + descrição.

## Formato de saída — sucesso via CLI

```markdown
PR criado: [URL]

**Título:** ...

## O que foi aberto
- base: `develop`
- head: `feature/...`
```

## Formato de saída — fallback

Usar a seção "Formato de saída" (três blocos copiáveis) **somente** quando a CLI não puder criar o PR.

## Anti-padrões

- Entregar só blocos copiáveis quando `gh` está autenticado e poderia criar o PR
- Título genérico (`Update`, `Fix`, `Changes`)
- Descrição vazia ou só com links de commit
- Seção "Como testar" ausente ou vaga ("rodar os testes")
- Push sem pedido explícito (exceto o caso "abrir PR" com branch ainda sem remote)
- MR/PR da branch base para ela mesma
- Commitar `.pr-body.md` / `.mr-description.md` por engano
- No fallback: **um único bloco** com URL + título + descrição juntos

## Exemplo completo

**Entrada:** usuário na branch `feature/adiciona-footer` pede "abre o PR".

**Análise:** diff adiciona `Footer.tsx` + teste; `gh` autenticado; branch pushada.

**Ação:** `gh pr create --base develop --title "..." --body-file .pr-body.md`

**Saída:**

PR criado: https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/4

**Título:** Footer com links de contato
