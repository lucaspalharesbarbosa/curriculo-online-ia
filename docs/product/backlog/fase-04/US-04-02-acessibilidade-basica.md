# US-04-02 — Acessibilidade básica

**Fase:** Fase 04 — Polimento
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F11

**Como** visitante que usa leitor de tela ou navega por teclado,
**quero** que o site seja acessível,
**para** conseguir consumir o conteúdo independentemente de como acesso.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (sem endpoint novo/alterado)
- [x] Modelagem de dados documentada — N/A (sem entidade nova)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Frontend; US-03-09 a US-03-16 (todos Done)
- [x] ADR registrado se envolve decisão de stack nova — N/A (ajuste de contraste/`alt`/foco em Tailwind e JSX existentes; sem lib de a11y nova — se `axe-core`/`jest-axe` vier a ser necessário durante o Dev, registrar decisão na história, não exige ADR por ser dependência de teste, não de stack de produto)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — N/A (não cria UI nova; ajusta cores/atributos dos componentes já implementados nas US-03-09…16)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: Testing Library nos testes já existentes de cada componente (`*.test.tsx`) — adicionar/ajustar asserções de `alt` (`getByAltText`/`getByRole("img")`) e de rótulo acessível em links/botões (`getByRole`) onde a seção tiver imagem ou controle interativo
- Integração: N/A
- Manual (obrigatório para aceite): navegação completa só por teclado (Tab/Shift+Tab) por todas as âncoras do header e controles de cada seção, confirmando foco sempre visível; checagem de contraste dos pares de cor em uso (`zinc-900`/`zinc-50` sobre `zinc-50`/`zinc-950`, conforme `frontend/app/layout.tsx`) via DevTools do navegador (Lighthouse/axe do próprio Chrome — sem instalar lib nova)
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done
- [x] CA-001: contraste de cores atende WCAG AA nos textos principais — cálculo de luminância relativa (WCAG 2.x) confirma `zinc-500`/`zinc-50` (claro) em ~4.63:1 (ok) e `zinc-500`/`zinc-950` (escuro) em ~4.12:1 (abaixo de 4.5:1); corrigido para `dark:text-zinc-400` (~7.75:1 sobre `zinc-950`) nas 7 ocorrências sem variante dark; demais pares de cor do site já usavam `zinc-600`/`dark:zinc-400` ou `zinc-900`/`dark:zinc-50`, acima do mínimo
- [x] CA-002: imagens com `alt` descritivo — N/A: nenhuma tag `<img>`/`next/image` existe no projeto (confirmado por busca em `frontend/`); nada a corrigir
- [x] CA-003: navegação completa por teclado (tab order, foco visível) — todos os controles interativos são `<a>`/`next/link` nativos em ordem de DOM = ordem visual; nenhum `outline-none`/supressão de foco em `frontend/app` ou `frontend/components` (confirmado por busca); foco visível padrão do navegador preservado

### Fora de escopo
- Auditoria completa de Lighthouse (`@qa-engineer` verifica quando o site estiver com todas as seções)

### Dependências
- US-03-09 a US-03-16 (todos os componentes de seção)

### Épico / Prioridade
Frontend — P2

### Tasks
- [X] T01 Revisão de contraste, `alt` e navegação por teclado em todos os componentes — contraste: adicionado `dark:text-zinc-400` em 7 ocorrências de `text-zinc-500` sem variante dark (`Hero.tsx`, `ExperienceCard.tsx`×2, `Education.tsx`, `Certifications.tsx`, `SkillBadge.tsx`, `Contact.tsx`) — `zinc-500` sozinho dava ~4.1:1 sobre `zinc-950`, abaixo do mínimo AA (4.5:1); `alt`: N/A, o site não usa nenhuma tag `<img>`/`next/image` (confirmado por busca em todo `frontend/`); teclado: N/A, todos os elementos interativos são `<a>`/`next/link` nativos, sem `outline-none`/supressão de foco em nenhum componente (confirmado por busca)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado (`npm test -- --coverage`) — ou `N/A` com justificativa se o ajuste for só atributo/classe sem lógica nova
- [ ] Build/lint limpo (`npm run build`, type checking estrito)
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API implementado bate com o documentado no DoR — N/A
- [ ] Sem chave de API/secret exposto
- [ ] Documentação atualizada — N/A se nada mudar além do código
- [ ] Deploy/preview verificado (UI)
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent
