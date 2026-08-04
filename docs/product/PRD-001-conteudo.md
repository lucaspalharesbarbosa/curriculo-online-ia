# PRD-001 — Conteúdo

**Status:** ready-for-agent
**Épico:** Conteúdo
**Prioridade:** P1 (schema) / P2 (população das seções)

## Problema

O histórico profissional real do autor (mais de 10 anos, 6 empresas, liderança técnica em IA aplicada) hoje só existe disperso no LinkedIn. O site precisa publicá-lo de forma estruturada, correta e fácil de manter — sem reescrever componentes toda vez que o conteúdo mudar.

## Objetivo

`frontend/content/resume.json` valida contra um schema (Zod no frontend, Pydantic no backend) e contém os dados reais do autor nas 6 seções: Hero/Sobre, Experiência, Formação, Skills, Certificações, Contato. Seção Projetos fica com estrutura pronta, aguardando input do autor (ver Riscos).

## Escopo

### Incluído
- Schema do `resume.json` (Zod + Pydantic)
- População de Hero/Sobre, Experiência (6 empresas), Formação (2 instituições), Skills (agrupadas), Certificações (2 certificados)
- Estrutura da seção Contato, com campos que dependem de confirmação do autor (ver Riscos)

### Excluído
- Seção Projetos/Portfólio com conteúdo populado — falta a lista de repositórios que o autor quer destacar (ver Riscos)
- Geração do PDF do currículo (depende de US-03-16/Contato no épico Frontend)
- Layout/componentes que renderizam esses dados (épico Frontend)

## Persona

Visitante/recrutador navegando o site.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| Definir e validar schema do `resume.json` | P1 | [US-03-01](backlog/fase-03/US-03-01-schema-resume-json.md) |
| Popular seção Hero/Sobre | P2 | [US-03-02](backlog/fase-03/US-03-02-dados-hero-sobre.md) |
| Popular seção Experiência Profissional | P2 | [US-03-03](backlog/fase-03/US-03-03-dados-experiencia.md) |
| Popular seção Formação Acadêmica | P2 | [US-03-04](backlog/fase-03/US-03-04-dados-formacao.md) |
| Popular seção Habilidades Técnicas | P2 | [US-03-05](backlog/fase-03/US-03-05-dados-skills.md) |
| Popular seção Certificações | P2 | [US-03-06](backlog/fase-03/US-03-06-dados-certificacoes.md) |
| Popular seção Projetos/Portfólio | P3 (bloqueada) | [US-03-07](backlog/fase-03/US-03-07-dados-projetos.md) |
| Popular seção Contato | P2 (parcialmente bloqueada) | [US-03-08](backlog/fase-03/US-03-08-dados-contato.md) |

## Riscos

- **Projetos/Portfólio sem dados**: o autor não listou repositórios específicos. Este próprio projeto (`curriculo-online-ia`) é candidato natural a primeiro card, mas faltam 1-3 outros para a seção não ficar vazia. US-03-07 fica com DoR incompleto até o autor indicar quais repositórios entram.
- **Contato incompleto**: telefone não está no schema; e-mail e GitHub confirmados no PDF final.
- **PDF do currículo**: fonte de verdade em `frontend/public/Lucas_Palhares_Barbosa_Engenheiro_De_Software.pdf` (atualizado em 2026-08-04).

## DoR
- [x] Critérios de aceite claros
- [x] ADR se envolve decisão de stack nova — não envolve (schema já decidido em `CONTEXTO-PROJETO.md`)
- [x] Tasks decompostas (ver `docs/product/backlog/fase-03/`)
- [ ] US-03-07 aguarda input do autor (não bloqueia as demais histórias do épico)

---

## Conteúdo de referência (fonte: PDF final do autor, 2026-08-04)

Uso interno do `@senior-developer` ao implementar US-03-02 a US-03-08 — evita reabrir a conversa com o autor para montar o `resume.json`.

### Hero / Sobre

- **Nome:** Lucas Palhares Barbosa
- **Título/cargo-alvo:** Tech Lead | Engenheiro de Software Sênior — AI Engineering | Agentic AI | Java • Python | AWS Certified
- **Localização:** São José do Rio Preto, SP (atuação remota)
- **Resumo profissional (curriculo / Hero, 2-3 frases):**
  > Tech Lead e Engenheiro de Software Sênior com mais de 10 anos de experiência em soluções escaláveis para bancos, telecomunicações e saúde. Lidero tecnicamente squads na Engineering Brasil no desenvolvimento de soluções de IA para a Claro, aplicando AI Engineering — Agentic AI, Context Engineering e Spec-Driven Development — para acelerar a entrega de software. Base sólida em arquitetura de microsserviços, Java, Python, Spring Boot, Kubernetes e Cloud, com histórico de entregas estratégicas em produtos de grande porte.
- **Resumo (versão longa, para "Sobre"):** versão expandida em terceira pessoa no `resume.json`, alinhada ao PDF e ao LinkedIn.

### Experiência Profissional (mais recente → mais antiga)

1. **Engineering Brasil** — Tech Lead | Engenheiro de Software Sênior — mar/2026–atual — Remoto
   Tech Lead em projetos de IA para a Claro. Stack: Python, Java, React, Angular, Kubernetes, AWS, AI Engineering, Claude Code, Cursor.

2. **Banco BV** — Engenheiro de Software Sênior (Outsourcing) — out/2025–jan/2026 — Remoto
   Squad do produto Cashback. Correção de CVEs em Java 11/21 + Spring Boot; reconstrução para integração com Pismo via Bankly. Stack: Java 11, Spring Boot, Microsserviços, Kubernetes, GCP (GKE), CI/CD, Bankly, Pismo.

3. **Itaú Unibanco** — Engenheiro de Software Pleno — jul/2022–set/2025 — Remoto
   MVP Crédito Energia Solar; refatoração e realocação de carteiras no Microcrédito. PRAD 2023 e 2024. Stack: Java (Spring Boot), Python, AWS, Microsserviços, API Rest, BFF.

4. **Shift** — Analista de Desenvolvimento Web Pleno — set/2020–jul/2022 — São José do Rio Preto/SP
   LIS (saúde). Modernização COS → Java, monolito → microsserviços. Mentoria. Stack: Java (Quarkus), COS, ZEN, JavaScript, Angular.

5. **WebPic** — Desenvolvedor Web Pleno — nov/2016–set/2020 — São José do Rio Preto/SP
   ERP confecção/moda; TEF e MF-e/CE; apoio a Scrum/PO. Stack: C#, ASP.NET MVC, Windows Forms, Entity Framework, SQL Server, KnockoutJS.

6. **Grupo WDG** — Desenvolvedor Web Junior — nov/2015–ago/2016 — São José do Rio Preto/SP
   CRM e gestão de projetos; automação com Selenium e Test Stack White. Stack: C#, WPF, Entity Framework, Genexus, Selenium.

### Formação Acadêmica

| Instituição | Curso | Período |
|---|---|---|
| Centro Universitário Senac | Pós-graduação em Gerenciamento de Projetos – Práticas do PMI | 2017 |
| FATEC São José do Rio Preto | Graduação em Análise e Desenvolvimento de Sistemas | 2015 |

### Habilidades Técnicas (agrupadas)

- **Linguagens:** Java (Spring Boot), Python, C#
- **Cloud:** AWS (ECS, EKS, Lambda, RDS, API Gateway, CloudWatch)
- **Devops:** Docker, Git, GitLab, CI/CD
- **Arquitetura:** Microsserviços, APIs REST, BFF, Clean Architecture, SOLID, Design Patterns
- **Observabilidade:** Splunk, Grafana, DataDog
- **Frontend:** Angular, React, JavaScript, HTML5, CSS3
- **Banco de Dados:** SQL Server, PostgreSQL
- **Metodologias:** Scrum, Kanban, CI/CD

### Certificações

| Certificado | Emissor | Emitido |
|---|---|---|
| AWS Certified Cloud Practitioner | AWS | 2024 |
| Scrum Fundamentals Certified (SFC) | SCRUMStudy | 2018 |

### Projetos/Portfólio

Pendente — ver Riscos.

### Contato

- LinkedIn: `https://www.linkedin.com/in/lucas-palhares-barbosa/` (confirmado)
- E-mail: `lucasp.b@hotmail.com` (confirmado no PDF)
- GitHub: `https://github.com/lucaspalharesbarbosa` (confirmado)
- PDF: `/Lucas_Palhares_Barbosa_Engenheiro_De_Software.pdf`
