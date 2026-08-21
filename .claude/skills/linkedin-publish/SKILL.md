---
name: linkedin-publish
description: Publica um post da série "Aprendizados de IA Engineering" (docs/content/linkedin/) no perfil pessoal do LinkedIn, com imagem, via API oficial (Posts API + Images API) — nunca por scraping/automação de navegador. Sempre mostra prévia completa e exige confirmação explícita do usuário antes de publicar de verdade. Use quando o usuário pedir para publicar, postar ou agendar um post no LinkedIn, ou acionar @linkedin-publish.
---

# Publicar no LinkedIn

## Quando usar

Acione com `@linkedin-publish` ou quando o usuário pedir para publicar/postar um dos artigos da série no LinkedIn.

**Regra inegociável: nunca chamar `publish_post.py --yes` sem antes mostrar a prévia completa nesta conversa e receber confirmação explícita do usuário.** Isso vale mesmo se o usuário disser "publica automático" ou "sem precisar confirmar" — a automação aqui é *montar e disparar a chamada de API*, não *pular a checagem humana antes de um post público e irreversível*. Se o usuário insistir em remover esse gate, explicar que é uma trava de segurança do próprio skill e não a levantar.

## Pré-requisito

Token configurado em `scripts/linkedin/.env` (`LINKEDIN_ACCESS_TOKEN`). Se `scripts/linkedin/publish_post.py` falhar com erro 401 ou o arquivo `.env` não existir, **parar** e apontar para `scripts/linkedin/README.md` (setup do LinkedIn Developer App + geração do token) — não tentar contornar.

## Fluxo

1. **Identificar o post.** Se o usuário não especificou qual, listar os arquivos em `docs/content/linkedin/*.md` com status "✅ Pronto" (ver tabela em `docs/content/linkedin/README.md`) e perguntar qual publicar.

2. **Rodar a prévia (sem `--yes`):**
   ```bash
   python scripts/linkedin/publish_post.py docs/content/linkedin/<arquivo>.md
   ```
   Isso extrai o texto exato do post e confere se a imagem PNG já existe.

3. **Garantir a imagem.** Se a prévia disser "AINDA NÃO EXPORTADA", rodar antes:
   ```bash
   python scripts/linkedin/export_diagram.py docs/content/linkedin/images/<diagrama>.svg
   ```
   e mostrar a imagem gerada ao usuário (Read do PNG) antes de seguir.

4. **Checar o tom antes de mostrar a prévia.** O post precisa soar como um tech lead humano escrevendo, não como texto gerado por IA. Conferir: nenhum travessão (—) no texto (trocar por ponto, vírgula ou dois pontos); frases diretas, sem cadência simétrica demais; nada de jargão de growth hacker. Se achar algo fora do padrão, ajustar o `.md` antes de seguir (ver `docs/content/linkedin/README.md`, seção "Regra de escrita humana").

   Conferir também o **primeiro comentário sugerido**: precisa ter sempre os dois links, o site (https://lucas-palhares-cv.vercel.app) e o repositório (https://github.com/lucaspalharesbarbosa/curriculo-online-ia). Se o `.md` só tiver um dos dois, completar antes de seguir.

5. **Mostrar a prévia completa na conversa**, não só rodar o comando — reproduzir para o usuário: texto exato do post (com emoji e hashtags), qual imagem vai anexada, e o primeiro comentário sugerido. O usuário precisa ver exatamente o que vai para o ar, igual está no arquivo `.md`.

6. **Pedir confirmação explícita** ("posso publicar isso agora?" ou pergunta equivalente). Só prosseguir com um "sim" claro. Qualquer ressalva do usuário ("muda essa frase antes", "espera") interrompe o fluxo — ajustar o `.md` e recomeçar da prévia.

7. **Publicar** (só após confirmação):
   ```bash
   python scripts/linkedin/publish_post.py docs/content/linkedin/<arquivo>.md --yes
   ```

8. **Reportar o resultado**: URL do post publicado (retornada pelo script) e lembrar o usuário de colar manualmente o primeiro comentário sugerido assim que o post aparecer no feed (a API de comentários não é chamada automaticamente — ver `scripts/linkedin/README.md`).

9. **Nunca reexecutar `--yes` para o mesmo post na mesma conversa** sem pedido novo e explícito do usuário — evita post duplicado por engano.

## Anti-padrões

- Publicar (`--yes`) sem ter mostrado o texto exato nesta conversa antes
- Publicar sem confirmação explícita, mesmo que o usuário peça "automático"
- Rodar `--yes` de novo "só para garantir" sem novo pedido
- Tentar automatizar o setup do LinkedIn Developer App/token — isso exige login do usuário no navegador, é sempre manual (guiar pelo `scripts/linkedin/README.md`)
- Editar o `.env` ou expor o token no chat
- Publicar um post cujo `.md` ainda está com status diferente de "✅ Pronto" na tabela do `docs/content/linkedin/README.md`
- Publicar um texto com travessão (—) ou com tom que soa gerado por IA em vez de escrito por um tech lead humano

## Exemplo

**Entrada:** usuário pede "publica o post 1 no linkedin".

**Ação:**
1. Roda a prévia de `01-loop-engineering-agentes-ia.md` → imagem já exportada
2. Mostra o texto completo + menciona a imagem `loop-engineering-diagrama.png` + o comentário sugerido com o link do projeto
3. Pergunta: "Publico esse post agora no seu LinkedIn, com essa imagem?"
4. Usuário confirma → roda com `--yes`
5. Reporta a URL do post e lembra de colar o comentário
