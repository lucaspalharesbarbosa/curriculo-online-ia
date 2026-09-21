# ADR-015: Loop Engineering no pipeline de agentes

## Status
Aceita

## Contexto

O pipeline de agentes (`@orquestrador`: PO → Arquiteto? → [UX Designer?] → Dev → QA → Tech Lead → PO) já produz sinais de feedback verificáveis em cada fase — `npm run lint`/`npm test`/`npm run build` (frontend), `ruff`/`black`/`pytest` (backend), cobertura (`--coverage`/`--cov`), `TestClient` de integração, Playwright, Lighthouse, SonarCloud e `gh pr checks` no CI. Hoje, porém, esses sinais são usados de forma **passiva**: quando QA reprova ou Tech Lead solicita mudanças, o protocolo (`orquestrador/SKILL.md`, `references/pipeline-flows.md`) manda **parar e aguardar o autor**, mesmo quando a causa é um achado objetivamente corrigível (teste quebrado, cobertura abaixo do piso, lint, erro de contrato já documentado no DoR). O mesmo vale para o loop de CI pós-push: hoje uma falha do GitHub Actions é descoberta e corrigida manualmente pelo autor, não pelo agente.

Pré-commit hooks (`husky`+`lint-staged`, `pre-commit`) já estão listados em `docs/agents/CONTEXTO-PROJETO.md` como prática a aprofundar, mas não implementados — ou seja, a "matéria-prima" de um loop rápido de verificação já foi identificada antes deste ADR, só não fechada em um circuito.

O autor validou a proposta de introduzir **Loop Engineering** — cada ação do pipeline produz feedback rápido e verificável, e o agente aprende/corrige/reexecuta até convergir — com um ajuste explícito em relação à proposta original: o loop deve ser **autônomo de ponta a ponta até o merge em `main`**, não apenas dentro de cada fase; o único ponto de parada obrigatório para confirmação humana é **imediatamente antes do merge em `main`**.

Isso é uma mudança de postura em relação à governança hoje registrada em `docs/agents/CONTEXTO-PROJETO.md` ("sugestões dos agentes são propostas, não aprovação automática") — este ADR não revoga essa governança para decisões **sem sinal de verificação objetivo** (ex.: qual variante de protótipo escolher, prioridade de escopo com trade-off de custo/tempo), mas a especializa: para o ciclo de execução rotineiro — implementar, testar, corrigir, revisar, mesclar em `develop`, revalidar — o agente decide sozinho sempre que houver um sinal verificável (teste, lint, build, cobertura, achado de review) para basear a correção.

## Decisão

Adotar Loop Engineering no pipeline de agentes, com autonomia de ponta a ponta até `main`, gate humano único e não-negociável imediatamente antes do merge em `main`.

### Três níveis de loop

| Nível | Onde | Sinal verificável | Quem fecha o loop |
|---|---|---|---|
| **Loop interno da fase** | Dentro de `@senior-developer` (e `@qa-engineer` quando aplicável) | lint, teste unitário/integração, build, type-check | O próprio agente, sem sair da fase |
| **Loop entre fases** | Dev ↔ QA ↔ Tech Lead | Veredito estruturado (tabela de achados por severidade) | `@orquestrador` reabre a fase anterior automaticamente, sem esperar o autor |
| **Loop de CI** | Pós-push, pré-merge em `develop`/`main` | `gh pr checks`, logs do GitHub Actions | Agente lê a falha, corrige, repush — sem intervenção do autor |

### Autonomia ponta a ponta — o que muda em relação ao pipeline atual

- QA "Reprovado" e Tech Lead "Solicitar mudanças" deixam de significar "pare e aguarde o autor" — passam a significar "`@orquestrador` reabre `@senior-developer` automaticamente com o achado estruturado, até o limite de tentativas".
- Falha de CI pós-push deixa de exigir que o autor cole o log manualmente — o agente lê (`gh pr checks` / `gh run view --log-failed`), diagnostica, corrige e repuxa (repush).
- O pipeline avança PO → Arquiteto → Dev → QA → Tech Lead → PO (aceite) → merge em `develop` sem pausa humana **desde que cada gate tenha sinal objetivamente verificável** (DoR com item `[x]`/`N/A` checável, teste passando, cobertura ≥ piso do DoD, achado de severidade resolvido).

### O único gate humano obrigatório: merge em `main`

Merge em `develop` → `main` dispara deploy de produção real (Vercel + Render/Cloud Run, `ADR-002`) — é a ação de maior blast radius do pipeline e a única que este ADR mantém 100% humana, sem exceção e sem bypass por nenhum nível de loop. `@orquestrador` **para** nesse ponto, apresenta o relatório final do pipeline (fases, veredictos, evidências) e aguarda confirmação explícita do autor antes de executar ou solicitar o merge.

### O que continua escalando para o humano, mesmo com o pipeline autônomo

Autonomia de ponta a ponta cobre o ciclo de execução **com sinal verificável**. Continuam pausando o pipeline (não é regressão de escopo, é limite real do que um loop de verificação resolve sozinho):

1. **Decisão sem sinal objetivo de verificação** — ex.: qual variante de protótipo escolher (`@ux-designer`, Fase 2b: estético/subjetivo, sem teste que "aprove" uma variante), ambiguidade de escopo/negócio que não é bug de código.
2. **Decisão de arquitetura/stack nova** — ADR continua sendo produzido e, por definição, é uma decisão que o autor revisa (mesmo que o loop não pare o pipeline inteiro esperando aprovação linha a linha, a mudança de stack em si segue como já documentado em `CONTEXTO-PROJETO.md`).
3. **Estouro do limite de tentativas do loop** (ver regras de escalonamento abaixo) — sinal de que o agente não está convergindo sozinho.
4. **Mesma falha se repetindo com a mesma assinatura** (mesmo teste, mesmo erro) — não gasta tentativa extra, escala direto.
5. **Código sensível** — chave de API, CORS, segredo — nunca auto-loop; já é Critical no `@tech-lead-review` e continua bloqueando até revisão humana explícita, independentemente do restante do pipeline estar automatizado.
6. **Merge em `main`** — item fixo desta decisão, nunca automatizado.

### Regras de escalonamento (limite do "tentar sozinho")

- **Máximo de tentativas por loop**: 3. Na 3ª falha sem convergência, o loop para e escala para o autor com o histórico das tentativas (o que foi tentado, o que falhou, diagnóstico).
- **Falha repetida com a mesma assinatura** (mesmo teste/erro) → escala imediatamente, não consome as 3 tentativas por completo.
- **Escopo sensível** (API key, CORS, segredo, auth) → nunca entra no loop automático, sempre humano.
- **Ambiguidade de produto/negócio** → nunca é matéria de loop técnico, vai direto ao `@product-owner`/autor.

### Registro do loop (proporcional ao projeto solo)

Sem novo artefato pesado: o handoff entre fases (`references/handoff-template.md`) ganha uma seção curta "Tentativas do loop" (quantas rodadas, o que convergiu, o que escalou) — não cria um documento novo por história.

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| Manter gates humanos em toda transição de fase (proposta original, sem o ajuste do autor) | Autor no controle de cada etapa; menor risco de loop mascarar erro | Não atende ao pedido explícito de autonomia ponta a ponta; volta de fricção manual em cada QA/TL reprovado, mesmo quando o achado é objetivamente corrigível |
| Autonomia total, incluindo merge em `main` sem confirmação | Zero fricção manual em todo o ciclo | Remove controle humano da ação de maior blast radius do projeto (deploy de produção) — contradiz a governança do projeto e o apetite a risco declarado pelo autor nesta conversa |
| Autonomia ponta a ponta com gate humano único antes do merge em `main` (**escolhida**) | Atende ao pedido do autor: pipeline roda sozinho do início ao fim, mas a única ação irreversível/visível externamente (deploy) continua sob controle humano explícito | Exige que os SKILL.md de fase (`orquestrador`, `senior-developer`, `qa-engineer`, `tech-lead-review`) sejam atualizados para reabrir fases automaticamente em vez de só sinalizar bloqueio — trabalho de implementação separado deste ADR |

## Consequências

**Positivas**
- Reduz drasticamente o número de interrupções manuais no ciclo de execução — o autor só é chamado quando há decisão genuinamente subjetiva, ambiguidade de negócio, ou a ação irreversível de merge em `main`.
- Aproveita sinais de verificação que já existem no projeto (lint, testes, cobertura, SonarCloud, CI) em vez de introduzir ferramenta nova.
- Mantém o ponto de maior risco real do projeto (deploy de produção via merge em `main`) sob controle humano explícito, sem exceção.

**Negativas / custos**
- É uma mudança de postura em relação à governança atual ("sugestões dos agentes são propostas, não aprovação automática") — precisa ficar clara a distinção entre "loop de execução com sinal verificável" (agora autônomo) e "decisão sem sinal objetivo" (continua propositiva/humana), para não virar uma leitura de que o autor perdeu controle do pipeline.
- Depende de os SKILL.md de cada fase serem atualizados para reabrir a fase anterior automaticamente (hoje eles dizem "não avance" sem descrever o loop de correção) — sem essa atualização, este ADR fica só documentado, sem efeito prático.
- Risco de loop "cegamente" tentando corrigir sem convergir se as regras de escalonamento (3 tentativas, mesma assinatura de falha) não forem implementadas com rigor — é o ponto onde um Loop Engineering mal calibrado piora a confiabilidade em vez de melhorar.
- Falha de CI lida por agente (`gh run view --log-failed`) exige permissão adicional em `.claude/settings.json` (hoje só há `gh pr checks`), sem a qual o loop de CI não fecha sozinho.

**Depende de quê**
- Atualização de `orquestrador/SKILL.md` e `references/pipeline-flows.md`: trocar a linguagem de gate de "não avance" para "reabra a fase anterior automaticamente, até 3 tentativas, com o achado estruturado; na 3ª falha, escale".
- Atualização de `senior-developer/SKILL.md` (Modo B, passo "Validar"): formalizar como loop explícito.
- Adição de permissão `gh run view --log-failed` (ou equivalente) em `.claude/settings.json` para fechar o loop de CI.
- Implementação (ainda pendente) de pré-commit hooks (`husky`+`lint-staged`, `pre-commit`) já listada como prática a aprofundar em `CONTEXTO-PROJETO.md` — é o loop mais barato e reduz o volume de falhas que chegam a precisar de loop entre fases ou de CI.
- Essas mudanças de SKILL.md e settings são trabalho de implementação separado, não incluído neste ADR — este documento registra a decisão, não a executa.

## Referências
- docs/agents/CONTEXTO-PROJETO.md (seção "Governança sobre os agentes" e "Boas práticas a aprofundar")
- .claude/skills/orquestrador/SKILL.md
- .claude/skills/orquestrador/references/pipeline-flows.md
- .claude/skills/orquestrador/references/handoff-template.md
- .claude/skills/senior-developer/SKILL.md
- .claude/skills/qa-engineer/SKILL.md
- .claude/skills/tech-lead-review/SKILL.md
- docs/architecture/ADR-002-hospedagem-gratuita.md (deploy em `main` — motivo do gate humano único)
