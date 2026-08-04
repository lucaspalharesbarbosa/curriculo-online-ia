# Checklist de Entrega — Desenvolvedor Sênior (Currículo Online)

Verificar antes de declarar implementação concluída. Projeto solo, pequeno — checklist proporcional, sem burocracia de squad grande.

---

## DoR (antes de começar)

- [ ] DoR da história 100% fechado — contrato de API, modelagem de dados, plano de testes (quando aplicável), critérios de aceite claros
- [ ] DoR aberto → devolver ao `@product-owner`, não começar a implementar

## Escopo

- [ ] Comportamento alinhado à história de usuário / pedido
- [ ] Diff mínimo — sem abstração ou config que o projeto não precisa
- [ ] Decisão de stack nova (fora do que está em `CONTEXTO-PROJETO.md`) → escalada ao `@arquiteto-ia-senior`

## Código

- [ ] Pasta correta (`frontend/components`, `frontend/app`, `frontend/content`, `backend/app`)
- [ ] Conteúdo do currículo vem de `resume.json`, não hardcoded
- [ ] Sem chave de API no client ou commitada no repo
- [ ] Convenções de lint/format respeitadas (ESLint+Prettier / ruff+black)
- [ ] Contrato de API implementado bate com o documentado no DoR (se aplicável)

## Testes

- [ ] `npm test` (frontend) ou `pytest` (backend) executado no serviço alterado
- [ ] Componente/endpoint principal tocado tem teste cobrindo o caso de uso
- [ ] Cobertura ≥ 70% no código tocado (`--coverage` / `--cov`) — piso do DoD, `N/A` com justificativa se não houver lógica testável
- [ ] Fluxo de chat, se tocado: caso feliz + fallback de erro

## Acessibilidade e performance (se UI)

- [ ] Contraste, alt em imagens, navegação por teclado
- [ ] Sem regressão óbvia de performance (imagens otimizadas, sem bundle desnecessário)

## Documentação

- [ ] História do backlog marcada como concluída (se aplicável)
- [ ] ADR atualizado se decisão de arquitetura mudou

## Handoff

- [ ] Sugerir `@tech-lead-review`
- [ ] Sugerir `@qa-engineer` se o fluxo de chat/RAG foi tocado

---

## Comandos rápidos

```bash
# Frontend
cd frontend && npm run lint && npm test

# Backend
cd backend && ruff check . && pytest
```

---

## Critério de "pronto"

**Pronto** = DoR fechado antes de começar + código no escopo + teste do que foi tocado passando com cobertura ≥ 70% + lint limpo + sem chave de API exposta + história marcada (se aplicável) + checklist sem bloqueios. "Pronto" do dev não é "Done" da história — Done exige DoD fechado pelo `@product-owner`.
