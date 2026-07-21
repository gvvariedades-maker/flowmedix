# Urgências e Emergências — handcraft golden-v1

**Subtópico:** Urgências e Emergências  
**Modo:** Handcraft golden-v1 (legacy builder → re-handcraft)  
**Status:** **`production_ready`** — **339/339** handcraft · lotes **g01–g49** · vendável desde **2026-07-19**

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../docs/HANDCRAFT_CONVERSA.md) · [`docs/QUALITY_VENDAVEL_CONVERSA.md`](../../docs/QUALITY_VENDAVEL_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs no manifest | 339 (`urgencias-e-emergencias-completo/manifest.json`) |
| Handcraft aplicado | **339/339** (`handcraft-meta.json` · 2026-07-08) |
| `production_status` | **`production_ready`** (2026-07-19) |
| `pacote_prefix` | **`urgencias`** (lotes `urgencias-g{NN}`) |
| Ramos L3 | 13 ramos (`urgencias_rcp_sbv` … `urgencias_generico`) |
| Playbook | [`handcraft-playbooks/urgencias-e-emergencias.json`](../handcraft-playbooks/urgencias-e-emergencias.json) |
| Próximo passo | Monitoramento: `audit:subtopico-health -- --subtopico="Urgências e Emergências"` |
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
