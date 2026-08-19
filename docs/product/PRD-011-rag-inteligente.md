# PRD-011 — RAG Inteligente

**Status:** ready-for-agent
**Épico:** RAG
**Prioridade:** P1

## Problema

O assistente de chat erra perguntas objetivas e básicas sobre a trajetória do autor — ex.: "onde estudei?", "qual a última empresa que trabalhei?". Causa provável: `backend/app/rag.py`/`backend/app/chat.py` fazem busca puramente por similaridade de embeddings (`top_k=3`, `SIMILARITY_THRESHOLD=0.2`), sem roteamento por seção nem ordenação por recência — para perguntas genéricas de "último/atual/onde", a similaridade semântica não garante que o chunk certo (o mais recente, ou da seção certa) seja o escolhido.

Além disso, o assistente só conhece o que está em `resume.json`: perguntas que pedem contexto público sobre uma empresa, instituição de ensino, curso, certificado ou habilidade citados no currículo (ex.: "o que a [empresa] faz?", "essa certificação é reconhecida?") não têm resposta hoje, mesmo quando a informação é pública e agregaria valor para quem está avaliando o autor.

## Objetivo

Aumentar a taxa de acerto do assistente em perguntas objetivas sobre a trajetória do autor (recência, seção certa) e permitir busca na web — sob controle, com atribuição de fonte e sem virar agente genérico — para enriquecer respostas sobre entidades externas citadas no currículo quando o `resume.json` sozinho não bastar.

## Escopo

### Incluído
- Diagnóstico e correção da recuperação de contexto do RAG para perguntas objetivas de "último/atual/onde" (roteamento por seção + ordenação por recência)
- ADR da estratégia de correção e da estratégia de busca web antes de implementar (mudança no fluxo de RAG decidido em `ADR-003`)
- Web search acionado só quando o RAG local não tem contexto suficiente sobre uma entidade externa citada no currículo (empresa, instituição, curso, certificado, habilidade) — nunca para perguntas genéricas fora do escopo do currículo
- Sinalização transparente ao usuário quando a resposta usa dado externo (fonte da web, não do currículo)
- Timeout curto + fallback gracioso se a busca web falhar (mesmo padrão de `ADR-004`), sem quebrar o `/chat`

### Excluído
- Busca web irrestrita (responder qualquer pergunta genérica não relacionada ao currículo) — o assistente continua focado na trajetória do autor
- Navegação multi-hop ou agente autônomo de pesquisa — no máximo 1 chamada de busca por pergunta, sem encadeamento
- Persistência de histórico de buscas web — nenhum novo dado de visitante armazenado
- Banco vetorial de verdade — segue fora de escopo (decisão original do `ADR-003`, volume de dados continua pequeno)

## Persona

Visitante/recrutador conversando com o assistente de chat.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| ADR: fluxo de RAG v2 (precisão de recuperação + acesso à web) | P1 | [US-11-05](backlog/fase-11/US-11-05-adr-rag-v2-precisao-web.md) |
| Melhorar precisão de recuperação do RAG (roteamento por seção/recência) | P1 | [US-11-06](backlog/fase-11/US-11-06-precisao-recuperacao-rag.md) |
| Web search fallback para dados externos (empresas, instituições, cursos, certificados, habilidades) | P2 | [US-11-07](backlog/fase-11/US-11-07-web-search-fallback.md) |

## Riscos

- Custo/latência adicional por chamada externa de busca — exige timeout curto e fallback ao comportamento atual se a busca falhar (mesmo padrão do `ADR-004`)
- Nova API key exposta seria uma vulnerabilidade — segue o padrão de `LLM_API_KEY`: só no backend, nunca no client, documentada em `.env.example`
- Web search pode trazer informação desatualizada ou não confiável — a resposta precisa deixar claro que veio de busca externa, não do currículo
- Mudar a lógica de recuperação (US-11-06) pode regredir perguntas que hoje funcionam — exige suíte de regressão, não só os casos que falhavam

## DoR do épico

- [ ] Toda história do épico tem seu próprio DoR fechado
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
- [ ] ADR (US-11-05) registrada antes de US-11-06/US-11-07 iniciarem implementação
