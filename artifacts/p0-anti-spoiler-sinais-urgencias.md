# P0 — anti-spoiler de letra (Sinais Vitais + Urgências)

Data: 2026-08-01  
Repairs: `gabarito_item` → `letter_truncation` (F3)  
Ordem: âncoras → blind-reader (dry-run) → lotes  
Apply Supabase: **não** (aguardando `pode aplicar`)

## Resultado

| Lote | Antes (named) | Depois named | Spoiler nomeado `letra [A-E]` |
|------|--------------:|-------------:|------------------------------|
| Sinais Vitais (527) | 1643 | **0** | **0** |
| Urgências (349) | 856 | **0** | **0** |

Detector `pedagogy_letter_spoiler` residual (não-named):

| Lote | letter_spoiler depois | Resíduo classificado |
|------|----------------------:|----------------------|
| Sinais | 3 | {'fp_celsius_clause': 3} |
| Urgências | 2 | {'fp_protocol_letter_vocab': 2} |

Os hits residuals são **falso-positivo do detector** (`°C é` / `°C está` = Celsius; ABCDE já reescrito para `passo`), não spoiler de alternativa.

## O que mudou no repair (código)

- `exam_hint` de julgamento (`Letra B — …`, `Gabarito A — …`) → limpa na truncagem
- `exam_hint` no piso de strip do `gabarito_item` (e clear se resto curto)
- Regex de cláusula exige espaço após letra (`\s+`) — evita casar `Déficit`
- 2 slugs Urgências ABCDE: `letra D/C` → `passo D/C` (vocabulario do protocolo ≠ gabarito)
- Idempotência: 2ª passada gabarito/trunc = 0 edits nos dois lotes

## Comandos executados

```bash
npm run repair:pedagogy-gabarito-item -- --write   # âncoras
npm run audit:blind-reader -- --dry-run
npm run repair:pedagogy-gabarito-item -- --lote=sinais-vitais-completo --write
npm run repair:pedagogy-truncagem -- --lote=sinais-vitais-completo --write
npm run repair:pedagogy-gabarito-item -- --lote=urgencias-e-emergencias-completo --write
npm run repair:pedagogy-truncagem -- --lote=urgencias-e-emergencias-completo --write
```

Urgências gabarito: **216** arquivos / **854** edições (858 → 4 spoiler detector).

## Apply Supabase (só com "pode aplicar")

```bash
npm run catalog:apply-lote -- --lote=sinais-vitais-completo --dry-run
npm run catalog:apply-lote -- --lote=urgencias-e-emergencias-completo --dry-run
# depois, com autorização explícita:
# npm run catalog:apply-lote -- --lote=sinais-vitais-completo --apply
# npm run catalog:apply-lote -- --lote=urgencias-e-emergencias-completo --apply
```

## Artefatos

- `artifacts/p0-anti-spoiler-sinais-urgencias.md` (este)
- `artifacts/p0-residue-classified-sinais-urgencias.json`
- `artifacts/p0-sinais-urgencias-baseline.json`
- `artifacts/p0-sinais-urgencias-final-probe.json`

## Código

- `lib/catalogMigration/repairPedagogySignatures.ts`
- `lib/catalogMigration/unifiedPedagogyDetector.ts` (`LETTER_VERDICT_RE` com `\s+`)
- `__tests__/lib/catalogMigration/repairPedagogySignatures.test.ts` (30 testes, incl. P0 Sinais residue)
