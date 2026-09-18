#!/usr/bin/env python3
"""Copia ícones PWA/App Router a partir do Golden Master V2.1 (sem gerar geometria)."""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
V21 = ROOT / "public" / "brand" / "v2.1"

COPIES = {
    V21 / "favicon" / "favicon-32.png": ROOT / "app" / "icon.png",
    V21 / "app-icon" / "app-icon-180.png": ROOT / "app" / "apple-icon.png",
    V21 / "app-icon" / "app-icon-512.png": ROOT / "public" / "brand" / "avant-pwa-icon.png",
    V21 / "app-icon" / "app-icon-512.png": ROOT / "public" / "brand" / "avant-pwa-icon-maskable.png",
    V21 / "app-icon" / "app-icon-master.svg": ROOT / "public" / "brand" / "avant-app-icon.svg",
}


def main() -> None:
    for src, dst in COPIES.items():
        if not src.is_file():
            raise FileNotFoundError(f"Missing canonical asset: {src}")
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        print(f"copied {src.relative_to(ROOT)} -> {dst.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
