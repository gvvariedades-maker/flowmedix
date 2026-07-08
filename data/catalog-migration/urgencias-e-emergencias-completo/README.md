# Urgências e Emergências — handcraft golden-v1 (bootstrap)

**Subtópico:** Urgências e Emergências  
**Modo:** Handcraft golden-v1 (legacy builder → re-handcraft)  
**Status:** **in_progress** — 12/340 âncoras P0 aplicadas · próximo `urgencias-g01` (RCP adulto)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../docs/HANDCRAFT_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs no manifest | 340 (`urgencias-e-emergencias-completo/manifest.json`) |
| Handcraft golden aplicado | 12 (repairs de âncora P0) |
| Âncoras P0 | **12/12** READY — ver [`urgencias-golden-anchors.json`](../urgencias-golden-anchors.json) |
| Playbook | [`handcraft-playbooks/urgencias-e-emergencias.json`](../handcraft-playbooks/urgencias-e-emergencias.json) |
| Cluster | `npm run cluster:urgencias-e-emergencias` |
| Próximo lote | **`urgencias-g01`** — ramo `urgencias_rcp_sbv` (68 slugs) |
| Brief L3 pronto | RCP adulto — `artifacts/l3-brief-urgencias-e-emergencias-urgencias_rcp_sbv.md` |
| Gramática ROI | [`urgencias-pedagogy-errors.json`](../urgencias-pedagogy-errors.json) |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Disparar handcraft

```text
Handcraft: Urgências e Emergências
```

```bash
npm run handcraft:brief -- --subtopico="Urgências e Emergências"
```

## Pipeline por lote (após handcraft)

```bash
npm run validate:goldens -- --lote=urgencias-g01 --strict
npm run audit:questao-readiness -- --lote=urgencias-g01 --strict-v2-pedagogy
npm run audit:slug-alignment -- --lote=urgencias-g01 --strict
npm run audit:numeric-factcheck -- --lote=urgencias-g01
npm run catalog:apply-lote -- --lote=urgencias-g01 --apply
```

## Ramos L3 (playbook)

`urgencias_rcp_sbv` · `urgencias_exceto_conduta` · `urgencias_avc_iam` · `urgencias_xabcde_trauma` · `urgencias_choque` · `urgencias_engasgo` · `urgencias_rcp_pediatrico` · `urgencias_vf_protocolo` · `urgencias_convulsao` · `urgencias_manchester_triagem` · `urgencias_anafilaxia` · `urgencias_queimadura` · `urgencias_generico`
