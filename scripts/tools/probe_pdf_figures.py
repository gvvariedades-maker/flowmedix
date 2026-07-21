#!/usr/bin/env python3
import fitz
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
pdfs = sorted((ROOT / "data/sources/lingua-portuguesa").glob("portugues-caderno*.pdf"))
tec_ids = [
    "3793476",
    "3835993",
    "3819856",
    "3739268",
    "3839425",
    "3665303",
    "3352957",
    "3353960",
]

for pdf_path in pdfs:
    doc = fitz.open(pdf_path)
    for i, page in enumerate(doc):
        text = page.get_text()
        for tid in tec_ids:
            if tid in text:
                imgs = page.get_images(full=True)
                print(f"{pdf_path.name} p{i+1} tec={tid} images={len(imgs)}")
                for j, img in enumerate(imgs[:5]):
                    xref = img[0]
                    info = doc.extract_image(xref)
                    print(
                        f"  img{j}: {info.get('width')}x{info.get('height')} ext={info.get('ext')}"
                    )
    doc.close()
