# Checklist — recolor logo / favicon (rebrand print `#F26522`)

Trabalho de **design/assets** da Onda 4 do rebrand editorial. Constantes UI
(`lib/brand/avantLogoConstants.ts`) e anéis/glows já apontam para
`EDITORIAL_BRAND` (`#F26522`). Este checklist fecha a paridade dos **PNG/SVG/PWA**.

**Não alterar:** metal cobre `brandBlue*` do monograma/wordmark; cyan Cyber
`#00f2ff`; `--color-success` / warning.

---

## Hex alvo

| Papel | Hex |
| ----- | --- |
| Squircle / card de marca / fundo app icon | `#F26522` |
| Hover / pressão (se houver variante) | `#E05518` |
| Metal wordmark / monograma "A" | manter cobre (`#e08f2f` e gradiente foil) |
| Sufixo "enf" (até decisão) | manter verde glass **ou** alinhar ao print na mesma entrega de PNG |

---

## PNG / raster (`public/brand/`)

- [ ] `avant-logo-shield.png` — squircle `#F26522` (monograma cobre intacto)
- [ ] `avant-logo-ae-flat.png` — mesma família (nav / tamanho pequeno)
- [ ] `avant-logo-ae-monogram.png` — se ainda usado em exports
- [ ] `avant-logo-cover.png` — OG/social (layout.tsx)
- [ ] `avant-logo-wordmark-raster.png` — opcional: só se "enf" mudar de verde → print
- [ ] `avant-pwa-icon.png` (512) — fundo/card print
- [ ] `avant-pwa-icon-maskable.png` (512) — safe zone + fundo print

## Favicon / App Router icons

- [ ] `app/icon.png` — herda marca; recolor se squircle verde
- [ ] `app/apple-icon.png` — idem

## SVG wrappers (código já parcialmente alinhado)

- [x] `avant-app-icon.svg` — `fill` do rect → `#F26522` (Onda 4 código)
- [ ] Conferir wrappers que embutem PNG após recolor:
  - `avant-logo-symbol.svg`
  - `avant-logo-horizontal.svg` / `-light.svg`
  - `avant-logo-wordmark.svg` / `-light.svg`

## Smoke pós-asset

- [ ] Nav editorial: `AvantLogo` tone `brand` / `light` — squircle laranja, sem lima
- [ ] Lockup cyber: shell/pulse laranja (`avant-logo-pulse` + `AVANT_LOGO_SHELL_SHADOW`)
- [ ] E-mail: `emails/AvantLogoEmail.tsx` — shell border/sombra; selo forest só se ainda intencional
- [ ] PWA / “Add to Home Screen”: ícone maskable sem halo verde
- [ ] Aba do browser: favicon sem verde legado

## Gate grep (após assets)

```bash
rg -n "#8fe020|#0cc93a|#BEF264|#7acc10" public/brand app/icon.png app/apple-icon.png
```

(SVG/PNG binários: inspecionar visualmente se o grep não listar o hex.)

---

## Referência de código

| Arquivo | Papel |
| ------- | ----- |
| `lib/brand/avantBrandPalette.ts` | `EDITORIAL_BRAND` canônico |
| `lib/brand/avantLogoConstants.ts` | rings / glows / `iconCardBrand` / shell |
| `app/globals.css` | `@keyframes avantLogoPulse` |
| `components/brand/AvantLogo.tsx` | smoke UI |
| `emails/AvantLogoEmail.tsx` | smoke e-mail |
