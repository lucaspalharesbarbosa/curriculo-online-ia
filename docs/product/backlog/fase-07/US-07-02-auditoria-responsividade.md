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

- [ ] CA-001: nenhuma seção do site produz overflow horizontal em `375px`, `768px` e `1280px`
- [ ] CA-002: todos os controles interativos (nav do header, links de Contato, `ChatWidget`) permanecem visíveis e utilizáveis nos três breakpoints
- [ ] CA-003: grids/listas de múltiplos itens (Experiência, Skills, Projetos, Certificações) reorganizam de coluna única (mobile) para múltiplas colunas (tablet/desktop) sem quebrar texto, sem cards cortados
- [ ] CA-004: Lighthouse mobile não piora nota de Acessibilidade/Best Practices em relação à baseline da Fase 4 nas seções tocadas por esta história
- [ ] CA-005: achados da auditoria (o que foi encontrado e o que foi corrigido) documentados nesta história antes do aceite

### Fora de escopo

- Redesign visual (paleta, tipografia, hero, microinterações) — US-07-03, história separada
- Revisão de uso de recursos do Next.js (`next/image`, fontes, Server Components) — US-07-04, história separada

### Dependências

- US-03-09 a US-03-16 (componentes de seção), US-04-02 (acessibilidade básica, baseline de contraste/Lighthouse), US-05-05 (`ChatWidget`) — todas Done

### Épico / Prioridade

Frontend & UX v2 — P1

### Tasks

- [ ] T01 Auditoria manual nos breakpoints `375px`/`768px`/`1280px` em todas as seções (`frontend/components/*.tsx`) — listar achados nesta história
- [ ] T02 Corrigir achados de responsividade seção a seção, conforme o que a auditoria (T01) encontrar
- [ ] T03 [P] Rodar/ajustar a suíte de testes de componente existente após as correções (`npm test`)
- [ ] T04 Lighthouse mobile via DevTools, registrar resultado nesta história

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — `N/A` esperado para trechos só de `className`/layout sem lógica nova; justificar caso a caso se algum trecho tocado tiver lógica
- [ ] Build/lint limpo (`npm run build`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [ ] Sem chave de API/secret exposto
- [ ] Documentação atualizada — N/A esperado (sem ADR/contrato envolvido)
- [ ] Deploy/preview verificado (UI)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo — sem linha vazia
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | — | — | — |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
