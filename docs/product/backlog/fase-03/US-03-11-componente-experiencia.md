# US-03-11 — Componente de Experiência Profissional

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F04

**Como** visitante,
**quero** ver a lista de experiências profissionais com empresa, período e entregas,
**para** avaliar a trajetória do autor.

### Critérios de aceite
- [ ] CA-001: `ExperienceCard.tsx` renderiza cada item de `resume.json.experiences` (empresa, cargo, período, bullets de entrega, tecnologias)
- [ ] CA-002: lista ordenada do mais recente para o mais antigo
- [ ] CA-003: `ExperienceCard.test.tsx` cobre a renderização de ao menos um item real

### Fora de escopo
- Dados do `resume.json` (US-03-03)

### Dependências
- US-03-09, US-03-03

### Épico / Prioridade
Frontend — P2

### Tasks
- [ ] T01 Criar `frontend/components/ExperienceCard.tsx`
- [ ] T02 [P] Teste `ExperienceCard.test.tsx`

**Status:** Ready for Agent
