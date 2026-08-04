# US-03-16 — Componente de Contato + download do PDF

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F09

**Como** visitante,
**quero** encontrar os canais de contato e baixar o PDF do currículo,
**para** iniciar contato ou guardar uma versão offline.

### Critérios de aceite
- [ ] CA-001: `Contact.tsx` renderiza e-mail, LinkedIn e GitHub de `resume.json.contact`
- [ ] CA-002: botão de download aponta para `resume.json.contact.resumePdfUrl`
- [ ] CA-003: `Contact.test.tsx` cobre a renderização (com mock de dados enquanto US-03-08 não estiver 100% preenchida)

### Fora de escopo
- Geração do arquivo PDF em si

### Dependências
- US-03-09, US-03-08 (parcial — LinkedIn liberado; e-mail/GitHub/PDF pendentes)

### Épico / Prioridade
Frontend — P2

### Tasks
- [ ] T01 Criar `frontend/components/Contact.tsx`
- [ ] T02 [P] Teste `Contact.test.tsx`

**Status:** Ready for Agent (UI); conteúdo final pendente conforme US-03-08
