# Publicação automática no LinkedIn — setup

Ferramentas usadas pela skill `@linkedin-publish` para publicar os posts de [`docs/content/linkedin/`](../../docs/content/linkedin/) direto no seu perfil pessoal do LinkedIn, via API oficial (não é scraping, não usa automação de navegador logado — por isso não viola os Termos de Uso).

Faça este setup **uma vez** (e de novo a cada ~60 dias, quando o token expirar).

## 1. Criar o app no LinkedIn Developer Portal

1. Acesse [linkedin.com/developers/apps](https://www.linkedin.com/developers/apps) → **Create app**
2. Preencha nome do app, e-mail, logo
3. **Company Page associada**: o LinkedIn exige vincular o app a uma Page. Se você não administra nenhuma, crie uma Page pessoal mínima (ex.: com seu próprio nome/marca pessoal) só para satisfazer esse requisito — ela não aparece em nada do que a skill publica, o post vai para o seu **perfil pessoal**, não para a Page
4. Verifique o app (LinkedIn pede confirmação via a Page)

## 2. Ativar os produtos necessários

Na aba **Products** do app, adicionar:

- **Sign In with LinkedIn using OpenID Connect** — dá os escopos `openid` e `profile` (usados só para descobrir o seu próprio ID de membro)
- **Share on LinkedIn** — dá o escopo `w_member_social` (permissão de publicar em seu nome)

Ambos são **self-serve**: liberam na hora, sem fila de aprovação.

## 3. Gerar o access token

Use a ferramenta pronta do próprio LinkedIn — não precisa programar OAuth manualmente:

1. Acesse [linkedin.com/developers/tools/oauth/token-generator](https://www.linkedin.com/developers/tools/oauth/token-generator)
2. Selecione o app criado no passo 1
3. Marque os escopos: `openid`, `profile`, `w_member_social`
4. Autorize (login normal do seu LinkedIn) e copie o **Access Token** gerado

O token vale por **60 dias** (a própria LinkedIn não emite refresh token de longa duração nesse tier). Quando expirar, repita só este passo 3 e atualize o `.env`.

## 4. Guardar o token localmente

Crie o arquivo `scripts/linkedin/.env` (o `.gitignore` da raiz já ignora qualquer `.env*` — nunca vai para o Git) com o conteúdo:

```
LINKEDIN_ACCESS_TOKEN=cole_o_token_aqui
```

## 5. Testar

```bash
python scripts/linkedin/publish_post.py docs/content/linkedin/01-loop-engineering-agentes-ia.md
```

Sem `--yes`, o script só mostra a **prévia** (texto exato + imagem) e não publica nada — é assim que a skill `@linkedin-publish` sempre usa primeiro. A publicação de fato só acontece com `--yes`, depois de você confirmar a prévia na conversa.

## Arquivos desta pasta

| Arquivo | Papel |
|---|---|
| `export_diagram.py` | Rasteriza um diagrama SVG (`docs/content/linkedin/images/*.svg`) para PNG em alta resolução, usando o Edge/Chrome já instalado no sistema — sem dependências novas |
| `render_video.py` | Renderiza um HTML animado (`docs/content/linkedin/videos/*.html`) em MP4 quadrado para os posts em vídeo. Sobe **uma** instância do Edge/Chrome e conversa com ela pelo DevTools Protocol, chamando `window.renderFrame(n)` frame a frame. Requer `pip install imageio-ffmpeg websockets` |
| `publish_post.py` | Lê o `.md` do post, mostra prévia e (com `--yes`) publica via API oficial: Images API ou Videos API (upload) + Posts API (criação do post). Se o `.md` citar um vídeo (`` `videos/<nome>.mp4` ``, gerado por `render_video.py`), o post sai com o vídeo; senão, com a imagem exportada |
| `.env` | Token de acesso (não versionado — você cria a partir deste guia) |

## Vídeo dos posts

Os posts em vídeo são feitos de um HTML animado, para ficarem reproduzíveis e editáveis
(nada de ferramenta externa). O HTML precisa expor `window.renderFrame(frame)` e desenhar
o estado daquele frame de forma determinística, sem depender do relógio do navegador.

```bash
pip install imageio-ffmpeg websockets
python scripts/linkedin/render_video.py docs/content/linkedin/videos/<post>.html --seconds 60
```

Saem 1080x1080 (quadrado ocupa mais área no feed que 16:9), H.264/yuv420p, sem áudio.
Um vídeo de 60s a 30fps leva cerca de 3 minutos para renderizar. Para conferir um frame
isolado enquanto edita, basta abrir o HTML no navegador com `?f=<frame>`.

Duas coisas que o HTML deve carregar sempre: a assinatura no rodapé (foto, nome e URL do
perfil) e a marca d'água diagonal de fundo em baixa opacidade, contra cópia.

## Limitações que valem lembrar

- **Sem agendamento nativo**: a API publica na hora. "Agendar" exigiria manter um processo rodando (cron/Task Scheduler) chamando o script no horário certo — fora de escopo por ora
- **Token expira em 60 dias**: sem lembrete automático; se `publish_post.py` falhar com erro 401, é sinal de gerar um token novo (passo 3)
- **Primeiro comentário com o link do projeto** não é automatizado (schema da API de comentários não foi validado aqui) — o script imprime o texto sugerido no final, é só colar manualmente assim que o post aparecer no feed
