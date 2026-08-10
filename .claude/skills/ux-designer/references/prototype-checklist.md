# Checklist — Protótipo UI (`@ux-designer`)

## Antes de criar (brief)

- [ ] Autor pediu protótipo / exploração visual explicitamente
- [ ] Objetivo da decisão em uma frase
- [ ] Escopo do que analisar (cor, tipo, UX, tela, motion, etc.)
- [ ] 2–4 variantes planejadas (letras)
- [ ] Slug `/prototipo/<kebab-case>` definido

## Ao criar / atualizar

- [ ] `frontend/app/prototipo/<slug>/page.tsx` com `robots: noindex`
- [ ] Componente em `frontend/components/prototypes/`
- [ ] Letras A/B/C… visíveis na UI
- [ ] Dados de `resume.json` (sem fatos inventados)
- [ ] Sem duplicar `ChatWidget` global (rota sob `/prototipo`)
- [ ] Apresentar rota + tabela de variantes ao autor e **parar no gate humano**

## Após decisão do autor

- [ ] Escolha ou descarte registrado (US ou chat) com data
- [ ] Se aprovado: variante escolhida implementada em produção (ou handoff `@senior-developer`)
- [ ] Removidos no **mesmo PR**: rota(s), componente(s) de prototype, redirects órfãos
- [ ] Nenhum arquivo sob `app/prototipo/<slug>` ou prototype correspondente restante

## Não fazer

- [ ] Prototipar sem pedido
- [ ] Deixar protótipo “para referência futura” no código
- [ ] Testes unitários obrigatórios no código descartável
- [ ] Limpeza em PR separado da promoção/descarte
