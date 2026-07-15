# Vias de Administração — índice de briefs L3 (3 ramos)

**Subtópico:** Vias de Administração · **208 slugs** · `production_ready` · onda nota-10 (2026-07-14)

Política: cada ramo documenta **metáfora visual ↔ erro pedagógico**. Bespoke React no ramo dominante (`via_vf_absorcao`); técnica e cauda usam pacote semântico genérico premium até volume justificar redesign.

| Ramo | Slugs (catálogo) | Pacote L3 | Brief | Implementação |
|------|------------------|-----------|-------|---------------|
| `via_vf_absorcao` | 98 | bespoke absorção | [via_vf_absorcao](l3-brief-vias-de-administracao-via_vf_absorcao.md) | **React** (speed-rail · reference-board · vf-juggle · route-trap) |
| `via_tecnica_admin` | 85 | genérico premium | [via_tecnica_admin](l3-brief-vias-de-administracao-via_tecnica_admin.md) | genérico |
| `via_generico` | 24 | genérico premium | [via_generico](l3-brief-vias-de-administracao-via_generico.md) | genérico |

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` |
| Afinidade + guards | `lib/slides/moldAffinity.ts` |
| Gap audit / decisões | `lib/slides/l3MoldGapCatalog.ts` |
| Regressão visual | `e2e/visual-mold-regression.spec.ts` · `artifacts/visual-mold-regression/summary-vias-de-administracao.json` |
| Cluster + volume | `artifacts/vias-de-administracao-topic-cluster-report.json` |
| Relatório nota-10 | `artifacts/vias-de-administracao-nota10-report.md` |

## Docs canônicos

- [`docs/MOLD_AFFINITY_RESOLVER.md`](../docs/MOLD_AFFINITY_RESOLVER.md)
- [`docs/AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](../docs/AGENT_AVANT_TEMPLATES_E_LAYOUT.md) — §6.8 Vias
- [`artifacts/l3-mapeamento-vias-de-administracao.md`](l3-mapeamento-vias-de-administracao.md)

## Trigger de nova implementação

```text
Mapeamento L3: Vias de Administração
Implementar molde: via_<ramo>
```

Gate bespoke adicional: **≥10%** no sub-cluster técnica **e** drift visual em `audit:subtopico-quality` — hoje `via_tecnica_admin` permanece genérico (decisão P1 documentada).
