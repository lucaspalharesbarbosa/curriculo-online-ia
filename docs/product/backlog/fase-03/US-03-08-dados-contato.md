# US-03-08 — Popular seção Contato

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Conteúdo (`PRD-001-conteudo.md`) — ex-US-C08

**Como** visitante/recrutador,
**quero** encontrar facilmente os canais de contato do autor,
**para** iniciar uma conversa (processo seletivo, proposta, networking).

### Critérios de aceite
- [x] CA-001: `resume.json.contact.linkedin` = `https://www.linkedin.com/in/lucas-palhares-barbosa/`
- [x] CA-002: `resume.json.contact.email` preenchido com e-mail público confirmado pelo autor (`lucasp.b@hotmail.com`)
- [x] CA-003: `resume.json.contact.github` preenchido com usuário confirmado pelo autor (`https://github.com/lucaspalharesbarbosa`)
- [x] CA-004: `resume.json.contact.resumePdfUrl` aponta para o PDF do currículo em `frontend/public/`
- [x] CA-005: validado contra o schema de US-03-01

### Fora de escopo
- Botão de download (US-03-16)

### Dependências
- US-03-01

### Épico / Prioridade
Conteúdo — P2

### Tasks
- [x] T01 Popular `contact.linkedin` em `frontend/content/resume.json`
- [x] T02 Popular `contact.email`, `contact.github` e `contact.resumePdfUrl`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado | 2026-08-04 | schema + dados confirmados pelo autor |
| Tech Lead | `@tech-lead-review` | Aprovar | 2026-08-04 | e-mail/github/pdf em public/ |
| PO | `@product-owner` | Done | 2026-08-04 | input do autor recebido |

**Status:** Done
