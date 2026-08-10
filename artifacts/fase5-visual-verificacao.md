# Fase 5 — Verificação visual (vitrine + dashboard tokens)

Data: 2026-08-09

## Capturas antes / depois

| Estado | Pasta |
|--------|--------|
| **Antes** | `docs/auditoria-visual-v2/screenshots/avant-editorial-v2-antes-fase5/` |
| **Depois** | `docs/auditoria-visual-v2/screenshots/avant-editorial-v2/` |

Specs (chromium, workers=1):

- `e2e/audit-visual-editorial-v2.spec.ts` — desktop + mobile
- `e2e/capture-t3-vitrine.spec.ts`
- `e2e/vitrine-premium.spec.ts` — V1–V3 PASS

## Herança `card-elevated` (landing + player)

### Landing (`/`)
- Tema editorial via `LandingHomeClient` → `useEditorialTheme()`.
- `.card-elevated` usa `var(--color-card-border)` = `#E5C9B0` (repouso neutro) e fundo branco (`--color-surface-2`).
- Pricing/comparativo sobrescrevem borda (`border-slate-200` ou acento Pro) — CTA não compete com borda laranja global.
- Evidência: `T1-landing-desktop.png` / `T1-landing-mobile.png`.

### Player
- Superfície live: **não** usa `card-elevated` (`questaoPlayerShellClass` → `border-0 shadow-none`).
- Card/skeleton: `card-elevated-lg` + `border-slate-200`.
- Evidência: `T5-player-desktop.png` / `T5-player-mobile.png`.

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run check:architecture` | PASS (rgba-space + hex marca) |
| `npm run check:ship` | PASS — 361 suites / 3290 tests |
| `npm run build` | PASS — log em `artifacts/fase5-build.log` |

## Fixes de desbloqueio (app quebrado / testes desalinhados)

1. `AVANT_LOGO_PNG` + `scaleOfWordmark` em `lib/brand/avantLogoConstants.ts`
2. Testes de marca alinhados aos PNGs/SVGs atuais
3. Pill PRO sem “Acesso completo” (`PlanStatusCard`)

**Ops:** não rodar `check:ship` com `E2E_DASHBOARD_BYPASS=true` no shell — a rota `/api/vitrine` entra no bypass e quebra os testes de API.