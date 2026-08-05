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
- [ ] CA-001: serviço criado no **Render (free tier)** — preferência do [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) — com Root Directory = `backend/`; Cloud Run só como fallback documentado no ADR
- [ ] CA-002: deploy automático a cada push em `main`
- [ ] CA-003: `/health` acessível publicamente

### Fora de escopo
- Configuração de domínio customizado

### Dependências
- US-02-02 (esqueleto mínimo viável para publicar) — Done
- [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) (hospedagem gratuita)

### Épico / Prioridade
Deploy — P3

### Tasks
- [ ] T01 Criar serviço no Render/Cloud Run apontando para `backend/`

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — N/A (história de infraestrutura, sem código novo)
- [ ] Build/lint limpo — N/A (build do Render, não código do repo)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto (atenção: nenhuma chave commitada na config do serviço)
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [ ] Sem chave de API/secret exposto (painel do Render, nunca no repo)
- [ ] Documentação atualizada — passo a passo de configuração do serviço documentado (pode reaproveitar/alimentar US-05-09)
- [ ] Deploy/preview verificado (UI) — URL pública de `/health` conferida manualmente
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent — DoR fechado em 2026-08-04; dependências (US-02-02, ADR-002) já Done. Pode ser feita em paralelo às demais histórias da Fase 05, já que só depende do esqueleto do FastAPI, não do RAG completo.
