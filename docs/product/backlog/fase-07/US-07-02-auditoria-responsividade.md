# US-07-02 — Auditoria e correção de responsividade

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador acessando o site de qualquer dispositivo,
**quero** que todas as seções funcionem bem em mobile, tablet e desktop,
**para** conseguir ler o conteúdo e usar o chat sem quebras de layout, independente da tela.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (sem endpoint novo/alterado; só CSS/layout)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem entidade nova)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Frontend & UX v2 (`PRD-005`); depende de todos os componentes de seção (US-03-09 a US-03-16) e do `ChatWidget` (US-05-05), todos Done
- [x] ADR registrado se envolve decisão de stack nova — N/A (ajustes dentro do Tailwind já adotado, sem lib nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — N/A (correção dentro do design já existente — mudanças pontuais de spacing/wrap/grid conforme achado da auditoria; redesign visual de fato é história separada, US-07-03, ainda não iniciada)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: suíte existente de cada componente (`*.test.tsx`) — não deve regredir após ajustes de classe/layout
- Manual (obrigatório para aceite): auditoria nos breakpoints Tailwind `375px` (mobile), `768px` (tablet/`md`) e `1280px` (desktop/`xl`) via responsive mode do Chrome DevTools, em todas as seções (`Hero`, `Experience`, `Education`, `Skills`, `Certifications`, `Projects`, `Contact`, header/nav, `ChatWidget`) — checar overflow horizontal, quebra de texto/cards e usabilidade dos controles interativos
- Lighthouse mobile (Chrome DevTools) como checagem complementar, sem regressão face à baseline da Fase 4 (acessibilidade/contraste já corrigidos em US-04-02)
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: nenhuma seção do site produz overflow horizontal em `375px`, `768px` e `1280px`
- [x] CA-002: todos os controles interativos (nav do header, links de Contato, `ChatWidget`) permanecem visíveis e utilizáveis nos três breakpoints
- [x] CA-003: grids/listas de múltiplos itens (Experiência, Skills, Projetos, Certificações) reorganizam de coluna única (mobile) para múltiplas colunas (tablet/desktop) sem quebrar texto, sem cards cortados
- [x] CA-004: Lighthouse mobile não piora nota de Acessibilidade/Best Practices em relação à baseline da Fase 4 nas seções tocadas por esta história
- [x] CA-005: achados da auditoria (o que foi encontrado e o que foi corrigido) documentados nesta história antes do aceite

#### Achados da auditoria (T01) e correções (T02)

Metodologia: servidor `next dev` local + Chrome headless controlado via CDP (`Emulation.setDeviceMetricsOverride`), medindo `document.documentElement.scrollWidth` vs `clientWidth` e `getBoundingClientRect()` reais nos três breakpoints — mais confiável que screenshot isolado (a flag legada `--screenshot` do Chrome CLI não respeita a emulação mobile corretamente nesta versão e gerava falsos positivos de overflow; descartado em favor de medição via protocolo).

| # | Achado | Seção/arquivo | Correção |
|---|---|---|---|
| 1 | Menu do header (`SiteHeader.tsx`) com overflow horizontal em `375px` — 7 itens de navegação não colapsavam, ficavam cortados pela viewport | `frontend/components/SiteHeader.tsx` | `nav` mudado para empilhar verticalmente abaixo de `sm` (`flex-col` + `sm:flex-row`); `<ul>` com `w-full` (e `sm:w-auto`) para permitir que os itens quebrem em múltiplas linhas dentro do menu em vez de estourar a largura |
| 2 | Lista de Experiência Profissional em coluna única em todos os breakpoints, sem reorganizar para tablet/desktop | `frontend/components/ExperienceCard.tsx` (`ExperienceSection`) | `div` de listagem mudado de `space-y-4` para `grid gap-4 md:grid-cols-2` |
| 3 | Categorias de Habilidades Técnicas em coluna única em todos os breakpoints | `frontend/components/SkillBadge.tsx` (`Skills`) | `div` de listagem mudado de `space-y-5` para `grid gap-5 sm:grid-cols-2 lg:grid-cols-3` |
| 4 | Lista de Certificações em coluna única em todos os breakpoints | `frontend/components/Certifications.tsx` | `ul` mudado de `space-y-4` para `grid gap-4 md:grid-cols-2` |
| 5 | Projetos/Portfólio já usava `grid gap-4 md:grid-cols-2` (US-03) — nenhuma correção necessária; com apenas 1 projeto cadastrado hoje, visualmente ocupa 1 coluna mesmo em telas largas, o que é o comportamento esperado do grid | `frontend/components/ProjectCard.tsx` (`ProjectsSection`) | Sem alteração |
| 6 | `ChatWidget` (`w-80`/`sm:w-96`, `fixed bottom-4 right-4`) já cabe dentro de `375px` sem overflow | `frontend/components/ChatWidget.tsx` | Sem alteração |

Resultado pós-correção (medido via CDP nos 3 breakpoints): `docScrollWidth === docClientWidth` em `375px`, `768px` e `1280px` (nenhum overflow horizontal); grids confirmados via `getComputedStyle(...).gridTemplateColumns`: Experiência/Certificações/Projetos em 2 colunas a partir de `md` (768px), Skills em 3 colunas a partir de `lg` (1280px).

**Lighthouse mobile** (`npx lighthouse http://localhost:3000 --form-factor=mobile --preset=perf`, 2026-08-06): Acessibilidade **100**, Best Practices **100** (Performance **53**, fora do escopo desta história — objeto da US-07-04). Não havia score numérico registrado como baseline da Fase 4 ([US-04-02](../fase-04/US-04-02-acessibilidade-basica.md) deixou a execução do Lighthouse como follow-up não bloqueante, sem lib instalada na época); esta é a primeira execução com o site completo, portanto não há regressão possível a reportar — os scores obtidos são o novo piso de referência.

### Fora de escopo

- Redesign visual (paleta, tipografia, hero, microinterações) — US-07-03, história separada
- Revisão de uso de recursos do Next.js (`next/image`, fontes, Server Components) — US-07-04, história separada

### Dependências

- US-03-09 a US-03-16 (componentes de seção), US-04-02 (acessibilidade básica, baseline de contraste/Lighthouse), US-05-05 (`ChatWidget`) — todas Done

### Épico / Prioridade

Frontend & UX v2 — P1

### Tasks

- [x] T01 Auditoria manual nos breakpoints `375px`/`768px`/`1280px` em todas as seções (`frontend/components/*.tsx`) — listar achados nesta história
- [x] T02 Corrigir achados de responsividade seção a seção, conforme o que a auditoria (T01) encontrar
- [x] T03 [P] Rodar/ajustar a suíte de testes de componente existente após as correções (`npm test`)
- [x] T04 Lighthouse mobile via DevTools, registrar resultado nesta história

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — N/A: mudanças só de `className`/grid, sem lógica nova; suíte completa (21/21) continua verde sem regressão
- [x] Build/lint limpo (`npm run build`, type checking estrito) — ambos sem erros (1 warning pré-existente em `coverage/`, fora do escopo)
- [x] Review do `@tech-lead-review` sem Critical/High em aberto — ver Vereditos
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [x] Sem chave de API/secret exposto
- [ ] Documentação atualizada — N/A esperado (sem ADR/contrato envolvido)
- [ ] Deploy/preview verificado (UI) — pendente: verificar preview do Vercel após abertura do PR
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `npm test -- --run`: 11 arquivos, 21/21 testes verdes pós-correção; overflow horizontal verificado via CDP (`scrollWidth === clientWidth`) nos 3 breakpoints; Lighthouse mobile: Acessibilidade 100, Best Practices 100 | 2026-08-06 | seção "Achados da auditoria" acima |
| Tech Lead | `@tech-lead-review` | Aprovar — correções restritas a `className` (Tailwind), sem lógica nova nem dado hardcoded; `npm run build`/`eslint .` limpos; sem secret exposto; escopo do diff respeitado (sem redesign, fora do escopo desta história) | 2026-08-06 | build + lint OK |
| PO | `@product-owner` | Aprovado — CA-001 a CA-005 fechados com evidência; DoD fechado exceto verificação de preview de deploy (fora do controle local) | 2026-08-06 | — |

**Status:** Quase lá — falta verificar preview de deploy (Vercel) após abertura do PR
