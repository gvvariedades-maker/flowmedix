#!/usr/bin/env python3
"""Download degravações from essencial-catalog.json and emit structural outlines."""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import requests
from pypdf import PdfReader

BASE = Path(__file__).resolve().parents[2]
CATALOG = BASE / "data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/essencial-catalog.json"
DEG_BASE = BASE / "data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/degravacoes"
OUTLINE_BASE = BASE / "data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/outlines"

HEADING_RE = re.compile(
    r"^(?:\d+[\).]\s*)?(?:[A-ZÁÉÍÓÚÃÕÂÊÔÇ][A-ZÁÉÍÓÚÃÕÂÊÔÇ0-9\s\-–—:]{3,}|[0-9]+m\s)",
)


def slugify(title: str) -> str:
    s = title.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:80]


def load_cookies(path: Path | None) -> dict[str, str]:
    if path and path.exists():
        data = json.loads(path.read_text(encoding="utf-8"))
        return {c["name"]: c["value"] for c in data}
    raw = os.environ.get("GRAN_COOKIE", "")
    if not raw:
        raise FileNotFoundError("Set GRAN_COOKIE env or pass cookies JSON path")
    out: dict[str, str] = {}
    for part in raw.split(";"):
        part = part.strip()
        if "=" in part:
            k, v = part.split("=", 1)
            out[k.strip()] = v.strip()
    return out


def download_pdf(session: requests.Session, path: str) -> bytes:
    url = f"https://www.grancursosonline.com.br{path}"
    r = session.get(url, allow_redirects=True, timeout=90)
    r.raise_for_status()
    return r.content


def extract_lines(pdf_bytes: bytes) -> list[str]:
    reader = PdfReader(__import__("io").BytesIO(pdf_bytes))
    text = "\n".join((page.extract_text() or "") for page in reader.pages)
    return [ln.strip() for ln in text.splitlines() if ln.strip()]


def structural_outline(lines: list[str], title: str) -> dict:
    headings: list[str] = []
    obs: list[str] = []
    examples: list[str] = []
    keywords: set[str] = set()

    for ln in lines:
        upper_ratio = sum(1 for c in ln if c.isupper()) / max(len(ln), 1)
        if HEADING_RE.match(ln) or (upper_ratio > 0.6 and len(ln) < 80):
            headings.append(ln[:120])
        if ln.lower().startswith("obs"):
            obs.append(ln[:200])
        if re.match(r"^\d+[\).\-]\s", ln) and len(ln) < 150:
            examples.append(ln[:150])
        for kw in (
            "elíptico", "indeterminado", "expresso", "crase", "próclise", "ênclise",
            "sujeito", "verbo", "Quem?", "regência", "concordância", "pontuação",
            "conectivo", "oração", "morfologia", "transitiv",
        ):
            if kw.lower() in ln.lower():
                keywords.add(kw)

    def dedupe(seq: list[str]) -> list[str]:
        seen: set[str] = set()
        out: list[str] = []
        for x in seq:
            k = x.lower()
            if k in seen:
                continue
            seen.add(k)
            out.append(x)
        return out

    return {
        "title": title,
        "headings": dedupe(headings)[:40],
        "obs": dedupe(obs)[:15],
        "numbered_items": dedupe(examples)[:25],
        "keywords": sorted(keywords),
        "line_count": len(lines),
    }


def main() -> None:
    cookies_path = Path(sys.argv[1]) if len(sys.argv) > 1 else CATALOG.parent / "_gran-cookies.json"
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    lessons = [l for l in catalog["lessons"] if l.get("degravacao_path")]

    session = requests.Session()
    session.cookies.update(load_cookies(cookies_path if cookies_path.exists() else None))
    session.headers.update({"User-Agent": "AVANT-internal-outline/2.0"})

    manifest: list[dict] = []

    for lesson in lessons:
        mod = lesson["module"]
        slug = slugify(lesson["title"])
        mod_dir = DEG_BASE / mod
        out_dir = OUTLINE_BASE / mod
        mod_dir.mkdir(parents=True, exist_ok=True)
        out_dir.mkdir(parents=True, exist_ok=True)

        pdf_path = mod_dir / f"{slug}.pdf"
        outline_path = out_dir / f"{slug}.json"

        print(f"[{mod}] {lesson['title']}...")
        if not pdf_path.exists():
            pdf_bytes = download_pdf(session, lesson["degravacao_path"])
            pdf_path.write_bytes(pdf_bytes)
        else:
            pdf_bytes = pdf_path.read_bytes()

        lines = extract_lines(pdf_bytes)
        outline = structural_outline(lines, lesson["title"])
        outline["slug"] = slug
        outline["module"] = mod
        outline["topic"] = lesson.get("topic")
        outline["pdf_bytes"] = len(pdf_bytes)
        outline_path.write_text(json.dumps(outline, ensure_ascii=False, indent=2), encoding="utf-8")

        manifest.append({
            "module": mod,
            "slug": slug,
            "title": lesson["title"],
            "outline": str(outline_path.relative_to(BASE)).replace("\\", "/"),
        })

    (OUTLINE_BASE / "full-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Done — {len(manifest)} outlines.")


if __name__ == "__main__":
    main()
