# US-03-16 — Componente de Contato + download do PDF

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Frontend (`PRD-002-frontend.md`) — ex-US-F09

**Como** visitante,
**quero** encontrar os canais de contato e baixar o PDF do currículo,
**para** iniciar contato ou guardar uma versão offline.

### Critérios de aceite
- [x] CA-001: `Contact.tsx` renderiza e-mail, LinkedIn e GitHub de `resume.json.contact`
- [x] CA-002: botão de download aponta para `resume.json.contact.resumePdfUrl`
- [x] CA-003: `Contact.test.tsx` cobre a renderização

### Fora de escopo
- Geração do arquivo PDF em si — PDF fornecido pelo autor; experiência Engineering Brasil inserida no arquivo em `frontend/public/`

### Dependências
- US-03-09, US-03-08

### Épico / Prioridade
Frontend — P2

### Tasks
- [x] T01 Criar `frontend/components/Contact.tsx`
- [x] T02 [P] Teste `Contact.test.tsx`
- [x] T03 Publicar PDF em `frontend/public/` e vincular em `resume.json`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-04 | Contact.test.tsx + download link |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-04 | PDF estático em public/ |
| PO | `@product-owner` | Done | 2026-08-04 | PDF do autor publicado com EngDb |

**Status:** Done
