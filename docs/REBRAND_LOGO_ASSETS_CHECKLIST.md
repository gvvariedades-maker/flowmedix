# Checklist — recolor logo / favicon (rebrand print `#F26522`)

Trabalho de **design/assets** da Onda 4 do rebrand editorial. Constantes UI
(`lib/brand/avantLogoConstants.ts`) e anéis/glows já apontam para
`EDITORIAL_BRAND` (`#F26522`). Este checklist fecha a paridade dos **PNG/SVG/PWA**.

**Não alterar:** metal cobre `brandBlue*` do monograma/wordmark legado; cyan Cyber
`#00f2ff`; `--color-success` / warning.

**UI in-app (2026-08):** resolvido via SVG — `AvantLogoIcon` (squircle `#F26522` +
`AVANT_AE_MONOGRAM_PATHS`), e-mail selo print, wrappers `public/brand/*.svg` sem
`avant-logo-shield.png`. App logado **não depende** mais do PNG verde.

---

## Hex alvo

| Papel | Hex |
| ----- | --- |
| Squircle / card de marca / fundo app icon | `#F26522` |
| Hover / pressão (se houver variante) | `#E05518` |
| Metal wordmark / monograma foil legado | manter cobre (`#e08f2f` e gradiente foil) |
| Monograma SVG in-app | `#ffffff` sobre squircle print |
| Sufixo "enf" | **`#F26522`** (tipográfico no app + e-mail) |
| Wordmark "AVANT" (editorial) | **`#0f172a`** (preto slate — tipográfico, não raster cobre) |
| Wordmark "AVANT" (cyber / e-mail shell escuro) | **`#f8fafc`** |

---

## PNG / raster (`public/brand/`) — residual (gerar a partir do SVG)

UI React já usa SVG. Itens abaixo são **export raster** (OG / PWA / favicon):

- [ ] `avant-logo-shield.png` — regenerar do SVG (squircle `#F26522` + AE) se ainda
      referenciado fora do app; app não usa mais
- [ ] `avant-logo-ae-flat.png` — idem (legado nav; app usa SVG)
- [ ] `avant-logo-ae-monogram.png` — se ainda usado em exports
- [ ] `avant-logo-cover.png` — OG/social (layout.tsx)
- [ ] `avant-logo-wordmark-raster.png` — legado cobre+verde; app usa tipográfico
      (SVGs wordmark ainda embutem até reexport tipográfico)
- [ ] `avant-pwa-icon.png` (512) — gerar a partir de `avant-app-icon.svg`
- [ ] `avant-pwa-icon-maskable.png` (512) — safe zone + fundo print (mesmo SVG)

## Favicon / App Router icons

- [ ] `app/icon.png` — regenerar do SVG se ainda verde
- [ ] `app/apple-icon.png` — idem

## SVG wrappers

- [x] `avant-app-icon.svg` — rect `#F26522` + monograma AE inline (sem PNG)
- [x] `avant-logo-symbol.svg` — squircle print + AE paths
- [x] `avant-logo-horizontal.svg` / `-light.svg` — ícone SVG; wordmark raster residual
- [ ] `avant-logo-wordmark.svg` / `-light.svg` — ainda embutem raster (fora do ícone)

## Smoke pós-asset

- [x] Nav editorial: `AvantLogo` tone `brand` / `light` — squircle SVG laranja, sem lima
- [x] Lockup cyber: shell/pulse laranja (`avant-logo-pulse` + `AVANT_LOGO_SHELL_SHADOW`)
- [x] E-mail: `emails/AvantLogoEmail.tsx` — selo `iconCardBrand` (`#F26522`), AE branco
- [ ] PWA / “Add to Home Screen”: regenerar maskable PNG depois; UI in-app já SVG
- [ ] Aba do browser: favicon — regenerar PNG residual se ainda verde

## Verificação estilo print forte (Fase 5)

Gate de entrega das 4 fases (ícone SVG · superfície creme · tipografia cartaz · CTAs
`rounded-2xl`). Hard refresh / PWA residual continua na seção PNG acima.

| Check | Resultado |
| ----- | --------- |
| Drawer + header — zero verde no lockup (ícone + enf + Pro) | OK — `AvantLogo` / constantes sem lima; Pro strip brand |
| Fundo editorial creme vs slate antigo | OK — `--color-surface-0: #FFF7F0`, `--color-surface-1: #FFE8D6`; cards `#ffffff` |
| CTAs ≥44px (mobile 375 / desktop) | OK — `min-h-[44px]` em vitrine CTAs + `.btn-editorial-primary` `py-3.5` |
| Jest brand + sidebar | OK — `AvantBrandMark` + `sidebarRebrandP1` (13/13) |
| PWA / favicon ainda verde? | Residual — regenerar PNG maskable/favicon a partir do SVG; UI in-app já SVG |

### Smoke mental AA (WCAG 2.1 texto normal ≥4.5:1)

| Par | Ratio | Nota |
| --- | ----- | ---- |
| `text-slate-600` / `--color-text-secondary` `#475569` em `#FFF7F0` | ~7.15:1 | **AA PASS** (login, drawer, vitrine) |
| `#475569` em surface-1 `#FFE8D6` / wash `#FFF1E0` | ~6.4–6.8:1 | AA PASS |
| CTA label `#0F172A` em brand `#F26522` | ~5.66:1 | AA PASS |
| `--color-brand-text` `#9A3412` em creme | ~6.89:1 | AA PASS (nav ativa / enf semântico) |
| `#F26522` como texto corrido no creme | ~3:1 | só large text / ícone — não usar como corpo |
| `--color-text-tertiary` `#94a3b8` em creme | ~2.4:1 | só hint/disabled — não corpo |

Comando de regressão:

```bash
npm test -- --testPathPattern="AvantBrandMark|sidebarRebrandP1" --no-coverage
```

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
| `lib/brand/avantLogoConstants.ts` | rings / glows / `iconCardBrand` / `AVANT_AE_MONOGRAM_PATHS` |
| `app/globals.css` | `@keyframes avantLogoPulse` |
| `components/brand/AvantLogo.tsx` | `AvantLogoIcon` SVG |
| `emails/AvantLogoEmail.tsx` | selo print |
