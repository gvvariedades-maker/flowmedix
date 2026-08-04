# NeuroSlides — scorecard de variantes (gesto × clique × ramo)

Gerado por `scripts/audit-variant-click-scorecard.ts`.

**CSV:** [`neuroslides-variant-click-scorecard.csv`](./neuroslides-variant-click-scorecard.csv)

## Totais

| Métrica | Valor |
|---------|------:|
| Variantes (bespoke + genéricos) | 304 |
| concept_map | 82 |
| logic_flow | 74 |
| golden_rule | 73 |
| danger_zone | 75 |
| click **high** (score 3) | 33 |
| click **medium** (score 2) | 190 |
| click **low** (score 1) | 81 |
| high sem ramo no BRANCH_DESIGN_MAP | 9 |

## Por gesto

| Gesto | Qtde |
|-------|-----:|
| matrix_board | 65 |
| arena_trap | 65 |
| funnel | 58 |
| deck | 35 |
| rail | 27 |
| list_cards | 15 |
| weave_juggle | 11 |
| timeline | 10 |
| spectrum | 8 |
| orbit_hub | 4 |
| compare | 3 |
| curtain_gate | 2 |
| other | 1 |

## Top high-click (mapeados a ramo)

| Tipo | Variante | Ramos |
|------|----------|-------|
| concept_map | `cold-chain-hub` | imunizacao_cadeia_frio |
| concept_map | `crianca-dehydration-spectrum` | crianca_desidratacao |
| concept_map | `crianca-pediatric-hub` | crianca_generico |
| concept_map | `iv-bundle-orbit` | puncao_ipcs_cvc |
| concept_map | `iv-complication-tissue-layers` | puncao_flebite |
| concept_map | `iv-exceto-spectrum` | puncao_exceto |
| concept_map | `mulher-contraception-spectrum` | mulher_planejamento |
| concept_map | `mulher-mammography-spectrum` | mulher_mama |
| concept_map | `mulher-screening-spectrum` | mulher_papanicolau |
| concept_map | `respiratorio-asma-dpoc-duel-deck` | respiratorio_dpoc_oxigenio, respiratorio_vf_asma_dpoc |
| concept_map | `urgencias-emergency-hub` | urgencias_generico |
| concept_map | `urgencias-manchester-spectrum` | urgencias_manchester_triagem |
| golden_rule | `etiology-letter-spectrum` | bacterianas_agente_etiologico |
| golden_rule | `iv-bundle-mesh-reveal` | puncao_ipcs_cvc |
| golden_rule | `soft-lens-board` | calc_dose_equivalencia |
| logic_flow | `biosseg-vf-juggle-tap` | biosseg_generico |
| logic_flow | `cam-vf-juggle-tap` | cam_certos_vf_caso |
| logic_flow | `farmaco-vf-juggle-tap` | farmaco_pk_pd_vf |
| logic_flow | `peri-vf-juggle-tap` | perioperatorio_vf |
| logic_flow | `pni-vf-juggle-tap` | imunizacao_vf_intervalos |
| logic_flow | `respiratorio-vf-juggle-tap` | respiratorio_vf_asma_dpoc |
| logic_flow | `sp-vf-juggle-tap` | sp_identificacao |
| logic_flow | `trabalho-vf-juggle-tap` | trabalho_pep_trap, trabalho_vf_nr32 |
| logic_flow | `via-vf-juggle-tap` | via_vf_absorcao |

## Legenda click_cost

| Nível | Score | Significado |
|-------|------:|------------|
| low | 1 | Scan / tabela / cards sem reveal obrigatório |
| medium | 2 | Tap sequential (N steps) ou arena 1-tap/item |
| high | 3 | Cortina, weave/juggle, espectro, consent-gate / multi-camada |

**Nota:** custo real do `logic_flow` também depende do nº de `steps` no JSON (handcraft).
