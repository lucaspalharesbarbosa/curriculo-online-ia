# US-07-13 — Polimento UX: hero typewriter, seções e Assistente RAG

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** seções mais legíveis (destaques, educação, certificações, artigos), um hero com typewriter de cargo e um Assistente RAG flutuante e funcional em local/produção,
**para** explorar o currículo com hierarquia clara e conversar com o agente sem fricção.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A para endpoints novos; chat continua `POST /chat`. Proxy same-origin (opcional) só encaminha o mesmo contrato
- [x] Mapeamento de erros documentado — N/A (sem contrato novo); erros do `/chat` já tratados no client
- [x] Modelagem de dados documentada — N/A (sem schema novo; dados em `resume.json`)
- [x] Plano de testes definido (abaixo)
- [x] Épico e dependências identificados — Frontend & UX v2; depende de US-07-11 / US-07-12 (base visual + assistente no Perfil)
- [x] ADR registrado — N/A: sem lib nova; proxy Next→FastAPI já previsto em `ADR-002` (Functions/proxy); reusa `framer-motion` / `lucide-react` (`ADR-005`)
- [x] Variáveis de ambiente/segredos — `API_URL` (server-only, default `http://127.0.0.1:8000`) para proxy; `LLM_API_KEY` só no backend; client deixa de depender de `NEXT_PUBLIC_API_URL` para o chat
- [x] Referência visual definida — autor (2026-08-10): **manter marcador B** (anel respirando já em produção); demais itens com direção clara no pedido
- [x] Sem dúvida bloqueante — Marcador B confirmado

#### Plano de testes

- Unitário: `ExperienceSection` (marcador escolhido + reduced-motion); `EducationSection` (ícone/link visível); `Certifications` (hierarquia/selo/CTA); `ProjectsSection` (ícone Destaques + CTA artigo); typewriter no sidebar/hero; `ProfileAssistChat` / `RagChatPanel` (nome Assistente RAG, copy 1ª pessoa, probes realistas, status RAG); `useResumeChat` aponta para rota same-origin
- Manual: chat em `localhost:3000` com backend local; chat em produção; z-index do painel flutuante acima das seções sem cobrir leitura (minimizar ok); mobile ~375px
- Contraste AA nos CTAs accent/surface

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: Destaques PRAD/Mérito mantêm **variante B** (anel respirando); sem caixa; respeita `prefers-reduced-motion` (já em produção; confirmado 2026-08-10)
- [x] CA-002: Educação — ícone de link mais visível e distinto (não o atual); hit-area clara de que abre o site
- [x] CA-003: Certificações — layout reorganizado com selos; cada curso/certificação fácil de identificar; CTA "Ver certificado" mais evidente
- [x] CA-004: Painel flutuante do Assistente RAG fica **acima** das seções ao rolar (`portal` ou stacking fora do `z-10` das seções); não atrapalha a leitura (minimizar disponível)
- [x] CA-005: Destaques (projetos/artigos) — ícone de seção coerente; CTA de artigo com frase curta tipo link-botão (ex. "Ler artigo"), sem poluir
- [x] CA-006: Hero — abaixo do nome, prefixo `>_` + typewriter loop (escreve / apaga) em "Tech Lead e Senior Software Engineer" (ou cargos primários já parseados); reduced-motion mostra texto estático
- [x] CA-007: Assistente — nome **Assistente RAG**; subtitle/status online fala em 1ª pessoa como especialista na carreira/experiência do autor; empty hint moderno (sem "canal · rag"); probes realistas e básicos; estados de loading estilo RAG/agent: Buscando contexto… → Raciocinando… → Interpretando… → Respondendo…
- [x] CA-008: Chat funciona em local e produção de forma transparente — browser chama same-origin (ex. `/api/chat`); Next faz proxy para o FastAPI; sem depender de CORS do browser para o fluxo feliz
- [x] CA-009: Conteúdo factual 100% de `resume.json` (sem inventar fatos)
- [x] CA-010: Suíte do escopo tocado verde (`npm test` nos componentes/hooks alterados)

### Fora de escopo

- Redesign geral / troca de paleta
- Novas features de Chat v2 (`PRD-009`) além de copy/UX/proxy
- Alterar textos factuais de PRAD/Mérito ou inventar certificações

### Dependências

- US-07-11, US-07-12, `ADR-002`, `ADR-005`
- **Gate humano:** letra do marcador PRAD/Mérito no protótipo `/prototipo/secoes-layout` (rodada 2) — código do protótipo removido em 2026-08-10 após decisão (`docs/agents/PROCESSO-PROTOTIPO.md`)

### Épico / Prioridade

Frontend & UX v2 — P1

### Tasks

- [x] T01 Protótipos rodada 2 dos marcadores PRAD/Mérito em `SectionsLayoutPrototype` + rota `/prototipo/secoes-layout`
- [x] T02 Aplicar variante escolhida em `ExperienceSection` + CSS (`globals.css`) — **mantido B** (sem mudança)
- [x] T03 [P] Educação — ícone/link mais visível em `EducationSection`
- [x] T04 [P] Certificações — reorganizar layout + CTA em `Certifications`
- [x] T05 [P] Destaques — ícone da seção + CTA artigo em `ProjectsSection`
- [x] T06 Hero typewriter loop com `>_` (sidebar/hero)
- [x] T07 Assistente RAG — copy, probes, loading stages, nome em `ProfileAssistChat` / `RagChatPanel`
- [x] T08 Fix z-index/portal do chat flutuante
- [x] T09 Proxy same-origin `/api/chat` + ajustar `useResumeChat`; documentar env (`API_URL`)
- [x] T10 Testes do escopo tocado + lint/build — testes do escopo OK (24); lint/build na passagem QA

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — ~78% lines (`QA-001`)
- [x] Build/lint limpo — `npm run build` OK; eslint nos arquivos tocados OK
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A (proxy transparente)
- [x] Sem chave de API/secret exposto
- [x] Documentação — `.env.example` atualizado (`API_URL`); `QA-001` registrado
- [x] Deploy/preview verificado — autor confirmou preview/produção 2026-08-11; `API_URL`/smoke produção confirmados pelo autor
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-08-10 | `docs/qa/QA-001-us-07-13-polimento-ux-chat.md` |
| Tech Lead | `@tech-lead-review` | Aprovar com ressalvas | 2026-08-10 | Proxy ok; sem secret no client; pendência `API_URL` na Vercel |
| PO | `@product-owner` | Aceito/Done — autor confirmou preview/produção e `API_URL`/smoke produção 2026-08-11; DoD completo | 2026-08-11 | preview/produção + API_URL/smoke |

**Status:** Done
