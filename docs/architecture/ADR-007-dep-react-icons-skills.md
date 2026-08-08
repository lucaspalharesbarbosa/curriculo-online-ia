# ADR-007 — Adotar `react-icons` para logos das habilidades técnicas

**Status:** Aceita
**Data:** 2026-08-08
**Contexto:** Ajustes pós-validação manual da Fase 07 (via `@orquestrador`), item 6 — dar mais visibilidade à seção Habilidades Técnicas

## Contexto

O autor pediu ícone/logo por item de `skills[].items` (Java, Apache Kafka, Docker etc.) na sidebar, se viável e sem poluir o layout. `lucide-react` (já aprovado no `ADR-005`) só tem ícones genéricos — não tem logos de marca (Java, Kafka, Docker, AWS, PostgreSQL...).

## Decisão

1. **Adotar `react-icons`** (agrega Simple Icons, Devicons, Tabler Icons e outros sob uma API única, tree-shakeable por ícone) só para os logos de marca das habilidades técnicas — `lucide-react` continua a lib default para todo o resto do site (headers de seção, contato, ações).
2. **Mapa centralizado em `frontend/lib/skill-icons.ts`** (`getSkillIcon(skill: string)`): cada string de `skills[].items` mapeia para um ícone de marca (`react-icons/si`, `/di` ou `/tb`, conforme disponibilidade); tecnologia sem logo oficial (ex.: "Clean Architecture", "SOLID", "CI/CD") cai num ícone genérico coerente do `lucide-react`; nome sem mapeamento cai num ícone default (`Code2`) — nenhum item fica sem ícone.
3. **Sem cor de marca própria por ícone** — os ícones herdam a cor de texto do tag (`text-neutral-300` → `text-accent-300` no hover), para não misturar uma paleta multicolorida com a identidade D1 Deep Ice já validada.

## Alternativas consideradas

| Opção | Prós | Contras | Veredito |
|---|---|---|---|
| A) Só `lucide-react` (ícones genéricos por categoria) | Zero deps novas | Não atende ao pedido de reconhecer a marca de cada tecnologia | Descartada |
| B) SVGs de marca baixados manualmente e versionados em `public/` | Sem lib nova | ~30+ arquivos para manter, sem tree-shaking, licença por ícone teria que ser conferida individualmente | Descartada |
| C) **`react-icons`, mapa em `lib/skill-icons.ts` (escolhida)** | Cobertura ampla (vários sets), tree-shaking por import nomeado, licença MIT única | +1 dependência | **Escolhida** |

## Consequências

- `frontend/package.json`: nova dependência `react-icons`.
- `frontend/lib/skill-icons.ts`: mapa único ponto de manutenção — item novo em `skills[]` sem entrada no mapa ainda renderiza (fallback `Code2`), então nunca quebra o build; só fica menos "de marca" até alguém completar o mapa.
- Sem mudança de schema/dado (`resume.json` continua só com strings em `skills[].items`; o ícone é derivado no componente, não persistido).

## Referências

- `ADR-005-deps-template-personal-resume.md`
- `frontend/lib/skill-icons.ts`, `frontend/components/ResumeSidebar.tsx`
