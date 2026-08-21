# Roadmap — Série "Aprendizados de IA Engineering" (LinkedIn)

Série de artigos contando, em primeira pessoa, os aprendizados reais de construir o [Currículo Online IA](../../../README.md): um projeto pessoal solo onde uso um pipeline de agentes de IA (PO, arquiteto, dev, QA, tech lead) para desenvolver um portfólio com assistente de chat (RAG) sobre a própria trajetória profissional.

## Objetivo da série

Não é conteúdo institucional nem tutorial genérico de "como fazer RAG". É registro de decisão real, com trade-off, número e erro incluídos: o tipo de post que ajuda quem também está construindo produto de IA sozinho, com orçamento zero e sem equipe.

## Público

Recrutadores técnicos, engenheiros e gestores interessados em IA Engineering aplicada, não pesquisa acadêmica, engenharia de produto.

## Tom e formato

Primeira pessoa, direto, com profundidade técnica real: números, trade-offs, decisões documentadas (cada artigo é lastreado em ADR/PRD real do repositório, linkado nas notas de publicação). Sem jargão inflado, sem "10 dicas".

**Formato: Post de feed, não Artigo.** A API do LinkedIn não tem endpoint para criar Artigo de formato longo — só post normal de feed. Isso muda o alvo: enxuto, direto ao ponto, sem enrolação, mas sem perder informação relevante. Meta de 130 a 220 palavras (900 a 1400 caracteres), gancho forte na primeira linha (é o que aparece antes do "ver mais"), parágrafos curtos com quebra de linha generosa. Cada post tem no máximo um diagrama de apoio (pasta `images/`), pensado para carregar o peso explicativo que o texto não precisa carregar sozinho.

**Ícones no texto:** usar emoji com função, não decoração. 1 no gancho (linha de abertura) e no máximo 3-4 ao longo do post como marcador de bullet/seção — nunca um emoji por linha, nunca emoji redundante com a palavra ao lado. Preferir ícones "neutros/técnicos" (⚙️ 🔁 📊 ✅ →) a emoji expressivos (🔥 🚀 💡 em excesso lê como spam de growth hacker).

**Regra de escrita humana:** nunca usar travessão (—). É o tique mais claro de texto gerado por IA e quebra a ilusão de que foi um tech lead que escreveu. Preferir ponto final, vírgula, dois pontos ou reformular a frase em duas orações curtas. O post precisa soar como alguém falando de algo que viveu: frases diretas, variação de ritmo, pequenas imperfeições de fala natural, nunca uma cadência simétrica e "polida demais" de texto revisado por IA.

## Ordem lógica da série

A ordem não segue a cronologia de implementação do projeto. Segue a curva de aprendizado de quem lê: primeiro o **processo** (como decido e construo com agentes), depois o **produto técnico concreto** (o que esse processo produziu), depois aprofundamentos.

| # | Título | Tema | Lastro (docs do repo) | Status |
|---|---|---|---|---|
| 1 | Loop Engineering: como fiz meus agentes de IA corrigirem os próprios erros até o merge | Motivação e benefícios de aplicar Loop Engineering num pipeline de agentes | `ADR-015-loop-engineering-pipeline.md` | ✅ Pronto — [01-loop-engineering-agentes-ia.md](01-loop-engineering-agentes-ia.md) + [diagrama](images/loop-engineering-diagrama.svg) |
| 2 | RAG na prática: memória conversacional, chunking e embeddings sem exagero de engenharia | Chunking por seção, embeddings, memória conversacional, boas práticas | `ADR-003`, `ADR-014`, `PRD-013`, US-15-01/02/03 | ✅ Pronto — [02-rag-memoria-chunking-embeddings.md](02-rag-memoria-chunking-embeddings.md) + [diagrama](images/rag-fluxo-diagrama.svg) |
| 3 | RAG v2: por que "buscar por similaridade" não basta, e como resolvi sem trocar de arquitetura | Precisão de recuperação (roteamento por seção/recência) + busca na web condicional (Tavily), sem virar agente de busca genérico | `ADR-010-fluxo-rag-v2-precisao-web.md` | 🔜 Próximo, outline abaixo |
| 4 | Arquitetura para IA: Ports & Adapters no domínio de chat | Por que isolar `EmbeddingProvider`/`ChatCompletionProvider`/`WebSearchProvider` atrás de portas, e o que isso compra quando o provider muda | `ADR-011`, `ADR-012` | 📋 Planejado |
| 5 | Engenharia de custo e resiliência: rodar IA em produção sem pagar nada | Render free tier, cold start, timeout/retry, estimativa de custo por conversa | `ADR-002`, `ADR-004`, `ADR-008` | 📋 Planejado |
| 6 | Segurança em produto de IA solo: o que realmente importa quando não tem equipe de AppSec | CORS, rate limit, chave de API nunca no client, headers de segurança | `ADR-006`/auditoria de segurança, Fase 8 | 📋 Planejado |

### Por que essa ordem

1. **Loop Engineering primeiro** porque é o "como" que atravessa todo o resto. Depois que o leitor entende que o pipeline se autocorrige, cada artigo técnico seguinte (RAG, arquitetura, custo, segurança) fica mais crível: não é "vibe coding", é decisão registrada e validada por sinal verificável.
2. **RAG (memória + chunking/embeddings) em segundo** porque é o diferencial mais visível do produto. Quem lê já pode ir testar o chat no portfólio depois de ler.
3. **RAG v2 (precisão + web) em terceiro** porque assume que o leitor já entende o fluxo básico do artigo 2: é o "e quando a versão simples não é suficiente".
4. **Arquitetura, custo e segurança por último** porque são aprofundamentos de sustentação (como manter o projeto evoluível, barato e seguro). Fazem mais sentido depois que o leitor já viu o produto funcionando.

## Outline do artigo 3 (próximo, ainda não escrito por completo)

**Gancho:** o assistente errava perguntas básicas tipo "onde estudei?" e "qual a última empresa?" mesmo com RAG funcionando, porque busca por similaridade pura não é a mesma coisa que "seção certa" ou "mais recente".

**Pontos a cobrir:**
- Causa raiz: todos os chunks de `experience` são semanticamente parecidos entre si; sem roteamento, o top-k não garante pegar a seção certa nem a mais recente
- Solução escolhida: detecção de intenção por dicionário de palavras-chave (não um classificador novo), restringindo a busca à seção certa antes do `top_k`; desempate por `end_date` quando a pergunta pede recência
- Por que não um classificador de intenção via LLM: dobraria custo/latência para resolver um problema que um dicionário pequeno já resolve nos casos reais
- Busca na web (Tavily) como fallback condicional: só dispara quando a similaridade fica abaixo do threshold **e** a pergunta cita uma entidade que já existe no currículo (o critério que impede o assistente de virar "Google genérico")
- Resposta ganha campo `source: "resume" | "web"`, aditivo, sem quebrar clientes existentes
- Lição generalizável: resolver a causa raiz sem reescrever a arquitetura, refinando a função existente em vez de trocar de stack
- Diagrama sugerido: fluxo de decisão (similaridade alta → resposta direto; similaridade baixa + entidade conhecida → busca web; similaridade baixa sem entidade → fallback padrão)

## Notas gerais de publicação (para todos os posts da série)

- Publicar como **post de feed do LinkedIn** (não Artigo — a API não cria Artigo de formato longo, só post). Texto pronto para colar direto na caixa de post, sem markdown (LinkedIn não renderiza `##`/`**`): quebras de linha e emoji fazem o trabalho de estrutura visual
- Diagrama: os arquivos em `images/` são SVG, exportados para PNG antes de subir como imagem do post (resolução alta; screenshot da imagem aberta no navegador resolve se o editor não aceitar SVG direto)
- Link para o projeto: colocar no primeiro comentário, não no corpo do post (evita penalização de alcance por link externo). Sempre os dois links: o site (https://lucas-palhares-cv.vercel.app) e o repositório (https://github.com/lucaspalharesbarbosa/curriculo-online-ia)
- Hashtags: **3 a 5, sempre em inglês**, específicas do tema técnico do post (não genéricas tipo `#Tech`/`#Programming`). Escolher por post — não reciclar a mesma lista fixa em todos
- Cadência sugerida: 1 post a cada 1 ou 2 semanas, mantendo espaço para engajamento/comentários entre publicações
