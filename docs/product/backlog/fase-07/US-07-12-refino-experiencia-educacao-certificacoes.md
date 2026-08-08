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
- [x] Referência visual definida — **protótipos em** `/prototipo/secoes-layout` (variantes A–D destaques, E–G educação, H–J certificações). **Implementação só após escolha explícita do autor** (letras escolhidas registradas nos CAs / tasks)
- [x] Sem dúvida bloqueante — **exceto escolha das variantes**, gate de descoberta; Dev não aplica na home até o autor decidir

#### Plano de testes

- Unitário: `ExperienceSection` — destaque featured sem caixa “card-like” (conforme variante escolhida); `EducationSection` — link de site com rótulo/ícone visível e `aria-label`; `Certifications` — agrupamento/selo/datas legíveis; headings/corpo usam classes `type-*` da escala
- Manual: desktop + tablet (~768px) + mobile ~375px; tipografia legível; `prefers-reduced-motion` desliga pulse dos marcadores
- Contraste WCAG AA nos pares accent/surface já usados

### Critérios de aceite — precisam estar 100% fechados para Done

- [ ] CA-001: Destaques PRAD / Mérito (Itaú) na Experiência usam a **variante escolhida no protótipo** (marcador com pulse sutil/elegante); **sem** o bloco atual com borda+fundo que compete demais com o restante da lista
- [ ] CA-002: Pulse (se houver na variante) respeita `prefers-reduced-motion`
- [ ] CA-003: Educação — link do site da instituição com ícone **diferente de `Globe` minúsculo**, mais visível e fácil de identificar como link externo/site (rótulo ou hit-area generosa)
- [ ] CA-004: Certificações — layout reorganizado com **selos**/identidade por emissor, informações divididas de forma apresentável (nome, ano, validade, link de credencial quando existir)
- [ ] CA-005: Conteúdo 100% de `resume.json` (sem inventar cursos/prêmios)
- [ ] CA-006: Suíte de testes do frontend verde no escopo tocado (`npm test`)
- [ ] CA-007: Variantes escolhidas pelo autor documentadas na história (ex.: Destaque=B, Educação=F, Cert=I)
- [x] CA-008: Tipografia das seções padronizada via escala `type-*` em `globals.css` (título de seção, item, corpo, meta, label) — legível em mobile / tablet / desktop; sem tamanhos arbitrários inconsistentes (`text-[10px]`/`[11px]`/`[12px]` soltos nas seções principais)

### Fora de escopo

- Alterar textos/fatos de PRAD/Mérito ou inventar certificações
- Redesign geral do site / troca de paleta
- Morph do chat / mudanças no assistente

### Dependências

- US-07-03, US-07-11, `ADR-005`
- **Gate humano:** escolha das letras no protótipo `/prototipo/secoes-layout`

### Épico / Prioridade

Frontend & UX v2 — P1

### Tasks

- [x] T01 Página de protótipos `frontend/app/prototipo/secoes-layout/` + componente de variantes — descoberta visual
- [x] T01b Escala tipográfica `type-*` em `globals.css` + aplicação em seções/sidebar (`SectionHeading`, Perfil, Experiência, Educação, Certificações, Reconhecimentos, Destaques, `ResumeSidebar`)
- [ ] T02 Registrar escolha do autor (CA-007) e aplicar em `ExperienceSection.tsx` (+ teste)
- [ ] T03 [P] Aplicar variante de link em `EducationSection.tsx` (+ teste se necessário)
- [ ] T04 [P] Redesign `Certifications.tsx` (+ teste) conforme variante escolhida
- [ ] T05 CSS/`globals.css` — animação de pulse do marcador se ainda não existir (respeitando reduced-motion)
- [ ] T06 `npm test` + `npm run build` — evidência DoD

### DoD (antes de concluir) — precisa estar 100% fechado para Done

- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado
- [ ] Build/lint limpo
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API — N/A
- [ ] Sem chave de API/secret exposto
- [ ] Documentação — N/A (sem ADR novo); PRD-005 linka esta US
- [ ] Deploy/preview verificado — se UI
- [ ] Vereditos de QA, Tech Lead e PO documentados na tabela "Vereditos" abaixo
- [ ] Status da história atualizado no próprio arquivo

### Vereditos — evidência do DoD, preenchido pelo agente de cada fase durante o pipeline

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | | | |
| Tech Lead | `@tech-lead-review` | | | |
| PO | `@product-owner` | | | |

**Status:** Ready for Agent (discover — aguardando escolha das variantes)
