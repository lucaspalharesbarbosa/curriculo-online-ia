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

- [x] CA-001: as 3 regex reescritas sem o padrão de backtracking exponencial apontado — `\s*` adjacente a `[^—]+?` removido (limpeza de espaço passa para `.trim()`/`trimStart()`/`trimEnd()` determinístico) e `.+?[.!?]` trocado por busca direta do primeiro terminador via `/[.!?](?=\s|$)/` + `slice()`
- [x] CA-002: `splitAboutNarrative` produz o mesmo resultado para o `about` real de `content/resume.json` — teste de regressão em `lib/utils.test.ts` valida `lead`/`body`/`accents` exatos contra o `about` real
- [x] CA-003: nova análise do Sonar não reporta mais os 3 achados — confirmado via API pública escopada ao [PR #49](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/49) (`issues/search?componentKeys=...-frontend&pullRequest=49&rules=typescript:S8786` → `total: 0`); Quality Gate do frontend `OK` no PR
- [x] CA-004: suíte do frontend continua verde — 71/71 testes (4 novos casos de borda em `splitAboutNarrative`: sem travessão, sem terminador de frase, múltiplos travessões, `about` real), `utils.ts` 100% stmts/lines

### Fora de escopo
- Mudar o formato/conteúdo do `about` no `resume.json`
- Outros achados de `lib/utils.ts` fora da lista acima

### Dependências
- Nenhuma

### Épico / Prioridade
Qualidade de Engenharia — P2

### Tasks
- [x] T01 Reescrever as 3 regex em `frontend/lib/utils.ts` (`splitAboutNarrative`)
- [x] T02 [P] Teste unitário cobrindo `splitAboutNarrative` com o `about` real e casos de borda (sem travessão, múltiplos travessões, sem terminador de frase)
- [x] T03 Rodar `npm test -- --run --coverage` — 71/71 verde

### DoD
- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — `utils.ts` 100% stmts/lines
- [x] Build/lint limpo
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — Aprovar
- [x] Contrato de API — `N/A`
- [x] Sem chave/secret exposto
- [x] Documentação atualizada — `N/A`
- [x] Deploy/preview verificado — `N/A`, sem mudança visível
- [x] Vereditos de QA, Tech Lead e PO documentados abaixo
- [x] Status atualizado no arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-08-18 | CA-001/002/004 fechados: 3 regex reescritas sem `\s*` colado a `[^—]+?` nem `.+?[.!?]` ambíguo; 4 testes novos de borda (sem travessão, sem terminador, múltiplos travessões, `about` real de `content/resume.json`) + o teste de regressão original, todos verdes; `utils.ts` 100% stmts/lines. Ressalva: CA-003 (nova análise do Sonar sem os 3 achados) só é verificável após o merge e nova análise rodar |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-18 | Reescrita elimina de fato o padrão ambíguo (`\s*` colado a `[^—]+?`), não só mascara o achado; comentário explica o porquê (não óbvio pelo código). Comportamento validado com o `about` real e casos de borda relevantes (múltiplos travessões é o caso mais fácil de quebrar numa reescrita manual, e está coberto) |
| PO | `@product-owner` | Done | 2026-08-18 | 4/4 CA fechados com evidência real — CA-003 confirmado via API do Sonar escopada ao [PR #49](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/49): 0 achados da regra `S8786`. QA e Tech Lead aprovaram sem Critical/High |

**Status:** Done
