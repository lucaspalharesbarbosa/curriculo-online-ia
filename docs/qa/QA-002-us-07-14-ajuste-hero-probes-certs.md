# Relatório QA — US-07-14 ajuste hero / probes / certs / Destaques

## Resumo

Ajustes de polimento validados: cargos do hero em linhas separadas (`RoleTypewriter` multi-linha), probes do Assistente RAG em 3ª pessoa, Certificações em cards por emissor com lista densa (sem ano duplicado) e labels Projeto/Artigo padronizados via `.project-kind-badge`. Suite do escopo tocado verde; cobertura de lines no pacote de componentes tocados ≥ 70%.

## Veredito

**Aprovado**

## Execução

| Suite / comando | Resultado | Notas |
|---|---|---|
| `npx vitest --run --coverage` (RoleTypewriter, Certifications, ProjectsSection, ProfileAssistChat, ResumeSidebar) | 5 files / 19 tests passed | Coverage lines ~72% (components ~79%) |
| Backend `pytest` | N/A | Sem alteração no backend |

## Cobertura (piso de 70% — DoD)

| Escopo | Cobertura | Meta | Status |
|---|---|---|---|
| Código tocado (components no escopo) | ~79% lines | ≥70% | OK |
| RoleTypewriter (animação completa delete/hold) | ~67% lines | — | Aceitável: caminho reduced-motion + type da 1ª linha cobertos; ramos delete/hold são simétricos |

## Critérios de aceite (CA-*)

| ID | Resultado | Evidência |
|----|-----------|-----------|
| CA-001 | OK | `RoleTypewriter.test` + `ResumeSidebar.test` — linhas distintas; aria-label "Tech Lead e Senior Software Engineer" |
| CA-002 | OK | `ProfileAssistChat.test` — probes "Onde Lucas…", "Quais tecnologias ele…"; sem "você" |
| CA-003 | OK | `Certifications.test` — agrupamento, sem "Emitido YYYY" duplicado, CTA com aria-label, grid amplo com ≥3 credenciais |
| CA-004 | OK | `ProjectsSection.test` — Projeto e Artigo com `project-kind-badge` |
| CA-005 | OK | Sem mudança factual em `resume.json` |
| CA-006 | OK | 19/19 verdes no escopo |

## Fluxo de chat (se tocado)

- [x] Probes/copy só; contrato `/api/chat` inalterado
- [x] Fallback LLM — N/A nesta história
- Latência percebida: N/A

## Acessibilidade/Performance (se UI tocada)

- Lighthouse: N/A nesta rodada (ajuste local de layout)
- Typewriter respeita `prefers-reduced-motion` (teste dedicado)
- CTA cert: `aria-label` "Ver certificado {nome}"

## Falhas

Nenhuma.

## Riscos / follow-ups

1. Cobertura dos ramos delete/hold do typewriter ainda parcial — nit, não bloqueia
2. Validação visual manual no browser recomendada (hero stacked + grid de certs)

## Evidências

- Comando: `npx vitest --run --coverage components/RoleTypewriter.test.tsx components/Certifications.test.tsx components/ProjectsSection.test.tsx components/ProfileAssistChat.test.tsx components/ResumeSidebar.test.tsx`
- Data: 2026-08-10
