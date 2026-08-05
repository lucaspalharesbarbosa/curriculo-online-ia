# US-05-07 — Segurança do /chat

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R08

**Como** dono do produto,
**quero** que o endpoint `/chat` tenha CORS restrito, chave de API protegida e rate limit básico,
**para** evitar abuso e vazamento de credenciais.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (não cria endpoint novo; ajusta middleware/CORS e adiciona rate limit ao redor do contrato `POST /chat` já documentado em [US-05-04](US-05-04-endpoint-chat.md), sem mudar request/response)
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — RAG; depende de US-05-04 (ainda não implementada) — DoR fechado agora para não travar o início
- [x] ADR registrado se envolve decisão de stack nova — N/A: a origem permitida de CORS e a chave de API já estão decididas no [ADR-003](../../../architecture/ADR-003-fluxo-rag.md) seção 5; a biblioteca de rate limit (ex.: `slowapi` ou contador simples em memória) é detalhe de implementação de middleware padrão do FastAPI, não decisão estratégica de vendor/stack — não exige ADR próprio
- [x] Variáveis de ambiente/segredos necessários identificados — `LLM_API_KEY` (já identificada em US-05-03/US-05-04); `ALLOWED_ORIGIN` (nova — origem permitida de CORS: `http://localhost:3000` em dev, URL de produção do frontend na Vercel em produção)
- [x] Referência visual definida — N/A (sem UI)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário/integração: extensão de `backend/tests/test_chat.py` — request de origem não permitida é rejeitado pelo CORS; N+1ª request dentro da janela de rate limit retorna `429`
- Mocks necessários: nenhum adicional além dos já usados em US-05-04/US-05-06

### Critérios de aceite — precisam estar 100% fechados para Done
- [ ] CA-001: CORS restrito à origem do frontend em produção
- [ ] CA-002: chave de API de LLM/embeddings só existe como variável de ambiente no backend, nunca no client
- [ ] CA-003: rate limit básico por IP/sessão no `/chat`

### Fora de escopo
- WAF ou infra de segurança avançada — fora de proporção para o projeto

### Dependências
- US-05-04

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 Configurar CORS em `backend/app/main.py`
- [ ] T02 Rate limit básico no `/chat`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado (`pytest --cov`)
- [ ] Build/lint limpo (`ruff check`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto (atenção especial: CORS e vazamento de chave)
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [ ] Sem chave de API/secret exposto (client bundle ou repo)
- [ ] Documentação atualizada — registrar a lib de rate limit escolhida (se houver) no README do backend
- [ ] Deploy/preview verificado — N/A (validação de CORS/rate limit em produção depende de US-05-08 já estar no ar)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Blocked — aguarda US-05-04 (implementação). DoR fechado em 2026-08-04; pronta para "Ready for Agent" assim que US-05-04 concluir.
