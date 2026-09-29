# C4-002: Componentes do backend (chat, tools e MCP)

Detalha o container `backend` do [C4-001](C4-001-contexto-containers.md) (Nível 3). Decisões: [ADR-012](ADR-012-clean-architecture-chat.md) (Ports & Adapters), [ADR-017](ADR-017-tools-e-mcp-um-nucleo-duas-portas.md) (um núcleo, duas portas) e [ADR-018](ADR-018-tools-estruturadas-recuperar-primeiro-hibrida.md) (tools estruturadas, recuperar primeiro, busca híbrida).

## Componentes

```mermaid
flowchart LR
    V(["Visitante<br/>(site)"]) -->|POST /chat| ROUTER
    MC(["Cliente MCP<br/>Claude Desktop, Cursor"]) -->|stdio ou POST /mcp| MCPS

    subgraph BACKEND["backend (FastAPI)"]
        ROUTER["chat/router.py<br/>HTTP, rate limit, Depends()"]
        SERVICE["chat/service.py<br/>orquestra a resposta"]
        RAG["chat/rag.py<br/>chunking, ranking,<br/>busca híbrida"]
        MCPS["mcp_server/<br/>FastMCP + rate limit"]

        subgraph CORE["tools/ (núcleo, sem openai e sem mcp)"]
            REG["registry.py<br/>Tool + execute_tool"]
            RT["resume_tools.py<br/>monta as 8 tools"]
            EXP["experience.py<br/>duração exata"]
            CAR["career.py<br/>tecnologia, empresa,<br/>linha do tempo"]
            DOC["docs_tools.py<br/>list_adrs, read_adr"]
        end

        PORTS{{"chat/ports.py<br/>Embedding, ChatCompletion,<br/>ToolCalling, WebSearch"}}
        OAI["adapters/openai_adapter.py"]
        TAV["adapters/tavily_adapter.py"]
    end

    ROUTER --> SERVICE
    SERVICE --> RAG
    SERVICE --> REG
    SERVICE --> PORTS
    MCPS --> RT
    REG --> RT
    RT --> EXP
    RT --> CAR
    RT --> DOC
    RT --> RAG
    RT --> PORTS
    PORTS --> OAI
    PORTS --> TAV

    OAI --> LLM[("OpenAI API<br/>embeddings + geração")]
    TAV --> WEB[("Tavily<br/>busca web")]
    RAG --> JSON[("resume.json")]
    CAR --> JSON
    EXP --> JSON
    DOC --> ADRS[("docs/architecture<br/>ADRs")]
```

O núcleo `tools/` não conhece protocolo: o `chat/service.py` traduz `Tool` para o function calling da OpenAI e o `mcp_server/` traduz o mesmo registro para MCP. Um teste garante que os dois schemas não divergem.

## Fluxo de uma pergunta com tool calling (flag `CHAT_TOOL_CALLING`)

```mermaid
sequenceDiagram
    participant V as Visitante
    participant S as service.answer_question
    participant R as rag (retrieval)
    participant M as Modelo (tool calling)
    participant T as Tools (núcleo)

    V->>S: pergunta + histórico
    S->>S: condensa a pergunta (se há histórico)
    S->>R: busca híbrida + auto-crítica seletiva
    R-->>S: chunks e score
    Note over S: recuperar primeiro: contexto vai junto da pergunta
    S->>M: contexto + pergunta + tools
    alt o contexto basta
        M-->>S: resposta direta (1 chamada)
    else precisa de precisão
        M->>T: find_technology, calculate_experience, career_timeline...
        T-->>M: fato exato (código, sem LLM)
        M-->>S: resposta final
    end
    S-->>V: answer + source (resume ou web)
    Note over S,M: teto de 3 turnos e 3 execuções.<br/>Falha do provider cai para o pipeline determinístico.
```

## Referências
- [C4-001: Contexto e Containers](C4-001-contexto-containers.md)
- [ADR-017](ADR-017-tools-e-mcp-um-nucleo-duas-portas.md), [ADR-018](ADR-018-tools-estruturadas-recuperar-primeiro-hibrida.md)
