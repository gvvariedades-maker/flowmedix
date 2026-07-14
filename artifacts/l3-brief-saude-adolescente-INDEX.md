# Saúde do Adolescente — índice de briefs L3 (6 ramos)

**Subtópico:** Saúde do Adolescente · **16 slugs** · `production_ready` · onda nota-10 (2026-07-13)

Política: cada ramo forte documenta **metáfora visual ↔ erro pedagógico**. Bespoke React só quando o erro é espacial/categorial e o genérico não ancora memória; demais ramos usam pacote semântico genérico premium (`rows`, `correct`, `reveal_mode: tap`).

| Ramo | Slugs (aprox.) | Pacote L3 | Brief | Implementação |
|------|----------------|-----------|-------|---------------|
| `adolescente_etica_sigilo` | 2 | bespoke ética | [etica_sigilo](l3-brief-saude-adolescente-adolescente_etica_sigilo.md) | **React** |
| `adolescente_antropometria` | 2 (1 com Z) | bespoke Z-score | [antropometria](l3-brief-saude-adolescente-adolescente_antropometria.md) | **React** (Z apenas) |
| `adolescente_desenvolvimento` | 1 | genérico premium | [desenvolvimento](l3-brief-saude-adolescente-adolescente_desenvolvimento.md) | genérico |
| `adolescente_saude_mental` | 3 | genérico premium | [saude_mental](l3-brief-saude-adolescente-adolescente_saude_mental.md) | genérico |
| `adolescente_violencia_protecao` | 2 | genérico premium | [violencia_protecao](l3-brief-saude-adolescente-adolescente_violencia_protecao.md) | genérico |
| `adolescente_generico` | 6 | genérico premium | [generico](l3-brief-saude-adolescente-adolescente_generico.md) | genérico |

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` |
| Afinidade + guards | `lib/slides/moldAffinity.ts` |
| Utils ética/sigilo | `lib/slides/adolescentSlideUtils.ts` |
| Utils escore Z | `lib/slides/adolescentAntropometriaSlideUtils.ts` |
| Gap audit / decisões | `lib/slides/l3MoldGapCatalog.ts` |
| Regressão visual | `e2e/visual-mold-regression.spec.ts` · `artifacts/visual-mold-regression/summary-saude-adolescente.json` |
| Cluster + volume | `artifacts/saude-adolescente-topic-cluster-report.json` |
| Relatório nota-10 | `artifacts/saude-adolescente-nota10-report.md` |

## Docs canônicos

- [`docs/MOLD_AFFINITY_RESOLVER.md`](../docs/MOLD_AFFINITY_RESOLVER.md) — resolver v2.1
- [`docs/AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](../docs/AGENT_AVANT_TEMPLATES_E_LAYOUT.md) — §6.8.1 ramos
- [`docs/PROMPT_VARIANTES_NEUROSLIDES.md`](../docs/PROMPT_VARIANTES_NEUROSLIDES.md) — template de brief 4/4

## Trigger de nova implementação

```text
Mapeamento L3: Saúde do Adolescente
Implementar molde: adolescente_<ramo>
```

Gate de volume sugerido: **≥5 slugs** no sub-cluster **ou** pedido explícito flagship (exceção: antropometria Z com 1 slug na onda nota-10).
