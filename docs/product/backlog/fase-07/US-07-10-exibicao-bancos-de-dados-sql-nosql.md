# US-07-10 — Melhorar a exibição de Bancos de Dados (SQL/NoSQL)

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** distinguir rapidamente quais tecnologias de banco de dados são SQL e quais são NoSQL,
**para** avaliar minha experiência em cada modelo de dado sem precisar ler os rótulos das categorias com atenção.

### Contexto

Hoje `Banco de Dados (SQL)` (SQL Server, PostgreSQL) e `Banco de Dados (NoSQL)` (Redis, DynamoDB) são duas categorias de `skills[]` renderizadas exatamente como qualquer outra (ex.: "Mensageria", "Observabilidade") — mesmo chip, mesmo layout, sem nenhuma pista visual do que diferencia os dois grupos. Autor pediu uma forma melhor de exibir essa distinção.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem mudança de schema; pode reagrupar as duas categorias existentes na apresentação, sem alterar `resume.json`)
- [x] Plano de testes definido (abaixo)
- [x] Épico e dependências identificados — Frontend & UX v2; independente de US-07-09
- [x] ADR registrado — N/A: usa tokens/lib já aprovados
- [x] Variáveis de ambiente/segredos — N/A
- [x] Referência visual definida — autor aprovou a opção **6 "colunas leves"** (das 3 variações extras entre as opções 1 e 2 originais): duas colunas dentro de um único bloco "Banco de Dados", sem preenchimento colorido saturado, só uma linha de destaque no topo de cada coluna
- [x] Sem dúvida bloqueante

#### Plano de testes

- Unitário: `ResumeSidebar.test.tsx` — continua cobrindo que os nomes das tecnologias de banco (`SQL Server`, `PostgreSQL`, `Redis`, `DynamoDB`) aparecem, e que a distinção SQL/NoSQL é identificável no markup (texto ou `aria-label`, não só cor)
- Manual: contraste WCAG AA dos novos indicadores (badge/ícone/cor) sobre `glass`/`surface`

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: SQL e NoSQL ficam visualmente distinguíveis à primeira vista — duas colunas lado a lado sob um único cabeçalho "Banco de Dados", cada uma com sub-título próprio ("Relacional (SQL)" / "Não-relacional (NoSQL)")
- [x] CA-002: layout usa o conceito aprovado pelo autor (opção 6) — colunas neutras (`bg-neutral-800/30`, mesma família visual do resto da sidebar), só uma linha de destaque no topo de cada coluna (`accent-400` para SQL, `accent-600` para NoSQL — sem hue nova, dentro da paleta D1 Deep Ice já aprovada)
- [x] CA-003: distinção não depende só de cor — o rótulo textual de cada coluna ("Relacional (SQL)"/"Não-relacional (NoSQL)") é a pista primária; a linha de destaque no topo é reforço secundário, não a única pista
- [x] CA-004: contraste WCAG AA mantido — reaproveita os tokens já validados (`accent-400`/`accent-600` sobre `neutral-800`, mesmos usados em outros elementos da sidebar), sem cor nova introduzida
- [x] CA-005: `ResumeSidebar.test.tsx` e suíte completa (`vitest run`) 100% verdes — 11 arquivos, 42/42 (novo teste cobrindo o merge SQL/NoSQL)
- [x] CA-006: `npm run build`/`lint` limpos

### Fora de escopo

- Mudança de dados/tecnologias listadas (`resume.json`)
- Redesign de outras categorias de skills

### Dependências

- US-07-03 (base visual), `ADR-005`

### Épico / Prioridade

Frontend & UX v2 — P2

### Tasks

- [x] T01 Propor conceitos de apresentação (artifact comparativo, incluindo 3 variações extras entre as opções 1 e 2) e obter aprovação do autor — opção 6 escolhida
- [x] T02 `frontend/components/ResumeSidebar.tsx` (+ teste) — categorias "Banco de Dados (SQL)"/"(NoSQL)" combinadas num único bloco de 2 colunas; lógica de merge isolada por nome de categoria (`SQL_CATEGORY`/`NOSQL_CATEGORY`); chip de habilidade extraído para `SkillChip` (reuso nas 3 posições: SQL, NoSQL, categorias genéricas)
- [x] T03 `npm test`, `npm run build`, `npm run lint` — evidência de DoD (ver Vereditos)

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — teste novo dedicado ("combina Banco de Dados (SQL) e (NoSQL) num único bloco de colunas") cobrindo o merge; `SkillChip` extraído continua exercitado pelos testes existentes (chips de outras categorias)
- [x] Build/lint limpo — `npm run build`/`lint` OK; durante a implementação, extrair o ícone para um componente nomeado (`SkillChip`) acionou o lint `react-hooks/static-components` ("componente criado durante o render") porque `getSkillIcon(skill.name)` rodava dentro do componente — corrigido resolvendo o ícone no `.map()` do chamador e passando como prop `icon: ReactNode`
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — N/A (sem ADR/contrato novo)
- [x] Deploy/preview verificado (UI) — autor confirmou preview/produção 2026-08-11
- [x] Vereditos QA, Tech Lead e PO na tabela abaixo
- [x] Status da história atualizado

### Ajustes pós-entrega (2026-08-08 — revisão de layout, via `@orquestrador`)

Após uso real, o autor apontou que a opção 6 ("colunas leves", CA-002) cortava nomes longos (`SQL Server`, `DynamoDB`): a largura da sidebar (~340 px) dividida em 2 colunas lado a lado não sobrava espaço suficiente para nome + medidor de proficiência. Pedido explícito: sugerir outras formas e aprovar antes de implementar.

- Propostas 3 alternativas em artifact comparativo (seções empilhadas / lista única com etiqueta / lista única com divisor) — autor aprovou **"Seções empilhadas"**: mantém as duas caixas com rótulo "Relacional (SQL)"/"Não-relacional (NoSQL)" e a linha de destaque no topo (`accent-400`/`accent-600`) já validadas no CA-002/CA-004, só troca `grid-cols-2` por empilhamento vertical (`space-y-2`) — cada item volta a ter a largura inteira da sidebar, então o nome não corta mais.
- `ResumeSidebar.tsx`: bloco "Banco de Dados" alterado; `truncate` removido dos rótulos de subgrupo (não são mais necessários na largura cheia, mas o `truncate` do nome de cada skill em `SkillChip` continua como salvaguarda, igual às outras categorias).
- Sem mudança de dado/schema — mesmas categorias `Banco de Dados (SQL)`/`(NoSQL)` de `resume.json`, mesma lógica de merge por nome de categoria.
- `ResumeSidebar.test.tsx` (teste "combina Banco de Dados (SQL) e (NoSQL)...") não dependia da estrutura de grid, só dos textos "Relacional (SQL)"/"Não-relacional (NoSQL)" — continua verde sem alteração.
- `vitest run`: 11 arquivos, 45/45 verdes; `npm run build` (com `validate:resume`) e `npm run lint` OK.

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `vitest run`: 11 arquivos, 42/42 verdes (inclui o teste novo de merge SQL/NoSQL); `npm run build`/`lint` limpos após corrigir o `react-hooks/static-components` na extração do `SkillChip`; contraste inalterado (reaproveita `accent-400`/`accent-600`, sem cor nova); distinção SQL/NoSQL não depende só de cor (rótulo textual como pista primária) | 2026-08-08 | `ResumeSidebar.tsx`, `ResumeSidebar.test.tsx` |
| Tech Lead | `@tech-lead-review` | Aprovar — diff contido a um componente; extração do `SkillChip` é uma simplificação real (elimina duplicação entre 3 pontos de renderização de chip) e resolveu corretamente o lint de "componente criado durante o render" movendo a resolução do ícone para o `.map()` do chamador; decisão de manter a paleta cyan (accent-400/600) em vez do verde/roxo do mockup original respeita a restrição de paleta única (D1 Deep Ice) já valendo pra todas as histórias da Fase 07; nenhuma chave/CORS tocado | 2026-08-08 | `frontend/components/ResumeSidebar.tsx` |
| PO | `@product-owner` | Quase lá — CA-001–006 fechados, DoD fechado exceto preview de deploy formal (autor já validou no dev local); opção 6 aprovada implementada fielmente, com ajuste consciente de paleta (sem introduzir cor nova) comunicado no CA-002 | 2026-08-08 | avaliação acima |
| QA (revisão — seções empilhadas) | `@qa-engineer` | Aprovado — `vitest run`: 11 arquivos, 45/45 verdes (nenhuma asserção de teste dependia da estrutura de grid); `npm run build` (com `validate:resume`) e `npm run lint` limpos; nome dos 4 itens (`SQL Server`, `PostgreSQL`, `Redis`, `DynamoDB`) não corta mais na largura real da sidebar; distinção SQL/NoSQL preservada (rótulo textual + linha de destaque no topo, mesmos tokens já validados) | 2026-08-08 | `ResumeSidebar.tsx` |
| Tech Lead (revisão — seções empilhadas) | `@tech-lead-review` | Aprovar — troca local de `grid-cols-2` por `space-y-2` num único bloco já isolado (`SkillChip` reaproveitado sem alteração); nenhuma mudança de schema/dado; resolve a causa raiz do corte (largura insuficiente por coluna) em vez de paliativo (ex.: reduzir fonte); sem chave de API/CORS tocado | 2026-08-08 | `frontend/components/ResumeSidebar.tsx` |
| PO (revisão — seções empilhadas) | `@product-owner` | Aceito — autor aprovou a opção "Seções empilhadas" entre 3 alternativas propostas antes da implementação (conforme pedido); nome não corta mais; status da história permanece Quase lá (mesma pendência de preview de deploy formal) | 2026-08-08 | avaliação acima |
| PO | `@product-owner` | Aceito/Done — autor confirmou preview/produção 2026-08-11; DoD completo | 2026-08-11 | preview/produção |

**Status:** Done
