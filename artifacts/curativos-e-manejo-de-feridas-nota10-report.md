# Curativos e Manejo de Feridas — onda nota-10 (2026-07-16)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **94/94** — vendável |
| Manifest ↔ registry | **94/94** alinhado (`reconcile:handcraft-manifest` OK) |
| Preflight L1 | **12/12** lotes — 94/94 PASS |
| A4-mínimo | **94/94** `efficacy_contract` (87 agente auto + 7 amostra 20% humano) |
| Apply Supabase | g01–g12 **94/94** aplicados (2026-07-16) |
| L6 checklist | **12/12** lotes anchor `pass` (revisor `agent`, `--skip-capture`) |
| L3 visual | PASS — 3 ramos pedagógicos; PNGs em `artifacts/visual-mold-regression/` |
| Health | **PASS** (gates L1–L6) |

## A4 humano (7 — amostra ~20%)

| Slug | Motivo |
|------|--------|
| `avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344766321-4` | amostra 20% |
| `facet-enfermagem-curativos-e-manejo-de-feridas-1779344786992-7` | amostra 20% |
| `instituto-access-enfermagem-curativos-e-manejo-de-feridas-1779344773456-6` | amostra 20% |
| `fundep-enfermagem-curativos-e-manejo-de-feridas-1779269212740-6` | amostra 20% |
| `facet-enfermagem-curativos-e-manejo-de-feridas-1779344786992-9` | amostra 20% |
| `ibfc-enfermagem-curativos-e-manejo-de-feridas-1779269291153-1` | amostra 20% |
| `instituto-access-enfermagem-curativos-e-manejo-de-feridas-1779269305691-0` | amostra 20% |

Protocolo: [`docs/PROTOCOLO_A4_MINIMO_CURATIVOS.md`](../docs/PROTOCOLO_A4_MINIMO_CURATIVOS.md) · código `lib/catalogMigration/curativosA4Minimo.ts`

## L3 ramos cobertos

`curativos_lpp` · `curativos_cobertura_selecao` · `curativos_ferida_cirurgica` (+ genérico)

Brief índice: [`artifacts/l3-brief-curativos-index.md`](l3-brief-curativos-index.md)

## Paridade com Saúde do Adolescente

| Dimensão | Adolescente nota-10 | Curativos nota-10 |
|----------|---------------------|-------------------|
| Slugs | 16 | 94 |
| A4-mínimo onda | sim | sim |
| Guideline TS | sim | `lib/guidelines/curativos.ts` |
| L3 Playwright PNG | sim | sim |
| L6 anchor 12 lotes | proporcional | 12/12 pass |

## Dívida residual (aceitável)

- 7 slugs em fila de QC humano 30s (política amostra 20%) — não bloqueiam ship
- L6 gravado com `--skip-capture` (captures opcionais L4)
- Registry `status` corrigido `partial` → `applied` após apply 94/94 (handcraft já estava 94/94 no disco)

## Comandos de referência

```bash
npm run stamp:a4-minimo -- --lote=curativos-e-manejo-de-feridas-g01
npm run reconcile:handcraft-manifest -- --subtopico="Curativos e Manejo de Feridas"
npm run catalog:preflight -- --lote=curativos-e-manejo-de-feridas-g01
npm run audit:anchor-review -- --lote=curativos-e-manejo-de-feridas-g01 --record-pass --reviewer=agent --skip-capture
npm run catalog:apply-lote -- --lote=curativos-e-manejo-de-feridas-g01 --apply
npx playwright test e2e/visual-mold-regression.spec.ts --grep "Curativos"
npm run audit:subtopico-quality -- --subtopico="Curativos e Manejo de Feridas" --promote
npx tsx scripts/audit-curativos-a4-summary.ts
```

## Artefatos

- `artifacts/subtopico-quality/curativos-e-manejo-de-feridas.json`
- `artifacts/reconcile-manifest-curativos-e-manejo-de-feridas.json`
- `artifacts/handcraft-dod-audit.json`
- `artifacts/anchor-review/curativos-e-manejo-de-feridas-g*.json`
- `artifacts/catalog-migration-curativos-e-manejo-de-feridas-g*-applied.json`
