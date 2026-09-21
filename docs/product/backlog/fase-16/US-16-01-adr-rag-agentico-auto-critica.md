# US-16-01 — ADR: RAG agêntico com auto-crítica seletiva

**Fase:** Fase 16 — RAG Agêntico (Auto-Crítica)
**Épico de origem:** RAG Agêntico (Auto-Crítica) (`PRD-014-rag-agentico-auto-critica.md`)

**Como** mantenedor técnico do projeto,
**quero** uma decisão de arquitetura registrada para o passo de auto-crítica pós-retrieval,
**para** que a implementação (US-16-02) e a avaliação (US-16-03) sigam um critério objetivo e documentado de quando a auto-crítica roda, quantas iterações no máximo, e como isso convive com o roteamento por palavra-chave do `ADR-010`/`ADR-013` sem reabri-lo.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — `N/A`: ADR não altera o contrato do `/chat`; contrato documentado na US-16-02
- [x] Mapeamento de erros documentado — `N/A`: ADR não introduz endpoint novo
- [x] Modelagem de dados documentada — `N/A`: sem entidades relacionadas novas; auto-crítica é lógica interna ao `service.py`, sem persistência
- [x] Plano de testes definido — o ADR não implementa código, mas define o critério que a US-16-02 testa (contexto suficiente/insuficiente, limite de iterações, fallback preservado)
- [x] Épico e dependências identificados — depende de `ADR-010` (roteamento por seção/recência + fallback web), `ADR-012` (Ports & Adapters — auto-crítica usa `ChatCompletionProvider` existente), `ADR-013` (casamento por token no roteamento), `ADR-014` (histórico de conversa — auto-crítica roda depois da condensação de pergunta, sobre a pergunta já condensada)
- [x] ADR registrado se envolve decisão de stack nova — é o próprio entregável desta história (`ADR-016`, próximo número livre — `ADR-015` já registrado para Loop Engineering)
- [x] Variáveis de ambiente/segredos necessários identificados — `N/A`: reaproveita `LLM_API_KEY` já existente, nenhuma variável nova
- [x] Referência visual definida — `N/A`: sem UI
- [x] Protótipo solicitado pelo autor — `N/A`: sem pedido de protótipo, sem componente visual
- [x] Sem dúvida bloqueante

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: `docs/architecture/ADR-016-rag-agentico-auto-critica.md` criado seguindo o template padrão (Status/Contexto/Decisão/Alternativas Consideradas/Consequências/Referências)
- [x] CA-002: ADR define o critério objetivo e seletivo de quando a auto-crítica roda (faixa de score entre `SIMILARITY_THRESHOLD` e `SELF_CRITIQUE_HIGH_CONFIDENCE_THRESHOLD`, com corte mais baixo — `SELF_CRITIQUE_SECTION_CONFIDENCE_THRESHOLD` — quando já há seção roteada com confiança), justificando por que não roda em toda pergunta
- [x] CA-003: ADR define o número máximo de iterações de reformulação (`MAX_SELF_CRITIQUE_ITERATIONS = 2`) e o que a reformulação faz a cada iteração (iteração 1 reescreve a query; iteração 2 relaxa a restrição de seção)
- [x] CA-004: ADR define o que acontece quando as iterações se esgotam sem contexto suficiente — cai no fallback de busca web já existente do `ADR-010`, sem alterar esse fallback
- [x] CA-005: ADR explicita que a auto-crítica reaproveita `ChatCompletionProvider` (`ports.py`, `ADR-012`) — nenhuma porta nova, nenhuma dependência direta de SDK no domínio `chat`
- [x] CA-006: ADR relaciona explicitamente com `ADR-010`/`ADR-013` — não os revoga, os complementa (o dicionário de palavras-chave continua sendo o primeiro passo; a auto-crítica cobre o que ele deixa passar)
- [x] CA-007: ADR indica que o ganho será medido por golden-set + LLM-as-judge (US-16-03), com o número real (não estimado) documentado como consequência desta decisão depois que a US-16-03 rodar

### Fora de escopo
- Implementação de código (US-16-02) e golden-set/avaliação (US-16-03) — este ADR só decide, não implementa
- Mudança no contrato do `/chat` ou no fallback de busca web existente

### Dependências
- ADR-010, ADR-012, ADR-013, ADR-014

### Épico / Prioridade
RAG Agêntico (Auto-Crítica) — P1

### Tasks
- [x] T01 Analisar `backend/app/chat/rag.py`/`service.py` atuais e o histórico de `ADR-010`/`ADR-013` para desenhar o critério seletivo de acionamento da auto-crítica
- [x] T02 Redigir `docs/architecture/ADR-016-rag-agentico-auto-critica.md`
- [x] T03 [P] Atualizar a tabela de épicos e "Fase atual" em `docs/agents/CONTEXTO-PROJETO.md` referenciando a Fase 16 e o `ADR-016`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — `N/A`: ADR é documentação, sem código
- [x] Build/lint limpo — `N/A`: sem código nesta história
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — Aprovar com ressalvas, 0 Critical/High
- [x] Contrato de API implementado bate com o documentado no DoR — `N/A`
- [x] Sem chave de API/secret exposto — `N/A`
- [x] Documentação atualizada (ADR/contrato/diagrama ER) se algo mudou de fato durante a implementação — é o próprio entregável
- [x] Deploy/preview verificado — `N/A`: sem UI
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-09-15 | `docs/qa/QA-007-fase-16-rag-agentico-auto-critica.md` |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas | 2026-09-15 | `docs/qa/QA-007-fase-16-rag-agentico-auto-critica.md` (seção Code Review) |
| PO | `@product-owner` | Done | 2026-09-15 | `ADR-016` completo, critérios de aceite e DoD 100% fechados, sem Critical/High |

**Status:** Done
