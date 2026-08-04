# Onda 4 — ship/promote Trilha A (AB → Epi → Anatomia)

**Data:** 2026-08-03  
**Modelo:** Cursor Grok 4.5  
**Gate:** `production_ready` + relatório (sem promote forçado)

## Estado

| Pacote | Registry | Disk golden | Ship? | Blocker |
|--------|----------|------------:|-------|---------|
| Atenção Básica / Saúde da Família | applied 171/171 · prod none | 171/171 | **quase** | L1 DoD FAIL no Supabase (3 slugs stale) — precisa apply |
| Epidemiologia e Vigilância Epidemiológica | in_progress 0/218 · prod none | 8/218 | **não** | handcraft/apply incompleto (g01 golden; g02–g28 sem golden-v1) |
| Noções de Anatomia | in_progress 8/46 · prod none | 16/46 | **não** | só g01 applied; g02–g06 incompletos / sem stamp |

## AB — feito nesta onda

- reconcile manifest 171/171
- L2c: 14 fails reparados (letter/VF spoiler + Marcar X no logic_flow) → **PASS**
- L6: anchor_second_review=pass em **22/22** g*
- L3: artifacts/visual-mold-regression/summary.json (ok_generico; ab_esf_composicao pending React)
- L2 / L2b / L5: **PASS**
- L1: **FAIL** (DoD lê Supabase — 3 slugs sem content_standard live)
- Dry-run apply **failed=0** nos lotes: g03, g05, g06, g07, g13, g15, g16

Artefatos: `artifacts/subtopico-quality/atencao-basica-saude-da-familia.json` · `p0-onda4-ab-l2c-repair.json` · `p0-onda4-ab-l6.json` · `p0-onda4-trilha-a-readiness.json`

## Epi / Anatomia — não promovíveis agora

Ship exige `status=applied` + `handcraft_applied === total_slugs` + gates L1–L6.
Retomar Onda 1 / Continuar programa (golden stamp + apply) antes de Onda 4 nestes dois.

## Handoff

1. Digite **pode aplicar** para os 7 lotes AB (g03/g05/g06/g07/g13/g15/g16) com flags P0-2.
2. Depois: `npm run audit:subtopico-quality -- --subtopico="Atenção Básica / Saúde da Família" --promote`
3. Em seguida: Continuar programa Epi / Anatomia até applied 100%, então ship.
