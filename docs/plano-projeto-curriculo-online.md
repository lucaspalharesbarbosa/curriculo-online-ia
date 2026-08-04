# Plano: Currículo Online (Projeto #1 do Portfólio)

**Objetivo:** transformar seu LinkedIn/histórico em um site pessoal, aplicando boas práticas de engenharia de software e um toque de IA Engineering, hospedado gratuitamente e publicado no seu GitHub.

Contexto: o repo antigo `MeuCurriculo` (.NET Core, início de carreira) já foi excluído. O projeto está sendo criado do zero em um repositório novo (`curriculo-ia`, sugestão — ajuste se tiver preferido outro nome), já refletindo a stack atual em Java/Python.

---

## 1. Escopo de conteúdo (o "quê")

Extraia do LinkedIn e organize em seções claras:

- **Hero/Sobre** — nome, cargo-alvo, 2-3 frases de posicionamento ("Analista e desenvolvedor de sistemas WEB...")
- **Experiência profissional** — empresa, período, principais entregas (use bullets com resultado, não só tarefa)
- **Formação acadêmica**
- **Habilidades técnicas** — agrupadas (linguagens, frameworks, cloud, práticas)
- **Projetos/Portfólio** — cards linkando para os repositórios (inclusive este)
- **Certificações** (se houver)
- **Contato** — e-mail, LinkedIn, GitHub, botão de download do PDF do currículo

💡 Dica: mantenha os dados (experiências, skills, projetos) em um arquivo `content.json` ou `content.ts` separado da UI. Isso facilita atualizar o currículo sem mexer em componentes — e é a base para a feature de IA (seção 4).

---



## 2. Stack tecnológica sugerida

Atualização: hoje você atua mais com **Java e Python** (C#/.NET foi no início de carreira). A stack foi ajustada para isso.

**Arquitetura recomendada — frontend simples + backend de IA em Python:**


| Camada                             | Tecnologia                                                         | Hospedagem grátis                                  |
| ---------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| **Frontend** (o site do currículo) | Next.js + TypeScript + Tailwind (ou HTML/CSS/JS puro, mais enxuto) | Vercel ou GitHub Pages                             |
| **Backend de IA** (assistente RAG) | **Python + FastAPI**                                               | Render (free tier) ou Google Cloud Run (free tier) |


**Por quê Python para a parte de IA:** o ecossistema de RAG/embeddings/LLM (LangChain, LlamaIndex, SDKs de IA) é majoritariamente em Python — mais maduro, mais fácil de estudar e implementar. Java funcionaria, mas com libs bem mais imaturas nessa área.

**Onde entra o Java:** guarde para o **projeto #2 do portfólio** — ex: uma API em Spring Boot com responsabilidade própria (não force os dois no mesmo projeto 1).

**Alternativa 100% Python (mais simples, sem Next.js):** Flask/FastAPI + Jinja2 servindo o HTML direto, sem separar front/back. Mais rápido de montar sozinho, mas visual mais tradicional.

---



## 3. O diferencial de IA Engineering

Ideia central: um **assistente de chat no próprio site** que responde perguntas sobre sua trajetória ("quais projetos ele já fez em React?", "quanto tempo de experiência em X?"), usando **RAG (Retrieval-Augmented Generation)** simples sobre o seu próprio `content.json`.

Passos técnicos:

1. Seu conteúdo (experiências, projetos, skills) vira texto em pedaços (chunks).
2. Gera embeddings desses chunks (ex: OpenAI `text-embedding-3-small` ou modelo local).
3. Guarda os embeddings num vetor simples (pode ser até um array em JSON para esse volume pequeno de dados — não precisa de banco vetorial de verdade).
4. Na pergunta do visitante, você calcula similaridade, pega os trechos mais relevantes, e manda para um modelo (via API) gerar a resposta com esse contexto.
5. Serverless function (Vercel Function ou Azure Function) para não expor a chave de API no frontend.

Isso já vira uma boa história para entrevista: "construí RAG do zero, sem framework pesado, entendendo cada peça".

Se quiser algo mais simples para o MVP: comece só com um FAQ estático, e adicione o chat na fase de "Feature de IA" do roadmap (ver seção 8).

---



## 4. Boas práticas de engenharia a aplicar (o "como")

- **Git**: commits pequenos e com [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`...)
- **Branches**: `main` e `develop` protegidas (git flow definido na Fase 0) + `feature/nome-da-feature`, PR mesmo trabalhando sozinho (treina o hábito)
- **CI/CD**: GitHub Actions rodando lint + build a cada PR
- **Qualidade de código**: ESLint + Prettier (JS/TS) ou EditorConfig
- **Testes**: mesmo que poucos, teste os componentes principais (Vitest/Jest + Testing Library)
- **Documentação**: README completo (o que é, como rodar, stack, link do deploy, prints)
- **Arquitetura simples e limpa**: separar `content` (dados), `components` (UI), `lib` (lógica/IA), `app` (rotas)
- **Acessibilidade**: contraste, alt em imagens, navegação por teclado
- **Performance**: Lighthouse score alto (Next.js já ajuda bastante nisso)
- **Segurança**: nunca expor API keys no client; usar variáveis de ambiente

---



## 5. Fluxo de trabalho com agentes de IA (SDLC agêntico)

Isso é ótimo — e vira, por si só, um argumento forte de "AI Engineering" no seu portfólio: **o processo de construção do projeto também é o produto**. Vale documentar isso no README (seção "Como este projeto foi construído").

Você já tem um time completo de agentes especializados. A ideia é usar o **orquestrador** para coordenar o pipeline PO → Arquiteto → Dev → QA → Tech Lead em cada feature, com os agentes de Git cuidando da higiene do repositório.

**Mapeamento de responsabilidades por fase do projeto:**


| Fase                   | Agente(s)                    | Entregável                                                                                        |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Descoberta/Backlog     | `product-owner`              | Épicos, histórias de usuário, PRD do site de currículo                                            |
| Cerimônias/organização | `scrum-master`               | Definição de DoR/DoD, quadro de tarefas, ritmo das entregas                                       |
| Decisões técnicas      | `arquiteto-ia-senior`        | ADRs (por que Next.js + Python/FastAPI), diagrama C4 (contexto, containers), decisão do fluxo RAG |
| Implementação          | `senior-developer`           | Código das features (componentes, endpoint RAG, integração)                                       |
| Qualidade              | `qa-engineer`                | Plano de testes (unitário, integração, E2E do fluxo de chat), casos de regressão                  |
| Revisão                | `tech-lead-review`           | Checklist de SOLID, segurança (chaves de API, CORS), cobertura de testes                          |
| Versionamento          | `git-auto-commits`           | Commits atômicos em Conventional Commits a cada incremento                                        |
| Integração             | `git-rebase-feature-develop` | Rebase da feature sobre `develop` antes de abrir MR                                               |
| Entrega                | `open-merge-request`         | Abertura do PR com título/descrição prontos                                                       |
| Coordenação geral      | `orquestrador`               | Executa o pipeline completo por feature, ponta a ponta                                            |


**Fluxo sugerido por feature (ex: "montar o card de Experiência Profissional"):**

1. `product-owner` escreve a história de usuário + critérios de aceite
2. `arquiteto-ia-senior` valida se cabe na arquitetura atual (ou registra um ADR se muda algo)
3. `senior-developer` implementa
4. `qa-engineer` roda/gera os testes
5. `tech-lead-review` revisa antes do merge
6. `git-auto-commits` organiza os commits da feature
7. `git-rebase-feature-develop` sincroniza com `develop`
8. `open-merge-request` prepara o PR
9. `orquestrador` amarra as etapas 1-8 automaticamente

**Onde guardar isso no repositório** (importante para reprodutibilidade e para quem for olhar seu código depois):

```
docs/
├── product/        # épicos, histórias, PRD (saída do product-owner)
├── architecture/    # ADRs + diagramas C4 (saída do arquiteto-ia-senior)
├── qa/              # planos e relatórios de teste (saída do qa-engineer)
└── agents/          # os prompts/definições de cada agente (versionados como código)
```

Versionar os próprios prompts dos agentes em `docs/agents/` é uma boa prática: mostra que você trata "prompt como artefato de engenharia", não como algo descartável — e isso é exatamente o tipo de prática que "AI Engineering" valoriza.

⚠️ Um ponto de atenção: independentemente de quantos agentes participarem, você continua sendo o **tech lead humano** da decisão final — vale registrar no PRD/ADR quando você aceitar ou rejeitar uma sugestão de agente, isso também é uma boa história para contar (governança sobre IA, não só uso de IA).

### 5.1 Checklist de customização dos agentes (antes de começar a usar)

Antes de rodar o pipeline "pra valer", cada agente precisa saber o contexto **deste** projeto — senão vai responder de forma genérica ou sugerir coisas que você já decidiu (ex: arquiteto sugerindo outra stack). Recomendo duas coisas:

**a) Criar um arquivo de contexto compartilhado**, ex. `docs/agents/CONTEXTO-PROJETO.md`, com o que já está decidido, e fazer todo agente referenciar esse arquivo em vez de repetir contexto em cada prompt:

```
# Contexto do Projeto — Currículo Online

- Objetivo: site pessoal de currículo + assistente RAG, projeto #1 do portfólio
- Stack: Next.js/TS/Tailwind (frontend) + Python/FastAPI (backend RAG)
- Repositório: monorepo, pastas /frontend, /backend, /docs
- Branching: main + develop, features em feature/*, commits em Conventional Commits (PT-BR)
- Hospedagem: Vercel (frontend) + Render/Cloud Run (backend)
- Dono técnico final: você (decisões de agentes são sugestão, não aprovação automática)
```

**b) Ajustar cada agente individualmente** (checklist):


| Agente                       | O que revisar/ajustar                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `product-owner`              | Deixar claro que é produto pessoal (não corporativo) — PRDs mais enxutos, sem processo pesado                                              |
| `scrum-master`               | Cadência realista pra 1 pessoa (ex: ciclos semanais, não sprints de time)                                                                  |
| `arquiteto-ia-senior`        | Injetar que a stack já foi decidida (Next.js + FastAPI, monorepo) — ele deve registrar ADRs de decisões *novas*, não reabrir as já tomadas |
| `senior-developer`           | Confirmar convenções de código (linters, estrutura de pastas do monorepo)                                                                  |
| `qa-engineer`                | Nível de teste proporcional ao projeto (não é sistema crítico — foco no essencial: componentes, endpoint do chat)                          |
| `tech-lead-review`           | Checklist específico: segurança de API keys, CORS entre frontend/backend, sem exigir processo de squad grande                              |
| `git-auto-commits`           | Confirmar idioma (PT-BR) e padrão Conventional Commits                                                                                     |
| `git-rebase-feature-develop` | Confirmar nomes reais das branches (`main`/`develop`)                                                                                      |
| `open-merge-request`         | Template de PR (título, descrição, checklist de DoD)                                                                                       |
| `orquestrador`               | Validar a ordem do pipeline e o que fazer se um agente travar/discordar de outro                                                           |


**c) Fazer um dry-run** antes de usar em uma feature real: rode o pipeline completo numa tarefa fake e pequena (ex: "criar um componente Footer") e veja se cada agente respeita o contexto e produz o formato esperado. Ajuste o que sair torto antes de partir pras features de verdade.

---



## 6. Estrutura de pastas sugerida — Monorepo (frontend + backend)

Decisão registrada: **monorepo**, já que é um projeto solo com dois serviços pequenos e interligados (ver ADR sugerido para o `arquiteto-ia-senior` documentar essa decisão formalmente).

```
curriculo-ia/                   # nome do repo (ajuste se tiver escolhido outro)
├── frontend/                  # Next.js + TypeScript + Tailwind
│   ├── app/
│   │   ├── page.tsx
│   │   └── ...
│   ├── components/            # Hero, ExperienceCard, SkillBadge, ChatWidget...
│   └── content/
│       └── resume.json        # fonte da verdade dos dados do currículo
├── backend/                   # Python + FastAPI (serviço de RAG)
│   ├── app/
│   │   ├── main.py
│   │   ├── rag.py             # embeddings + busca por similaridade
│   │   └── chat.py            # endpoint /chat
│   └── requirements.txt
├── docs/
│   ├── product/                # PRD, backlog (product-owner)
│   ├── architecture/           # ADRs + C4 (arquiteto-ia-senior)
│   ├── qa/                     # planos/relatórios de teste (qa-engineer)
│   └── agents/                 # prompts dos agentes, versionados como código
├── .github/workflows/
│   ├── frontend-ci.yml         # lint + build do Next.js
│   └── backend-ci.yml          # lint + testes do FastAPI
└── README.md
```

**Deploy:** Vercel aponta "Root Directory" para `frontend/`; Render/Cloud Run builda a partir de `backend/`. Cada serviço tem seu próprio pipeline de CI, mas vivem no mesmo repositório e evoluem juntos nos mesmos PRs quando a feature exigir.

---



## 7. Onde hospedar de graça


| Plataforma                | Prós                                                                                                                        | Indicada para                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Vercel**                | Deploy automático a cada push, feito para Next.js, domínio `.vercel.app` grátis, suporta Serverless Functions (para o chat) | ✅ Recomendada para este projeto          |
| **GitHub Pages**          | Simples, direto do repo                                                                                                     | Só sites 100% estáticos (sem backend/IA) |
| **Netlify**               | Similar à Vercel, boas Functions também                                                                                     | Alternativa sólida                       |
| **Azure Static Web Apps** | Free tier generoso, integra bem se usar .NET no backend                                                                     | Se for de linha .NET                     |


**Domínio:** pode ficar no `.vercel.app` de graça, ou comprar um `.dev`/`.com` (baixo custo/ano) depois, se quiser algo tipo `lucaspalharesbarbosa.dev`.

---



## 8. Roadmap (To-Do por fases)

**Fase 0 — Preparação: agentes + repositório (pré-requisito, antes de codar)**

*Agentes:*

- [x] Criar `docs/agents/CONTEXTO-PROJETO.md` com stack, branching, hospedagem, convenções
- [x] Ajustar cada agente conforme o checklist da seção 5.1
- [x] Dry-run do pipeline completo numa tarefa fake (ex: "criar Footer")
- [x] Corrigir o que sair fora do esperado antes de seguir

*Repositório (preparação):*

- [x] Repo antigo excluído; repo novo criado no GitHub (`curriculo-ia`, público, com README e licença MIT)
- [x] Clonar o repo localmente
- [x] Criar estrutura de pastas do monorepo (`frontend/`, `backend/`, `docs/`) com um README placeholder em cada
- [x] Criar `.gitignore` combinado (Node + Python) — não veio pronto do GitHub, precisa ser feito manualmente
- [x] Configurar **git flow**: criar branch `develop` a partir de `main`, convenção `feature/`*, `fix/`*
- [x] Configurar **branch protection**: `main` e `develop` protegidas (exigir PR, exigir CI passando antes de merge, bloquear push direto e force-push)
- [x] Arquivos base adicionais: `.editorconfig`, template de PR/issue
- [x] Esqueleto de CI (`frontend-ci.yml` e `backend-ci.yml`) mesmo que só com um step de lint por enquanto
- [ ] Primeiro commit/PR: "chore: estrutura inicial do repositório" (commits prontos na branch `chore/estrutura-inicial-repositorio`, PR a abrir)

**Fase 1 — Descoberta e planejamento**

- [ ] `product-owner`: PRD do site + backlog inicial (épicos: Conteúdo, Frontend, RAG, Deploy)
- [ ] `scrum-master`: definir DoR/DoD e quadro de tarefas
- [ ] `arquiteto-ia-senior`: ADR da stack (Next.js + Python/FastAPI) + diagrama C4 de contexto

**Fase 2 — Setup do projeto**

- [ ] `senior-developer`: `npx create-next-app` (TS + Tailwind) em `frontend/` + esqueleto do serviço FastAPI em `backend/`
- [ ] Configurar ESLint/Prettier e conectar os workflows de CI já criados na Fase 0
- [ ] `git-auto-commits` + `open-merge-request`: PR do esqueleto das duas aplicações

**Fase 3 — MVP estático**

- [ ] `product-owner`: histórias de usuário por seção (Hero, Experiência, Skills...)
- [ ] `senior-developer`: `content/resume.json` + componentes da UI
- [ ] `qa-engineer`: testes dos componentes principais
- [ ] `tech-lead-review`: revisão antes do merge
- [ ] `git-rebase-feature-develop` → `open-merge-request` para cada feature
- [ ] Deploy inicial na Vercel (site no ar, mesmo incompleto)

**Fase 4 — Polimento**

- [ ] Ajustar design (usar a skill de frontend-design se for trabalhar comigo em código depois)
- [ ] Botão de download do PDF + SEO básico (meta tags, Open Graph)
- [ ] `qa-engineer`: checar Lighthouse (performance/acessibilidade)

**Fase 5 — Feature de IA (RAG)**

- [ ] `arquiteto-ia-senior`: ADR do fluxo de RAG (chunking, embeddings, custo)
- [ ] `senior-developer`: endpoint `/chat` no FastAPI + geração de embeddings
- [ ] Widget de chat no frontend
- [ ] `qa-engineer`: testes do fluxo de chat (respostas, fallback, custo/latência)
- [ ] `tech-lead-review`: segurança (chaves de API, CORS, rate limit)

**Fase 6 — Divulgação**

- [ ] README com a seção "Como este projeto foi construído com agentes de IA" (prints do pipeline, ADRs, PRD)
- [ ] Colocar link do site no LinkedIn e no GitHub
- [ ] Pedir feedback de 2-3 pessoas antes de divulgar amplamente

---



## 9. Depois desse projeto — ideias para o portfólio

1. **API back-end em Java (Spring Boot)** que serve dados do currículo ou de algum outro serviço (o frontend consome via REST) — mostra sua força atual em Java.
2. **Dashboard de dados** (ex: análise de vagas de emprego, scraping + visualização).
3. **Projeto de IA Engineering mais robusto**: um agente que automatiza alguma tarefa real (ex: triagem de e-mails, resumo de documentos).
4. Cada projeto novo referencia os anteriores no seu site — o currículo vira o "hub" do portfólio.

---



### Próximo passo imediato

Se quiser, posso já te ajudar a:

- (a) escrever o `content/resume.json` inicial com base no que você me passar do LinkedIn, ou
- (b) gerar o esqueleto do projeto Next.js (arquivos reais) para você rodar localmente.

Me diga qual prefere começar.