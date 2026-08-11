# QA-004 — US-07-15 Redesign mobile-first

**História:** [US-07-15](../product/backlog/fase-07/US-07-15-redesign-mobile-first.md)  
**Data:** 2026-08-11  
**Agente:** `@qa-engineer`

## Escopo testado

- Hero mobile + skills sheet + bottom nav (scroll-spy)
- Chat sheet / forceOpen / minimize
- Regressão: Home, ResumeSidebar, ExperienceSection
- Build Next.js produção

## Evidências automatizadas

```text
cd frontend && npm test -- --run
# 16 files / 64 tests — PASSED

cd frontend && npm run build
# Compiled successfully + TypeScript OK
```

## Checklist manual (breakpoints)

| Breakpoint | Verificar |
|---|---|
| 375 | First viewport: foto/nome/papel/CTAs; sem muro de skills |
| 390–430 | Bottom nav ≤2 toques; sheet skills; chat FAB |
| 768 | Tablet/nav; sidebar ainda oculta (`lg`) |
| 1024 | Sidebar sticky; bottom nav some |
| 1280 | Chat lateral `xl` |
| Teclado | Sheet sobe com `visualViewport` (device real) |
| `prefers-reduced-motion` | Entradas sem spring exagerado |

## Achados

| Severidade | Achado | Status |
|---|---|---|
| Low | Dois `<h1>` no DOM (mobile+desktop); CSS esconde um — jsdom vê ambos | Aceito; follow-up opcional com matchMedia |
| Low | Validação de teclado iOS/`visualViewport` depende de device real / preview | Pendente no DoD de preview |
| Info | Orbs pesados desligados no mobile pequeno — risco de jank mitigado | OK |

## Veredito

**Aprovado com ressalvas** — suite e build verdes; ressalva = smoke visual em device/preview ainda não executado neste ambiente (checklist acima para o autor).
