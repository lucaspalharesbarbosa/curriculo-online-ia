---
name: open-merge-request
description: Prepara abertura de merge request (GitLab) ou pull request (GitHub) com URL pronta, título intuitivo e descrição organizada (entrega + como testar). Use quando o usuário pedir abrir MR/PR, merge request, pull request, ou @open-merge-request.
---

# Abrir Merge Request

## Quando usar

Acione com `@open-merge-request` ou quando o usuário pedir abrir MR, merge request, PR ou pull request.

**Não criar MR via CLI por padrão.** Entregar URL, título e descrição para o usuário colar no GitLab/GitHub — mais rápido e confiável que `glab`/`gh`.

**Não fazer push** salvo pedido explícito do usuário.

**Este repositório usa GitHub** (`github.com/lucaspalharesbarbosa/curriculo-online-ia`) — o fluxo é **pull request**, não merge request. A detecção automática pela URL do remote (seção "Montar URL do MR") cobre isso; o suporte a GitLab abaixo é só para reuso do skill em outros projetos.

## Fluxo principal (obrigatório)

1. **Pré-voo** — analisar branch, remote e diff
2. **Redigir** — título e descrição a partir do diff/commits
3. **Montar URL** — link direto para a tela "New merge request" / "Compare & pull request"
4. **Entregar** — três blocos copiáveis separados (URL, título, descrição) conforme seção "Formato de saída"

**Nunca** executar `glab mr create` ou `gh pr create` salvo pedido explícito do usuário para criar via CLI.

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

## Formato de saída (obrigatório)

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

## Criação via CLI (opcional, só sob pedido explícito)

Usar `glab` (GitLab) ou `gh` (GitHub) **apenas** quando o usuário pedir para "criar o MR automaticamente" ou "usar glab/gh".

Pré-requisitos: CLI instalada e autenticada (`glab auth login` / `gh auth login`).

GitLab:

```bash
glab mr create -t "Título" -F .mr-description.md --target-branch develop --assignee @me --remove-source-branch
```

GitHub:

```bash
gh pr create --title "Título" --body-file .mr-description.md --base develop --assignee @me
```

Se a CLI falhar, **não insistir** — voltar ao fluxo principal (URL + título + descrição).

## Anti-padrões

- Tentar `glab mr create` / `gh pr create` sem pedido explícito
- Título genérico (`Update`, `Fix`, `Changes`)
- Descrição vazia ou só com links de commit
- Seção "Como testar" ausente ou vaga ("rodar os testes")
- Push sem pedido explícito
- MR da branch base para ela mesma
- Omitir a URL pronta para abrir no browser
- **Um único bloco de código** com URL, título e descrição juntos — impede copiar com um clique
- Labels ou prefixos (`Título sugerido`, `URL para abrir MR:`) dentro do conteúdo copiável
- Título e descrição no mesmo fence

## Exemplo completo

**Entrada:** usuário na branch `feature/adiciona-footer` pede "abre o PR".

**Análise:** diff adiciona `frontend/components/Footer.tsx` + teste + inclusão no layout.

**Saída (formato esperado na resposta ao usuário):**

[Abrir PR no GitHub](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/compare/develop...feature%2Fadiciona-footer?expand=1)

```
https://github.com/lucaspalharesbarbosa/curriculo-online-ia/compare/develop...feature%2Fadiciona-footer?expand=1
```

Copie o título abaixo e cole no campo **Title** do PR:

```
Footer com links de contato
```

Copie a descrição abaixo e cole no campo **Description** do PR:

```
## O que está sendo entregue
- Componente `Footer.tsx` com e-mail, LinkedIn e GitHub vindos de `resume.json`
- Inclusão do Footer no layout raiz (`app/layout.tsx`)

## Como testar
- [ ] `cd frontend && npm test -- Footer`
- [ ] Rodar `npm run dev` e conferir o footer em todas as páginas

## Contexto
- Branch: `feature/adiciona-footer` → `develop`
- Backlog: `docs/product/backlog/fase-03/US-03-16-componente-contato-pdf.md`
```

**Ação do usuário:** abrir a URL (link ou bloco), copiar cada bloco com o botão do fence, colar nos campos do formulário, revisar diff e submeter.
