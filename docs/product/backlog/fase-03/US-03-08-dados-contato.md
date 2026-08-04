# US-03-08 — Popular seção Contato

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Conteúdo (`PRD-001-conteudo.md`) — ex-US-C08

**Como** visitante/recrutador,
**quero** encontrar facilmente os canais de contato do autor,
**para** iniciar uma conversa (processo seletivo, proposta, networking).

### Critérios de aceite
- [ ] CA-001: `resume.json.contact.linkedin` = `https://www.linkedin.com/in/lucas-palhares-barbosa/`
- [ ] CA-002: `resume.json.contact.email` preenchido com e-mail público confirmado pelo autor
- [ ] CA-003: `resume.json.contact.github` preenchido com usuário confirmado pelo autor
- [ ] CA-004: `resume.json.contact.resumePdfUrl` aponta para o PDF do currículo (depende de US-03-16)
- [ ] CA-005: validado contra o schema de US-03-01

### Fora de escopo
- Botão de download (US-03-16)

### Dependências
- US-03-01
- **Bloqueio parcial:** e-mail público e usuário do GitHub para exibição no site ainda não confirmados pelo autor (LinkedIn já confirmado — CA-001 pode ser implementado desde já)

### Épico / Prioridade
Conteúdo — P2

### Tasks
- [ ] T01 Popular `contact.linkedin` em `frontend/content/resume.json`
- [ ] T02 Popular `contact.email` e `contact.github` — **bloqueada até confirmação do autor**

**Status:** Ready for Agent (parcial — CA-001 liberado; CA-002/CA-003 aguardam confirmação)
