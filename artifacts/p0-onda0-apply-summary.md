# P0 Onda 0 — apply Supabase (Sinais / Urgências / VF onda3)

**Gerado:** 2026-08-03  
**Status:** `applied_supabase`  
**Auth:** `pode aplicar` após dry-run 100% OK

## Scorecard apply

| Lote | role | ok | failed | skipped | note |
|------|------|---:|-------:|--------:|------|
| `sinais-vitais-completo` | letter+VF | **526** | 0 | 0 | 526 applied; 1 G04 blocked skipped (educa-pb…8599930-0) |
| `urgencias-e-emergencias-completo` | letter | **349** | 0 | 0 | — |
| `curativos-e-manejo-de-feridas-completo` | VF onda3 | **188** | 0 | 0 | — |
| `vias-de-administracao-completo` | VF onda3 | **235** | 0 | 0 | — |

**Total ok:** 1298 · **failed:** 0

Flags: `--allow-generic --skip-preflight --skip-anchor-review --skip-risk-approval` (padrão P0-2).

### G04 skip (sem A4 humano)

- `educa-pb-enfermagem-nocoes-de-fisiologia-1775448599930-0` — `defective_item_no_metrics_isolation`
- Apply Sinais via `--only-slugs-file=artifacts/p0-onda0-sinais-apply-slugs.json` (526/527)

## Smoke plan

### sinais-vitais-completo
- [vf] `/estudar/amauc-enfermagem-processo-de-enfermagem-1780002549800-0`
- [protocolo-exceto] `/estudar/adm-tec-enfermagem-verificacao-de-sinais-vitais-1779343833455-7`
- [conceito] `/estudar/adm-tec-enfermagem-processo-de-enfermagem-1776056021381-4`

### urgencias-e-emergencias-completo
- [vf] `/estudar/ameosc-enfermagem-processo-de-enfermagem-1780005556782-6`
- [protocolo-exceto] `/estudar/adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-6`
- [conceito] `/estudar/adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-4`

### curativos-e-manejo-de-feridas-completo
- [vf] `/estudar/avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344766321-4`
- [protocolo-exceto] `/estudar/ameosc-enfermagem-curativos-e-manejo-de-feridas-1779340178514-0`
- [conceito] `/estudar/adm-tec-enfermagem-curativos-e-manejo-de-feridas-1779344773456-1`

### vias-de-administracao-completo
- [vf] `/estudar/adm-tec-enfermagem-vias-de-administracao-1776056401060-9`
- [protocolo-exceto] `/estudar/avancasp-enfermagem-vias-de-administracao-1776056409987-9`
- [conceito] `/estudar/agirh-enfermagem-vias-de-administracao-1778968787431-0`

## Artefatos

- `artifacts/p0-onda0-dry-run-summary.{json,md}`
- `artifacts/p0-onda0-apply-summary.json` (este)
- `artifacts/catalog-migration-*-applied.json`

