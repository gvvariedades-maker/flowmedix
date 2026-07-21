#!/usr/bin/env python3
"""Extrai figuras raster do caderno PT por tec_id (PyMuPDF)."""
from __future__ import annotations

import argparse
import json
import re
from io import BytesIO
from pathlib import Path

import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "data/sources/lingua-portuguesa"
OUT_DIR = ROOT / "artifacts/questao-figures/classes-de-palavras"
MANIFEST = OUT_DIR / "extracted-manifest.json"
# typographic_only: sem raster no PDF — manter figure_policy transcribed
DEFAULT_TEC_IDS = [
    "3739268",  # Snoopy tirinha
    "3665303",  # cartaz
    "3793476",  # charge Enem
    "3835993",  # charge CAZO
    "3352957",  # tirinha VF (1ª na página)
]

OPTIONAL_TEC_IDS = [
    "3839425",  # figura tipográfica — sem raster dedicado no PDF
    "3819856",  # cartum sem imagem embutida na página
    "3353960",  # 2ª VF na página — só texto; imagem é da questão anterior
]

LOGO_MAX = 150  # px — ignora ícone TecConcursos


def find_page_for_tec(doc: fitz.Document, tec_id: str) -> int | None:
    needle = tec_id
    for i in range(len(doc)):
        if needle in doc[i].get_text():
            return i
    return None


def tec_is_page_footer(page: fitz.Page, tec_id: str) -> bool:
    """tec_id no rodapé TecConcursos — figura costuma estar na página seguinte."""
    hits = page.search_for(tec_id)
    if not hits:
        return False
    y = hits[0].y0
    return y > page.rect.height * 0.82


def pages_to_try(doc: fitz.Document, tec_id: str) -> list[int]:
    page_no = find_page_for_tec(doc, tec_id)
    if page_no is None:
        return []
    pages = [page_no]
    page = doc[page_no]
    if tec_is_page_footer(page, tec_id) and page_no + 1 < len(doc):
        pages.append(page_no + 1)
    return pages


def tec_y_on_page(page: fitz.Page, tec_id: str) -> float:
    hits = page.search_for(tec_id)
    if not hits:
        return page.rect.height / 2
    return hits[0].y0


def all_tec_ys(page: fitz.Page) -> list[float]:
    ys: list[float] = []
    for m in re.finditer(r"questoes/(\d{5,})", page.get_text()):
        hits = page.search_for(m.group(1))
        if hits:
            ys.append(hits[0].y0)
    return sorted(ys)


def pick_image_for_tec(
    page: fitz.Page,
    doc: fitz.Document,
    tec_id: str,
    *,
    tec_on_page: bool = True,
) -> tuple[int, fitz.Rect] | None:
    if tec_on_page:
        tec_y = tec_y_on_page(page, tec_id)
        all_ys = all_tec_ys(page)
        idx = next((i for i, y in enumerate(all_ys) if abs(y - tec_y) < 2), None)
        y_top = 40.0
        y_bottom = page.rect.height - 20
        if idx is not None:
            if idx > 0:
                y_top = all_ys[idx - 1] + 30
            if idx + 1 < len(all_ys):
                y_bottom = all_ys[idx + 1] - 30
    else:
        y_top = 40.0
        y_bottom = page.rect.height * 0.75

    candidates: list[tuple[float, int, fitz.Rect, int, int]] = []
    for img in page.get_images(full=True):
        xref = img[0]
        try:
            info = doc.extract_image(xref)
        except Exception:
            continue
        w, h = info.get("width", 0), info.get("height", 0)
        if w < LOGO_MAX and h < LOGO_MAX:
            continue
        for rect in page.get_image_rects(xref):
            cy = (rect.y0 + rect.y1) / 2
            if cy < y_top or cy > y_bottom:
                continue
            area = w * h
            candidates.append((area, xref, rect, w, h))

    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0], reverse=True)
    _, xref, rect, _, _ = candidates[0]
    return xref, rect


def to_webp_bytes(png_bytes: bytes, max_bytes: int = 512 * 1024) -> bytes:
    img = Image.open(BytesIO(png_bytes)).convert("RGB")
    for quality in (85, 75, 65, 55, 45):
        buf = BytesIO()
        img.save(buf, format="WEBP", quality=quality, method=6)
        if buf.tell() <= max_bytes:
            return buf.getvalue()
    return buf.getvalue()


def extract_one(doc: fitz.Document, tec_id: str, out_dir: Path) -> dict | None:
    candidate_pages = pages_to_try(doc, tec_id)
    if not candidate_pages:
        return {"tec_id": tec_id, "status": "not_found"}

    for page_no in candidate_pages:
        page = doc[page_no]
        tec_on_page = tec_id in page.get_text()
        picked = pick_image_for_tec(page, doc, tec_id, tec_on_page=tec_on_page)
        if not picked:
            continue

        xref, rect = picked
        info = doc.extract_image(xref)
        ext = info.get("ext", "png")
        raw = info["image"]
        webp = to_webp_bytes(raw)

        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / f"{tec_id}.webp"
        out_path.write_bytes(webp)

        return {
            "tec_id": tec_id,
            "status": "ok",
            "page": page_no + 1,
            "file": str(out_path.relative_to(ROOT)).replace("\\", "/"),
            "bytes": len(webp),
            "bbox": [rect.x0, rect.y0, rect.x1, rect.y1],
            "source_ext": ext,
        }

    return {
        "tec_id": tec_id,
        "status": "no_image",
        "page": candidate_pages[-1] + 1,
        "tried_pages": [p + 1 for p in candidate_pages],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tec-id", action="append", dest="tec_ids")
    parser.add_argument("--pdf", default=str(SOURCE_DIR / "portugues-caderno-2025-2026.pdf"))
    parser.add_argument(
        "--out-dir",
        default=str(OUT_DIR),
        help="Diretório de saída WebP (default: artifacts/questao-figures/classes-de-palavras)",
    )
    args = parser.parse_args()
    tec_ids = args.tec_ids or DEFAULT_TEC_IDS
    out_dir = Path(args.out_dir)
    if not out_dir.is_absolute():
        out_dir = ROOT / out_dir

    doc = fitz.open(args.pdf)
    results = [extract_one(doc, tid, out_dir) for tid in tec_ids]
    doc.close()

    manifest = out_dir / "extracted-manifest.json"
    manifest.parent.mkdir(parents=True, exist_ok=True)
    manifest.write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    ok = sum(1 for r in results if r and r.get("status") == "ok")
    print(f"extracted {ok}/{len(tec_ids)} -> {out_dir}")
    for r in results:
        print(r)


if __name__ == "__main__":
    main()
