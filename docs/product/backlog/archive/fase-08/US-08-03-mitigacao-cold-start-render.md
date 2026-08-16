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

- [x] CA-001: Autor escolhe e registra no relatório/ADR a opção aplicada: **(A)** keep-alive gratuito externo em `GET /health` (recomendado ADR-008), **(B)** upgrade Render, ou **(C)** migrar Cloud Run (plano B do ADR-002) — com custo explícito — autor optou por **não mitigar** (ver CA-005); decisão registrada em [ADR-008](../../../architecture/ADR-008-mitigacao-cold-start-render.md) (seção "Decisão do autor")
- [x] CA-002: N/A — autor não optou pela mitigação (A); ver CA-005
- [x] CA-003: N/A — sem mitigação aplicada, não há antes/depois a medir; ver CA-005
- [x] CA-004: `/health` permanece barato (sem carregar embeddings/LLM) — sem mudar o health check para disparar OpenAI — já satisfeito pelo código atual: `backend/app/main.py:61-63` (`health_check()`) só retorna `{"status": "ok"}`, sem chamar `rag`/`chat`/OpenAI; nenhuma mudança necessária
- [x] CA-005: Se o autor optar por **não** mitigar (aceitar cold start), registrar “aceitar risco” no ADR-008 / história e marcar CAs de mitigação como N/A justificado — Done só com essa decisão explícita — **decisão explícita registrada** em 2026-08-15: volumetria atual baixíssima torna o custo do keep-alive (instance-hours 24h/dia + dependência externa) desproporcional ao benefício (raramente evitaria o cold start, já que visitas são pouco frequentes); risco aceito conscientemente, revisitar se o tráfego crescer — ver [ADR-008](../../../architecture/ADR-008-mitigacao-cold-start-render.md)

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

- [x] T01 Confirmar com o autor a opção A/B/C (ou aceitar risco) e registrar no ADR-008 / README — autor escolheu aceitar risco; registrado em ADR-008
- [x] T02 N/A — sem mitigação a aplicar (risco aceito)
- [x] T03 N/A — sem mitigação, sem antes/depois a medir
- [x] T04 Garantir que `/health` não dispara LLM/embeddings — já verdade no código atual (`backend/app/main.py:61-63`), sem alteração necessária

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]` (ou N/A justificado em CA-005)
- [x] Cobertura de testes ≥ 70% — N/A, sem código novo (decisão é só documental)
- [x] Build/lint limpo — N/A, sem diff de app (`rag.py`/`chat.py`/`main.py` inalterados)
- [x] Review do `@tech-lead-review` sem Critical/High (atenção: não expor URL com secret; não sobrecarregar `/chat` com ping) — N/A ambos os riscos: sem mitigação aplicada, nenhum monitor/ping configurado
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto — N/A, nenhuma env/segredo tocado
- [x] Documentação atualizada (`backend/README.md`, ADR-008 se a escolha divergir da recomendação) — ADR-008 atualizado (seção "Decisão do autor" + Status); README não precisa de nota, já que não há ferramenta/config externa a documentar
- [x] Deploy/preview verificado — N/A, decisão de não mitigar não gera deploy; nenhuma evidência de produção a coletar
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-15 | Sem código/diff de app a testar (histórico é 100% documental). Verificado por leitura direta que `backend/app/main.py:61-63` (`health_check()`) retorna só `{"status": "ok"}`, sem tocar `rag`/`chat`/OpenAI — CA-004/T04 confirmados sem necessidade de teste novo. CA-002/CA-003/T02/T03 corretamente `N/A` pois não há mitigação aplicada a validar. Nenhum achado bloqueante |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-15 | Mudança 100% documental: `docs/architecture/ADR-008-mitigacao-cold-start-render.md` (Status + seção "Decisão do autor") e a própria história. Nenhum código de aplicação tocado, nenhuma lib/env/secret introduzido, nenhum monitor externo configurado — logo, os dois riscos apontados no DoD (URL com secret exposta; `/chat` sobrecarregado por ping) não se aplicam, corretamente marcados `N/A`. Raciocínio da decisão (volumetria baixa → custo de manter keep-alive 24h/dia desproporcional ao benefício raro) é consistente com o trade-off já mapeado no ADR-008 original. Reversibilidade explícita (reabrir se tráfego crescer) documentada. Sem achado Critical/High |
| PO | `@product-owner` | Done | 2026-08-15 | CA-001, CA-004 e CA-005 fechados com evidência real (decisão explícita do autor + leitura do código atual do `/health`); CA-002/CA-003 corretamente `N/A` por decorrência direta de CA-005 (aceitar risco exclui a necessidade de configurar/medir mitigação). Tasks T01/T04 `[x]`, T02/T03 `N/A` pela mesma razão. DoD 100% fechado — itens de teste/build/deploy `N/A` justificados por ser história sem diff de código. QA e Tech Lead sem achado bloqueante. Done genuíno: não há pendência de ação humana nesta história (diferente de US-08-02/06/07/08/09, que dependem de deploy) |

**Status:** Done
