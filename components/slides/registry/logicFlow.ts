'use client';

/**
 * Registry dinâmico — logic_flow (bespoke). Genéricos ficam no router estático.
 * Gerado por scripts/_generate-slide-registries.mjs — editar com cuidado.
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { loadNamedVariant } from './loadVariant';

export type BespokeVariantEntry = {
  Component: ComponentType<any>;
  requiresRows?: boolean;
  requiresItems?: boolean;
};

const Dyn_oxygen_step_ladder = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowStepLadder') as Promise<Record<string, unknown>>, 'LogicFlowStepLadder'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_care_soft_stack = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowSoftStack') as Promise<Record<string, unknown>>, 'LogicFlowSoftStack'),
  { ssr: true, loading: () => null },
);

const Dyn_lab_vf_soft_stack = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowLabVfSoftStack') as Promise<Record<string, unknown>>, 'LogicFlowLabVfSoftStack'),
  { ssr: true, loading: () => null },
);

const Dyn_wound_prep_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowWoundPrepTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowWoundPrepTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_burn_triage_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowBurnTriageTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowBurnTriageTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_crase_funnel_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPtCraseFunnelTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowPtCraseFunnelTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_clitic_rail_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPtCliticRailTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowPtCliticRailTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_comma_rail_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPtCommaRailTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowPtCommaRailTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_term_matrix_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPtTermMatrixTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowPtTermMatrixTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_subject_focus_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPtTermMatrixTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowPtTermMatrixTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_trabalho_vf_juggle_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowTrabalhoVfJuggleTap') as Promise<Record<string, unknown>>, 'LogicFlowTrabalhoVfJuggleTap'),
  { ssr: true, loading: () => null },
);

const Dyn_sp_vf_juggle_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowSegurancaVfJuggleTap') as Promise<Record<string, unknown>>, 'LogicFlowSegurancaVfJuggleTap'),
  { ssr: true, loading: () => null },
);

const Dyn_sp_protocol_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowSpProtocolTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowSpProtocolTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_biosseg_vf_juggle_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowBiossegVfJuggleTap') as Promise<Record<string, unknown>>, 'LogicFlowBiossegVfJuggleTap'),
  { ssr: true, loading: () => null },
);

const Dyn_respiratorio_vf_juggle_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowRespiratorioVfJuggleTap') as Promise<Record<string, unknown>>, 'LogicFlowRespiratorioVfJuggleTap'),
  { ssr: true, loading: () => null },
);

const Dyn_mental_raps_classify_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowMentalRapsClassifyTap') as Promise<Record<string, unknown>>, 'LogicFlowMentalRapsClassifyTap'),
  { ssr: true, loading: () => null },
);

const Dyn_mental_crisis_decision_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowMentalCrisisDecisionTap') as Promise<Record<string, unknown>>, 'LogicFlowMentalCrisisDecisionTap'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_preop_decision_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPeriPreopDecisionTap') as Promise<Record<string, unknown>>, 'LogicFlowPeriPreopDecisionTap'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_srpa_decision_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPeriSrpaDecisionTap') as Promise<Record<string, unknown>>, 'LogicFlowPeriSrpaDecisionTap'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_protocol_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPeriProtocolTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowPeriProtocolTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_vf_juggle_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPeriVfJuggleTap') as Promise<Record<string, unknown>>, 'LogicFlowPeriVfJuggleTap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_rcp_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowUrgenciasRcpTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowUrgenciasRcpTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_xabcde_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowUrgenciasXabcdeTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowUrgenciasXabcdeTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_stroke_elimination_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowUrgenciasStrokeEliminationTap') as Promise<Record<string, unknown>>, 'LogicFlowUrgenciasStrokeEliminationTap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_shock_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowUrgenciasShockTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowUrgenciasShockTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_choking_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowUrgenciasChokingTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowUrgenciasChokingTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_pediatric_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowUrgenciasPediatricTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowUrgenciasPediatricTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_protocol_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowUrgenciasProtocolTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowUrgenciasProtocolTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_exceto_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowUrgenciasExcetoTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowUrgenciasExcetoTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_etiology_elimination_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowEtiologyEliminationTap') as Promise<Record<string, unknown>>, 'LogicFlowEtiologyEliminationTap'),
  { ssr: true, loading: () => null },
);

const Dyn_tb_vf_elimination_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowTbVfEliminationTap') as Promise<Record<string, unknown>>, 'LogicFlowTbVfEliminationTap'),
  { ssr: true, loading: () => null },
);

const Dyn_itu_exceto_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowItuExcetoTap') as Promise<Record<string, unknown>>, 'LogicFlowItuExcetoTap'),
  { ssr: true, loading: () => null },
);

const Dyn_pni_vf_juggle_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPniVfJuggleTap') as Promise<Record<string, unknown>>, 'LogicFlowPniVfJuggleTap'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_vf_juggle_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowCamVfJuggleTap') as Promise<Record<string, unknown>>, 'LogicFlowCamVfJuggleTap'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_alto_risco_elimination_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowCamAltoRiscoEliminationTap') as Promise<Record<string, unknown>>, 'LogicFlowCamAltoRiscoEliminationTap'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_exceto_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowCamExcetoTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowCamExcetoTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_documentacao_vf_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowCamDocumentacaoVfTap') as Promise<Record<string, unknown>>, 'LogicFlowCamDocumentacaoVfTap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_complication_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowIvComplicationTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowIvComplicationTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_device_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowIvDeviceTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowIvDeviceTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_exceto_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowIvExcetoTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowIvExcetoTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_interval_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowIvIntervalTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowIvIntervalTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_puncture_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowIvPunctureTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowIvPunctureTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_bundle_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowIvBundleTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowIvBundleTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_pni_calendar_elimination_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPniCalendarEliminationTap') as Promise<Record<string, unknown>>, 'LogicFlowPniCalendarEliminationTap'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_prenatal_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowMulherPrenatalTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowMulherPrenatalTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_labor_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowMulherLaborTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowMulherLaborTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_screening_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowMulherScreeningTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowMulherScreeningTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_mama_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowMulherMamaTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowMulherMamaTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_puerperio_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowMulherPuerperioTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowMulherPuerperioTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_planejamento_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowMulherPlanejamentoTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowMulherPlanejamentoTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_feeding_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'LogicFlowCriancaFeedingTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_screening_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'LogicFlowCriancaScreeningTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_pediatric_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'LogicFlowCriancaPediatricTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_dehydration_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'LogicFlowCriancaDehydrationTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_puericultura_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'LogicFlowCriancaPuericulturaTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_neonatal_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'LogicFlowCriancaNeonatalTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_dev_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'LogicFlowCriancaDevTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_pni_cold_chain_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPniColdChainTap') as Promise<Record<string, unknown>>, 'LogicFlowPniColdChainTap'),
  { ssr: true, loading: () => null },
);

const Dyn_ist_vf_juggle_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowPniVfJuggleTap') as Promise<Record<string, unknown>>, 'LogicFlowPniVfJuggleTap'),
  { ssr: true, loading: () => null },
);

const Dyn_via_vf_juggle_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowViaVfJuggleTap') as Promise<Record<string, unknown>>, 'LogicFlowViaVfJuggleTap'),
  { ssr: true, loading: () => null },
);

const Dyn_farmaco_vf_juggle_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowFarmacoVfJuggleTap') as Promise<Record<string, unknown>>, 'LogicFlowFarmacoVfJuggleTap'),
  { ssr: true, loading: () => null },
);

const Dyn_farmaco_protocol_tap_flow = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowFarmacoProtocolTapFlow') as Promise<Record<string, unknown>>, 'LogicFlowFarmacoProtocolTapFlow'),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_vf_weave_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowAdolescentVfWeaveTap') as Promise<Record<string, unknown>>, 'LogicFlowAdolescentVfWeaveTap'),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_z_classify_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowAdolescentZClassifyTap') as Promise<Record<string, unknown>>, 'LogicFlowAdolescentZClassifyTap'),
  { ssr: true, loading: () => null },
);

const Dyn_dose_calc_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowStepLadder') as Promise<Record<string, unknown>>, 'LogicFlowStepLadder'),
  { ssr: true, loading: () => null },
);

const Dyn_sae_decision_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowStepLadder') as Promise<Record<string, unknown>>, 'LogicFlowStepLadder'),
  { ssr: true, loading: () => null },
);

const Dyn_sonda_decision_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowSondaChecklistTap') as Promise<Record<string, unknown>>, 'LogicFlowSondaChecklistTap'),
  { ssr: true, loading: () => null },
);

const Dyn_vitals_translate_tap = dynamic(
  () => loadNamedVariant(() => import('../variants/LogicFlowVitalsTranslateTap') as Promise<Record<string, unknown>>, 'LogicFlowVitalsTranslateTap'),
  { ssr: true, loading: () => null },
);

export const LOGIC_FLOW_REGISTRY: Record<string, BespokeVariantEntry> = {
  'oxygen-step-ladder': { Component: Dyn_oxygen_step_ladder },
  'iv-care-soft-stack': { Component: Dyn_iv_care_soft_stack },
  'lab-vf-soft-stack': { Component: Dyn_lab_vf_soft_stack },
  'wound-prep-tap-flow': { Component: Dyn_wound_prep_tap_flow },
  'burn-triage-tap-flow': { Component: Dyn_burn_triage_tap_flow },
  'pt-crase-funnel-tap-flow': { Component: Dyn_pt_crase_funnel_tap_flow },
  'pt-clitic-rail-tap-flow': { Component: Dyn_pt_clitic_rail_tap_flow },
  'pt-comma-rail-tap-flow': { Component: Dyn_pt_comma_rail_tap_flow },
  'pt-term-matrix-tap-flow': { Component: Dyn_pt_term_matrix_tap_flow },
  'pt-subject-focus-tap-flow': { Component: Dyn_pt_subject_focus_tap_flow },
  'trabalho-vf-juggle-tap': { Component: Dyn_trabalho_vf_juggle_tap },
  'sp-vf-juggle-tap': { Component: Dyn_sp_vf_juggle_tap },
  'sp-protocol-tap-flow': { Component: Dyn_sp_protocol_tap_flow },
  'biosseg-vf-juggle-tap': { Component: Dyn_biosseg_vf_juggle_tap },
  'respiratorio-vf-juggle-tap': { Component: Dyn_respiratorio_vf_juggle_tap },
  'mental-raps-classify-tap': { Component: Dyn_mental_raps_classify_tap },
  'mental-crisis-decision-tap': { Component: Dyn_mental_crisis_decision_tap },
  'peri-preop-decision-tap': { Component: Dyn_peri_preop_decision_tap },
  'peri-srpa-decision-tap': { Component: Dyn_peri_srpa_decision_tap },
  'peri-protocol-tap-flow': { Component: Dyn_peri_protocol_tap_flow },
  'peri-vf-juggle-tap': { Component: Dyn_peri_vf_juggle_tap },
  'urgencias-rcp-tap-flow': { Component: Dyn_urgencias_rcp_tap_flow },
  'urgencias-xabcde-tap-flow': { Component: Dyn_urgencias_xabcde_tap_flow },
  'urgencias-stroke-elimination-tap': { Component: Dyn_urgencias_stroke_elimination_tap },
  'urgencias-shock-tap-flow': { Component: Dyn_urgencias_shock_tap_flow },
  'urgencias-choking-tap-flow': { Component: Dyn_urgencias_choking_tap_flow },
  'urgencias-pediatric-tap-flow': { Component: Dyn_urgencias_pediatric_tap_flow },
  'urgencias-protocol-tap-flow': { Component: Dyn_urgencias_protocol_tap_flow },
  'urgencias-exceto-tap-flow': { Component: Dyn_urgencias_exceto_tap_flow },
  'etiology-elimination-tap': { Component: Dyn_etiology_elimination_tap },
  'tb-vf-elimination-tap': { Component: Dyn_tb_vf_elimination_tap },
  'itu-exceto-tap': { Component: Dyn_itu_exceto_tap },
  'pni-vf-juggle-tap': { Component: Dyn_pni_vf_juggle_tap },
  'cam-vf-juggle-tap': { Component: Dyn_cam_vf_juggle_tap },
  'cam-alto-risco-elimination-tap': { Component: Dyn_cam_alto_risco_elimination_tap },
  'cam-exceto-tap-flow': { Component: Dyn_cam_exceto_tap_flow },
  'cam-documentacao-vf-tap': { Component: Dyn_cam_documentacao_vf_tap },
  'iv-complication-tap-flow': { Component: Dyn_iv_complication_tap_flow },
  'iv-device-tap-flow': { Component: Dyn_iv_device_tap_flow },
  'iv-exceto-tap-flow': { Component: Dyn_iv_exceto_tap_flow },
  'iv-interval-tap-flow': { Component: Dyn_iv_interval_tap_flow },
  'iv-puncture-tap-flow': { Component: Dyn_iv_puncture_tap_flow },
  'iv-bundle-tap-flow': { Component: Dyn_iv_bundle_tap_flow },
  'pni-calendar-elimination-tap': { Component: Dyn_pni_calendar_elimination_tap },
  'mulher-prenatal-tap-flow': { Component: Dyn_mulher_prenatal_tap_flow },
  'mulher-labor-tap-flow': { Component: Dyn_mulher_labor_tap_flow },
  'mulher-screening-tap-flow': { Component: Dyn_mulher_screening_tap_flow },
  'mulher-mama-tap-flow': { Component: Dyn_mulher_mama_tap_flow },
  'mulher-puerperio-tap-flow': { Component: Dyn_mulher_puerperio_tap_flow },
  'mulher-planejamento-tap-flow': { Component: Dyn_mulher_planejamento_tap_flow },
  'crianca-feeding-tap-flow': { Component: Dyn_crianca_feeding_tap_flow },
  'crianca-screening-tap-flow': { Component: Dyn_crianca_screening_tap_flow },
  'crianca-pediatric-tap-flow': { Component: Dyn_crianca_pediatric_tap_flow },
  'crianca-dehydration-tap-flow': { Component: Dyn_crianca_dehydration_tap_flow },
  'crianca-puericultura-tap-flow': { Component: Dyn_crianca_puericultura_tap_flow },
  'crianca-neonatal-tap-flow': { Component: Dyn_crianca_neonatal_tap_flow },
  'crianca-dev-tap-flow': { Component: Dyn_crianca_dev_tap_flow },
  'pni-cold-chain-tap': { Component: Dyn_pni_cold_chain_tap },
  'ist-vf-juggle-tap': { Component: Dyn_ist_vf_juggle_tap },
  'via-vf-juggle-tap': { Component: Dyn_via_vf_juggle_tap },
  'farmaco-vf-juggle-tap': { Component: Dyn_farmaco_vf_juggle_tap },
  'farmaco-protocol-tap-flow': { Component: Dyn_farmaco_protocol_tap_flow },
  'adolescent-vf-weave-tap': { Component: Dyn_adolescent_vf_weave_tap },
  'adolescent-z-classify-tap': { Component: Dyn_adolescent_z_classify_tap },
  'dose-calc-tap': { Component: Dyn_dose_calc_tap },
  'sae-decision-tap': { Component: Dyn_sae_decision_tap },
  'sonda-decision-tap': { Component: Dyn_sonda_decision_tap },
  'vitals-translate-tap': { Component: Dyn_vitals_translate_tap },
};

export function getLogicFlowBespoke(layoutVariant: string): BespokeVariantEntry | undefined {
  return LOGIC_FLOW_REGISTRY[layoutVariant];
}
