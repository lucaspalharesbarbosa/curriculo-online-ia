#!/usr/bin/env python3
"""Renderiza um HTML animado em MP4 quadrado, para os vídeos dos posts da série.

Usa o Chromium (Edge/Chrome) já instalado no sistema, como o `export_diagram.py`,
mas com uma diferença importante: sobe **uma única** instância do navegador e
conversa com ela pelo Chrome DevTools Protocol, chamando `window.renderFrame(n)`
e capturando a tela a cada frame. Abrir um processo por frame (o caminho óbvio)
custa mais de 1s por frame e trava de forma intermitente depois de algumas
dezenas de execuções; por aqui cada frame sai em dezenas de milissegundos.

Contrato do HTML: precisa expor `window.renderFrame(frame)`, desenhando o estado
daquele frame de forma determinística, sem depender do relógio do navegador.

A montagem do MP4 usa o binário do `imageio-ffmpeg` (pip), sem exigir ffmpeg no
PATH.

Uso:
    python scripts/linkedin/render_video.py docs/content/linkedin/videos/03-auto-critica.html
    python scripts/linkedin/render_video.py <html> --seconds 15 --fps 30 --size 1080
"""
from __future__ import annotations

import argparse
import asyncio
import base64
import json
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

import imageio_ffmpeg
import websockets

CANDIDATES = ["msedge", "microsoft-edge", "google-chrome", "chrome", "chromium", "chromium-browser"]
WINDOWS_PATHS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]


def find_browser() -> str:
    for name in CANDIDATES:
        path = shutil.which(name)
        if path:
            return path
    for path in WINDOWS_PATHS:
        if Path(path).exists():
            return path
    raise RuntimeError("Nenhum navegador Chromium (Edge/Chrome) encontrado.")


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def wait_for_debugger(port: int, timeout: float = 30.0) -> str:
    """Espera o navegador subir e devolve a URL do WebSocket da aba."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list", timeout=2) as resp:
                targets = json.loads(resp.read())
            pages = [t for t in targets if t.get("type") == "page" and t.get("webSocketDebuggerUrl")]
            if pages:
                return pages[0]["webSocketDebuggerUrl"]
        except OSError:
            pass
        time.sleep(0.25)
    raise RuntimeError("Navegador não expôs o DevTools Protocol a tempo.")


class Session:
    """Cliente mínimo do CDP: manda comandos numerados e espera a resposta."""

    def __init__(self, ws) -> None:
        self.ws = ws
        self.next_id = 0

    async def send(self, method: str, **params):
        self.next_id += 1
        message_id = self.next_id
        await self.ws.send(json.dumps({"id": message_id, "method": method, "params": params}))
        while True:
            payload = json.loads(await self.ws.recv())
            if payload.get("id") == message_id:
                if "error" in payload:
                    raise RuntimeError(f"{method}: {payload['error']}")
                return payload.get("result", {})


async def capture(html: Path, frames_dir: Path, total: int, size: int, port: int) -> None:
    ws_url = wait_for_debugger(port)
    async with websockets.connect(ws_url, max_size=64 * 1024 * 1024) as ws:
        session = Session(ws)
        await session.send("Page.enable")
        await session.send(
            "Emulation.setDeviceMetricsOverride",
            width=size,
            height=size,
            deviceScaleFactor=1,
            mobile=False,
        )
        await session.send("Page.navigate", url=f"{html.as_uri()}?f=0")
        # Página local, sem rede: uma espera curta cobre o load e o avatar.
        await asyncio.sleep(2.0)

        for frame in range(total):
            await session.send(
                "Runtime.evaluate",
                expression=f"window.renderFrame({frame})",
                awaitPromise=False,
            )
            shot = await session.send(
                "Page.captureScreenshot",
                format="png",
                captureBeyondViewport=False,
            )
            (frames_dir / f"f{frame:05d}.png").write_bytes(base64.b64decode(shot["data"]))
            if (frame + 1) % 60 == 0 or frame + 1 == total:
                print(f"  {frame + 1}/{total} frames")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("html", type=Path)
    parser.add_argument("--seconds", type=float, default=15.0)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--size", type=int, default=1080)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()

    html = args.html.resolve()
    if not html.exists():
        sys.exit(f"HTML não encontrado: {html}")
    output = args.output or html.with_suffix(".mp4")
    total = int(args.seconds * args.fps)
    browser = find_browser()
    port = free_port()

    with tempfile.TemporaryDirectory(prefix="linkedin-frames-") as tmp:
        tmpdir = Path(tmp)
        frames = tmpdir / "frames"
        frames.mkdir()

        print(f"Renderizando {total} frames ({args.seconds}s a {args.fps}fps)...")
        process = subprocess.Popen(
            [
                browser,
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--no-first-run",
                "--no-default-browser-check",
                "--force-device-scale-factor=1",
                f"--remote-debugging-port={port}",
                f"--user-data-dir={tmpdir / 'profile'}",
                f"--window-size={args.size},{args.size}",
                "about:blank",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        try:
            asyncio.run(capture(html, frames, total, args.size, port))
        finally:
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()

        missing = [i for i in range(total) if not (frames / f"f{i:05d}.png").exists()]
        if missing:
            sys.exit(f"Frames não gerados: {missing[:10]} (total {len(missing)})")

        print("Montando MP4 (H.264, yuv420p)...")
        subprocess.run(
            [
                imageio_ffmpeg.get_ffmpeg_exe(),
                "-y",
                "-framerate", str(args.fps),
                "-i", str(frames / "f%05d.png"),
                "-c:v", "libx264",
                "-preset", "slow",
                "-crf", "20",
                "-pix_fmt", "yuv420p",
                "-movflags", "+faststart",
                str(output),
            ],
            check=True,
            capture_output=True,
        )

    size_mb = output.stat().st_size / 1024 / 1024
    print(f"OK: {output} ({size_mb:.1f} MB, {args.seconds}s, {args.size}x{args.size})")


if __name__ == "__main__":
    main()
