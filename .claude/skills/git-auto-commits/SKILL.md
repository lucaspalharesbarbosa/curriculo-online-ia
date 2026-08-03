---
name: git-auto-commits
description: Organiza alterações em commits pequenos, coesos e atômicos a partir do working tree ou staged changes. Mensagens em português brasileiro (particípio passado) no formato Conventional Commits (feat:, fix:, refactor:, etc.). Use quando o usuário pedir commits organizados, commits atômicos, dividir alterações em commits, conventional commits em PT-BR, ou @git-auto-commits.
---

# Commits organizados (staged / working tree)

## Quando usar

Acione com `@git-auto-commits` ou quando o usuário pedir commits organizados, atômicos ou divididos por intenção.

Transforma alterações em **sequência de commits pequenos e coesos**, com mensagens em **português brasileiro** no formato **Conventional Commits** com **particípio passado**.

**Só commitar quando o usuário pedir explicitamente** nesta conversa.

## Princípios

1. **Um commit = uma intenção** — não misturar refatoração com feature, docs com código, testes com comportamento, etc.
2. **Ordem lógica** — agrupar por domínio (módulo), tipo de mudança e fronteira (código vs. docs vs. config).
3. **Escopo mínimo** — commitar apenas o que o usuário pediu; não expandir.
4. **Plano antes de executar** — apresentar o plano e aguardar aprovação, salvo se o usuário já autorizou (`pode commitar`, `executa`, etc.).

## Pré-voo (obrigatório)

Antes de qualquer `git add` ou `git commit`:

```bash
git status
git diff --staged
git diff
git log -5 --oneline
```

Verificar:

- [ ] Usuário **pediu explicitamente** para commitar
- [ ] Sem secrets nos arquivos (`.env`, credentials, keys)
- [ ] Sem pular hooks (`--no-verify`) salvo pedido explícito
- [ ] Sem `--amend` salvo regras do usuário permitirem

## Análise e plano

### 1. Inventário

Classificar cada arquivo alterado:

| Natureza | Prefixo típico |
|----------|----------------|
| Nova funcionalidade | `feat` |
| Correção de bug | `fix` |
| Refatoração (sem mudança de comportamento) | `refactor` |
| Apenas testes | `test` |
| Apenas documentação | `docs` |
| Build / CI / deps | `chore` |
| Performance | `perf` |

### 2. Agrupamento

Agrupar por **intenção lógica**, não só por pasta.

**Mesmo commit quando:**

- Código + testes do **mesmo** comportamento
- Tipos/schema + uso fortemente acoplados

**Commits separados quando:**

- Feature vs. fix vs. refactor
- Docs / config / formatação vs. código
- Módulos independentes grandes
- Arquivos gerados vs. manuais (quando fizer sentido)

Preferir **3–8 arquivos** por commit; dividir quando o diff mistura intenções.

### 3. Plano (obrigatório antes de commitar)

```markdown
## Plano de commits

| # | Tipo | Arquivos | Mensagem proposta |
|---|------|----------|-------------------|
| 1 | feat | src/... | feat: implementado ... |
| 2 | test | tests/... | test: adicionados testes para ... |

**Ordem:** 1 → 2 → ... (dependências primeiro: refactor → feat → test → docs)
```

Apresentar o plano e **aguardar aprovação**, salvo autorização prévia do usuário.

## Formato da mensagem

```
<tipo>[escopo opcional]: <particípio passado + complemento>
```

### Tipos (Conventional Commits)

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs` | Apenas documentação |
| `test` | Apenas testes |
| `chore` | Manutenção, deps, CI |
| `perf` | Melhoria de performance |
| `style` | Formatação, sem mudança de lógica |
| `build` | Sistema de build |
| `ci` | Pipelines CI |

**Escopo** (opcional): módulo curto — `feat(api)`, `fix(worker)`.

### Particípio passado (PT-BR)

O assunto após `: ` deve soar como ação concluída:

| Verbo | Particípio |
|-------|------------|
| implementar | implementado |
| corrigir | corrigido |
| adicionar | adicionado |
| remover | removido |
| atualizar | atualizado |
| refatorar | refatorado |
| extrair | extraído |
| mover | movido |
| renomear | renomeado |
| documentar | documentado |
| configurar | configurado |
| utilizar | utilizado |

**Bons exemplos:**

```
feat(frontend): implementado componente Footer
fix(chat): corrigido timeout na chamada ao provider de LLM
refactor(rag): extraída função de chunking do resume.json
test(backend): adicionados testes do endpoint /chat
docs: atualizado ADR do fluxo de RAG
chore: atualizada dependência do FastAPI
```

**Evitar:**

```
feat: implementa endpoint       ← infinitivo, não particípio
fix: fixing bug                   ← inglês
feat: implementado X e corrigido Y  ← duas intenções
```

Corpo (opcional): contexto breve após linha em branco — PT-BR, frases completas.

## Execução

Após aprovação, **um commit por vez**:

```bash
git add path/to/file1 path/to/file2
git commit -m "$(cat <<'EOF'
feat: implementado serviço de catálogo

EOF
)"
git status
```

Repetir até limpar o working tree (ou deixar apenas o que for intencional).

### Estratégias de staging

| Situação | Ação |
|----------|------|
| Nada staged | `git add` apenas os arquivos do commit planejado |
| Staging parcial | `git add -p` ou paths explícitos |
| Staged misturado | `git restore --staged .` e re-staging por plano |

### Pós-commit

```bash
git status
git log -n <N> --oneline
```

Reportar SHAs e mensagens. **Não fazer push** salvo pedido do usuário.

## Ordem sugerida

1. `chore` / `build` / `ci`
2. `refactor`
3. `feat` / `fix` / `perf`
4. `test`
5. `docs`

Dentro do mesmo nível: dependências antes de dependentes.

## Anti-padrões

- Um commit gigante com mudanças não relacionadas
- `feat` + `fix` no mesmo commit sem acoplamento forte
- Assunto em inglês ou infinitivo em vez de particípio passado
- Commitar sem plano quando há 2+ grupos lógicos
- Incluir secrets ou `.env`
- `--amend` / `--no-verify` sem autorização

## Exemplos

### Entrada

Alterações: `backend/requirements.txt` (bump do FastAPI), `backend/tests/test_chat.py`, `docs/architecture/ADR-002-fluxo-rag.md`.

### Plano

| # | Tipo | Mensagem |
|---|------|----------|
| 1 | chore | `chore: atualizada dependência do FastAPI` |
| 2 | test | `test(chat): adicionados testes de fallback do endpoint /chat` |
| 3 | docs | `docs: documentado ADR do fluxo de RAG` |

### Entrada

Bug único em `frontend/components/ChatWidget.tsx`.

```
fix(chat): corrigido estado de loading que travava após erro
```
