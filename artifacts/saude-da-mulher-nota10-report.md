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
| Unit smoke | pass | `__tests__/components/slides/mulherG2Primitives.test.tsx` 3/3 | ✅ |
| Playwright L3 | PASS ou captures | **BLOCKED** — `/dev/slide-mold-review` timeout (cpus:1) | ⚠️ |
| L6 + captures | visual_gallery | `pending` até PNG | ⚠️ |
| Barra conteúdo | verde | production_ready | ✅ |
| **visual_bar** | pass + ratchet | **pass** — ad-hoc → primitives (massa + footer transferência) | ✅ |

---

## Fábrica G2 (2026-08-04) — o que subiu

| Antes | Depois (ratchet) |
|-------|------------------|
| Wash/footer/cards ad-hoc em 18 variants | `BoardChrome` + `ProtocolRailRow` / `LabelBodyRow` / `PolarityPanel` / `CategoryStrip` / `CriticalNumber` |
| Danger tap sem guard consistente | Reveal só se `!isRevealed` (padrão Crase) |
| Tier C no inventário | Tier A (import direto de `primitives/`) |

### Por ramo

| branch | concept | golden | danger |
|--------|---------|--------|--------|
| prenatal | ProtocolRailRow timeline | LabelBodyRow + TrimesterRail | PolarityPanel + TrimesterRail |
| parto | ProtocolRailRow + phase chips | LabelBodyRow + PhaseRail | PolarityPanel + SUPINA×VERTICAL |
| papanicolau | LabelBodyRow + AgeRuler | LabelBodyRow + AgeRulerBar | PolarityPanel + AgeTrapRuler |
| mama | LabelBodyRow + AgeRuler | LabelBodyRow + AgeRulerBar | PolarityPanel + AgeTrapRuler |
| puerperio | ProtocolRailRow timeline | LabelBodyRow + PuerperioTimelineRail | PolarityPanel + DayTrapRuler |
| planejamento | LabelBodyRow + zones | LabelBodyRow + MethodZoneRail | PolarityPanel + MethodZoneRail |

**Sem** React novo / **sem** mudança de `layout_variant` IDs.

---

## Blockers

| ID | Descrição | Próximo passo |
|----|-----------|---------------|
| B1 | Playwright L3 timeout em `page.goto(/dev/slide-mold-review?branch=mulher_prenatal)` (dev `cpus:1`) | Com server já warm: `PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/visual-mold-regression.spec.ts --grep "Saúde da Mulher" --project=chromium` → PNGs + `visual_gallery=ready` |

---

## Fechamento

```text
| applied | bespoke 4/4 | primitives G2 | shells | unit | Playwright | visual_bar | production_ready | blockers |
| 246/246 | 6/6 | 18/18 | 6/6 Focus | 3/3 PASS | blocked B1 | pass | production_ready | B1 e2e captures |
```

**Ship nota-10 visual (composição):** ✅ G2 primitives + shells + unit.  
**Ship evidência PNG:** pendente B1 (ambiente local).
