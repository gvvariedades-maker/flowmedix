# L3 Brief INDEX — Noções de Anatomia

**Gerado:** 2026-08-03  
**Pacote:** `nocoes-de-anatomia`  
**Total slugs:** 46 · **Limiar ramo forte:** 5 (`max(5, ceil(10%))`)  
**Cluster:** `artifacts/nocoes-de-anatomia-topic-cluster-report.json`  
**Guideline:** `lib/guidelines/anatomiaBasica.ts`

## Decisão por ramo

| branch_id | count | % | Decisão L3 | Brief 4/4 | Próximo |
|-----------|------:|--:|------------|-----------|---------|
| `anat_terminologia_planos` | 15 | 32.6 | **molde_inedito** | [brief](l3-brief-nocoes-de-anatomia-anat_terminologia_planos.md) | Handcraft com ANAT_GENERIC_DESIGN (rose); React só com `Implementar molde: anat_terminologia_planos` |
| `anat_esqueleto` | 14 | 30.4 | ok_generico | — | Handcraft genérico premium + âncora |
| `anat_cardiovascular` | 7 | 15.2 | ok_generico | — | Handcraft genérico + âncora |
| `anat_generico` | 7 | 15.2 | ok_generico | — | Handcraft genérico + âncora |
| `anat_muscular` | 2 | 4.3 | ok_generico (cauda) | — | Absorver / genérico |
| `anat_cavidades` | 1 | 2.2 | ok_generico (cauda) | — | Genérico |

## GATE Fase 0 / 3b

- [x] Export completo authority 46
- [x] Cluster report (`npm run cluster:anatomia`)
- [x] Brief 4/4 no ramo `molde_inedito` (terminologia)
- [x] BRANCH_DESIGN_MAP + `inferAnatBranch` (ANAT_GENERIC_DESIGN rose)
- [x] Âncoras golden (`audit:golden-anchor-gate`) — em andamento nesta conversa
- [x] Handcraft g01 (dry-run OK; apply pendente) (sem `--apply` até "pode aplicar")

## Comandos

```bash
npm run cluster:anatomia
npm run plan:anatomia-batches
npm run audit:golden-anchor-gate -- --subtopico="Noções de Anatomia"
```

## Status onda1-anatomia (2026-08-03)

- [x] Taxonomia closed
- [x] Playbook + lote_size=8 + gNN
- [x] L3 INDEX + brief terminologia
- [ ] 4 âncoras READY + gate pass/warn
- [ ] g01 dry-run

