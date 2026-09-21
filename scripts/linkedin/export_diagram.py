#!/usr/bin/env python3
"""Rasteriza um SVG standalone (com viewBox) para PNG em alta resolução,
usando um navegador Chromium (Edge ou Chrome) já instalado no sistema.

Sem dependências externas — só a stdlib do Python.

Uso:
    python export_diagram.py ../../docs/content/linkedin/images/loop-engineering-diagrama.svg
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

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
    raise RuntimeError(
        "Nenhum navegador Chromium (Edge/Chrome) encontrado. "
        "O Windows 11 já vem com o Edge; se não achar, exporte manualmente: "
        "abra o SVG no navegador e use captura/print em alta resolução."
    )


def read_viewbox(svg_path: Path) -> tuple[int, int]:
    text = svg_path.read_text(encoding="utf-8")
    match = re.search(r'viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"', text)
    if not match:
        raise ValueError(f"viewBox não encontrado em {svg_path}")
    return int(float(match.group(1))), int(float(match.group(2)))


def export(svg_path: Path, png_path: Path, scale: int = 2) -> None:
    browser = find_browser()
    width, height = read_viewbox(svg_path)
    uri = svg_path.resolve().as_uri()
    cmd = [
        browser,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--force-device-scale-factor={scale}",
        f"--window-size={width},{height}",
        f"--screenshot={png_path.resolve()}",
        "--default-background-color=FFFFFFFF",
        uri,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0 or not png_path.exists():
        raise RuntimeError(
            f"Falha ao exportar {svg_path.name} para PNG.\n"
            f"comando: {' '.join(cmd)}\n"
            f"stdout: {result.stdout}\nstderr: {result.stderr}"
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("svg", type=Path, help="Caminho do SVG de origem")
    parser.add_argument("--out", type=Path, default=None, help="PNG de saída (default: mesmo nome, extensão .png)")
    parser.add_argument("--scale", type=int, default=2, help="Fator de escala do device pixel ratio (default: 2x)")
    args = parser.parse_args()

    if not args.svg.exists():
        sys.exit(f"SVG não encontrado: {args.svg}")

    png_path = args.out or args.svg.with_suffix(".png")
    try:
        export(args.svg, png_path, args.scale)
    except (RuntimeError, ValueError) as exc:
        sys.exit(str(exc))

    print(f"PNG exportado: {png_path} ({png_path.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
