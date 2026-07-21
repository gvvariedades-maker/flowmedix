# Verbos — tempos, modos e vozes (completo)

Card vitrine **Língua Portuguesa** · ramo `pt_verbos` · 45 questões do caderno PT.

## Fonte

- PDF: `data/sources/lingua-portuguesa/portugues-caderno-2025-2026*.pdf`
- Cluster: `artifacts/lingua-portuguesa-topic-cluster-report.json`
- Extração: `python scripts/tools/extract_pt_verbos_completo.py`

## Lotes

| Lote | Slugs |
|------|------:|
| `verbos-tempos-modos-e-vozes-g01` | 8 |
| `verbos-tempos-modos-e-vozes-g02` | 8 |
| `verbos-tempos-modos-e-vozes-g03` | 8 |
| `verbos-tempos-modos-e-vozes-g04` | 8 |
| `verbos-tempos-modos-e-vozes-g05` | 8 |
| `verbos-tempos-modos-e-vozes-g06` | 5 |

## L3

- Decisão: `ok_generico` (morphological · reference_table · tap · compare)
- Brief: `artifacts/l3-brief-lingua-portuguesa-pt_verbos.md`
- INDEX: `artifacts/l3-brief-verbos-tempos-modos-e-vozes-INDEX.md`

## Comandos

```bash
npm run audit:taxonomy-gate -- --subtopico="Verbos — tempos, modos e vozes"
npm run audit:golden-anchor-gate -- --subtopico="Verbos — tempos, modos e vozes"
npx tsx scripts/handcraft-verbos-tempos-modos-e-vozes-g01.ts
npm run audit:questao-readiness -- --lote=verbos-tempos-modos-e-vozes-g01 --strict-v2-pedagogy
```
