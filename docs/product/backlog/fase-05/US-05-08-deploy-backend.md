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
- [ ] CA-001: serviço criado no **Render (free tier)** — preferência do [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) — com Root Directory = `backend/`; Cloud Run só como fallback documentado no ADR — **requer ação humana no painel do Render (sem credenciais/token disponíveis para o agente)**
- [ ] CA-002: deploy automático a cada push em `main` — configuração preparada (`autoDeployTrigger: commit` no `render.yaml`), verificação final requer o serviço já criado
- [ ] CA-003: `/health` acessível publicamente — só existe depois do deploy real

### Fora de escopo
- Configuração de domínio customizado

### Dependências
- US-02-02 (esqueleto mínimo viável para publicar) — Done
- [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) (hospedagem gratuita)

### Épico / Prioridade
Deploy — P3

### Tasks
- [x] T01a Preparar config de deploy: [`render.yaml`](../../../../render.yaml) (Blueprint) + passo a passo em [`backend/README.md`](../../../../backend/README.md#deploy)
- [ ] T01b Criar de fato o serviço no painel do Render e confirmar CA-001/002/003 — **ação humana pendente**, ver passo a passo no README

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]` — bloqueado em CA-001/002/003 (ação humana)
- [x] Cobertura de testes ≥ 70% no código tocado — N/A (história de infraestrutura, sem código novo)
- [x] Build/lint limpo — N/A (build do Render, não código do repo)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto (atenção: nenhuma chave commitada na config do serviço) — ver Vereditos (revisão do `render.yaml`/README preparados)
- [x] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto (painel do Render, nunca no repo) — `render.yaml` só declara as chaves das env vars (`LLM_API_KEY`, `ALLOWED_ORIGIN`) com `sync: false`, sem nenhum valor
- [x] Documentação atualizada — passo a passo completo em `backend/README.md` (seção "Deploy")
- [ ] Deploy/preview verificado (UI) — URL pública de `/health` conferida manualmente — **pendente ação humana**
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Bloqueado — não há como validar CA-001/002/003 sem o serviço real criado no Render; config estática (`render.yaml`) inspecionada manualmente, sintaxe conferida contra a doc oficial do Render (`render.com/docs/blueprint-spec`) | 2026-08-04 | `render.yaml` |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas — config e documentação preparadas corretamente, nenhuma chave exposta; ressalva: nome do serviço (`curriculo-online-backend`) é sugestão, e a sintaxe do Blueprint deve ser reconferida no momento real da criação (spec do Render pode evoluir) | 2026-08-04 | `render.yaml`, `backend/README.md` |
| PO | `@product-owner` | Bloqueado — trabalho de configuração/documentação concluído e revisado, mas os 3 CAs exigem criar a conta/serviço no painel do Render, ação exclusiva do dono do produto (sem credenciais compartilhadas com os agentes); DoD não pode fechar 100% até essa ação acontecer | 2026-08-04 | — |

**Status:** Bloqueado (ação humana) — `render.yaml` e passo a passo de deploy prontos e revisados em 2026-08-04, na branch `feature/US-05-01-adr-fluxo-rag`. Falta: dono do produto logar no Render, criar o Blueprint/serviço apontando para este repositório (passo a passo em `backend/README.md`) e confirmar manualmente `GET /health` na URL pública gerada. Assim que isso acontecer, atualizar CA-001/002/003 e DoD para `[x]` e o Status para Done.
