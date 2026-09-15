# US-16-03 — Golden-set + avaliação LLM-as-judge (antes/depois)

**Fase:** Fase 16 — RAG Agêntico (Auto-Crítica)
**Épico de origem:** RAG Agêntico (Auto-Crítica) (`PRD-014-rag-agentico-auto-critica.md`)

**Como** mantenedor técnico do projeto,
**quero** um golden-set de perguntas reais sobre o currículo e uma rotina de avaliação automatizada que meça a taxa de acerto antes e depois da auto-crítica,
**para** ter um número real e defensável do ganho de precisão do RAG agêntico, com casos concretos de antes/depois — evidência central de um post técnico sobre o processo.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — `N/A`: script de avaliação é ferramenta interna (`backend/scripts/` ou `backend/eval/`), não expõe endpoint
- [x] Mapeamento de erros documentado — `N/A`
- [x] Modelagem de dados documentada — `N/A`: golden-set é um arquivo de dados (JSON/YAML), sem entidade relacional
- [x] Plano de testes definido — ver subseção abaixo
- [x] Épico e dependências identificados — depende de US-16-02 (implementação da auto-crítica) para poder rodar o cenário "depois"
- [x] ADR registrado — `N/A`: reaproveita a decisão já registrada em `ADR-016` (US-16-01); esta história não decide arquitetura nova, só mede o resultado
- [x] Variáveis de ambiente/segredos necessários identificados — reaproveita `LLM_API_KEY` (geração + avaliação via `ChatCompletionProvider`); nenhuma variável nova. A rotina de avaliação bate na API real de propósito (é medição de qualidade, não teste automatizado de CI) — roda sob demanda, nunca no `pytest`/CI
- [x] Referência visual definida — `N/A`: sem UI
- [x] Protótipo solicitado pelo autor — `N/A`
- [x] Sem dúvida bloqueante

#### Plano de testes

- O script de avaliação **não** é um teste automatizado de CI (bate na API real da OpenAI de propósito, para medir qualidade de verdade — nunca em `pytest`) — roda sob demanda, documentado com o comando exato de execução
- Golden-set versionado em arquivo de dados (`backend/eval/golden_set.json` ou equivalente), não hardcoded no script, para poder ser revisado/estendido como um artefato próprio
- Resultado da avaliação salvo em arquivo (`docs/qa/QA-NNN-golden-set-rag-agentico.md` ou `backend/eval/results/`) com os casos individuais (pergunta, resposta antes, resposta depois, veredito do judge, número de iterações de auto-crítica usadas) — não só o agregado

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: Golden-set com 24 perguntas reais sobre o currículo do autor (`frontend/content/resume.json`) em `backend/eval/golden_set.json` — 13 `fora_vocabulario` (sinônimos, perguntas compostas entre seções, ex. "que skills usei na Itaú Unibanco?"), 1 `fora_vocabulario_hard` (raciocínio temporal, marcada para não inflar o número) e 10 `regressao`, cada uma com `expected_facts` (ground truth) documentado
- [x] CA-002: Rotina de avaliação via LLM-as-judge (`backend/eval/run_golden_set.py`, `_judge`) que roda `service.answer_question` para cada pergunta e usa uma chamada dedicada de `ChatCompletionProvider` para julgar `CORRETO`/`INCORRETO` frente aos `expected_facts`, registrando o veredito e o motivo
- [x] CA-003: A rotina roda o golden-set em dois modos (`_run_mode(..., enable_self_critique=False|True)`) usando a mesma `service.answer_question` (`ADR-016`, parâmetro `enable_self_critique`) — sem duas cópias de código
- [ ] CA-004: Relatório de resultado com taxa de acerto agregada de cada modo e lista de casos que mudaram de veredito — **mecanismo implementado e validado** (`_write_report`, smoke-testado com fakes), mas o relatório com os **números reais** não pôde ser gerado nesta execução (ver "Bloqueio" abaixo)
- [ ] CA-005: Número reportado sem arredondar/estimar/omitir — **não aplicável ainda**: nenhum número foi reportado nesta execução, exatamente para não violar este critério (ver "Bloqueio")
- [ ] CA-006: Relatório aponta o custo médio de chamadas extras de auto-crítica por pergunta — pendente da execução real (mesmo bloqueio)

### Bloqueio encontrado (sinal verificável — credencial ausente, não código)

O agente que implementou esta história rodou neste worktree isolado (`c:\dev\study\curriculo-online-ia\.claude\worktrees\agent-a2b4228f2d221c957`), sem `LLM_API_KEY` configurada no ambiente (confirmado: `python -m eval.run_golden_set` sai com `SystemExit` na guarda explícita do script; um teste de rede solto a `https://api.openai.com/v1/models` retornou `HTTP 401`, confirmando que a rede de saída funciona — só falta a credencial). Sem chave real, **não é possível rodar a avaliação de verdade** sem violar a instrução explícita do autor de nunca inventar/arredondar o número.

O que foi feito para mitigar, sem fabricar dado:
- O script foi validado ponta a ponta com um smoke test usando fakes (não a API real) — confirma que a mecânica (carregar golden-set, rodar os dois modos, julgar, gerar relatório, listar mudanças de veredito) funciona sem exceção
- `golden_set.json` e `run_golden_set.py` estão prontos para rodar assim que uma `LLM_API_KEY` real estiver disponível: `cd backend && python -m eval.run_golden_set`

**Ação necessária do autor** (fora do que este pipeline autônomo pode fazer sozinho — segredo, não código): rodar o comando acima localmente/CI manual com a chave real e anexar o `backend/eval/results/golden_set_result_<timestamp>.json` gerado; depois disso, fechar CA-004/CA-005/CA-006 e atualizar `ADR-016` (T06) com o número real.

### Fora de escopo
- Alterar a implementação de US-16-02 para "melhorar o número" além do que a auto-crítica já entrega — a US mede, não infla o resultado
- Publicar o post no LinkedIn — só produz a evidência numérica/qualitativa que o post vai usar
- Rodar a avaliação em CI — é rotina manual/sob demanda (custo de API real)

### Dependências
- US-16-01 (`ADR-016`), US-16-02

### Épico / Prioridade
RAG Agêntico (Auto-Crítica) — P1

### Tasks
- [x] T01 Levantar perguntas reais cobrindo os dois grupos (fora do vocabulário / regressão) a partir do `resume.json` atual, com ground truth — 24 perguntas
- [x] T02 [P] Criar `backend/eval/golden_set.json` com as perguntas + ground truth
- [x] T03 Implementar script de avaliação (`backend/eval/run_golden_set.py`) com modo antes/depois e LLM-as-judge — validado com smoke test (fakes), guarda explícita contra rodar sem `LLM_API_KEY`
- [ ] T04 Rodar a avaliação de verdade (bate na API real) e coletar os números reais antes/depois — **bloqueado neste ambiente** (sem `LLM_API_KEY`, ver seção "Bloqueio" acima); comando pronto: `cd backend && python -m eval.run_golden_set`
- [ ] T05 Documentar o resultado em `docs/qa/QA-NNN-golden-set-rag-agentico.md` com agregados + casos individuais + exemplos concretos de antes/depois — depende de T04
- [ ] T06 [P] Atualizar `ADR-016` (seção Consequências) com o número real encontrado — depende de T04

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]` — CA-004/005/006 pendentes da execução real (T04)
- [x] Cobertura de testes ≥ 70% no código tocado — `N/A` com justificativa: script de avaliação é ferramenta de medição que bate na API real por natureza, não lógica de produto testável com fakes; mecânica validada por smoke test manual (fora do pytest, não versionado como teste de CI)
- [x] Build/lint limpo (`ruff check .` no script novo) — `All checks passed!`
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — Aprovar com ressalvas, 0 Critical/High (pendência é execução, não código)
- [x] Contrato de API implementado bate com o documentado no DoR — `N/A`: sem endpoint novo
- [x] Sem chave de API/secret exposto (script usa `LLM_API_KEY` de `os.environ`, nunca hardcoded; guarda explícita impede rodar sem a variável)
- [ ] Documentação atualizada (`ADR-016` com o resultado real, relatório em `docs/qa/`) — pendente de T04/T06
- [ ] Deploy/preview verificado — `N/A`
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-09-15 | `docs/qa/QA-007-fase-16-rag-agentico-auto-critica.md` — resultado real do golden-set pendente de `LLM_API_KEY` (ação do autor) |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas | 2026-09-15 | `docs/qa/QA-007-fase-16-rag-agentico-auto-critica.md` (seção Code Review) — código do golden-set/script aprovado; execução real segue pendente (não é achado de código) |
| PO | `@product-owner` | Quase lá | 2026-09-15 | CA-004/CA-005/CA-006 seguem abertos — golden-set (24 perguntas) e script de avaliação (`backend/eval/run_golden_set.py`) prontos, lintados e validados por smoke test com fakes, mas o número real antes/depois não foi produzido: este ambiente isolado não tem `LLM_API_KEY`. Não é matéria de loop automático (`ADR-015` — credencial, não código) nem pode ser fabricado (instrução explícita do autor). Ação pendente do autor: `cd backend && python -m eval.run_golden_set` com a chave real, depois fechar T04-T06 e os 3 CAs. |

**Status:** Quase lá — golden-set e script prontos e validados por smoke test; execução real com `LLM_API_KEY` pendente do autor (T04-T06)
