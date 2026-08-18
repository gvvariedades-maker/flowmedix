# Gates: o que o lint cobre

Usar com `audit:questao-readiness --strict-v2-pedagogy`. Contrato normativo: `docs/GOLDEN_CONTENT_STANDARD.md` §7b.

| Regra | Automático? | Código / nota |
|-------|-------------|----------------|
| Gabarito consistente | sim | `gabarito_mismatch` |
| Anti-reciclagem `logic_flow` | sim | `logic_flow_recycled` |
| Spoiler no `golden_rule` | sim (strict) | `golden_rule_gabarito_spoiler` |
| Redundância entre camadas | sim (strict) | `slide_layer_redundancy_*` |
| Especificidade semântica | sim | `specificity_semantic` (≥3 termos) |
| `danger_zone` `correct` únicos | sim | `detectDuplicateDangerJustifications` |
| Cobertura parcial distratores | parcial | `danger_distractors_coverage` — **metade** em `conceito`/`legis`; VF por romanos — **não** basta para ship |
| **Todas** letras erradas + transferência | sim (strict-v2) | `danger_zone_letter_coverage`, `danger_zone_transfer_missing` — labels "Letra X" |
| Densidade §3b (chars) | sim (strict-v2) | `card_density_*` — alvos soft de `detail` ficam no checklist humano |
| Fixação portátil último step | sim (strict-v2) | `logic_flow_fixation_missing` — MCQ com eliminação por letra |
| Corretude clínica factual | **não** | Fonte tier A/B + A4 humano se `risk: alto` |
| Drift de ramo (IPCS/CVC…) | parcial | `detectSlideTopicDrift` — checklist humano reforça |
| Figura/tirinha/charge sem asset | sim (strict-v2) | `l2_missing_figure` — `figures[]` ou `transcribed` + `text_fragment` |

## Risco (A4)

`lib/catalogMigration/riskScoring.ts`:

- `alto` (dose/conduta/protocolo/divergência prova×guideline) → revisão humana A4
- `baixo` / `medio` → agente pode fechar (`a4_reviewer: "agent:golden-v2"`)

## Regra operacional

`[READY]` em handcraft novo **exige** `--strict-v2-pedagogy`.  
Passar só em `lintGoldenContent` sem strict = barra incompleta.

## Âncoras 100% (base / examples)

Checklist executável + assinatura por risco (Writer ≠ aprovador):

```bash
npm run audit:anchor-100 -- --file=examples/questao-premium-….json
npm run audit:anchor-100 -- --file=… --sign-agent --write-meta   # risco baixo/médio
```

Contrato: [`docs/ANCHOR_CHECKLIST_100.md`](../../ANCHOR_CHECKLIST_100.md) · runbook [`PROMPT_ANCORAS_100.md`](../../PROMPT_ANCORAS_100.md).

Voltar ao fluxo: [`SKILL.md`](SKILL.md).
