# Template — História de Usuário e PRD (Currículo Online)

## PRD (`docs/product/PRD-NNN-<epico>.md`)

`NNN` = próximo número livre da sequência de PRD (3 dígitos, nunca reaproveitado — ver `docs/agents/CONTEXTO-PROJETO.md`). O backlog **não** segue o `NNN` do PRD: cada história do PRD vira um arquivo próprio em `docs/product/backlog/fase-FF/US-FF-NN-<slug>.md`, organizado pela **fase de implementação** em que será executada (ver roadmap em `docs/plano-projeto-curriculo-online.md`, seção 8), não pelo épico. A tabela "Histórias" abaixo linka cada uma para o arquivo correspondente depois de criado.

```markdown
# PRD-NNN — [Nome do épico]

**Status:** draft | review | approved | ready-for-agent
**Épico:** Conteúdo | Frontend | RAG | Deploy
**Prioridade:** P0 | P1 | P2 | P3

## Problema
[Dor / necessidade]

## Objetivo
[Mensurável — ex.: "site publica as 4 seções principais do currículo com dados reais"]

## Escopo
### Incluído
- ...

### Excluído
- ...

## Persona
Visitante/recrutador navegando o site.

## Histórias
| Título | Prioridade | Backlog |
|--------|------------|---------|
| ... | P0 | [US-FF-NN](../backlog/fase-FF/US-FF-NN-slug.md) |

## Riscos
- ...

## DoR do épico
- [ ] Toda história do épico tem seu próprio DoR fechado (checklist por história abaixo — este item é só o guarda-chuva)
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
```

O DoR de verdade — o que **bloqueia o início da implementação** — vive em cada história, não no épico. Ver seção seguinte.

---

## Histórias — ID e nome de arquivo

Uma história = um arquivo em `docs/product/backlog/fase-FF/US-FF-NN-<slug>.md`:

- `FF` = número da fase de implementação (2 dígitos — `00` a `06`, ver `docs/agents/CONTEXTO-PROJETO.md`), **não** o número do épico
- `NN` = sequência da história dentro dessa fase (2 dígitos, reinicia em `01` a cada fase)
- `slug` = 2-4 palavras em `kebab-case` descrevendo a história, sem acentos (ex.: `schema-resume-json`, `componente-hero`)

O ID `US-FF-NN` sozinho já é único em todo o backlog (`US-03-01` nunca colide com `US-05-01`) — pode ser citado em Dependências/Fora de escopo de qualquer história sem precisar dizer de qual fase é.

Cada história carrega seu próprio **DoR** (bloqueia início), **Critérios de aceite** e **DoD** (bloqueiam Done). Regra: **nenhum item pode ficar sem `[x]`/`[N/A]` justificado** para a história avançar de fase — ver gates em `@orquestrador`.

```markdown
# US-FF-NN — [Título]

**Fase:** Fase FF — [nome da fase, ver roadmap]
**Épico de origem:** Conteúdo | Frontend | RAG | Deploy (`PRD-NNN-<epico>.md`)

**Como** visitante/recrutador,
**quero** [ação],
**para** [valor].

### DoR (antes de iniciar) — precisa estar 100% fechado

- [ ] Critérios de aceite (abaixo) escritos e testáveis
- [ ] Contrato de API documentado — se a história cria/altera endpoint (ver subseção "Contrato de API")
- [ ] Modelagem de dados documentada — se a história introduz/altera entidades relacionadas entre si (ver subseção "Modelagem de dados"); diagrama ER só quando fizer sentido (`@arquiteto-ia-senior`, `references/data-model-patterns.md`)
- [ ] Plano de testes definido — camadas a cobrir, incluindo unitários, integração e mocks necessários (ver subseção "Plano de testes")
- [ ] Épico e dependências identificados (US-FF-NN, ADR-XXX)
- [ ] ADR registrado se envolve decisão de stack nova
- [ ] Variáveis de ambiente/segredos necessários identificados (nome, onde configurar — nunca no client)
- [ ] Referência visual definida — se a história é de UI nova (evita retrabalho de layout)
- [ ] Sem dúvida bloqueante

#### Contrato de API (se aplica — remover a subseção se não houver endpoint)

`MÉTODO /caminho`

- Request: `{ campo: tipo, ... }`
- Response 200: `{ campo: tipo, ... }`
- Erros: `4xx/5xx` esperados e shape do erro

#### Modelagem de dados (se aplica — remover a subseção se não houver entidade relacionada)

- Entidades/campos envolvidos: ...
- Diagrama ER: `docs/architecture/images/DATA-NNN-<slug>.svg` (se gerado)

#### Plano de testes

- Unitário: ...
- Integração: ...
- Mocks necessários: ...

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: [verificável]
- [ ] CA-002: ...

### Fora de escopo
- ...

### Dependências
- US-FF-NN, ADR-XXX (se houver)

### Épico / Prioridade
[Conteúdo | Frontend | RAG | Deploy] — P0 | P1 | P2 | P3

### Tasks
- [ ] T01 [descrição, path real]
- [ ] T02 [P] [descrição, path real] — `[P]` se paralelizável com a anterior

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado pela história (`npm test -- --coverage` / `pytest --cov`) — histórias sem lógica testável (só dado em `resume.json`) ficam `N/A` com justificativa
- [ ] Build/lint limpo (`npm run build`, `ruff check`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR (se aplicável)
- [ ] Sem chave de API/secret exposto (client bundle ou repo)
- [ ] Documentação atualizada (ADR/contrato/diagrama ER) se algo mudou de fato durante a implementação
- [ ] Deploy/preview verificado — se UI
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado \| Aprovado com ressalvas \| Reprovado \| Bloqueado | AAAA-MM-DD | `docs/qa/QA-NNN-<escopo>.md` (se salvo em arquivo) ou resumo inline |
| Tech Lead | `@tech-lead-review` | Aprovar \| Aprovar com ressalvas \| Solicitar mudanças \| Bloquear | AAAA-MM-DD | resumo inline ou link do PR |
| PO | `@product-owner` | Done \| Quase lá \| Em progresso \| Bloqueado | AAAA-MM-DD | `references/delivery-evaluation-template.md` |

**Status:** Draft | Ready for Agent | Blocked | In Progress | Done
```

Template completo de avaliação de entrega (PO): `references/delivery-evaluation-template.md`.

A tabela "Vereditos" é preenchida **na própria história** (`docs/product/backlog/fase-FF/US-FF-NN-<slug>.md`), não só relatada em texto solto no chat — é o que torna o veredito uma evidência auditável do DoD, não uma narrativa perdida no histórico da conversa.
