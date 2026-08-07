# US-07-03 — Redesign visual do site (paleta, tipografia, hero, microinterações)

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** uma experiência visual mais moderna e coesa (paleta, tipografia, hero e microinterações),
**para** perceber o site como algo cuidado e atual, não só funcional.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (sem endpoint novo/alterado; só UI/CSS)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem entidade nova)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Frontend & UX v2 (`PRD-005`); depende de US-07-02 (auditoria de responsividade) estar Done antes de redesenhar, para não corrigir responsividade em cima de um layout que ainda vai mudar; componentes de seção (US-03-09 a US-03-16) já Done
- [x] ADR registrado se envolve decisão de stack nova — N/A (permanece dentro do Tailwind já adotado; `next/font` já é recurso nativo do Next.js atual, não é lib nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — template **Omnira** (Framer), https://omnira.framer.website/, print enviado pelo autor em 2026-08-06 (ver subseção "Referência visual" abaixo)
- [x] Sem dúvida bloqueante

#### Referência visual

Template **Omnira · Futuristic portfolio template** (Framer) — https://omnira.framer.website/. Análise a partir de print de página inteira enviado pelo autor (WebFetch não trouxe cor/fonte exatas por ser site Framer renderizado via JS).

- **Paleta:** fundo quase preto (`#0A0A0A`–`#0D0D0D`, muito próximo do `--background: #0a0a0a` já usado no dark mode atual em `frontend/app/globals.css:17`); superfícies de card num cinza-escuro levemente mais claro (`#141414`–`#1C1C1C`); acento único em laranja vibrante (`#FF7A1A`–`#FF8A2E`, aprox.) usado com moderação — CTA, badges/tags, ícones, linhas de destaque; texto principal branco/quase-branco, texto secundário cinza médio (`#9CA3AF` aprox.). Tokens exatos (hex final) ficam a critério do Dev dentro dessa direção, **sempre validados por CA-006 (WCAG AA)** antes de fechar CA-001.
- **Tipografia:** sans-serif grotesk/geométrica, bold, uppercase nos títulos, tracking apertado (ex.: "DESIGN BEYOND THE SYSTEM"); pequenos rótulos "eyebrow" em uppercase com letter-spacing acima de cada headline de seção; contraste forte entre peso do título (bold/black) e peso do corpo (regular). Não precisa ser a fonte litearal do Omnira — manter `next/font` (Geist já carregado) é aceitável desde que a hierarquia bold/uppercase seja seguida (CA-002 já cobre isso).
- **Hero (CA-003):** layout assimétrico — bloco de texto à esquerda (badge pequeno acima do título, headline grande em 2-3 linhas, subtítulo curto, botão CTA laranja preenchido) e imagem/elemento visual à direita; fundo escuro sólido, sem gradiente pesado.
- **Padrões de seção reutilizáveis:** badge/tag "eyebrow" uppercase antes de cada título de seção; grid de cards com cantos arredondados e imagens/gráficos coloridos de destaque; um elemento gráfico "tech" (linha isométrica/wireframe 3D) como assinatura visual futurista — opcional, não é critério de aceite, é inspiração de tom.
- **Microinterações (CA-004):** hover/transições sutis em cards, nav e CTA — sem especificação de curva/duração exata na referência; Dev usa bom senso (ease padrão do Tailwind, ~150-250ms), respeitando `prefers-reduced-motion`.
- **Fora do escopo desta referência:** cores exatas em hex, fonte exata usada pelo Omnira e comportamento pixel-a-pixel das animações — não foram extraídos (sem screenshot em alta fidelidade nem inspeção de CSS). Interpretação é guiada pela direção estética acima, não replicação literal.

#### Plano de testes

- Unitário/integração: suíte existente de cada componente (`*.test.tsx`) — não deve regredir após troca de paleta/tipografia/hero
- Manual (obrigatório para aceite): revisão visual da referência aprovada aplicada em todas as seções, em light e dark mode
- Lighthouse mobile (Acessibilidade/Best Practices) — sem regressão face à baseline mais recente (Fase 4 / US-07-02)
- Checagem de contraste da paleta nova em WCAG AA (mesmo padrão corrigido em US-04-02)
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: nova paleta de cores (tokens em `frontend/app/globals.css`, bloco `@theme`) aplicada de forma consistente em todas as seções, com suporte a dark mode mantido
- [ ] CA-002: tipografia aplicada via `next/font` de fato usada no `body`/componentes, substituindo o fallback atual (`font-family: Arial, Helvetica` em `frontend/app/globals.css:25`, que hoje ignora a variável `--font-geist-sans` já carregada)
- [ ] CA-003: `Hero` (`frontend/components/Hero.tsx`) redesenhado conforme a referência aprovada pelo autor
- [ ] CA-004: pelo menos uma microinteração (hover/transition) adicionada em elementos interativos-chave (nav, cards, CTA de contato), respeitando `prefers-reduced-motion`
- [ ] CA-005: Lighthouse mobile não piora nota de Acessibilidade/Best Practices em relação à baseline mais recente (Fase 4 / US-07-02)
- [ ] CA-006: paleta nova passa em contraste WCAG AA (mesmo padrão corrigido em US-04-02)

### Fora de escopo

- Auditoria/correção de responsividade — US-07-02, história separada, deve estar concluída antes desta
- Revisão de recursos do Next.js (`next/image`, Server Components) — US-07-04, história separada
- Troca de framework ou de biblioteca de UI

### Dependências

- US-07-02 (auditoria de responsividade) — recomendado concluir antes, para não redesenhar em cima de layout que ainda vai mudar
- US-04-02 (baseline de acessibilidade/contraste)
- US-03-09 a US-03-16 (componentes de seção) — todas Done

### Épico / Prioridade

Frontend & UX v2 — P2

### Tasks

- [ ] T01 Definir tokens de paleta em `frontend/app/globals.css` (`@theme`) a partir da referência aprovada
- [ ] T02 [P] Configurar tipografia via `next/font` em `frontend/app/layout.tsx`, removendo o fallback `Arial, Helvetica`
- [ ] T03 Redesenhar `frontend/components/Hero.tsx` conforme referência
- [ ] T04 Adicionar microinterações (hover/transition) em componentes interativos-chave, respeitando `prefers-reduced-motion`
- [ ] T05 [P] Rodar suíte de testes existente e Lighthouse mobile, registrar resultado nesta história

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — `N/A` esperado para trechos só de `className`/estilo sem lógica nova; justificar caso a caso se algum trecho tocado tiver lógica
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
