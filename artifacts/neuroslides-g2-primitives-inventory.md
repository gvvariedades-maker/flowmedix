# NeuroSlides G2 — Inventário: variants sem primitives + prioridade

**Data:** 2026-08-04  
**Barra:** [`docs/NEUROSLIDES_VISUAL_BAR.md`](../docs/NEUROSLIDES_VISUAL_BAR.md)  
**Raw JSON:** [`neuroslides-g2-primitives-inventory-raw.json`](neuroslides-g2-primitives-inventory-raw.json)  
**Escopo escaneado:** `components/slides/variants/*.tsx` + `logicFlowShells/*.tsx` (**270** arquivos)

---

## Resumo executivo

| Tier | Significado | Qtd |
|------|-------------|----:|
| **A** | Import **direto** de `primitives/` | **19** |
| **B** | Só via **shell** (`LogicFocus` / `Rail` / `Isolate`) | **13** |
| **B2** | Via **SoftLens** (wrapper → `GoldenRuleSoftLensBoard` → primitives) | **23** |
| **C** | **Sem** primitives nem shell/SoftLens | **~219** efetivos |

**Leitura:** ~14% do catálogo de variants já está no trilho G2 (A+B+B2). O resto ainda é UI ad-hoc. O maior ROI **não** é migrar 219 arquivos um a um — P0 fechado (FocusShell + 3 genéricos no trilho). Próximo: P1 logic_tap → shells, depois encaixar tap-flows restantes nos shells.

---

## Tier A — já em primitives (manter / ratchet)

| Arquivo |
|---------|
| `ConceptMapAdolescentCarePillarsDeck.tsx` |
| `GoldenRuleAdolescentSpeakBarrierBoard.tsx` |
| `LogicFlowAdolescentExcetoIsolateBoard.tsx` |
| `DangerZoneAdolescentExcetoCompare.tsx` |
| `LogicFlowPniExcetoIsolateBoard.tsx` |
| `DangerZonePniExcetoCompare.tsx` |
| `GoldenRulePniCalendarBoard.tsx` |
| `UrgenciasXabcdeRailConceptMap.tsx` |
| `AdmeJourneyRailConceptMap.tsx` |
| `LogicFlowPtCraseFunnelBoard.tsx` |
| `GoldenRulePtCraseFunnelBoard.tsx` |
| `DangerZonePtCraseTrapArena.tsx` |
| `GoldenRuleSoftLensBoard.tsx` |
| `LogicIsolateShell.tsx` |
| `ConceptMap.tsx` |
| `GoldenRule.tsx` |
| `DangerZone.tsx` |
| `LogicFocusShell.tsx` |
| `LogicRailShell.tsx` |

**Status shells:** `LogicFocusShell` portado para BoardChrome + PolarityPanel (2026-08-04). Rail + Isolate já em primitives.

---

## Tier B — via shell (herdam Focus/Rail/Isolate)

Inclui: `LogicFlow.tsx` (genérico), `LogicFlowStepLadder.tsx`,  
`LogicFlowUrgenciasXabcdeTapFlow`, RCP, Protocol, SpProtocol, FarmacoProtocol,  
`LogicFlowCamExcetoTapFlow`, `LogicFlowIvExcetoTapFlow`, `LogicFlowUrgenciasExcetoTapFlow`,  
`LogicFlowBurnTriageTapFlow`, `LogicFlowWoundPrepTapFlow`.

**Efeito:** quando `LogicFocusShell` subir para G2, **LogicFlow genérico + StepLadder + esses taps** sobem juntos.

---

## Tier B2 — SoftLens wrappers (já herdam SoftLens → primitives)

23 boards (`GoldenRule*ReferenceBoard` / params / Heimlich / Via / etc.) só reexportam `GoldenRuleSoftLensBoard`.  
**Ação:** nenhuma migração estrutural; SoftLens já está no kit.

---

## Tier C — prioridade de migração

### P0 — Genéricos + FocusShell (máximo ROI)

| Item | Por quê | Ação sugerida |
|------|---------|----------------|
| **`LogicFocusShell`** | ✅ feito (2026-08-04) | BoardChrome + PolarityPanel + CategoryStrip |
| **`ConceptMap.tsx`** | ✅ feito (2026-08-04) | BoardChrome + PillarDeck / LabelBodyRow |
| **`GoldenRule.tsx`** | ✅ feito (2026-08-04) | BoardChrome + LabelBodyRow / PolarityPanel |
| **`DangerZone.tsx`** | ✅ feito (2026-08-04) | BoardChrome + PolarityPanel + AlertCallout |

**Estimativa de impacto:** dezenas a centenas de questões por render path, **sem** re-handcraft.

### P1 — 37 logic_tap ainda fora de shell

- VF juggle: Biosseg, Cam, Farmaco, Peri, Pni, Respiratorio, Seguranca, Trabalho, Via  
- Mulher: Labor, Mama, Planejamento, Prenatal, Puerperio, Screening  
- IV: Bundle, Complication, Device, Interval, Puncture  
- Outros: Etiology, MentalCrisis, Peri Preop/Protocol/Srpa, PniCalendarElimination, Pt (Clitic/Comma/CraseFunnel/Term), Tb, Urgencias (Choking/Pediatric/Shock/Stroke), CriancaShared, CamAltoRisco  

**Ação:** EXCETO → `LogicIsolateShell` · protocolo → `LogicRailShell` · funil/eliminação → `LogicFocusShell` (após P0).

### P2 — Arenas e boards bespoke

| Kind | ~Qtd | Ação |
|------|-----:|------|
| `danger_arena` | 52 | `PolarityPanel` + `TwoColumnBoard` |
| `golden_board` (não SoftLens) | ~33 | `LabelBodyRow` / SoftLens se tabela |
| `concept_bespoke` | 67 | `PillarDeck` / `ProtocolRailRow` quando couber |

Só criar variant React nova se gesto **novo** ou ≥5 questões.

### P3 — Cauda

`logic_bespoke` (~13), `danger_bespoke` (~9), `other` (~5): Fábrica do pacote ou deprecate órfãos.

---

## Ordem de execução recomendada

```text
1. LogicFocusShell → primitives/G2          ✅
2. ConceptMap + GoldenRule + DangerZone genéricos → primitives  ✅
3. Envolver logic_tap → shells — lotes 1–5 ✅; próximo: SoftStack opcional
4. Fábrica: arenas/boards por pacote com visual_bar: pass
5. Inventário de IDs órfãos → deprecate
```

**Proibido:** trocar os 4 `type`; re-handcraft em massa; 1 React por print.

---

## Contagens por kind (Tier C bruto)

| Kind | Count |
|------|------:|
| concept_bespoke | 67 |
| golden_board | 56 (inclui SoftLens wrappers — ver B2) |
| danger_arena | 52 |
| logic_tap | 37 |
| logic_bespoke | 13 |
| danger_bespoke | 9 |
| other | 5 |
| core_generic | 0 (ConceptMap / GoldenRule / DangerZone → Tier A) |

---

## P1 lote 1 (2026-08-04) — logic_tap → shells

| Arquivo | Shell |
|---------|-------|
| `LogicFlowItuExcetoTap` | Isolate |
| `LogicFlowAdolescentExcetoIsolateTap` | Isolate |
| `LogicFlowPeriProtocolTapFlow` | Rail |
| `LogicFlowPeriPreopDecisionTap` | Focus |
| `LogicFlowPeriSrpaDecisionTap` | Focus |
| `LogicFlowMentalCrisisDecisionTap` | Focus |
| `LogicFlowMentalRapsClassifyTap` | Focus |
| `LogicFlowEtiologyEliminationTap` | Focus |

**Próximo lote P1:** Mulher (6 taps com letter juggle + headerSlot), VF hub (`PniVfJuggleTap`), PNI calendar/cold-chain, Tb VF.

---

## P1 lote 2 (2026-08-04) — Mulher + VF hub

| Arquivo | Shell / chassis |
|---------|-----------------|
| `LogicFlowMulherLaborTapFlow` | Focus + `LetterEliminationRail` (`renderHeader`) |
| `LogicFlowMulherPrenatalTapFlow` | Focus + letter rail |
| `LogicFlowMulherMamaTapFlow` | Focus + letter rail |
| `LogicFlowMulherScreeningTapFlow` | Focus + letter rail |
| `LogicFlowMulherPlanejamentoTapFlow` | Focus + letter rail |
| `LogicFlowMulherPuerperioTapFlow` | Focus + letter rail |
| `LogicFlowPniVfJuggleTap` (+ clones Via/Cam/…) | BoardChrome + PolarityPanel (mantém Julgar/resumo) |

**Novo no kit:** `logicFlowShells/LetterEliminationRail.tsx` · `LogicFocusShell.renderHeader`.

**Lotes 3–4:** ver seções abaixo. Próximo: SoftStack opcional.

## P1 lote 3 (2026-08-04) — PNI calendar/cold + Tb VF

| Arquivo | Shell / chassis |
|---------|-----------------|
| `LogicFlowPniCalendarEliminationTap` | Focus + `LetterEliminationRail` + month chips |
| `LogicFlowPniColdChainTap` | Focus + letter rail (MCQ) / chips °C (V/F) |
| `LogicFlowTbVfEliminationTap` | Focus + `RomanVfStatusRail` (I–III) |

**Novo no kit:** `logicFlowShells/RomanVfStatusRail.tsx` · `letterEliminationFromSteps` aceita `catchup_eliminate`.

**Lotes 4–5:** ver seções abaixo.

## P1 lote 4 (2026-08-04) — Adolescente VF/Z + Vitals

| Arquivo | Shell / chassis |
|---------|-----------------|
| `LogicFlowAdolescentVfWeaveTap` | BoardChrome + PolarityPanel (fios I/II/III) |
| `LogicFlowAdolescentZClassifyTap` | Focus + trilho Z + `LetterEliminationRail` |
| `LogicFlowVitalsTranslateTap` | BoardChrome + CriticalNumber + PolarityPanel (Traduzir) |

**Lote 5:** ver seção abaixo.

## P1 lote 5 (2026-08-04) — Pt taps (crase/clítico/vírgula/termo)

| Arquivo | Shell / chassis |
|---------|-----------------|
| `LogicFlowPtCraseFunnelTapFlow` | Board (quando fecha) · senão Focus + `LetterEliminationRail` |
| `LogicFlowPtCliticRailTapFlow` | Board posição (quando fecha) · senão Focus + letter rail |
| `LogicFlowPtCommaRailTapFlow` | Focus + letter rail |
| `LogicFlowPtTermMatrixTapFlow` | Focus + letter rail + chip T1/T2 |

**Novo no kit:** `letterStepsFromPtRoles` · `eliminar_letra`/`gabarito` no letter rail.

**Próximo lote P1:** SoftStack cauda (opcional) · IV/Urgencias residual se ainda fora de shell.

## P1 lote 6 (2026-08-04) — SoftStack legado (cauda)

| Arquivo | Shell / chassis |
|---------|-----------------|
| `LogicFlowSoftStack` (`iv-care-soft-stack`) | Focus (sem deck pastel / emoji) |
| `LogicFlowLabVfSoftStack` (`lab-vf-soft-stack`) | Focus + `RomanVfStatusRail` — remove hardcode letra D |

**Ratchet:** skin G2 BoardChrome; 0 gabarito no TSX; IDs de layout_variant intactos.

**P1 cauda SoftStack:** fechada. Próximo ROI P1: IV taps restantes · Urgencias cauda (se ainda fora de shell).

