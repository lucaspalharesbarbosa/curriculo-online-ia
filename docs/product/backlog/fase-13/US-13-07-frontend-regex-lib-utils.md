# US-13-07 — Frontend: simplificar regex com risco de performance em `lib/utils.ts`

**Fase:** Fase 13 — Qualidade de Engenharia (continuação)
**Épico de origem:** Qualidade de Engenharia (`PRD-007-qualidade-engenharia.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** simplificar as expressões regulares com performance super-linear apontadas pelo Sonar em `splitAboutNarrative`,
**para** eliminar o code smell sem depender de "é seguro porque o input é confiável" como única defesa.

### Contexto de risco real

As 3 regex tratam `resume.about` — conteúdo estático do autor em `content/resume.json`, não input de usuário — então **não há ReDoS explorável hoje**. O valor da correção é maintainability/robustez (o padrão vira reutilizável/testável sem risco futuro se o dado deixar de ser 100% estático), não uma correção de vulnerabilidade ativa.

### Achados (`typescript:S8786`, MAJOR, `lib/utils.ts`)

| Linha | Regex | Mensagem |
|---|---|---|
| 150 | `/—\s*([^—]+?)\s*—/` | Performance super-linear por backtracking |
| 160 | `/\s*—\s*[^—]+?\s*—/` | Idem |
| 163 | `/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/` | Idem |

### DoR (antes de iniciar) — fechado

- [x] Critérios de aceite escritos e testáveis
- [x] Contrato de API — `N/A`
- [x] Mapeamento de erros — `N/A`
- [x] Modelagem de dados — `N/A`
- [x] Plano de testes — função `splitAboutNarrative` é pura, testável isoladamente; adicionar/confirmar teste unitário cobrindo os casos de `about` com e sem travessões (`lib/utils.test.ts`, se existir, ou criar)
- [x] Épico e dependências — `PRD-007`; sem dependência bloqueante
- [x] ADR — `N/A`
- [x] Variáveis de ambiente/segredos — `N/A`
- [x] Referência visual — `N/A`, sem mudança visível (mesmo output de `splitAboutNarrative` para o `about` real do currículo)
- [x] Protótipo — `N/A`
- [x] Sem dúvida bloqueante

### Critérios de aceite

- [ ] CA-001: as 3 regex reescritas sem o padrão de backtracking exponencial apontado (ex.: trocar quantificadores aninhados/greedy por alternativas lineares ou parsing manual do trecho entre travessões)
- [ ] CA-002: `splitAboutNarrative` produz o mesmo resultado para o `about` real de `content/resume.json` antes e depois da mudança (teste de regressão)
- [ ] CA-003: nova análise do Sonar em `main` não reporta mais os 3 achados
- [ ] CA-004: suíte do frontend continua verde

### Fora de escopo
- Mudar o formato/conteúdo do `about` no `resume.json`
- Outros achados de `lib/utils.ts` fora da lista acima

### Dependências
- Nenhuma

### Épico / Prioridade
Qualidade de Engenharia — P2

### Tasks
- [ ] T01 Reescrever as 3 regex em `frontend/lib/utils.ts` (`splitAboutNarrative`)
- [ ] T02 [P] Teste unitário cobrindo `splitAboutNarrative` com o `about` real e casos de borda (sem travessão, múltiplos travessões)
- [ ] T03 Rodar `npm test -- --run --coverage`

### DoD
- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado
- [ ] Build/lint limpo
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API — `N/A`
- [ ] Sem chave/secret exposto
- [ ] Documentação atualizada — `N/A`
- [ ] Deploy/preview verificado
- [ ] Vereditos de QA, Tech Lead e PO documentados abaixo
- [ ] Status atualizado no arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
