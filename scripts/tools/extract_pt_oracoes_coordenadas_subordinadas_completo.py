#!/usr/bin/env python3
"""Extrai todas as questões de Orações coordenadas e subordinadas do caderno PT interno."""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

import pypdf

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "data/sources/lingua-portuguesa"
CLUSTER = ROOT / "artifacts/lingua-portuguesa-topic-cluster-report.json"
OUT = ROOT / "data/catalog-migration/oracoes-coordenadas-e-subordinadas-completo/extracted-source.json"

HEADER_RE = re.compile(r"L.ngua Portuguesa \(Portugu.s\) - (.+?)\n", re.MULTILINE)
URL_RE = re.compile(r"www\.tecconcursos\.com\.br/questoes/(\d+)")
GAB_RE = re.compile(r"Gabarito:\s*([A-E])", re.I)

ORACOES_ASSUNTOS = (
    "Orações Coordenadas",
    "Orações Subordinadas Adjetivas",
    "Orações Subordinadas Adverbiais",
    "Orações Subordinadas Substantivas",
    "Orações Reduzidas",
)


def fix_encoding(text: str) -> str:
    for enc in ("latin-1", "cp1252"):
        try:
            return text.encode(enc).decode("utf-8")
        except (UnicodeDecodeError, UnicodeEncodeError):
            continue
    return text


def slugify(text: str, max_len: int = 40) -> str:
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:max_len].rstrip("-") or "questao"


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


def parse_banca_orgao(banca_line: str) -> tuple[str, str, str]:
    banca = "CADERNO"
    orgao = ""
    ano = "2026"
    year_m = re.search(r"/(\d{4})", banca_line)
    if year_m:
        ano = year_m.group(1)
    parts = banca_line.split("–")
    if parts:
        banca = parts[0].strip().split("/")[0].strip() or banca
    paren = re.search(r"\(([^)]+)\)", banca_line)
    if paren:
        orgao = paren.group(1).strip()
    return banca, orgao, ano


def suggest_slug(banca: str, instruction: str, tec_id: str) -> str:
    banca_slug = slugify(banca, 12)
    hint = slugify(instruction[:60], 36)
    return f"{banca_slug}-oracoes-{hint}-{tec_id}"[:90].rstrip("-")


def load_target_tec() -> list[str]:
    data = json.loads(CLUSTER.read_text(encoding="utf-8"))
    return [
        q["tec_id"]
        for q in data["questions_index"]
        if any(a in q.get("source_assunto_tec", "") for a in ORACOES_ASSUNTOS)
    ]


def main() -> None:
    target = set(load_target_tec())
    out: list[dict] = []
    for pdf in sorted(SOURCE_DIR.glob("*.pdf")):
        reader = pypdf.PdfReader(str(pdf))
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
        parts = re.split(r"(?=www\.tecconcursos\.com\.br/questoes/\d+)", text)
        for part in parts:
            url_match = URL_RE.search(part)
            if not url_match or url_match.group(1) not in target:
                continue
            tec_id = url_match.group(1)
            header_match = HEADER_RE.search(part)
            gab_match = GAB_RE.search(part)
            start = header_match.end() if header_match else 0
            end = gab_match.start() if gab_match else len(part)
            chunk = clean_chunk(part[start:end])
            instruction = chunk
            lower = chunk.lower()
            if " a) " in lower:
                instruction = chunk[: lower.index(" a) ")].strip()
            opts = parse_options(chunk)
            banca_line = parse_banca_line(part)
            banca, orgao, ano = parse_banca_orgao(banca_line)
            slug = suggest_slug(banca, instruction, tec_id)
            out.append(
                {
                    "tec_id": tec_id,
                    "slug": slug,
                    "source_file": pdf.name,
                    "source_assunto_tec": fix_encoding(header_match.group(1).strip())
                    if header_match
                    else "Orações",
                    "banca_line": banca_line,
                    "banca": banca,
                    "orgao": orgao,
                    "ano": ano,
                    "gabarito": gab_match.group(1).upper() if gab_match else None,
                    "instruction": instruction[:2500],
                    "options": opts,
                }
            )

    order = load_target_tec()
    out.sort(key=lambda x: order.index(x["tec_id"]))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(out)}/{len(order)} questions -> {OUT}")
    if len(out) != len(order):
        found = {x["tec_id"] for x in out}
        missing = [t for t in order if t not in found]
        print("Missing tec_ids:", missing)


if __name__ == "__main__":
    main()
