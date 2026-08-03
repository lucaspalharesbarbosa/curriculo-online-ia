# Checklist de Segurança — Code Review (Currículo Online)

Violação Critical → veredito **Bloquear**. Este é um projeto pessoal, mas a exposição real (chave de API de LLM) tem custo direto se vazar — tratar com o mesmo rigor de um sistema comercial nesse ponto específico.

## Chaves de API

- [ ] Nenhuma chamada ao provider de LLM feita diretamente do frontend/client
- [ ] `LLM_API_KEY` (ou equivalente) só existe como variável de ambiente no backend/plataforma de deploy, nunca commitada
- [ ] `.env` no `.gitignore`; só `.env.example` (sem valores reais) versionado
- [ ] Resposta do endpoint `/chat` não ecoa a chave nem detalhes internos do provider

## CORS

- [ ] Backend restringe `allow_origins` ao domínio real do frontend (Vercel) + `localhost` em dev
- [ ] Nunca `allow_origins=["*"]` em produção
- [ ] Métodos permitidos limitados ao necessário (`POST` para `/chat`, `GET` para `/health`)

## Validação de entrada

- [ ] Payload do `/chat` validado via Pydantic (tamanho/tipo da pergunta)
- [ ] Sem execução de shell ou leitura de arquivo arbitrário a partir de input do visitante

## Dados e logs

- [ ] Pergunta do visitante não logada com dados sensíveis desnecessários
- [ ] Sem PII de terceiros persistida sem necessidade

## Dependências

- [ ] Nova dependência (npm/pip) justificada — evitar libs pesadas (LangChain/LlamaIndex) para um RAG simples

## Severidade rápida

| Finding | Sev típica |
|---|---|
| Chave de API no repositório ou no bundle do client | Critical |
| CORS aberto (`*`) em produção | Critical |
| Chamada ao LLM feita do frontend | Critical |
| Log com pergunta+resposta sem necessidade | Low |
| Dependência pesada desnecessária | Medium |
