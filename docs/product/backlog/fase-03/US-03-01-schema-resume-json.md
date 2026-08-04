# US-03-01 — Definir e validar schema do resume.json

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Conteúdo (`PRD-001-conteudo.md`) — ex-US-C01

**Como** desenvolvedor,
**quero** um schema validado (Zod no frontend, Pydantic no backend) para o `resume.json`,
**para** que dado inválido/malformado falhe em build/teste, não em runtime no site publicado.

### Critérios de aceite
- [ ] CA-001: schema Zod cobre as 6 seções (hero, experiences, education, skills, certifications, contact) + projects (estrutura, mesmo sem dados ainda)
- [ ] CA-002: schema Pydantic espelha o mesmo contrato no backend
- [ ] CA-003: build/teste falha se `resume.json` não bater com o schema

### Fora de escopo
- Popular os dados (US-03-02 a US-03-08)

### Dependências
- Nenhuma

### Épico / Prioridade
Conteúdo — P1

### Tasks
- [ ] T01 Criar schema Zod em `frontend/content/resume.schema.ts`
- [ ] T02 [P] Criar schema Pydantic em `backend/app/models/resume.py`
- [ ] T03 [P] Teste de validação `frontend/content/resume.schema.test.ts`
- [ ] T04 [P] Teste de validação `backend/tests/test_resume_schema.py`

**Status:** Ready for Agent
