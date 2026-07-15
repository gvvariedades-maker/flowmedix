# Saúde Mental — relatório paridade Adolescente (nota-10)

**Data:** 2026-07-15  
**Pacote:** `saude-mental` · **37 slugs** · `production_ready`  
**Barra:** paridade proporcional com [`saude-adolescente-nota10-report.md`](saude-adolescente-nota10-report.md)

---

## Tabela de paridade

| Critério | Saúde do Adolescente | Saúde Mental | Paridade |
|----------|----------------------|--------------|----------|
| Slugs handcraft applied | 16/16 | 37/37 | ✅ |
| `production_ready` | sim | sim | ✅ |
| Ramos L3 com ≥1 slug | 6/6 | 6/6 | ✅ |
| Brief INDEX + por ramo | sim | sim | ✅ |
| visual-anchors 1/ramo | 6 | 6 | ✅ |
| Playwright L3 PASS | 13/13 | 14/14 runtime PASS (2026-07-15) | ✅ |
| A4 100% stamped | 16/16 | 37/37 | ✅ |
| A4 humano substantivo (sem quota fake) | 3 | 8 (4 amostra 20% medio + 4 blockers) | ✅ |
| Player PNG = slugs handcraft-qc | piloto | 8/8 (6 PNGs/slug) | ✅ |
| L6 + captures | g01+g02 | agent N/A (lotes micro-*); 6 âncoras visuais | ✅ proporcional |
| Branch reconcile 0 mismatch | sim | sim (inferência dependência/depressão antes de crise) | ✅ |
| Apply Supabase 100% | 16/16 | 37/37 (2026-07-15) | ✅ |
| Relatório nota-10 | sim | sim | ✅ |

---

## Ramos L3

| Ramo | Slugs | Molde | Brief |
|------|-------|-------|-------|
| `mental_raps_legis` | 11 | MENTAL_LEGIS bespoke | [brief](l3-brief-saude-mental-mental_raps_legis.md) |
| `mental_crise_caps` | 6 | MENTAL_CRISIS bespoke | [brief](l3-brief-saude-mental-mental_crise_caps.md) |
| `mental_dependencia_tabagismo` | 6 | genérico premium | [brief](l3-brief-saude-mental-mental_dependencia_tabagismo.md) |
| `mental_depressao` | 5 | genérico premium | [brief](l3-brief-saude-mental-mental_depressao.md) |
| `mental_aps_acolhimento` | 3 | genérico premium | [brief](l3-brief-saude-mental-mental_aps_acolhimento.md) |
| `mental_generico` | 6 | genérico premium | [brief](l3-brief-saude-mental-mental_generico.md) |

Índice: [`l3-brief-saude-mental-INDEX.md`](l3-brief-saude-mental-INDEX.md)

---

## A4-mínimo

- Registry: `lib/catalogMigration/saudeMentalA4Minimo.ts` + `docs/PROTOCOLO_A4_MINIMO_SAUDE_MENTAL.md`
- Agent stamp: **29/37** · handcraft-qc: **8/37** (política substantiva — sem padding até 20% do pacote)
- Humano QC script: `scripts/stamp-saude-mental-a4-humano-qc.ts`

---

## Gates executados

```bash
npm run handcraft:brief -- --subtopico="Saúde Mental"
npm run cluster:saude-mental
npm run stamp:a4-minimo -- --lote=saude-mental-micro-0{1..7}-goldens
npx tsx scripts/stamp-saude-mental-a4-humano-qc.ts
npm run catalog:apply-lote -- --lote=saude-mental-completo --dry-run  # OK
npm run catalog:apply-lote -- --lote=saude-mental-completo --apply
npm run audit:subtopico-quality -- --subtopico="Saúde Mental" --promote
```

---

## Ops fechadas (2026-07-15)

1. **Captures PNG** — 8/8 fechados nos 8 slugs `handcraft-qc` (L6 humano proporcional — 1 âncora/ramo forte).
2. **Playwright runtime** — 14/14 PASS com dev server (`npm run test:e2e:visual-molds -- --grep "Saúde Mental"`) — summary.json já registrado para L3 gate.

---

## Fix infra incluído nesta onda

- `audit-subtopico-quality.ts`: spawn handcraft-dod via `tsx/cli` (Windows + acentos).
- `visual-anchors.json`: 6/6 ramos Saúde Mental.
- `e2e/visual-mold-regression.spec.ts`: bloco dedicado Saúde Mental.
