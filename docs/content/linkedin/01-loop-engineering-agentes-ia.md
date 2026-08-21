# Loop Engineering: como fiz meus agentes de IA corrigirem os próprios erros até o merge

> Post 1 da série. Lastro: `docs/architecture/ADR-015-loop-engineering-pipeline.md`. Formato: **post de feed do LinkedIn** (não Artigo — a API não suporta Artigo de formato longo). Texto abaixo pronto para colar direto na caixa de post. Imagem anexada separadamente (não faz parte do texto). Link do projeto no primeiro comentário, não no corpo.

---

## Texto do post (colar direto)

🔁 Meus agentes de IA corrigem os próprios erros até o merge. Sem eu apertar botão nenhum.

Construo meu portfólio com um pipeline de agentes: PO, arquiteto, dev, QA, tech lead. Por um tempo o gargalo fui eu. Toda reprovação parava tudo esperando minha decisão, mesmo quando era só um teste quebrado ou lint falhando. Um problema com resposta certa, não uma questão de opinião.

A virada veio quando entendi isso: se uma etapa tem sinal de feedback verificável (teste, lint, veredito de review), ela não precisa da minha aprovação pra se corrigir. Só precisa corrigir, testar de novo e seguir.

Isso virou três níveis de loop:

⚙️ Interno: lint, teste, build, dentro do próprio dev

🔁 Entre fases: achado do QA ou do tech lead reabre o dev sozinho

🤖 CI: pipeline falha, o agente lê o log, corrige e repush

Só existe um gate humano em todo o processo: a confirmação antes do merge em main, que é a ação mais difícil de desfazer. Tudo antes disso roda sozinho, com limite de 3 tentativas por loop.

✅ O ganho real não foi só velocidade. Foi onde minha atenção passou a ser gasta. Só em decisão que exige julgamento, não em lint quebrado.

No próximo post: o que esse pipeline construiu, a estratégia de RAG por trás do assistente do meu portfólio.

#AIAgents #AIEngineering #SoftwareEngineering #DevOps #LLMOps

---

## Imagem (anexar ao post)

`images/loop-engineering-diagrama.svg` → exportar para PNG em alta resolução antes de subir.

## Primeiro comentário sugerido

🔗 Meu portfólio, com assistente de IA sobre minha trajetória: https://lucas-palhares-cv.vercel.app
💻 Código aberto: https://github.com/lucaspalharesbarbosa/curriculo-online-ia
