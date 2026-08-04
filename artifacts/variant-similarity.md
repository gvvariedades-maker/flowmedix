# Variant similarity - clusters estruturais

Gerado em: 2026-07-31T02:52:50.510Z
Arquivos: 260
Clusters: 168
Singletons: 128
Candidatos a fusao: 38

Assinatura = `family|props|wrappers|top-classes`. Diferencas de rotulo/cor pequenas ainda podem fundir na Onda 3 se o gesto pedagogico for o mesmo.

## Candidatos a fusao (size >= 2)

### c001 - ReferenceBoard (n=15)

- signature: `ReferenceBoard|props:content,footerRule,rows,theme|wrap:GoldenRuleSoftLensBoard|cls:∅`
- wrappers: `GoldenRuleSoftLensBoard`
- props: `content`, `footerRule`, `rows`, `theme`
- nota: Thin SoftLens wrappers - fusao tipicamente 1 prop de hintProfile/accent.
- arquivos:
  - `GoldenRuleBiossegReferenceBoard.tsx`
  - `GoldenRuleCamExcetoReferenceBoard.tsx`
  - `GoldenRuleFarmacoClinicoReferenceBoard.tsx`
  - `GoldenRuleIstReferenceBoard.tsx`
  - `GoldenRuleIvDeviceReferenceBoard.tsx`
  - `GoldenRulePkPdReferenceBoard.tsx`
  - `GoldenRuleRespiratorioSpo2ReferenceBoard.tsx`
  - `GoldenRuleSaeReferenceBoard.tsx`
  - `GoldenRuleSpNspReferenceBoard.tsx`
  - `GoldenRuleTrabalhoNr32ReferenceBoard.tsx`
  - `GoldenRuleUrgenciasExcetoReferenceBoard.tsx`
  - `GoldenRuleUrgenciasProtocolReferenceBoard.tsx`
  - `GoldenRuleUrgenciasShockReferenceBoard.tsx`
  - `GoldenRuleUrgenciasTraumaReferenceBoard.tsx`
  - `GoldenRuleViaReferenceBoard.tsx`

### c002 - TapFlow (n=12)

- signature: `TapFlow|props:revealMode,steps,text,theme|wrap:LogicFlowStepLadder|cls:∅`
- wrappers: `LogicFlowStepLadder`
- props: `revealMode`, `steps`, `text`, `theme`
- nota: Thin StepLadder wrappers - fusao tipicamente 1 prop de accent.
- arquivos:
  - `LogicFlowCamExcetoTapFlow.tsx`
  - `LogicFlowFarmacoProtocolTapFlow.tsx`
  - `LogicFlowIvComplicationTapFlow.tsx`
  - `LogicFlowIvDeviceTapFlow.tsx`
  - `LogicFlowSpProtocolTapFlow.tsx`
  - `LogicFlowUrgenciasChokingTapFlow.tsx`
  - `LogicFlowUrgenciasExcetoTapFlow.tsx`
  - `LogicFlowUrgenciasPediatricTapFlow.tsx`
  - `LogicFlowUrgenciasProtocolTapFlow.tsx`
  - `LogicFlowUrgenciasRcpTapFlow.tsx`
  - `LogicFlowUrgenciasShockTapFlow.tsx`
  - `LogicFlowUrgenciasXabcdeTapFlow.tsx`

### c003 - LogicFlow* (n=7)

- signature: `LogicFlow*|props:steps,text|wrap:∅|cls:∅`
- props: `steps`, `text`
- arquivos:
  - `LogicFlowBiossegVfJuggleTap.tsx`
  - `LogicFlowFarmacoVfJuggleTap.tsx`
  - `LogicFlowPeriVfJuggleTap.tsx`
  - `LogicFlowRespiratorioVfJuggleTap.tsx`
  - `LogicFlowSegurancaVfJuggleTap.tsx`
  - `LogicFlowTrabalhoVfJuggleTap.tsx`
  - `LogicFlowViaVfJuggleTap.tsx`

### c004 - TapFlow (n=6)

- signature: `TapFlow|props:footerRule,steps,text,theme|wrap:∅|cls:flex,items-center,justify-center,gap-2,rounded-full,text-xs`
- props: `footerRule`, `steps`, `text`, `theme`
- arquivos:
  - `LogicFlowMulherLaborTapFlow.tsx`
  - `LogicFlowMulherMamaTapFlow.tsx`
  - `LogicFlowMulherPlanejamentoTapFlow.tsx`
  - `LogicFlowMulherPrenatalTapFlow.tsx`
  - `LogicFlowMulherPuerperioTapFlow.tsx`
  - `LogicFlowMulherScreeningTapFlow.tsx`

### c005 - Board (n=5)

- signature: `Board|props:content,footerRule,rows,theme|wrap:GoldenRuleSoftLensBoard|cls:∅`
- wrappers: `GoldenRuleSoftLensBoard`
- props: `content`, `footerRule`, `rows`, `theme`
- nota: Thin SoftLens wrappers - fusao tipicamente 1 prop de hintProfile/accent.
- arquivos:
  - `GoldenRuleIvDifferentialBoard.tsx`
  - `GoldenRuleUrgenciasCincinnatiBoard.tsx`
  - `GoldenRuleUrgenciasHeimlichBoard.tsx`
  - `GoldenRuleUrgenciasPediatricParamsBoard.tsx`
  - `GoldenRuleUrgenciasRcpParamsBoard.tsx`

### c006 - TrapArena (n=5)

- signature: `TrapArena|props:content,footerRule,items,theme|wrap:∅|cls:flex,items-center,text-sm,border,justify-center,py-3`
- props: `content`, `footerRule`, `items`, `theme`
- nota: TrapArena sem wrapper compartilhado detectado - revisar manualmente.
- arquivos:
  - `DangerZoneUrgenciasChokingTrapArena.tsx`
  - `DangerZoneUrgenciasProtocolTrapArena.tsx`
  - `DangerZoneUrgenciasShockTrapArena.tsx`
  - `DangerZoneUrgenciasStrokeTrapArena.tsx`
  - `DangerZoneUrgenciasTraumaTrapArena.tsx`

### c007 - ConceptMap (n=4)

- signature: `ConceptMap|props:concepts,footerRule,theme|wrap:∅|cls:flex,border,via-white,gap-2,grid,items-center`
- props: `concepts`, `footerRule`, `theme`
- arquivos:
  - `PtCliticRailDeckConceptMap.tsx`
  - `PtCommaRailDeckConceptMap.tsx`
  - `PtCraseFunnelDeckConceptMap.tsx`
  - `PtTermMatrixDeckConceptMap.tsx`

### c008 - TapFlow (n=4)

- signature: `TapFlow|props:revealMode,steps,theme|wrap:LogicFlowStepLadder|cls:∅`
- wrappers: `LogicFlowStepLadder`
- props: `revealMode`, `steps`, `theme`
- nota: Thin StepLadder wrappers - fusao tipicamente 1 prop de accent.
- arquivos:
  - `LogicFlowIvBundleTapFlow.tsx`
  - `LogicFlowIvExcetoTapFlow.tsx`
  - `LogicFlowIvIntervalTapFlow.tsx`
  - `LogicFlowIvPunctureTapFlow.tsx`

### c009 - Trap (n=4)

- signature: `Trap|props:compareRevealMode,content,footerRule,items,theme|wrap:∅|cls:flex,border,text-sm,grid,items-center,gap-2`
- props: `compareRevealMode`, `content`, `footerRule`, `items`, `theme`
- arquivos:
  - `DangerZoneDoseTrap.tsx`
  - `DangerZoneFarmacoTrap.tsx`
  - `DangerZoneRouteTrap.tsx`
  - `DangerZoneScopeTrap.tsx`

### c010 - TrapArena (n=4)

- signature: `TrapArena|props:compareRevealMode,content,footerRule,items,theme|wrap:∅|cls:flex,border,items-center,text-sm,shadow-sm,gap-3`
- props: `compareRevealMode`, `content`, `footerRule`, `items`, `theme`
- nota: TrapArena sem wrapper compartilhado detectado - revisar manualmente.
- arquivos:
  - `DangerZonePtCliticTrapArena.tsx`
  - `DangerZonePtCommaTrapArena.tsx`
  - `DangerZonePtCraseTrapArena.tsx`
  - `DangerZonePtTermTrapArena.tsx`

### c011 - Board (n=3)

- signature: `Board|props:∅|wrap:GoldenRuleSoftLensBoard|cls:∅`
- wrappers: `GoldenRuleSoftLensBoard`
- nota: Thin SoftLens wrappers - fusao tipicamente 1 prop de hintProfile/accent.
- arquivos:
  - `GoldenRuleIvAntisepsisBoard.tsx`
  - `GoldenRuleIvExcetoCommandBoard.tsx`
  - `GoldenRuleIvIntervalBoard.tsx`

### c012 - Board (n=3)

- signature: `Board|props:content,footerRule,rows,theme|wrap:∅|cls:flex,border,text-xs,text-slate-900,gap-1.5,items-center`
- props: `content`, `footerRule`, `rows`, `theme`
- arquivos:
  - `GoldenRulePtCliticRailBoard.tsx`
  - `GoldenRulePtCommaRailBoard.tsx`
  - `GoldenRulePtCraseFunnelBoard.tsx`

### c013 - Board (n=3)

- signature: `Board|props:content,footerRule,rows,theme|wrap:∅|cls:flex,gap-2,px-2,border,gap-1,p-4`
- props: `content`, `footerRule`, `rows`, `theme`
- arquivos:
  - `GoldenRuleMentalRapsTierBoard.tsx`
  - `GoldenRulePeriAldreteBoard.tsx`
  - `GoldenRulePeriPreopPrepBoard.tsx`

### c015 - LogicFlow* (n=3)

- signature: `LogicFlow*|props:footerRule,revealMode,steps,text,theme|wrap:∅|cls:flex,rounded-full,items-center,gap-2,h-4,justify-center`
- props: `footerRule`, `revealMode`, `steps`, `text`, `theme`
- arquivos:
  - `LogicFlowMentalRapsClassifyTap.tsx`
  - `LogicFlowPeriPreopDecisionTap.tsx`
  - `LogicFlowPeriSrpaDecisionTap.tsx`

### c016 - TrapArena (n=3)

- signature: `TrapArena|props:compareRevealMode,content,footerRule,items,theme|wrap:∅|cls:flex,border,h-4,rounded-full,w-4,rounded-xl`
- props: `compareRevealMode`, `content`, `footerRule`, `items`, `theme`
- nota: TrapArena sem wrapper compartilhado detectado - revisar manualmente.
- arquivos:
  - `DangerZoneMulherMamaTrapArena.tsx`
  - `DangerZoneMulherPuerperioTrapArena.tsx`
  - `DangerZoneMulherScreeningTrapArena.tsx`

### c017 - Board (n=2)

- signature: `Board|props:content,footerRule,rows,theme|wrap:∅|cls:flex,border,grid,px-4,shadow-sm,text-center`
- props: `content`, `footerRule`, `rows`, `theme`
- arquivos:
  - `GoldenRuleCamDocumentacaoBoard.tsx`
  - `GoldenRuleCamNineRightsBoard.tsx`

### c018 - Board (n=2)

- signature: `Board|props:content,footerRule,rows,theme|wrap:∅|cls:flex,border,items-center,px-2,rounded-full,text-[9px`
- props: `content`, `footerRule`, `rows`, `theme`
- arquivos:
  - `GoldenRuleMulherPrenatalBoard.tsx`
  - `GoldenRuleMulherPuerperioBoard.tsx`

### c019 - Board (n=2)

- signature: `Board|props:content,footerRule,rows,theme|wrap:∅|cls:flex,rounded-full,border,gap-2,text-[9px,items-center`
- props: `content`, `footerRule`, `rows`, `theme`
- arquivos:
  - `GoldenRuleMulherMamaBoard.tsx`
  - `GoldenRuleMulherPapanicolauBoard.tsx`

### c020 - Chips (n=2)

- signature: `Chips|props:compareRevealMode,content,footerRule,items,theme|wrap:∅|cls:flex,border,grid,text-sm,items-center,gap-2`
- props: `compareRevealMode`, `content`, `footerRule`, `items`, `theme`
- arquivos:
  - `DangerZoneBiossegTrapChips.tsx`
  - `DangerZoneIstTrapChips.tsx`

### c021 - ConceptMap (n=2)

- signature: `ConceptMap|props:concepts,footerRule,theme|wrap:∅|cls:flex,border,gap-2,items-center,text-sm,bg-white/90`
- props: `concepts`, `footerRule`, `theme`
- arquivos:
  - `InfusaoEvStationDeckConceptMap.tsx`
  - `IvPunctureRailConceptMap.tsx`

### c022 - ConceptMap (n=2)

- signature: `ConceptMap|props:concepts,footerRule,theme|wrap:∅|cls:flex,border,items-center,gap-2,grid,px-2`
- props: `concepts`, `footerRule`, `theme`
- arquivos:
  - `CamDocumentacaoDeckConceptMap.tsx`
  - `UrgenciasProtocolRulesDeckConceptMap.tsx`

### c023 - ConceptMap (n=2)

- signature: `ConceptMap|props:concepts,footerRule,theme|wrap:∅|cls:flex,border,items-center,rounded-xl,gap-3,grid`
- props: `concepts`, `footerRule`, `theme`
- arquivos:
  - `Nr32AnnexDeckConceptMap.tsx`
  - `SpIdVerifyDeckConceptMap.tsx`

### c024 - ConceptMap (n=2)

- signature: `ConceptMap|props:concepts,footerRule,theme|wrap:∅|cls:flex,border,items-center,rounded-xl,text-sm,justify-center`
- props: `concepts`, `footerRule`, `theme`
- arquivos:
  - `UrgenciasStrokeSignsDeckConceptMap.tsx`
  - `UrgenciasXabcdeRailConceptMap.tsx`

### c025 - ConceptMap (n=2)

- signature: `ConceptMap|props:concepts,footerRule,theme|wrap:∅|cls:flex,border,items-center,text-[9px,text-sm,gap-2`
- props: `concepts`, `footerRule`, `theme`
- arquivos:
  - `CamExcetoRailConceptMap.tsx`
  - `UrgenciasExcetoRailConceptMap.tsx`

### c026 - ConceptMap (n=2)

- signature: `ConceptMap|props:concepts,footerRule,theme|wrap:∅|cls:flex,border,rounded-xl,gap-2,p-3,rounded-full`
- props: `concepts`, `footerRule`, `theme`
- arquivos:
  - `MulherMammographySpectrumConceptMap.tsx`
  - `MulherScreeningSpectrumConceptMap.tsx`

### c028 - LogicFlow* (n=2)

- signature: `LogicFlow*|props:footerRule,steps,text,theme|wrap:∅|cls:∅`
- props: `footerRule`, `steps`, `text`, `theme`
- arquivos:
  - `LogicFlowCamDocumentacaoVfTap.tsx`
  - `LogicFlowCamVfJuggleTap.tsx`

### c029 - LogicFlow* (n=2)

- signature: `LogicFlow*|props:revealMode,steps,text,theme|wrap:LogicFlowStepLadder|cls:∅`
- wrappers: `LogicFlowStepLadder`
- props: `revealMode`, `steps`, `text`, `theme`
- nota: Thin StepLadder wrappers - fusao tipicamente 1 prop de accent.
- arquivos:
  - `LogicFlowCamAltoRiscoEliminationTap.tsx`
  - `LogicFlowUrgenciasStrokeEliminationTap.tsx`

### c030 - SoftStack (n=2)

- signature: `SoftStack|props:steps,text,theme|wrap:∅|cls:flex,items-center,rounded-full,justify-center,px-6,text-sm`
- props: `steps`, `text`, `theme`
- arquivos:
  - `LogicFlowLabVfSoftStack.tsx`
  - `LogicFlowSoftStack.tsx`

### c031 - TapFlow (n=2)

- signature: `TapFlow|props:footerRule,steps,text,theme|wrap:∅|cls:flex,items-center,rounded-full,justify-center,text-lg,text-slate-900`
- props: `footerRule`, `steps`, `text`, `theme`
- arquivos:
  - `LogicFlowPtCliticRailTapFlow.tsx`
  - `LogicFlowPtCommaRailTapFlow.tsx`

### c032 - TapFlow (n=2)

- signature: `TapFlow|props:steps,text,theme|wrap:∅|cls:flex,items-center,rounded-full,justify-center,bg-gradient-to-br,text-slate-900`
- props: `steps`, `text`, `theme`
- arquivos:
  - `LogicFlowBurnTriageTapFlow.tsx`
  - `LogicFlowWoundPrepTapFlow.tsx`

### c033 - Trap (n=2)

- signature: `Trap|props:compareRevealMode,content,footerRule,items,theme|wrap:∅|cls:flex,text-sm,border,w-full,h-4,items-center`
- props: `compareRevealMode`, `content`, `footerRule`, `items`, `theme`
- arquivos:
  - `DangerZoneIvExcetoIntruderTrap.tsx`
  - `DangerZoneIvIntervalSwapTrap.tsx`

### c034 - Trap (n=2)

- signature: `Trap|props:compareRevealMode,content,footerRule,items,theme|wrap:∅|cls:flex,text-sm,border,w-full,h-4,p-4`
- props: `compareRevealMode`, `content`, `footerRule`, `items`, `theme`
- arquivos:
  - `DangerZoneIvBundleBreakTrap.tsx`
  - `DangerZoneIvOrderInvertTrap.tsx`

### c035 - TrapArena (n=2)

- signature: `TrapArena|props:compareRevealMode,content,footerRule,items,theme|wrap:∅|cls:flex,border,items-center,rounded-xl,text-sm,gap-3`
- props: `compareRevealMode`, `content`, `footerRule`, `items`, `theme`
- nota: TrapArena sem wrapper compartilhado detectado - revisar manualmente.
- arquivos:
  - `DangerZoneMulherPlanejamentoTrapArena.tsx`
  - `DangerZoneMulherPrenatalTrapArena.tsx`

### c036 - TrapArena (n=2)

- signature: `TrapArena|props:compareRevealMode,content,footerRule,items,theme|wrap:∅|cls:flex,border,items-center,text-sm,gap-3,h-4`
- props: `compareRevealMode`, `content`, `footerRule`, `items`, `theme`
- nota: TrapArena sem wrapper compartilhado detectado - revisar manualmente.
- arquivos:
  - `DangerZoneCamCertosTrapArena.tsx`
  - `DangerZoneCamHighRiskTrapArena.tsx`

### c037 - TrapArena (n=2)

- signature: `TrapArena|props:compareRevealMode,content,footerRule,items,theme|wrap:∅|cls:flex,border,rounded-xl,text-sm,gap-3,items-center`
- props: `compareRevealMode`, `content`, `footerRule`, `items`, `theme`
- nota: TrapArena sem wrapper compartilhado detectado - revisar manualmente.
- arquivos:
  - `DangerZonePeriProtocolTrapArena.tsx`
  - `DangerZonePeriSrpaTrapArena.tsx`

### c038 - TrapArena (n=2)

- signature: `TrapArena|props:compareRevealMode,content,footerRule,items,theme|wrap:∅|cls:flex,text-sm,border,gap-3,rounded-xl,bg-gradient-to-br`
- props: `compareRevealMode`, `content`, `footerRule`, `items`, `theme`
- nota: TrapArena sem wrapper compartilhado detectado - revisar manualmente.
- arquivos:
  - `DangerZoneMentalRapsTrapArena.tsx`
  - `DangerZonePeriPreopTrapArena.tsx`

### c039 - TrapArena (n=2)

- signature: `TrapArena|props:content,footerRule,items,theme|wrap:∅|cls:flex,items-center,border,justify-center,rounded-xl,text-sm`
- props: `content`, `footerRule`, `items`, `theme`
- nota: TrapArena sem wrapper compartilhado detectado - revisar manualmente.
- arquivos:
  - `DangerZoneRespiratorioSpo2TrapArena.tsx`
  - `DangerZoneUrgenciasRcpTrapArena.tsx`

### c040 - TrapArena (n=2)

- signature: `TrapArena|props:content,footerRule,items,theme|wrap:∅|cls:flex,text-sm,border,py-3,px-4,w-full`
- props: `content`, `footerRule`, `items`, `theme`
- nota: TrapArena sem wrapper compartilhado detectado - revisar manualmente.
- arquivos:
  - `DangerZoneCamExcetoTrapArena.tsx`
  - `DangerZoneUrgenciasExcetoTrapArena.tsx`

## Todos os clusters (resumo)

| id | family | size | fusion? | files (sample) |
|----|--------|-----:|:-------:|----------------|
| c001 | ReferenceBoard | 15 | yes | GoldenRuleBiossegReferenceBoard.tsx, GoldenRuleCamExcetoReferenceBoard.tsx, GoldenRuleFarmacoClinicoReferenceBoard.tsx, +12 |
| c002 | TapFlow | 12 | yes | LogicFlowCamExcetoTapFlow.tsx, LogicFlowFarmacoProtocolTapFlow.tsx, LogicFlowIvComplicationTapFlow.tsx, +9 |
| c003 | LogicFlow* | 7 | yes | LogicFlowBiossegVfJuggleTap.tsx, LogicFlowFarmacoVfJuggleTap.tsx, LogicFlowPeriVfJuggleTap.tsx, +4 |
| c004 | TapFlow | 6 | yes | LogicFlowMulherLaborTapFlow.tsx, LogicFlowMulherMamaTapFlow.tsx, LogicFlowMulherPlanejamentoTapFlow.tsx, +3 |
| c005 | Board | 5 | yes | GoldenRuleIvDifferentialBoard.tsx, GoldenRuleUrgenciasCincinnatiBoard.tsx, GoldenRuleUrgenciasHeimlichBoard.tsx, +2 |
| c006 | TrapArena | 5 | yes | DangerZoneUrgenciasChokingTrapArena.tsx, DangerZoneUrgenciasProtocolTrapArena.tsx, DangerZoneUrgenciasShockTrapArena.tsx, +2 |
| c007 | ConceptMap | 4 | yes | PtCliticRailDeckConceptMap.tsx, PtCommaRailDeckConceptMap.tsx, PtCraseFunnelDeckConceptMap.tsx, +1 |
| c008 | TapFlow | 4 | yes | LogicFlowIvBundleTapFlow.tsx, LogicFlowIvExcetoTapFlow.tsx, LogicFlowIvIntervalTapFlow.tsx, +1 |
| c009 | Trap | 4 | yes | DangerZoneDoseTrap.tsx, DangerZoneFarmacoTrap.tsx, DangerZoneRouteTrap.tsx, +1 |
| c010 | TrapArena | 4 | yes | DangerZonePtCliticTrapArena.tsx, DangerZonePtCommaTrapArena.tsx, DangerZonePtCraseTrapArena.tsx, +1 |
| c011 | Board | 3 | yes | GoldenRuleIvAntisepsisBoard.tsx, GoldenRuleIvExcetoCommandBoard.tsx, GoldenRuleIvIntervalBoard.tsx |
| c012 | Board | 3 | yes | GoldenRulePtCliticRailBoard.tsx, GoldenRulePtCommaRailBoard.tsx, GoldenRulePtCraseFunnelBoard.tsx |
| c013 | Board | 3 | yes | GoldenRuleMentalRapsTierBoard.tsx, GoldenRulePeriAldreteBoard.tsx, GoldenRulePeriPreopPrepBoard.tsx |
| c014 | ConceptMap | 3 |  | CamCertosDeckConceptMap.tsx, IstRiskRoutesDeckConceptMap.tsx, PniRulesDeckConceptMap.tsx |
| c015 | LogicFlow* | 3 | yes | LogicFlowMentalRapsClassifyTap.tsx, LogicFlowPeriPreopDecisionTap.tsx, LogicFlowPeriSrpaDecisionTap.tsx |
| c016 | TrapArena | 3 | yes | DangerZoneMulherMamaTrapArena.tsx, DangerZoneMulherPuerperioTrapArena.tsx, DangerZoneMulherScreeningTrapArena.tsx |
| c017 | Board | 2 | yes | GoldenRuleCamDocumentacaoBoard.tsx, GoldenRuleCamNineRightsBoard.tsx |
| c018 | Board | 2 | yes | GoldenRuleMulherPrenatalBoard.tsx, GoldenRuleMulherPuerperioBoard.tsx |
| c019 | Board | 2 | yes | GoldenRuleMulherMamaBoard.tsx, GoldenRuleMulherPapanicolauBoard.tsx |
| c020 | Chips | 2 | yes | DangerZoneBiossegTrapChips.tsx, DangerZoneIstTrapChips.tsx |
| c021 | ConceptMap | 2 | yes | InfusaoEvStationDeckConceptMap.tsx, IvPunctureRailConceptMap.tsx |
| c022 | ConceptMap | 2 | yes | CamDocumentacaoDeckConceptMap.tsx, UrgenciasProtocolRulesDeckConceptMap.tsx |
| c023 | ConceptMap | 2 | yes | Nr32AnnexDeckConceptMap.tsx, SpIdVerifyDeckConceptMap.tsx |
| c024 | ConceptMap | 2 | yes | UrgenciasStrokeSignsDeckConceptMap.tsx, UrgenciasXabcdeRailConceptMap.tsx |
| c025 | ConceptMap | 2 | yes | CamExcetoRailConceptMap.tsx, UrgenciasExcetoRailConceptMap.tsx |
| c026 | ConceptMap | 2 | yes | MulherMammographySpectrumConceptMap.tsx, MulherScreeningSpectrumConceptMap.tsx |
| c027 | ConceptMap | 2 |  | CamHighRiskDuoDeckConceptMap.tsx, VitalsPanelConceptMap.tsx |
| c028 | LogicFlow* | 2 | yes | LogicFlowCamDocumentacaoVfTap.tsx, LogicFlowCamVfJuggleTap.tsx |
| c029 | LogicFlow* | 2 | yes | LogicFlowCamAltoRiscoEliminationTap.tsx, LogicFlowUrgenciasStrokeEliminationTap.tsx |
| c030 | SoftStack | 2 | yes | LogicFlowLabVfSoftStack.tsx, LogicFlowSoftStack.tsx |
| c031 | TapFlow | 2 | yes | LogicFlowPtCliticRailTapFlow.tsx, LogicFlowPtCommaRailTapFlow.tsx |
| c032 | TapFlow | 2 | yes | LogicFlowBurnTriageTapFlow.tsx, LogicFlowWoundPrepTapFlow.tsx |
| c033 | Trap | 2 | yes | DangerZoneIvExcetoIntruderTrap.tsx, DangerZoneIvIntervalSwapTrap.tsx |
| c034 | Trap | 2 | yes | DangerZoneIvBundleBreakTrap.tsx, DangerZoneIvOrderInvertTrap.tsx |
| c035 | TrapArena | 2 | yes | DangerZoneMulherPlanejamentoTrapArena.tsx, DangerZoneMulherPrenatalTrapArena.tsx |
| c036 | TrapArena | 2 | yes | DangerZoneCamCertosTrapArena.tsx, DangerZoneCamHighRiskTrapArena.tsx |
| c037 | TrapArena | 2 | yes | DangerZonePeriProtocolTrapArena.tsx, DangerZonePeriSrpaTrapArena.tsx |
| c038 | TrapArena | 2 | yes | DangerZoneMentalRapsTrapArena.tsx, DangerZonePeriPreopTrapArena.tsx |
| c039 | TrapArena | 2 | yes | DangerZoneRespiratorioSpo2TrapArena.tsx, DangerZoneUrgenciasRcpTrapArena.tsx |
| c040 | TrapArena | 2 | yes | DangerZoneCamExcetoTrapArena.tsx, DangerZoneUrgenciasExcetoTrapArena.tsx |
| c041 | Board | 1 |  | CriancaSharedGoldenBoard.tsx |
| c042 | Board | 1 |  | GoldenRuleCamHighRiskProtocolBoard.tsx |
| c043 | Board | 1 |  | GoldenRuleMulherPartoHumanizadoBoard.tsx |
| c044 | Board | 1 |  | GoldenRuleTbPrecautionBoard.tsx |
| c045 | Board | 1 |  | GoldenRulePniCalendarBoard.tsx |
| c046 | Board | 1 |  | GoldenRuleMulherPlanejamentoBoard.tsx |
| c047 | Board | 1 |  | GoldenRuleSondaMeasurementBoard.tsx |
| c048 | Board | 1 |  | GoldenRuleLabPrepLensBoard.tsx |
| c049 | Board | 1 |  | GoldenRuleBurnRuleNineBoard.tsx |
| c050 | Board | 1 |  | GoldenRulePtTermMatrixBoard.tsx |
| c051 | Board | 1 |  | GoldenRuleItuBundleBoard.tsx |
| c052 | Board | 1 |  | GoldenRuleAdolescentZBandBoard.tsx |
| c053 | Board | 1 |  | GoldenRuleMentalCrisisLadderBoard.tsx |
| c054 | Board | 1 |  | GoldenRuleUrgenciasManchesterBoard.tsx |
| c055 | Board | 1 |  | LogicFlowPtCraseFunnelBoard.tsx |
| c056 | Board | 1 |  | LogicFlowPtCliticPositionBoard.tsx |
| c057 | Carousel | 1 |  | GoldenRuleProtocolCarousel.tsx |
| c058 | Chips | 1 |  | DangerZonePniTrapChips.tsx |
| c059 | Chips | 1 |  | DangerZonePeriVfTrapChips.tsx |
| c060 | Chips | 1 |  | DangerZoneEtiologyIntruderChips.tsx |
| c061 | ConceptMap | 1 |  | IvBundleOrbitConceptMap.tsx |
| c062 | ConceptMap | 1 |  | CriancaSharedConceptMaps.tsx |
| c063 | ConceptMap | 1 |  | OxygenProtocolDeckConceptMap.tsx |
| c064 | ConceptMap | 1 |  | IvComplicationTissueLayersConceptMap.tsx |
| c065 | ConceptMap | 1 |  | BiossegPrecautionDeckConceptMap.tsx |
| c066 | ConceptMap | 1 |  | PeriProtocolChecklistDeckConceptMap.tsx |
| c067 | ConceptMap | 1 |  | MentalRapsNetworkRailConceptMap.tsx |
| c068 | ConceptMap | 1 |  | PeriPreopPhaseDeckConceptMap.tsx |
| c069 | ConceptMap | 1 |  | MulherContraceptionSpectrumConceptMap.tsx |
| c070 | ConceptMap | 1 |  | PeriSrpaMonitorDeckConceptMap.tsx |
| c071 | ConceptMap | 1 |  | UrgenciasShockTypesDeckConceptMap.tsx |
| c072 | ConceptMap | 1 |  | IvGaugeMatrixConceptMap.tsx |
| c073 | ConceptMap | 1 |  | SpIncidentTaxonomyDeckConceptMap.tsx |
| c074 | ConceptMap | 1 |  | PeriVfAssertionsDeckConceptMap.tsx |
| c075 | ConceptMap | 1 |  | UrgenciasSurvivalChainDeckConceptMap.tsx |
| c076 | ConceptMap | 1 |  | IvExcetoSpectrumConceptMap.tsx |
| c077 | ConceptMap | 1 |  | ColdChainHubConceptMap.tsx |
| c078 | ConceptMap | 1 |  | MentalCrisisSignalDeckConceptMap.tsx |
| c079 | ConceptMap | 1 |  | UrgenciasManchesterSpectrumConceptMap.tsx |
| c080 | ConceptMap | 1 |  | UrgenciasChokingSignalDeckConceptMap.tsx |
| c081 | ConceptMap | 1 |  | UrgenciasPediatricRcpDeckConceptMap.tsx |
| c082 | ConceptMap | 1 |  | RespiratorioAsmaDpocDuelDeckConceptMap.tsx |
| c083 | ConceptMap | 1 |  | TbVigilanceRailConceptMap.tsx |
| c084 | ConceptMap | 1 |  | WoundStageTissueDeckConceptMap.tsx |
| c085 | ConceptMap | 1 |  | BurnDepthLayerDeckConceptMap.tsx |
| c086 | ConceptMap | 1 |  | AdolescentGrowthZRailConceptMap.tsx |
| c087 | ConceptMap | 1 |  | MulherLaborPhaseDeckConceptMap.tsx |
| c088 | ConceptMap | 1 |  | UrgenciasEmergencyHubConceptMap.tsx |
| c089 | ConceptMap | 1 |  | IvIntervalTimelineConceptMap.tsx |
| c090 | ConceptMap | 1 |  | SpFallRiskRailConceptMap.tsx |
| c091 | ConceptMap | 1 |  | AdolescentPrivacyCurtainConceptMap.tsx |
| c092 | ConceptMap | 1 |  | IvCareOrbitConceptMap.tsx |
| c093 | ConceptMap | 1 |  | MulherGestationTimelineConceptMap.tsx |
| c094 | ConceptMap | 1 |  | MorphingTimelineConceptMap.tsx |
| c095 | ConceptMap | 1 |  | LabSpecimenChainConceptMap.tsx |
| c096 | ConceptMap | 1 |  | AdmeJourneyRailConceptMap.tsx |
| c097 | ConceptMap | 1 |  | ConceptMap.tsx |
| c098 | ConceptMap | 1 |  | AbsorptionSpeedRailConceptMap.tsx |
| c099 | ConceptMap | 1 |  | ProcedureProtocolConceptMap.tsx |
| c100 | ConceptMap | 1 |  | SaeDocumentationConceptMap.tsx |
| c101 | ConceptMap | 1 |  | SusLegalPillarsConceptMap.tsx |
| c102 | ConceptMap | 1 |  | SusArt4OrbitConceptMap.tsx |
| c103 | ConceptMap | 1 |  | EtiologyKingdomRailConceptMap.tsx |
| c104 | ConceptMap | 1 |  | MorphologicalConceptMap.tsx |
| c105 | ConceptMap | 1 |  | ItuClosedSystemRailConceptMap.tsx |
| c106 | ConceptMap | 1 |  | SurvivalChainConceptMap.tsx |
| c107 | ConceptMap | 1 |  | VaccineTimelineConceptMap.tsx |
| c108 | ConceptMap | 1 |  | MulherPuerperioTimelineConceptMap.tsx |
| c109 | ConceptMap | 1 |  | DoseEquivalenceRailConceptMap.tsx |
| c110 | DangerZone* | 1 |  | DangerZone.tsx |
| c111 | DangerZone* | 1 |  | DangerZoneTrapReveal.tsx |
| c112 | DangerZone* | 1 |  | DangerZoneCalendarMismatch.tsx |
| c113 | DangerZone* | 1 |  | DangerZoneNormReveal.tsx |
| c114 | DangerZone* | 1 |  | DangerZoneTemperatureMismatch.tsx |
| c115 | DangerZone* | 1 |  | DangerZoneAdolescentConsentGate.tsx |
| c116 | DangerZone* | 1 |  | DangerZoneCatheterArena.tsx |
| c117 | DangerZone* | 1 |  | DangerZoneLabSpecimenArena.tsx |
| c118 | DangerZone* | 1 |  | DangerZoneDressingChoiceArena.tsx |
| c119 | DangerZone* | 1 |  | DangerZoneVitalsClassifyArena.tsx |
| c120 | GoldenRule* | 1 |  | GoldenRule.tsx |
| c121 | LogicFlow* | 1 |  | LogicFlowPniVfJuggleTap.tsx |
| c122 | LogicFlow* | 1 |  | LogicFlowFooter.tsx |
| c123 | LogicFlow* | 1 |  | LogicFlowAdolescentZClassifyTap.tsx |
| c124 | LogicFlow* | 1 |  | LogicFlowMentalCrisisDecisionTap.tsx |
| c125 | LogicFlow* | 1 |  | LogicFlowVitalsTranslateTap.tsx |
| c126 | LogicFlow* | 1 |  | LogicFlowEtiologyEliminationTap.tsx |
| c127 | LogicFlow* | 1 |  | LogicFlowPniColdChainTap.tsx |
| c128 | LogicFlow* | 1 |  | LogicFlowTbVfEliminationTap.tsx |
| c129 | LogicFlow* | 1 |  | LogicFlowItuExcetoTap.tsx |
| c130 | LogicFlow* | 1 |  | LogicFlowPniCalendarEliminationTap.tsx |
| c131 | LogicFlow* | 1 |  | LogicFlowAdolescentVfWeaveTap.tsx |
| c132 | LogicFlow* | 1 |  | LogicFlow.tsx |
| c133 | LogicFlow* | 1 |  | LogicFlowSondaChecklistTap.tsx |
| c134 | Matrix | 1 |  | SaeResponsibilityMatrix.tsx |
| c135 | Matrix | 1 |  | GoldenRuleDressingMatchMatrix.tsx |
| c136 | Matrix | 1 |  | GoldenRulePniIntervalMatrix.tsx |
| c137 | MeshReveal | 1 |  | GoldenRuleMeshReveal.tsx |
| c138 | other | 1 |  | criancaVariants.tsx |
| c139 | other | 1 |  | VersusArena.tsx |
| c140 | other | 1 |  | SyllableScanner.tsx |
| c141 | Rail | 1 |  | GoldenRulePniTemperatureRail.tsx |
| c142 | ReferenceBoard | 1 |  | GoldenRuleVitalsReferenceBoard.tsx |
| c143 | ReferenceBoard | 1 |  | GoldenRulePeriProtocolReferenceBoard.tsx |
| c144 | ReferenceBoard | 1 |  | GoldenRulePeriVfReferenceBoard.tsx |
| c145 | SoftLensBoard | 1 |  | GoldenRuleSoftLensBoard.tsx |
| c146 | Spectrum | 1 |  | GoldenRuleAdolescentSigiloSpectrum.tsx |
| c147 | Spectrum | 1 |  | GoldenRuleEtiologyLetterSpectrum.tsx |
| c148 | StepLadder | 1 |  | LogicFlowStepLadder.tsx |
| c149 | TapFlow | 1 |  | LogicFlowPeriProtocolTapFlow.tsx |
| c150 | TapFlow | 1 |  | CriancaSharedTapFlow.tsx |
| c151 | TapFlow | 1 |  | LogicFlowPtTermMatrixTapFlow.tsx |
| c152 | TapFlow | 1 |  | LogicFlowPtCraseFunnelTapFlow.tsx |
| c153 | Trap | 1 |  | DangerZoneTbTransmissionTrap.tsx |
| c154 | Trap | 1 |  | DangerZoneIvLabelSwapTrap.tsx |
| c155 | Trap | 1 |  | DangerZoneMentalCrisisCoercionTrap.tsx |
| c156 | Trap | 1 |  | DangerZoneLabPrepTrap.tsx |
| c157 | Trap | 1 |  | DangerZoneIvGaugeMismatchTrap.tsx |
| c158 | Trap | 1 |  | DangerZoneItuCatheterTrap.tsx |
| c159 | Trap | 1 |  | DangerZoneAdolescentZThresholdTrap.tsx |
| c160 | Trap | 1 |  | DangerZoneFarmacoClinicoTrap.tsx |
| c161 | Trap | 1 |  | DangerZoneUrgenciasManchesterTrap.tsx |
| c162 | TrapArena | 1 |  | CriancaSharedTrapArena.tsx |
| c163 | TrapArena | 1 |  | DangerZoneMulherPartoTrapArena.tsx |
| c164 | TrapArena | 1 |  | DangerZoneCamDocumentacaoTrapArena.tsx |
| c165 | TrapArena | 1 |  | DangerZoneSpSafetyTrapArena.tsx |
| c166 | TrapArena | 1 |  | DangerZoneBurnTrapArena.tsx |
| c167 | TrapArena | 1 |  | DangerZoneTrabalhoPepTrapArena.tsx |
| c168 | TrapArena | 1 |  | DangerZoneUrgenciasPediatricTrapArena.tsx |
