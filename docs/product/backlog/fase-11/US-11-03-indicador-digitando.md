# US-11-03 — Indicador de "digitando" no ChatWidget

**Fase:** Fase 11 — Chat v2 + RAG Inteligente
**Épico de origem:** Chat v2 (`PRD-009-chat-v2.md`)

**Como** visitante/recrutador,
**quero** ver um indicador de "digitando" enquanto o assistente processa minha pergunta,
**para** perceber menos espera enquanto aguardo a resposta.

### Decisão de escopo (PO)

`PRD-009` listava esta história como "indicador de digitando / **streaming** de resposta" e já registrava o risco de que streaming de token-a-token mudaria o contrato do `/chat` (resposta única → streaming), exigindo ADR. Dado que é prioridade P3 e o ganho percebido (sensação de menor espera) não depende de streaming real, o PO decide escopar esta história como **indicador de espera simulado no frontend** (ex.: "digitando..." com animação), sem streaming real do backend. Streaming token-a-token real fica fora de escopo — pode ser retomado no futuro como história própria, com ADR, se o ganho justificar a mudança de contrato.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — `/chat` **não muda** (decisão de escopo acima evita a mudança de contrato)
- [x] Mapeamento de erros documentado — N/A, sem endpoint novo
- [x] Modelagem de dados documentada — N/A
- [x] Plano de testes definido (ver subseção abaixo)
- [x] Épico e dependências identificados — Chat v2 (`PRD-009`); nenhuma dependência
- [x] ADR registrado se envolve decisão de stack nova — N/A, decisão de escopo acima evita a necessidade
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — indicador tipo "bolha com pontos animados", consistente com o redesign de `US-11-01`
- [x] Protótipo solicitado pelo autor — N/A
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: componente de chat — indicador aparece ao enviar pergunta, some ao receber resposta (ou erro)
- Mocks necessários: mock da chamada ao `/chat` com delay controlado no teste

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: indicador de "digitando" aparece assim que a pergunta é enviada
- [x] CA-002: indicador some quando a resposta (ou erro) chega
- [x] CA-003: contrato do `/chat` não muda — request/response seguem `{ question }` → `{ answer }` (`source` é aditivo, opcional)

### Fora de escopo
- Streaming real token-a-token do backend (decisão de escopo acima)

### Dependências
- Nenhuma (recomenda-se implementar após `US-11-01`, pelo reaproveitamento visual, mas não bloqueia)

### Épico / Prioridade
Chat v2 (`PRD-009`) — P3

### Tasks
- [x] T01 Adicionar indicador de "digitando" no componente de chat em `frontend/components/`
- [x] T02 [P] Teste cobrindo aparecer/sumir do indicador

**Nota:** o indicador (`TypingDots` + `RagLoadingStatus`, com estágios "Buscando contexto…" → "Raciocinando…" → "Interpretando…" → "Respondendo…") já existia em `RagChatPanel.tsx` de trabalho anterior à formalização desta US. Adicionei o teste `"mostra o indicador de digitando ao enviar e some ao chegar a resposta"` em `ProfileAssistChat.test.tsx`, usando uma Promise controlada para provar CA-001 (aparece já no envio) e CA-002 (some ao resolver) de forma explícita — antes só havia cobertura indireta via `waitFor` no resultado final.

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado pela história (`npm test -- --coverage` → `RagChatPanel.tsx` 87.5%, `ProfileAssistChat.tsx` 94.87%)
- [x] Build/lint limpo (`npm run build`, ESLint, `tsc --noEmit` — todos limpos)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API implementado bate com o documentado no DoR (sem mudança)
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A
- [x] Deploy/preview verificado (Vercel preview do PR) — [PR #51](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/51), deploy da Vercel `Deployment has completed`
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-18 | Indicador (`TypingDots`/`RagLoadingStatus`) aparece no envio (`status === "loading"`) e some ao concluir; contrato do `/chat` confirmado inalterado (`source` é aditivo, `answer` segue igual) — sem streaming real implementado, conforme decisão de escopo. Teste com Promise controlada comprova aparecer/sumir |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-18 | `RagLoadingStatus`/`TypingDots` isolados, sem side-effect fora do próprio `useEffect` de estágio; confirmado que não introduziu streaming real nem mudou o contrato do `/chat`. Sem Critical/High |
| PO | `@product-owner` | Done | 2026-08-18 | CA 100% fechados, DoD 100% fechado — preview confirmado no [PR #51](https://github.com/lucaspalharesbarbosa/curriculo-online-ia/pull/51) |

**Status:** Done
