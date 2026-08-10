# QA-001 — US-07-13 polimento UX / Assistente RAG

## Resumo

Validação da US-07-13: seções (educação, certificações, destaques), hero typewriter, Assistente RAG (copy/portal/loading) e proxy same-origin `/api/chat`. Suite unitária do escopo tocado verde; cobertura do código tocado acima do piso de 70%.

## Veredito

**Aprovado com ressalvas**

## Execução

| Suite / comando | Resultado | Notas |
|---|---|---|
| `npm test -- --run` (escopo tocado) | 25 passed | Education, Certs, Projects, Sidebar, ProfileAssist, ChatWidget, Summary, RoleTypewriter |
| `npm test -- --coverage` (escopo) | Statements 77.69% / Lines 78.12% | ≥70% OK |
| `npx eslint` (arquivos tocados) | limpo | após fix setState-in-effect |
| Smoke chat local real | Ambiente | Precisa `backend/.env` com `LLM_API_KEY` + `API_URL` local; proxy ok no client |

## Cobertura (piso de 70% — DoD)

| Escopo | Cobertura | Meta | Status |
|---|---|---|---|
| Código tocado nesta história | ~78% lines | ≥70% | OK |

## Critérios de aceite (CA-*)

| ID | Resultado | Evidência |
|----|-----------|-----------|
| CA-001 | OK | Marcador B mantido (confirmado autor) |
| CA-002 | OK | CTA `Site` + ArrowUpRight; testes Education |
| CA-003 | OK | Cards por credencial + CTA; testes Certifications |
| CA-004 | OK | `createPortal` + `z-[200]` |
| CA-005 | OK | ícone Sparkles + CTA "Ler artigo" |
| CA-006 | OK | `RoleTypewriter` com `>_` + loop; reduced-motion |
| CA-007 | OK | Assistente RAG + stages + probes |
| CA-008 | OK | `/api/chat` proxy; client same-origin |
| CA-009 | OK | sem inventar fatos |
| CA-010 | OK | 25 testes verdes |

## Fluxo de chat (se tocado)

- [x] Client chama `/api/chat` (sem CORS no browser)
- [x] Fallback de erro no widget (`RESUME_CHAT_ERROR_MESSAGE`)
- [ ] Smoke manual local com LLM real — depende de `LLM_API_KEY` no backend

## Ressalvas

1. Em produção (Vercel), configurar `API_URL` apontando para o Render — sem isso o proxy local-default falha no deploy.
2. Chat local exige `backend/.env` com `LLM_API_KEY` (antes faltava; causa 500).

## Falhas

Nenhuma no escopo automatizado.
