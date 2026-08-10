# Checklist de Code Review — Tech Lead (Currículo Online)

Marque N/A quando irrelevante ao diff.

## 1. Correção

- [ ] Componente renderiza o dado esperado a partir de `resume.json`
- [ ] Endpoint responde o contrato esperado (status, shape do JSON)
- [ ] Contrato implementado bate com o documentado no DoR da história (se aplicável — request/response, erros)
- [ ] Mapeamento de erros implementado bate com o do DoR — exceção, código HTTP, body e mensagem (se aplicável)
- [ ] Fluxo de chat: contexto relevante retornado; fallback claro em erro
- [ ] Erros HTTP sem vazar stack trace ao cliente

## 2. Clean Code & SOLID (aplicação leve, não didática)

- [ ] Nomes claros; componentes/funções com uma responsabilidade (SRP)
- [ ] Sem código morto / TODO órfão no escopo
- [ ] Sem abstração/config que o projeto não precisa (over-engineering — YAGNI antes de SOLID)
- [ ] Acoplamento razoável: componente/função não depende de detalhe interno de outro módulo que devia ser encapsulado

Aplicar com bom senso: citar SOLID só quando a violação for concreta e o diff justificar a mudança — não pedir refatoração especulativa num projeto deste tamanho.

## 3. Camadas

| Camada | Deve | Não deve |
|---|---|---|
| `frontend/components` | UI + props tipadas | Lógica de negócio, dado hardcoded |
| `frontend/content` | Dados (`resume.json`) | Lógica |
| `backend/app/chat.py` | Orquestração do endpoint | Lógica de chunking/similaridade |
| `backend/app/rag.py` | Chunking, embeddings, busca | Detalhe HTTP do FastAPI |

- [ ] Conteúdo do currículo vem de `resume.json`, não hardcoded em componente
- [ ] `rag.py` e `chat.py` continuam separados por responsabilidade

## 4. Build

- [ ] `npm run build` (frontend) sem erro
- [ ] `pytest` (backend) sem erro
- [ ] Type checking estrito sem erro (`tsc --noEmit` com `strict: true`; `mypy`/`pyright` no backend)
- [ ] Sem dependência nova sem necessidade clara

## 5. Testes

- [ ] Componente/endpoint principal do diff tem teste, colocado ao lado do arquivo (frontend) ou em `backend/tests/` espelhando `backend/app/` (backend)
- [ ] Cobertura ≥ 70% no código tocado pelo diff (piso do DoD) — atenção redobrada se `rag.py`/`chat.py` ou componentes centrais estiverem no escopo
- [ ] Caso de fallback do chat coberto quando `rag.py`/`chat.py` é tocado
- [ ] Testes determinísticos (LLM mockado, não chamando API real)
- [ ] Mudança em `resume.json` (schema) validada nas duas pontas (Zod no frontend, Pydantic no backend)
- [ ] Identificador de teste em inglês, display (`it()`/docstring pytest) em PT-BR — `../../qa-engineer/references/test-naming-convention.md`

## 6. Acessibilidade e performance (se UI)

- [ ] `alt` em imagens, contraste adequado, navegável por teclado
- [ ] Sem regressão óbvia de performance (imagens não otimizadas, bundle inchado)

## 7. Escopo do PR

- [ ] Sem reformatação em massa fora do escopo
- [ ] Sem mudança de stack/arquitetura sem ADR
- [ ] Se a entrega promoveu ou descartou protótipo: sem restos em `frontend/app/prototipo/` ou `frontend/components/prototypes/` (limpeza no mesmo PR — `docs/agents/PROCESSO-PROTOTIPO.md`)
