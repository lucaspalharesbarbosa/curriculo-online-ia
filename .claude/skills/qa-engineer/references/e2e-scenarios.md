# Cenários manuais / E2E — Currículo Online

Roteiros para checar antes de considerar uma feature ou o deploy prontos.

---

## S1 — Navegação do site

1. Abrir a home — todas as seções (Hero, Experiência, Skills, Projetos, Contato) renderizam com dados de `resume.json`
2. Links de contato (e-mail, LinkedIn, GitHub) funcionam
3. Botão de download do PDF do currículo funciona

## S2 — Responsividade e acessibilidade

1. Layout ok em mobile e desktop
2. Navegação por teclado (tab) alcança todos os elementos interativos
3. Imagens com `alt`; contraste de texto adequado

## S3 — Fluxo de chat (feliz)

1. Visitante digita pergunta sobre a trajetória (ex.: "quais projetos em React?")
2. Backend retorna resposta coerente com o `resume.json`
3. Tempo de resposta percebido é aceitável

## S4 — Fluxo de chat (fallback)

1. Simular falha do provider de LLM (mock retornando erro/timeout)
2. Frontend exibe mensagem de fallback amigável, sem quebrar a página
3. Nenhuma chave de API exposta no console do navegador ou no payload de resposta

## S5 — CORS e ambiente

1. Frontend local (`localhost:3000`) consegue chamar o backend local
2. Frontend em produção (Vercel) consegue chamar o backend em produção (Render/Cloud Run)
3. Origem não autorizada é bloqueada pelo CORS do backend

## S6 — Deploy

1. `npm run build` do frontend sem erro
2. Backend sobe (`uvicorn`) e `/health` responde
3. Lighthouse rodado no preview de deploy — sem regressão de performance/acessibilidade

---

Documentar em cada execução: cenário, resultado, evidência (print, log, status HTTP).
