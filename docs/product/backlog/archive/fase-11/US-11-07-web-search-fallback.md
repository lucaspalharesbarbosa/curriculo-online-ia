# US-11-07 — Web search fallback para dados externos (empresas, instituições, cursos, certificados, habilidades)

**Fase:** Fase 11 — Chat v2 + RAG Inteligente
**Épico de origem:** RAG (`PRD-011-rag-inteligente.md`)

**Como** visitante/recrutador,
**quero** que o assistente busque na web dados públicos sobre empresas, instituições de ensino, cursos, certificados e habilidades citados no currículo, quando eu perguntar algo que o currículo sozinho não responde,
**para** ter mais contexto sobre a trajetória do autor sem sair do chat.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado (ver subseção abaixo — `/chat` ganha campo de resposta opcional `source`)
- [x] Mapeamento de erros documentado (ver subseção abaixo)
- [x] Modelagem de dados documentada — N/A, sem entidade nova/persistida
- [x] Plano de testes definido (ver subseção abaixo)
- [x] Épico e dependências identificados — RAG (`PRD-011`); depende de **US-11-05** (ADR, Done) e da base de `rag.py` de **US-11-06**
- [x] ADR registrado se envolve decisão de stack nova — [ADR-010](../../../architecture/ADR-010-fluxo-rag-v2-precisao-web.md), seção 2 (provider Tavily, gatilho, contrato, resiliência)
- [x] Variáveis de ambiente/segredos necessários identificados — `WEB_SEARCH_API_KEY` (decidido em `ADR-010`), documentar em `.env.example`
- [x] Referência visual definida — N/A para o mecanismo de busca; o `ChatWidget` só precisa exibir a sinalização textual de fonte quando `source: "web"` (sem tela nova, direção: texto discreto tipo "informação pública sobre a empresa, não do currículo")
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Contrato de API

`POST /chat` — request inalterado; response ganha campo opcional para transparência de fonte:
- Request: `{ question: string }`
- Response 200: `{ answer: string, source: "resume" | "web" }` (campo `source` conforme decidido na ADR-010; se a ADR decidir outro formato, este contrato é atualizado antes do código)
- Mapeamento de erros:

| Exceção/causa | Código HTTP | Body do erro | Mensagem |
|---|---|---|---|
| Falha/timeout do provedor de busca web | — (não propaga erro HTTP) | — | `/chat` cai no comportamento atual (resposta só com contexto do currículo, ou `FALLBACK_ANSWER`) — falha da busca web nunca quebra a requisição |
| `ValidationError` (Pydantic) no request | 422 | `{ "detail": [...] }` | erro padrão do FastAPI (já existente, sem mudança) |

#### Plano de testes

- Unitário: `backend/tests/test_web_search.py` — cliente de busca web mockado (nunca bater no serviço real em teste automatizado)
- Integração: `backend/tests/test_chat.py` — acionamento condicional (entidade externa citada + RAG local insuficiente), não-acionamento fora de escopo, fallback gracioso em caso de erro do provedor
- Mocks necessários: mock do provedor de busca web decidido na ADR-010

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: quando a pergunta cita uma entidade externa presente no currículo (empresa, instituição, curso, certificado, habilidade) e a busca local (`rag.search()`) fica abaixo do `SIMILARITY_THRESHOLD`, o assistente aciona a busca web e usa o resultado na resposta
- [x] CA-002: quando a busca web falha, dá timeout ou está indisponível, o `/chat` volta ao comportamento atual (resposta baseada só no currículo ou `FALLBACK_ANSWER`), sem erro 5xx para o cliente
- [x] CA-003: resposta que usa dado externo sinaliza a fonte de forma transparente (campo `source: "web"` e/ou texto na própria resposta, conforme decidido na ADR-010)
- [x] CA-004: perguntas que não citam nenhuma entidade do `resume.json` **não** acionam busca web — o assistente mantém o fallback atual (não vira agente de busca genérico)
- [x] CA-005: chamada de busca web tem timeout curto documentado e testado (não trava o único worker do Render free tier — mesmo cuidado do `ADR-004`)

### Fora de escopo
- Navegação multi-hop / agente autônomo de pesquisa (1 chamada de busca por pergunta, sem encadeamento)
- Persistência de histórico de buscas web
- Redesign do `ChatWidget` (US-11-01) — esta história só precisa do texto de atribuição de fonte, não de UI nova

### Dependências
- US-11-05 (ADR do fluxo de RAG v2) — bloqueante
- US-11-06 (roteamento por seção/recência) — mesma base de código em `rag.py`/`chat.py`

### Épico / Prioridade
RAG (`PRD-011`) — P2

### Tasks
- [x] T01 Implementar cliente de busca web em `backend/app/web_search.py`, conforme provedor decidido na ADR-010, com timeout curto e tratamento de erro que nunca propaga para o request
- [x] T02 [P] Integrar acionamento condicional em `backend/app/chat.py` (RAG local insuficiente + entidade externa reconhecida no `resume.json`)
- [x] T03 Atualizar `SYSTEM_PROMPT`/instrução de geração para citar a fonte quando usar dado externo (`WEB_SYSTEM_PROMPT` dedicado)
- [x] T04 [P] Testes com mock do serviço de busca (`backend/tests/test_web_search.py`, `test_chat.py`) cobrindo acionamento, fallback de erro e não-acionamento fora de escopo
- [x] T05 Atualizar `.env.example` e documentação de segredos com a nova variável de ambiente

**Nota:** `WEB_SEARCH_API_KEY` foi adicionada a `backend/.env.example` diretamente pelo autor em 2026-08-18 — o bloqueio original era de permissão do ambiente do `@senior-developer`/`@tech-lead-review` (regra global do usuário que nega `Read`/`Edit` em qualquer `.env*`, deliberada para todos os projetos), não do código. `web_search.py`/`chat.py` já liam a variável via `os.environ.get` com fallback gracioso desde a implementação — só faltava a documentação, agora resolvida. Ainda falta configurar o valor real no painel do Render antes do deploy em produção (fora do escopo desta história, é passo de deploy).

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado pela história (`pytest --cov` → `web_search.py` 97%, `chat.py` 100%)
- [x] Build/lint limpo (`ruff check` limpo; `black` aplicado)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR (`source` aditivo, default `"resume"`)
- [x] Sem chave de API/secret exposto (client bundle ou repo)
- [x] Documentação atualizada (`.env.example` — `WEB_SEARCH_API_KEY` adicionada pelo autor em 2026-08-18)
- [x] Deploy/preview verificado — N/A, sem UI nesta história (validação é via `/chat` e testes automatizados)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-08-18 | Código (`web_search.py`, `chat.py`) bate com `ADR-010` seção 2 — gatilho por entidade+threshold, timeout 8s sem retry, fallback gracioso, campo `source` aditivo confirmados por leitura + 7 testes com mock do Tavily passando (timeout, erro HTTP, JSON inválido, sem API key). Ressalva restante: sem E2E ao vivo contra o Tavily real (sem chave configurada no ambiente de QA); `.env.example` foi resolvido pelo autor após este veredito, ver nota da T05 |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-18 | `web_search.py` nunca propaga exceção (todas as branches de erro retornam `None`), timeout explícito de 8s confirmado no código; `WEB_SEARCH_API_KEY` só lida via `os.environ.get` no backend, nunca exposta ao client. Sem Critical/High — `.env.example` já resolvido pelo autor |
| PO | `@product-owner` | Done | 2026-08-18 | CA-001 a CA-005 fechados; DoD 100% (`.env.example` resolvido pelo autor); ressalva de QA (sem E2E ao vivo) aceita como risco baixo — `/chat` já degrada graciosamente sem `WEB_SEARCH_API_KEY` configurada |

**Status:** Done
