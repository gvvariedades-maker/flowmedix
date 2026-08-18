# NeuroCanvas — reconciliação operacional vs editorial (G0.2 live)

Gerado em: 2026-07-26T09:46:20.354Z

## Acesso live: **disponível**

Método: createServerSupabase → modulos_estudo.select(modulo_slug, conteudo_json)

Slugs unresolved processados: **676** / 676

## Distribuição A–F

| classe | count |
|--------|------:|
| live_exactly_one_candidate | 351 |
| live_matches_multiple_identical_candidates | 73 |
| live_matches_no_candidate | 237 |
| slug_missing_live | 2 |
| live_invalid_incomparable | 13 |
| live_multiple_records | 0 |

## Por severidade (S1–S3)

| severity | total | live_matched | live_missing/ambiguous |
|----------|------:|-------------:|-----------------------:|
| S0 | 0 | 0 | 0 |
| S1 | 255 | 161 | 93 |
| S2 | 346 | 194 | 141 |
| S3 | 75 | 69 | 5 |
| S4 | 0 | 0 | 0 |

## Dual canônico

| operational matched | 351 |
| operational missing | 239 |
| operational ambiguous | 73 |
| operational incomparable | 13 |
| editorial documented path | 0 |
| editorial unresolved | 554 |
| editorial official_review_required | 122 |

## Revisão oficial de gabarito (blockers locais)

| Métrica | Count |
|---------|------:|
| S3 | 75 |
| has_answer_divergence | 99 |
| overlap (S3 ∩ gabarito) | 52 |
| **união (exige fonte oficial)** | **122** |
| editorial_official_review_required | 122 |
| live_detected_answer_divergences | 0 |

editorial_official_review_required alinha com união S3 ∪ has_answer_divergence (blockers locais).

## Divergências live×candidatos (campo answer_divergences): **0**

Nenhuma detectada na comparação live×candidatos (live pode coincidir com uma cópia local enquanto outras divergem).

## Limitações

- dedupe_schema_version: 1
- Supabase live = evidência operacional; manifest/registry = canônico editorial.
- S3: operational_match_only=true e official_answer_review_required=true mesmo com match live.
- Nenhuma escrita Supabase; nenhuma alteração em manifests/registry.
