# PRD-010 — Área Administrativa

**Status:** draft
**Épico:** Área Administrativa
**Prioridade:** P3

## Problema

O autor não tem hoje nenhuma forma de saber quem visitou o site e tentou entrar em contato, nem visibilidade sobre como o assistente de chat está sendo usado — todo contato de recrutador acontece fora do controle do site (e-mail/LinkedIn direto).

## Objetivo

Área administrativa protegida por login, com dashboard listando quem entrou em contato pelo site e métricas básicas de uso, para o autor não depender de olhar e-mail/LinkedIn manualmente.

## Escopo

### Incluído
- Login restrito a um único usuário (o autor) — não é sistema multiusuário
- Dashboard com lista de contatos recebidos pelo site (nome, e-mail/telefone, mensagem, data, status)
- Sugestões adicionais para o dashboard (ver seção própria abaixo) — priorização de quais entram na v1 fica para quando a fase virar histórias

### Excluído
- Cadastro de múltiplos usuários/papéis (RBAC) — desproporcional a um projeto de uma pessoa só
- CRM completo (funil, automação de resposta) — o objetivo é visibilidade, não um produto de CRM

## Persona

O próprio autor, como usuário único e administrador.

## Pré-requisito crítico — ainda não resolvido

Hoje a seção de Contato (`frontend/components/Contact.tsx`) só tem **links diretos** (mailto, wa.me, LinkedIn, GitHub) — nada é submetido nem persistido pelo site. **Não existe "quem entrou em contato" para listar** enquanto essa decisão não for tomada. Esta fase depende de uma das duas saídas, a ser decidida junto com o PRD-005:

1. Site ganha um formulário de contato que persiste no backend (exige banco de dados — introdução de stack nova, precisa de ADR) — só então a lista do dashboard tem dado real para mostrar
2. Ou o escopo desta fase é redefinido para focar só em métricas de uso (chat/site), sem "lista de contatos", se o autor preferir manter o Contato como link direto

## Decisões de arquitetura pendentes (exigem ADR antes de qualquer história de dev)

- Estratégia de autenticação (single-user): NextAuth com allowlist de e-mail, magic link, ou solução mais simples proporcional ao projeto
- Onde persistir dados (contatos, métricas) — hoje o projeto não tem banco (`ADR-001` decide "sem banco vetorial" para o RAG, mas não define banco relacional para outros dados). Opção compatível com hospedagem gratuita: Postgres gerenciado free tier (ex. Neon, Supabase) ou SQLite no volume do Render (menos robusto para free tier que reinicia)

## Sugestões para o dashboard (além da lista de contatos)

- Métricas de acesso ao site (visitas, páginas mais vistas) via analytics simples (ex. Vercel Analytics, Plausible, Umami free tier)
- Métricas de uso do chat (nº de perguntas, perguntas mais frequentes, taxa de fallback/erro) — cruza com `PRD-008` (Observabilidade)
- Exportar contatos em CSV
- Marcar contato como respondido/arquivado (status simples, sem workflow complexo)
- Notificação por e-mail quando chega um novo contato (opcional, se a ferramenta de e-mail já usada permitir de graça)
- Toggle simples de manutenção (ex.: desabilitar o `ChatWidget` temporariamente sem precisar de deploy)

## Histórias

Nenhuma história é criada ainda — o pré-requisito de captura de contato (seção acima) e a ADR de auth/persistência precisam ser resolvidos primeiro. Lista preliminar de frentes, sem DoR:

| Frente | Prioridade estimada | Backlog |
|--------|------------|---------|
| ADR: estratégia de autenticação single-user | P1 | — |
| ADR: onde persistir dados (contatos/métricas) | P1 | — |
| Formulário de contato com persistência (depende da decisão do PRD-005) | P1 | — |
| Login da área administrativa | P2 | — |
| Dashboard: lista de contatos recebidos | P2 | — |
| Dashboard: métricas de acesso e de uso do chat | P3 | — |
| Dashboard: export CSV + status do contato | P3 | — |

## Riscos

- Maior feature nova do roadmap: introduz autenticação e banco de dados pela primeira vez no projeto — maior superfície de ataque também (login exposto publicamente é alvo). Tech Lead deve revisar com o mesmo rigor de "chave de API exposta"
- Sem a decisão de captura de contato (ver "Pré-requisito crítico"), esta fase não tem como começar — é um bloqueio real, não burocrático

## DoR do épico
- [ ] Toda história do épico tem seu próprio DoR fechado
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
- [ ] Pré-requisito de captura de contato resolvido (formulário + persistência, ou escopo redefinido)
- [ ] ADR de autenticação e de persistência de dados registradas
