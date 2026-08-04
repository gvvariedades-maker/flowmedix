# Saúde do Adolescente — Índice de briefs L3 (6 ramos)

**Subtópico:** Saúde do Adolescente · **16 slugs** · `production_ready` · onda nota-10 + **Onda 2 glanceable** (2026-08-01)

Política: pacote glanceable v2 (`ADOLESCENTE_GLANCEABLE_MOLD` = pillars · speak-barrier · isolate-board · exceto-compare) cobre ética **e** os 4 ramos que eram genéricos. Antropometria permanece trilho Z. Moldes v1 (curtain/weave/consent) = legado só em galeria / ética explícita.

| Ramo | Slugs (aprox.) | Pacote L3 | Brief | Implementação |
|------|----------------|-----------|-------|---------------|
| `adolescente_etica_sigilo` | 2 | glanceable v2 | [etica_sigilo](l3-brief-saude-adolescente-adolescente_etica_sigilo.md) · [v2](l3-brief-saude-adolescente-etica-sigilo-v2.md) | **React** |
| `adolescente_antropometria` | 2 (1 com Z) | bespoke Z-score | [antropometria](l3-brief-saude-adolescente-adolescente_antropometria.md) | **React** (Z) |
| `adolescente_violencia_protecao` | 2 | glanceable v2 (reuso) | [violencia_protecao](l3-brief-saude-adolescente-adolescente_violencia_protecao.md) | **Onda 2** |
| `adolescente_saude_mental` | 3 | glanceable v2 (reuso) | [saude_mental](l3-brief-saude-adolescente-adolescente_saude_mental.md) | **Onda 2** |
| `adolescente_desenvolvimento` | 1 | glanceable v2 (reuso) | [desenvolvimento](l3-brief-saude-adolescente-adolescente_desenvolvimento.md) | **Onda 2** |
| `adolescente_generico` | 6 | glanceable v2 (reuso) | [generico](l3-brief-saude-adolescente-adolescente_generico.md) | **Onda 2** |

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` (`ADOLESCENTE_GLANCEABLE_MOLD`) |
| Afinidade + guards | `lib/slides/moldAffinity.ts` (`ADOLESCENT_GLANCEABLE_BRANCHES`) |
| Gap audit | `lib/slides/l3MoldGapCatalog.ts` |
| Estratégia | `docs/NEUROSLIDES_VISUAL_STRATEGY.md` Onda 2 |
| Regressão visual | `e2e/visual-mold-regression.spec.ts` |

## Trigger

```text
Design visual: adolescente_<ramo>
Implementar molde: adolescente_<ramo>   # só se gesto NOVO (não Onda 2)
```

Gate de ID novo: gesto espacial diverge **ou** ≥5 questões com erro que o board não fixa.
