# NeuroCanvas — reconciliação do resolver (G0.2)

Gerado em: 2026-07-26T09:47:53.813Z

## 1. Causa family 27,8% vs 25,6%

A auditoria consolidada (filesystem-first, 5651 questões / 22604 slides) reporta family_rotation=6285 (27.8%). O impacto baseline (baselineImpact.ts) cita family=5787 (25.6%) como "anterior" — delta de 498 slides (2.2 p.p.). Causa: o fallback hardcoded em baselineImpact.ts usa family=5787, mas a reexecução fs-first atual produz family=6285. Os hardcodes não somam o total de slides (faltam categorias residuais), enquanto a auditoria fs-first inclui bespoke_zero_slots explicitamente. A baseline canônica parcial (4975 questões / 19900 slides) exclui 676 slugs unresolved — family cai para 5185 (26.1%). Escopo em disco: 5651 slugs únicos; canônico resolvido: 4975; blockers: 676.

## 2. Baselines

### fs_first_full

- Fonte: `buildResolverAuditReport({ canonical: false })`
- Questões: 5651 · Slides: 22604
- Função: buildResolverAuditReport → resolveQuestionSlides → classifyDecision (lib/neurocanvas/resolverAudit.ts); runtime: resolveSlidePresentation + enrichPresentationContext
- Soma decisões = total: **sim** (22604 / 22604)

| decision | count | % | bucket |
|----------|------:|--:|--------|
| bespoke_affinity | 14118 | 62.5% | bespoke |
| family_rotation | 6285 | 27.8% | family |
| generic_semantic | 2197 | 9.7% | generic |
| bespoke_zero_slots | 4 | 0% | residual |
| mold_fallback | 0 | 0% | residual |
| explicit_json | 0 | 0% | residual |

#### bespoke_zero_slots

| slug | idx | type | design variant | layout | nota |
|------|----:|------|----------------|--------|------|
| amauc-enfermagem-saude-do-adolescente-1777104229064-5 | 0 | concept_map | adolescent-growth-z-rail | bridge | Mapa de design aponta bespoke sem slots; afinidade rejeita antes da seleção — layout genérico sem mold_fallback. |
| cogeps-unioeste-enfermagem-saude-do-adolescente-1777104229064-7 | 0 | concept_map | adolescent-privacy-curtain | bridge | Mapa de design aponta bespoke sem slots; afinidade rejeita antes da seleção — layout genérico sem mold_fallback. |
| fau-unicentro-enfermagem-saude-do-adolescente-1777104229064-3 | 0 | concept_map | adolescent-growth-z-rail | grid | Mapa de design aponta bespoke sem slots; afinidade rejeita antes da seleção — layout genérico sem mold_fallback. |
| idecan-enfermagem-saude-do-adolescente-1778712426701-8 | 0 | concept_map | adolescent-growth-z-rail | grid | Mapa de design aponta bespoke sem slots; afinidade rejeita antes da seleção — layout genérico sem mold_fallback. |

### canonical_partial

- Fonte: `buildResolverAuditReport({ canonical: true })`
- Questões: 4975 · Slides: 19900
- Função: buildResolverAuditReport → resolveQuestionSlides → classifyDecision (lib/neurocanvas/resolverAudit.ts); runtime: resolveSlidePresentation + enrichPresentationContext
- Soma decisões = total: **sim** (19900 / 19900)

| decision | count | % | bucket |
|----------|------:|--:|--------|
| bespoke_affinity | 12736 | 64% | bespoke |
| family_rotation | 5185 | 26.1% | family |
| generic_semantic | 1975 | 9.9% | generic |
| bespoke_zero_slots | 4 | 0% | residual |
| mold_fallback | 0 | 0% | residual |
| explicit_json | 0 | 0% | residual |

#### bespoke_zero_slots

| slug | idx | type | design variant | layout | nota |
|------|----:|------|----------------|--------|------|
| amauc-enfermagem-saude-do-adolescente-1777104229064-5 | 0 | concept_map | adolescent-growth-z-rail | bridge | Mapa de design aponta bespoke sem slots; afinidade rejeita antes da seleção — layout genérico sem mold_fallback. |
| cogeps-unioeste-enfermagem-saude-do-adolescente-1777104229064-7 | 0 | concept_map | adolescent-privacy-curtain | bridge | Mapa de design aponta bespoke sem slots; afinidade rejeita antes da seleção — layout genérico sem mold_fallback. |
| fau-unicentro-enfermagem-saude-do-adolescente-1777104229064-3 | 0 | concept_map | adolescent-growth-z-rail | grid | Mapa de design aponta bespoke sem slots; afinidade rejeita antes da seleção — layout genérico sem mold_fallback. |
| idecan-enfermagem-saude-do-adolescente-1778712426701-8 | 0 | concept_map | adolescent-growth-z-rail | grid | Mapa de design aponta bespoke sem slots; afinidade rejeita antes da seleção — layout genérico sem mold_fallback. |

### baseline_impact_hardcoded_previous

Não disponível.

## 3. Delta fs-first → canônica parcial

| Métrica | Δ |
|---------|--:|
| Questões | -676 |
| Slides | -2704 |
| family (abs) | -1100 |
| family (p.p.) | -1.6999999999999993 |
| generic (abs) | -222 |

**Genéricos exatos na baseline canônica (19900 slides): 1975** (9.9%)
