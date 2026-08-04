# P0 Onda 3 — VF verdict spoiler (Sinais + Vias + Curativos)

**Gerado:** 2026-08-01  
**Repair:** `npm run repair:pedagogy-rotulos-vf` (`vf_label`)  
**Apply Supabase:** pendente — aguardar `pode aplicar`

## Scorecard

| Lote | arquivos | VF antes | VF depois | named letter | 2a passada |
|------|----------:|---------:|----------:|-------------:|------------|
| `sinais-vitais-completo` | 527 | 606 | **1** | 0 | 0 edits |
| `vias-de-administracao-completo` | 235 | 475 | **0** | 0 | 0 edits |
| `curativos-e-manejo-de-feridas-completo` | 188 | 302 | **0** | 0 | 0 edits |
| **Total** | 950 | 1383 | **1** | 0 | OK |

Pre letter strip (Ondas 1-2): Curativos/Vias ja 0; Sinais ainda tinha ~1643 named → `gabarito_item` + `truncagem` no disco (1652→13 letter_spoiler; named→0).

## Engine (`repairPedagogySignatures`)

1. Piso de chip VF curto (`I.`, `Dor`, `15°`, `VO.`) — nao usar MIN_KEPT de truncagem longa.
2. Label puro `Falsa`/`Verdadeira` → relabel `Proposição`.
3. `LETTER_CLAUSE_RE`: `\s+` (nao `\s*`) + lookbehind `(?<![°º])` — evita FP `Déficit` e `°C está`.

## Residual (1) — handcraft pontual

| Slug | Motivo | Texto |
|------|--------|-------|
| `cogeps-unioeste-enfermagem-verificacao-de-sinais-vitais-1779344152370-6` | `remainder_still_spoils` | `Verdadeira: Apenas as alternativas A e D estão corretas.` |

Strip do veredito deixaria A/D no pre-resposta — fila `Slug:`.

## Apply (somente apos "pode aplicar")

```bash
npm run catalog:apply-lote -- --lote=sinais-vitais-completo --dry-run
npm run catalog:apply-lote -- --lote=vias-de-administracao-completo --dry-run
npm run catalog:apply-lote -- --lote=curativos-e-manejo-de-feridas-completo --dry-run
# depois --apply
```

Artefatos: `artifacts/p0-onda3-vf-baseline.json`, `artifacts/p0-onda3-vf-final.json`, `artifacts/repair-pedagogy-vf-labels.{json,md}`.
