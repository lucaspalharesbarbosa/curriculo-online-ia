# PRD-013 — Memória Conversacional (RAG)

**Status:** ready-for-agent
**Épico:** RAG
**Prioridade:** P1

## Problema

O assistente de chat (`/chat`) é *stateless* por requisição — não recebe nem mantém histórico de conversa. Isso quebra correferência entre turnos: ao perguntar "Onde Lucas trabalha?" o assistente responde corretamente (ex.: "NA Engineering Brasil"), mas na pergunta seguinte "Onde fica a matriz da empresa?" ele não resolve que "a empresa" se refere à resposta anterior — porque:

1. O retrieval vetorial (`rag.search_with_routing`) embeda só o texto isolado da pergunta atual, sem "NA Engineering Brasil", então não encontra o chunk certo.
2. O LLM recebe só `system + pergunta atual` em `_generate_answer`/`_generate_web_answer` (`service.py`), sem nenhuma troca anterior para inferir o contexto.

O frontend já mantém histórico local (`useResumeChat`), mas nunca o reenvia ao backend — o dado existe no cliente e se perde a cada requisição.

## Objetivo

Assistente resolve corretamente referências anafóricas ao contexto do turno anterior (pronomes, "a empresa", "esse curso" etc.), tanto no retrieval quanto na geração da resposta, mantendo o backend sem sessão persistida em servidor (histórico trafega do cliente a cada requisição — chat de currículo pessoal, sem necessidade de persistência server-side).

## Escopo

### Incluído

- ADR da estratégia de memória conversacional (contrato stateless-com-histórico-do-cliente vs. alternativas, estratégia de query condensation) — mudança no fluxo de RAG decidido em `ADR-003`/`ADR-010`
- `ChatRequest` aceita `history` opcional, janela deslizante das últimas N trocas (limite de turnos/tokens documentado no ADR)
- Reformulação da pergunta ("standalone question") antes do retrieval quando há histórico, para a busca vetorial encontrar o chunk certo
- Histórico incluído nas mensagens enviadas ao LLM na geração da resposta final
- Frontend envia o histórico (já mantido em `useResumeChat`) a cada requisição, respeitando a janela definida no ADR
- Fallback gracioso se a reformulação falhar (usa a pergunta crua, sem quebrar o `/chat`) — mesmo padrão de resiliência de `ADR-004`

### Excluído

- Sessão/histórico persistido no backend (banco, cache server-side) — fora de escopo, decisão explícita do autor
- Memória de longo prazo entre sessões distintas (localStorage/cookies de continuidade entre visitas) — cada carregamento de página começa sem histórico
- Sumarização de histórico longo (compressão semântica de turnos antigos) — a janela deslizante trunca, não resume

## Persona

Visitante/recrutador conversando com o assistente de chat.

## Histórias

| Título | Prioridade | Backlog |
|--------|------------|---------|
| ADR: memória conversacional no fluxo de RAG | P1 | [US-15-01](backlog/fase-15/US-15-01-adr-memoria-conversacional-rag.md) |
| Backend: histórico + query condensation + prompt com contexto | P1 | [US-15-02](backlog/fase-15/US-15-02-backend-memoria-conversacional.md) |
| Frontend: enviar histórico ao backend | P1 | [US-15-03](backlog/fase-15/US-15-03-frontend-envio-historico.md) |

## Riscos

- Custo/latência adicional por chamada extra de reformulação (se a estratégia escolhida no ADR usar LLM) — exige medir impacto e manter fallback para a pergunta crua
- Mudar o fluxo de retrieval pode regredir perguntas de turno único que hoje funcionam — exige suíte de regressão, não só o cenário de correferência relatado
- Payload maior por requisição (histórico) — janela deslizante limitada mitiga custo de tokens e tamanho de request

## DoR do épico

- [ ] Toda história do épico tem seu próprio DoR fechado (checklist por história abaixo — este item é só o guarda-chuva)
- [ ] Tasks decompostas (`references/task-breakdown-guide.md`)
- [ ] ADR (US-15-01) registrada antes de US-15-02/US-15-03 iniciarem implementação
