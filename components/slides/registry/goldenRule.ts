'use client';

/**
 * Registry dinâmico — golden_rule (bespoke). Genéricos ficam no router estático.
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

const Dyn_oxygen_rule_carousel = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleProtocolCarousel') as Promise<Record<string, unknown>>, 'GoldenRuleProtocolCarousel'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_bundle_mesh_reveal = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleMeshReveal') as Promise<Record<string, unknown>>, 'GoldenRuleMeshReveal'),
  { ssr: true, loading: () => null },
);

const Dyn_lab_prep_lens_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleLabPrepLensBoard') as Promise<Record<string, unknown>>, 'GoldenRuleLabPrepLensBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_dressing_match_matrix = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleDressingMatchMatrix') as Promise<Record<string, unknown>>, 'GoldenRuleDressingMatchMatrix'),
  { ssr: true, loading: () => null },
);

const Dyn_pni_interval_matrix = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePniIntervalMatrix') as Promise<Record<string, unknown>>, 'GoldenRulePniIntervalMatrix'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_nine_rights_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleCamNineRightsBoard') as Promise<Record<string, unknown>>, 'GoldenRuleCamNineRightsBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_high_risk_protocol_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleCamHighRiskProtocolBoard') as Promise<Record<string, unknown>>, 'GoldenRuleCamHighRiskProtocolBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_exceto_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleCamExcetoReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleCamExcetoReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_documentacao_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleCamDocumentacaoBoard') as Promise<Record<string, unknown>>, 'GoldenRuleCamDocumentacaoBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_differential_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleIvDifferentialBoard') as Promise<Record<string, unknown>>, 'GoldenRuleIvDifferentialBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_device_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleIvDeviceReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleIvDeviceReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_exceto_command_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleIvExcetoCommandBoard') as Promise<Record<string, unknown>>, 'GoldenRuleIvExcetoCommandBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_interval_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleIvIntervalBoard') as Promise<Record<string, unknown>>, 'GoldenRuleIvIntervalBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_antisepsis_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleIvAntisepsisBoard') as Promise<Record<string, unknown>>, 'GoldenRuleIvAntisepsisBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_pni_calendar_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePniCalendarBoard') as Promise<Record<string, unknown>>, 'GoldenRulePniCalendarBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_prenatal_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleMulherPrenatalBoard') as Promise<Record<string, unknown>>, 'GoldenRuleMulherPrenatalBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_parto_humanizado_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleMulherPartoHumanizadoBoard') as Promise<Record<string, unknown>>, 'GoldenRuleMulherPartoHumanizadoBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_papanicolau_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleMulherPapanicolauBoard') as Promise<Record<string, unknown>>, 'GoldenRuleMulherPapanicolauBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_mama_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleMulherMamaBoard') as Promise<Record<string, unknown>>, 'GoldenRuleMulherMamaBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_puerperio_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleMulherPuerperioBoard') as Promise<Record<string, unknown>>, 'GoldenRuleMulherPuerperioBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_planejamento_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleMulherPlanejamentoBoard') as Promise<Record<string, unknown>>, 'GoldenRuleMulherPlanejamentoBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_feeding_board = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'GoldenRuleCriancaFeedingBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_screening_board = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'GoldenRuleCriancaScreeningBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_pediatric_board = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'GoldenRuleCriancaPediatricBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_dehydration_board = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'GoldenRuleCriancaDehydrationBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_puericultura_board = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'GoldenRuleCriancaPuericulturaBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_neonatal_board = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'GoldenRuleCriancaNeonatalBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_dev_board = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'GoldenRuleCriancaDevBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_pni_temperature_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePniTemperatureRail') as Promise<Record<string, unknown>>, 'GoldenRulePniTemperatureRail'),
  { ssr: true, loading: () => null },
);

const Dyn_pni_exceto_rule_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePniExcetoBoard') as Promise<Record<string, unknown>>, 'GoldenRulePniExcetoBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_vitals_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleVitalsReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleVitalsReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_ist_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleIstReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleIstReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_biosseg_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleBiossegReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleBiossegReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_sae_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleSaeReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleSaeReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_sonda_measurement_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleSondaMeasurementBoard') as Promise<Record<string, unknown>>, 'GoldenRuleSondaMeasurementBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_via_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleViaReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleViaReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_pk_pd_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePkPdReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRulePkPdReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_farmaco_clinico_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleFarmacoClinicoReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleFarmacoClinicoReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_burn_rule_nine_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleBurnRuleNineBoard') as Promise<Record<string, unknown>>, 'GoldenRuleBurnRuleNineBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_crase_funnel_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePtCraseFunnelBoard') as Promise<Record<string, unknown>>, 'GoldenRulePtCraseFunnelBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_clitic_rail_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePtCliticRailBoard') as Promise<Record<string, unknown>>, 'GoldenRulePtCliticRailBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_comma_rail_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePtCommaRailBoard') as Promise<Record<string, unknown>>, 'GoldenRulePtCommaRailBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_term_matrix_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePtTermMatrixBoard') as Promise<Record<string, unknown>>, 'GoldenRulePtTermMatrixBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_classes_family_table = dynamic(
  () =>
    loadNamedVariant(
      () => import('../variants/GoldenRulePtClassesFamilyTable') as Promise<Record<string, unknown>>,
      'GoldenRulePtClassesFamilyTable',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_pt_classes_adverb_arrow_cards = dynamic(
  () =>
    loadNamedVariant(
      () =>
        import('../variants/GoldenRulePtClassesAdverbArrowCards') as Promise<Record<string, unknown>>,
      'GoldenRulePtClassesAdverbArrowCards',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_pt_classes_exceto_fix_board = dynamic(
  () =>
    loadNamedVariant(
      () =>
        import('../variants/GoldenRulePtClassesExcetoFixBoard') as Promise<Record<string, unknown>>,
      'GoldenRulePtClassesExcetoFixBoard',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_pt_subject_focus_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePtTermMatrixBoard') as Promise<Record<string, unknown>>, 'GoldenRulePtTermMatrixBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_trabalho_nr32_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleTrabalhoNr32ReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleTrabalhoNr32ReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_sp_nsp_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleSpNspReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleSpNspReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_respiratorio_spo2_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleRespiratorioSpo2ReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleRespiratorioSpo2ReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_mental_raps_tier_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleMentalRapsTierBoard') as Promise<Record<string, unknown>>, 'GoldenRuleMentalRapsTierBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_mental_crisis_ladder_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleMentalCrisisLadderBoard') as Promise<Record<string, unknown>>, 'GoldenRuleMentalCrisisLadderBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_preop_prep_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePeriPreopPrepBoard') as Promise<Record<string, unknown>>, 'GoldenRulePeriPreopPrepBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_aldrete_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePeriAldreteBoard') as Promise<Record<string, unknown>>, 'GoldenRulePeriAldreteBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_protocol_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePeriProtocolReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRulePeriProtocolReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_vf_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRulePeriVfReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRulePeriVfReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_rcp_params_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleUrgenciasRcpParamsBoard') as Promise<Record<string, unknown>>, 'GoldenRuleUrgenciasRcpParamsBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_trauma_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleUrgenciasTraumaReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleUrgenciasTraumaReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_cincinnati_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleUrgenciasCincinnatiBoard') as Promise<Record<string, unknown>>, 'GoldenRuleUrgenciasCincinnatiBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_shock_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleUrgenciasShockReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleUrgenciasShockReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_heimlich_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleUrgenciasHeimlichBoard') as Promise<Record<string, unknown>>, 'GoldenRuleUrgenciasHeimlichBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_pediatric_params_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleUrgenciasPediatricParamsBoard') as Promise<Record<string, unknown>>, 'GoldenRuleUrgenciasPediatricParamsBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_manchester_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleUrgenciasManchesterBoard') as Promise<Record<string, unknown>>, 'GoldenRuleUrgenciasManchesterBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_protocol_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleUrgenciasProtocolReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleUrgenciasProtocolReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_exceto_reference_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleUrgenciasExcetoReferenceBoard') as Promise<Record<string, unknown>>, 'GoldenRuleUrgenciasExcetoReferenceBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_etiology_letter_spectrum = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleEtiologyLetterSpectrum') as Promise<Record<string, unknown>>, 'GoldenRuleEtiologyLetterSpectrum'),
  { ssr: true, loading: () => null },
);

const Dyn_tb_precaution_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleTbPrecautionBoard') as Promise<Record<string, unknown>>, 'GoldenRuleTbPrecautionBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_itu_bundle_letter_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleItuBundleBoard') as Promise<Record<string, unknown>>, 'GoldenRuleItuBundleBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_sigilo_spectrum = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleAdolescentSigiloSpectrum') as Promise<Record<string, unknown>>, 'GoldenRuleAdolescentSigiloSpectrum'),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_speak_barrier_board = dynamic(
  () =>
    loadNamedVariant(
      () => import('../variants/GoldenRuleAdolescentSpeakBarrierBoard') as Promise<Record<string, unknown>>,
      'GoldenRuleAdolescentSpeakBarrierBoard',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_mental_hub_board = dynamic(
  () =>
    loadNamedVariant(
      () => import('../variants/GoldenRuleAdolescentMentalHubBoard') as Promise<Record<string, unknown>>,
      'GoldenRuleAdolescentMentalHubBoard',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_dev_vigilance_board = dynamic(
  () =>
    loadNamedVariant(
      () => import('../variants/GoldenRuleAdolescentDevVigilanceBoard') as Promise<Record<string, unknown>>,
      'GoldenRuleAdolescentDevVigilanceBoard',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_generic_finance_checklist = dynamic(
  () =>
    loadNamedVariant(
      () => import('../variants/GoldenRuleAdolescentGenericFinanceBoard') as Promise<Record<string, unknown>>,
      'GoldenRuleAdolescentGenericFinanceBoard',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_z_band_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleAdolescentZBandBoard') as Promise<Record<string, unknown>>, 'GoldenRuleAdolescentZBandBoard'),
  { ssr: true, loading: () => null },
);

const Dyn_soft_lens_board = dynamic(
  () => loadNamedVariant(() => import('../variants/GoldenRuleSoftLensBoard') as Promise<Record<string, unknown>>, 'GoldenRuleSoftLensBoard'),
  { ssr: true, loading: () => null },
);

export const GOLDEN_RULE_REGISTRY: Record<string, BespokeVariantEntry> = {
  'oxygen-rule-carousel': { Component: Dyn_oxygen_rule_carousel, requiresRows: true },
  'iv-bundle-mesh-reveal': { Component: Dyn_iv_bundle_mesh_reveal, requiresRows: true },
  'lab-prep-lens-board': { Component: Dyn_lab_prep_lens_board, requiresRows: true },
  'dressing-match-matrix': { Component: Dyn_dressing_match_matrix, requiresRows: true },
  'pni-interval-matrix': { Component: Dyn_pni_interval_matrix, requiresRows: true },
  'cam-nine-rights-board': { Component: Dyn_cam_nine_rights_board, requiresRows: true },
  'cam-high-risk-protocol-board': { Component: Dyn_cam_high_risk_protocol_board, requiresRows: true },
  'cam-exceto-reference-board': { Component: Dyn_cam_exceto_reference_board, requiresRows: true },
  'cam-documentacao-board': { Component: Dyn_cam_documentacao_board, requiresRows: true },
  'iv-differential-board': { Component: Dyn_iv_differential_board, requiresRows: true },
  'iv-device-reference-board': { Component: Dyn_iv_device_reference_board, requiresRows: true },
  'iv-exceto-command-board': { Component: Dyn_iv_exceto_command_board, requiresRows: true },
  'iv-interval-board': { Component: Dyn_iv_interval_board, requiresRows: true },
  'iv-antisepsis-board': { Component: Dyn_iv_antisepsis_board, requiresRows: true },
  'pni-calendar-board': { Component: Dyn_pni_calendar_board, requiresRows: true },
  'mulher-prenatal-board': { Component: Dyn_mulher_prenatal_board, requiresRows: true },
  'mulher-parto-humanizado-board': { Component: Dyn_mulher_parto_humanizado_board, requiresRows: true },
  'mulher-papanicolau-board': { Component: Dyn_mulher_papanicolau_board, requiresRows: true },
  'mulher-mama-board': { Component: Dyn_mulher_mama_board, requiresRows: true },
  'mulher-puerperio-board': { Component: Dyn_mulher_puerperio_board, requiresRows: true },
  'mulher-planejamento-board': { Component: Dyn_mulher_planejamento_board, requiresRows: true },
  'crianca-feeding-board': { Component: Dyn_crianca_feeding_board, requiresRows: true },
  'crianca-screening-board': { Component: Dyn_crianca_screening_board, requiresRows: true },
  'crianca-pediatric-board': { Component: Dyn_crianca_pediatric_board, requiresRows: true },
  'crianca-dehydration-board': { Component: Dyn_crianca_dehydration_board, requiresRows: true },
  'crianca-puericultura-board': { Component: Dyn_crianca_puericultura_board, requiresRows: true },
  'crianca-neonatal-board': { Component: Dyn_crianca_neonatal_board, requiresRows: true },
  'crianca-dev-board': { Component: Dyn_crianca_dev_board, requiresRows: true },
  'pni-temperature-rail': { Component: Dyn_pni_temperature_rail, requiresRows: true },
  'pni-exceto-rule-board': { Component: Dyn_pni_exceto_rule_board, requiresRows: true },
  'vitals-reference-board': { Component: Dyn_vitals_reference_board, requiresRows: true },
  'ist-reference-board': { Component: Dyn_ist_reference_board, requiresRows: true },
  'biosseg-reference-board': { Component: Dyn_biosseg_reference_board, requiresRows: true },
  'sae-reference-board': { Component: Dyn_sae_reference_board, requiresRows: true },
  'sonda-measurement-board': { Component: Dyn_sonda_measurement_board, requiresRows: true },
  'via-reference-board': { Component: Dyn_via_reference_board, requiresRows: true },
  'pk-pd-reference-board': { Component: Dyn_pk_pd_reference_board, requiresRows: true },
  'farmaco-clinico-reference-board': { Component: Dyn_farmaco_clinico_reference_board, requiresRows: true },
  'burn-rule-nine-board': { Component: Dyn_burn_rule_nine_board, requiresRows: true },
  'pt-crase-funnel-board': { Component: Dyn_pt_crase_funnel_board, requiresRows: true },
  'pt-clitic-rail-board': { Component: Dyn_pt_clitic_rail_board, requiresRows: true },
  'pt-comma-rail-board': { Component: Dyn_pt_comma_rail_board, requiresRows: true },
  'pt-term-matrix-board': { Component: Dyn_pt_term_matrix_board, requiresRows: true },
  'pt-classes-family-table': { Component: Dyn_pt_classes_family_table, requiresRows: true },
  'pt-classes-adverb-arrow-cards': {
    Component: Dyn_pt_classes_adverb_arrow_cards,
    requiresRows: true,
  },
  'pt-classes-exceto-fix-board': {
    Component: Dyn_pt_classes_exceto_fix_board,
    requiresRows: true,
  },
  'pt-subject-focus-board': { Component: Dyn_pt_subject_focus_board, requiresRows: true },
  'trabalho-nr32-reference-board': { Component: Dyn_trabalho_nr32_reference_board, requiresRows: true },
  'sp-nsp-reference-board': { Component: Dyn_sp_nsp_reference_board, requiresRows: true },
  'respiratorio-spo2-reference-board': { Component: Dyn_respiratorio_spo2_reference_board, requiresRows: true },
  'mental-raps-tier-board': { Component: Dyn_mental_raps_tier_board, requiresRows: true },
  'mental-crisis-ladder-board': { Component: Dyn_mental_crisis_ladder_board, requiresRows: true },
  'peri-preop-prep-board': { Component: Dyn_peri_preop_prep_board, requiresRows: true },
  'peri-aldrete-board': { Component: Dyn_peri_aldrete_board, requiresRows: true },
  'peri-protocol-reference-board': { Component: Dyn_peri_protocol_reference_board, requiresRows: true },
  'peri-vf-reference-board': { Component: Dyn_peri_vf_reference_board, requiresRows: true },
  'urgencias-rcp-params-board': { Component: Dyn_urgencias_rcp_params_board, requiresRows: true },
  'urgencias-trauma-reference-board': { Component: Dyn_urgencias_trauma_reference_board, requiresRows: true },
  'urgencias-cincinnati-board': { Component: Dyn_urgencias_cincinnati_board, requiresRows: true },
  'urgencias-shock-reference-board': { Component: Dyn_urgencias_shock_reference_board, requiresRows: true },
  'urgencias-heimlich-board': { Component: Dyn_urgencias_heimlich_board, requiresRows: true },
  'urgencias-pediatric-params-board': { Component: Dyn_urgencias_pediatric_params_board, requiresRows: true },
  'urgencias-manchester-board': { Component: Dyn_urgencias_manchester_board, requiresRows: true },
  'urgencias-protocol-reference-board': { Component: Dyn_urgencias_protocol_reference_board, requiresRows: true },
  'urgencias-exceto-reference-board': { Component: Dyn_urgencias_exceto_reference_board, requiresRows: true },
  'etiology-letter-spectrum': { Component: Dyn_etiology_letter_spectrum, requiresRows: true },
  'tb-precaution-board': { Component: Dyn_tb_precaution_board, requiresRows: true },
  'itu-bundle-letter-board': { Component: Dyn_itu_bundle_letter_board, requiresRows: true },
  'adolescent-sigilo-spectrum': { Component: Dyn_adolescent_sigilo_spectrum, requiresRows: true },
  'adolescent-speak-barrier-board': { Component: Dyn_adolescent_speak_barrier_board, requiresRows: true },
  'adolescent-z-band-board': { Component: Dyn_adolescent_z_band_board, requiresRows: true },
  'adolescent-mental-hub-board': { Component: Dyn_adolescent_mental_hub_board, requiresRows: true },
  'adolescent-dev-vigilance-board': { Component: Dyn_adolescent_dev_vigilance_board, requiresRows: true },
  'adolescent-generic-finance-checklist': {
    Component: Dyn_adolescent_generic_finance_checklist,
    requiresRows: true,
  },
  'soft-lens-board': { Component: Dyn_soft_lens_board, requiresRows: true },
};

export function getGoldenRuleBespoke(layoutVariant: string): BespokeVariantEntry | undefined {
  return GOLDEN_RULE_REGISTRY[layoutVariant];
}
