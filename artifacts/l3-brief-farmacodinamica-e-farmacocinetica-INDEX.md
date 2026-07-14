# Farmacodinâmica e Farmacocinética — índice de briefs L3 (3 ramos)

**Subtópico:** Farmacodinâmica e Farmacocinética · **13 slugs** · `production_ready` · onda nota-10 (2026-07-14)

Relatório: [`artifacts/farmacodinamica-nota10-report.md`](farmacodinamica-nota10-report.md) · README pacote: [`data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/README.md`](../data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/README.md)

Política: ramo forte com erro espacial → brief 4/4 antes de React; cauda longa e ramo genérico → pacote semântico premium (`rows`, `correct`, `reveal_mode: tap`).

| Ramo | Slugs | % | Decisão L3 | Brief | Implementação |
|------|-------|---|------------|-------|---------------|
| `farmaco_clinico_protocolo` | 6 | 46% | `molde_redesign` | [clinico_protocolo](l3-brief-farmacodinamica-e-farmacocinetica-farmaco_clinico_protocolo.md) | **React** (4 moldes bespoke) |
| `farmaco_pk_pd_vf` | 1 | 8% | bespoke âncora ADME | [pk_pd_vf](l3-brief-farmacodinamica-e-farmacocinetica-farmaco_pk_pd_vf.md) | **React** (`adme-journey-rail`) |
| `farmaco_generico` | 6 | 46% | `ok_generico` | [generico](l3-brief-farmacodinamica-e-farmacocinetica-farmaco_generico.md) | genérico |

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` |
| Gap audit / decisões | `lib/slides/l3MoldGapCatalog.ts` |
| Golden anchors | `data/catalog-migration/farmacodinamica-golden-anchors.json` |
| Guideline | `lib/guidelines/farmacodinamica.ts` |
| Cluster + volume | `artifacts/farmacodinamica-topic-cluster-report.json` |
| Gap audit | `artifacts/l3-mold-gap-audit.json` |
| Playbook handcraft | `data/catalog-migration/handcraft-playbooks/farmacodinamica-e-farmacocinetica.json` |
| L3 regressão | `e2e/visual-mold-regression.spec.ts` — **7/7 PASS** |

## Docs canônicos

- [`docs/MOLD_AFFINITY_RESOLVER.md`](../docs/MOLD_AFFINITY_RESOLVER.md)
- [`docs/PROMPT_VARIANTES_NEUROSLIDES.md`](../docs/PROMPT_VARIANTES_NEUROSLIDES.md)
- [`docs/L3_MAPEAMENTO_CONVERSA.md`](../docs/L3_MAPEAMENTO_CONVERSA.md)
- [`docs/PROTOCOLO_A4_MINIMO_FARMACODINAMICA.md`](../docs/PROTOCOLO_A4_MINIMO_FARMACODINAMICA.md)

## Triggers

```text
Implementar molde: farmaco_clinico_protocolo
Handcraft: Farmacodinâmica e Farmacocinética
Qualidade vendável: Farmacodinâmica e Farmacocinética
```

Gate de volume sugerido: **≥5 slugs** no ramo (`max(5, ceil(total×0,10))`).
