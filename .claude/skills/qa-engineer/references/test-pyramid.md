# Pirâmide de Testes — Currículo Online

| Nível | Objetivo | Exemplo | Quando |
|---|---|---|---|
| Unitário (frontend) | Componente renderiza e reage a props | `ExperienceCard.test.tsx` | Sempre no componente alterado |
| Unitário (backend) | Regra isolada (chunking, similaridade) | `test_rag.py` com mocks | Sempre no módulo alterado |
| Integração | Endpoint completo | `TestClient` no `/chat`, LLM mockado | Endpoint novo/alterado |
| Fluxo de chat | Resposta + fallback | Pergunta conhecida → resposta esperada; erro do provider → mensagem de fallback | Toda mudança em `rag.py`/`chat.py` |
| E2E automatizado | `e2e/` (raiz do repo) | Playwright, sobe frontend + backend | Fluxos ponta a ponta críticos (S1-S6 de `e2e-scenarios.md`), antes de release |
| Acessibilidade/Performance | Lighthouse | Contraste, alt, navegação por teclado, score de performance | Antes de deploy relevante |
| Regressão | Suite completa | `npm test` + `pytest` | Mudança no schema do `resume.json` ou em módulo compartilhado |

**Proporcional ao projeto:** não é sistema crítico — não perseguir cobertura global de 100%. Piso do DoD (`@product-owner`): **70% de cobertura no código tocado por cada história**, com atenção redobrada em `rag.py`, `chat.py` e componentes centrais do frontend; fora desses módulos, cobrir o caminho feliz + fallback do chat é suficiente para ultrapassar o piso.

**Mudança em `resume.json` (schema):** rodar a suite de componentes que leem o campo alterado — regressão rápida, não é preciso E2E completo.
