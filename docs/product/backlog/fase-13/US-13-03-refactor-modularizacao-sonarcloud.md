# US-13-03 — Refactor/modularização guiado pelos achados do SonarCloud

**Fase:** Fase 13 — Qualidade de Engenharia (continuação)
**Épico de origem:** Qualidade de Engenharia (`PRD-007-qualidade-engenharia.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** corrigir os achados reais de maior severidade reportados pelo SonarCloud (bugs, code smells, vulnerabilidades),
**para** reduzir dívida técnica concreta sem reescrever código que já funciona (sem refactor especulativo).

### DoR (antes de iniciar) — **não fechado** — ver "Dúvida bloqueante"

- [ ] Critérios de aceite (abaixo) escritos e testáveis — **não é possível fechar hoje**: os CAs dependem da lista real de achados, que ainda não está acessível (ver "Dúvida bloqueante")
- [x] Contrato de API documentado — `N/A` a priori; se algum achado exigir mudança de contrato, essa história específica de achado herda a exigência (ver "Formato de decomposição")
- [x] Mapeamento de erros documentado — mesmo critério acima, `N/A` a priori
- [x] Modelagem de dados documentada — `N/A`, sem entidade nova esperada
- [ ] Plano de testes definido — depende de saber que código será tocado (achados ainda não listados)
- [x] Épico e dependências identificados — épico Qualidade de Engenharia (`PRD-007`); depende de [US-09-01](../archive/fase-09/US-09-01-sonarcloud-ci.md) (Done — gerou a análise) e do gap registrado nela
- [x] ADR registrado se envolve decisão de stack nova — avaliar caso a caso por achado quando a lista existir; nenhum ADR necessário só para *triar* achados
- [x] Variáveis de ambiente/segredos necessários identificados — `N/A`
- [x] Referência visual definida — `N/A`, sem UI nova esperada
- [x] Protótipo solicitado pelo autor — `N/A`
- [ ] **Sem dúvida bloqueante** — dúvida bloqueante original resolvida (ver abaixo); resta 1 passo mecânico antes de fechar

#### Dúvida bloqueante (impede fechar o DoR agora) — causa raiz corrigida em 2026-08-18

~~`US-09-01` documentou um gap conhecido: os dois projetos SonarCloud nasceram com a branch principal apontando para `master`...~~ Investigado: não era config de branch quebrada, era limite do **Free plan padrão** do SonarQube Cloud (só analisa a branch marcada como principal; branch analysis de `develop` exigiria plano pago ou o Free OSS que a `ADR-009` pressupôs, mas não foi o plano em que os projetos nasceram). Sem caminho de auto-serviço para migrar Free → OSS num org existente, o autor **já renomeou a branch principal de `master` → `main`** nos dois projetos SonarCloud (Administration → Branches → Rename). Detalhe completo em `US-09-01` (subseção "Causa raiz corrigida").

**O que ainda falta para fechar o DoR de vez:**
1. `main` precisa receber um push real para disparar a primeira análise de verdade — a Fase 13 preparou o PR de release `develop → main` para isso
2. Depois desse push, `main` deixa de ser branch sem dado e a API pública (`measures/component`) passa a responder normalmente — o `@product-owner` consegue puxar a lista de achados reais direto pela API, **sem depender do autor exportar nada manualmente do dashboard**
3. Achados triados por severidade real (Bug/Vulnerability antes de Code Smell, Blocker/Critical antes de Minor/Info) → decompostos em história(s) `US-13-NN` específicas

Enquanto o push de release não acontece, esta história fica como **placeholder de rastreio** — não é `Ready for Agent`. Quando os achados existirem, esta história é **substituída** por uma ou mais histórias `US-13-NN` específicas (uma por achado ou por grupo de achados relacionados/mesmo arquivo), seguindo o formato abaixo, e esta é marcada `Cancelada` com link para as que a substituíram (mesma convenção de `US-06-03`).

#### Formato de decomposição (quando os achados existirem)

Cada história real herdada desta frente deve conter:
- Achado(s) do Sonar que motivam a mudança (regra, severidade, arquivo:linha)
- Diff mínimo — sem reescrita especulativa além do que o achado pede (`@senior-developer`, postura padrão)
- CA verificável: achado(s) resolvido(s) e confirmado(s) na próxima análise do Sonar (novo scan sem o finding), suíte de testes tocada continua verde

### Critérios de aceite

Não decompostos ainda — dependem da lista real de achados (ver "Dúvida bloqueante"). Não fechar CA genérico tipo "resolver os achados do Sonar" — não é verificável sem saber quais são.

### Fora de escopo

- Zerar 100% dos achados do Sonar de uma vez (risco já registrado no `PRD-007`: findings de baixo valor/nit não devem virar meta de zerar tudo) — priorizar por severidade real (Bug/Vulnerability antes de Code Smell, Blocker/Critical antes de Minor/Info)
- Reescrita de arquitetura sem achado concreto que a justifique

### Dependências

- [US-09-01](../archive/fase-09/US-09-01-sonarcloud-ci.md) (Done) — gerou a análise; causa raiz do gap corrigida (ver "Dúvida bloqueante")
- PR de release `develop → main` (aberto na Fase 13) — precisa mergear para `main` receber a primeira análise real do Sonar pós-rename

### Épico / Prioridade

Qualidade de Engenharia — P3

### Tasks

- [x] T00 (autor) Renomear a branch principal `master` → `main` nos dois projetos SonarCloud (2026-08-18)
- [ ] T00b Mergear o PR de release `develop → main` para `main` receber a primeira análise real pós-rename
- [ ] T01 `@product-owner` puxar achados reais via API (`measures/component`) depois do push, triar por severidade e decompor em história(s) `US-13-NN` específicas, seguindo "Formato de decomposição"
- [ ] Demais tasks nascem junto com as histórias específicas (T01 em diante, uma vez que existirem)

### DoD

Não aplicável ainda — esta história não avança para implementação como está; DoD é definido junto com as histórias específicas que a substituírem.

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

## Triagem concluída (2026-08-18)

`main` recebeu a primeira análise real pós-rename (push do PR #48). Achados puxados via API (`issues/search?branch=main`):

- **Backend** (4): 1 `BLOCKER`/`VULNERABILITY` (path traversal em `env_bootstrap.py`) — falso positivo (sem input de usuário, roda só no bootstrap local); 2 `MAJOR`/`MINOR` reais em `chat.py` (OpenAPI incompleto, `response_model` redundante)
- **Frontend** (59): 2 `CRITICAL` reais (`ProfileAssistChat.tsx`, `RagChatPanel.tsx`) + 3 `CRITICAL` falso positivo (stubs de mock em `vitest.setup.ts`) + 4 `MAJOR` reais (regex `lib/utils.ts` x3, dialog role em `ChatWidget.tsx` — arquivo morto, sem import de produção) + 50 `MINOR` (majoritariamente nit: props read-only, APIs depreciadas de baixo risco) — 13 desses `MINOR` são migração real de API do Zod em `resume.schema.ts`, viram história própria; o restante fica como dívida aceita, sem história dedicada (risco do `PRD-007`: não perseguir zerar tudo)

**Substituída por:**
- [US-13-04](US-13-04-triagem-falsos-positivos-sonar.md) — Triagem de falsos positivos (ação do autor no dashboard)
- [US-13-05](US-13-05-backend-achados-chat-py.md) — Backend: achados reais em `chat.py`
- [US-13-06](US-13-06-frontend-chat-widget-morto-achados.md) — Frontend: remover `ChatWidget` morto + achados reais nos componentes de chat
- [US-13-07](US-13-07-frontend-regex-lib-utils.md) — Frontend: regex com risco de performance em `lib/utils.ts`
- [US-13-08](US-13-08-frontend-migracao-zod.md) — Frontend: migrar API depreciada do Zod em `resume.schema.ts`

**Status:** Cancelada — decomposta em `US-13-04` a `US-13-08` (mesma convenção de `US-06-03`)
