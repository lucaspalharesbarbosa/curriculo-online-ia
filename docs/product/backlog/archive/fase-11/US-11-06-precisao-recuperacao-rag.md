# US-11-06 — Melhorar precisão de recuperação do RAG (roteamento por seção/recência)

**Fase:** Fase 11 — Chat v2 + RAG Inteligente
**Épico de origem:** RAG (`PRD-011-rag-inteligente.md`)

**Como** visitante/recrutador,
**quero** que o assistente responda corretamente perguntas objetivas sobre a trajetória do autor (ex.: "onde estudei?", "qual a última empresa que trabalhei?"),
**para** confiar no assistente como fonte real de informação sobre o currículo, não só quando a pergunta é muito específica.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — request/response do `/chat` **não muda** (ver subseção abaixo); só a lógica interna de seleção de contexto
- [x] Mapeamento de erros documentado — nenhum erro novo; reaproveita o tratamento existente em `chat.py` (`_http_error_from_openai`)
- [x] Modelagem de dados documentada — N/A, sem entidade nova (só lógica sobre os chunks já existentes)
- [x] Plano de testes definido (ver subseção abaixo)
- [x] Épico e dependências identificados — RAG (`PRD-011`); depende de **US-11-05** (ADR) — **Done**, ver `ADR-010`
- [x] ADR registrado se envolve decisão de stack nova — [ADR-010](../../../architecture/ADR-010-fluxo-rag-v2-precisao-web.md), seção 1 (roteamento por seção/recência)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A, nenhuma variável nova
- [x] Referência visual definida — N/A, sem UI
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Contrato de API

`POST /chat` — mantém o contrato atual:
- Request: `{ question: string }`
- Response 200: `{ answer: string }`
- Nenhum erro novo além dos já mapeados em `chat.py` (429 rate limit, 500/503 falha do provider)

#### Plano de testes

- Unitário: `backend/tests/test_rag.py` — roteamento por seção (perguntas de formação priorizam chunks `section=education`; perguntas de experiência atual/última priorizam `section=experience` ordenado por `end_date`)
- Integração: `backend/tests/test_chat.py` — suíte de regressão com as perguntas que falhavam e um conjunto de perguntas que já funcionavam (skills, projetos, certificações), para garantir que não regridem
- Mocks necessários: embeddings mockados (não bater na API real da OpenAI em teste automatizado, como já é padrão no projeto)

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: pergunta "onde estudei?" (e variações equivalentes) retorna a formação correta do `resume.json`, validado em teste automatizado
- [x] CA-002: pergunta "qual a última empresa que trabalhei?" / "onde trabalho atualmente?" retorna a experiência mais recente (sem `end_date`, ou a de maior `end_date`), não uma experiência aleatória entre as top-k por similaridade
- [x] CA-003: perguntas de seção única já cobertas hoje (skills, projetos, certificações) mantêm ou melhoram a taxa de acerto pré-existente — sem regressão, validado pela suíte de regressão do plano de testes
- [x] CA-004: a estratégia implementada corresponde à decidida na ADR (`US-11-05`) — sem desvio não registrado

### Fora de escopo
- Busca web (US-11-07)
- Redesign do `ChatWidget` e demais funcionalidades de UX do chat (US-11-01 a US-11-04)
- Banco vetorial — segue fora de escopo (`ADR-003`)

### Dependências
- US-11-05 (ADR do fluxo de RAG v2) — bloqueante

### Épico / Prioridade
RAG (`PRD-011`) — P1

### Tasks
- [x] T01 Implementar roteamento por seção/palavra-chave em `backend/app/rag.py` (detectar intenção de "formação/estudo" → priorizar `section=education`; "empresa/trabalho atual/última" → priorizar `section=experience` ordenado por recência), conforme decisão da ADR-010
- [x] T02 [P] Ajustar `backend/app/chat.py` se a seleção de `relevant_chunks` precisar mudar para usar o novo critério
- [x] T03 Criar suíte de perguntas de regressão em `backend/tests/test_rag.py`/`test_chat.py` cobrindo os casos que falhavam e os que já funcionavam
- [x] T04 [P] Rodar a suíte e registrar taxa de acerto antes/depois no handoff da história

Implementação: `search()` ganhou parâmetros opcionais `section` e `sort_by_recency`; nova `search_with_routing()` detecta intenção por palavra-chave (`detect_section_intent`) e recência (`wants_recency`), normalizando acentos para casar "última"/"ultima". `chat.py` passou a chamar `search_with_routing()` no lugar de `search()`. Taxa de acerto: os dois casos que falhavam ("onde estudei?", "qual a última empresa que trabalhei?") agora retornam o chunk correto em teste automatizado (`test_chat_prioriza_formacao_para_pergunta_onde_estudei`, `test_chat_prioriza_experiencia_recente_para_ultima_empresa`); suíte de regressão para skills/projetos/certificações sem palavra-chave reconhecida mantém o comportamento anterior byte a byte (`test_search_with_routing_sem_palavra_chave_busca_sem_restricao`, `test_chat_sem_palavra_chave_mantem_comportamento_atual_por_similaridade`).

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado pela história (`pytest --cov` → `rag.py` 96%, `chat.py` 100%)
- [x] Build/lint limpo (`ruff check` limpo; `black` aplicado)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR (sem mudança de request/response)
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada (nenhuma mudança de fato na ADR-010 — implementação seguiu a decisão como registrada)
- [x] Deploy/preview verificado — N/A, sem UI nesta história (validação é via `/chat` e testes automatizados)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — falta linha do PO (Fase 6)
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-18 | 18/18 testes de regressão passando (`test_chat_prioriza_formacao_para_pergunta_onde_estudei`, `test_chat_prioriza_experiencia_recente_para_ultima_empresa`, `test_chat_sem_palavra_chave_mantem_comportamento_atual_por_similaridade`); código revisado bate com `ADR-010` seção 1; sem regressão nas perguntas de skills/projetos/certificações. E2E ao vivo não possível neste ambiente (sem `LLM_API_KEY`) — evidência via mocks, suficiente para o risco do projeto |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-18 | `search_with_routing`/`detect_section_intent`/`wants_recency` em `rag.py` reaproveitam o `search()` existente sem quebrar assinatura antiga; `chat.py` troca `search`→`search_with_routing` numa linha, sem duplicar lógica. Sem Critical/High |
| PO | `@product-owner` | Done | 2026-08-18 | CA-001 a CA-004 fechados com evidência de teste; DoD 100% (item de UI N/A justificado); QA/Tech Lead aprovaram |

**Status:** Done
