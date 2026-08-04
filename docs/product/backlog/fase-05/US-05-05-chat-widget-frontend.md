# US-05-05 — ChatWidget no frontend

**Fase:** Fase 05 — Feature de IA (RAG)
**Épico de origem:** RAG (`PRD-003-rag.md`) — ex-US-R06

**Como** visitante,
**quero** conversar com o assistente diretamente no site,
**para** não precisar de outra ferramenta.

### Critérios de aceite
- [ ] CA-001: `ChatWidget.tsx` envia pergunta para `POST /chat` e exibe a resposta
- [ ] CA-002: estado de carregamento e erro tratados na UI
- [ ] CA-003: `ChatWidget.test.tsx` cobre envio de pergunta e exibição de resposta (mock do backend)

### Fora de escopo
- Lógica de RAG (backend)

### Dependências
- US-05-04

### Épico / Prioridade
RAG — P3

### Tasks
- [ ] T01 Criar `frontend/components/ChatWidget.tsx`
- [ ] T02 [P] Teste `ChatWidget.test.tsx`

**Status:** Blocked — aguarda US-05-04
