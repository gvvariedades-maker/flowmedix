# Verificação de Sinais Vitais — handcraft golden-v1

**Subtópico:** Verificação de Sinais Vitais  
**Modo:** Handcraft golden-v1 (legacy builder → re-handcraft)  
**Status:** **in_progress** — 0/354 slugs handcraft (2026-07-04)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/PIPELINE_COMPLETO_CONVERSA.md`](../../docs/PIPELINE_COMPLETO_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Bucket Supabase (pós-classify) | 502 |
| Corpus handcraft (path SV) | 354 (`manifest-handcraft.json`) |
| Ramos L3 fortes | `vitals_pa_tecnica` (196) · `vitals_fc_faixas` (40) |
| Âncora interpretação | [`examples/questao-premium-fepese-sv-interpretacao-valores.json`](../../examples/questao-premium-fepese-sv-interpretacao-valores.json) |
| Âncora FC C/E | [`examples/questao-premium-idecan-fc-radial-ce.json`](../../examples/questao-premium-idecan-fc-radial-ce.json) |
| Guideline | [`lib/guidelines/sinaisVitais.ts`](../../lib/guidelines/sinaisVitais.ts) |
| Playbook v2 | [`handcraft-playbooks/sinais-vitais.json`](../handcraft-playbooks/sinais-vitais.json) |
| Âncoras golden | [`sinais-vitais-anchor-registry.json`](../sinais-vitais-anchor-registry.json) |
| Pedagogy ROI | [`sinais-vitais-pedagogy-errors.json`](../sinais-vitais-pedagogy-errors.json) |
| Cluster | `npm run cluster:sinais-vitais` |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Lote piloto g01

| Slug | Ramo | Tema |
|------|------|------|
| `ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-3` | `vitals_pa_tecnica` | Boas práticas PA (nível coração) |
| `amauc-enfermagem-verificacao-de-sinais-vitais-1779344189558-7` | `vitals_pa_tecnica` | V/F técnica PA |
| `amauc-enfermagem-verificacao-de-sinais-vitais-1779344196733-2` | `vitals_pa_tecnica` | Sequência Korotkoff MS |
| `adm-tec-enfermagem-verificacao-de-sinais-vitais-1779343833455-6` | `vitals_fc_faixas` | Valores normais FC/FR/PA |
| `ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-7` | `vitals_pa_tecnica` | Conduta ante SV alterados |
| `ameosc-enfermagem-verificacao-de-sinais-vitais-1778969760552-0` | `vitals_pa_tecnica` | V/F PA · FR · temperatura |
| `ameosc-enfermagem-verificacao-de-sinais-vitais-1778969760552-1` | `vitals_pa_tecnica` | V/F repouso · oxímetro × palpação |
| `ameosc-enfermagem-verificacao-de-sinais-vitais-1778969760552-7` | `vitals_fc_faixas` | Pulso central (femoral) |

## Comandos

```bash
npm run handcraft:sinais-vitais-g01
npm run validate:goldens -- --lote=sinais-vitais-g01 --strict
npm run audit:questao-readiness -- --lote=sinais-vitais-g01 --strict-v2-pedagogy
```

Apply Supabase somente após **"pode aplicar"** do operador.
