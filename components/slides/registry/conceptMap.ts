'use client';

/**
 * Registry dinâmico — concept_map (bespoke). Genéricos ficam no router estático.
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

const Dyn_morphological = dynamic(
  () => loadNamedVariant(() => import('../variants/MorphologicalConceptMap') as Promise<Record<string, unknown>>, 'MorphologicalConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_procedure_protocol = dynamic(
  () => loadNamedVariant(() => import('../variants/ProcedureProtocolConceptMap') as Promise<Record<string, unknown>>, 'ProcedureProtocolConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_vitals_panel = dynamic(
  () => loadNamedVariant(() => import('../variants/VitalsPanelConceptMap') as Promise<Record<string, unknown>>, 'VitalsPanelConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_survival_chain = dynamic(
  () => loadNamedVariant(() => import('../variants/SurvivalChainConceptMap') as Promise<Record<string, unknown>>, 'SurvivalChainConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_vaccine_timeline = dynamic(
  () => loadNamedVariant(() => import('../variants/VaccineTimelineConceptMap') as Promise<Record<string, unknown>>, 'VaccineTimelineConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_gestation_timeline = dynamic(
  () => loadNamedVariant(() => import('../variants/MulherGestationTimelineConceptMap') as Promise<Record<string, unknown>>, 'MulherGestationTimelineConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_labor_phase_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/MulherLaborPhaseDeckConceptMap') as Promise<Record<string, unknown>>, 'MulherLaborPhaseDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_screening_spectrum = dynamic(
  () => loadNamedVariant(() => import('../variants/MulherScreeningSpectrumConceptMap') as Promise<Record<string, unknown>>, 'MulherScreeningSpectrumConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_mammography_spectrum = dynamic(
  () => loadNamedVariant(() => import('../variants/MulherMammographySpectrumConceptMap') as Promise<Record<string, unknown>>, 'MulherMammographySpectrumConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_puerperio_timeline = dynamic(
  () => loadNamedVariant(() => import('../variants/MulherPuerperioTimelineConceptMap') as Promise<Record<string, unknown>>, 'MulherPuerperioTimelineConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_mulher_contraception_spectrum = dynamic(
  () => loadNamedVariant(() => import('../variants/MulherContraceptionSpectrumConceptMap') as Promise<Record<string, unknown>>, 'MulherContraceptionSpectrumConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_feeding_timeline = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'CriancaFeedingTimelineConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_screening_timeline = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'CriancaScreeningTimelineConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_pediatric_hub = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'CriancaPediatricHubConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_dehydration_spectrum = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'CriancaDehydrationSpectrumConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_puericultura_timeline = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'CriancaPuericulturaTimelineConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_neonatal_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'CriancaNeonatalDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_crianca_dev_milestones_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/criancaVariants') as Promise<Record<string, unknown>>, 'CriancaDevMilestonesRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_cold_chain_hub = dynamic(
  () => loadNamedVariant(() => import('../variants/ColdChainHubConceptMap') as Promise<Record<string, unknown>>, 'ColdChainHubConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_pni_rules_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/PniRulesDeckConceptMap') as Promise<Record<string, unknown>>, 'PniRulesDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_certos_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/CamCertosDeckConceptMap') as Promise<Record<string, unknown>>, 'CamCertosDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_crase_funnel_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/PtCraseFunnelDeckConceptMap') as Promise<Record<string, unknown>>, 'PtCraseFunnelDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_clitic_rail_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/PtCliticRailDeckConceptMap') as Promise<Record<string, unknown>>, 'PtCliticRailDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_comma_rail_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/PtCommaRailDeckConceptMap') as Promise<Record<string, unknown>>, 'PtCommaRailDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_term_matrix_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/PtTermMatrixDeckConceptMap') as Promise<Record<string, unknown>>, 'PtTermMatrixDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_pt_subject_focus_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/PtTermMatrixDeckConceptMap') as Promise<Record<string, unknown>>, 'PtTermMatrixDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_high_risk_duo_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/CamHighRiskDuoDeckConceptMap') as Promise<Record<string, unknown>>, 'CamHighRiskDuoDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_exceto_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/CamExcetoRailConceptMap') as Promise<Record<string, unknown>>, 'CamExcetoRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_cam_documentacao_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/CamDocumentacaoDeckConceptMap') as Promise<Record<string, unknown>>, 'CamDocumentacaoDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_sae_documentation = dynamic(
  () => loadNamedVariant(() => import('../variants/SaeDocumentationConceptMap') as Promise<Record<string, unknown>>, 'SaeDocumentationConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_sae_responsibility_matrix = dynamic(
  () => loadNamedVariant(() => import('../variants/SaeResponsibilityMatrix') as Promise<Record<string, unknown>>, 'SaeResponsibilityMatrix'),
  { ssr: true, loading: () => null },
);

const Dyn_sus_legal_pillars = dynamic(
  () => loadNamedVariant(() => import('../variants/SusLegalPillarsConceptMap') as Promise<Record<string, unknown>>, 'SusLegalPillarsConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_sus_art4_orbit = dynamic(
  () => loadNamedVariant(() => import('../variants/SusArt4OrbitConceptMap') as Promise<Record<string, unknown>>, 'SusArt4OrbitConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_absorption_speed_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/AbsorptionSpeedRailConceptMap') as Promise<Record<string, unknown>>, 'AbsorptionSpeedRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_adme_journey_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/AdmeJourneyRailConceptMap') as Promise<Record<string, unknown>>, 'AdmeJourneyRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_infusao_ev_station_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/InfusaoEvStationDeckConceptMap') as Promise<Record<string, unknown>>, 'InfusaoEvStationDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_dose_equivalence_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/DoseEquivalenceRailConceptMap') as Promise<Record<string, unknown>>, 'DoseEquivalenceRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_oxygen_protocol_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/OxygenProtocolDeckConceptMap') as Promise<Record<string, unknown>>, 'OxygenProtocolDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_care_orbit = dynamic(
  () => loadNamedVariant(() => import('../variants/IvCareOrbitConceptMap') as Promise<Record<string, unknown>>, 'IvCareOrbitConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_complication_tissue_layers = dynamic(
  () => loadNamedVariant(() => import('../variants/IvComplicationTissueLayersConceptMap') as Promise<Record<string, unknown>>, 'IvComplicationTissueLayersConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_gauge_matrix = dynamic(
  () => loadNamedVariant(() => import('../variants/IvGaugeMatrixConceptMap') as Promise<Record<string, unknown>>, 'IvGaugeMatrixConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_exceto_spectrum = dynamic(
  () => loadNamedVariant(() => import('../variants/IvExcetoSpectrumConceptMap') as Promise<Record<string, unknown>>, 'IvExcetoSpectrumConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_interval_timeline = dynamic(
  () => loadNamedVariant(() => import('../variants/IvIntervalTimelineConceptMap') as Promise<Record<string, unknown>>, 'IvIntervalTimelineConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_puncture_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/IvPunctureRailConceptMap') as Promise<Record<string, unknown>>, 'IvPunctureRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_iv_bundle_orbit = dynamic(
  () => loadNamedVariant(() => import('../variants/IvBundleOrbitConceptMap') as Promise<Record<string, unknown>>, 'IvBundleOrbitConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_morphing_timeline = dynamic(
  () => loadNamedVariant(() => import('../variants/MorphingTimelineConceptMap') as Promise<Record<string, unknown>>, 'MorphingTimelineConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_lab_specimen_chain = dynamic(
  () => loadNamedVariant(() => import('../variants/LabSpecimenChainConceptMap') as Promise<Record<string, unknown>>, 'LabSpecimenChainConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_wound_stage_tissue_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/WoundStageTissueDeckConceptMap') as Promise<Record<string, unknown>>, 'WoundStageTissueDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_burn_depth_layer_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/BurnDepthLayerDeckConceptMap') as Promise<Record<string, unknown>>, 'BurnDepthLayerDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_ist_risk_routes_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/IstRiskRoutesDeckConceptMap') as Promise<Record<string, unknown>>, 'IstRiskRoutesDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_privacy_curtain = dynamic(
  () => loadNamedVariant(() => import('../variants/AdolescentPrivacyCurtainConceptMap') as Promise<Record<string, unknown>>, 'AdolescentPrivacyCurtainConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_care_pillars_deck = dynamic(
  () =>
    loadNamedVariant(
      () => import('../variants/ConceptMapAdolescentCarePillarsDeck') as Promise<Record<string, unknown>>,
      'ConceptMapAdolescentCarePillarsDeck',
    ),
  { ssr: true, loading: () => null },
);

const Dyn_adolescent_growth_z_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/AdolescentGrowthZRailConceptMap') as Promise<Record<string, unknown>>, 'AdolescentGrowthZRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_nr32_annex_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/Nr32AnnexDeckConceptMap') as Promise<Record<string, unknown>>, 'Nr32AnnexDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_sp_id_verify_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/SpIdVerifyDeckConceptMap') as Promise<Record<string, unknown>>, 'SpIdVerifyDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_sp_fall_risk_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/SpFallRiskRailConceptMap') as Promise<Record<string, unknown>>, 'SpFallRiskRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_sp_incident_taxonomy_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/SpIncidentTaxonomyDeckConceptMap') as Promise<Record<string, unknown>>, 'SpIncidentTaxonomyDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_respiratorio_asma_dpoc_duel_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/RespiratorioAsmaDpocDuelDeckConceptMap') as Promise<Record<string, unknown>>, 'RespiratorioAsmaDpocDuelDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_mental_raps_network_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/MentalRapsNetworkRailConceptMap') as Promise<Record<string, unknown>>, 'MentalRapsNetworkRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_mental_crisis_signal_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/MentalCrisisSignalDeckConceptMap') as Promise<Record<string, unknown>>, 'MentalCrisisSignalDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_preop_phase_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/PeriPreopPhaseDeckConceptMap') as Promise<Record<string, unknown>>, 'PeriPreopPhaseDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_srpa_monitor_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/PeriSrpaMonitorDeckConceptMap') as Promise<Record<string, unknown>>, 'PeriSrpaMonitorDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_protocol_checklist_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/PeriProtocolChecklistDeckConceptMap') as Promise<Record<string, unknown>>, 'PeriProtocolChecklistDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_peri_vf_assertions_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/PeriVfAssertionsDeckConceptMap') as Promise<Record<string, unknown>>, 'PeriVfAssertionsDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_survival_chain_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/UrgenciasSurvivalChainDeckConceptMap') as Promise<Record<string, unknown>>, 'UrgenciasSurvivalChainDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_xabcde_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/UrgenciasXabcdeRailConceptMap') as Promise<Record<string, unknown>>, 'UrgenciasXabcdeRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_stroke_signs_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/UrgenciasStrokeSignsDeckConceptMap') as Promise<Record<string, unknown>>, 'UrgenciasStrokeSignsDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_shock_types_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/UrgenciasShockTypesDeckConceptMap') as Promise<Record<string, unknown>>, 'UrgenciasShockTypesDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_choking_signal_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/UrgenciasChokingSignalDeckConceptMap') as Promise<Record<string, unknown>>, 'UrgenciasChokingSignalDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_pediatric_rcp_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/UrgenciasPediatricRcpDeckConceptMap') as Promise<Record<string, unknown>>, 'UrgenciasPediatricRcpDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_manchester_spectrum = dynamic(
  () => loadNamedVariant(() => import('../variants/UrgenciasManchesterSpectrumConceptMap') as Promise<Record<string, unknown>>, 'UrgenciasManchesterSpectrumConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_protocol_rules_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/UrgenciasProtocolRulesDeckConceptMap') as Promise<Record<string, unknown>>, 'UrgenciasProtocolRulesDeckConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_exceto_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/UrgenciasExcetoRailConceptMap') as Promise<Record<string, unknown>>, 'UrgenciasExcetoRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_urgencias_emergency_hub = dynamic(
  () => loadNamedVariant(() => import('../variants/UrgenciasEmergencyHubConceptMap') as Promise<Record<string, unknown>>, 'UrgenciasEmergencyHubConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_etiology_kingdom_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/EtiologyKingdomRailConceptMap') as Promise<Record<string, unknown>>, 'EtiologyKingdomRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_tb_vigilance_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/TbVigilanceRailConceptMap') as Promise<Record<string, unknown>>, 'TbVigilanceRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_itu_closed_system_rail = dynamic(
  () => loadNamedVariant(() => import('../variants/ItuClosedSystemRailConceptMap') as Promise<Record<string, unknown>>, 'ItuClosedSystemRailConceptMap'),
  { ssr: true, loading: () => null },
);

const Dyn_biosseg_precaution_deck = dynamic(
  () => loadNamedVariant(() => import('../variants/BiossegPrecautionDeckConceptMap') as Promise<Record<string, unknown>>, 'BiossegPrecautionDeckConceptMap'),
  { ssr: true, loading: () => null },
);

export const CONCEPT_MAP_REGISTRY: Record<string, BespokeVariantEntry> = {
  'morphological': { Component: Dyn_morphological },
  'procedure-protocol': { Component: Dyn_procedure_protocol },
  'vitals-panel': { Component: Dyn_vitals_panel },
  'survival-chain': { Component: Dyn_survival_chain },
  'vaccine-timeline': { Component: Dyn_vaccine_timeline },
  'mulher-gestation-timeline': { Component: Dyn_mulher_gestation_timeline },
  'mulher-labor-phase-deck': { Component: Dyn_mulher_labor_phase_deck },
  'mulher-screening-spectrum': { Component: Dyn_mulher_screening_spectrum },
  'mulher-mammography-spectrum': { Component: Dyn_mulher_mammography_spectrum },
  'mulher-puerperio-timeline': { Component: Dyn_mulher_puerperio_timeline },
  'mulher-contraception-spectrum': { Component: Dyn_mulher_contraception_spectrum },
  'crianca-feeding-timeline': { Component: Dyn_crianca_feeding_timeline },
  'crianca-screening-timeline': { Component: Dyn_crianca_screening_timeline },
  'crianca-pediatric-hub': { Component: Dyn_crianca_pediatric_hub },
  'crianca-dehydration-spectrum': { Component: Dyn_crianca_dehydration_spectrum },
  'crianca-puericultura-timeline': { Component: Dyn_crianca_puericultura_timeline },
  'crianca-neonatal-deck': { Component: Dyn_crianca_neonatal_deck },
  'crianca-dev-milestones-rail': { Component: Dyn_crianca_dev_milestones_rail },
  'cold-chain-hub': { Component: Dyn_cold_chain_hub },
  'pni-rules-deck': { Component: Dyn_pni_rules_deck },
  'cam-certos-deck': { Component: Dyn_cam_certos_deck },
  'pt-crase-funnel-deck': { Component: Dyn_pt_crase_funnel_deck },
  'pt-clitic-rail-deck': { Component: Dyn_pt_clitic_rail_deck },
  'pt-comma-rail-deck': { Component: Dyn_pt_comma_rail_deck },
  'pt-term-matrix-deck': { Component: Dyn_pt_term_matrix_deck },
  'pt-subject-focus-deck': { Component: Dyn_pt_subject_focus_deck },
  'cam-high-risk-duo-deck': { Component: Dyn_cam_high_risk_duo_deck },
  'cam-exceto-rail': { Component: Dyn_cam_exceto_rail },
  'cam-documentacao-deck': { Component: Dyn_cam_documentacao_deck },
  'sae-documentation': { Component: Dyn_sae_documentation },
  'sae-responsibility-matrix': { Component: Dyn_sae_responsibility_matrix },
  'sus-legal-pillars': { Component: Dyn_sus_legal_pillars },
  'sus-art4-orbit': { Component: Dyn_sus_art4_orbit },
  'absorption-speed-rail': { Component: Dyn_absorption_speed_rail },
  'adme-journey-rail': { Component: Dyn_adme_journey_rail },
  'infusao-ev-station-deck': { Component: Dyn_infusao_ev_station_deck },
  'dose-equivalence-rail': { Component: Dyn_dose_equivalence_rail },
  'oxygen-protocol-deck': { Component: Dyn_oxygen_protocol_deck },
  'iv-care-orbit': { Component: Dyn_iv_care_orbit },
  'iv-complication-tissue-layers': { Component: Dyn_iv_complication_tissue_layers },
  'iv-gauge-matrix': { Component: Dyn_iv_gauge_matrix },
  'iv-exceto-spectrum': { Component: Dyn_iv_exceto_spectrum },
  'iv-interval-timeline': { Component: Dyn_iv_interval_timeline },
  'iv-puncture-rail': { Component: Dyn_iv_puncture_rail },
  'iv-bundle-orbit': { Component: Dyn_iv_bundle_orbit },
  'morphing-timeline': { Component: Dyn_morphing_timeline },
  'lab-specimen-chain': { Component: Dyn_lab_specimen_chain },
  'wound-stage-tissue-deck': { Component: Dyn_wound_stage_tissue_deck },
  'burn-depth-layer-deck': { Component: Dyn_burn_depth_layer_deck },
  'ist-risk-routes-deck': { Component: Dyn_ist_risk_routes_deck },
  'adolescent-privacy-curtain': { Component: Dyn_adolescent_privacy_curtain },
  'adolescent-care-pillars-deck': { Component: Dyn_adolescent_care_pillars_deck },
  'adolescent-growth-z-rail': { Component: Dyn_adolescent_growth_z_rail },
  'nr32-annex-deck': { Component: Dyn_nr32_annex_deck },
  'sp-id-verify-deck': { Component: Dyn_sp_id_verify_deck },
  'sp-fall-risk-rail': { Component: Dyn_sp_fall_risk_rail },
  'sp-incident-taxonomy-deck': { Component: Dyn_sp_incident_taxonomy_deck },
  'respiratorio-asma-dpoc-duel-deck': { Component: Dyn_respiratorio_asma_dpoc_duel_deck },
  'mental-raps-network-rail': { Component: Dyn_mental_raps_network_rail },
  'mental-crisis-signal-deck': { Component: Dyn_mental_crisis_signal_deck },
  'peri-preop-phase-deck': { Component: Dyn_peri_preop_phase_deck },
  'peri-srpa-monitor-deck': { Component: Dyn_peri_srpa_monitor_deck },
  'peri-protocol-checklist-deck': { Component: Dyn_peri_protocol_checklist_deck },
  'peri-vf-assertions-deck': { Component: Dyn_peri_vf_assertions_deck },
  'urgencias-survival-chain-deck': { Component: Dyn_urgencias_survival_chain_deck },
  'urgencias-xabcde-rail': { Component: Dyn_urgencias_xabcde_rail },
  'urgencias-stroke-signs-deck': { Component: Dyn_urgencias_stroke_signs_deck },
  'urgencias-shock-types-deck': { Component: Dyn_urgencias_shock_types_deck },
  'urgencias-choking-signal-deck': { Component: Dyn_urgencias_choking_signal_deck },
  'urgencias-pediatric-rcp-deck': { Component: Dyn_urgencias_pediatric_rcp_deck },
  'urgencias-manchester-spectrum': { Component: Dyn_urgencias_manchester_spectrum },
  'urgencias-protocol-rules-deck': { Component: Dyn_urgencias_protocol_rules_deck },
  'urgencias-exceto-rail': { Component: Dyn_urgencias_exceto_rail },
  'urgencias-emergency-hub': { Component: Dyn_urgencias_emergency_hub },
  'etiology-kingdom-rail': { Component: Dyn_etiology_kingdom_rail },
  'tb-vigilance-rail': { Component: Dyn_tb_vigilance_rail },
  'itu-closed-system-rail': { Component: Dyn_itu_closed_system_rail },
  'biosseg-precaution-deck': { Component: Dyn_biosseg_precaution_deck },
};

export function getConceptMapBespoke(layoutVariant: string): BespokeVariantEntry | undefined {
  return CONCEPT_MAP_REGISTRY[layoutVariant];
}
