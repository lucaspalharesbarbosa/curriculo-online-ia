# US-07-04 — Revisão de uso de recursos do Next.js (`next/image`, fontes, Server Components)

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador acessando o site,
**quero** que ele carregue rápido e de forma eficiente,
**para** ter uma boa experiência mesmo em conexões mais lentas ou dispositivos mais fracos.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (sem endpoint novo/alterado)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem entidade nova)
- [x] Plano de testes definido (ver subseção)
- [x] Épico e dependências identificados — Frontend & UX v2 (`PRD-005`); recomendado rodar depois de US-07-03 (redesign) para não retrabalhar imagens/hero que ainda vão mudar de aparência — não é bloqueante técnico, é sequenciamento para evitar retrabalho
- [x] ADR registrado se envolve decisão de stack nova — N/A (`next/image`, `next/font`, Server Components já são recursos nativos do Next.js já adotado, `ADR-001`; não é lib/stack nova)
- [x] Variáveis de ambiente/segredos necessários identificados — N/A
- [x] Referência visual definida — N/A (revisão técnica de performance/arquitetura de componentes, não redesign; aparência final não deve mudar)
- [x] Sem dúvida bloqueante

#### Plano de testes

- Build: `npm run build` sem warnings de imagem não otimizada (`next/image`) nem de fonte
- Unitário/integração: suíte existente de cada componente (`*.test.tsx`) — não deve regredir ao trocar `<img>`/marcação de `"use client"`
- Lighthouse mobile (Performance) — comparar com a baseline mais recente (Fase 4 / US-07-02 / US-07-03, a que estiver disponível no momento)
- Mocks necessários: N/A

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: imagens estáticas relevantes (ex.: ícones grandes, imagens de seção, se houver) usam `next/image` em vez de `<img>` cru, com `alt` e dimensões definidas
- [ ] CA-002: fontes carregadas via `next/font` efetivamente aplicadas no `body`/componentes — corrigido o fallback silencioso hoje presente em `frontend/app/globals.css:25` (`font-family: Arial, Helvetica`, que ignora `--font-geist-sans` já carregado) caso ainda não tenha sido resolvido em US-07-03
- [ ] CA-003: componentes de seção sem estado/interação do cliente avaliados para rodar como Server Components (sem `"use client"` desnecessário); `ChatWidget` e demais componentes com interatividade real permanecem Client Components
- [ ] CA-004: Lighthouse Performance mobile não piora em relação à baseline mais recente; melhora é o resultado esperado
- [ ] CA-005: achados da revisão (o que foi encontrado, o que foi mudado, o que foi mantido e por quê) documentados nesta história antes do aceite

### Fora de escopo

- Redesign visual (paleta, tipografia, hero) — US-07-03, história separada
- Auditoria/correção de responsividade — US-07-02, história separada
- Migração para CDN externo de imagens ou outro framework

### Dependências

- US-07-03 (redesign visual) — recomendado concluir antes, para evitar retrabalho em imagens/hero; não bloqueia tecnicamente o início desta história
- US-03-09 a US-03-16 (componentes de seção) — todas Done

### Épico / Prioridade

Frontend & UX v2 — P3

### Tasks

- [ ] T01 Auditar uso de `<img>` vs `next/image` em `frontend/components/*.tsx`, listar achados nesta história
- [ ] T02 Migrar imagens elegíveis para `next/image`
- [ ] T03 Corrigir uso de fontes (`next/font`) — aplicar `--font-geist-sans`/`--font-geist-mono` de fato no lugar do fallback `Arial, Helvetica`
- [ ] T04 [P] Avaliar `"use client"` em cada componente de seção; remover onde não houver necessidade real de interatividade
- [ ] T05 Rodar build/lint/testes + Lighthouse Performance mobile, registrar achados e resultado nesta história

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — `N/A` esperado para trechos só de import/marcação sem lógica nova; justificar caso a caso
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
