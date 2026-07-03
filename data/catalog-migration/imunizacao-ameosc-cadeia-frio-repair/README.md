# Imunização — repair AMEOSC cadeia de frio (V/F)

**Subtópico:** Imunização  
**Modo:** Handcraft golden-v1 — repair pontual (1 slug)  
**Status:** **applied** (2026-07-02) — re-sync spoiler L2 (`golden_rule` sem letra gabarito)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Questão documentada

| Campo | Valor |
|-------|--------|
| Slug | `ameosc-enfermagem-processo-de-enfermagem-1780005791580-3` |
| Vitrine | **Q-4611** |
| Golden | [`examples/questao-premium-ameosc-imunizacao-vf-cadeia-frio.json`](../../../examples/questao-premium-ameosc-imunizacao-vf-cadeia-frio.json) |
| Banca / ano | AMEOSC 2026 |
| Comando | Sequência V/F (I–IV) — sala de vacina |
| Gabarito | **C** — V, F, V, F |
| Cluster | Cadeia de frio / conservação / SI-PNI |
| Ramo L3 | `imunizacao_cadeia_frio` |
| Player | `/estudar/ameosc-enfermagem-processo-de-enfermagem-1780005791580-3` |

## Pipeline (reaplicar)

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-ameosc-imunizacao-vf-cadeia-frio.json
npm run catalog:apply-lote -- --lote=imunizacao-ameosc-cadeia-frio-repair --dry-run
npm run catalog:apply-lote -- --lote=imunizacao-ameosc-cadeia-frio-repair --apply
```

**Não usar:** `ai:generate` · `catalog:upgrade-premium`
