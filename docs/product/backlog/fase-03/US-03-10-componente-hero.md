# US-03-10 — Componente Hero/Sobre

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F03

**Como** visitante,
**quero** ver nome, cargo-alvo e resumo do autor assim que abro o site,
**para** entender em segundos quem é e o que faz.

### Critérios de aceite
- [ ] CA-001: `Hero.tsx` renderiza `resume.json.hero` (nome, título, resumo curto)
- [ ] CA-002: seção "Sobre" renderiza `resume.json.about` (resumo longo)
- [ ] CA-003: `Hero.test.tsx` cobre a renderização dos dados

### Fora de escopo
- Dados do `resume.json` (US-03-02)

### Dependências
- US-03-09, US-03-02

### Épico / Prioridade
Frontend — P2

### Tasks
- [ ] T01 Criar `frontend/components/Hero.tsx`
- [ ] T02 [P] Teste `Hero.test.tsx`

**Status:** Ready for Agent
