# US-07-05 — Conteúdo novo: progressão de cargo, reconhecimentos, formação técnica, cursos livres e artigos

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`) — conteúdo do currículo (`resume.json`), na esteira do redesign da US-07-03

**Como** visitante/recrutador,
**quero** ver a progressão de cargo do autor na Shift e na WebPic, os reconhecimentos internos que recebeu no Itaú, a formação técnica (Etec), os certificados de cursos livres e os artigos que ele escreveu,
**para** ter uma visão mais completa e precisa da trajetória profissional dele — inclusive pelo chat de IA.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (sem endpoint novo/alterado; `/chat` continua com o mesmo contrato, só passa a enxergar mais chunks)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — sim: novo array `articles[]` + campo opcional `certifications[].credentialUrl` (Zod + Pydantic) — `ADR-006`
- [x] Plano de testes definido (abaixo)
- [x] Épico e dependências identificados — Frontend & UX v2 (`PRD-005`); depende do layout já entregue em US-07-03 (`Certifications`, `ExperienceSection`, `EducationSection`, `ProjectsSection`)
- [x] ADR registrado — `ADR-006` (novo array `articles[]`, `credentialUrl` opcional, extensão do chunking do RAG)
- [x] Variáveis de ambiente/segredos — N/A (nenhum segredo novo; regeneração do índice do RAG em produção usa `LLM_API_KEY` já existente no Render)
- [x] Referência visual definida — N/A (usa os componentes/estilo já existentes de `Certifications`, `ExperienceSection`, `EducationSection`, `ProjectsSection`)
- [x] Sem dúvida bloqueante — datas/divisão de destaques da WebPic confirmadas com o autor (corte da promoção em 2018-05; mesmos 3 destaques duplicados nas duas fases)

#### Modelagem de dados

- `resume.schema.ts` (Zod) e `backend/app/models/resume.py` (Pydantic): `certificationSchema`/`Certification` ganha `credentialUrl`/`credential_url` opcional (`string().url().nullable().default(null)`, mesmo padrão de `logoUrl`); novo `articleSchema`/`Article` (`title`, `description`, `url`, `source`, `publishedAt` nullable); `resumeSchema.articles`/`Resume.articles: list[Article]`
- `frontend/content/resume.json`: dado real (sem entidade relacionada nova além do array `articles`) — ver `ADR-006`

#### Plano de testes

- Unitário frontend: `Certifications.test.tsx` (renderiza link "Ver certificado" quando `credentialUrl` presente, nada quando `null`), `ProjectsSection.test.tsx` (renderiza artigos com ícone/rótulo distintos dos projetos), `page.test.tsx` (sem dado do template, novo prop `articles`)
- Unitário backend: `test_rag.py` — chunk novo por certificação/educação/artigo; `test_resume_model.py` (se existir) cobrindo `credentialUrl`/`Article`
- Schema: `parseResume`/`Resume.model_validate` não falha com o `resume.json` atualizado (cobre implicitamente no `npm run build` e nos testes de backend que carregam o fixture)
- Manual: build de produção do frontend renderizando as novas seções; conferência visual dos 3 novos assets (`imagem-prad-itau-2023-2024.jpg`, `reconhecimento-merito-itau-2025.jpg`, `etec_philadelpho_logo.jpg`) já presentes em `frontend/public/`

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: experiência da Shift dividida em duas entradas em `experiences[]` — "Junior Web Developer" (2020-09 a 2021-07) e "Web Developer" (2021-07 a 2022-07), com destaques/tecnologias derivados do LinkedIn informado pelo autor
- [x] CA-002: experiência da WebPic dividida em duas entradas — "Junior Web Developer" (2016-11 a 2018-05) e "Web Developer" (2018-05 a 2020-09), mesmos 3 destaques/tecnologias duplicados nas duas fases (confirmado com o autor), mesmo `logoUrl`
- [x] CA-003: `certifications[]` ganha "Reconhecimento PRAD — 2 anos consecutivos (2023 e 2024)" (`logoUrl: /imagem-prad-itau-2023-2024.jpg`) e "Reconhecimento de Mérito" 2024 (`logoUrl: /reconhecimento-merito-itau-2025.jpg`), issuer "Itaú Unibanco"
- [x] CA-004: `education[]` ganha "Técnico em Informática" — Etec Philadelpho Gouvêa Netto, 2011–2012, `logoUrl: /etec_philadelpho_logo.jpg`, mantendo ordem reverso-cronológica do array
- [x] CA-005: `certifications[]` ganha os 7 certificados de cursos livres informados pelo autor (Full Cycle, Alura ×4, Asimov Academy ×2), cada um com `credentialUrl` apontando para o link de validação informado
- [x] CA-006: `certificationSchema`/`Certification` ganha `credentialUrl` opcional (Zod + Pydantic); `Certifications.tsx` renderiza link "Ver certificado" (`target="_blank"`, `rel="noopener noreferrer"`) só quando `credentialUrl` não é `null`
- [x] CA-007: novo `articles[]` em `resume.json`/schema com os 2 artigos autorais (refatoração — Shift; Scrum — Medium); `ProjectsSection.tsx` ("Destaques") passa a aceitar `articles` e renderiza um card por artigo no mesmo grid dos projetos, com ícone/rótulo "Ler artigo" (não "Repositório")
- [x] CA-008: `backend/app/rag.py` gera chunk por certificação, por formação e por artigo (além de experiência/skill/projeto já existentes); `build_chunks` cobre as 6 seções
- [x] CA-009: `npm run build`, `npm test`, `pytest` e `ruff check` passam sem erro após as mudanças

### Fora de escopo

- Regenerar o índice do RAG localmente (`backend/app/rag_index.json`) — exige `LLM_API_KEY`, que não está disponível neste ambiente; acontece no próximo deploy/reindexação em produção
- Redesign visual/animações (US-07-06, história separada)
- Adicionar `credentialUrl` aos 2 certificados já existentes (AWS, Scrum Fundamentals) — autor não forneceu os links
- Nova seção dedicada só para artigos (decisão do `ADR-006`: entram em "Destaques")

### Dependências

- US-07-03 (componentes `Certifications`, `ExperienceSection`, `EducationSection`, `ProjectsSection` já existem)
- `ADR-003` (fluxo de RAG original), `ADR-006` (extensão desta história)
- Assets já enviados pelo autor em `frontend/public/`: `imagem-prad-itau-2023-2024.jpg`, `reconhecimento-merito-itau-2025.jpg`, `etec_philadelpho_logo.jpg`

### Épico / Prioridade

Frontend & UX v2 — P1

### Tasks

- [x] T01 `ADR-006` (feito) + `frontend/content/resume.schema.ts` (`credentialUrl`, `articleSchema`) + `backend/app/models/resume.py` (espelho Pydantic)
- [x] T02 `frontend/content/resume.json` — split Shift/WebPic, certificações novas, educação Etec, `articles[]` (fundação; bloqueia T03–T05)
- [x] T03 [P] `frontend/components/Certifications.tsx` + `Certifications.test.tsx` (link `credentialUrl`)
- [x] T04 [P] `frontend/components/ProjectsSection.tsx` + `ProjectsSection.test.tsx` + `frontend/app/page.tsx` (prop `articles`)
- [x] T05 [P] `backend/app/rag.py` + `backend/tests/test_rag.py` (chunking de certificação/educação/artigo)
- [x] T06 `npm test` / `npm run build` / `pytest` / `ruff check` — evidência de DoD

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado — frontend 94,62% stmts / 82,75% branches (suíte completa); backend 97% (`app/rag.py` 95%, `app/models/resume.py` 100%)
- [x] Build/lint limpo — `npm run build` OK (inclui `validate:resume` contra o schema Zod), `npm run lint` sem erro (1 warning pré-existente em `coverage/`), `ruff check .` sem erro
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação atualizada — `ADR-006` criado; `US-07-05` preenchida
- [x] Deploy/preview verificado (UI) — autor confirmou preview/produção 2026-08-11; reindex RAG produção feito pelo autor
- [x] Vereditos QA, Tech Lead e PO na tabela abaixo
- [x] Status da história atualizado

### Ajustes pós-entrega (2026-08-08 — pós-validação manual, via `@orquestrador`)

Refinamentos sobre a entrega já revisada (CA-003/005/007), sem reabrir DoR:

- **Reconhecimentos separados de Certificações** (`ADR-006`, addendum 2026-08-08): o autor apontou que PRAD/Mérito (reconhecimento interno, sem emissor externo verificável) e certificados/cursos formais (AWS, Scrum, Full Cycle, Alura, Asimov) são conceitos diferentes. Novo array `recognitions[]` (`recognitionSchema`/`Recognition`, Zod + Pydantic) e novo componente `Recognitions.tsx`, renderizado em seção própria entre Certificações e Destaques. `backend/app/rag.py` ganhou `_chunk_recognition`; `build_chunks` agora soma 7 fontes (era 6).
- **Fotos do PRAD/Mérito usadas só como referência**, nunca como imagem no site (pedido explícito do autor) — `Recognitions.tsx` sempre renderiza um ícone de medalha decorativo (`lucide-react`), nunca uma foto; os dois `.jpg` originais continuam em `frontend/public/` sem referência em nenhum componente (documentado no `ADR-006` para não parecerem asset órfão).
- **Logos dos cursos livres** (CA-005): os 7 certificados de Full Cycle/Alura/Asimov ganharam `logoUrl` apontando para os logos oficiais que o autor enviou (`alura-logo.png`, `logo-full-cycle.png`, `logo-asimov.png`, renomeados de arquivos sem extensão para `.png` — confirmado via assinatura do arquivo, todos PNG). AWS e Scrum Fundamentals já tinham logo desde a entrega original.
- **Clareza em Destaques** (CA-007): `ProjectsSection.tsx` ganhou um selo "PROJETO"/"ARTIGO" no topo de cada card (ícone + rótulo), deixando explícito qual card é repositório de código e qual é publicação externa — pedido do autor após notar que os dois tipos de card pareciam iguais à primeira vista. Subtítulo da seção ajustado para "Projetos e Artigos Publicados".
- Copy de `Certifications.tsx` ajustada para "Cursos e Credenciais Técnicas" (a subtítulo anterior, "Reconhecimentos e Conquistas", agora pertence à seção `Recognitions` separada); ícone do cabeçalho trocado de `Trophy` (foi para `Recognitions`) para `BadgeCheck`.

### Ajustes pós-entrega, rodada 2 (2026-08-08 — pedido de melhorias de layout, via `@orquestrador`)

Autor pediu 3 melhorias pontuais sobre o conteúdo/layout já entregue (Certificações, Reconhecimentos, Educação), fora do escopo de US-07-10 (essa cobre só a exibição de Bancos de Dados em Habilidades Técnicas, tratada à parte por exigir aprovação prévia de conceito). Sem reabrir DoR — mesmo padrão da rodada 1:

- **Certificações — ícone por certificado + item único mais limpo** (`Certifications.tsx`): cada certificado dentro de um grupo (ex.: os 4 da Alura) ganha um ícone próprio (`ShieldCheck`, `accent-400`) ao lado do nome, complementando o logo do emissor já mostrado uma vez no cabeçalho do grupo — dá identidade visual a cada item, não só ao grupo. Grupos com um único certificado (AWS, SCRUMStudy, Full Cycle) deixaram de mostrar a legenda redundante "1 certificado" — o próprio item abaixo do emissor já comunica isso, ficando mais limpo.
- **Reconhecimentos — PRAD 2023 e 2024 separados + explicação em tooltip**: `recognitions[]` passou de 2 para 3 itens (PRAD 2024, Mérito 2024, PRAD 2023) — o autor apontou que juntar "2023 e 2024" num só card escondia que são dois reconhecimentos anuais distintos. A `description` de cada item passou a explicar a sigla PRAD (Programa de Remuneração de Alto Desempenho) e o que é o reconhecimento de Mérito, e deixou de aparecer como texto fixo no card — agora é exibida num balão (`role="tooltip"`) ao passar o mouse ou focar um botão de informação (`Info`, `lucide-react`) ao lado do título, via `aria-describedby` + CSS (`group-hover`/`group-focus-within`), sem lib nova.
- **Educação — link do site oficial**: novo campo opcional `websiteUrl` em `educationSchema`/`Education` (Zod + Pydantic, `ADR-006` addendum 2026-08-08), preenchido para as 3 instituições — link exato do curso cursado (não a página institucional genérica), informado pelo autor após uma primeira tentativa via busca: Centro Universitário Senac (pós em Gerenciamento de Projetos), FATEC São José do Rio Preto (Análise e Desenvolvimento de Sistemas), Etec Philadelpho Gouvêa Netto (Informática para Internet). `EducationSection.tsx` renderiza um ícone discreto (`Globe`) ao lado do nome da instituição, só quando o campo está preenchido — sem alterar o restante do card.
- Testes novos/atualizados: `EducationSection.test.tsx` (+2, link presente/ausente), `Recognitions.test.tsx` (+1, tooltip associado via `aria-describedby`); `Certifications.test.tsx` sem mudança necessária (asserções já cobriam o comportamento preservado).
- Suíte completa (`npm test -- --run`): 11 arquivos, 45/45 verdes; `npm run build` (inclui `validate:resume`) e `npm run lint` OK; backend `pytest -q`: 27/27 verdes (sem chunk novo — `websiteUrl` é só apresentação); `ruff check .` sem erro.

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `npm test -- --run`: 10 arquivos, 27/27 verdes; `npm run build` OK (`validate:resume` valida `resume.json` contra o Zod); `npm run lint` sem erro; `pytest -q` backend 26/26 verdes; `ruff check` sem erro; cobertura frontend 94,62% stmts, backend 97%; validação manual via HTML renderizado em `next start` (build de produção): 7 ocorrências de "Ver certificado" (bate com os 7 cursos com `credentialUrl`), 2 de "Ler artigo" (bate com os 2 artigos), `certifications-heading`/`education-heading`/`projects-heading` presentes | 2026-08-08 | CA-001–009; `vitest --coverage`, `pytest --cov` |
| Tech Lead | `@tech-lead-review` | Aprovar — diff aditivo e consistente com os padrões já existentes (mesmo formato de chunk do `rag.py`, mesmo padrão de campo opcional `nullable().default(null)` de `logoUrl`/`expiresAt`); sem chave de API/segredo tocado; sem breaking change de schema (`credentialUrl`/`articles` aditivos, certificados/projeto existentes continuam válidos); `key` de React únicas nos novos itens (`company-startDate` diverge entre as fases Junior/Pleno; `article.title` não colide com `project.title`); `ADR-006` documenta a decisão de não reaproveitar `projects[]` para artigos | 2026-08-08 | `ADR-006`; diff de `Certifications.tsx`, `ProjectsSection.tsx`, `rag.py` |
| PO | `@product-owner` | Quase lá — CAs e DoD de código 100% fechados; conteúdo real do autor incorporado (progressão Shift/WebPic, PRAD, Mérito, Etec, 7 cursos, 2 artigos) e RAG ampliado conforme pedido; falta só verificar preview de deploy após abertura do PR | 2026-08-08 | resume.json atualizado; ADR-006 |
| QA (recognitions/logos/Destaques, pós-validação) | `@qa-engineer` | Aprovado — `vitest run`: 12 arquivos, 33/33 verdes (3 novos em `Recognitions.test.tsx`); `npm run build` OK (`validate:resume` valida `recognitions[]`); `pytest -q` backend 27/27 verdes (novo teste de chunk de reconhecimento); `ruff check` sem erro; QA visual (Chrome headless + CDP, scroll real) confirmou: seção "Reconhecimentos" com medalha decorativa (nenhuma `<img>` renderizada nos 2 cards, conforme ADR-006), 7 logos de curso servidos corretamente (Alura/Full Cycle/Asimov), selos "PROJETO"/"ARTIGO" visíveis e distintos em Destaques | 2026-08-08 | `Recognitions.tsx`, `resume.json`, `rag.py`, capturas CDP |
| Tech Lead (recognitions/logos/Destaques, pós-validação) | `@tech-lead-review` | Aprovar — `recognitionSchema`/`Recognition` espelhados corretamente entre Zod e Pydantic; `_chunk_recognition` segue o mesmo padrão de `_chunk_certification`; mudança em `certifications[]` (remoção de PRAD/Mérito) é uma alteração de conteúdo, não de schema — não quebra consumidores existentes do array; RAG precisa de reindexação em produção após o próximo deploy (já documentado no addendum do `ADR-006`, mesma pendência já existente para `articles[]`); sem chave de API/CORS tocado | 2026-08-08 | `ADR-006` (addendum), `resume.schema.ts`, `backend/app/models/resume.py` |
| PO (recognitions/logos/Destaques, pós-validação) | `@product-owner` | Aceito — Reconhecimentos agora é seção própria (sem usar as fotos como imagem, só como referência de contexto para a IA), cursos com logo, Destaques com selo claro de tipo; status da história permanece Quase lá (mesma pendência de preview Vercel + reindexação do RAG em produção) | 2026-08-08 | avaliação acima |
| QA (rodada 2 — ícone por certificado, PRAD/tooltip, link de educação) | `@qa-engineer` | Aprovado — `vitest run`: 11 arquivos, 45/45 verdes (inclui os 3 testes novos); `npm run build` (com `validate:resume`) e `npm run lint` limpos; `pytest -q` backend 27/27 verdes; `ruff check` sem erro; tooltip de Reconhecimentos verificado via `aria-describedby`/`role="tooltip"` (acessível a teclado e leitor de tela, não só hover); link de site em Educação com `target="_blank"`/`rel="noopener noreferrer"` corretos | 2026-08-08 | `Certifications.tsx`, `Recognitions.tsx`, `EducationSection.tsx`, `resume.json`, `resume.schema.ts`, `resume.py` |
| Tech Lead (rodada 2) | `@tech-lead-review` | Aprovar — `websiteUrl` segue exatamente o padrão já estabelecido de `credentialUrl`/`logoUrl` (opcional, `nullable().default(null)`, espelhado em Pydantic); tooltip implementado só com CSS/Tailwind + `aria-describedby`, sem dependência nova (evita reabrir decisão de stack); split de PRAD 2023/2024 é mudança de dado dentro de um schema que já suportava múltiplos itens por ano, sem risco de regressão; `ShieldCheck` por certificado é aditivo e não quebra o agrupamento por emissor existente; sem chave de API/CORS tocado | 2026-08-08 | `resume.schema.ts`, `backend/app/models/resume.py`, diffs dos 3 componentes |
| PO (rodada 2) | `@product-owner` | Aceito — as 3 melhorias pedidas foram entregues fielmente (ícone por certificado, PRAD/Mérito separados com explicação em tooltip, link de site em Educação); status da história permanece Quase lá (mesma pendência estrutural de preview Vercel + reindexação do RAG, não afetada por esta rodada) | 2026-08-08 | avaliação acima |
| PO | `@product-owner` | Aceito/Done — autor confirmou preview/produção 2026-08-11 e reindex RAG em produção; DoD completo | 2026-08-11 | preview/produção + reindex RAG |

**Status:** Done
