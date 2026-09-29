"""Tools de leitura das decisões de arquitetura do projeto (`ADR-018`).

O chat passa a explicar o próprio projeto lendo os ADRs em `docs/architecture/`,
o que a busca semântica sobre o currículo não cobre. Somente leitura, sem
caminho vindo do usuário: o arquivo é escolhido por número, casado com um
padrão fixo de nome, então não há como sair da pasta.
"""

from __future__ import annotations

import re
from pathlib import Path

DOCS_DIR = Path(__file__).resolve().parents[3] / "docs" / "architecture"
MAX_ADR_CHARS = 8000

_ADR_FILE = re.compile(r"^ADR-(\d{3})-.+\.md$")
# Separadores do título: dois-pontos, hífen e as duas riscas longas (escapes).
_TITLE_PREFIX = re.compile(r"^ADR-\d{3}\s*[:\-\u2014\u2013]\s*")
_MISSING_MESSAGE = "Os ADRs não estão disponíveis neste ambiente."


def _adr_files(docs_dir: Path) -> dict[int, Path]:
    if not docs_dir.is_dir():
        return {}
    files: dict[int, Path] = {}
    for path in sorted(docs_dir.iterdir()):
        match = _ADR_FILE.match(path.name)
        if match:
            files[int(match.group(1))] = path
    return files


def _title_and_status(path: Path) -> tuple[str, str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    title = path.stem
    if lines and lines[0].startswith("#"):
        title = _TITLE_PREFIX.sub("", lines[0].lstrip("# ").strip())
    status = "sem status"
    for index, line in enumerate(lines):
        if line.strip() == "## Status":
            for following in lines[index + 1 :]:
                if following.strip():
                    status = following.strip()
                    break
            break
    return title, status


def list_adrs(docs_dir: Path = DOCS_DIR) -> str:
    files = _adr_files(docs_dir)
    if not files:
        return _MISSING_MESSAGE
    lines = []
    for number, path in files.items():
        title, status = _title_and_status(path)
        lines.append(f"- ADR-{number:03d}: {title} ({status})")
    return "Decisões de arquitetura do projeto:\n" + "\n".join(lines)


def read_adr(number: int, docs_dir: Path = DOCS_DIR) -> str:
    if isinstance(number, bool) or not isinstance(number, int):
        raise ValueError("number deve ser um inteiro (ex.: 3 para o ADR-003).")
    files = _adr_files(docs_dir)
    if not files:
        return _MISSING_MESSAGE
    path = files.get(number)
    if path is None:
        available = ", ".join(f"ADR-{n:03d}" for n in files)
        return f"ADR-{number:03d} não existe. Disponíveis: {available}."
    text = path.read_text(encoding="utf-8")
    if len(text) > MAX_ADR_CHARS:
        text = text[:MAX_ADR_CHARS] + "\n[...conteúdo truncado]"
    return text
