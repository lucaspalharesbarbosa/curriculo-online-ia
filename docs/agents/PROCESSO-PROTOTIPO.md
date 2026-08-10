# Processo de Protótipos Visuais — Currículo Online

Processo enxuto para **validar visualmente** (cores, tipografia, UX, telas, features, animações, melhorias etc.) **antes** de decidir se faz e como faz. Protótipo é artefato **temporário de decisão**, não feature permanente.

**Skill:** `@ux-designer`  
**Gatilho:** **somente sob pedido explícito** do autor (ex.: “faz um protótipo…”, `@ux-designer`). Mudança de frontend **não** implica protótipo automático.

---

## Quando usar

| Situação | Prototipar? |
|---|---|
| Autor pediu protótipo / exploração visual | Sim |
| Autor quer ver opções antes de decidir (qualquer aspecto visual) | Sim |
| Implementação direta já decidida (bug, copy, ajuste pontual) | Não |
| Só backend / schema / API | Não |

Escopo típico sob demanda: paleta, fontes, UX/interação, motion, novas telas/seções, features novas, melhorias de UI existente, hierarquia, densidade, responsividade.

---

## Fluxo

```
Autor solicita → Brief → Prototipar → Gate humano → Decisão
                                              ├─ aprovar → promover (prod) → limpar (mesmo PR)
                                              ├─ ajustar → nova rodada no mesmo /prototipo/<slug>
                                              └─ descartar → limpar (mesmo PR; não implementa)
```

### 1. Brief (autor + `@ux-designer` / `@product-owner` se houver US)

- Objetivo da decisão (1 frase)
- O que explorar (ex.: paleta, chat flutuante, tipografia)
- Opções a comparar (letras A/B/C…, no máx. 2–4 por rodada)
- Critérios de escolha (legibilidade, hierarquia, fidelidade ao visual atual, etc.)
- Rota: `/prototipo/<slug>`

### 2. Prototipar (`@ux-designer`)

- Rota em `frontend/app/prototipo/<slug>/` com `robots: noindex`
- Componente em `frontend/components/prototypes/`
- Variantes lado a lado ou selecionáveis por letra
- Dados de `resume.json` (sem mock paralelo de conteúdo)
- Código descartável — sem abstrair “para produção” ainda
- Isolar widgets globais em `/prototipo/*` (ex.: `ChatWidget` já retorna `null` nessas rotas)

### 3. Gate humano (autor)

- Abrir a rota, escolher letra(s) ou rejeitar a direção
- Registrar a escolha na US (se existir) ou no chat: `Escolha: …` + data
- Só então promover ou descartar

### 4. Promover ou descartar (`@senior-developer` / `@ux-designer`)

- **Aprovar:** implementar **só** a variante escolhida nos componentes de produção; testes no código de produção
- **Descartar:** não implementar
- Em ambos: **limpar no mesmo PR** da promoção ou do descarte

### 5. Limpar (mesmo PR)

Remover rota `/prototipo/<slug>`, componentes em `components/prototypes/` e redirects órfãos. A decisão permanece na US/histórico; **código do protótipo não fica no repo**.

---

## Ciclo de vida

```
proposto → ativo → decidido → promovido | descartado → arquivado
```

| Estado | Onde vive | Saída |
|---|---|---|
| proposto | brief / US / chat | rota criada |
| ativo | `/prototipo/<slug>` | autor decide |
| decidido | escolha registrada; rota ainda no ar | promover ou descartar |
| promovido | componentes de produção | limpeza no mesmo PR |
| descartado | sem implementação | limpeza no mesmo PR |
| arquivado | **só texto** (US/chat) | nada em `app/prototipo` / `components/prototypes` |

**TTL:** protótipo ativo sem decisão → perguntar manter / decidir / apagar.  
**Sem** pasta de archive de código de protótipo no frontend.

---

## Integração com agentes

| Skill | Papel |
|---|---|
| `@ux-designer` | Cria, itera e limpa protótipos; **só sob pedido** |
| `@product-owner` | Se o autor pediu protótipo, anota na US (rota + escolha); **não** força protótipo no DoR de toda UI |
| `@orquestrador` | Modo `prototype` **somente** se o autor pedir; pipeline padrão não injeta fase de protótipo |
| `@senior-developer` | Sem pedido → implementa direto; com protótipo aberto → não promove até gate; limpeza no mesmo PR |
| `@tech-lead-review` | Bloqueia merge se decisão já fechada e código de protótipo órfão permanecer no PR |

Detalhes operacionais: `.claude/skills/ux-designer/SKILL.md`.
