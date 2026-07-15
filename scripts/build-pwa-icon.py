#!/usr/bin/env python3
"""Gera ícones PWA/Apple full-bleed (RGB opaco) a partir do shield v4."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "brand"
SHIELD_PATH = BRAND / "avant-logo-shield.png"

# iconCardGreen — alinhado a lib/brand/avantLogoConstants.ts e apple-icon
BG_RGB = (12, 201, 58)


def crop_alpha_bbox(im: Image.Image) -> Image.Image:
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    bbox = im.split()[-1].getbbox()
    if not bbox:
        return im
    return im.crop(bbox)


def defringe_rgba(im: Image.Image, bg: tuple[int, int, int] = BG_RGB) -> Image.Image:
    """Remove halo claro/semi-transparente na borda do squircle."""
    out = im.convert("RGBA")
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # Semi-transparente → fundo sólido
            if a < 250:
                px[x, y] = (*bg, 255)
                continue
            # Pixels claros na borda (resíduo checkerboard / anti-alias claro)
            chroma = max(r, g, b) - min(r, g, b)
            if chroma < 28 and r > 150 and g > 150:
                px[x, y] = (*bg, 255)
    return out


def compose_icon(
    shield: Image.Image,
    canvas_size: int,
    content_size: int,
    bg: tuple[int, int, int] = BG_RGB,
) -> Image.Image:
    base = Image.new("RGBA", (canvas_size, canvas_size), (*bg, 255))
    scale = content_size / max(shield.size)
    new_w = max(1, int(shield.width * scale))
    new_h = max(1, int(shield.height * scale))
    resized = shield.resize((new_w, new_h), Image.Resampling.LANCZOS)
    resized = defringe_rgba(resized, bg)
    x = (canvas_size - new_w) // 2
    y = (canvas_size - new_h) // 2
    base.paste(resized, (x, y), resized)
    return base.convert("RGB")


def main() -> None:
    shield = crop_alpha_bbox(Image.open(SHIELD_PATH))

    # purpose=any — quase edge-to-edge (sem margem transparente)
    pwa_any = compose_icon(shield, 512, 472)
    pwa_any.save(BRAND / "avant-pwa-icon.png", optimize=True)

    # purpose=maskable — safe zone 80% (410px em canvas 512)
    pwa_maskable = compose_icon(shield, 512, 410)
    pwa_maskable.save(BRAND / "avant-pwa-icon-maskable.png", optimize=True)

    # apple-touch / favicon source
    apple = compose_icon(shield, 180, 166)
    apple_rgba = apple.convert("RGBA")  # iOS aceita RGBA opaco
    apple_rgba.save(ROOT / "app" / "apple-icon.png", optimize=True)

    icon32 = compose_icon(shield, 32, 30)
    icon32.save(ROOT / "app" / "icon.png", optimize=True)

    # sanity: cantos devem ser verde sólido
    for name, img in [
        ("pwa-any", pwa_any),
        ("pwa-maskable", pwa_maskable),
        ("apple", apple),
    ]:
        corners = [img.getpixel((0, 0)), img.getpixel((img.width - 1, img.height - 1))]
        assert all(c == BG_RGB for c in corners), f"{name} corner not solid green: {corners}"
        print(f"OK {name} {img.size} mode={img.mode} corners={corners[0]}")


if __name__ == "__main__":
    main()
