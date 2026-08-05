'use client';

/**
 * Registry dinâmico — danger_zone (bespoke). Genéricos ficam no router estático.
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

const Dyn_catheter_danger_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneCatheterArena') as Promise<Record<string, unknown>>, 'DangerZoneCatheterArena'),
  { ssr: true, loading: () => null },
);

const Dyn_lab_prep_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneLabPrepTrap') as Promise<Record<string, unknown>>, 'DangerZoneLabPrepTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_lab_specimen_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneLabSpecimenArena') as Promise<Record<string, unknown>>, 'DangerZoneLabSpecimenArena'),
  { ssr: true, loading: () => null },
);

const Dyn_dressing_choice_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneDressingChoiceArena') as Promise<Record<string, unknown>>, 'DangerZoneDressingChoiceArena'),
  { ssr: true, loading: () => null },
);

const Dyn_burn_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneBurnTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneBurnTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_trabalho_pep_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneTrabalhoPepTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneTrabalhoPepTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_sp_safety_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneSpSafetyTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneSpSafetyTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_respiratorio_spo2_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneRespiratorioSpo2TrapArena') as Promise<Record<string, unknown>>, 'DangerZoneRespiratorioSpo2TrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_mental_raps_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneMentalRapsTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneMentalRapsTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_mental_crisis_coercion_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneMentalCrisisCoercionTrap') as Promise<Record<string, unknown>>, 'DangerZoneMentalCrisisCoercionTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_preop_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZonePeriPreopTrapArena') as Promise<Record<string, unknown>>, 'DangerZonePeriPreopTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_srpa_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZonePeriSrpaTrapArena') as Promise<Record<string, unknown>>, 'DangerZonePeriSrpaTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_protocol_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZonePeriProtocolTrapArena') as Promise<Record<string, unknown>>, 'DangerZonePeriProtocolTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_vf_trap_chips = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZonePeriVfTrapChips') as Promise<Record<string, unknown>>, 'DangerZonePeriVfTrapChips'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_rcp_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneUrgenciasRcpTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneUrgenciasRcpTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_trauma_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneUrgenciasTraumaTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneUrgenciasTraumaTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_stroke_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneUrgenciasStrokeTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneUrgenciasStrokeTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_shock_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneUrgenciasShockTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneUrgenciasShockTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_choking_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneUrgenciasChokingTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneUrgenciasChokingTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_pediatric_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneUrgenciasPediatricTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneUrgenciasPediatricTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_manchester_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneUrgenciasManchesterTrap') as Promise<Record<string, unknown>>, 'DangerZoneUrgenciasManchesterTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_protocol_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneUrgenciasProtocolTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneUrgenciasProtocolTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_exceto_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneUrgenciasExcetoTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneUrgenciasExcetoTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_pni_trap_chips = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZonePniTrapChips') as Promise<Record<string, unknown>>, 'DangerZonePniTrapChips'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_prenatal_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneMulherPrenatalTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneMulherPrenatalTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_parto_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneMulherPartoTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneMulherPartoTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_screening_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneMulherScreeningTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneMulherScreeningTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_mama_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneMulherMamaTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneMulherMamaTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_puerperio_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneMulherPuerperioTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneMulherPuerperioTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_planejamento_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneMulherPlanejamentoTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneMulherPlanejamentoTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_feeding_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'DangerZoneCriancaFeedingTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_screening_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'DangerZoneCriancaScreeningTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_pediatric_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'DangerZoneCriancaPediatricTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_dehydration_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'DangerZoneCriancaDehydrationTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_puericultura_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'DangerZoneCriancaPuericulturaTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_neonatal_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'DangerZoneCriancaNeonatalTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_dev_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'DangerZoneCriancaDevTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_certos_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneCamCertosTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneCamCertosTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_crase_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZonePtCraseTrapArena') as Promise<Record<string, unknown>>, 'DangerZonePtCraseTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_clitic_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZonePtCliticTrapArena') as Promise<Record<string, unknown>>, 'DangerZonePtCliticTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_comma_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZonePtCommaTrapArena') as Promise<Record<string, unknown>>, 'DangerZonePtCommaTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_term_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZonePtTermTrapArena') as Promise<Record<string, unknown>>, 'DangerZonePtTermTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_subject_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZonePtTermTrapArena') as Promise<Record<string, unknown>>, 'DangerZonePtTermTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_high_risk_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneCamHighRiskTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneCamHighRiskTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_exceto_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneCamExcetoTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneCamExcetoTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_documentacao_trap_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneCamDocumentacaoTrapArena') as Promise<Record<string, unknown>>, 'DangerZoneCamDocumentacaoTrapArena'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_label_swap_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneIvLabelSwapTrap') as Promise<Record<string, unknown>>, 'DangerZoneIvLabelSwapTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_gauge_mismatch_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneIvGaugeMismatchTrap') as Promise<Record<string, unknown>>, 'DangerZoneIvGaugeMismatchTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_exceto_intruder_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneIvExcetoIntruderTrap') as Promise<Record<string, unknown>>, 'DangerZoneIvExcetoIntruderTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_interval_swap_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneIvIntervalSwapTrap') as Promise<Record<string, unknown>>, 'DangerZoneIvIntervalSwapTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_order_invert_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneIvOrderInvertTrap') as Promise<Record<string, unknown>>, 'DangerZoneIvOrderInvertTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_bundle_break_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneIvBundleBreakTrap') as Promise<Record<string, unknown>>, 'DangerZoneIvBundleBreakTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_ist_trap_chips = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneIstTrapChips') as Promise<Record<string, unknown>>, 'DangerZoneIstTrapChips'),
  { ssr: true, loading: () => null },
);

const Dyn_biosseg_trap_chips = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneBiossegTrapChips') as Promise<Record<string, unknown>>, 'DangerZoneBiossegTrapChips'),
  { ssr: true, loading: () => null },
);

const Dyn_etiology_intruder_chips = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneEtiologyIntruderChips') as Promise<Record<string, unknown>>, 'DangerZoneEtiologyIntruderChips'),
  { ssr: true, loading: () => null },
);

const Dyn_tb_transmission_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneTbTransmissionTrap') as Promise<Record<string, unknown>>, 'DangerZoneTbTransmissionTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_itu_catheter_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneItuCatheterTrap') as Promise<Record<string, unknown>>, 'DangerZoneItuCatheterTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_consent_gate = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneAdolescentConsentGate') as Promise<Record<string, unknown>>, 'DangerZoneAdolescentConsentGate'),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_exceto_compare = dynamic(
  () =>
    loadNamedVariant(
      () => import('../variants/DangerZoneAdolescentExcetoCompare') as Promise<Record<string, unknown>>,
      'DangerZoneAdolescentExcetoCompare',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_pni_exceto_compare = dynamic(
  () =>
    loadNamedVariant(
      () => import('../variants/DangerZonePniExcetoCompare') as Promise<Record<string, unknown>>,
      'DangerZonePniExcetoCompare',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_pni_via_trap_arena = dynamic(
  () =>
    loadNamedVariant(
      () => import('../variants/DangerZonePniViaTrapArena') as Promise<Record<string, unknown>>,
      'DangerZonePniViaTrapArena',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_z_threshold_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneAdolescentZThresholdTrap') as Promise<Record<string, unknown>>, 'DangerZoneAdolescentZThresholdTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_vitals_classify_arena = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneVitalsClassifyArena') as Promise<Record<string, unknown>>, 'DangerZoneVitalsClassifyArena'),
  { ssr: true, loading: () => null },
);

const Dyn_trap_reveal = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneTrapReveal') as Promise<Record<string, unknown>>, 'DangerZoneTrapReveal'),
  { ssr: true, loading: () => null },
);

const Dyn_calendar_mismatch = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneCalendarMismatch') as Promise<Record<string, unknown>>, 'DangerZoneCalendarMismatch'),
  { ssr: true, loading: () => null },
);

const Dyn_temperature_mismatch = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneTemperatureMismatch') as Promise<Record<string, unknown>>, 'DangerZoneTemperatureMismatch'),
  { ssr: true, loading: () => null },
);

const Dyn_norm_reveal = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneNormReveal') as Promise<Record<string, unknown>>, 'DangerZoneNormReveal'),
  { ssr: true, loading: () => null },
);

const Dyn_scope_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneScopeTrap') as Promise<Record<string, unknown>>, 'DangerZoneScopeTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_route_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneRouteTrap') as Promise<Record<string, unknown>>, 'DangerZoneRouteTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_dose_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneDoseTrap') as Promise<Record<string, unknown>>, 'DangerZoneDoseTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_farmaco_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneFarmacoTrap') as Promise<Record<string, unknown>>, 'DangerZoneFarmacoTrap'),
  { ssr: true, loading: () => null },
);

const Dyn_farmaco_clinico_trap = dynamic(
  () => loadNamedVariant(() => import('../variants/DangerZoneFarmacoClinicoTrap') as Promise<Record<string, unknown>>, 'DangerZoneFarmacoClinicoTrap'),
  { ssr: true, loading: () => null },
);

export const DANGER_ZONE_REGISTRY: Record<string, BespokeVariantEntry> = {
  'catheter-danger-arena': { Component: Dyn_catheter_danger_arena, requiresItems: true },
  'lab-prep-trap': { Component: Dyn_lab_prep_trap, requiresItems: true },
  'lab-specimen-arena': { Component: Dyn_lab_specimen_arena, requiresItems: true },
  'dressing-choice-arena': { Component: Dyn_dressing_choice_arena, requiresItems: true },
  'burn-trap-arena': { Component: Dyn_burn_trap_arena, requiresItems: true },
  'trabalho-pep-trap-arena': { Component: Dyn_trabalho_pep_trap_arena, requiresItems: true },
  'sp-safety-trap-arena': { Component: Dyn_sp_safety_trap_arena, requiresItems: true },
  'respiratorio-spo2-trap-arena': { Component: Dyn_respiratorio_spo2_trap_arena, requiresItems: true },
  'mental-raps-trap-arena': { Component: Dyn_mental_raps_trap_arena, requiresItems: true },
  'mental-crisis-coercion-trap': { Component: Dyn_mental_crisis_coercion_trap, requiresItems: true },
  'peri-preop-trap-arena': { Component: Dyn_peri_preop_trap_arena, requiresItems: true },
  'peri-srpa-trap-arena': { Component: Dyn_peri_srpa_trap_arena, requiresItems: true },
  'peri-protocol-trap-arena': { Component: Dyn_peri_protocol_trap_arena, requiresItems: true },
  'peri-vf-trap-chips': { Component: Dyn_peri_vf_trap_chips, requiresItems: true },
  'urgencias-rcp-trap-arena': { Component: Dyn_urgencias_rcp_trap_arena, requiresItems: true },
  'urgencias-trauma-trap-arena': { Component: Dyn_urgencias_trauma_trap_arena, requiresItems: true },
  'urgencias-stroke-trap-arena': { Component: Dyn_urgencias_stroke_trap_arena, requiresItems: true },
  'urgencias-shock-trap-arena': { Component: Dyn_urgencias_shock_trap_arena, requiresItems: true },
  'urgencias-choking-trap-arena': { Component: Dyn_urgencias_choking_trap_arena, requiresItems: true },
  'urgencias-pediatric-trap-arena': { Component: Dyn_urgencias_pediatric_trap_arena, requiresItems: true },
  'urgencias-manchester-trap': { Component: Dyn_urgencias_manchester_trap, requiresItems: true },
  'urgencias-protocol-trap-arena': { Component: Dyn_urgencias_protocol_trap_arena, requiresItems: true },
  'urgencias-exceto-trap-arena': { Component: Dyn_urgencias_exceto_trap_arena, requiresItems: true },
  'pni-trap-chips': { Component: Dyn_pni_trap_chips, requiresItems: true },
  'mulher-prenatal-trap-arena': { Component: Dyn_mulher_prenatal_trap_arena, requiresItems: true },
  'mulher-parto-trap-arena': { Component: Dyn_mulher_parto_trap_arena, requiresItems: true },
  'mulher-screening-trap-arena': { Component: Dyn_mulher_screening_trap_arena, requiresItems: true },
  'mulher-mama-trap-arena': { Component: Dyn_mulher_mama_trap_arena, requiresItems: true },
  'mulher-puerperio-trap-arena': { Component: Dyn_mulher_puerperio_trap_arena, requiresItems: true },
  'mulher-planejamento-trap-arena': { Component: Dyn_mulher_planejamento_trap_arena, requiresItems: true },
  'crianca-feeding-trap-arena': { Component: Dyn_crianca_feeding_trap_arena, requiresItems: true },
  'crianca-screening-trap-arena': { Component: Dyn_crianca_screening_trap_arena, requiresItems: true },
  'crianca-pediatric-trap-arena': { Component: Dyn_crianca_pediatric_trap_arena, requiresItems: true },
  'crianca-dehydration-trap-arena': { Component: Dyn_crianca_dehydration_trap_arena, requiresItems: true },
  'crianca-puericultura-trap-arena': { Component: Dyn_crianca_puericultura_trap_arena, requiresItems: true },
  'crianca-neonatal-trap-arena': { Component: Dyn_crianca_neonatal_trap_arena, requiresItems: true },
  'crianca-dev-trap-arena': { Component: Dyn_crianca_dev_trap_arena, requiresItems: true },
  'cam-certos-trap-arena': { Component: Dyn_cam_certos_trap_arena, requiresItems: true },
  'pt-crase-trap-arena': { Component: Dyn_pt_crase_trap_arena, requiresItems: true },
  'pt-clitic-trap-arena': { Component: Dyn_pt_clitic_trap_arena, requiresItems: true },
  'pt-comma-trap-arena': { Component: Dyn_pt_comma_trap_arena, requiresItems: true },
  'pt-term-trap-arena': { Component: Dyn_pt_term_trap_arena, requiresItems: true },
  'pt-subject-trap-arena': { Component: Dyn_pt_subject_trap_arena, requiresItems: true },
  'cam-high-risk-trap-arena': { Component: Dyn_cam_high_risk_trap_arena, requiresItems: true },
  'cam-exceto-trap-arena': { Component: Dyn_cam_exceto_trap_arena, requiresItems: true },
  'cam-documentacao-trap-arena': { Component: Dyn_cam_documentacao_trap_arena, requiresItems: true },
  'iv-label-swap-trap': { Component: Dyn_iv_label_swap_trap, requiresItems: true },
  'iv-gauge-mismatch-trap': { Component: Dyn_iv_gauge_mismatch_trap, requiresItems: true },
  'iv-exceto-intruder-trap': { Component: Dyn_iv_exceto_intruder_trap, requiresItems: true },
  'iv-interval-swap-trap': { Component: Dyn_iv_interval_swap_trap, requiresItems: true },
  'iv-order-invert-trap': { Component: Dyn_iv_order_invert_trap, requiresItems: true },
  'iv-bundle-break-trap': { Component: Dyn_iv_bundle_break_trap, requiresItems: true },
  'ist-trap-chips': { Component: Dyn_ist_trap_chips, requiresItems: true },
  'biosseg-trap-chips': { Component: Dyn_biosseg_trap_chips, requiresItems: true },
  'etiology-intruder-chips': { Component: Dyn_etiology_intruder_chips, requiresItems: true },
  'tb-transmission-trap': { Component: Dyn_tb_transmission_trap, requiresItems: true },
  'itu-catheter-trap': { Component: Dyn_itu_catheter_trap, requiresItems: true },
  'adolescent-consent-gate': { Component: Dyn_adolescent_consent_gate, requiresItems: true },
  'adolescent-exceto-compare': { Component: Dyn_adolescent_exceto_compare, requiresItems: true },
  'pni-exceto-compare': { Component: Dyn_pni_exceto_compare, requiresItems: true },
  'pni-via-trap-arena': { Component: Dyn_pni_via_trap_arena, requiresItems: true },
  'adolescent-z-threshold-trap': { Component: Dyn_adolescent_z_threshold_trap, requiresItems: true },
  'vitals-classify-arena': { Component: Dyn_vitals_classify_arena, requiresItems: true },
  'trap-reveal': { Component: Dyn_trap_reveal, requiresItems: true },
  'calendar-mismatch': { Component: Dyn_calendar_mismatch, requiresItems: true },
  'temperature-mismatch': { Component: Dyn_temperature_mismatch, requiresItems: true },
  'norm-reveal': { Component: Dyn_norm_reveal, requiresItems: true },
  'scope-trap': { Component: Dyn_scope_trap, requiresItems: true },
  'route-trap': { Component: Dyn_route_trap, requiresItems: true },
  'dose-trap': { Component: Dyn_dose_trap, requiresItems: true },
  'farmaco-trap': { Component: Dyn_farmaco_trap, requiresItems: true },
  'farmaco-clinico-trap': { Component: Dyn_farmaco_clinico_trap, requiresItems: true },
};

export function getDangerZoneBespoke(layoutVariant: string): BespokeVariantEntry | undefined {
  return DANGER_ZONE_REGISTRY[layoutVariant];
}
