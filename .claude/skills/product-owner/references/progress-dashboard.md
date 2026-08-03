# Dashboard de Progresso — Currículo Online

## Como calcular (dados reais)

```powershell
$done = @(Select-String -Path "docs/product/backlog/*.md" -Pattern "^- \[X\]" -AllMatches | ForEach-Object { $_.Matches }).Count
$open = @(Select-String -Path "docs/product/backlog/*.md" -Pattern "^- \[ \]" -AllMatches | ForEach-Object { $_.Matches }).Count
$pct = if (($done + $open) -eq 0) { 0 } else { [math]::Round($done / ($done + $open) * 100, 1) }
Write-Output "Done=$done Open=$open Pct=$pct"
```

```bash
rg -c "^- \[X\]" docs/product/backlog/*.md
rg -c "^- \[ \]" docs/product/backlog/*.md
```

## Por épico

Filtrar linhas com `[US1]`, `[US2]` ou seções `## Frontend` / `## Backend` / `## Conteúdo`.

---

## Template de relatório

```markdown
# Progresso — Currículo Online — [data]

## Resumo
**% global:** N% (X/Y tasks)

## Por épico

| Épico | Done | Open | % |
|---|---|---|---|
| Conteúdo | | | |
| Frontend | | | |
| RAG | | | |
| Deploy | | | |

## Bloqueios
1. ...

## Próximo foco
1. ...
```
