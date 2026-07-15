# Punção Venosa e Cuidados com Cateteres — índice de briefs L3 (7 ramos)

**Subtópico:** Punção Venosa e Cuidados com Cateteres · **110 slugs** · `production_ready` · onda nota-10 (2026-07-14)

Política: cada ramo forte documenta **metáfora visual ↔ erro pedagógico**. Bespoke React quando o erro é espacial/categorial; `puncao_generico` absorve cauda heterogênea com pacote semântico premium.

| Ramo | Slugs (aprox.) | Pacote L3 | Brief | Implementação |
|------|----------------|-----------|-------|---------------|
| `puncao_flebite` | 19 | bespoke IV complicações | [flebite](l3-brief-puncao-venosa-e-cuidados-com-cateteres-puncao_flebite.md) | **React** |
| `puncao_dispositivo` | 12 | bespoke calibre/jelco | [dispositivo](l3-brief-puncao-venosa-e-cuidados-com-cateteres-puncao_dispositivo.md) | **React** |
| `puncao_exceto` | 12 | bespoke EXCETO | [exceto](l3-brief-puncao-venosa-e-cuidados-com-cateteres-puncao_exceto.md) | **React** |
| `puncao_tempo` | 13 | bespoke intervalos | [tempo](l3-brief-puncao-venosa-e-cuidados-com-cateteres-puncao_tempo.md) | **React** |
| `puncao_periferica_antissepsia` | 19 | bespoke punção periférica | [periferica_antissepsia](l3-brief-puncao-venosa-e-cuidados-com-cateteres-puncao_periferica_antissepsia.md) | **React** |
| `puncao_ipcs_cvc` | 11 | bespoke bundle CVC | [ipcs_cvc](l3-brief-puncao-venosa-e-cuidados-com-cateteres-puncao_ipcs_cvc.md) | **React** |
| `puncao_generico` | 24 | genérico premium | [generico](l3-brief-puncao-venosa-e-cuidados-com-cateteres-puncao_generico.md) | genérico |

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` |
| Afinidade + guards | `lib/slides/moldAffinity.ts` |
| Gap audit / decisões | `lib/slides/l3MoldGapCatalog.ts` |
| Âncoras visuais | `data/catalog-migration/visual-anchors.json` |
| Regressão visual | `e2e/visual-mold-regression.spec.ts` · `artifacts/visual-mold-regression/summary.json` |
| Cluster + volume | `artifacts/puncao-topic-cluster-report.json` |
| Relatório nota-10 | `artifacts/puncao-venosa-nota10-report.md` |

## Docs canônicos

- [`docs/MOLD_AFFINITY_RESOLVER.md`](../docs/MOLD_AFFINITY_RESOLVER.md)
- [`docs/AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](../docs/AGENT_AVANT_TEMPLATES_E_LAYOUT.md)
- [`docs/PROTOCOLO_A4_MINIMO_PUNCAO.md`](../docs/PROTOCOLO_A4_MINIMO_PUNCAO.md)

## Trigger de nova implementação

```text
Mapeamento L3: Punção Venosa e Cuidados com Cateteres
Implementar molde: puncao_<ramo>
```

Gate de volume: **≥5 slugs** no sub-cluster ou pedido flagship.
