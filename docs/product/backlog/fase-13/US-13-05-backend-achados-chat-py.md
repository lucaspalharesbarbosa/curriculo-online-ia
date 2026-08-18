# US-13-05 — Backend: achados reais do Sonar em `chat.py`

**Fase:** Fase 13 — Qualidade de Engenharia (continuação)
**Épico de origem:** Qualidade de Engenharia (`PRD-007-qualidade-engenharia.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** corrigir os 3 achados reais do Sonar concentrados em `backend/app/chat.py`,
**para** reduzir a dívida de documentação/redundância apontada pela análise estática, com diff mínimo.

### Achados (fonte: `issues/search?componentKeys=lucaspalharesbarbosa_curriculo-online-backend&branch=main`)

| Regra | Severidade | Linha | Mensagem |
|---|---|---|---|
| `python:S8415` | MAJOR | `chat.py:105` | Documentar `HTTPException` de status 500 no parâmetro `responses` da rota |
| `python:S8415` | MAJOR | `chat.py:101` | Documentar `HTTPException` de status 429 no parâmetro `responses` da rota |
| `python:S8409` | MINOR | `chat.py:97` | Remover `response_model` redundante — já coberto pela anotação de tipo de retorno |

### DoR (antes de iniciar) — fechado

- [x] Critérios de aceite escritos e testáveis
- [x] Contrato de API documentado — o contrato de sucesso não muda; só o `responses=` do OpenAPI schema fica mais completo (documentação, não comportamento)
- [x] Mapeamento de erros documentado — `N/A`, não adiciona/muda erro, só documenta os 2 que já existem (500, 429) no schema OpenAPI
- [x] Modelagem de dados — `N/A`
- [x] Plano de testes — suíte existente de `backend/tests/test_chat.py` cobre os cenários 429/500; sem teste novo necessário (mudança é só de metadata/assinatura da rota)
- [x] Épico e dependências — `PRD-007`; sem dependência bloqueante
- [x] ADR — `N/A`, sem lib/stack nova
- [x] Variáveis de ambiente/segredos — `N/A`
- [x] Referência visual — `N/A`
- [x] Protótipo — `N/A`
- [x] Sem dúvida bloqueante

### Critérios de aceite

- [ ] CA-001: rota `/chat` documenta a resposta 429 no `responses=` do decorator, com o schema/mensagem já existente
- [ ] CA-002: rota `/chat` documenta a resposta 500 no `responses=` do decorator
- [ ] CA-003: parâmetro `response_model` removido do decorator de `/chat` (o tipo de retorno da função já é `ChatResponse`, suficiente para o FastAPI inferir o schema)
- [ ] CA-004: nova análise do Sonar em `main` não reporta mais esses 3 achados (verificado via API após merge)
- [ ] CA-005: suíte `backend/tests/test_chat.py` continua verde sem alteração de comportamento

### Fora de escopo
- Qualquer outro achado do backend (tratados em `US-13-04`)
- Mudança no shape de erro (isso é `US-13-02`, história separada e independente)

### Dependências
- Nenhuma

### Épico / Prioridade
Qualidade de Engenharia — P2

### Tasks
- [ ] T01 Adicionar `responses={429: {...}, 500: {...}}` ao decorator `@router.post("/chat", ...)` em `backend/app/chat.py`, reaproveitando `RATE_LIMIT_MESSAGE`/`GENERIC_ERROR_MESSAGE` já existentes como exemplo de schema
- [ ] T02 [P] Remover `response_model=ChatResponse` do mesmo decorator
- [ ] T03 Rodar `pytest -q` e `ruff check .` para confirmar sem regressão

### DoD (antes de concluir) — precisa estar 100% fechado para Done
- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — sem lógica nova, `N/A`
- [ ] Build/lint limpo (`ruff check`, `black --check`)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API bate com o documentado — sim, só adiciona metadata
- [ ] Sem chave/secret exposto
- [ ] Documentação atualizada — `N/A`, mudança é a própria documentação (OpenAPI)
- [ ] Deploy/preview verificado — `N/A`
- [ ] Vereditos de QA, Tech Lead e PO documentados abaixo
- [ ] Status atualizado no arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
