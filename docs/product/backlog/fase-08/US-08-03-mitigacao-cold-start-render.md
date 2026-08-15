# US-08-03 — Mitigação de cold start do backend (Render free)

**Fase:** Fase 08 — Segurança & Performance
**Épico de origem:** Segurança & Performance (`PRD-006-seguranca-performance.md`)

**Como** visitante/recrutador,
**quero** que a primeira mensagem do assistente não espere dezenas de segundos por hibernação do free tier,
**para** demonstrar o RAG sem “site travado” na primeira pergunta.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (não altera contrato do `/chat`; usa `GET /health` já existente)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Segurança & Performance; [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md), [ADR-008](../../../architecture/ADR-008-mitigacao-cold-start-render.md)
- [x] ADR registrado se envolve decisão de stack nova — [ADR-008](../../../architecture/ADR-008-mitigacao-cold-start-render.md) (estratégia de keep-alive gratuito vs upgrade / Cloud Run)
- [x] Variáveis de ambiente/segredos necessários identificados — URL pública do backend já conhecida no Render; se keep-alive externo, **sem** secret no repo (config só no painel do monitor). Sem nova env obrigatória na app
- [x] Referência visual definida — N/A
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante — **decisão de custo do autor** é CA (gratuito vs pago); ADR-008 recomenda o caminho free default

#### Plano de testes

- Unitário: N/A se a mitigação for só config externa (UptimeRobot / cron HTTP)
- Manual: medir latência do primeiro `GET /health` após ~20 min idle (antes/depois); smoke `POST /chat` após idle
- Se houver endpoint/cron no monorepo: teste do script/rota cobrindo 200 em `/health`
- Mocks: N/A para monitor externo

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: Autor escolhe e registra no relatório/ADR a opção aplicada: **(A)** keep-alive gratuito externo em `GET /health` (recomendado ADR-008), **(B)** upgrade Render, ou **(C)** migrar Cloud Run (plano B do ADR-002) — com custo explícito
- [ ] CA-002: Mitigação **(A)** configurada: ping periódico a `/health` com intervalo **&lt; 14 min** (abaixo do spin-down típico ~15 min do Render free), documentado em `backend/README.md` (ferramenta, URL, intervalo — sem credenciais)
- [ ] CA-003: Evidência de melhoria: latência do primeiro hit após idle documentada (antes vs depois) **ou**, se (B)/(C), smoke pós-migração do `/chat`
- [ ] CA-004: `/health` permanece barato (sem carregar embeddings/LLM) — sem mudar o health check para disparar OpenAI
- [ ] CA-005: Se o autor optar por **não** mitigar (aceitar cold start), registrar “aceitar risco” no ADR-008 / história e marcar CAs de mitigação como N/A justificado — Done só com essa decisão explícita

### Fora de escopo

- Reescrever o RAG ou aumentar hardware além do escolhido em CA-001
- WAF / CDN
- Cache de respostas do `/chat` (`ADR-004`)
- Timeout OpenAI (US-08-02) — paralelo, não substituto

### Dependências

- [ADR-008](../../../architecture/ADR-008-mitigacao-cold-start-render.md)
- [ADR-002](../../../architecture/ADR-002-hospedagem-gratuita.md) (Render free + Cloud Run como plano B)
- `GET /health` já em `backend/app/main.py` / `render.yaml` (`healthCheckPath`)

### Épico / Prioridade

Segurança & Performance — P2

### Tasks

- [ ] T01 Confirmar com o autor a opção A/B/C (ou aceitar risco) e registrar no ADR-008 / README
- [ ] T02 Aplicar a opção escolhida (config externa keep-alive **ou** passos de upgrade/migração documentados)
- [ ] T03 Medir e documentar latência pós-idle (ou smoke pós-migração) em `backend/README.md` ou `docs/qa/`
- [ ] T04 Garantir que `/health` não dispara LLM/embeddings

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]` (ou N/A justificado em CA-005)
- [ ] Cobertura de testes ≥ 70% — N/A se só config externa; se código no repo, `pytest` no escopo
- [ ] Build/lint limpo — N/A se sem diff de app; senão `ruff`/`black`
- [ ] Review do `@tech-lead-review` sem Critical/High (atenção: não expor URL com secret; não sobrecarregar `/chat` com ping)
- [ ] Contrato de API — N/A
- [ ] Sem chave de API/secret exposto
- [ ] Documentação atualizada (`backend/README.md`, ADR-008 se a escolha divergir da recomendação)
- [ ] Deploy/preview verificado — evidência de latência ou smoke em produção
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
