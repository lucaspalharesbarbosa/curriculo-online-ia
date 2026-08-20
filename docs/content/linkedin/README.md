# Roadmap — Série "Aprendizados de IA Engineering" (LinkedIn)

Série de artigos contando, em primeira pessoa, os aprendizados reais de construir o [Currículo Online IA](../../../README.md) — um projeto pessoal solo onde uso um pipeline de agentes de IA (PO, arquiteto, dev, QA, tech lead) para desenvolver um portfólio com assistente de chat (RAG) sobre a própria trajetória profissional.

## Objetivo da série

Não é conteúdo institucional nem tutorial genérico de "como fazer RAG". É registro de decisão real, com trade-off, número e erro incluídos — o tipo de post que ajuda quem também está construindo produto de IA sozinho, com orçamento zero e sem equipe.

## Público

Recrutadores técnicos, engenheiros e gestores interessados em IA Engineering aplicada — não pesquisa acadêmica, engenharia de produto.

## Tom

Primeira pessoa, conversacional, mas com profundidade técnica real: números, trade-offs, decisões documentadas (cada artigo é lastreado em ADR/PRD real do repositório, linkado nas notas de publicação). Sem jargão inflado, sem "10 dicas". Contar a história de uma decisão específica.

## Ordem lógica da série

A ordem não segue a cronologia de implementação do projeto — segue a curva de aprendizado de quem lê: primeiro o **processo** (como decido e construo com agentes), depois o **produto técnico concreto** (o que esse processo produziu), depois aprofundamentos.

| # | Título | Tema | Lastro (docs do repo) | Status |
|---|---|---|---|---|
| 1 | Loop Engineering: como fiz meus agentes de IA corrigirem os próprios erros até o merge | Motivação e benefícios de aplicar Loop Engineering num pipeline de agentes | `ADR-015-loop-engineering-pipeline.md` | ✅ Pronto — [01-loop-engineering-agentes-ia.md](01-loop-engineering-agentes-ia.md) |
| 2 | RAG na prática: memória conversacional, chunking e embeddings sem exagero de engenharia | Chunking por seção, embeddings, memória conversacional, boas práticas | `ADR-003`, `ADR-014`, `PRD-013`, US-15-01/02/03 | ✅ Pronto — [02-rag-memoria-chunking-embeddings.md](02-rag-memoria-chunking-embeddings.md) |
| 3 | RAG v2: por que "buscar por similaridade" não basta, e como resolvi sem trocar de arquitetura | Precisão de recuperação (roteamento por seção/recência) + busca na web condicional (Tavily), sem virar agente de busca genérico | `ADR-010-fluxo-rag-v2-precisao-web.md` | 🔜 Próximo — outline abaixo |
| 4 | Arquitetura para IA: Ports & Adapters no domínio de chat | Por que isolar `EmbeddingProvider`/`ChatCompletionProvider`/`WebSearchProvider` atrás de portas, e o que isso compra quando o provider muda | `ADR-011`, `ADR-012` | 📋 Planejado |
| 5 | Engenharia de custo e resiliência: rodar IA em produção sem pagar nada | Render free tier, cold start, timeout/retry, estimativa de custo por conversa | `ADR-002`, `ADR-004`, `ADR-008` | 📋 Planejado |
| 6 | Segurança em produto de IA solo: o que realmente importa quando não tem equipe de AppSec | CORS, rate limit, chave de API nunca no client, headers de segurança | `ADR-006`/auditoria de segurança, Fase 8 | 📋 Planejado |

### Por que essa ordem

1. **Loop Engineering primeiro** porque é o "como" que atravessa todo o resto — depois que o leitor entende que o pipeline se autocorrige, cada artigo técnico seguinte (RAG, arquitetura, custo, segurança) fica mais crível: não é "vibe coding", é decisão registrada e validada por sinal verificável.
2. **RAG (memória + chunking/embeddings) em segundo** porque é o diferencial mais visível do produto — quem lê já pode ir testar o chat no portfólio depois de ler.
3. **RAG v2 (precisão + web) em terceiro** porque assume que o leitor já entende o fluxo básico do artigo 2 — este é o "e quando a versão simples não é suficiente".
4. **Arquitetura, custo e segurança por último** porque são aprofundamentos de sustentação (como manter o projeto evoluível, barato e seguro) — fazem mais sentido depois que o leitor já viu o produto funcionando.

## Outline do artigo 3 (próximo, ainda não escrito por completo)

**Gancho:** o assistente errava perguntas básicas tipo "onde estudei?" e "qual a última empresa?" mesmo com RAG funcionando — porque busca por similaridade pura não é a mesma coisa que "seção certa" ou "mais recente".

**Pontos a cobrir:**
- Causa raiz: todos os chunks de `experience` são semanticamente parecidos entre si; sem roteamento, o top-k não garante pegar a seção certa nem a mais recente
- Solução escolhida: detecção de intenção por dicionário de palavras-chave (não um classificador novo) → restringe a busca à seção certa antes do `top_k`; desempate por `end_date` quando a pergunta pede recência
- Por que não um classificador de intenção via LLM: dobraria custo/latência para resolver um problema que um dicionário pequeno já resolve nos casos reais
- Busca na web (Tavily) como fallback condicional: só dispara quando similaridade < threshold **E** a pergunta cita uma entidade que já existe no currículo — o critério que impede o assistente de virar "Google genérico"
- Resposta ganha campo `source: "resume" | "web"`, aditivo, sem quebrar clientes existentes
- Lição generalizável: "resolver a causa raiz sem reescrever a arquitetura" — refinar a função existente em vez de trocar de stack

## Notas gerais de publicação (para todos os artigos da série)

- Publicar como **artigo do LinkedIn** (long-form), não post curto — o conteúdo é longo demais para o feed
- Link para o projeto: colocar no primeiro comentário, não no corpo do artigo (evita penalização de alcance por link externo)
- Hashtags sugeridas (ajustar por artigo): `#AIEngineering #RAG #EngenhariaDeIA #LLM #PortfolioProject #DesenvolvimentoDeSoftware`
- Cadência sugerida: 1 artigo a cada 1–2 semanas, mantendo espaço para engajamento/comentários entre publicações
