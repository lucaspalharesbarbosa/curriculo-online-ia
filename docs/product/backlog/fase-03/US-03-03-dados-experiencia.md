# US-03-03 — Popular seção Experiência Profissional

**Fase:** Fase 03 — MVP estático
**Épico de origem:** Conteúdo (`PRD-001-conteudo.md`) — ex-US-C03

**Como** visitante/recrutador,
**quero** ver o histórico profissional completo com empresa, cargo, período e principais entregas,
**para** avaliar a trajetória e o nível de senioridade do autor.

### Critérios de aceite
- [ ] CA-001: `resume.json.experiences` lista as 6 empresas / 7 cargos reais (Engineering Brasil, banco BV, Itaú Unibanco, Shift ×2, Grupo WebPic, WDG Automation), com empresa, cargo, período, localização/modalidade e bullets de entrega (não só tarefa)
- [ ] CA-002: cada entrada lista as tecnologias principais do vínculo
- [ ] CA-003: ordenado do mais recente para o mais antigo
- [ ] CA-004: validado contra o schema de US-03-01

### Fora de escopo
- Renderização visual (US-03-11)

### Dependências
- US-03-01

### Épico / Prioridade
Conteúdo — P2

### Tasks
- [ ] T01 Popular `experiences` (6 empresas / 7 cargos) em `frontend/content/resume.json`

**Status:** Ready for Agent
