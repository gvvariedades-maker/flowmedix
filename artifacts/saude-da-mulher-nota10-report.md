# Relatório nota-10 — saude-da-mulher

| Campo | Valor |
|-------|--------|
| Subtópico | Saúde da Mulher |
| pacote_prefix | saude-da-mulher |
| total_slugs | 246 |
| Programa | Fábrica visual G2 |
| Atualizado em | 2026-08-04 |

---

## Scorecard

| Critério | Meta | Atual | OK |
|----------|------|-------|----|
| applied / total | 100% | 246/246 | ✅ |
| status registry | applied | applied | ✅ |
| production_status | production_ready | production_ready | ✅ |
| Bespoke 4/4 ramos fortes | 6 ramos | 6 moldes 4/4 wired | ✅ |
| ok_generico | documentado | `mulher_generico` SoftLens/compare | ✅ |
| Âncoras | READY | prenatal VF `[READY]` strict-v2 | ✅ |
| **Primitives G2** | 18 boards/arenas | **18/18** BoardChrome + kit | ✅ |
| logic_tap shells | 6/6 | FocusShell + LetterEliminationRail (P1 lote 2) | ✅ |
| Unit smoke | pass | `mulherG2Primitives.test.tsx` 3/3 | ✅ |
| Playwright L3 | PASS | **10/10** chromium (4 ramos × desktop/mobile + DoD prenatal + summary) | ✅ |
| L6 + captures | visual_gallery | **ready** nos 4 ramos e2e (PNGs em `artifacts/visual-mold-regression/`) | ✅ |
| Barra conteúdo | verde | production_ready | ✅ |
| **visual_bar** | pass + ratchet | **pass** — ad-hoc → primitives; e2e verde | ✅ |

---

## Fábrica G2 (2026-08-04)

| Antes | Depois (ratchet) |
|-------|------------------|
| Wash/footer/cards ad-hoc em 18 variants | `BoardChrome` + `ProtocolRailRow` / `LabelBodyRow` / `PolarityPanel` / `CategoryStrip` / `CriticalNumber` |
| Danger tap sem guard consistente | Reveal só se `!isRevealed` |
| Tier C no inventário | Tier A |
| Playwright blocked (`cpus:1` no dev) | `cpus:1` só em `VERCEL`/`CI`; e2e 10/10 |

### Dev fix

`next.config.js`: `experimental.cpus: 1` apenas quando `VERCEL` ou `CI` — desbloqueia compile local de `/dev/slide-mold-review`.

---

## Fechamento

```text
| applied | bespoke 4/4 | primitives G2 | shells | unit | Playwright | visual_bar | production_ready | blockers |
| 246/246 | 6/6 | 18/18 | 6/6 Focus | 3/3 PASS | 10/10 PASS | pass | production_ready | nenhum |
```

**Ship nota-10 visual:** ✅ composição G2 + evidência Playwright.
