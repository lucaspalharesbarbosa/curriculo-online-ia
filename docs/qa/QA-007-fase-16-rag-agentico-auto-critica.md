# QA-007 — Fase 16: RAG Agêntico (Auto-Crítica)

**Escopo:** US-16-01 (`ADR-016`), US-16-02 (auto-crítica em `backend/app/chat/service.py`), US-16-03 (golden-set + `backend/eval/run_golden_set.py`)
**Data:** 2026-09-15

## Resumo

Validação de código e regressão feita integralmente; validação do resultado numérico do golden-set (US-16-03) **não pôde ser concluída** neste ambiente por ausência de `LLM_API_KEY` real — detalhado na seção "Bloqueio" abaixo, sem impacto no veredito da parte de código (US-16-01/US-16-02).

## Evidências executadas

```bash
cd backend
python -m ruff check .        # All checks passed!
python -m black --check .     # All done! (após 1 reformat aplicado em eval/run_golden_set.py)
python -m pytest -q --cov=app --cov-report=term-missing
```

Resultado:

```
131 passed, 77 warnings in 3.50s

Name                                  Stmts   Miss  Cover   Missing
-------------------------------------------------------------------
app\chat\service.py                     117      0   100%
app\chat\rag.py                         146      5    97%   54-55, 247-248, 299 (pré-existente, fora do escopo)
app\chat\router.py                       78      0   100%
TOTAL                                   506     10    98%
```

`backend/tests/chat/` isolado: `123 passed` — cobre roteamento (`ADR-010`/`ADR-013`), memória conversacional (`ADR-014`) e a nova auto-crítica (`ADR-016`) juntos, sem nenhuma falha.

## Regressão — sem impacto no que já funcionava

Toda a suíte de `test_chat.py`/`test_service.py`/`test_rag.py` pré-existente (roteamento por seção/recência, busca web, feedback, memória conversacional) segue **verde sem alteração de asserção** — a auto-crítica (`ADR-016`) foi desenhada com dois patamares de confiança (`SELF_CRITIQUE_HIGH_CONFIDENCE_THRESHOLD=0.5`, `SELF_CRITIQUE_SECTION_CONFIDENCE_THRESHOLD=0.35`) justamente para não disparar chamadas extras nos cenários de teste existentes, que usam scores de fixture extremos (~1.0 ou negativos) — confirmado lendo `test_service.py`/`test_chat.py` antes da implementação e validado pela execução real acima.

## Cobertura do escopo novo (US-16-02)

`app/chat/service.py`: 100% de cobertura (117/117 statements), acima do piso de 70% do DoD. Casos cobertos por teste (`backend/tests/chat/test_service.py`):

| Cenário | Teste |
|---|---|
| Score alto (>=0.5) pula auto-crítica, sem seção roteada | `test_answer_question_skips_self_critique_when_score_already_high` |
| Seção roteada + score >=0.35 pula auto-crítica | `test_answer_question_skips_self_critique_when_section_routed_with_confidence` |
| Score ambíguo sem seção roteada aciona, reformula e converge | `test_answer_question_triggers_self_critique_and_converges_after_reformulation` |
| Esgota `MAX_SELF_CRITIQUE_ITERATIONS` ainda insuficiente → força fallback web (`ADR-010`) | `test_answer_question_falls_back_to_web_after_exhausting_self_critique_iterations` |
| `enable_self_critique=False` reproduz comportamento anterior (comparação US-16-03) | `test_answer_question_with_self_critique_disabled_skips_it_even_in_ambiguous_band` |
| Falha do provider na auto-crítica não propaga (resiliência) | `test_answer_question_treats_self_critique_provider_failure_as_sufficient` |

Contrato `/chat` (`router.py`) não tocado — confirmado por toda a suíte de `test_chat.py` (`ChatRequest`/`ChatResponse`) continuar passando sem alteração de asserção.

## `backend/eval/` (US-16-03)

- `golden_set.json`: 24 perguntas reais (13 `fora_vocabulario`, 1 `fora_vocabulario_hard`, 10 `regressao`), cada uma com `expected_facts` — estrutura JSON validada (`json.loads` bem-sucedido, carregado pelo próprio script)
- `run_golden_set.py`: `ruff check` e `black --check` limpos; guarda explícita (`SystemExit`) contra rodar sem `LLM_API_KEY`, confirmada por execução real (`SystemExit: LLM_API_KEY ausente...`)
- **Smoke test da mecânica** (fora do pytest — script batia em fakes, não na API real, executado manualmente pelo QA a partir do scratchpad da sessão): carregamento do golden-set, execução dos dois modos (`enable_self_critique=False|True`), geração do relatório e detecção de mudança de veredito — sem exceção

## Bloqueio — execução real do golden-set (US-16-03, CA-004/005/006)

Este agente roda num worktree isolado sem `LLM_API_KEY` configurada. Confirmado:
- Chamada de rede solta a `https://api.openai.com/v1/models` → `HTTP 401` (rede de saída funciona; só falta credencial)
- `python -m eval.run_golden_set` → sai com a guarda explícita do próprio script, sem tentar rodar sem a chave

**Classificação do bloqueio:** dependência de credencial externa (segredo), não falha de código — não é matéria de loop de correção automática (`ADR-015`, código sensível nunca entra no loop automático) e não é reprovação do trabalho de US-16-02/US-16-03. A mecânica está pronta e validada; falta só a execução com a chave real, ação do autor.

## Veredito

**Aprovado com ressalvas** — código de US-16-01/US-16-02 sem achados Critical/High, suíte 100% verde, cobertura acima do piso. US-16-03 entrega a infraestrutura de avaliação completa e validada, mas o **resultado numérico real do golden-set não foi produzido nesta execução** — pendência explícita, não uma reprovação, e não deve ser tratada como "Done" até o autor rodar `cd backend && python -m eval.run_golden_set` com a chave real.

## Próximos passos
1. Autor roda a avaliação real e anexa `backend/eval/results/golden_set_result_<timestamp>.json`
2. Atualizar `ADR-016` (Consequências) e `US-16-03` (CA-004/005/006, T04-T06) com o número real
3. Sem isso, `US-16-03` permanece "Quase lá", nunca "Done" — consistente com o DoD do projeto (nenhum critério de aceite aberto vira Done)

---

# Code Review — Fase 16 (RAG Agêntico com Auto-Crítica)

## Resumo

Diff coeso e dentro do escopo das três histórias: `backend/app/chat/service.py` (auto-crítica seletiva), `backend/tests/chat/test_service.py` (6 testes novos), `backend/eval/` (golden-set + script de avaliação, isolado de `app/`/`tests/`), `docs/architecture/ADR-016-...md`, PRD/backlog/QA da Fase 16, `.gitignore`. `router.py` não tocado — contrato do `/chat` confirmado inalterado pela suíte de integração existente, que segue 100% verde.

## Veredito
**Aprovar com ressalvas**

## Pontos positivos
- Segue `ADR-012` à risca: nenhuma chamada a SDK (`openai`/`httpx`) fora de `adapters/`; a auto-crítica reaproveita `ChatCompletionProvider` já existente, sem porta nova
- Critério seletivo (`_should_run_self_critique`) implementado exatamente como desenhado no `ADR-016`, com nomes de constante rastreáveis à decisão
- Cobertura de 100% no código novo (`app/chat/service.py`), com testes que provam tanto o caminho feliz (convergência) quanto os de borda (esgotar iterações, falha do provider, flag desligada) — não é só cobertura de linha, é cobertura de decisão
- `backend/eval/` corretamente isolado: nome de arquivo (`run_golden_set.py`) fora do padrão `test_*.py`/`*_test.py` do pytest, confirmado na prática (131 testes antes e depois de adicionar o pacote — nenhum novo teste vazou pro `pytest`); guarda explícita (`SystemExit`) contra rodar sem `LLM_API_KEY`
- `.gitignore` atualizado para `backend/eval/results/` — evita que o dump bruto da avaliação real vá parar no repo

## Achados

| Sev | Local | Achado | Sugestão |
|-----|-------|--------|----------|
| Low | `backend/eval/run_golden_set.py` (função `main`) | Acessa `service._index_cache`/`service._entities_cache` (atributos "privados" por convenção) direto de fora do módulo | Aceitável para um script interno de avaliação (mesmo padrão que os testes já usam via `monkeypatch`) — não bloqueia, mas se o cache de `service.py` ganhar uma função pública de setter no futuro, migrar este script junto |
| Nit | `docs/product/backlog/fase-16/US-16-03-...md` | CA-004/005/006 seguem abertos (`[ ]`) por depender de execução real fora do alcance deste ambiente | Já documentado com transparência na própria história e no `QA-007` — não é achado de qualidade de código, só registro de rastreabilidade |

Sem achados Critical ou High.

## Checklist rápido
- [x] Sem chave de API no client — `LLM_API_KEY`/`WEB_SEARCH_API_KEY` só via `os.environ`, nunca hardcoded
- [x] CORS restrito ao domínio do frontend — não tocado neste diff
- [x] Dado do currículo vem de `resume.json` — golden-set referencia fatos reais do `resume.json`, sem hardcode de dado de produto (é fixture de avaliação, não UI)
- [x] Componente/endpoint principal do diff tem teste, com cobertura ≥ 70% (piso do DoD) — 100% em `service.py`
- [x] Identificador de teste em inglês, display em PT-BR — confirmado nos 6 testes novos (docstring PT-BR abaixo da assinatura)
- [x] Contrato de API implementado bate com o documentado no DoR — `/chat` inalterado, confirmado
- [x] Erros do endpoint batem com o mapeamento documentado no DoR — `N/A`, nenhum erro novo
- [x] Build (`pytest`) ok — `131 passed`; `ruff check .` e `black --check .` limpos
- [x] Sem protótipo órfão — `N/A`, sem UI nesta entrega

## Próximos passos
1. Nenhum bloqueio de merge — PR pode seguir para `develop`
2. Manter a pendência de execução real do golden-set (US-16-03) visível no PR até o autor rodar com `LLM_API_KEY` real
