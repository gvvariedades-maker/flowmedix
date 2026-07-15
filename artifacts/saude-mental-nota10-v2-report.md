# Saúde Mental — relatório paridade Adolescente + L3 bespoke (nota-10 v2)

**Data:** 2026-07-15  
**Pacote:** `saude-mental` — **37 slugs** — `production_ready`  
**Modo:** `bespoke_obrigatorio_ramoforte`  
**Barra:** paridade proporcional com [saude-adolescente-nota10-report.md](saude-adolescente-nota10-report.md)

## Tabela de paridade (modo L3 bespoke)

| Critério | Saúde do Adolescente | Saúde Mental | Paridade |
|----------|----------------------|--------------|----------|
| Slugs handcraft applied | 16/16 | 37/37 | ✅ |
| `production_ready` | sim | sim | ✅ |
| Ramos L3 com ≥1 slug | 6/6 | 6/6 | ✅ |
| **Bespoke 4/4 ramos fortes** | 2/2 (antropometria + ética) | **2/2** (`mental_raps_legis`, `mental_crise_caps`) | ✅ |
| ok_generico 3/3 (ramos não-fortes) | N/A | 4/4 cauda (depressao, dependencia, aps, generico) | ✅ |
| Brief INDEX + 4/4 ramos fortes | sim | sim | ✅ |
| visual-anchors 1/ramo | 6 | 6 | ✅ |
| Playwright L3 summary.json | sim | sim (`pacote_prefix=saude-mental`) | ✅ |
| A4 100% stamped | 16/16 | 37/37 | ✅ |
| L6 + captures | g01+g02 | 8/8 handcraft-qc PNGs | ✅ proporcional |
| Apply Supabase | 16/16 | 37/37 dry-run + apply | ✅ |
| audit:l3-mold-gap ramos fortes | 0 pendências React | `molde_inedito` RAPS + `molde_redesign` crise implementados | ✅ |

## Pacotes L3 bespoke (Fase 0b)

| Ramo | Slugs | Pacote React 4/4 |
|------|-------|------------------|
| `mental_raps_legis` | 11 | `mental-raps-network-rail` · `mental-raps-tier-board` · `mental-raps-classify-tap` · `mental-raps-trap-arena` |
| `mental_crise_caps` | 6 | `mental-crisis-signal-deck` · `mental-crisis-ladder-board` · `mental-crisis-decision-tap` · `mental-crisis-coercion-trap` |

**Proibido cumprido:** sem `ok_existente` SAE→crise; sem ship com `molde_inedito|molde_redesign` pendente.

## Gates executados

```bash
npm run handcraft:brief -- --subtopico="Saúde Mental"
npm run audit:l3-mold-gap -- --subtopico="Saúde Mental"
npm run audit:subtopico-quality -- --subtopico="Saúde Mental" --promote
npm run catalog:apply-lote -- --lote=saude-mental-completo --dry-run
npm run catalog:apply-lote -- --lote=saude-mental-completo --apply
```

## Arquivos-chave

- `lib/slides/saudeMentalSlideUtils.ts`
- `lib/slides/pedagogicalBranch.ts` — `MENTAL_LEGIS` + `MENTAL_CRISIS_MOLD`
- `components/slides/variants/Mental*.tsx` (8 componentes)
- `docs/VARIANT_MOLDS.md` § catálogo mental
- `artifacts/visual-mold-regression/summary.json`
