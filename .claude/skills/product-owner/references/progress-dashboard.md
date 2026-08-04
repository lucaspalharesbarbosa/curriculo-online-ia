# Dashboard de Progresso — Currículo Online

## Como calcular (dados reais)

Backlog é recursivo (`fase-FF/US-FF-NN-<slug>.md`) — sempre usar glob recursivo, nunca `backlog/*.md` (não pega os arquivos, que vivem nas subpastas de fase).

```powershell
$done = @(Select-String -Path "docs/product/backlog/**/*.md" -Pattern "^- \[X\]" -AllMatches | ForEach-Object { $_.Matches }).Count
$open = @(Select-String -Path "docs/product/backlog/**/*.md" -Pattern "^- \[ \]" -AllMatches | ForEach-Object { $_.Matches }).Count
$pct = if (($done + $open) -eq 0) { 0 } else { [math]::Round($done / ($done + $open) * 100, 1) }
Write-Output "Done=$done Open=$open Pct=$pct"
```

```bash
rg -c "^- \[X\]" docs/product/backlog/**/*.md
rg -c "^- \[ \]" docs/product/backlog/**/*.md
```

## Por fase

Cada pasta `docs/product/backlog/fase-FF/` já agrupa as histórias por fase de implementação — some `[X]`/`[ ]` dentro de cada pasta para o progresso daquela fase.

## Por épico

Filtrar pela linha `**Épico de origem:**` (fases 02-05) ou `**Área de origem:**` (fases 00-01) no início de cada história — não pela pasta, já que o backlog é organizado por fase, não por épico.

```bash
rg -l "Épico de origem: Conteúdo" docs/product/backlog/**/*.md
```

---

## Template de relatório

```markdown
# Progresso — Currículo Online — [data]

## Resumo
**% global:** N% (X/Y tasks)

## Por fase

| Fase | Done | Open | % |
|---|---|---|---|
| Fase 00 — Preparação | | | |
| Fase 01 — Descoberta e planejamento | | | |
| Fase 02 — Setup do projeto | | | |
| Fase 03 — MVP estático | | | |
| Fase 04 — Polimento | | | |
| Fase 05 — Feature de IA (RAG) | | | |

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
