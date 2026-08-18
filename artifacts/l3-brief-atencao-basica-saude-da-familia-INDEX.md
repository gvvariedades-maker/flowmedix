# L3 brief INDEX — Atenção Básica / Saúde da Família

**Pacote:** `atencao-basica-saude-da-familia`  
**Cluster:** `artifacts/atencao-basica-saude-da-familia-topic-cluster-report.json` (2026-08-01)  
**Total:** 171 · **Limiar forte:** 18  
**Template visual base:** emerald (`SUBTOPIC_DESIGN_MAP`)

## Ramos

| `branch_id` | Slugs (cluster) | Forte? | Decisão L3 | Brief |
|-------------|----------------:|:------:|------------|-------|
| `ab_acs_territorio` | 66 | sim | `ok_generico` | — (teste espacial 3/3: texto×texto + compare) |
| `ab_esf_composicao` | 18 | sim | `molde_inedito` | [`l3-brief-…-ab_esf_composicao.md`](l3-brief-atencao-basica-saude-da-familia-ab_esf_composicao.md) |
| `ab_pnab_principios` | 6 | não | `ok_generico` | — |
| `ab_vigilancia_ads` | 6 | não | `ok_generico` | — |
| `ab_te_aps` | 5 | não | `ok_generico` | — |
| `ab_generico` | 70 | volume | `cauda_longa` / `ok_generico` | — |

## Drift (absorver / revisar)

| Cluster | n | Ação |
|---------|--:|------|
| Soft segment fora do pacote | 3 | Manter se `meta.subtopico` canônico; exclusão só se conteúdo fora de AB |
| Imunização (drift?) | 1 | Revisar no Classify / exclude se PNI puro |

## Teste espacial — `ab_acs_territorio` (rebaixado)

1. Pegadinha só texto×texto? **Sim** (atribuição ACS vs TE/enfermeiro).
2. Volume <5 e <10%? **Não** (66 / 38%).
3. `compare` + `rows` / `tap` bastam? **Sim**.

→ **Não** exige Fase 3b (Q1+Q3 = genérico suficiente apesar do volume).

## Gate Fase 0 / 3b

- [x] Cluster report
- [x] Ramos em `BRANCH_DESIGN_MAP` + `inferAbBranch`
- [x] Brief 4/4 do único `molde_inedito` (`ab_esf_composicao`)
- [ ] React bespoke — só com `Implementar molde: ab_esf_composicao`
- [ ] Golden âncoras (Fase 0.5) — `audit:golden-anchor-gate`

**Próximo:** âncoras → handcraft `g01` (priorizar `ab_acs_territorio` / genérico emerald).
