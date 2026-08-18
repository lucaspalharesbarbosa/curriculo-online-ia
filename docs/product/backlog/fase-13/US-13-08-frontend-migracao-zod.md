# US-13-08 — Frontend: migrar API depreciada do Zod em `resume.schema.ts`

**Fase:** Fase 13 — Qualidade de Engenharia (continuação)
**Épico de origem:** Qualidade de Engenharia (`PRD-007-qualidade-engenharia.md`)

**Como** autor/mantenedor do código a médio prazo,
**quero** migrar as 13 chamadas depreciadas de validação de string do Zod em `resume.schema.ts` para a API atual,
**para** eliminar o aviso de depreciação antes que a versão que o suporta seja removida numa atualização futura do Zod.

### Achado (`typescript:S1874`, MINOR, `content/resume.schema.ts`, 13 ocorrências — linhas 14, 28, 38, 43, 65, 70, 88, 96, 102, 103, 104, 105, 106)

Assinatura antiga de validador de string do Zod (`z.string().email(...)`/`.url()`/etc. com params posicionais) marcada como deprecated — API atual usa validadores top-level (`z.email()`, `z.url()`, ...) ou a forma de objeto de opções equivalente da versão instalada.

### DoR (antes de iniciar) — fechado

- [x] Critérios de aceite escritos e testáveis
- [x] Contrato de API — `N/A`, é schema de validação interno (Zod), não endpoint HTTP
- [x] Mapeamento de erros — `N/A`
- [x] Modelagem de dados — o schema (`resume.schema.ts`) já existe e não muda de forma, só a chamada de API que o produz; sem entidade nova
- [x] Plano de testes — suíte que já valida `content/resume.ts`/`resume.schema.ts` contra `resume.json` (se existir) continua cobrindo; se não existir teste dedicado, confirmar que o build (`next build`, que valida o schema em tempo de build via import estático) continua verde
- [x] Épico e dependências — `PRD-007`; sem dependência bloqueante
- [x] ADR — `N/A`, é atualização de uso de API já instalada, não troca de lib
- [x] Variáveis de ambiente/segredos — `N/A`
- [x] Referência visual — `N/A`
- [x] Protótipo — `N/A`
- [x] Sem dúvida bloqueante

### Critérios de aceite

- [x] CA-001: as 13 ocorrências usam a API atual (não-depreciada) do Zod — `z.string().url()`→`z.url()`, `z.string().email()`→`z.email()`; mesma semântica (as versões `.url()`/`.email()` deprecadas são wrappers finos das versões top-level no Zod 4.4.3, mesmas mensagens/validação)
- [x] CA-002: `resume.json` real continua validando sem erro contra o schema atualizado — `npm run build` roda `validate:resume` (`content/resume.schema.test.ts`) antes do `next build`: 6/6 testes verdes
- [ ] CA-003: nova análise do Sonar em `main` não reporta mais os 13 achados — só verificável após o merge desta entrega e nova análise rodar; não bloqueia Done (achados corrigidos na origem)
- [x] CA-004: `npm run build` e suíte de testes do frontend continuam verdes — build compila e type-checka limpo; 71/71 testes

### Fora de escopo
- Mudar a forma/campos do schema (só a sintaxe de chamada da API do Zod)
- Outros achados `S1874` do frontend (ícones `Github`/`Linkedin` depreciados, `FormEvent`) — dívida aceita, sem história dedicada (ver `US-13-03`)

### Dependências
- Nenhuma

### Épico / Prioridade
Qualidade de Engenharia — P2

### Tasks
- [x] T01 Atualizar as 13 chamadas em `frontend/content/resume.schema.ts` para a API não-depreciada do Zod (`^4.4.3` — `z.url()`/`z.email()` top-level)
- [x] T02 Validar `resume.json` real contra o schema atualizado (`npm run build`, que roda `validate:resume` antes do `next build`)
- [x] T03 Rodar `npm test -- --run` e `npm run build` — 71/71 testes, build limpo

### DoD
- [ ] Todos os critérios de aceite acima `[x]`
- [ ] Cobertura de testes ≥ 70% no código tocado — `N/A` se não houver lógica nova, só troca de API com mesma semântica
- [ ] Build/lint limpo
- [ ] Review do `@tech-lead-review` sem Critical/High em aberto
- [ ] Contrato de API — `N/A`
- [ ] Sem chave/secret exposto
- [ ] Documentação atualizada — `N/A`
- [ ] Deploy/preview verificado
- [ ] Vereditos de QA, Tech Lead e PO documentados abaixo
- [ ] Status atualizado no arquivo

### Vereditos

| Fase do pipeline | Agente | Veredito | Data | Ref. |
|---|---|---|---|---|
| QA | `@qa-engineer` | Aprovado com ressalvas | 2026-08-18 | CA-001/002/004 fechados: as 13 ocorrências migradas para `z.url()`/`z.email()`; `resume.json` real validado (`validate:resume` → 6/6, rodado antes de todo `next build`); `npm run build` compila e type-checka limpo; suíte completa 71/71. Ressalva: CA-003 (nova análise do Sonar sem os 13 achados) só é verificável após o merge e nova análise rodar |
| Tech Lead | `@tech-lead-review` | — | — | — |
| PO | `@product-owner` | — | — | — |

**Status:** Ready for Agent
