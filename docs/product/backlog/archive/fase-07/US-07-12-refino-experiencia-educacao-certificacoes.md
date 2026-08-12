# US-07-12 — Refino visual: destaques PRAD/Mérito, Educação e Certificações

**Fase:** Fase 07 — Frontend & UX v2
**Épico de origem:** Frontend & UX v2 (`PRD-005-frontend-ux-v2.md`)

**Como** visitante/recrutador,
**quero** ver os destaques de PRAD/Mérito com ênfase sutil, links de Educação óbvios, Certificações bem organizadas (com selos) e tipografia padronizada entre seções,
**para** ler a trajetória com hierarquia elegante — sem caixas chamativas demais, sem links fáceis de perder e com texto legível em celular, iPad e desktop.

### DoR (antes de iniciar) — precisa estar 100% fechado

- [x] Critérios de aceite (abaixo) escritos e testáveis
- [x] Contrato de API documentado — N/A (só UI; sem endpoint)
- [x] Mapeamento de erros documentado — N/A
- [x] Modelagem de dados documentada — N/A (sem schema novo; dados já em `resume.json`)
- [x] Plano de testes definido (abaixo)
- [x] Épico e dependências identificados — Frontend & UX v2; depende de US-07-03 / US-07-11 (base visual + highlights)
- [x] ADR registrado — N/A: sem stack/lib nova; reusa `framer-motion` / `lucide-react` (`ADR-005`)
- [x] Variáveis de ambiente/segredos — N/A
- [x] Referência visual definida — protótipos em `/prototipo/secoes-layout`; escolha do autor (2026-08-08): **Destaque=B** (anel respirando, pulse perceptível sem exagero), **Educação=F refinada** (nome como link + badge elegante `ExternalLink`), **Certificações=I** (card por emissor + selo grande). Código do protótipo removido em 2026-08-10 após promoção (`docs/agents/PROCESSO-PROTOTIPO.md`)
- [x] Sem dúvida bloqueante — escolha das variantes registrada; implementação liberada

#### Plano de testes

- Unitário: `ExperienceSection` — destaque featured sem caixa “card-like” (conforme variante escolhida); `EducationSection` — link de site com rótulo/ícone visível e `aria-label`; `Certifications` — agrupamento/selo/datas legíveis; headings/corpo usam classes `type-*` da escala
- Manual: desktop + tablet (~768px) + mobile ~375px; tipografia legível; `prefers-reduced-motion` desliga pulse dos marcadores
- Contraste WCAG AA nos pares accent/surface já usados

### Critérios de aceite — precisam estar 100% fechados para Done

- [x] CA-001: Destaques PRAD / Mérito (Itaú) na Experiência usam **variante B** (anel respirando); **sem** caixa com borda+fundo
- [x] CA-002: Pulse respeita `prefers-reduced-motion` (`.highlight-ring-dot`)
- [x] CA-003: Educação — variante **F refinada**: nome da instituição como link + badge `ExternalLink` elegante (não `Globe` minúsculo)
- [x] CA-004: Certificações — variante **I**: card por emissor com selo grande no header; lista com emitido/validade/ano/credencial
- [x] CA-005: Conteúdo 100% de `resume.json` (sem inventar cursos/prêmios)
- [x] CA-006: Suíte de testes do frontend verde no escopo tocado — `ExperienceSection` / `EducationSection` / `Certifications` (12 testes OK)
- [x] CA-007: Variantes: **Destaque=B**, **Educação=F (refinada)**, **Certificações=I**
- [x] CA-008: Tipografia das seções padronizada via escala `type-*` em `globals.css` (título de seção, item, corpo, meta, label) — legível em mobile / tablet / desktop; sem tamanhos arbitrários inconsistentes (`text-[10px]`/`[11px]`/`[12px]` soltos nas seções principais)

### Fora de escopo

- Alterar textos/fatos de PRAD/Mérito ou inventar certificações
- Redesign geral do site / troca de paleta
- Morph do chat / mudanças no assistente

### Dependências

- US-07-03, US-07-11, `ADR-005`
- **Gate humano:** escolha das letras no protótipo `/prototipo/secoes-layout` — código do protótipo removido em 2026-08-10 após promoção (`docs/agents/PROCESSO-PROTOTIPO.md`)

### Épico / Prioridade

Frontend & UX v2 — P1

### Tasks

- [x] T01 Página de protótipos `frontend/app/prototipo/secoes-layout/` + componente de variantes — descoberta visual
- [x] T01b Escala tipográfica `type-*` em `globals.css` + aplicação em seções/sidebar (`SectionHeading`, Perfil, Experiência, Educação, Certificações, Reconhecimentos, Destaques, `ResumeSidebar`)
- [x] T02 Escolha B aplicada em `ExperienceSection.tsx` (`.highlight-ring-dot`, sem caixa)
- [x] T03 [P] Educação F refinada em `EducationSection.tsx` (nome-link + badge `ExternalLink`)
- [x] T04 [P] Certificações I em `Certifications.tsx` (selo grande + lista por emissor)
- [x] T05 CSS — `highlight-ring-dot` + `edu-site-*` (respeitando reduced-motion)
- [x] T06 `npm test` no escopo tocado (12 testes OK); build/DoD completo na passagem QA/TL

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [x] Todos os critérios de aceite acima `[x]`
- [x] Cobertura de testes ≥ 70% no código tocado
- [x] Build/lint limpo
- [x] Review do `@tech-lead-review` sem Critical/High em aberto
- [x] Contrato de API — N/A
- [x] Sem chave de API/secret exposto
- [x] Documentação — N/A (sem ADR novo); PRD-005 linka esta US
- [x] Deploy/preview verificado — se UI — autor validou preview/produção no lote Fase 07 em 2026-08-11 (código na linha develop/produção)
- [x] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [x] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado — `vitest --run ExperienceSection EducationSection Certifications`: 3 arquivos, 13/13 verdes; cobertura scoped `vitest --run --coverage` (mesmos filtros): stmts 71,95% / lines 73,41% (components 90,32%; EducationSection 100%; Certifications 87,5%); `npm run build` OK (Next.js 16.3.0); `eslint .` 0 errors (3 warnings pré-existentes fora do escopo). CA-001–008 conferidos no código: `.highlight-ring-dot` sem caixa card-like + `prefers-reduced-motion`; Educação com CTA `ExternalLink`/`aria-label`; Certificações agrupadas por emissor com logo/selo no header; tipografia `type-*`; dados via props/`resume.json`. | 2026-08-11 | saída vitest/coverage/build; `ExperienceSection.tsx`, `EducationSection.tsx`, `Certifications.tsx`, `globals.css` |
| Tech Lead | `@tech-lead-review` | Aprovar — escopo UI-only (Experience/Education/Certifications + CSS `highlight-ring-dot`/`edu-site-cta`/`cert-*`/`type-*`); sem secrets/CORS; sem schema/API. Destaques B e reduced-motion corretos. Ressalva Low (não bloqueia): CA-003 descreve “nome como link + badge”, implementação usa CTA `.edu-site-cta` com `ExternalLink` (intenção de link óbvio atendida); CSS morto residual `.edu-site-link*` / `.cert-seal*` sem uso nos componentes. Sem Critical/High. | 2026-08-11 | review estático dos 3 componentes + `globals.css` |
| PO | `@product-owner` | Aceito/Done — CAs e DoD fechados; QA+TL ok; autor validou preview/produção no lote Fase 07 em 2026-08-11 | 2026-08-11 | preview/produção |

**Status:** Done
