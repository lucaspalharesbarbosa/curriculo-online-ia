# PRD-002 — Frontend

**Status:** ready-for-agent
**Épico:** Frontend
**Prioridade:** P1 (setup) / P2 (componentes e polimento)

## Problema

Hoje não existe site publicado — o histórico profissional do autor só existe no LinkedIn. É preciso um site pessoal, rápido e acessível, que renderize os dados de `frontend/content/resume.json` (épico Conteúdo) de forma clara para um recrutador.

## Objetivo

Site Next.js no ar (mesmo que incompleto no início) com as 6 seções principais renderizadas a partir do `resume.json`, navegação em página única, acessível (contraste, alt, teclado) e com SEO básico.

## Escopo

### Incluído
- Setup do projeto Next.js + TypeScript + Tailwind em `frontend/`
- Layout base e navegação entre seções
- Componentes: Hero, Experiência, Formação, Skills, Certificações, Contato (+ botão de download do PDF)
- Componente de Projetos (renderização pronta; conteúdo real depende de US-03-07)
- Acessibilidade básica e SEO/meta tags

### Excluído
- `ChatWidget` e integração com o backend de RAG (épico RAG)
- Deploy na Vercel (épico Deploy)
- Geração do arquivo PDF em si (só o botão/link — depende de onde o PDF for hospedado)

## Persona

Visitante/recrutador navegando o site.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| Setup do projeto Next.js (TS + Tailwind) | P1 | [US-02-01](backlog/fase-02/US-02-01-setup-nextjs.md) |
| Layout base e navegação entre seções | P1 | [US-03-09](backlog/fase-03/US-03-09-layout-navegacao.md) |
| Componente Hero/Sobre | P2 | [US-03-10](backlog/fase-03/US-03-10-componente-hero.md) |
| Componente de Experiência Profissional | P2 | [US-03-11](backlog/fase-03/US-03-11-componente-experiencia.md) |
| Componente de Formação Acadêmica | P2 | [US-03-12](backlog/fase-03/US-03-12-componente-formacao.md) |
| Componente de Habilidades Técnicas | P2 | [US-03-13](backlog/fase-03/US-03-13-componente-skills.md) |
| Componente de Projetos/Portfólio | P3 (depende de US-03-07) | [US-03-14](backlog/fase-03/US-03-14-componente-projetos.md) |
| Componente de Certificações | P2 | [US-03-15](backlog/fase-03/US-03-15-componente-certificacoes.md) |
| Componente de Contato + download do PDF | P2 (parcial, depende de US-03-08) | [US-03-16](backlog/fase-03/US-03-16-componente-contato-pdf.md) |
| SEO básico (meta tags, Open Graph) | P2 | [US-04-01](backlog/fase-04/US-04-01-seo-basico.md) |
| Acessibilidade (contraste, alt, navegação por teclado) | P2 | [US-04-02](backlog/fase-04/US-04-02-acessibilidade-basica.md) |

## Riscos

- Sem dados reais de Projetos e parte de Contato (ver `docs/product/PRD-001-conteudo.md`), US-03-14 e parte de US-03-16 ficam com escopo de UI pronto mas sem conteúdo final até o autor completar as pendências de Conteúdo.
- Nenhuma decisão de stack nova — segue Next.js/TS/Tailwind já definido em `CONTEXTO-PROJETO.md`, sem necessidade de ADR.

## DoR
- [x] Critérios de aceite claros
- [x] ADR se envolve decisão de stack nova — não envolve
- [x] Tasks decompostas (ver `docs/product/backlog/fase-02/`, `fase-03/` e `fase-04/`)
- [x] Sem dúvida bloqueante para US-02-01, US-03-09 a US-03-13, US-03-15, US-04-01/US-04-02
