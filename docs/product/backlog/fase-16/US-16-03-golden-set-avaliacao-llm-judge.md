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
- [x] CA-004: Relatório de resultado com taxa de acerto agregada de cada modo e lista de casos que mudaram de veredito — gerado em 21/09/2026, três execuções em `backend/eval/results/` (`golden_set_result_20260921T170723Z/171332Z/172037Z.json`)
- [x] CA-005: Número reportado sem arredondar/estimar/omitir — 19/24 vs 19/24 (cortes originais), 19/24 vs 19/24 (recalibrados), 18/24 vs 18/24 (recalibrados + abstenção). Ganho agregado: nenhum, em nenhuma configuração
- [x] CA-006: Custo médio de chamadas extras — com os cortes originais, 3 das 24 perguntas acionavam a auto-crítica (0,13 chamada extra por pergunta em média); com os recalibrados, 14 das 24 (0,58 a 1,17 chamada extra, conforme o número de iterações). Perguntas fora da faixa seguem com custo idêntico ao anterior à ADR

### Resultado da execução real (21/09/2026)

Executado pelo autor com `LLM_API_KEY` real: `cd backend && python -m eval.run_golden_set`.

| Rodada | Configuração | Sem auto-crítica | Com auto-crítica | Mudaram de veredito |
|---|---|---|---|---|
| 1 | `0.5` / `0.35` | 19/24 | 19/24 | 0 |
| 2 | `0.55` / `0.52` | 19/24 | 19/24 | q15 corrigida, q06 quebrada |
| 3 | `0.55` / `0.52` + abstenção | 18/24 | 18/24 | q15 corrigida, q22 perdida |

Achados que motivaram mudança de código (ver `ADR-016`, "Resultado real da medição"):

- Com os cortes estimados, a auto-crítica rodava em 3/24 perguntas e em nenhuma das que
  erravam. Recalibrados pela distribuição real, passa a rodar em 14/24.
- A recalibração corrigiu de forma reprodutível *"onde você trabalha atualmente?"*, que
  respondia uma empresa antiga.
- A auto-crítica esgotada empurrava para a busca web e produziu resposta fabricada em
  *"onde trabalhava antes da Itaú?"*. `ADR-016` seção 4 foi reescrita: esse caminho agora
  abstém. Custo medido: *"onde fica localizado o Itaú?"* perdeu a resposta que vinha da web.
- Executar o mesmo código três vezes deu 19, 19 e 18 no modo sem auto-crítica: q06 oscila.
  Com n=24, ±1 caso é ruído. O golden-set serve para achar modo de falha, não para comparar
  taxas agregadas.

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
- [x] T04 Rodar a avaliação de verdade e coletar os números reais antes/depois — 3 execuções em 21/09/2026
- [x] T05 Documentar o resultado — registrado em `ADR-016` ("Resultado real da medição"), nesta história e em `docs/qa/QA-007`; casos individuais nos JSON de `backend/eval/results/`
- [x] T06 [P] Atualizar `ADR-016` com o número real e as duas mudanças de código que ele motivou (recalibração e abstenção)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — `N/A` com justificativa: script de avaliação é ferramenta de medição que bate na API real por natureza, não lógica de produto testável com fakes; mecânica validada por smoke test manual (fora do pytest, não versionado como teste de CI)
- [x] Build/lint limpo (`ruff check .` no script novo) — `All checks passed!`
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — Aprovar com ressalvas, 0 Critical/High (pendência é execução, não código)
- [x] Contrato de API implementado bate com o documentado no DoR — `N/A`: sem endpoint novo
- [x] Sem chave de API/secret exposto (script usa `LLM_API_KEY` de `os.environ`, nunca hardcoded; guarda explícita impede rodar sem a variável)
- [x] Documentação atualizada (`ADR-016` com o resultado real, `QA-007` com a execução)
- [x] Deploy/preview verificado — `N/A`: ferramenta interna, sem superfície de deploy
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-09-15 | `docs/qa/QA-007-fase-16-rag-agentico-auto-critica.md` — resultado real do golden-set pendente de `LLM_API_KEY` (ação do autor) |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas | 2026-09-15 | `docs/qa/QA-007-fase-16-rag-agentico-auto-critica.md` (seção Code Review) — código do golden-set/script aprovado; execução real segue pendente (não é achado de código) |
| PO | `@product-owner` | Quase lá | 2026-09-15 | CA-004/CA-005/CA-006 abertos: sem `LLM_API_KEY` no worktree isolado, o número real não foi produzido nem fabricado. Ação pendente do autor: rodar `python -m eval.run_golden_set` com a chave real. |
| PO | `@product-owner` | Done | 2026-09-21 | Execução real feita (3 rodadas, ver "Resultado da execução real"). CA-004/005/006 fechados com número não arredondado. A medição não mostrou ganho agregado e revelou dois defeitos que foram corrigidos no código (cortes mal calibrados e caminho de fabricação via web), que é exatamente o resultado que esta história existia para produzir. |

**Status:** Done — golden-set executado com chave real (3 rodadas), números registrados sem arredondar, e os dois achados da medição já corrigidos no código (recalibração dos cortes e abstenção no lugar de busca web)
