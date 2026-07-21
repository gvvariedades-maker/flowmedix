#!/usr/bin/env python3
import fitz
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
doc = fitz.open(ROOT / "data/sources/lingua-portuguesa/portugues-caderno-2025-2026.pdf")
page = doc[71]
for tid in ["3352957", "3353960"]:
    print("tec", tid, page.search_for(tid))
for img in page.get_images(full=True):
    xref = img[0]
    info = doc.extract_image(xref)
    print("img", info["width"], info["height"], page.get_image_rects(xref))
doc.close()
