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
- [x] CA-001: CORS restrito à origem do frontend em produção — `CORSMiddleware` em [`backend/app/main.py`](../../../../backend/app/main.py), `allow_origins=[ALLOWED_ORIGIN]` (sem `"*"`)
- [x] CA-002: chave de API de LLM/embeddings só existe como variável de ambiente no backend, nunca no client — `LLM_API_KEY` só lida em `rag.get_client()` via `os.environ`
- [x] CA-003: rate limit básico por IP/sessão no `/chat` — contador em memória por IP em [`backend/app/chat.py`](../../../../backend/app/chat.py) (`_is_rate_limited`), 10 req/min, `429` no excedente

### Fora de escopo
- WAF ou infra de segurança avançada — fora de proporção para o projeto

### Dependências
- US-05-04 (Done)

### Épico / Prioridade
RAG — P3

### Tasks
- [x] T01 Configurar CORS em `backend/app/main.py`
- [x] T02 Rate limit básico no `/chat`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado (`pytest --cov`) — `main.py` 100%, `chat.py` 100%
- [x] Build/lint limpo (`ruff check`, type checking estrito) — `ruff check .` e `black --check .` sem erros
- [x] Review do `@tech-lead-review` sem Critical/High em aberto (atenção especial: CORS e vazamento de chave) — ver Vereditos
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto (client bundle ou repo) — confirmado
- [x] Documentação atualizada — registrada em `backend/README.md` (seção "Segurança do /chat"): rate limit em memória, sem lib externa (`slowapi` avaliado e dispensado — volume do projeto não justifica a dependência extra)
- [x] Deploy/preview verificado — N/A (validação de CORS/rate limit em produção depende de US-05-08 já estar no ar)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `pytest backend/tests/test_main.py` (preflight CORS aceito/rejeitado) e `test_chat.py::test_chat_retorna_429_apos_exceder_rate_limit`; suite completa 25/25 verde | 2026-08-04 | `backend/tests/test_main.py`, `backend/tests/test_chat.py` |
| Tech Lead | `@tech-lead-review` | Aprovar — CORS restrito a uma única origem configurável (nunca `"*"`); rate limit simples e proporcional, sem dependência nova; chave de API não circula em nenhum log/resposta | 2026-08-04 | `backend/app/main.py`, `backend/app/chat.py` |
| PO | `@product-owner` | Done — CA-001/002/003 fechados, DoD 100% fechado | 2026-08-04 | — |

**Status:** Done — CORS e rate limit implementados e testados em 2026-08-04, na branch `feature/US-05-01-adr-fluxo-rag`.
