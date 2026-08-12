# US-05-08 — Deploy do backend no Render/Cloud Run

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** Deploy (`PRD-004-deploy.md`) — ex-US-D04

**Como** dono do produto,
**quero** o backend publicado,
**para** o `ChatWidget` conseguir chamar o `/chat` em produção.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (história de infraestrutura/deploy, não de contrato de endpoint)
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Deploy; depende de US-02-02 (Done — esqueleto FastAPI com `/health`) e [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) (Aceita) — sem bloqueio; independente do RAG estar completo, pois só publica o esqueleto atual do backend
- [x] ADR registrado se envolve decisão de stack nova — [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) já decide Render (preferência) com Cloud Run como fallback
- [x] Variáveis de ambiente/segredos necessários identificados — nenhuma obrigatória para este primeiro deploy (só expõe `/health`); `LLM_API_KEY` (e as demais de US-05-07/US-05-09) precisam estar configuradas no painel do Render **antes** de qualquer deploy subsequente que já inclua `/chat`
- [x] Referência visual definida — N/A (sem UI)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Smoke manual (obrigatório para aceite): `GET /health` acessível publicamente na URL do Render, retorna `200 {"status": "ok"}`; push em `main` dispara novo deploy automaticamente (CA-002)
- Unitário/integração: N/A (história de infraestrutura)
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done
- [x] CA-001: serviço criado no **Render (free tier)** — preferência do [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) — com Root Directory = `backend/`; Cloud Run só como fallback documentado no ADR — feito pelo dono do produto no painel do Render em 2026-08-05 (`curriculo-online-backend`)
- [x] CA-002: deploy automático a cada push em `main` — `autoDeployTrigger: commit` no `render.yaml` confirmado ao criar o Blueprint no painel; comportamento padrão da Vercel/Render ao conectar repositório (mesmo padrão já observado na US-03-17)
- [x] CA-003: `/health` acessível publicamente — smoke confirmado 2026-08-05: `GET https://curriculo-online-backend.onrender.com/health` → `200 {"status":"ok"}`

### Fora de escopo
- Configuração de domínio customizado

### Dependências
- US-02-02 (esqueleto mínimo viável para publicar) — Done
- [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) (hospedagem gratuita)

### Épico / Prioridade
Deploy — P3

### Tasks
- [x] T01a Preparar config de deploy: [`render.yaml`](../../../../render.yaml) (Blueprint) + passo a passo em [`backend/README.md`](../../../../backend/README.md#deploy)
- [x] T01b Criar de fato o serviço no painel do Render e confirmar CA-001/002/003 — feito pelo dono do produto em 2026-08-05

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — N/A (história de infraestrutura, sem código novo)
- [x] Build/lint limpo — N/A (build do Render, não código do repo)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto (atenção: nenhuma chave commitada na config do serviço) — ver Vereditos (revisão do `render.yaml`/README preparados)
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto (painel do Render, nunca no repo) — `render.yaml` só declara as chaves das env vars (`LLM_API_KEY`, `ALLOWED_ORIGIN`) com `sync: false`, sem nenhum valor
- [x] Documentação atualizada — passo a passo completo em `backend/README.md` (seção "Deploy")
- [x] Deploy/preview verificado (UI) — URL pública de `/health` conferida: `https://curriculo-online-backend.onrender.com/health` → `200 {"status":"ok"}` (2026-08-05)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Bloqueado — não há como validar CA-001/002/003 sem o serviço real criado no Render; config estática (`render.yaml`) inspecionada manualmente, sintaxe conferida contra a doc oficial do Render (`render.com/docs/blueprint-spec`) | 2026-08-04 | `render.yaml` |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas — config e documentação preparadas corretamente, nenhuma chave exposta; ressalva: nome do serviço (`curriculo-online-backend`) é sugestão, e a sintaxe do Blueprint deve ser reconferida no momento real da criação (spec do Render pode evoluir) | 2026-08-04 | `render.yaml`, `backend/README.md` |
| PO | `@product-owner` | Bloqueado — trabalho de configuração/documentação concluído e revisado, mas os 3 CAs exigem criar a conta/serviço no painel do Render, ação exclusiva do dono do produto (sem credenciais compartilhadas com os agentes); DoD não pode fechar 100% até essa ação acontecer | 2026-08-04 | — |
| QA (revalidação) | `@qa-engineer` | Aprovado — dono do produto criou o serviço no Render (Blueprint); smoke `GET https://curriculo-online-backend.onrender.com/health` retornou `200 {"status":"ok"}` (verificado via `curl`, tempo de resposta ~0.5s — sem cold start no momento do teste) | 2026-08-05 | `https://curriculo-online-backend.onrender.com/health` |
| Tech Lead (revalidação) | `@tech-lead-review` | Aprovar — ressalva da revisão anterior (reconferir sintaxe do Blueprint no momento real da criação) resolvida: serviço subiu sem ajuste na config; `render.yaml` e `backend/README.md` seguem sem chave exposta | 2026-08-05 | `render.yaml` |
| PO | `@product-owner` | Done — CA-001/002/003 e DoD 100% fechados após confirmação humana do deploy e smoke do `/health` | 2026-08-05 | `https://curriculo-online-backend.onrender.com` |

**Status:** Done — serviço criado no Render (`curriculo-online-backend`), deploy automático configurado (`autoDeployTrigger: commit`) e `GET /health` confirmado publicamente em 2026-08-05 (`https://curriculo-online-backend.onrender.com/health` → `200 {"status":"ok"}`). `LLM_API_KEY` e `ALLOWED_ORIGIN` devem estar preenchidos no painel do Render (ver US-05-09) para o `/chat` funcionar em produção quando ele existir.
