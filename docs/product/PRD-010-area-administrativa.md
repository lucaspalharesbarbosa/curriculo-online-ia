# PRD-010 — Área Administrativa

**Status:** draft
**Épico:** Área Administrativa
**Prioridade:** P3

## Problema

O autor não tem hoje nenhuma forma de saber como o site e o assistente de chat estão sendo usados — todo contato de recrutador acontece fora do controle do site (e-mail/LinkedIn/WhatsApp direto).

## Objetivo

Área administrativa protegida por login, com dashboard de métricas básicas de acesso e de uso do chat, para o autor não depender só de testes manuais ou relatos de visitantes.

## Escopo

### Incluído
- Login restrito a um único usuário (o autor) — não é sistema multiusuário
- Dashboard com métricas de acesso ao site e de uso do chat
- Sugestões adicionais para o dashboard (ver seção própria abaixo) — priorização de quais entram na v1 fica para quando a fase virar histórias

### Excluído
- Lista de contatos recebidos / formulário de contato com persistência — decisão 2026-08-06 (`PRD-005`): Contato permanece link direto (mailto/wa.me); sem captura no site
- Cadastro de múltiplos usuários/papéis (RBAC) — desproporcional a um projeto de uma pessoa só
- CRM completo (funil, automação de resposta) — o objetivo é visibilidade, não um produto de CRM

## Persona

O próprio autor, como usuário único e administrador.

## Pré-requisito de captura de contato — resolvido (2026-08-06)

Hoje a seção de Contato só tem **links diretos** (mailto, wa.me, LinkedIn, GitHub). O autor optou por **manter link direto**, sem formulário com persistência. Consequência: esta fase **não** inclui lista de contatos recebidos — o escopo fica em métricas de acesso/uso do chat.

## Decisões de arquitetura pendentes (exigem ADR antes de qualquer história de dev)

- Estratégia de autenticação (single-user): NextAuth com allowlist de e-mail, magic link, ou solução mais simples proporcional ao projeto
- Onde persistir métricas — hoje o projeto não tem banco (`ADR-001` decide "sem banco vetorial" para o RAG, mas não define banco relacional para outros dados). Opção compatível com hospedagem gratuita: Postgres gerenciado free tier (ex. Neon, Supabase) ou SQLite no volume do Render (menos robusto para free tier que reinicia). Alternativa: depender só de analytics externo (Vercel Analytics / Plausible) sem persistência própria

## Sugestões para o dashboard

- Métricas de acesso ao site (visitas, páginas mais vistas) via analytics simples (ex. Vercel Analytics, Plausible, Umami free tier)
- Métricas de uso do chat (nº de perguntas, perguntas mais frequentes, taxa de fallback/erro) — cruza com `PRD-008` (Observabilidade)
- Toggle simples de manutenção (ex.: desabilitar o `ChatWidget` temporariamente sem precisar de deploy)

## Histórias

Nenhuma história é criada ainda — faltam as ADRs de auth/persistência (ou a escolha de analytics externo sem banco próprio). Lista preliminar de frentes, sem DoR:

| Frente | Prioridade estimada | Backlog |
|--------|------------|---------|
| ADR: estratégia de autenticação single-user | P1 | — |
| ADR: onde persistir métricas (ou só analytics externo) | P1 | — |
| Login da área administrativa | P2 | — |
| Dashboard: métricas de acesso e de uso do chat | P2 | — |

## Riscos

- Introduz autenticação (e possivelmente banco) pela primeira vez no projeto — maior superfície de ataque (login exposto publicamente é alvo). Tech Lead deve revisar com o mesmo rigor de "chave de API exposta"
- Se a escolha for só analytics externo, o "dashboard" pode ser o próprio painel do provedor — aí a área admin no site pode ser desproporcional; reavaliar no momento de decompor histórias

## DoR do épico
- [ ] Toda história do épico tem seu próprio DoR fechado
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
- [x] Pré-requisito de captura de contato resolvido — link direto; sem lista de contatos nesta fase (2026-08-06)
- [ ] ADR de autenticação e de persistência/analytics registradas
