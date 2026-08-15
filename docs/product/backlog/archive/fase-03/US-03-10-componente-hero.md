# US-03-10 — Componente Hero/Sobre

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F03

**Como** visitante,
**quero** ver nome, cargo-alvo e resumo do autor assim que abro o site,
**para** entender em segundos quem é e o que faz.

### Critérios de aceite
- [x] CA-001: `Hero.tsx` renderiza `resume.json.hero` (nome, título, resumo curto)
- [x] CA-002: seção "Sobre" renderiza `resume.json.about` (resumo longo)
- [x] CA-003: `Hero.test.tsx` cobre a renderização dos dados

### Fora de escopo
- Dados do `resume.json` (US-03-02)

### Dependências
- US-03-09, US-03-02

### Épico / Prioridade
Frontend — P2

### Tasks
- [x] T01 Criar `frontend/components/Hero.tsx`
- [x] T02 [P] Teste `Hero.test.tsx`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
