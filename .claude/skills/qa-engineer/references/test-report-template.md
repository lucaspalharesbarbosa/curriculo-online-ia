# Relatório de Testes — Template QA (Currículo Online)

```markdown
# Relatório QA — [escopo: componente / endpoint / feature]

## Resumo
[2–4 frases]

## Veredito
**[Aprovado | Aprovado com ressalvas | Reprovado | Bloqueado]**

## Execução

| Suite / comando | Resultado | Notas |
|---|---|---|
| `npm test` (frontend) | X passed, Y failed | |
| `pytest` (backend) | X passed, Y failed | |

## Critérios de aceite (CA-*)

| ID | Resultado | Evidência |
|----|-----------|-----------|
| CA-001 | OK / FALHA / N/A | |

## Fluxo de chat (se tocado)
- [ ] Resposta correta com contexto relevante
- [ ] Fallback claro quando o LLM falha
- Latência percebida: aceitável / lenta

## Acessibilidade/Performance (se UI tocada)
- Lighthouse: performance N, acessibilidade N

## Falhas

| Teste | Classificação | Bloqueante? | Ação |
|---|---|---|---|
| | bug / frágil / ambiente | sim/não | |

## Próximos passos
1. ...
```
