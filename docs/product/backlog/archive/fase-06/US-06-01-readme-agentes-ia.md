# US-06-01 — README: construção com agentes de IA

**Fase:** Fase 06 — Divulgação
**Área de origem:** Divulgação / lançamento (checklist do roadmap; sem PRD de épico)

**Como** visitante/recrutador no GitHub,
**quero** entender no README como o site foi construído com um pipeline de agentes de IA,
**para** avaliar o projeto como evidência de engenharia e uso deliberado de IA — não só o currículo em si.

### DoR (antes de iniciar) — 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [N/A] Contrato de API — sem endpoint
- [N/A] Mapeamento de erros — sem endpoint
- [N/A] Modelagem de dados — sem entidade
- [x] Plano de testes definido — revisão documental (checklist QA), sem unitário
- [x] Épico e dependências identificados — Divulgação; depende do MVP + RAG no ar (Fases 3–5 Done)
- [N/A] ADR — sem decisão de stack nova
- [N/A] Variáveis de ambiente/segredos — sem alteração
- [N/A] Referência visual — não é UI
- [N/A] Protótipo — não solicitado
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: N/A — só Markdown no README
- Integração: N/A
- Manual/QA: links internos do README resolvem; seção existe e cobre pipeline + ADRs/PRDs; sem secret no texto

### Critérios de aceite

- [x] CA-001: `README.md` na raiz tem uma seção dedicada (ex.: "Como este projeto foi construído com agentes de IA")
- [x] CA-002: a seção descreve o pipeline (PO → arquiteto? → UX sob pedido → Dev → QA → Tech Lead → PO) e aponta para `docs/agents/` e skills
- [x] CA-003: a seção linka pelo menos ADRs principais (`ADR-001`, `ADR-002`, `ADR-003`) e o roadmap/PRDs em `docs/product/`
- [x] CA-004: a seção deixa claro o que é produto (currículo + chat RAG) vs. o que é o método (agentes + processo)
- [x] CA-005: nenhum secret/API key aparece no README

### Fora de escopo

- Prints/screenshots do pipeline no chat (opcional; sem bloquear se o texto + links bastarem)
- Alteração de About do repositório no GitHub (US-06-02)
- LinkedIn e coleta de feedback (US-06-02, US-06-03)

### Dependências

- Fases 3–5 Done (site e RAG em produção) — satisfeitas
- `docs/agents/CONTEXTO-PROJETO.md`, ADRs e roadmap existentes

### Área / Prioridade

Divulgação — P3 (roadmap original Fase 6)

### Tasks

- [x] T01 Redigir seção no `README.md` (raiz) cobrindo pipeline, artefatos e links
- [x] T02 Atualizar `docs/product/roadmap.md` e índices de produto se a história alterar o status da Fase 6
- [x] T03 Revisar links quebrados nos caminhos citados

### DoD (antes de concluir)

- [x] Todos os critérios de aceite acima `[x]`
- [N/A] Cobertura de testes ≥ 70% — só documentação Markdown
- [N/A] Build/lint — sem código de app tocado
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [N/A] Contrato de API
- [x] Sem chave de API/secret exposto
- [x] Documentação de produto/roadmap atualizada se o status da fase mudar
- [N/A] Deploy/preview — sem UI
- [x] Vereditos de QA, Tech Lead e PO na tabela abaixo
- [x] Status da história atualizado neste arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-10 | `docs/qa/QA-003-fase-06-divulgacao.md` |
| Tech Lead | `@tech-lead-review` | Aprovar — docs only; sem secret; links ok | 2026-08-10 | review branch `feature/fase-06-divulgacao` |
| PO | `@product-owner` | Done | 2026-08-10 | CAs e DoD fechados |

**Status:** Done
