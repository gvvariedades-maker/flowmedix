# F3 — repair `letter_truncation`

- comando: `npm run repair:pedagogy-truncagem`
- corpus: catalog
- modo: **dry-run**
- arquivos varridos: 5252
- arquivos que mudariam: 0
- edições: 0
- pulados (fila de handcraft): 10
- idempotência: OK

## Assinaturas alvo (antes → depois)

| assinatura | antes | depois |
| --- | --- | --- |
| `pedagogy_letter_spoiler` | 8898 | 8898 |

## Diff revisável

## Pulados — exigem handcraft

| motivo | caminho | texto |
| --- | --- | --- |
| `kept_still_spoils` | `golden_rule.footer_rule` | B–E são sintomas depressivos — A é conduta social |
| `kept_too_short` | `golden_rule.rows[0].value` | de segunda a sexta — sem crase (D erra) |
| `kept_too_short` | `concept_map.items[3].detail` | Àquilo é OD — não «determina sujeito» (D erra). |
| `kept_too_short` | `golden_rule.rows[0].value` | Tema estruturante — A é tema (não marque no EXCETO) |
| `kept_too_short` | `golden_rule.rows[1].value` | Tema estruturante — B é tema |
| `kept_too_short` | `golden_rule.rows[2].value` | Tema estruturante — C é tema |
| `kept_too_short` | `golden_rule.rows[3].value` | Tema estruturante — D é tema |
| `kept_too_short` | `concept_map.items[2].detail` | Lugar, não tempo — B erra «tempo». |
| `kept_too_short` | `concept_map.footer_rule` | Ensine o gabarito B — registre que D é conduta normativa usual |
| `kept_too_short` | `concept_map.items[3].detail` | Preposição — «conforme» a Força Aérea Brasileira. |

