# P0 — anti-spoiler de letra no golden_rule (Vias + Imunização)

Data: 2026-08-01
Repairs: gabarito_item + letter_truncation (F3)

## Resultado

| Lote | Antes (detector) | Depois | Spoiler nomeado `letra [A-E]` |
|------|------------------|--------|------------------------------|
| Vias (235) | 936 | **0** | **0** |
| Imunização (575) | 599 | ~18 | **0** |

Os ~18 hits em Imunização são falso-positivo do detector (`hepatite A é…`), não spoiler de alternativa.

## O que mudou no repair

- Relabel Letra A / Alternativa B → chip do value
- Remove Gabarito da Questão / rows só-letra / I → letra A
- Strip GABARITO: Letra X — Certo/Errado, → letra E, confirmar letra D
- Truncagem de frases finais A erra… sem travessão + limpa exam_hint só-julgamento
- Idempotente (2ª passada = 0 edits)

## Apply Supabase (só com "pode aplicar")

npm run catalog:apply-lote -- --lote=vias-de-administracao-completo --dry-run
npm run catalog:apply-lote -- --lote=imunizacao-completo --dry-run

## Código

- lib/catalogMigration/repairPedagogySignatures.ts
- __tests__/lib/catalogMigration/repairPedagogySignatures.test.ts (26 testes)
