# BRIEF DE VARIANTES — Cuidados na Administração de Medicamentos / cam_exceto_conduta

**Gerado:** 2026-07-10  
**Política:** `molde_redesign` (EXCETO/INCORRETA — rail semântico)  
**Família:** `certo_errado`  
**Template:** `teal`  
**Âncoras:** `questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json` · `questao-premium-cpcon-cuidados-incorreta-nove-certos.json`  
**Cluster:** INCORRETA / EXCETO · ~9 slugs · gate `cam_exceto_semantic`

## Pacote 4/4

| Slide | `layout_variant` | Componente |
|-------|------------------|------------|
| concept_map | `cam-exceto-rail` | `CamExcetoRailConceptMap.tsx` |
| golden_rule | `cam-exceto-reference-board` | `GoldenRuleCamExcetoReferenceBoard.tsx` |
| logic_flow | `cam-exceto-tap-flow` | `LogicFlowCamExcetoTapFlow.tsx` |
| danger_zone | `cam-exceto-trap-arena` | `DangerZoneCamExcetoTrapArena.tsx` |

**Gramática:** cada distrator descreve conduta correta; só o gabarito é a exceção. Slots: preparo, VO+SF, prescrição à mão, higiene.
