# Workflow — Arquivamento de fases concluídas

Objetivo: manter `docs/product/backlog/` só com fases ativas, sem perder histórico nem quebrar links, nem reaproveitar numeração.

## Quando arquivar

- **Unidade de arquivamento é a fase**, não a história isolada — mantém as histórias de uma fase juntas para rastreabilidade (ex.: não arquivar `US-05-03` sozinha enquanto `US-05-08` segue ativa)
- Só arquivar quando **100%** das histórias da fase estão `Done` (checar `**Status:**` de cada arquivo em `docs/product/backlog/fase-FF/`)
- Não arquivar automaticamente — sempre confirmar com o usuário antes de mover arquivos, porque a operação toca múltiplos documentos linkados (PRD, README, `CONTEXTO-PROJETO.md`)

## Passo a passo

1. **Confirmar 100% Done**: abrir cada `US-FF-NN-*.md` da fase e conferir `**Status:** Done`. Se algo não estiver Done, não arquivar — sinalizar ao usuário o que falta.
2. **Mover a pasta**: `docs/product/backlog/fase-FF/` → `docs/product/backlog/archive/fase-FF/` (`git mv`, não copiar — preserva histórico do arquivo no `git log`/`git blame`).
3. **Atualizar links que apontam para a fase movida**:
   - `docs/product/README.md` — mover a linha da fase da lista de fases ativas para uma seção "## Fases arquivadas", atualizando o caminho do link (`archive/fase-FF/`)
   - PRD(s) de origem (`docs/product/PRD-NNN-*.md`) — tabela "Histórias": atualizar o caminho de cada link (`backlog/fase-FF/...` → `backlog/archive/fase-FF/...`)
   - `docs/agents/CONTEXTO-PROJETO.md` — tabela "Fases do roadmap e backlog correspondente": atualizar o caminho da coluna "Backlog"
   - Qualquer outra história ativa que referencie uma história arquivada em "Dependências" — o link muda de caminho, o **ID não muda**
4. **Não renumerar nada** — `US-FF-NN`, `PRD-NNN`, `ADR-NNN` continuam com os mesmos números; arquivamento é só mudança de localização física, não de identidade do documento
5. **Commitar isolado**: `chore(backlog): arquivada fase-FF concluída` — commit dedicado, sem misturar com mudança de código, para o diff do arquivamento ficar fácil de auditar
6. **Registrar no relatório do `@orquestrador`** (se rodou dentro de um pipeline) ou mencionar no chat que a fase foi arquivada e onde ela foi parar

## Onde procurar uma história arquivada

`docs/product/backlog/archive/fase-FF/US-FF-NN-<slug>.md` — mesmo nome de arquivo e ID de sempre, só o prefixo de caminho ganha `archive/`. Buscar por ID (`US-05-03`) funciona igual, esteja a história ativa ou arquivada.

## Anti-padrões

- Arquivar história individual antes do resto da fase estar Done
- Mover arquivo sem atualizar os links que apontam para ele (PRD, README, `CONTEXTO-PROJETO.md`)
- Renumerar ID ao arquivar
- Arquivar sem confirmação do usuário
- Misturar o commit de arquivamento com outra mudança não relacionada
