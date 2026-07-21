#!/usr/bin/env python3
"""Extrai 8 questões Colocação Pronominal (lote g14) do caderno PT interno."""
from __future__ import annotations

import json
import re
from pathlib import Path

import pypdf

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "data/sources/lingua-portuguesa"
OUT = ROOT / "data/catalog-migration/lingua-portuguesa-g14/extracted-source.json"

TARGET_TEC = [
    "3727518",
    "3746604",
    "3352589",
    "3352965",
    "3353968",
    "3374794",
    "3375896",
    "3376869",
]

HEADER_RE = re.compile(r"L.ngua Portuguesa \(Portugu.s\) - (.+?)\n", re.MULTILINE)
URL_RE = re.compile(r"www\.tecconcursos\.com\.br/questoes/(\d+)")
GAB_RE = re.compile(r"Gabarito:\s*([A-E])", re.I)


def fix_encoding(text: str) -> str:
    for enc in ("latin-1", "cp1252"):
        try:
            return text.encode(enc).decode("utf-8")
        except (UnicodeDecodeError, UnicodeEncodeError):
            continue
    return text


def clean_chunk(text: str) -> str:
    text = fix_encoding(text)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(
        r"\d{2}/\d{2}/\d{4}.*?imprimir\s*\d+/\d+\s*(?:\d+\)\s*){0,3}",
        " ",
        text,
        flags=re.S,
    )
    text = re.sub(r"Tec Concursos[^\n]*", "", text, flags=re.I)
    return re.sub(r"\s+", " ", text).strip()


def parse_options(chunk: str) -> dict[str, str]:
    opts: dict[str, str] = {}
    for letter in "ABCDE":
        pat = rf"{letter.lower()}\)\s*(.+?)(?=\s*[a-e]\)|Gabarito:|$)"
        m = re.search(pat, chunk, re.I | re.S)
        if m:
            opts[letter] = clean_chunk(m.group(1))[:800]
    return opts


def parse_banca_line(part: str) -> str:
    m = re.search(r"([A-ZÁÉÍÓÚÃÕÂÊÎÔÛÇ][^\n]{8,120}/\d{4})", part)
    return fix_encoding(m.group(1)) if m else ""


def main() -> None:
    out: list[dict] = []
    raw_dir = OUT.parent
    raw_dir.mkdir(parents=True, exist_ok=True)

    for pdf in sorted(SOURCE_DIR.glob("*.pdf")):
        reader = pypdf.PdfReader(str(pdf))
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
        parts = re.split(r"(?=www\.tecconcursos\.com\.br/questoes/\d+)", text)
        for part in parts:
            url_match = URL_RE.search(part)
            if not url_match or url_match.group(1) not in TARGET_TEC:
                continue
            header_match = HEADER_RE.search(part)
            if not header_match or "Coloca" not in header_match.group(1):
                continue
            tec_id = url_match.group(1)
            gab_match = GAB_RE.search(part)
            start = header_match.end()
            end = gab_match.start() if gab_match else len(part)
            chunk = clean_chunk(part[start:end])
            instruction = chunk
            lower = chunk.lower()
            if " a) " in lower:
                instruction = chunk[: lower.index(" a) ")].strip()
            out.append(
                {
                    "tec_id": tec_id,
                    "source_file": pdf.name,
                    "source_assunto_tec": fix_encoding(header_match.group(1).strip()),
                    "banca_line": parse_banca_line(part),
                    "gabarito": gab_match.group(1).upper() if gab_match else None,
                    "instruction": instruction[:2500],
                    "options": parse_options(chunk),
                }
            )
            (raw_dir / f"raw-{tec_id}.txt").write_text(part, encoding="utf-8", errors="replace")

    out.sort(key=lambda x: TARGET_TEC.index(x["tec_id"]))
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(out)} questions -> {OUT}")


if __name__ == "__main__":
    main()
