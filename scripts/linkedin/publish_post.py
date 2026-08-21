#!/usr/bin/env python3
"""Publica um post (texto + imagem) no perfil pessoal do LinkedIn, usando a
Posts API e a Images API oficiais (REST, header Linkedin-Version: YYYYMM).

Sem dependências externas — só a stdlib do Python (urllib).

Uso:
    python publish_post.py ../../docs/content/linkedin/01-loop-engineering-agentes-ia.md
    python publish_post.py ../../docs/content/linkedin/01-loop-engineering-agentes-ia.md --yes

Sem --yes: só mostra a prévia (texto exato + imagem) e para — não publica nada.
Com --yes: publica de verdade. Exige LINKEDIN_ACCESS_TOKEN em scripts/linkedin/.env
(ver README.md desta pasta).
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
ENV_PATH = HERE / ".env"
API_BASE = "https://api.linkedin.com"
LINKEDIN_VERSION = date.today().strftime("%Y%m")  # header exige formato YYYYMM

try:  # console do Windows por padrão não é UTF-8; sem isso, emoji quebra o print
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):
    pass


def load_env() -> dict[str, str]:
    values: dict[str, str] = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def require_token() -> str:
    token = load_env().get("LINKEDIN_ACCESS_TOKEN", "")
    if not token:
        sys.exit(
            "LINKEDIN_ACCESS_TOKEN não encontrado em scripts/linkedin/.env.\n"
            "Siga scripts/linkedin/README.md para gerar o token antes de publicar."
        )
    return token


def api_request(method: str, path: str, token: str, body: dict | None = None) -> tuple[dict, dict]:
    """Chamada que interrompe o script (sys.exit) em qualquer erro — usada
    nos passos essenciais (userinfo, initializeUpload, criação do post)."""
    url = f"{API_BASE}{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Restli-Protocol-Version": "2.0.0",
        "Linkedin-Version": LINKEDIN_VERSION,
        "Content-Type": "application/json",
    }
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read()
            parsed = json.loads(raw) if raw else {}
            return parsed, dict(resp.headers)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        sys.exit(f"Erro {exc.code} em {method} {path}:\n{detail}")


def api_request_soft(method: str, path: str, token: str) -> dict | None:
    """Igual à api_request, mas nunca derruba o script — usada só para o
    polling de status da imagem, que é best-effort (alguns tokens só com
    w_member_social não têm permissão de GET em /rest/images)."""
    url = f"{API_BASE}{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Restli-Protocol-Version": "2.0.0",
        "Linkedin-Version": LINKEDIN_VERSION,
    }
    req = urllib.request.Request(url, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}
    except Exception:
        return None


def get_person_urn(token: str) -> str:
    parsed, _ = api_request("GET", "/v2/userinfo", token)
    sub = parsed.get("sub")
    if not sub:
        sys.exit(f"Resposta de /v2/userinfo sem campo 'sub': {parsed}")
    return f"urn:li:person:{sub}"


def upload_image(token: str, owner_urn: str, png_path: Path) -> str:
    init_body = {"initializeUploadRequest": {"owner": owner_urn}}
    parsed, _ = api_request("POST", "/rest/images?action=initializeUpload", token, init_body)
    value = parsed.get("value", {})
    upload_url = value.get("uploadUrl")
    image_urn = value.get("image")
    if not upload_url or not image_urn:
        sys.exit(f"Resposta inesperada de initializeUpload: {parsed}")

    image_bytes = png_path.read_bytes()
    req = urllib.request.Request(
        upload_url,
        data=image_bytes,
        headers={"Authorization": f"Bearer {token}"},
        method="PUT",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        if resp.status not in (200, 201):
            sys.exit(f"Falha no upload da imagem: HTTP {resp.status}")

    # best-effort: espera o processamento (status AVAILABLE) antes de usar
    # a imagem no post; se o token não tiver permissão de GET, só aguarda.
    encoded_urn = image_urn.replace(":", "%3A")
    for _ in range(6):
        status = api_request_soft("GET", f"/rest/images/{encoded_urn}", token)
        if status is None:
            time.sleep(3)
            break
        if status.get("status") == "AVAILABLE":
            break
        time.sleep(1)

    return image_urn


def create_post(token: str, author_urn: str, commentary: str, image_urn: str, alt_text: str) -> tuple[str, str]:
    body = {
        "author": author_urn,
        "commentary": commentary,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "content": {"media": {"id": image_urn, "altText": alt_text}},
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }
    _, headers = api_request("POST", "/rest/posts", token, body)
    post_urn = headers.get("x-restli-id") or headers.get("X-RestLi-Id", "")
    post_url = f"https://www.linkedin.com/feed/update/{post_urn}/" if post_urn else ""
    return post_urn, post_url


# --------- parsing do markdown do post ---------

def extract_post(md_path: Path) -> tuple[str, Path, str, str]:
    text = md_path.read_text(encoding="utf-8")

    body_match = re.search(r"## Texto do post \(colar direto\)\s*\n\n(.*?)\n\n---", text, re.S)
    if not body_match:
        sys.exit(f"Não encontrei a seção '## Texto do post (colar direto)' em {md_path}")
    commentary = body_match.group(1).strip()

    image_match = re.search(r"`(images/[^`]+\.svg)`", text)
    if not image_match:
        sys.exit(f"Não encontrei referência a um SVG em images/ dentro de {md_path}")
    svg_path = md_path.parent / image_match.group(1)

    title_match = re.search(r"^# (.+)$", text, re.M)
    alt_text = title_match.group(1) if title_match else md_path.stem

    comment_match = re.search(r"## Primeiro comentário sugerido\s*\n\n(.+?)\s*$", text, re.S)
    suggested_comment = comment_match.group(1).strip() if comment_match else ""

    return commentary, svg_path, alt_text, suggested_comment


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("post", type=Path, help="Caminho do .md do post (ex.: docs/content/linkedin/01-....md)")
    parser.add_argument("--yes", action="store_true", help="Confirma a publicação de fato (sem essa flag, só mostra a prévia)")
    args = parser.parse_args()

    if not args.post.exists():
        sys.exit(f"Arquivo não encontrado: {args.post}")

    commentary, svg_path, alt_text, suggested_comment = extract_post(args.post)
    png_path = svg_path.with_suffix(".png")

    print("=" * 60)
    print("PRÉVIA DO POST")
    print("=" * 60)
    print(commentary)
    print("-" * 60)
    print(f"Imagem: {png_path.name} ({'ok' if png_path.exists() else 'AINDA NÃO EXPORTADA — rode export_diagram.py antes'})")
    print(f"Caracteres: {len(commentary)}")
    if suggested_comment:
        print(f"Primeiro comentário sugerido (colar manualmente depois): {suggested_comment}")
    print("=" * 60)

    if not args.yes:
        print("\nPrévia apenas — nada foi publicado. Rode de novo com --yes para publicar de verdade.")
        return

    if not png_path.exists():
        sys.exit(f"PNG não encontrado ({png_path}). Rode export_diagram.py primeiro.")

    token = require_token()
    print("Autenticando…")
    author_urn = get_person_urn(token)

    print("Subindo imagem…")
    image_urn = upload_image(token, author_urn, png_path)

    print("Publicando post…")
    post_urn, post_url = create_post(token, author_urn, commentary, image_urn, alt_text)

    print("\nPublicado com sucesso.")
    print(f"URN: {post_urn}")
    if post_url:
        print(f"URL: {post_url}")
    if suggested_comment:
        print(f"\nLembrete: cole manualmente o primeiro comentário assim que o post aparecer no feed:\n{suggested_comment}")


if __name__ == "__main__":
    main()
