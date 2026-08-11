# Relatório QA — Fase 06 Divulgação (US-06-01 a US-06-03)

## Resumo

Escopo documental de lançamento. Validado o `README.md` (seção de agentes + link do site), links internos resolvíveis e URL de produção respondendo `200`. Sem código de app — suite unitária N/A. US-06-02 e US-06-03 ainda dependem de ações do autor para fechar Done.

## Veredito

| História | Veredito | Notas |
|---|---|---|
| US-06-01 | **Aprovado** | CAs de README atendidos; sem secret no texto |
| US-06-02 | **Aprovado com ressalvas** | CA-001–003 ok no repo; CA-004 pendente (confirmação GitHub About + LinkedIn) |
| US-06-03 | **Aprovado com ressalvas** | Roteiro ok (CA-001); CA-002–004 pendentes (registro de feedbacks) |

## Execução

| Suite / comando | Resultado | Notas |
|---|---|---|
| Links do README (`ADR-001`…`003`, `CONTEXTO`, PRDs, roadmap, skill orquestrador) | OK | `Test-Path` → True |
| `Invoke-WebRequest` HEAD `https://curriculo-online-ia.vercel.app` | OK | HTTP 200 (URL vigente na data do relatório; em 2026-08-10 a produção passou a `https://lucas-palhares-cv.vercel.app`) |
| Busca de secret no README (`sk-`, valor de API key) | OK | sem match de valor real |
| `npm test` / `pytest` | N/A | sem alteração em frontend/backend |

## Cobertura (piso de 70% — DoD)

| Escopo | Status |
|---|---|
| Código de app tocado | N/A — só Markdown / backlog |

## Critérios de aceite

### US-06-01

| ID | Resultado | Evidência |
|----|-----------|-----------|
| CA-001 | OK | Heading `## Como este projeto foi construído com agentes de IA` |
| CA-002 | OK | Pipeline + tabela de skills + links `docs/agents/` |
| CA-003 | OK | Links ADR-001/002/003 + roadmap/PRDs |
| CA-004 | OK | Tabela Produto vs. método |
| CA-005 | OK | Só nome da variável `LLM_API_KEY`, sem valor |

### US-06-02

| ID | Resultado | Evidência |
|----|-----------|-----------|
| CA-001 | OK | Bloco **Site em produção** no README |
| CA-002 | OK | Checklist do autor na história |
| CA-003 | OK | Checklist LinkedIn na história |
| CA-004 | Pendente | Aguarda confirmação do autor |

### US-06-03

| ID | Resultado | Evidência |
|----|-----------|-----------|
| CA-001 | OK | Roteiro 5 passos na história |
| CA-002–004 | Pendente | Tabela de feedbacks ainda `_pendente_` |

## Falhas

Nenhuma no escopo entregue no repositório.

## Riscos / follow-ups

1. Fase 06 não fecha 100% até o autor confirmar links externos e registrar ≥ 2 feedbacks
2. `gh` CLI indisponível neste ambiente — About do GitHub não pôde ser verificado automaticamente

## Evidências

- Data: 2026-08-10
- Branch: `feature/fase-06-divulgacao`
