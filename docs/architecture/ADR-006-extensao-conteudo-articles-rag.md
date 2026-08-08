# ADR-006 — Extensão de conteúdo (articles, credentialUrl) e ampliação do chunking do RAG

**Status:** Aceita
**Data:** 2026-08-08
**Contexto:** US-07-05 (conteúdo novo: reconhecimentos, formação técnica, cursos livres, artigos, progressão de cargo)

## Contexto

O autor pediu para adicionar ao currículo: reconhecimentos internos (PRAD, Mérito), formação técnica (Etec), certificados de cursos livres com link de validação, e dois artigos escritos por ele, hoje hospedados fora do repositório (Shift blog e Medium). Ele também pediu, via `@orquestrador`, que esse conteúdo novo alimente o chat de IA (RAG), não só o layout.

`ADR-003` fixou o chunking do RAG "por experiência, grupo de skills e projeto" — sem cobrir `certifications` nem `education`, e sem prever um tipo de conteúdo "artigo" (link externo, sem `technologies`/`repositoryUrl`). Duas lacunas de schema/RAG precisam de decisão antes do Dev:

1. Onde entram os artigos no modelo de dados (`resume.json`/Zod/Pydantic)?
2. O chunking do RAG (`backend/app/rag.py`) precisa cobrir certificações, educação e artigos?

## Decisão

1. **Novo array `articles[]`** em `resume.json`, com schema próprio (`title`, `description`, `url`, `source`, `publishedAt` nullable) — não reaproveitar `projects[]`: um artigo não tem `technologies`/`repositoryUrl` (conceito de repositório de código não se aplica), e forçar esses campos obrigaria a inventar dado (`technologies: []`) ou afrouxar uma validação que hoje é `min(1)`. Array irmão mantém `projectSchema` inalterado e evita `union type`/campo opcional condicional na UI.
2. **Renderizado dentro da seção "Destaques"** (`ProjectsSection.tsx`, mesmo componente): o pedido do autor foi explícito ("colocar isso também nos Destaques"). O componente passa a aceitar `projects` e `articles` como props separadas e renderiza os dois tipos de card no mesmo grid, com ícone/rótulo distintos (`Github`/"Repositório" para projeto, `Newspaper`/"Ler artigo" para artigo).
3. **Campo opcional `credentialUrl`** em `certificationSchema`/`Certification` (Zod + Pydantic, mesmo padrão de `logoUrl`) — link de validação do certificado, renderizado como link "Ver certificado" quando presente. Aditivo, não quebra os 2 certificados existentes (ficam `null`).
4. **Chunking do RAG estendido** (`backend/app/rag.py`): `build_chunks` passa a gerar também 1 chunk por certificação, 1 por formação e 1 por artigo (mesmo padrão de 1–3 frases por chunk do `ADR-003 §1`). `Chunk.section` ganha os valores `"certification"`, `"education"` e `"article"`.
5. **Sem chunking de `contact`/`hero`** — fora do escopo pedido, mantém `ADR-003` no que já não estava coberto.

## Alternativas consideradas

| Opção | Prós | Contras | Veredito |
|---|---|---|---|
| A) Reaproveitar `projects[]` para artigos, com campos opcionais | Sem array novo | Quebra a garantia atual de `technologies.min(1)`/`repositoryUrl` obrigatório; mistura conceito de "projeto de código" com "publicação externa" | Descartada |
| B) **Array `articles[]` dedicado, renderizado dentro de "Destaques"** | Schema de cada tipo continua estrito e sem campo forçado; atende ao pedido literal do autor sobre onde aparece na UI | Um componente (`ProjectsSection`) passa a aceitar duas props em vez de uma | **Escolhida** |
| C) Nova seção própria "Artigos" separada de "Destaques" | Separação mais "limpa" por tipo de conteúdo | Contraria o pedido explícito do autor (queria os artigos dentro de Destaques) | Descartada |
| D) Não estender o RAG agora (só layout) | Menor escopo, zero risco em `rag.py` | Autor pediu explicitamente que o novo conteúdo alimente o chat | Descartada |

## Consequências

- `frontend/content/resume.schema.ts`: novo `articleSchema`/`Article`; `resumeSchema.articles: z.array(articleSchema)`; `certificationSchema.credentialUrl` opcional
- `backend/app/models/resume.py`: novo `Article` (Pydantic); `Resume.articles: list[Article]`; `Certification.credential_url` opcional
- `backend/app/rag.py`: `_chunk_certification`, `_chunk_education`, `_chunk_article` novos; `build_chunks` passa a somar 6 fontes de chunk (era 3); `backend/tests/test_rag.py` atualizado para as novas seções
- `frontend/components/ProjectsSection.tsx`: aceita `articles` além de `projects`; `frontend/components/Certifications.tsx`: renderiza `credentialUrl` quando presente
- Índice do RAG (`backend/app/rag_index.json`, gerado em runtime/deploy — não versionado) precisa ser regenerado após o próximo deploy do backend para os novos chunks entrarem na busca; não é gerado neste ADR nem localmente (exige `LLM_API_KEY`, fora do ambiente de desenvolvimento atual)
- Reavaliar se o volume de artigos/certificações crescer muito (mesmo gatilho de revisão do `ADR-003`)

## Atualização 2026-08-08 — separação de `recognitions[]` (ajuste pós-validação manual, via `@orquestrador`)

Após validação manual do redesign (US-07-03) e do conteúdo novo (US-07-05), o autor pediu para não misturar reconhecimentos internos (PRAD, Mérito — sem instituição externa, sem credencial verificável) com certificações/cursos formais (AWS, Scrum, Full Cycle, Alura, Asimov — todos com emissor externo e, na maioria, `credentialUrl`). São conceitos diferentes para quem lê o currículo.

Decisão adicional:

1. **Novo array `recognitions[]`**, irmão de `certifications[]`, com schema próprio (`title`, `issuer`, `year`, `description` nullable) — sem `logoUrl`/`credentialUrl`: reconhecimento interno de empresa não tem badge nem link de validação público, então esses campos seriam sempre `null` (dead weight no schema).
2. **Fotos do PRAD/Mérito usadas só como referência**, não como asset de UI — o autor foi explícito: as duas imagens enviadas (`imagem-prad-itau-2023-2024.jpg`, `reconhecimento-merito-itau-2025.jpg`) servem para o agente entender o motivo do reconhecimento, não para aparecer no site. `Recognitions.tsx` renderiza um ícone/medalha decorativo (`lucide-react`, mesma lib já aprovada) para todo item, nunca uma foto — os dois arquivos `.jpg` permanecem em `frontend/public/` sem referência em nenhum componente (documentado aqui para não parecerem asset órfão).
3. **`certifications[].name` volta a ser só o nome do certificado/curso** — os 2 itens de reconhecimento saem de `certifications[]` e viram `recognitions[]`; os 9 certificados/cursos restantes (AWS, Scrum, Full Cycle, Alura ×4, Asimov ×2) não mudam de schema.
4. **Chunking do RAG estendido de novo**: `_chunk_recognition` novo em `backend/app/rag.py`, `build_chunks` passa a somar 7 fontes (era 6); `Chunk.section` ganha o valor `"recognition"`.
5. **Logos dos cursos livres**: o autor enviou os logos oficiais de Alura, Full Cycle e Asimov Academy (`frontend/public/alura-logo.png`, `logo-full-cycle.png`, `logo-asimov.png`) — os 7 certificados desses emissores em `certifications[]` ganham `logoUrl` apontando para esses arquivos (mesmo padrão já usado por AWS/Scrum).

Consequências adicionais: `resume.schema.ts` (novo `recognitionSchema`/`Recognition`, `resumeSchema.recognitions`), `backend/app/models/resume.py` (novo `Recognition`, `Resume.recognitions`), `backend/app/rag.py`/`test_rag.py` (seção `recognition`), novo componente `frontend/components/Recognitions.tsx` + teste, `page.tsx` passa a renderizar a seção entre Certificações e Destaques.

## Atualização 2026-08-08 (2) — `websiteUrl` em `education[]` e separação PRAD 2023/2024 (ajuste de layout, via `@orquestrador`)

Pedido do autor sobre o layout já entregue (Certificações, Reconhecimentos, Educação):

1. **Novo campo opcional `websiteUrl`** em `educationSchema`/`Education` (Zod + Pydantic), mesmo padrão de `credentialUrl`/`logoUrl` (`z.string().url().nullable().default(null)`) — link do site oficial da instituição, renderizado como ícone discreto (`Globe`, `lucide-react`) ao lado do nome em `EducationSection.tsx`, só quando presente. As 3 instituições do currículo ganharam o campo preenchido (Centro Universitário Senac, FATEC São José do Rio Preto, Etec Philadelpho Gouvêa Netto); URLs iniciais localizadas via busca (páginas institucionais gerais) e depois substituídas pelos links exatos dos cursos cursados, informados pelo autor.
2. **`recognitions[]` — PRAD 2023 e 2024 separados**: o item único "2023 e 2024" virou dois registros (`year: "2024"` e `year: "2023"`), cada um com `description` própria explicando a sigla PRAD (Programa de Remuneração de Alto Desempenho); a descrição de Mérito também foi reescrita para explicar o que é o reconhecimento. Sem mudança de schema (`recognitionSchema` já suportava múltiplos itens por ano).
3. **Descrição vira tooltip, não texto sempre visível**: `Recognitions.tsx` passa a expor `description` por um botão de informação (`Info`, `lucide-react`) com `aria-describedby` apontando para um elemento `role="tooltip"`, exibido no hover/foco (`group-hover`/`group-focus-within`), em vez de parágrafo fixo no card — sem lib nova, só CSS/Tailwind.
4. **Ícone por certificado + item único mais limpo** (`Certifications.tsx`): cada certificado dentro de um grupo ganha um ícone próprio (`ShieldCheck`) ao lado do nome, além do logo do emissor já mostrado no cabeçalho do grupo; grupos com um único certificado deixam de mostrar a legenda redundante "1 certificado".

Sem chunking novo no RAG (`recognitions`/`certifications`/`education` já cobertos desde as atualizações anteriores deste ADR; `websiteUrl` é só apresentação, não entra no texto do chunk).

## Referências

- `docs/architecture/ADR-003-fluxo-rag.md`
- `docs/product/backlog/fase-07/US-07-05-conteudo-reconhecimentos-formacao-artigos.md`
- `frontend/content/resume.schema.ts`, `backend/app/models/resume.py`, `backend/app/rag.py`
