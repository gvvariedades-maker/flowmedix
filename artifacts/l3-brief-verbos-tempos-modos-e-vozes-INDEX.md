# L3 — Verbos — tempos, modos e vozes (INDEX)

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Verbos — tempos, modos e vozes |
| `pacote_prefix` | `verbos-tempos-modos-e-vozes` |
| Card vitrine | B — Morfologia |
| Slugs | 45 (6 lotes g01–g06) |
| Playbook | `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json` |
| Guideline | `lib/guidelines/linguaPortuguesa/verbos.ts` |

## Ramos L3

| `branch_id` | Slugs | Decisão L3 | Brief | React bespoke |
|-------------|------:|------------|-------|---------------|
| `pt_verbos` | 45 | `ok_generico` | [`l3-brief-lingua-portuguesa-pt_verbos.md`](l3-brief-lingua-portuguesa-pt_verbos.md) | — (dispensado) |

## Teste espacial 3/3 (`pt_verbos`)

| Pergunta | Resposta |
|----------|----------|
| O erro da banca é **espacial** (tempo/modo/voz confundidos)? | Parcial — ensinável com tabela + eliminação tap |
| `morphological` + `reference_table` + `tap` + `compare` fixam a pegadinha? | **Sim** — pergunta-teste M14 + rows de tempo/modo |
| Bespoke React (`pt-verbos-timeline` etc.) agrega retenção proporcional? | **Não** — custo > ganho para 45 slugs morfologia |

**Decisão:** `ok_generico` — Modo A handcraft com metáfora **Linha do tempo verbal** (ver brief ramo).

## Retenção visual (avant-neuroslides-visual)

| Slide | Gesto | Layout auto |
|-------|-------|-------------|
| `concept_map` | 3–4 núcleos: tempo · modo · voz · pegadinha | `morphological` |
| `logic_flow` | Pergunta-teste → eliminar letras → gabarito | `tap` |
| `golden_rule` | rows: tempos/modos/vozes portáteis | `reference_table` |
| `danger_zone` | compare: erro × correção por letra | `compare` |

## Gates bootstrap

- [x] `cluster:lingua-portuguesa` — 45 slugs card Verbos
- [x] `extract_pt_verbos_completo.py` + manifest + lotes g01–g06
- [x] Registry `handcraft-registry.json`
- [x] Brief ramo `pt_verbos` (ok_generico)
- [ ] `audit:taxonomy-gate` — rodar antes g01
- [ ] `audit:golden-anchor-gate` — warn OK (sem âncora obrigatória ramo ok_generico)

## Próximo worker

`handcraft_lote:verbos-tempos-modos-e-vozes-g01` — SDK `--mode=handcraft --verify --max-units=1`
