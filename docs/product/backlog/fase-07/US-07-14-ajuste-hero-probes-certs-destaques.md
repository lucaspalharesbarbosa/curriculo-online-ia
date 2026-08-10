# US-07-14 — Ajuste fino: hero em linhas, probes 3ª pessoa, certs e label Artigo

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** cargos do hero em linhas distintas e elegantes, perguntas de exemplo do Assistente RAG na voz de um terceiro, Certificações bem aproveitadas no espaço e o label "Artigo" padronizado,
**para** ler o perfil com hierarquia clara e explorar o currículo sem ruído visual.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (só UI/copy; sem endpoint novo)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem schema novo; dados em `resume.json`)
- [x] Plano de testes definido (abaixo)
- [x] Épico e dependências identificados — Frontend & UX v2; depende de US-07-13 (typewriter + Assistente RAG + seções)
- [x] ADR registrado — N/A: sem stack/lib nova; reusa `framer-motion` / `lucide-react` (`ADR-005`)
- [x] Variáveis de ambiente/segredos — N/A
- [x] Referência visual definida — pedido do autor (2026-08-10): cargos em linhas separadas (elegante/criativo); probes em 3ª pessoa (“Onde Lucas…”); Certificações com melhor uso de espaço; label Artigo menor e alinhado ao de Projeto
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `RoleTypewriter` / `ResumeSidebar` — cada cargo primário em linha própria; reduced-motion estático; `ProfileAssistChat` / `RagChatPanel` — probes em 3ª pessoa (nome do autor); `Certifications` — layout reorganizado (sem ano duplicado “badge + Emitido”); `ProjectsSection` — label Artigo com tipografia/padding alinhados ao label Projeto
- Manual: sidebar hero ~375px / desktop; seção Certificações com 1 e N credenciais por emissor; Destaques com projeto + artigo lado a lado
- Contraste AA mantido nos pares accent/surface

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: Hero — abaixo do nome, "Tech Lead" e "Senior Software Engineer" (cargos primários de `parseHeroTitle`) aparecem **cada um em linha separada**, com layout elegante (prefixo `>_` / typewriter ou equivalente); `prefers-reduced-motion` mostra as linhas estáticas
- [x] CA-002: Assistente RAG — perguntas de exemplo (probes) em **3ª pessoa**, como se um terceiro perguntasse (ex.: "Onde Lucas trabalha hoje?", "Quais tecnologias ele usa?"); sem "você/sua" nas probes
- [x] CA-003: Certificações — layout reorganizado para melhor uso do espaço (menos redundância visual, hierarquia clara por emissor + credencial, CTA "Ver certificado" consistente)
- [x] CA-004: Destaques — label "Artigo" com tamanho/estilo padronizado ao label "Projeto" (sem parecer maior ou desalinhado)
- [x] CA-005: Conteúdo factual 100% de `resume.json` (sem inventar cargos/certs/artigos)
- [x] CA-006: Suíte do escopo tocado verde (`npm test` nos componentes alterados)

### Fora de escopo

- Redesign geral / troca de paleta
- Mudança de contrato `/chat` ou proxy
- Inventar certificações ou artigos

### Dependências

- US-07-13, `ADR-005`

### Épico / Prioridade

Frontend & UX v2 — P1

### Tasks

- [x] T01 Hero — `RoleTypewriter` multi-linha + `ResumeSidebar` (cargos em linhas)
- [x] T02 [P] Probes 3ª pessoa em `ProfileAssistChat` / `RagChatPanel` (+ testes)
- [x] T03 [P] Certificações — reorganizar layout em `Certifications.tsx` (+ teste)
- [x] T04 [P] Destaques — padronizar label Artigo em `ProjectsSection.tsx` (+ teste se preciso)
- [x] T05 `npm test` no escopo tocado + lint dos arquivos alterados

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — ~79% lines nos components do escopo (`QA-002`)
- [x] Build/lint limpo nos arquivos tocados — ReadLints limpo; suite Vitest verde
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação — PRD-005 linka esta US; `QA-002` registrado
- [x] Deploy/preview verificado — N/A nesta rodada (ajuste de layout local; smoke produção não bloqueia se suite verde)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-10 | `docs/qa/QA-002-us-07-14-ajuste-hero-probes-certs.md` |
| Tech Lead | `@tech-lead-review` | Aprovar — diff restrito a UI/copy; `RoleTypewriter` com `lines[]` e reduced-motion; probes 3ª pessoa sem tocar contrato `/api/chat`; Certificações sem ano duplicado e CTA com `aria-label`; badges Projeto/Artigo compartilham `.project-kind-badge`; sem secret/CORS; nit: ramos delete/hold do typewriter com cobertura parcial | 2026-08-10 | `RoleTypewriter.tsx`, `Certifications.tsx`, `ProjectsSection.tsx`, `ProfileAssistChat.tsx`, `RagChatPanel.tsx` |
| PO | `@product-owner` | Aceito — quatro pedidos do autor atendidos (hero em linhas, probes 3ª pessoa, certs reorganizadas, label Artigo padronizado); CA/DoD fechados | 2026-08-10 | avaliação acima |

**Status:** Done
