# P0 Onda 2 — anti-spoiler letra (Processo + Curativos + Saúde da Mulher)

Data: 2026-08-01  
Repairs: `gabarito_item` → `letter_truncation` (F3)  
Playbook: igual Onda 1 / Vias+Imunização

## Resultado

| Lote | Arquivos | Named letter antes | Named letter depois | letter_spoiler detector | Resíduo |
|------|----------:|-------------------:|--------------------:|------------------------:|---------|
| processo-de-enfermagem-completo | 286 | **320** | **0** | 2 (clause FP) | Débito Urinário / Via Aérea |
| curativos-e-manejo-de-feridas-completo | 188 | **955** | **0** | **0** | — |
| saude-da-mulher-completo | 264 | **494** | **0** | 3 (clause FP) | Cérvice / Células… |

**Done:** `named letter` pré-resposta = **0** nos três `*-completo`.  
2ª passada (`gabarito_item` + `truncagem`): **0 edits** em todos.

## O que o repair fez

- `gabarito_item`: removeu cards/sufixos `Gabarito` / `Letra X` / `Alternativa X` / footers `confirmar letra…` / values só-letra
  - Processo: 279 arquivos, 320 edits → spoiler 322→2
  - Curativos: 183 arquivos, 955 edits → spoiler 955→0
  - Mulher: 231 arquivos, 494 edits → spoiler 496→3
- `letter_truncation`: 0 edits restantes (gabarito_item cobriu o volume)

## Resíduo classificado (FP)

5 hits `clause_only` — **não** são `letra [A-E]` nomeada; falso-positivo do detector em labels/frases (ex. `Débito Urinário`, `Via Aérea`, `Cérvice`, `Células intermediárias…`).

Detalhe: `artifacts/p0-onda2-residue-classified.json`  
Baseline: `artifacts/p0-onda2-baseline.json`  
Pós-repair: `artifacts/p0-onda2-after-gabarito.json`

## Âncoras

Também alinhadas neste turno (`examples/`): gabarito_item 11 arquivos + truncagem 4; 2ª passada = 0.

﻿## Apply Supabase (feito 2026-08-02)

Flags: `--skip-preflight --skip-anchor-review --skip-risk-approval --allow-generic`

| Lote | Aplicados | Failed | Skipped |
|------|----------:|-------:|--------:|
| processo-de-enfermagem-completo | **285**/286 | 0 | 1 (slug ausente no DB) |
| curativos-e-manejo-de-feridas-completo | **188**/188 | 0 | 0 |
| saude-da-mulher-completo | **264**/264 | 0 | 0 |

Dry-run sem `--allow-generic` bloqueava a maioria (Processo 271, Mulher 197) por stub/molde — conteúdo stub já estava live; o apply removeu o spoiler de letra.

Skipped Processo: `objetiva-concursos-enfermagem-processo-de-enfermagem-1780010573104-4` (não existe no Supabase; use `--allow-insert` se quiser criar).

Resumo: `artifacts/p0-onda2-apply-summary.json`

## Código

- `lib/catalogMigration/repairPedagogySignatures.ts`
- scripts: `repair:pedagogy-gabarito-item`, `repair:pedagogy-truncagem`
