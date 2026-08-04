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
- População de Hero/Sobre, Experiência (6 empresas / 7 cargos), Formação (3 instituições), Skills (agrupadas), Certificações (1 certificado)
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
- **Contato incompleto**: e-mail público e usuário do GitHub para exibição no site não foram confirmados (o e-mail de conta usado neste ambiente é pessoal e não deve ser assumido como o e-mail público do currículo sem confirmação). LinkedIn já está confirmado: `https://www.linkedin.com/in/lucas-palhares-barbosa/`.
- **PDF do currículo**: não existe ainda; depende de exportação (ex.: gerar a partir do próprio site ou anexar um PDF já existente).

## DoR
- [x] Critérios de aceite claros
- [x] ADR se envolve decisão de stack nova — não envolve (schema já decidido em `CONTEXTO-PROJETO.md`)
- [x] Tasks decompostas (ver `docs/product/backlog/fase-03/`)
- [ ] US-03-07 e parte de US-03-08 aguardam input do autor (não bloqueia as demais histórias do épico)

---

## Conteúdo de referência (fonte: LinkedIn do autor, colado em 2026-08-04)

Uso interno do `@senior-developer` ao implementar US-03-02 a US-03-08 — evita reabrir a conversa com o autor para montar o `resume.json`.

### Hero / Sobre

- **Nome:** Lucas Palhares Barbosa
- **Título/cargo-alvo:** Tech Lead | Senior Software Engineer — AI Engineering | Agentic AI | Java • Python | AWS Certified
- **Localização:** São José do Rio Preto, SP (atuação remota)
- **Resumo (versão longa, para "Sobre"):**
  > Tech Lead e Engenheiro de Software Sênior com mais de 10 anos de experiência desenvolvendo soluções escaláveis para grandes empresas dos setores bancário, telecomunicações e saúde. Atualmente lidera tecnicamente squads na Engineering Brasil responsáveis por soluções estratégicas de Inteligência Artificial para a Claro. Atua na construção de soluções orientadas por IA aplicando práticas modernas de AI Engineering — Context Engineering, Prompt Engineering, Harness Engineering, Agentic AI e Spec-Driven Development (SDD) — para acelerar a engenharia de software e a entrega de valor ao negócio. Como Tech Lead, responde por liderança técnica da squad, definição de arquitetura, mentoria, revisão técnica, padrões de engenharia e condução da adoção de IA no processo de desenvolvimento. Experiência sólida em Java, Python, microsserviços, Spring Boot, Kubernetes, AWS, GCP, APIs REST, Apache Camel e arquiteturas distribuídas.
- **Resumo curto (para Hero, 2-3 frases):** sugestão a validar com o autor — ex.: "Tech Lead e Engenheiro de Software Sênior com 10+ anos construindo soluções escaláveis para bancos, telecom e saúde. Hoje lidero squads de IA aplicada à engenharia de software na Engineering Brasil/Claro, unindo Java, Python e práticas modernas de AI Engineering (Agentic AI, Spec-Driven Development)."

### Experiência Profissional (mais recente → mais antiga)

1. **Engineering Brasil** — Tech Lead | Senior Software Engineer — mar/2026–atual (6 meses) — Remoto, São José do Rio Preto/SP
   Lidera tecnicamente squad de soluções de IA aplicada à engenharia de software para a Claro: arquitetura, mentoria, revisão técnica, padrões de engenharia, condução da adoção de Context Engineering, Prompt Engineering, Harness Engineering, SDD e Agentic AI. Constrói AI Agents e AI Skills. Usa Claude Code e Cursor no dia a dia. Stack: Python, Java, React, Angular, Kubernetes, AWS, GCP.

2. **banco BV** — Senior Software Engineer (Outsourcing) — out/2025–jan/2026 (4 meses) — Remoto
   Squad do BV Cashback. Microsserviços Java 11/17/21 + Spring Boot; correção de CVEs; operação em GKE (GCP); reconstrução da plataforma de Cashback para integrar com a processadora Pismo via Bankly e Apache Camel; uso de IA generativa (Google Gemini) para acelerar análises, refatorações e testes automatizados. Stack: Java 11/17/21, Spring Boot, Apache Camel, GCP/GKE, Kubernetes, Microsserviços, APIs REST, Datadog, GitLab CI, Google Gemini.

3. **Itaú Unibanco** — Software Engineer — jul/2022–set/2025 (3 anos 3 meses) — Remoto, São Paulo
   MVP de Crédito para Energia Solar; evolução da plataforma de Gestão de Microcrédito; microsserviços Java/Spring Boot; APIs REST em nuvem AWS; Clean Architecture, SOLID, Design Patterns, Clean Code, TDD. Reconhecido no PRAD (Programa de Reconhecimento por Alto Desempenho) em 2 anos consecutivos ("Destaca-se em relação ao grupo"). Stack: Java, Spring Boot, Python, AWS (ECS, EKS, Lambda, API Gateway, RDS), Microsserviços, APIs REST, Docker, Kubernetes, Kafka, Jenkins, GitLab CI, JUnit, Mockito.

4. **Shift** — Full Stack Web Developer Pleno — jul/2021–jul/2022 (1 ano 1 mês) — São José do Rio Preto/SP
   Evolução do LIS (Laboratory Information System) para laboratórios de análises clínicas, diagnóstico por imagem, anatomia patológica e imunização — do pré-analítico ao faturamento. Mentoria de desenvolvedores juniores/trainees/estagiários. Stack: Java, Caché ObjectScript (COS), InterSystems IRIS/Caché, ZEN, JavaScript, Angular.

   **Shift** — Full Stack Web Developer Junior — set/2020–jul/2021 (11 meses) — mesmo produto (LIS), mesma stack.

5. **Grupo WebPic** — Full Stack Web Developer — nov/2016–set/2020 (3 anos 11 meses) — São José do Rio Preto/SP
   Sistemas ERP para confecção, varejo e indústria da moda. Integração com TEF e emissão de cupom fiscal (Ceará); módulos fiscais (NF-e, NFC-e, boletos); integrações ERP ↔ e-commerce; apoio ao Scrum Master em cerimônias ágeis. Stack: C#, ASP.NET MVC, SQL Server, JavaScript, Knockout.js, HTML5, CSS3.

6. **WDG Automation (an IBM Company)** — Full Stack Web Developer (Autônomo) — nov/2015–ago/2016 (10 meses) — São José do Rio Preto/SP
   Sistemas de gestão de projetos, CRM e telefonia; Web Services de integração; soluções em GeneXus; automação de testes com Selenium WebDriver e White Framework. Stack: GeneXus, Selenium WebDriver, White Framework, C#, Web Services.

### Formação Acadêmica

| Instituição | Curso | Período |
|---|---|---|
| Centro Universitário Senac | Especialização em Gerenciamento de Projetos | 2016–2017 |
| Fatec Rio Preto | Tecnólogo em Análise e Desenvolvimento de Sistemas | 2013–2015 |
| Etec Philadelpho Gouvêa Netto | Técnico em Informática | 2011–2012 |

### Habilidades Técnicas (agrupadas)

- **Linguagens:** Java, Python, C#, JavaScript
- **Frameworks/Bibliotecas:** Spring Boot, React, Angular, ASP.NET MVC, Apache Camel, Knockout.js
- **Cloud/Infra:** AWS (ECS, EKS, Lambda, API Gateway, RDS), GCP (GKE), Kubernetes, Docker
- **Dados/Mensageria:** Kafka
- **CI/CD & Observabilidade:** Jenkins, GitLab CI, Datadog
- **Arquitetura/Práticas:** Microsserviços, APIs REST, Clean Architecture, SOLID, Design Patterns, Clean Code, TDD
- **AI Engineering:** Context Engineering, Prompt Engineering, Harness Engineering, Spec-Driven Development (SDD), Agentic AI, AI Agents, AI Skills, LLM Engineering, Claude Code, Cursor, Google Gemini
- **Testes:** JUnit, Mockito, Selenium WebDriver, White Framework
- **Legado (saúde):** Caché ObjectScript (COS), InterSystems IRIS/Caché, ZEN
- **Liderança:** liderança técnica, mentoria, arquitetura, revisão de código, definição de padrões

### Certificações

| Certificado | Emissor | Emitido | Expira |
|---|---|---|---|
| AWS Certified Cloud Practitioner | Amazon Web Services (AWS) | jul/2024 | jul/2027 |

### Projetos/Portfólio

Pendente — ver Riscos.

### Contato

- LinkedIn: `https://www.linkedin.com/in/lucas-palhares-barbosa/` (confirmado)
- E-mail público, GitHub, link do PDF: pendentes — ver Riscos.
