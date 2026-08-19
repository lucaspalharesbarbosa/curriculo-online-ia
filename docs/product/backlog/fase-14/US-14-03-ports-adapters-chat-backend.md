# US-14-03 — Ports & Adapters no domínio chat do backend

**Fase:** Fase 14 — Arquitetura & Modularização
**Épico de origem:** Arquitetura & Modularização (`PRD-012-arquitetura-modularizacao.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** desacoplar `backend/app/chat/` dos SDKs externos (OpenAI, Tavily) via interfaces (ports) e implementações (adapters),
**para** testar a orquestração do chat sem mockar SDK e trocar de provider editando só um adapter, sem mudar `service.py`/`router.py`.

### DoR (antes de iniciar) — fechado

- [x] Critérios de aceite escritos e testáveis
- [x] Contrato de API documentado — `N/A`, `POST /chat` e `POST /chat/feedback` mantêm request/response idênticos; só a implementação interna muda
- [x] Mapeamento de erros documentado — `N/A`, mesmos erros já mapeados (`OpenAIError` → 500/503 via `_http_error_from_openai`), só muda de onde a exceção é capturada
- [x] Modelagem de dados — `N/A`
- [x] Plano de testes — ver subseção abaixo
- [x] Épico e dependências — `PRD-012`; depende de `ADR-012` (Aceita) e `US-14-01` (Done)
- [x] ADR registrado — sim, `ADR-012-clean-architecture-chat.md` (Aceita)
- [x] Variáveis de ambiente/segredos — `N/A`, mesmas (`LLM_API_KEY`, `WEB_SEARCH_API_KEY`), só o ponto de leitura muda de módulo
- [x] Referência visual — `N/A`
- [x] Protótipo — `N/A`
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `service.py` (use case) testado com fakes de `EmbeddingProvider`/`ChatCompletionProvider`/`WebSearchProvider` (`Protocol`), sem tocar `openai`/`httpx`; `rag.py` (chunking/ranking/roteamento) recebe `EmbeddingProvider` como parâmetro em vez de chamar `get_client()` direto — mesmos casos de `test_rag.py` hoje, só trocando o mock por fake de port
- Integração: `TestClient` do FastAPI em `test_chat.py` continua cobrindo `/chat`/`/chat/feedback` fim a fim, agora com adapters reais substituídos por fakes via `Depends()` override (padrão já suportado pelo FastAPI)
- Mocks necessários: fakes de `EmbeddingProvider`, `ChatCompletionProvider`, `WebSearchProvider` — substituem os `monkeypatch` de `rag.get_client`/`web_search.search_web` usados hoje em `test_chat.py`, `test_rag.py`, `test_web_search.py`
- Critério de sucesso: `pytest` com o mesmo número (ou mais, se algum caso de port ganhar teste próprio) de testes passando; nenhum teste bate na API real da OpenAI/Tavily (já é a regra do projeto)

### Critérios de aceite

- [x] CA-001: `backend/app/chat/ports.py` criado com `Protocol` para `EmbeddingProvider` (método equivalente a `embed_text`), `ChatCompletionProvider` (método equivalente a `chat.completions.create` usado em `_generate_answer`/`_generate_web_answer`) e `WebSearchProvider` (método equivalente a `search_web`)
- [x] CA-002: `backend/app/chat/adapters/openai_adapter.py` criado, implementando `EmbeddingProvider` e `ChatCompletionProvider` com `openai.OpenAI` (mesma config de timeout/retry hoje em `rag.get_client()`)
- [x] CA-003: `backend/app/chat/adapters/tavily_adapter.py` criado, implementando `WebSearchProvider` com a mesma lógica hoje em `web_search.py` (`search_web`/`_extract_context`), incluindo o contrato de retornar `None` em qualquer falha
- [x] CA-004: `backend/app/chat/service.py` criado — extrai a orquestração pergunta→resposta hoje inline em `router.py` (`chat()`: rate limit, busca local, fallback web, geração de resposta), recebendo os três ports como dependência
- [x] CA-005: `rag.py` para de chamar `get_client()`/`embed_text()` direto nas funções de busca — recebe `EmbeddingProvider` como parâmetro (chunking e algoritmo de ranking/roteamento do `ADR-010` continuam idênticos, só a fonte do embedding muda)
- [x] CA-006: `router.py` vira só a camada HTTP — recebe as dependências via `Depends()`, delega a `service.py`, mantém rate limit e mapeamento de exceção→`HTTPException`
- [x] CA-007: `web_search.py` como módulo solto é removido — conteúdo migrado para `adapters/tavily_adapter.py` (CA-003); nenhum import quebrado
- [x] CA-008: `backend/tests/chat/` atualizado — `test_rag.py`, `test_chat.py`, `test_web_search.py` (ou renomeado/mesclado conforme a estrutura nova) usando fakes de port em vez de monkeypatch de SDK
- [x] CA-009: contrato de `POST /chat` e `POST /chat/feedback` (request/response, status codes, mensagens de erro) idêntico ao atual — nenhuma mudança observável para o cliente
- [x] CA-010: `pytest` roda 100% verde, com cobertura mantida ou superior à baseline atual do módulo `chat`
- [x] CA-011: `docs/agents/CONTEXTO-PROJETO.md` (seção "Estrutura — monorepo") atualizado com a árvore nova de `backend/app/chat/`

### Fora de escopo
- Qualquer mudança de comportamento observável do `/chat`/`/chat/feedback` (algoritmo de ranking, roteamento, prompts, rate limit)
- Aplicar ports/adapters a `backend/app/resume/` — sem I/O externo, ver `ADR-012`
- Construir ports para `admin`/observabilidade — `ADR-012` registra a convenção, não abre trabalho aqui
- Framework de DI externo — usa só `Depends()` do FastAPI
- Modularização do frontend — `US-14-02`/`US-14-04`, histórias separadas

### Dependências
- `ADR-012-clean-architecture-chat.md` (Aceita)
- `US-14-01-modularizacao-backend-dominio.md` (Done)

### Épico / Prioridade
Arquitetura & Modularização — P2

### Tasks
- [x] T01 Criar `backend/app/chat/ports.py` com os três `Protocol` (CA-001)
- [x] T02 [P] Criar `backend/app/chat/adapters/openai_adapter.py` (CA-002)
- [x] T03 [P] Criar `backend/app/chat/adapters/tavily_adapter.py`, remover `web_search.py` (CA-003, CA-007)
- [x] T04 Criar `backend/app/chat/service.py`, mover orquestração de `router.py` (CA-004)
- [x] T05 Ajustar `rag.py` para receber `EmbeddingProvider` por parâmetro (CA-005)
- [x] T06 Reduzir `router.py` à camada HTTP, ligar `Depends()` aos adapters (CA-006)
- [x] T07 Reescrever testes de `backend/tests/chat/` com fakes de port (CA-008)
- [x] T08 Rodar `pytest`, `pytest --cov`, `ruff check`, confirmar contrato de API inalterado (CA-009, CA-010)
- [x] T09 Atualizar `docs/agents/CONTEXTO-PROJETO.md` (CA-011)

### DoD (antes de concluir) — precisa estar 100% fechado para Done
- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — mantida ou superior à baseline do módulo `chat` (97,57% total, módulo `chat` 96-100% por arquivo — ver relatório de entrega)
- [x] Build/lint limpo (`ruff check`)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API bate com o documentado — sim, idêntico (CA-009, confirmado via `TestClient` e smoke manual com `uvicorn` local)
- [x] Sem chave/secret exposto
- [x] Documentação atualizada — `CONTEXTO-PROJETO.md` (CA-011)
- [ ] Deploy/preview verificado — smoke test de `/chat` e `/chat/feedback` real (local ou preview) confirmando resposta idêntica — smoke local feito (contrato/status codes), falta verificação em preview/produção real com `LLM_API_KEY` válida
- [ ] Vereditos de QA, Tech Lead e PO documentados abaixo
- [x] Status atualizado no arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** In Progress
