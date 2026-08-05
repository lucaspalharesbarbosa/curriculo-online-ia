# US-05-02 — Chunking do resume.json

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R03

**Como** sistema de RAG,
**quero** transformar o `resume.json` em pedaços de texto (chunks),
**para** viabilizar a busca por similaridade.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (função interna de chunking em `backend/app/rag.py`, sem endpoint HTTP)
- [x] Modelagem de dados documentada — N/A (sem entidade nova/relacionada; estrutura do chunk é `{id, section, text}`, já implícita na estratégia de chunking por seção do [ADR-003](../../../architecture/ADR-003-fluxo-rag.md) seção 1 — não justifica diagrama ER)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — RAG; depende de US-05-01 (Done) e US-02-02 (Done) — sem bloqueio
- [x] ADR registrado se envolve decisão de stack nova — [ADR-003](../../../architecture/ADR-003-fluxo-rag.md) já cobre a estratégia de chunking (seção 1); nenhuma decisão nova nesta história
- [x] Variáveis de ambiente/segredos necessários identificados — N/A (função pura sobre `resume.json` já carregado, sem chamada externa)
- [x] Referência visual definida — N/A (sem UI, história de backend)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `backend/tests/test_rag.py` — um chunk por experiência, por grupo de skills e por projeto; texto do chunk não vazio; total de chunks bate com a soma das seções do `resume.json` de fixture
- Integração: N/A (sem chamada externa nesta história)
- Mocks necessários: N/A (só lê `resume.json`, sem I/O externo)

### Critérios de aceite — precisam estar 100% fechados para Done
- [x] CA-001: `rag.py` gera chunks a partir de cada seção do `resume.json` — `build_chunks()` em [`backend/app/rag.py`](../../../../backend/app/rag.py)
- [x] CA-002: estratégia de chunking segue o ADR de US-05-01 — um chunk por experiência/skill group/projeto, sem overlap, conforme ADR-003 seção 1

### Fora de escopo
- Geração de embeddings (US-05-03)

### Dependências
- US-05-01 (Done), US-02-02 (Done)

### Épico / Prioridade
RAG — P3

### Tasks
- [x] T01 Implementar chunking em `backend/app/rag.py`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado (`pytest --cov`) — `rag.py` 94% (funções de chunking 100%)
- [x] Build/lint limpo (`ruff check`, type checking estrito) — `ruff check .` e `black --check .` sem erros
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — ver Vereditos
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto — N/A (sem chave nesta história)
- [x] Documentação atualizada — não houve divergência da ADR-003 durante a implementação
- [x] Deploy/preview verificado — N/A (sem UI)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `pytest backend/tests/test_rag.py` 4 testes de chunking verdes; cobertura de `build_chunks` e helpers 100% | 2026-08-04 | `backend/tests/test_rag.py` |
| Tech Lead | `@tech-lead-review` | Aprovar — chunking isolado em função pura, sem I/O externo; dados vêm de `resume.json` (via `Resume` Pydantic), nada hardcoded; sem chave envolvida | 2026-08-04 | `backend/app/rag.py` |
| PO | `@product-owner` | Done — CA-001/002 fechados, DoD 100% fechado | 2026-08-04 | — |

**Status:** Done — chunking implementado e testado em 2026-08-04, na branch `feature/US-05-01-adr-fluxo-rag`.
