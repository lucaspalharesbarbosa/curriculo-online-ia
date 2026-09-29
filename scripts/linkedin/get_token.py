#!/usr/bin/env python3
"""Gera o access token do LinkedIn pelo fluxo OAuth 2.0 (authorization code)
usando o seu próprio app, sem passar pelo gerador de token do portal de
desenvolvedores (que às vezes falha com "state parameter was modified").

Sem dependências externas: só a stdlib do Python.

Pré-requisito único no LinkedIn: na aba "Auth" do app, em "Authorized redirect
URLs for your app", adicionar exatamente:
    http://localhost:8080/callback

Uso:
    python scripts/linkedin/get_token.py --client-id SEU_CLIENT_ID

O Client Secret é pedido num prompt local (não aparece na tela e não é salvo).
O navegador abre a tela de autorização do LinkedIn: é só clicar em "Permitir".
O token é gravado em scripts/linkedin/.env (LINKEDIN_ACCESS_TOKEN) e nunca é
impresso no terminal.
"""
from __future__ import annotations

import argparse
import getpass
import json
import os
import secrets
import sys
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parent / ".env"
AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
SCOPES = "openid profile w_member_social"
WAIT_SECONDS = 300


class CallbackHandler(BaseHTTPRequestHandler):
    result: dict[str, str] = {}

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/callback":
            self.send_response(404)
            self.end_headers()
            return
        params = {k: v[0] for k, v in urllib.parse.parse_qs(parsed.query).items()}
        CallbackHandler.result = params
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(
            "<h2>Pronto. Pode fechar esta aba e voltar ao terminal.</h2>".encode("utf-8")
        )

    def log_message(self, *args: object) -> None:  # silencia o log do servidor
        pass


def wait_for_code(port: int, expected_state: str) -> str:
    server = HTTPServer(("127.0.0.1", port), CallbackHandler)
    server.timeout = WAIT_SECONDS
    server.handle_request()
    server.server_close()
    params = CallbackHandler.result
    if not params:
        sys.exit(f"Nenhuma resposta do LinkedIn em {WAIT_SECONDS}s. Rode o script de novo.")
    if "error" in params:
        sys.exit(f"LinkedIn recusou: {params.get('error')} {params.get('error_description', '')}")
    if params.get("state") != expected_state:
        sys.exit("O parâmetro state não bate. Abortado por segurança; rode o script de novo.")
    code = params.get("code")
    if not code:
        sys.exit(f"Resposta sem 'code': {params}")
    return code


def exchange_code(code: str, client_id: str, client_secret: str, redirect_uri: str) -> dict:
    body = urllib.parse.urlencode(
        {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        TOKEN_URL,
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        sys.exit(f"Erro {exc.code} ao trocar o code pelo token:\n{detail}")


def save_token(token: str) -> None:
    lines: list[str] = []
    if ENV_PATH.exists():
        lines = [
            line
            for line in ENV_PATH.read_text(encoding="utf-8").splitlines()
            if not line.strip().startswith("LINKEDIN_ACCESS_TOKEN=")
        ]
    lines.append(f"LINKEDIN_ACCESS_TOKEN={token}")
    ENV_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--client-id", required=True, help="Client ID do app (aba Auth do portal)")
    parser.add_argument("--port", type=int, default=8080, help="Porta local do callback (default: 8080)")
    args = parser.parse_args()

    redirect_uri = f"http://localhost:{args.port}/callback"
    client_secret = os.environ.get("LINKEDIN_CLIENT_SECRET", "").strip() or getpass.getpass(
        "Client Secret (não aparece enquanto você digita): "
    ).strip()
    if not client_secret:
        sys.exit("Client Secret vazio.")

    state = secrets.token_urlsafe(24)
    query = urllib.parse.urlencode(
        {
            "response_type": "code",
            "client_id": args.client_id,
            "redirect_uri": redirect_uri,
            "state": state,
            "scope": SCOPES,
        }
    )
    url = f"{AUTH_URL}?{query}"

    print(f"Abrindo o navegador para autorizar (callback em {redirect_uri})...")
    print("Se não abrir sozinho, copie e cole este endereço no navegador:\n" + url + "\n")
    webbrowser.open(url)

    code = wait_for_code(args.port, state)
    data = exchange_code(code, args.client_id, client_secret, redirect_uri)
    token = data.get("access_token")
    if not token:
        sys.exit(f"Resposta sem access_token: {list(data.keys())}")

    save_token(token)
    days = int(data.get("expires_in", 0)) // 86400
    print(f"Token salvo em {ENV_PATH} (expira em cerca de {days} dias). Não foi impresso aqui.")


if __name__ == "__main__":
    main()
