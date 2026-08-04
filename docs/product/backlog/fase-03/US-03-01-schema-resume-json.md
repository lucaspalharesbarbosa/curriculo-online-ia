# US-03-01 — Definir e validar schema do resume.json

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Conteúdo (`PRD-001-conteudo.md`) — ex-US-C01

**Como** desenvolvedor,
**quero** um schema validado (Zod no frontend, Pydantic no backend) para o `resume.json`,
**para** que dado inválido/malformado falhe em build/teste, não em runtime no site publicado.

### Critérios de aceite
- [x] CA-001: schema Zod cobre as 6 seções (hero, experiences, education, skills, certifications, contact) + projects (estrutura, mesmo sem dados ainda)
- [x] CA-002: schema Pydantic espelha o mesmo contrato no backend
- [x] CA-003: build/teste falha se `resume.json` não bater com o schema

### Fora de escopo
- Popular os dados (US-03-02 a US-03-08)

### Dependências
- Nenhuma

### Épico / Prioridade
Conteúdo — P1

### Tasks
- [x] T01 Criar schema Zod em `frontend/content/resume.schema.ts`
- [x] T02 [P] Criar schema Pydantic em `backend/app/models/resume.py`
- [x] T03 [P] Teste de validação `frontend/content/resume.schema.test.ts`
- [x] T04 [P] Teste de validação `backend/tests/test_resume_schema.py`

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | @qa-engineer | Aprovado | 2026-08-04 | lint + testes + build passando no escopo |
| Tech Lead | @tech-lead-review | Aprovar | 2026-08-04 | diff minimo, schema espelhado, componentes tipados |
| PO | @product-owner | Done | 2026-08-04 | criterios de aceite fechados |

**Status:** Done
