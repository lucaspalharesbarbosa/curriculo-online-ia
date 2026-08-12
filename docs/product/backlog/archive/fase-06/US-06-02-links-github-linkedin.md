# US-06-02 — Links do site no GitHub e no LinkedIn

**Fase:** Fase 06 — Divulgação
**Área de origem:** Divulgação / lançamento (checklist do roadmap; sem PRD de épico)

**Como** recrutador que encontra o perfil ou o repositório,
**quero** chegar ao site publicado com um clique a partir do GitHub e do LinkedIn,
**para** ver o currículo e o assistente de IA sem procurar a URL.

### DoR (antes de iniciar) — 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [N/A] Contrato de API — sem endpoint
- [N/A] Mapeamento de erros — sem endpoint
- [N/A] Modelagem de dados — sem entidade
- [x] Plano de testes definido — verificação manual de URLs
- [x] Épico e dependências identificados — Divulgação; site em produção (US-03-17)
- [N/A] ADR — sem stack nova
- [N/A] Variáveis de ambiente/segredos — sem alteração
- [N/A] Referência visual — não é UI do app
- [N/A] Protótipo — não solicitado
- [x] Sem dúvida bloqueante — LinkedIn e About do GitHub são ações do autor; o repo documenta checklist e links no README

#### Plano de testes

- Unitário: N/A
- Manual: URL `https://lucas-palhares-cv.vercel.app` responde; links no README apontam para ela; checklist do autor preenchido ou registrado como pendência explícita

### Critérios de aceite

- [x] CA-001: `README.md` (raiz) exibe de forma proeminente o link do site em produção (`https://lucas-palhares-cv.vercel.app`)
- [x] CA-002: checklist no backlog (esta história) lista o passo de configurar **Website** / About do repositório GitHub com a URL do site
- [x] CA-003: checklist lista o passo de adicionar o link do site no perfil LinkedIn (destaque / seção Featured ou equivalente)
- [x] CA-004: autor confirma CA-002 e CA-003 feitos **ou** registra pendência explícita com data — sem isso a história não fecha Done

### Fora de escopo

- Campanha ampla de divulgação (só o link nos canais oficiais do autor)
- Alteração do conteúdo do currículo no site
- Seção de agentes no README (US-06-01)

### Dependências

- US-03-17 (deploy Vercel) — Done
- US-06-01 pode rodar em paralelo (mesmo `README.md` — coordenar no mesmo PR)

### Área / Prioridade

Divulgação — P3

### Tasks

- [x] T01 Incluir bloco “Site em produção” no `README.md` com a URL
- [x] T02 Registrar checklist do autor (GitHub About + LinkedIn) nesta história
- [x] T03 Aguardar LinkedIn + URL final pós-domínio (GitHub Website já ok; atualizar URL se o domínio mudar)

### Checklist do autor (ações fora do repositório)

- [x] GitHub → Settings do repo (ou About na home) → **Website** = `https://lucas-palhares-cv.vercel.app` — confirmado pelo autor em 2026-08-10 (após rename Vercel)
- [x] LinkedIn → perfil → destaque/Featured → link `https://lucas-palhares-cv.vercel.app` — confirmado pelo autor em 2026-08-11
- [N/A] Feedback (US-06-03) — US cancelada pelo autor em 2026-08-11

Env / hospedagem (fora do checklist original, mas necessário pós-rename):

- [x] Vercel → `NEXT_PUBLIC_SITE_URL` = `https://lucas-palhares-cv.vercel.app` — autor 2026-08-10
- [x] Render → `ALLOWED_ORIGIN` = `https://lucas-palhares-cv.vercel.app` — autor 2026-08-10

### DoD (antes de concluir)

- [x] Todos os critérios de aceite acima `[x]`
- [N/A] Cobertura de testes ≥ 70% — docs + ações manuais
- [N/A] Build/lint — sem código de app (ou só Markdown)
- [x] Review do `@tech-lead-review` sem Critical/High
- [N/A] Contrato de API
- [x] Sem chave de API/secret exposto
- [x] Documentação/roadmap atualizada se o status da fase mudar
- [N/A] Deploy/preview de UI do app
- [x] Vereditos de QA, Tech Lead e PO na tabela abaixo
- [x] Status da história atualizado neste arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas — CA-004 pendente (confirmação autor) | 2026-08-10 | `docs/qa/QA-003-fase-06-divulgacao.md` |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas — merge do README ok; Done da história espera CA-004 | 2026-08-10 | review branch `feature/fase-06-divulgacao` |
| PO | `@product-owner` | Aceito — LinkedIn Featured confirmado pelo autor; CA-004 fechado | 2026-08-11 | |

**Status:** Done
