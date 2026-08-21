# RAG na prática: memória conversacional, chunking e embeddings sem exagero de engenharia

> Post 2 da série. Lastro: `docs/architecture/ADR-003-fluxo-rag.md`, `ADR-014-memoria-conversacional-chat.md`, `PRD-013-memoria-conversacional-rag.md`, US-15-01/02/03. Formato: **post de feed do LinkedIn** (não Artigo). Texto abaixo pronto para colar direto na caixa de post. Imagem anexada separadamente (não faz parte do texto). Link do projeto no primeiro comentário, não no corpo.

---

## Texto do post (colar direto)

🧠 Meu assistente de chat "esquecia" a conversa mesmo com RAG funcionando.

Ele responde sobre minha trajetória usando meu currículo real como base (RAG). Três decisões nesse caminho, e a última foi a que mais me ensinou.

📦 Chunking: resisti a vontade de complicar. Currículo já é dado estruturado, então fiz um chunk por experiência, por grupo de skills, por projeto. Sem overlap, sem janela de tokens.

⚙️ Embeddings: fiquei com um provedor só (OpenAI: text-embedding-3-small + gpt-4o-mini). Dois provedores significam duas chaves, dois SDKs, dois billings, pra um volume de dezenas de chunks. Não valia a pena. Índice cacheado em JSON, sem banco vetorial. Custo de centavos de dólar por mês.

🧩 O bug: "onde você trabalha?" respondia certo. Já "onde fica a matriz da empresa?" e ele não sabia do que eu falava. O backend era stateless, buscando só pela pergunta atual, sem histórico nenhum.

A solução, que registrei como ADR antes de implementar: o histórico fica no cliente, sem sessão no servidor, porque um chat de currículo não precisa lembrar entre visitas. Quando existe histórico, a pergunta passa por uma condensação via LLM antes da busca. Se essa condensação falhar, o sistema cai pra pergunta crua e o chat não quebra.

✅ Fico com três princípios: chunking segue a estrutura real do dado, escolha de provedor é decisão de produto, memória não precisa de sessão persistida.

No próximo post: o que fiz quando "buscar por similaridade" parou de ser suficiente.

#RAG #AIEngineering #LLM #VectorSearch #GenerativeAI

---

## Imagem (anexar ao post)

`images/rag-fluxo-diagrama.svg` → exportar para PNG em alta resolução antes de subir.

## Primeiro comentário sugerido

🔗 Quem quiser testar o chat de verdade: https://lucas-palhares-cv.vercel.app
💻 Código aberto: https://github.com/lucaspalharesbarbosa/curriculo-online-ia
