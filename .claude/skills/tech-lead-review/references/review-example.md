# Exemplo de Review — Tech Lead (Currículo Online)

Referência de tom e profundidade.

---

# Code Review — branch `feature/chat-widget`

## Resumo

Adiciona `ChatWidget.tsx` e endpoint `/chat` no backend. Fluxo feliz funciona, mas a chave de API está sendo lida no client e o CORS do backend está aberto para qualquer origem.

## Veredito

**Bloquear**

## Pontos positivos

- Componente bem isolado, sem lógica de negócio misturada na UI
- `rag.py` separado de `chat.py`, fácil de testar cada um isoladamente

## Achados

| Sev | Local | Achado | Sugestão |
|-----|-------|--------|----------|
| Critical | `frontend/components/ChatWidget.tsx:14` | Chama a API do LLM direto do client com a chave em `NEXT_PUBLIC_LLM_API_KEY` | Mover a chamada para o backend; frontend só fala com `/chat` |
| Critical | `backend/app/main.py:9` | `allow_origins=["*"]` | Restringir ao domínio da Vercel + `localhost:3000` |
| High | `backend/app/chat.py` | Endpoint sem teste | Adicionar teste com `TestClient` e LLM mockado |
| Low | `ChatWidget.tsx` | Nome de variável `x` pouco descritivo | Renomear para `question` |

## Checklist rápido

- [ ] Sem chave de API no client — **falhou**
- [ ] CORS restrito — **falhou**
- [ ] Teste do endpoint principal — **faltando**
- [x] Componente bem isolado

## Próximos passos

1. Mover chamada ao LLM para o backend
2. Restringir CORS ao domínio real
3. Adicionar teste do endpoint `/chat`
