/**
 * Ramo pedagógico (L2.5) — subtópico canônico é bucket; o ramo define molde L3.
 *
 * @see docs/MOLD_AFFINITY_RESOLVER.md
 */
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { getDesignBySubtopic, type SubtopicDesign } from '@/components/slides/core/themeGenerator';
import { collectSlideTextCorpus, type MoldAffinitySlide } from '@/lib/slides/moldAffinity';

export type PedagogicalBranchId =
  // Saúde do Adolescente
  | 'adolescente_etica_sigilo'
  | 'adolescente_antropometria'
  | 'adolescente_desenvolvimento'
  | 'adolescente_saude_mental'
  | 'adolescente_violencia_protecao'
  | 'adolescente_generico'
  // CME
  | 'cme_preparo_limpeza'
  | 'cme_autoclave_metodos'
  | 'cme_processamento_conceito'
  | 'cme_vf_ce'
  | 'cme_generico'
  // Saúde Mental
  | 'mental_raps_legis'
  | 'mental_dependencia_tabagismo'
  | 'mental_crise_caps'
  | 'mental_depressao'
  | 'mental_aps_acolhimento'
  | 'mental_generico'
  // Sondas
  | 'sonda_instalacao_protocolo'
  | 'sonda_medicao_nex'
  | 'sonda_generico'
  // Farmacodinâmica e Farmacocinética
  | 'farmaco_pk_pd_vf'
  | 'farmaco_clinico_protocolo'
  | 'farmaco_generico'
  // Imunização
  | 'imunizacao_vf_intervalos'
  | 'imunizacao_calendario'
  | 'imunizacao_cadeia_frio'
  | 'imunizacao_exceto'
  | 'imunizacao_generico'
  // Vias de Administração
  | 'via_vf_absorcao'
  | 'via_tecnica_admin'
  | 'via_generico'
  // Cuidados na Administração de Medicamentos
  | 'cam_certos_vf_caso'
  | 'cam_alto_risco'
  | 'cam_exceto_conduta'
  | 'cam_documentacao'
  | 'cam_generico'
  // Cálculo de Medicamentos
  | 'calc_dose_equivalencia'
  | 'calc_conceito'
  | 'calc_generico'
  // Doenças Respiratórias Crônicas
  | 'respiratorio_vf_asma_dpoc'
  | 'respiratorio_dpoc_oxigenio'
  | 'respiratorio_asma_crise'
  | 'respiratorio_tecnica_inalador'
  | 'respiratorio_generico'
  // Feridas e Queimaduras
  | 'feridas_grau_profundidade'
  | 'feridas_scq_calculo'
  | 'feridas_scq_regra9'
  | 'feridas_grande_queimado'
  | 'feridas_atendimento_inicial'
  | 'feridas_classificacao'
  | 'feridas_cicatrizacao'
  | 'feridas_curativo_tipo'
  | 'feridas_generico'
  // Doenças Bacterianas e Fúngicas
  | 'bacterianas_agente_etiologico'
  | 'bacterianas_tuberculose'
  | 'bacterianas_generico'
  // Infecções / Biossegurança
  | 'biosseg_iras_itu_cateter'
  | 'biosseg_generico'
  // Segurança do Paciente
  | 'sp_identificacao'
  | 'sp_prevencao_quedas'
  | 'sp_eventos_adversos'
  | 'sp_metas_internacionais'
  | 'sp_generico'
  // Assistência Perioperatória (Inclui SRPA)
  | 'perioperatorio_pre_operatorio'
  | 'perioperatorio_pos_operatorio'
  | 'perioperatorio_protocolo'
  | 'perioperatorio_vf'
  | 'perioperatorio_isc'
  | 'perioperatorio_generico'
  // Urgências e Emergências
  | 'urgencias_rcp_sbv'
  | 'urgencias_rcp_pediatrico'
  | 'urgencias_avc_iam'
  | 'urgencias_xabcde_trauma'
  | 'urgencias_choque'
  | 'urgencias_engasgo'
  | 'urgencias_exceto_conduta'
  | 'urgencias_vf_protocolo'
  | 'urgencias_convulsao'
  | 'urgencias_manchester_triagem'
  | 'urgencias_anafilaxia'
  | 'urgencias_queimadura'
  | 'urgencias_generico'
  // Punção Venosa e Cuidados com Cateteres
  | 'puncao_flebite'
  | 'puncao_dispositivo'
  | 'puncao_exceto'
  | 'puncao_tempo'
  | 'puncao_periferica_antissepsia'
  | 'puncao_ipcs_cvc'
  | 'puncao_generico'
  // Curativos e Manejo de Feridas
  | 'curativos_cobertura_selecao'
  | 'curativos_ferida_cirurgica'
  | 'curativos_lpp'
  | 'curativos_tecnica_assepsia'
  | 'curativos_desbridamento'
  | 'curativos_exceto_incorreta'
  | 'curativos_estomia'
  | 'curativos_bandagem_imobilizacao'
  | 'curativos_dreno'
  | 'curativos_termoterapia'
  | 'curativos_generico'
  // Saúde da Mulher
  | 'mulher_prenatal'
  | 'mulher_parto'
  | 'mulher_papanicolau'
  | 'mulher_mama'
  | 'mulher_puerperio'
  | 'mulher_planejamento'
  | 'mulher_generico'
  // Saúde da Criança
  | 'crianca_aleitamento_nutricao'
  | 'crianca_triagem_neonatal'
  | 'crianca_neonatologia'
  | 'crianca_aps_puericultura'
  | 'crianca_desenvolvimento'
  | 'crianca_desidratacao'
  | 'crianca_generico'
  // Enfermagem do Trabalho
  | 'trabalho_vf_nr32'
  | 'trabalho_pep_trap'
  | 'trabalho_nr15_reference'
  | 'trabalho_ergonomia'
  | 'trabalho_generico'
  // Processo de Enfermagem / SAE
  | 'sae_documentacao'
  | 'sae_etapas'
  | 'sae_exceto'
  | 'sae_generico'
  // História da Enfermagem
  | 'historia_nightingale'
  | 'historia_humanizacao'
  | 'historia_comunicacao_etica'
  | 'historia_generico'
  // Língua Portuguesa — Crase
  | 'pt_crase'
  | 'pt_crase_generico'
  | 'pt_pronomes_colocacao'
  | 'pt_pronomes_colocacao_generico'
  | 'pt_pontuacao'
  | 'pt_pontuacao_generico'
  | 'pt_termos_oracao'
  | 'pt_termos_oracao_generico'
  | 'pt_concordancia'
  | 'pt_concordancia_generico';

const ADOLESCENTE_ETHICS_MOLD: SubtopicDesign = {
  template: 'sky',
  conceptMap: 'adolescent-privacy-curtain',
  goldenRule: 'adolescent-sigilo-spectrum',
  logicFlow: 'adolescent-vf-weave-tap',
  dangerZone: 'adolescent-consent-gate',
};

/** Layout genérico dentro do tema adolescente (sem moldes ética/sigilo). */
export const ADOLESCENTE_GENERIC_DESIGN: SubtopicDesign = {
  template: 'sky',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Escore Z / Caderneta — trilho de faixas antropométricas (brief l3 antropometria). */
const ADOLESCENTE_ANTHROPOMETRY_MOLD: SubtopicDesign = {
  template: 'sky',
  conceptMap: 'adolescent-growth-z-rail',
  goldenRule: 'adolescent-z-band-board',
  logicFlow: 'adolescent-z-classify-tap',
  dangerZone: 'adolescent-z-threshold-trap',
};

const CME_DEFAULT: SubtopicDesign = {
  template: 'teal',
  conceptMap: 'bridge',
  goldenRule: 'minimal',
  logicFlow: 'cards',
  dangerZone: 'list',
};

const CME_REFERENCE: SubtopicDesign = {
  template: 'teal',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Pacote bespoke crise/CAPS — escada de cuidado (não reutiliza SAE). */
const MENTAL_CRISIS_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'mental-crisis-signal-deck',
  goldenRule: 'mental-crisis-ladder-board',
  logicFlow: 'mental-crisis-decision-tap',
  dangerZone: 'mental-crisis-coercion-trap',
};

const MENTAL_GENERIC: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Pacote bespoke RAPS/legis — trilho de componentes da rede. */
const MENTAL_LEGIS: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'mental-raps-network-rail',
  goldenRule: 'mental-raps-tier-board',
  logicFlow: 'mental-raps-classify-tap',
  dangerZone: 'mental-raps-trap-arena',
};

/** Pacote SAE bespoke 4/4 — etapas / diagnóstico / responsabilidades (âncora COPESE). */
const SAE_BESPOKE: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'sae-responsibility-matrix',
  goldenRule: 'sae-reference-board',
  logicFlow: 'sae-decision-tap',
  dangerZone: 'norm-reveal',
};

/** Documentação / anotação / prontuário — concept_map sae-documentation. */
const SAE_DOC_BESPOKE: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'sae-documentation',
  goldenRule: 'sae-reference-board',
  logicFlow: 'sae-decision-tap',
  dangerZone: 'norm-reveal',
};

const SONDA_BESPOKE: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'procedure-protocol',
  goldenRule: 'sonda-measurement-board',
  logicFlow: 'sonda-decision-tap',
  dangerZone: 'trap-reveal',
};

const SONDA_GENERIC: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Pacote VF PK/PD — trilho adme-journey-rail (âncora FUNCAMP). */
const FARMACO_VF_MOLD: SubtopicDesign = {
  template: 'purple',
  conceptMap: 'adme-journey-rail',
  goldenRule: 'pk-pd-reference-board',
  logicFlow: 'farmaco-vf-juggle-tap',
  dangerZone: 'farmaco-trap',
};

/** MCQ clínico — droga, via, infusão (omeprazol, antibiótico EV…). */
const FARMACO_CLINICO_MOLD: SubtopicDesign = {
  template: 'purple',
  conceptMap: 'infusao-ev-station-deck',
  goldenRule: 'farmaco-clinico-reference-board',
  logicFlow: 'farmaco-protocol-tap-flow',
  dangerZone: 'farmaco-clinico-trap',
};

const FARMACO_GENERIC_MOLD: SubtopicDesign = {
  template: 'purple',
  conceptMap: 'morphological',
  goldenRule: 'center',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const IMUNIZACAO_VF_MOLD: SubtopicDesign = {
  template: 'lime',
  conceptMap: 'pni-rules-deck',
  goldenRule: 'pni-interval-matrix',
  logicFlow: 'pni-vf-juggle-tap',
  dangerZone: 'pni-trap-chips',
};

const IMUNIZACAO_CALENDARIO_MOLD: SubtopicDesign = {
  template: 'lime',
  conceptMap: 'vaccine-timeline',
  goldenRule: 'pni-calendar-board',
  logicFlow: 'pni-calendar-elimination-tap',
  dangerZone: 'calendar-mismatch',
};

const IMUNIZACAO_CADEIA_FRIO_MOLD: SubtopicDesign = {
  template: 'lime',
  conceptMap: 'cold-chain-hub',
  goldenRule: 'pni-temperature-rail',
  logicFlow: 'pni-cold-chain-tap',
  dangerZone: 'temperature-mismatch',
};

/** EXCETO / INCORRETA — compare semântico por letra (distratores corretos × exceção). */
const IMUNIZACAO_EXCETO_MOLD: SubtopicDesign = {
  template: 'lime',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const IMUNIZACAO_GENERIC_MOLD: SubtopicDesign = {
  template: 'lime',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const VIA_VF_MOLD: SubtopicDesign = {
  template: 'emerald',
  conceptMap: 'absorption-speed-rail',
  goldenRule: 'via-reference-board',
  logicFlow: 'via-vf-juggle-tap',
  dangerZone: 'route-trap',
};

const VIA_TECNICA_MOLD: SubtopicDesign = {
  template: 'emerald',
  conceptMap: 'morphological',
  goldenRule: 'banner',
  logicFlow: 'cards',
  dangerZone: 'compare',
};

const VIA_GENERIC_MOLD: SubtopicDesign = {
  template: 'emerald',
  conceptMap: 'morphological',
  goldenRule: 'center',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Pacote bespoke V/F 9 Certos — deck + nine-rights-board + vf-juggle + trap-arena. */
const CAM_CERTOS_VF_MOLD: SubtopicDesign = {
  template: 'teal',
  conceptMap: 'cam-certos-deck',
  goldenRule: 'cam-nine-rights-board',
  logicFlow: 'cam-vf-juggle-tap',
  dangerZone: 'cam-certos-trap-arena',
};

const CAM_GENERIC_MOLD: SubtopicDesign = {
  template: 'teal',
  conceptMap: 'bridge',
  goldenRule: 'center',
  logicFlow: 'cards',
  dangerZone: 'compare',
};

/** Pacote bespoke alto risco — duo-deck + protocol-board + elimination-tap + trap-arena. */
const CAM_ALTO_RISCO_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'cam-high-risk-duo-deck',
  goldenRule: 'cam-high-risk-protocol-board',
  logicFlow: 'cam-alto-risco-elimination-tap',
  dangerZone: 'cam-high-risk-trap-arena',
};

/** EXCETO / INCORRETA — rail semântico preparo × conduta correta × exceção (VO+SF). */
const CAM_EXCETO_MOLD: SubtopicDesign = {
  template: 'teal',
  conceptMap: 'cam-exceto-rail',
  goldenRule: 'cam-exceto-reference-board',
  logicFlow: 'cam-exceto-tap-flow',
  dangerZone: 'cam-exceto-trap-arena',
};

/** V/F Registro certo — deck documentação + board + vf-tap + trap-arena. */
const CAM_DOCUMENTACAO_MOLD: SubtopicDesign = {
  template: 'teal',
  conceptMap: 'cam-documentacao-deck',
  goldenRule: 'cam-documentacao-board',
  logicFlow: 'cam-documentacao-vf-tap',
  dangerZone: 'cam-documentacao-trap-arena',
};

/** Complicações IV — camadas teciduais + label-swap (infiltração × flebite × hematoma). */
const PUNCAO_FLEBITE_MOLD: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'iv-complication-tissue-layers',
  goldenRule: 'iv-differential-board',
  logicFlow: 'iv-complication-tap-flow',
  dangerZone: 'iv-label-swap-trap',
};

/** Fallback Punção — genérico sem pacote IPCS global. */
const PUNCAO_GENERIC_MOLD: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'bridge',
  goldenRule: 'reference_table',
  logicFlow: 'cards',
  dangerZone: 'compare',
};

const PUNCAO_DISPOSITIVO_MOLD: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'iv-gauge-matrix',
  goldenRule: 'iv-device-reference-board',
  logicFlow: 'iv-device-tap-flow',
  dangerZone: 'iv-gauge-mismatch-trap',
};

const PUNCAO_EXCETO_MOLD: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'iv-exceto-spectrum',
  goldenRule: 'iv-exceto-command-board',
  logicFlow: 'iv-exceto-tap-flow',
  dangerZone: 'iv-exceto-intruder-trap',
};

const PUNCAO_TEMPO_MOLD: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'iv-interval-timeline',
  goldenRule: 'iv-interval-board',
  logicFlow: 'iv-interval-tap-flow',
  dangerZone: 'iv-interval-swap-trap',
};

const PUNCAO_PERIFERICA_MOLD: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'iv-puncture-rail',
  goldenRule: 'iv-antisepsis-board',
  logicFlow: 'iv-puncture-tap-flow',
  dangerZone: 'iv-order-invert-trap',
};

const PUNCAO_IPCS_CVC_MOLD: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'iv-bundle-orbit',
  goldenRule: 'iv-bundle-mesh-reveal',
  logicFlow: 'iv-bundle-tap-flow',
  dangerZone: 'iv-bundle-break-trap',
};

const CALC_DOSE_MOLD: SubtopicDesign = {
  template: 'blue',
  conceptMap: 'dose-equivalence-rail',
  goldenRule: 'soft-lens-board',
  logicFlow: 'dose-calc-tap',
  dangerZone: 'dose-trap',
};

const CALC_GENERIC_MOLD: SubtopicDesign = {
  template: 'blue',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'horizontal',
  dangerZone: 'compare',
};

/** Pacote VF asma/DPOC — trilho respiratorio-* (âncora CPCON DPOC SpO₂). */
const RESPIRATORIO_VF_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'respiratorio-asma-dpoc-duel-deck',
  goldenRule: 'respiratorio-spo2-reference-board',
  logicFlow: 'respiratorio-vf-juggle-tap',
  dangerZone: 'respiratorio-spo2-trap-arena',
};

/** O₂ titulado / SpO₂ alvo DPOC — mesmo pacote bespoke (golden spo2-reference-board). */
const RESPIRATORIO_DPOC_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'respiratorio-asma-dpoc-duel-deck',
  goldenRule: 'respiratorio-spo2-reference-board',
  logicFlow: 'cards',
  dangerZone: 'respiratorio-spo2-trap-arena',
};

/** Crise asmática / EXCETO — compare + cards (sem duel-deck). */
const RESPIRATORIO_CRISE_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'morphological',
  goldenRule: 'banner',
  logicFlow: 'cards',
  dangerZone: 'compare',
};

/** Técnica MDI, espaçador, peak flow — tabela de referência. */
const RESPIRATORIO_TECNICA_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'cards',
  dangerZone: 'compare',
};

const RESPIRATORIO_GENERIC_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'morphological',
  goldenRule: 'center',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Cobertura / exsudato / meio úmido — bespoke 4/4 (wound-stage · dressing-matrix · prep-tap · choice-arena). */
const CURATIVOS_COBERTURA_BESPOKE: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'wound-stage-tissue-deck',
  goldenRule: 'dressing-match-matrix',
  logicFlow: 'wound-prep-tap-flow',
  dangerZone: 'dressing-choice-arena',
};

/** LPP prevenção + estágio — estágios NPUAP + arena LPP. */
const CURATIVOS_LPP_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'wound-stage-tissue-deck',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'dressing-choice-arena',
};

/** Ferida operatória / pós-op / pontos — trilho procedural. */
const CURATIVOS_FO_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'procedure-protocol',
  goldenRule: 'reference_table',
  logicFlow: 'wound-prep-tap-flow',
  dangerZone: 'compare',
};

/** EXCETO / INCORRETA em técnica de curativo. */
const CURATIVOS_EXCETO_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Ramos médios / cauda — genérico premium laranja. */
const CURATIVOS_REFERENCE_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const CURATIVOS_GENERIC_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'morphological',
  goldenRule: 'center',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Graus/profundidade — burn-depth-layer-deck (âncora ICECE). */
const FERIDAS_GRAU_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'burn-depth-layer-deck',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'burn-trap-arena',
};

/** SCQ / regra dos 9 — burn-rule-nine-board. */
const FERIDAS_SCQ_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'burn-depth-layer-deck',
  goldenRule: 'burn-rule-nine-board',
  logicFlow: 'vertical',
  dangerZone: 'burn-trap-arena',
};

/** Atendimento inicial / protocolo — triage tap-flow. */
const FERIDAS_ATENDIMENTO_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'burn-triage-tap-flow',
  dangerZone: 'burn-trap-arena',
};

/** Classificação ferida / cicatrização / curativo — genérico premium laranja. */
const FERIDAS_REFERENCE_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const FERIDAS_GENERIC_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'morphological',
  goldenRule: 'center',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Pacote bespoke 4/4 — NR-32 annex deck + VF juggle + PEP trap (âncora golden). */
const TRABALHO_BESPOKE_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'nr32-annex-deck',
  goldenRule: 'trabalho-nr32-reference-board',
  logicFlow: 'trabalho-vf-juggle-tap',
  dangerZone: 'trabalho-pep-trap-arena',
};

/** NR-15 / agentes físicos — calor, ruído, radiação (reference board). */
const TRABALHO_NR15_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'morphological',
  goldenRule: 'trabalho-nr32-reference-board',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Ergonomia / LER-DORT — genérico premium amber. */
const TRABALHO_ERGONOMIA_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const TRABALHO_GENERIC_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const BACTERIANAS_ETIOLOGIA_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'etiology-kingdom-rail',
  goldenRule: 'etiology-letter-spectrum',
  logicFlow: 'etiology-elimination-tap',
  dangerZone: 'etiology-intruder-chips',
};

/** Pacote TB bespoke 4/4 — vigilância × BAAR × aerossóis × VF I/II/III. */
const BACTERIANAS_TB_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'tb-vigilance-rail',
  goldenRule: 'tb-precaution-board',
  logicFlow: 'tb-vf-elimination-tap',
  dangerZone: 'tb-transmission-trap',
};

const BACTERIANAS_GENERIC_MOLD: SubtopicDesign = {
  template: 'orange',
  conceptMap: 'molecular',
  goldenRule: 'minimal',
  logicFlow: 'cards',
  dangerZone: 'list',
};

const BIOSSEG_ITU_CATETER_MOLD: SubtopicDesign = {
  template: 'lime',
  conceptMap: 'itu-closed-system-rail',
  goldenRule: 'itu-bundle-letter-board',
  logicFlow: 'itu-exceto-tap',
  dangerZone: 'itu-catheter-trap',
};

/** IRAS / precauções / higiene — pacote bespoke 4/4 (âncora fepese IRAS V/F). */
const BIOSSEG_GENERIC_BESPOKE_MOLD: SubtopicDesign = {
  template: 'lime',
  conceptMap: 'biosseg-precaution-deck',
  goldenRule: 'biosseg-reference-board',
  logicFlow: 'biosseg-vf-juggle-tap',
  dangerZone: 'biosseg-trap-chips',
};

const BIOSSEG_GENERIC_MOLD: SubtopicDesign = BIOSSEG_GENERIC_BESPOKE_MOLD;

/** Identificação segura — deck pulseira + VF juggle + trap arena (bespoke). */
const SP_IDENTIFICACAO_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'sp-id-verify-deck',
  goldenRule: 'sp-nsp-reference-board',
  logicFlow: 'sp-vf-juggle-tap',
  dangerZone: 'sp-safety-trap-arena',
};

/** Prevenção de quedas — trilho Morse + protocol tap + trap arena (bespoke). */
const SP_QUEDAS_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'sp-fall-risk-rail',
  goldenRule: 'sp-nsp-reference-board',
  logicFlow: 'sp-protocol-tap-flow',
  dangerZone: 'sp-safety-trap-arena',
};

/** Eventos adversos / PNSP — taxonomy deck + protocol tap + trap arena (bespoke). */
const SP_EVENTOS_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'sp-incident-taxonomy-deck',
  goldenRule: 'sp-nsp-reference-board',
  logicFlow: 'sp-protocol-tap-flow',
  dangerZone: 'sp-safety-trap-arena',
};

const SP_REFERENCE_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const SP_GENERIC_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Perioperatória / SRPA — pacote genérico premium (cauda longa: ISC, genérico). */
export const PERIOPERATORIO_GENERIC_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Perioperatória — pré-operatório bespoke 4/4 (fases × preparo). */
const PERI_PREOP_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'peri-preop-phase-deck',
  goldenRule: 'peri-preop-prep-board',
  logicFlow: 'peri-preop-decision-tap',
  dangerZone: 'peri-preop-trap-arena',
};

/** Perioperatória — pós-operatório / SRPA bespoke 4/4 (monitorização × Aldrete). */
const PERI_POS_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'peri-srpa-monitor-deck',
  goldenRule: 'peri-aldrete-board',
  logicFlow: 'peri-srpa-decision-tap',
  dangerZone: 'peri-srpa-trap-arena',
};

/** Perioperatória — protocolo / cirurgia segura bespoke 4/4 (WHO × CDC). */
const PERI_PROTOCOL_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'peri-protocol-checklist-deck',
  goldenRule: 'peri-protocol-reference-board',
  logicFlow: 'peri-protocol-tap-flow',
  dangerZone: 'peri-protocol-trap-arena',
};

/** Perioperatória — V/F Cebraspe bespoke 4/4 (I/II/III juggle). */
const PERI_VF_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'peri-vf-assertions-deck',
  goldenRule: 'peri-vf-reference-board',
  logicFlow: 'peri-vf-juggle-tap',
  dangerZone: 'peri-vf-trap-chips',
};

/** Pacote bespoke RCP/SBV adulto — survival-chain-deck + params-board + tap-flow + trap-arena. */
const URGENCIAS_RCP_MOLD: SubtopicDesign = {
  template: 'rose',
  conceptMap: 'urgencias-survival-chain-deck',
  goldenRule: 'urgencias-rcp-params-board',
  logicFlow: 'urgencias-rcp-tap-flow',
  dangerZone: 'urgencias-rcp-trap-arena',
};

/** Pacote bespoke XABCDE / trauma pré-hospitalar. */
const URGENCIAS_XABCDE_MOLD: SubtopicDesign = {
  template: 'rose',
  conceptMap: 'urgencias-xabcde-rail',
  goldenRule: 'urgencias-trauma-reference-board',
  logicFlow: 'urgencias-xabcde-tap-flow',
  dangerZone: 'urgencias-trauma-trap-arena',
};

/** Pacote bespoke AVC / Cincinnati (FAST). */
const URGENCIAS_AVC_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'urgencias-stroke-signs-deck',
  goldenRule: 'urgencias-cincinnati-board',
  logicFlow: 'urgencias-stroke-elimination-tap',
  dangerZone: 'urgencias-stroke-trap-arena',
};

/** Pacote bespoke choque (elétrico × hipoperfusão). */
const URGENCIAS_CHOQUE_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'urgencias-shock-types-deck',
  goldenRule: 'urgencias-shock-reference-board',
  logicFlow: 'urgencias-shock-tap-flow',
  dangerZone: 'urgencias-shock-trap-arena',
};

/** Pacote bespoke engasgo / obstrução VA. */
const URGENCIAS_ENGASGO_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'urgencias-choking-signal-deck',
  goldenRule: 'urgencias-heimlich-board',
  logicFlow: 'urgencias-choking-tap-flow',
  dangerZone: 'urgencias-choking-trap-arena',
};

/** Pacote bespoke RCP pediátrica (15:2 · terço AP). */
const URGENCIAS_PEDIATRIC_MOLD: SubtopicDesign = {
  template: 'pink',
  conceptMap: 'urgencias-pediatric-rcp-deck',
  goldenRule: 'urgencias-pediatric-params-board',
  logicFlow: 'urgencias-pediatric-tap-flow',
  dangerZone: 'urgencias-pediatric-trap-arena',
};

/** Pacote bespoke Manchester / triagem de cores. */
const URGENCIAS_MANCHESTER_MOLD: SubtopicDesign = {
  template: 'rose',
  conceptMap: 'urgencias-manchester-spectrum',
  goldenRule: 'urgencias-manchester-board',
  logicFlow: 'cards',
  dangerZone: 'urgencias-manchester-trap',
};

const URGENCIAS_GENERIC_MOLD: SubtopicDesign = {
  template: 'rose',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Pacote bespoke pré-natal — trilho gestacional Caderno AB 32. */
const MULHER_PRENATAL_MOLD: SubtopicDesign = {
  template: 'pink',
  conceptMap: 'mulher-gestation-timeline',
  goldenRule: 'mulher-prenatal-board',
  logicFlow: 'mulher-prenatal-tap-flow',
  dangerZone: 'mulher-prenatal-trap-arena',
};

/** Pacote bespoke parto humanizado — fases + PNH. */
const MULHER_PARTO_MOLD: SubtopicDesign = {
  template: 'pink',
  conceptMap: 'mulher-labor-phase-deck',
  goldenRule: 'mulher-parto-humanizado-board',
  logicFlow: 'mulher-labor-tap-flow',
  dangerZone: 'mulher-parto-trap-arena',
};

/** Pacote bespoke rastreio colo — espectro etário 25–64. */
const MULHER_PAPANICOLAU_MOLD: SubtopicDesign = {
  template: 'pink',
  conceptMap: 'mulher-screening-spectrum',
  goldenRule: 'mulher-papanicolau-board',
  logicFlow: 'mulher-screening-tap-flow',
  dangerZone: 'mulher-screening-trap-arena',
};

/** Pacote bespoke rastreio mama — espectro etário 50–69 bienal. */
const MULHER_MAMA_MOLD: SubtopicDesign = {
  template: 'pink',
  conceptMap: 'mulher-mammography-spectrum',
  goldenRule: 'mulher-mama-board',
  logicFlow: 'mulher-mama-tap-flow',
  dangerZone: 'mulher-mama-trap-arena',
};

/** Pacote bespoke puerpério / lactação — linha 0–42 dias. */
const MULHER_PUERPERIO_MOLD: SubtopicDesign = {
  template: 'pink',
  conceptMap: 'mulher-puerperio-timeline',
  goldenRule: 'mulher-puerperio-board',
  logicFlow: 'mulher-puerperio-tap-flow',
  dangerZone: 'mulher-puerperio-trap-arena',
};

/** Pacote bespoke planejamento familiar — categorias contraceptivas. */
const MULHER_PLANEJAMENTO_MOLD: SubtopicDesign = {
  template: 'pink',
  conceptMap: 'mulher-contraception-spectrum',
  goldenRule: 'mulher-planejamento-board',
  logicFlow: 'mulher-planejamento-tap-flow',
  dangerZone: 'mulher-planejamento-trap-arena',
};

/** Layout genérico Saúde da Mulher (ramos sem molde bespoke). */
export const MULHER_GENERIC_DESIGN: SubtopicDesign = {
  template: 'pink',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Pacote bespoke aleitamento / nutrição infantil — trilho AME. */
export const CRIANCA_ALEITAMENTO_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'crianca-feeding-timeline',
  goldenRule: 'crianca-feeding-board',
  logicFlow: 'crianca-feeding-tap-flow',
  dangerZone: 'crianca-feeding-trap-arena',
};

/** Pacote bespoke triagem neonatal — pezinho / coraçãozinho. */
export const CRIANCA_TRIAGEM_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'crianca-screening-timeline',
  goldenRule: 'crianca-screening-board',
  logicFlow: 'crianca-screening-tap-flow',
  dangerZone: 'crianca-screening-trap-arena',
};

/** Pacote bespoke hub pediátrico — conceito geral forte. */
export const CRIANCA_PEDIATRIC_HUB_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'crianca-pediatric-hub',
  goldenRule: 'crianca-pediatric-board',
  logicFlow: 'crianca-pediatric-tap-flow',
  dangerZone: 'crianca-pediatric-trap-arena',
};

/** Pacote bespoke desidratação — espectro plano A/B/C. */
export const CRIANCA_DESIDRATACAO_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'crianca-dehydration-spectrum',
  goldenRule: 'crianca-dehydration-board',
  logicFlow: 'crianca-dehydration-tap-flow',
  dangerZone: 'crianca-dehydration-trap-arena',
};

/** Pacote bespoke APS / puericultura — linha de visitas. */
export const CRIANCA_PUERICULTURA_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'crianca-puericultura-timeline',
  goldenRule: 'crianca-puericultura-board',
  logicFlow: 'crianca-puericultura-tap-flow',
  dangerZone: 'crianca-puericultura-trap-arena',
};

/** Pacote bespoke neonatologia clínica — deck APGAR / cuidados RN. */
export const CRIANCA_NEONATOLOGIA_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'crianca-neonatal-deck',
  goldenRule: 'crianca-neonatal-board',
  logicFlow: 'crianca-neonatal-tap-flow',
  dangerZone: 'crianca-neonatal-trap-arena',
};

/** Pacote bespoke desenvolvimento — trilho de marcos. */
export const CRIANCA_DESENVOLVIMENTO_MOLD: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'crianca-dev-milestones-rail',
  goldenRule: 'crianca-dev-board',
  logicFlow: 'crianca-dev-tap-flow',
  dangerZone: 'crianca-dev-trap-arena',
};

/** Layout genérico Saúde da Criança (ramos sem molde bespoke). */
export const CRIANCA_GENERIC_DESIGN: SubtopicDesign = {
  template: 'cyan',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** EXCETO / INCORRETA — rail semântico por letra (distratores corretos × exceção). */
const URGENCIAS_EXCETO_MOLD: SubtopicDesign = {
  template: 'rose',
  conceptMap: 'urgencias-exceto-rail',
  goldenRule: 'urgencias-exceto-reference-board',
  logicFlow: 'urgencias-exceto-tap-flow',
  dangerZone: 'urgencias-exceto-trap-arena',
};

/** V/F protocolo · convulsão · anafilaxia · queimadura — protocol rules deck. */
const URGENCIAS_PROTOCOL_MOLD: SubtopicDesign = {
  template: 'rose',
  conceptMap: 'urgencias-protocol-rules-deck',
  goldenRule: 'urgencias-protocol-reference-board',
  logicFlow: 'urgencias-protocol-tap-flow',
  dangerZone: 'urgencias-protocol-trap-arena',
};

/** Pacote genérico premium — História (amber). */
const HISTORIA_GENERIC_DESIGN: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Marcos históricos / cronologia / legislação (Nightingale, SUS, pioneiras). */
const HISTORIA_NIGHTINGALE_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'bridge',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Humanização / teorias do cuidado (PNH, Peplau, Horta, holismo). */
const HISTORIA_HUMANIZACAO_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** COFEN/COREN, código de ética e comunicação profissional. */
const HISTORIA_ETICA_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'bridge',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Cauda genérica — emergency hub + protocol pack. */
const URGENCIAS_EMERGENCY_GENERIC_MOLD: SubtopicDesign = {
  template: 'rose',
  conceptMap: 'urgencias-emergency-hub',
  goldenRule: 'urgencias-protocol-reference-board',
  logicFlow: 'urgencias-protocol-tap-flow',
  dangerZone: 'urgencias-protocol-trap-arena',
};

// ---- Língua Portuguesa — Crase (pacote bespoke pt-crase-funnel) ----
const PT_CRASE_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'pt-crase-funnel-deck',
  goldenRule: 'pt-crase-funnel-board',
  logicFlow: 'pt-crase-funnel-tap-flow',
  dangerZone: 'pt-crase-trap-arena',
};

const PT_CRASE_GENERIC_MOLD: SubtopicDesign = {
  template: 'amber',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

// ---- Língua Portuguesa — Colocação (pacote bespoke pt-clitic-rail) ----
const PT_CLITIC_RAIL_MOLD: SubtopicDesign = {
  template: 'sky',
  conceptMap: 'pt-clitic-rail-deck',
  goldenRule: 'pt-clitic-rail-board',
  logicFlow: 'pt-clitic-rail-tap-flow',
  dangerZone: 'pt-clitic-trap-arena',
};

const PT_CLITIC_RAIL_GENERIC_MOLD: SubtopicDesign = {
  template: 'sky',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

// ---- Língua Portuguesa — Pontuação (pacote bespoke pt-comma-rail) ----
const PT_COMMA_RAIL_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'pt-comma-rail-deck',
  goldenRule: 'pt-comma-rail-board',
  logicFlow: 'pt-comma-rail-tap-flow',
  dangerZone: 'pt-comma-trap-arena',
};

const PT_COMMA_RAIL_GENERIC_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

// ---- Língua Portuguesa — Termos da oração (pacote bespoke pt-term-matrix) ----
const PT_TERM_MATRIX_MOLD: SubtopicDesign = {
  template: 'teal',
  conceptMap: 'pt-term-matrix-deck',
  goldenRule: 'pt-term-matrix-board',
  logicFlow: 'pt-term-matrix-tap-flow',
  dangerZone: 'pt-term-trap-arena',
};

const PT_TERM_MATRIX_GENERIC_MOLD: SubtopicDesign = {
  template: 'teal',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

// ---- Língua Portuguesa — Concordância (pacote bespoke pt-subject-focus) ----
const PT_SUBJECT_FOCUS_MOLD: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'pt-subject-focus-deck',
  goldenRule: 'pt-subject-focus-board',
  logicFlow: 'pt-subject-focus-tap-flow',
  dangerZone: 'pt-subject-trap-arena',
};

const PT_SUBJECT_FOCUS_GENERIC_MOLD: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/**
 * Mapa ramo → pacote L3 por subtópico.
 * Chave externa: fragmento normalizado do subtópico canônico.
 */
export const BRANCH_DESIGN_MAP: Record<string, Partial<Record<PedagogicalBranchId, SubtopicDesign>>> = {
  'saude do adolescente': {
    adolescente_etica_sigilo: ADOLESCENTE_ETHICS_MOLD,
    adolescente_antropometria: ADOLESCENTE_ANTHROPOMETRY_MOLD,
    adolescente_desenvolvimento: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_saude_mental: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_violencia_protecao: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_generico: ADOLESCENTE_GENERIC_DESIGN,
  },
  adolescente: {
    adolescente_etica_sigilo: ADOLESCENTE_ETHICS_MOLD,
    adolescente_antropometria: ADOLESCENTE_ANTHROPOMETRY_MOLD,
    adolescente_desenvolvimento: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_saude_mental: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_violencia_protecao: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_generico: ADOLESCENTE_GENERIC_DESIGN,
  },
  'processamento de artigos e produtos de saude': {
    cme_preparo_limpeza: CME_DEFAULT,
    cme_autoclave_metodos: CME_REFERENCE,
    cme_processamento_conceito: CME_DEFAULT,
    cme_vf_ce: CME_REFERENCE,
    cme_generico: CME_DEFAULT,
  },
  'central de material e esterilizacao': {
    cme_preparo_limpeza: CME_DEFAULT,
    cme_autoclave_metodos: CME_REFERENCE,
    cme_processamento_conceito: CME_DEFAULT,
    cme_vf_ce: CME_REFERENCE,
    cme_generico: CME_DEFAULT,
  },
  cme: {
    cme_preparo_limpeza: CME_DEFAULT,
    cme_autoclave_metodos: CME_REFERENCE,
    cme_processamento_conceito: CME_DEFAULT,
    cme_vf_ce: CME_REFERENCE,
    cme_generico: CME_DEFAULT,
  },
  'saude mental': {
    mental_raps_legis: MENTAL_LEGIS,
    mental_dependencia_tabagismo: MENTAL_GENERIC,
    mental_crise_caps: MENTAL_CRISIS_MOLD,
    mental_depressao: MENTAL_GENERIC,
    mental_aps_acolhimento: MENTAL_GENERIC,
    mental_generico: MENTAL_GENERIC,
  },
  psiquiatria: {
    mental_raps_legis: MENTAL_LEGIS,
    mental_dependencia_tabagismo: MENTAL_GENERIC,
    mental_crise_caps: MENTAL_CRISIS_MOLD,
    mental_depressao: MENTAL_GENERIC,
    mental_aps_acolhimento: MENTAL_GENERIC,
    mental_generico: MENTAL_GENERIC,
  },
  'processo de enfermagem': {
    sae_documentacao: SAE_DOC_BESPOKE,
    sae_etapas: SAE_BESPOKE,
    sae_exceto: SAE_BESPOKE,
    sae_generico: SAE_BESPOKE,
  },
  sae: {
    sae_documentacao: SAE_DOC_BESPOKE,
    sae_etapas: SAE_BESPOKE,
    sae_exceto: SAE_BESPOKE,
    sae_generico: SAE_BESPOKE,
  },
  'instalacao e manejo de sondas': {
    sonda_instalacao_protocolo: SONDA_BESPOKE,
    sonda_medicao_nex: SONDA_BESPOKE,
    sonda_generico: SONDA_GENERIC,
  },
  sondas: {
    sonda_instalacao_protocolo: SONDA_BESPOKE,
    sonda_medicao_nex: SONDA_BESPOKE,
    sonda_generico: SONDA_GENERIC,
  },
  'farmacodinamica e farmacocinetica': {
    farmaco_pk_pd_vf: FARMACO_VF_MOLD,
    farmaco_clinico_protocolo: FARMACO_CLINICO_MOLD,
    farmaco_generico: FARMACO_GENERIC_MOLD,
  },
  farmacodinamica: {
    farmaco_pk_pd_vf: FARMACO_VF_MOLD,
    farmaco_clinico_protocolo: FARMACO_CLINICO_MOLD,
    farmaco_generico: FARMACO_GENERIC_MOLD,
  },
  farmacocinetica: {
    farmaco_pk_pd_vf: FARMACO_VF_MOLD,
    farmaco_clinico_protocolo: FARMACO_CLINICO_MOLD,
    farmaco_generico: FARMACO_GENERIC_MOLD,
  },
  farmacologia: {
    farmaco_pk_pd_vf: FARMACO_VF_MOLD,
    farmaco_clinico_protocolo: FARMACO_CLINICO_MOLD,
    farmaco_generico: FARMACO_GENERIC_MOLD,
  },
  imunizacao: {
    imunizacao_vf_intervalos: IMUNIZACAO_VF_MOLD,
    imunizacao_calendario: IMUNIZACAO_CALENDARIO_MOLD,
    imunizacao_cadeia_frio: IMUNIZACAO_CADEIA_FRIO_MOLD,
    imunizacao_exceto: IMUNIZACAO_EXCETO_MOLD,
    imunizacao_generico: IMUNIZACAO_GENERIC_MOLD,
  },
  vacinacao: {
    imunizacao_vf_intervalos: IMUNIZACAO_VF_MOLD,
    imunizacao_calendario: IMUNIZACAO_CALENDARIO_MOLD,
    imunizacao_cadeia_frio: IMUNIZACAO_CADEIA_FRIO_MOLD,
    imunizacao_exceto: IMUNIZACAO_EXCETO_MOLD,
    imunizacao_generico: IMUNIZACAO_GENERIC_MOLD,
  },
  'vias de administracao': {
    via_vf_absorcao: VIA_VF_MOLD,
    via_tecnica_admin: VIA_TECNICA_MOLD,
    via_generico: VIA_GENERIC_MOLD,
  },
  'puncao venosa e cuidados com cateteres': {
    puncao_flebite: PUNCAO_FLEBITE_MOLD,
    puncao_dispositivo: PUNCAO_DISPOSITIVO_MOLD,
    puncao_exceto: PUNCAO_EXCETO_MOLD,
    puncao_tempo: PUNCAO_TEMPO_MOLD,
    puncao_periferica_antissepsia: PUNCAO_PERIFERICA_MOLD,
    puncao_ipcs_cvc: PUNCAO_IPCS_CVC_MOLD,
    puncao_generico: PUNCAO_GENERIC_MOLD,
  },
  'puncao venosa': {
    puncao_flebite: PUNCAO_FLEBITE_MOLD,
    puncao_dispositivo: PUNCAO_DISPOSITIVO_MOLD,
    puncao_exceto: PUNCAO_EXCETO_MOLD,
    puncao_tempo: PUNCAO_TEMPO_MOLD,
    puncao_periferica_antissepsia: PUNCAO_PERIFERICA_MOLD,
    puncao_ipcs_cvc: PUNCAO_IPCS_CVC_MOLD,
    puncao_generico: PUNCAO_GENERIC_MOLD,
  },
  cateteres: {
    puncao_flebite: PUNCAO_FLEBITE_MOLD,
    puncao_dispositivo: PUNCAO_DISPOSITIVO_MOLD,
    puncao_exceto: PUNCAO_EXCETO_MOLD,
    puncao_tempo: PUNCAO_TEMPO_MOLD,
    puncao_periferica_antissepsia: PUNCAO_PERIFERICA_MOLD,
    puncao_ipcs_cvc: PUNCAO_IPCS_CVC_MOLD,
    puncao_generico: PUNCAO_GENERIC_MOLD,
  },
  'cuidados na administracao de medicamentos': {
    cam_certos_vf_caso: CAM_CERTOS_VF_MOLD,
    cam_alto_risco: CAM_ALTO_RISCO_MOLD,
    cam_exceto_conduta: CAM_EXCETO_MOLD,
    cam_documentacao: CAM_DOCUMENTACAO_MOLD,
    cam_generico: CAM_GENERIC_MOLD,
  },
  'calculo de administracao de medicamentos e infusoes': {
    calc_dose_equivalencia: CALC_DOSE_MOLD,
    calc_conceito: CALC_GENERIC_MOLD,
    calc_generico: CALC_GENERIC_MOLD,
  },
  'calculo de administracao de medicamentos': {
    calc_dose_equivalencia: CALC_DOSE_MOLD,
    calc_conceito: CALC_GENERIC_MOLD,
    calc_generico: CALC_GENERIC_MOLD,
  },
  'calculos de enfermagem': {
    calc_dose_equivalencia: CALC_DOSE_MOLD,
    calc_conceito: CALC_GENERIC_MOLD,
    calc_generico: CALC_GENERIC_MOLD,
  },
  dosagens: {
    calc_dose_equivalencia: CALC_DOSE_MOLD,
    calc_conceito: CALC_GENERIC_MOLD,
    calc_generico: CALC_GENERIC_MOLD,
  },
  'doencas respiratorias cronicas (asma, dpoc)': {
    respiratorio_vf_asma_dpoc: RESPIRATORIO_VF_MOLD,
    respiratorio_dpoc_oxigenio: RESPIRATORIO_DPOC_MOLD,
    respiratorio_asma_crise: RESPIRATORIO_CRISE_MOLD,
    respiratorio_tecnica_inalador: RESPIRATORIO_TECNICA_MOLD,
    respiratorio_generico: RESPIRATORIO_GENERIC_MOLD,
  },
  'doencas respiratorias cronicas': {
    respiratorio_vf_asma_dpoc: RESPIRATORIO_VF_MOLD,
    respiratorio_dpoc_oxigenio: RESPIRATORIO_DPOC_MOLD,
    respiratorio_asma_crise: RESPIRATORIO_CRISE_MOLD,
    respiratorio_tecnica_inalador: RESPIRATORIO_TECNICA_MOLD,
    respiratorio_generico: RESPIRATORIO_GENERIC_MOLD,
  },
  asma: {
    respiratorio_vf_asma_dpoc: RESPIRATORIO_VF_MOLD,
    respiratorio_dpoc_oxigenio: RESPIRATORIO_DPOC_MOLD,
    respiratorio_asma_crise: RESPIRATORIO_CRISE_MOLD,
    respiratorio_tecnica_inalador: RESPIRATORIO_TECNICA_MOLD,
    respiratorio_generico: RESPIRATORIO_GENERIC_MOLD,
  },
  dpoc: {
    respiratorio_vf_asma_dpoc: RESPIRATORIO_VF_MOLD,
    respiratorio_dpoc_oxigenio: RESPIRATORIO_DPOC_MOLD,
    respiratorio_asma_crise: RESPIRATORIO_CRISE_MOLD,
    respiratorio_tecnica_inalador: RESPIRATORIO_TECNICA_MOLD,
    respiratorio_generico: RESPIRATORIO_GENERIC_MOLD,
  },
  'doencas bacterianas e fungicas (tuberculose, tetano, candidiase etc.)': {
    bacterianas_agente_etiologico: BACTERIANAS_ETIOLOGIA_MOLD,
    bacterianas_tuberculose: BACTERIANAS_TB_MOLD,
    bacterianas_generico: BACTERIANAS_GENERIC_MOLD,
  },
  'doencas bacterianas e fungicas': {
    bacterianas_agente_etiologico: BACTERIANAS_ETIOLOGIA_MOLD,
    bacterianas_tuberculose: BACTERIANAS_TB_MOLD,
    bacterianas_generico: BACTERIANAS_GENERIC_MOLD,
  },
  tuberculose: {
    bacterianas_agente_etiologico: BACTERIANAS_ETIOLOGIA_MOLD,
    bacterianas_tuberculose: BACTERIANAS_TB_MOLD,
    bacterianas_generico: BACTERIANAS_GENERIC_MOLD,
  },
  'infeccoes no contexto da biosseguranca': {
    biosseg_iras_itu_cateter: BIOSSEG_ITU_CATETER_MOLD,
    biosseg_generico: BIOSSEG_GENERIC_MOLD,
  },
  biosseguranca: {
    biosseg_iras_itu_cateter: BIOSSEG_ITU_CATETER_MOLD,
    biosseg_generico: BIOSSEG_GENERIC_MOLD,
  },
  iras: {
    biosseg_iras_itu_cateter: BIOSSEG_ITU_CATETER_MOLD,
    biosseg_generico: BIOSSEG_GENERIC_MOLD,
  },
  'seguranca do paciente': {
    sp_identificacao: SP_IDENTIFICACAO_MOLD,
    sp_prevencao_quedas: SP_QUEDAS_MOLD,
    sp_eventos_adversos: SP_EVENTOS_MOLD,
    sp_metas_internacionais: SP_REFERENCE_MOLD,
    sp_generico: SP_GENERIC_MOLD,
  },
  'assistencia perioperatoria (inclui srpa)': {
    perioperatorio_pre_operatorio: PERI_PREOP_MOLD,
    perioperatorio_pos_operatorio: PERI_POS_MOLD,
    perioperatorio_protocolo: PERI_PROTOCOL_MOLD,
    perioperatorio_vf: PERI_VF_MOLD,
    perioperatorio_isc: PERIOPERATORIO_GENERIC_MOLD,
    perioperatorio_generico: PERIOPERATORIO_GENERIC_MOLD,
  },
  'assistencia perioperatoria': {
    perioperatorio_pre_operatorio: PERI_PREOP_MOLD,
    perioperatorio_pos_operatorio: PERI_POS_MOLD,
    perioperatorio_protocolo: PERI_PROTOCOL_MOLD,
    perioperatorio_vf: PERI_VF_MOLD,
    perioperatorio_isc: PERIOPERATORIO_GENERIC_MOLD,
    perioperatorio_generico: PERIOPERATORIO_GENERIC_MOLD,
  },
  perioperatorio: {
    perioperatorio_pre_operatorio: PERI_PREOP_MOLD,
    perioperatorio_pos_operatorio: PERI_POS_MOLD,
    perioperatorio_protocolo: PERI_PROTOCOL_MOLD,
    perioperatorio_vf: PERI_VF_MOLD,
    perioperatorio_isc: PERIOPERATORIO_GENERIC_MOLD,
    perioperatorio_generico: PERIOPERATORIO_GENERIC_MOLD,
  },
  srpa: {
    perioperatorio_pre_operatorio: PERI_PREOP_MOLD,
    perioperatorio_pos_operatorio: PERI_POS_MOLD,
    perioperatorio_protocolo: PERI_PROTOCOL_MOLD,
    perioperatorio_vf: PERI_VF_MOLD,
    perioperatorio_isc: PERIOPERATORIO_GENERIC_MOLD,
    perioperatorio_generico: PERIOPERATORIO_GENERIC_MOLD,
  },
  'urgencias e emergencias': {
    urgencias_rcp_sbv: URGENCIAS_RCP_MOLD,
    urgencias_rcp_pediatrico: URGENCIAS_PEDIATRIC_MOLD,
    urgencias_avc_iam: URGENCIAS_AVC_MOLD,
    urgencias_xabcde_trauma: URGENCIAS_XABCDE_MOLD,
    urgencias_choque: URGENCIAS_CHOQUE_MOLD,
    urgencias_engasgo: URGENCIAS_ENGASGO_MOLD,
    urgencias_exceto_conduta: URGENCIAS_EXCETO_MOLD,
    urgencias_vf_protocolo: URGENCIAS_PROTOCOL_MOLD,
    urgencias_convulsao: URGENCIAS_PROTOCOL_MOLD,
    urgencias_manchester_triagem: URGENCIAS_MANCHESTER_MOLD,
    urgencias_anafilaxia: URGENCIAS_PROTOCOL_MOLD,
    urgencias_queimadura: URGENCIAS_PROTOCOL_MOLD,
    urgencias_generico: URGENCIAS_EMERGENCY_GENERIC_MOLD,
  },
  urgencias: {
    urgencias_rcp_sbv: URGENCIAS_RCP_MOLD,
    urgencias_rcp_pediatrico: URGENCIAS_PEDIATRIC_MOLD,
    urgencias_avc_iam: URGENCIAS_AVC_MOLD,
    urgencias_xabcde_trauma: URGENCIAS_XABCDE_MOLD,
    urgencias_choque: URGENCIAS_CHOQUE_MOLD,
    urgencias_engasgo: URGENCIAS_ENGASGO_MOLD,
    urgencias_exceto_conduta: URGENCIAS_EXCETO_MOLD,
    urgencias_vf_protocolo: URGENCIAS_PROTOCOL_MOLD,
    urgencias_convulsao: URGENCIAS_PROTOCOL_MOLD,
    urgencias_manchester_triagem: URGENCIAS_MANCHESTER_MOLD,
    urgencias_anafilaxia: URGENCIAS_PROTOCOL_MOLD,
    urgencias_queimadura: URGENCIAS_PROTOCOL_MOLD,
    urgencias_generico: URGENCIAS_EMERGENCY_GENERIC_MOLD,
  },
  emergencia: {
    urgencias_rcp_sbv: URGENCIAS_RCP_MOLD,
    urgencias_rcp_pediatrico: URGENCIAS_PEDIATRIC_MOLD,
    urgencias_avc_iam: URGENCIAS_AVC_MOLD,
    urgencias_xabcde_trauma: URGENCIAS_XABCDE_MOLD,
    urgencias_choque: URGENCIAS_CHOQUE_MOLD,
    urgencias_engasgo: URGENCIAS_ENGASGO_MOLD,
    urgencias_exceto_conduta: URGENCIAS_EXCETO_MOLD,
    urgencias_vf_protocolo: URGENCIAS_PROTOCOL_MOLD,
    urgencias_convulsao: URGENCIAS_PROTOCOL_MOLD,
    urgencias_manchester_triagem: URGENCIAS_MANCHESTER_MOLD,
    urgencias_anafilaxia: URGENCIAS_PROTOCOL_MOLD,
    urgencias_queimadura: URGENCIAS_PROTOCOL_MOLD,
    urgencias_generico: URGENCIAS_EMERGENCY_GENERIC_MOLD,
  },
  urgencia: {
    urgencias_rcp_sbv: URGENCIAS_RCP_MOLD,
    urgencias_rcp_pediatrico: URGENCIAS_PEDIATRIC_MOLD,
    urgencias_avc_iam: URGENCIAS_AVC_MOLD,
    urgencias_xabcde_trauma: URGENCIAS_XABCDE_MOLD,
    urgencias_choque: URGENCIAS_CHOQUE_MOLD,
    urgencias_engasgo: URGENCIAS_ENGASGO_MOLD,
    urgencias_exceto_conduta: URGENCIAS_EXCETO_MOLD,
    urgencias_vf_protocolo: URGENCIAS_PROTOCOL_MOLD,
    urgencias_convulsao: URGENCIAS_PROTOCOL_MOLD,
    urgencias_manchester_triagem: URGENCIAS_MANCHESTER_MOLD,
    urgencias_anafilaxia: URGENCIAS_PROTOCOL_MOLD,
    urgencias_queimadura: URGENCIAS_PROTOCOL_MOLD,
    urgencias_generico: URGENCIAS_EMERGENCY_GENERIC_MOLD,
  },
  'saude da mulher': {
    mulher_prenatal: MULHER_PRENATAL_MOLD,
    mulher_parto: MULHER_PARTO_MOLD,
    mulher_papanicolau: MULHER_PAPANICOLAU_MOLD,
    mulher_mama: MULHER_MAMA_MOLD,
    mulher_puerperio: MULHER_PUERPERIO_MOLD,
    mulher_planejamento: MULHER_PLANEJAMENTO_MOLD,
    mulher_generico: MULHER_GENERIC_DESIGN,
  },
  obstetricia: {
    mulher_prenatal: MULHER_PRENATAL_MOLD,
    mulher_parto: MULHER_PARTO_MOLD,
    mulher_papanicolau: MULHER_PAPANICOLAU_MOLD,
    mulher_mama: MULHER_MAMA_MOLD,
    mulher_puerperio: MULHER_PUERPERIO_MOLD,
    mulher_planejamento: MULHER_PLANEJAMENTO_MOLD,
    mulher_generico: MULHER_GENERIC_DESIGN,
  },
  ginecologia: {
    mulher_prenatal: MULHER_PRENATAL_MOLD,
    mulher_parto: MULHER_PARTO_MOLD,
    mulher_papanicolau: MULHER_PAPANICOLAU_MOLD,
    mulher_mama: MULHER_MAMA_MOLD,
    mulher_puerperio: MULHER_PUERPERIO_MOLD,
    mulher_planejamento: MULHER_PLANEJAMENTO_MOLD,
    mulher_generico: MULHER_GENERIC_DESIGN,
  },
  'saude da crianca': {
    crianca_aleitamento_nutricao: CRIANCA_ALEITAMENTO_MOLD,
    crianca_triagem_neonatal: CRIANCA_TRIAGEM_MOLD,
    crianca_neonatologia: CRIANCA_NEONATOLOGIA_MOLD,
    crianca_aps_puericultura: CRIANCA_PUERICULTURA_MOLD,
    crianca_desenvolvimento: CRIANCA_DESENVOLVIMENTO_MOLD,
    crianca_desidratacao: CRIANCA_DESIDRATACAO_MOLD,
    crianca_generico: CRIANCA_PEDIATRIC_HUB_MOLD,
  },
  pediatria: {
    crianca_aleitamento_nutricao: CRIANCA_ALEITAMENTO_MOLD,
    crianca_triagem_neonatal: CRIANCA_TRIAGEM_MOLD,
    crianca_neonatologia: CRIANCA_NEONATOLOGIA_MOLD,
    crianca_aps_puericultura: CRIANCA_PUERICULTURA_MOLD,
    crianca_desenvolvimento: CRIANCA_DESENVOLVIMENTO_MOLD,
    crianca_desidratacao: CRIANCA_DESIDRATACAO_MOLD,
    crianca_generico: CRIANCA_PEDIATRIC_HUB_MOLD,
  },
  'historia da enfermagem': {
    historia_nightingale: HISTORIA_NIGHTINGALE_MOLD,
    historia_humanizacao: HISTORIA_HUMANIZACAO_MOLD,
    historia_comunicacao_etica: HISTORIA_ETICA_MOLD,
    historia_generico: HISTORIA_GENERIC_DESIGN,
  },
  'historia enfermagem': {
    historia_nightingale: HISTORIA_NIGHTINGALE_MOLD,
    historia_humanizacao: HISTORIA_HUMANIZACAO_MOLD,
    historia_comunicacao_etica: HISTORIA_ETICA_MOLD,
    historia_generico: HISTORIA_GENERIC_DESIGN,
  },
  historia: {
    historia_nightingale: HISTORIA_NIGHTINGALE_MOLD,
    historia_humanizacao: HISTORIA_HUMANIZACAO_MOLD,
    historia_comunicacao_etica: HISTORIA_ETICA_MOLD,
    historia_generico: HISTORIA_GENERIC_DESIGN,
  },
  'curativos e manejo de feridas': {
    curativos_cobertura_selecao: CURATIVOS_COBERTURA_BESPOKE,
    curativos_ferida_cirurgica: CURATIVOS_FO_MOLD,
    curativos_lpp: CURATIVOS_LPP_MOLD,
    curativos_tecnica_assepsia: CURATIVOS_REFERENCE_MOLD,
    curativos_desbridamento: CURATIVOS_REFERENCE_MOLD,
    curativos_exceto_incorreta: CURATIVOS_EXCETO_MOLD,
    curativos_estomia: CURATIVOS_REFERENCE_MOLD,
    curativos_bandagem_imobilizacao: CURATIVOS_REFERENCE_MOLD,
    curativos_dreno: CURATIVOS_REFERENCE_MOLD,
    curativos_termoterapia: CURATIVOS_REFERENCE_MOLD,
    curativos_generico: CURATIVOS_GENERIC_MOLD,
  },
  curativos: {
    curativos_cobertura_selecao: CURATIVOS_COBERTURA_BESPOKE,
    curativos_ferida_cirurgica: CURATIVOS_FO_MOLD,
    curativos_lpp: CURATIVOS_LPP_MOLD,
    curativos_tecnica_assepsia: CURATIVOS_REFERENCE_MOLD,
    curativos_desbridamento: CURATIVOS_REFERENCE_MOLD,
    curativos_exceto_incorreta: CURATIVOS_EXCETO_MOLD,
    curativos_estomia: CURATIVOS_REFERENCE_MOLD,
    curativos_bandagem_imobilizacao: CURATIVOS_REFERENCE_MOLD,
    curativos_dreno: CURATIVOS_REFERENCE_MOLD,
    curativos_termoterapia: CURATIVOS_REFERENCE_MOLD,
    curativos_generico: CURATIVOS_GENERIC_MOLD,
  },
  'manejo de feridas': {
    curativos_cobertura_selecao: CURATIVOS_COBERTURA_BESPOKE,
    curativos_ferida_cirurgica: CURATIVOS_FO_MOLD,
    curativos_lpp: CURATIVOS_LPP_MOLD,
    curativos_tecnica_assepsia: CURATIVOS_REFERENCE_MOLD,
    curativos_desbridamento: CURATIVOS_REFERENCE_MOLD,
    curativos_exceto_incorreta: CURATIVOS_EXCETO_MOLD,
    curativos_estomia: CURATIVOS_REFERENCE_MOLD,
    curativos_bandagem_imobilizacao: CURATIVOS_REFERENCE_MOLD,
    curativos_dreno: CURATIVOS_REFERENCE_MOLD,
    curativos_termoterapia: CURATIVOS_REFERENCE_MOLD,
    curativos_generico: CURATIVOS_GENERIC_MOLD,
  },
  'feridas e queimaduras': {
    feridas_grau_profundidade: FERIDAS_GRAU_MOLD,
    feridas_scq_calculo: FERIDAS_SCQ_MOLD,
    feridas_scq_regra9: FERIDAS_SCQ_MOLD,
    feridas_grande_queimado: FERIDAS_SCQ_MOLD,
    feridas_atendimento_inicial: FERIDAS_ATENDIMENTO_MOLD,
    feridas_classificacao: FERIDAS_REFERENCE_MOLD,
    feridas_cicatrizacao: FERIDAS_REFERENCE_MOLD,
    feridas_curativo_tipo: FERIDAS_REFERENCE_MOLD,
    feridas_generico: FERIDAS_GENERIC_MOLD,
  },
  feridas: {
    feridas_grau_profundidade: FERIDAS_GRAU_MOLD,
    feridas_scq_calculo: FERIDAS_SCQ_MOLD,
    feridas_scq_regra9: FERIDAS_SCQ_MOLD,
    feridas_grande_queimado: FERIDAS_SCQ_MOLD,
    feridas_atendimento_inicial: FERIDAS_ATENDIMENTO_MOLD,
    feridas_classificacao: FERIDAS_REFERENCE_MOLD,
    feridas_cicatrizacao: FERIDAS_REFERENCE_MOLD,
    feridas_curativo_tipo: FERIDAS_REFERENCE_MOLD,
    feridas_generico: FERIDAS_GENERIC_MOLD,
  },
  queimaduras: {
    feridas_grau_profundidade: FERIDAS_GRAU_MOLD,
    feridas_scq_calculo: FERIDAS_SCQ_MOLD,
    feridas_scq_regra9: FERIDAS_SCQ_MOLD,
    feridas_grande_queimado: FERIDAS_SCQ_MOLD,
    feridas_atendimento_inicial: FERIDAS_ATENDIMENTO_MOLD,
    feridas_classificacao: FERIDAS_REFERENCE_MOLD,
    feridas_cicatrizacao: FERIDAS_REFERENCE_MOLD,
    feridas_curativo_tipo: FERIDAS_REFERENCE_MOLD,
    feridas_generico: FERIDAS_GENERIC_MOLD,
  },
  'enfermagem do trabalho': {
    trabalho_vf_nr32: TRABALHO_BESPOKE_MOLD,
    trabalho_pep_trap: TRABALHO_BESPOKE_MOLD,
    trabalho_nr15_reference: TRABALHO_NR15_MOLD,
    trabalho_ergonomia: TRABALHO_ERGONOMIA_MOLD,
    trabalho_generico: TRABALHO_GENERIC_MOLD,
  },
  'saude do trabalhador': {
    trabalho_vf_nr32: TRABALHO_BESPOKE_MOLD,
    trabalho_pep_trap: TRABALHO_BESPOKE_MOLD,
    trabalho_nr15_reference: TRABALHO_NR15_MOLD,
    trabalho_ergonomia: TRABALHO_ERGONOMIA_MOLD,
    trabalho_generico: TRABALHO_GENERIC_MOLD,
  },
  crase: {
    pt_crase: PT_CRASE_MOLD,
    pt_crase_generico: PT_CRASE_GENERIC_MOLD,
  },
  'acento indicativo de crase': {
    pt_crase: PT_CRASE_MOLD,
    pt_crase_generico: PT_CRASE_GENERIC_MOLD,
  },
  'pronomes e colocacao pronominal': {
    pt_pronomes_colocacao: PT_CLITIC_RAIL_MOLD,
    pt_pronomes_colocacao_generico: PT_CLITIC_RAIL_GENERIC_MOLD,
  },
  'colocacao pronominal': {
    pt_pronomes_colocacao: PT_CLITIC_RAIL_MOLD,
    pt_pronomes_colocacao_generico: PT_CLITIC_RAIL_GENERIC_MOLD,
  },
  pronomes: {
    pt_pronomes_colocacao: PT_CLITIC_RAIL_MOLD,
    pt_pronomes_colocacao_generico: PT_CLITIC_RAIL_GENERIC_MOLD,
  },
  pontuacao: {
    pt_pontuacao: PT_COMMA_RAIL_MOLD,
    pt_pontuacao_generico: PT_COMMA_RAIL_GENERIC_MOLD,
  },
  'termos da oracao': {
    pt_termos_oracao: PT_TERM_MATRIX_MOLD,
    pt_termos_oracao_generico: PT_TERM_MATRIX_GENERIC_MOLD,
  },
  termos: {
    pt_termos_oracao: PT_TERM_MATRIX_MOLD,
    pt_termos_oracao_generico: PT_TERM_MATRIX_GENERIC_MOLD,
  },
  concordancia: {
    pt_concordancia: PT_SUBJECT_FOCUS_MOLD,
    pt_concordancia_generico: PT_SUBJECT_FOCUS_GENERIC_MOLD,
  },
  'concordancia verbal e nominal': {
    pt_concordancia: PT_SUBJECT_FOCUS_MOLD,
    pt_concordancia_generico: PT_SUBJECT_FOCUS_GENERIC_MOLD,
  },
};

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function countPatternMatches(corpus: string, patterns: RegExp[]): number {
  return patterns.reduce((n, p) => (p.test(corpus) ? n + 1 : n), 0);
}

const NUTRITION_ANTHROPOMETRY: RegExp[] = [
  /escore\s*z|score\s*z|\bz\s*[<>≤≥]|desvio[\s-]?padr[aã]o/i,
  /\bimc\b|índice de massa|eutrofi|sobrepeso|obesidade|magreza/i,
  /antropometr|pondero[\s-]?estatur|caderneta do adolescente|curvas?\s*oms/i,
  /classifica[cç][aã]o nutricional|estatura muito baixa/i,
];

const ADOLESCENT_ETHICS: RegExp[] = [
  /sigilo|confidencial|quebra de sigilo|quebrar sigilo/i,
  /escuta qualificada|privacidade\s+(?:na\s+)?consulta|consulta.{0,30}privacidade/i,
  /acolhimento\s+sem\s+julgamento|espa[cç]o do adolescente/i,
  /\bcaps\b|aten[cç][aã]o psicossocial/i,
];

/** Violência / rede de proteção — não usar moldes de sigilo em consulta. */
const ADOLESCENT_VIOLENCE: RegExp[] = [
  /viol[eê]ncia sexual|abuso sexual|agressor|denunciar.*abusador/i,
  /notifica[cç][aã]o compuls[oó]ria.*viol|agravo.*notifica[cç]/i,
  /rede de prote[cç][aã]o|conselho tutelar|ind[ií]cios? de viol[eê]ncia/i,
  /viol[eê]ncia.*crian[cç]a|viol[eê]ncia.*adolescente|espa[cç]o.*viol[eê]ncia sexual/i,
];

const ADOLESCENT_DEVELOPMENT: RegExp[] = [
  /puberdade|puberal|metamorfose/i,
  /horm[oô]nio|disfun[cç][aã]o hormonal|desenvolvimento das mamas|test[ií]culo/i,
  /menarca|espermarquia|estadiamento de tanner|tanner/i,
  /atraso na puberdade|maturidade sexual/i,
];

const ADOLESCENT_MENTAL: RegExp[] = [
  /anorexia|bulimia|transtorno alimentar|imagem corporal/i,
  /depress[aã]o adolescente|autoles[aã]o|suic[ií]dio adolescente/i,
  /sa[uú]de mental.*adolescente/i,
];

const CME_PREPARO: RegExp[] = [
  /preparo|pr[eé][\s-]?secagem|limpeza de instrumental|descontamin|lavagem mec[aâ]nica|ultrasson/i,
];

const CME_AUTOCLAVE: RegExp[] = [
  /autoclave|vapor saturado|esteriliza[cç][aã]o por calor|temperatura.*press[aã]o|ciclo de esteriliza/i,
  /indicador (qu[ií]mico|biol[oó]gico)|embalagem.*esteril/i,
];

const CME_PROCESSAMENTO: RegExp[] = [
  /processamento de artigos|áreas?\s*(limp|suja|semimorta)|cadeia de processamento|rt\b.*cme/i,
];

const CME_VF_CE: RegExp[] = [
  /julgue|certo ou errado|verdadeira.*falsa|assinale a alternativa incorreta|exceto/i,
];

const MENTAL_RAPS: RegExp[] = [
  /\braps\b|reforma psiqui[aá]trica|\bsrt\b|portaria.*3088|rede de aten[cç][aã]o psicossocial/i,
];

const MENTAL_DEPENDENCIA: RegExp[] = [
  /tabagismo|pnct|depend[eê]ncia qu[ií]mica|álcool|redu[cç][aã]o de danos|cigarro|nicotina/i,
];

const MENTAL_CRISE: RegExp[] = [
  /crise|agita[cç][aã]o|conten[cç][aã]o f[ií]sica|\bcaps\b|urg[eê]ncia psiqui[aá]trica/i,
  /risco suicida|ideação suicida|autoagress/i,
];

const MENTAL_DEPRESSAO: RegExp[] = [
  /depress[aã]o|transtorno de humor|epidemiologia.*mental|melancolia/i,
];

const MENTAL_APS: RegExp[] = [
  /\baps\b|aten[cç][aã]o b[aá]sica|biopsicossocial|acolhimento.*prim[aá]ria/i,
];

const SAE_DOCUMENTACAO: RegExp[] = [
  /anota[cç][aã]o de enfermagem|prontu[aá]rio|documenta[cç][aã]o|registro de enfermagem|soapi|evolu[cç][aã]o de enfermagem/i,
  /carimbo|identifica[cç][aã]o do profissional|veracidade|integridade do registro/i,
];

const SAE_ETAPAS: RegExp[] = [
  /processo de enfermagem|\bsae\b|nanda|nic\b|noc\b|diagn[oó]stico de enfermagem/i,
  /coleta de dados|planejamento de enfermagem|implementa[cç][aã]o|avalia[cç][aã]o de enfermagem|prescri[cç][aã]o de enfermagem/i,
  /cinco etapas|5 etapas|etapa.*enfermagem/i,
];

const SAE_EXCETO: RegExp[] = [
  /\bexceto\b|incorret[oa]|n[aã]o corresponde|afirmativa.*incorreta/i,
];

const SONDA_MEDICAO: RegExp[] = [
  /\bnex\b|nariz.*orelha|lobo da orelha|xifoide|umbigo|medi[cç][aã]o.*sonda|comprimento/i,
];

const SONDA_INSTALACAO: RegExp[] = [
  /instala[cç][aã]o|fixa[cç][aã]o|nasog[aá]strica|nasoenteral|bal[aã]o|gastrostomia|jejunostomia/i,
];

const FARMACO_VF: RegExp[] = [
  /\b(i|ii|iii)\s*[-–—]/i,
  /afirmativa|verdadeira.*falsa|julgue os itens|correto o que se afirma/i,
  /meia[\s-]?vida|t½|t1\/2|\badme\b/i,
  /farmacocin[eé]tica.*farmacodin[aâ]mica|corpo.*f[aá]rmaco/i,
];

const FARMACO_CLINICO: RegExp[] = [
  /hospitaliz|úlcera|infus[aã]o contínua|monitoriz|ph g[aá]stric|titulad/i,
  /omeprazol|antibi[oó]tic|endovenos|fentanil|meropenem|insulina|diazepam|midazolam|benzodiazep/i,
  /administra[cç][aã]o correta|conduta.*enfermagem.*medicamento/i,
];

const FARMACO_EXCETO: RegExp[] = [
  /\bexceto\b/i,
  /incorret[oa]\s+afirmar/i,
  /é\s+incorret[oa]/i,
  /alternativa\s+incorreta/i,
  /assinale a alternativa incorreta/i,
  /qual.*n[aã]o\s+[ée]\s+classificad/i,
  /n[aã]o\s+[ée]\s+classificad[oa]/i,
];

const IMUNIZACAO_VF: RegExp[] = [
  /\b(i|ii|iii)\s*[-–—]/i,
  /afirmativa|verdadeira.*falsa|julgue os itens/i,
  /intervalo|refor[cç]o|dose.*vacina/i,
];

const IMUNIZACAO_CALENDARIO: RegExp[] = [
  /calend[aá]rio|pni\b|esquema vacinal|idade.*dose|refor[cç]o|bcg|tr[ií]plice|hexa|penta/i,
];

const IMUNIZACAO_CADEIA_FRIO: RegExp[] = [
  /cadeia de frio|rede de frio|\bconserva[cç][aã]o\b|refrigerador|refrigerada?|congelamento|term[oô]metro|termol[aá]bil|si-pni|gelox|caixa t[eé]rmica|\bvalidade\b.*\bvacina\b|\btransporte\b.*\bimunobiol/i,
];

const IMUNIZACAO_EXCETO: RegExp[] = [
  /\bexceto\b/i,
  /incorret[oa]\s+afirmar/i,
  /é\s+incorret[oa]/i,
  /n[aã]o\s+corresponde\s+(a\s+)?(verdade|realidade)/i,
  /afirmativa\s+falsa|marque\s+a\s+falsa/i,
];

const VIA_VF: RegExp[] = [
  /\b(i|ii|iii)\s*[-–—]/i,
  /absor[cç][aã]o|biodisponibilidade|via.*intramuscular|via.*subcut[aâ]nea/i,
];

const VIA_EXCETO: RegExp[] = [
  /\bexceto\b/i,
  /alternativa\s+incorreta/i,
  /incorret[oa]\s+afirmar/i,
  /é\s+incorret[oa]/i,
  /assinale\s+a\s+alternativa\s+incorreta/i,
];

const VIA_TECNICA: RegExp[] = [
  /t[eé]cnica|administra[cç][aã]o|ângulo|m[uú]sculo|deltoide|ventrogluteo|pun[cç][aã]o/i,
];

const CAM_CERTOS_VF: RegExp[] = [
  /9 certos|nove certos|paciente certo|medicamento certo|dose certa|via certa|hor[aá]rio certo/i,
  /documenta[cç][aã]o certa|orienta[cç][aã]o certa|resposta certa|forma certa/i,
  /dois identificador|prescri[cç][aã]o ileg[ií]vel|dose duvidosa|uso habitual/i,
  /administra[cç][aã]o de medicamentos|cuidados na administra[cç][aã]o/i,
];

const CAM_ALTO_RISCO: RegExp[] = [
  /alto risco|confer[eê]ncia dupla|dois profissionais habilitados/i,
  /insulina|nph|heparina|quimioter[aá]pico|eletr[oó]litos|vasoativ|anticoagulante/i,
  /medicamentos de alto risco|lista.*alto risco|dupla checagem/i,
];

const CAM_EXCETO: RegExp[] = [
  /\bexceto\b/i,
  /incorret[oa]\s+afirmar|alternativa\s+incorreta|n[aã]o condiz/i,
  /preparo de medicamento|sala de medica[cç][aã]o/i,
];

const CAM_DOCUMENTACAO: RegExp[] = [
  /registro certo|documenta[cç][aã]o certa|prontu[aá]rio/i,
  /anotar.*ap[oó]s administrar|registrar.*hor[aá]rio.*dose.*via/i,
  /certo\s*6\b/i,
];

const PUNCAO_FLEBITE: RegExp[] = [
  /infiltra[cç][aã]o|flebite|hematoma|extravasamento|esclerose/i,
  /complica[cç][aã]o.*(venos|cateter|acesso venoso|iv\b)/i,
  /tecido subcut[aâ]neo|fora do vaso|inflama[cç][aã]o.*veia/i,
  /deslocamento da agulha|perfura[cç][aã]o da parede/i,
];

const PUNCAO_DISPOSITIVO: RegExp[] = [
  /jelco|scalp|calibre|\b(14|16|18|20|22|24)\s*g\b|gauge/i,
  /dispositivo venoso|agulha.?cateter|cateter perif[eé]ric/i,
];

const PUNCAO_EXCETO: RegExp[] = [
  /\bexceto\b/i,
  /incorret[oa]\s+afirmar|alternativa\s+incorreta|assinale a alternativa incorreta/i,
  /administra[cç][aã]o endovenosa.*exceto|pun[cç][aã]o.*exceto/i,
];

const PUNCAO_TEMPO: RegExp[] = [
  /troca.*equipo|equipos?.*(24|48|72|96)\s*h|perman[eê]ncia.*cateter/i,
  /curativo.*(24|48|72)\s*h|intervalo.*infus/i,
  /observa[cç][aã]o p[oó]s|observar.*sinais.*ap[oó]s/i,
  /reavaliar.*di[aá]riamente|remover quando n[aã]o necess/i,
  /(?:flush|lavagem|permeabil).{0,40}(?:cateter|l[uú]men|equipo)/i,
  /manuten[cç][aã]o.*cateter|manter.*oclus/i,
];

const PUNCAO_PERIFERICA: RegExp[] = [
  /antissepsia|álcool\s*70|clorexidina.*pun[cç][aã]o/i,
  /bisel.*cima|sele[cç][aã]o de veia|veia proeminente/i,
  /pun[cç][aã]o perif[eé]rica|cateter novo.*tentativa|proximal.*distal/i,
];

const PUNCAO_IPCS: RegExp[] = [
  /bundle|ipcs|corrente sangu[ií]nea|cvc\b|cateter central/i,
  /barreira est[eé]ril m[aá]xima|infec[cç][aã]o.*cateter venoso central/i,
];

const CALC_DOSE: RegExp[] = [
  /calcul|gota|ml\b|mg\b|equival[eê]ncia|dilui[cç][aã]o|regra de tr[eê]s|gts\/min|ml\/h/i,
  /quantos?\s+ml|quantas?\s+gotas|prescri[cç][aã]o.*dose/i,
];

const RESP_VF: RegExp[] = [
  /\b(i|ii|iii)\s*[-–—]/i,
  /afirmativa|verdadeira.*falsa|julgue os itens|correto o que se afirma/i,
  /semiologia respirat/i,
];

const RESP_CRISE: RegExp[] = [
  /\bexceto\b/i,
  /crise asm[aá]tica|broncoespasmo|sibil[oô]s?|sibil[aâ]ncia|beta[\s-]?2|salbutamol|inalador de resgate/i,
];

const RESP_TECNICA: RegExp[] = [
  /espacador|espaçador|inalador|mdi\b|aerossol|t[eé]cnica.*inala|pico de fluxo|peak flow|corticoide inalat/i,
];

const RESP_DPOC: RegExp[] = [
  /\bdpoc\b|enfisema|bronquite cr[oô]nica|retentor|hipercapnia|88.?92|oxigen.*titulad|spo2|saturac/i,
  /venturi|cat[eé]ter nasal|oxigenoterapia/i,
];

const URGENCIAS_RCP: RegExp[] = [
  /\brcp\b|\bsbv\b|parada card|pcr\b|ressuscita[cç][aã]o cardiopulmonar/i,
  /compress[oõ]es tor[aá]c|30:2|100.?120|5.?6\s*cm|american heart|aha\b/i,
  /\bdea\b|desfibril|choque.*el[eé]tric/i,
];

const URGENCIAS_AVC: RegExp[] = [
  /cincinnati|face.*bra[cç]o.*fala|escala de cincinnati|avc\b|iam\b|fast\b/i,
  /assimetria facial|fala anormal|derrame/i,
];

const URGENCIAS_TRAUMA: RegExp[] = [
  /\bxabcde\b|hemorragia|imobiliza[cç][aã]o|fratura|torniquete|trauma/i,
  /queimadura|esmagamento|bt-?16/i,
];

const URGENCIAS_CHOQUE: RegExp[] = [
  /\bchoque\b|hipoperfus|hipovol[eê]m|cardiog[eê]nic|distributivo|obstrutivo/i,
];

const URGENCIAS_ANAFILAXIA: RegExp[] = [
  /\banafilaxia\b|epinefrina|\badrenalina\b/i,
];

const URGENCIAS_ENGASGO: RegExp[] = [
  /engasgo|obstru[cç][aã]o.*via a[eé]rea|heimlich|manobra de heimlich|sinal universal/i,
];

const URGENCIAS_MANCHESTER: RegExp[] = [
  /manchester|triagem de risco|etiqueta vermelha|classifica[cç][aã]o de risco/i,
];

const BACTERIANAS_ETIOLOGIA: RegExp[] = [
  /todas as doen[cç]as.*bact[eé]ri|causadas por bact[eé]ri|agente etiol[oó]gic/i,
  /bact[eé]ria.*v[ií]rus.*protozo|classifica[cç][aã]o etiol|intruso.*v[ií]rus/i,
  /quantificador.*todas|nenhum v[ií]rus ou protozo/i,
];

const BACTERIANAS_TB: RegExp[] = [
  /tuberculose|tubercul[ií]n|bacilo de koch|mycobacterium/i,
  /\bbaar\b|bacilo [aá]lcool|escarro.*bacilo/i,
  /\btdo\b|\bdot\b|tratamento diretamente observado/i,
  /notifica[cç][aã]o compuls[oó]ria.*tubercul|contactante.*tubercul/i,
  /precau[cç][aã]o.*aeross[oó]l|bacil[ií]fer/i,
];

const BIOSSEG_ITU_CATETER: RegExp[] = [
  /\bitu\b|infec[cç][aã]o do trato urin[aá]rio|iras\b|infec[cç][aã]o relacionada [àa] assist/i,
  /cateteriza[cç][aã]o vesical|sonda vesical|cateter vesical|drenagem urin[aá]ria/i,
  /sistema de drenagem fechado|meato|bolsa coletora/i,
];

const SP_IDENTIFICACAO: RegExp[] = [
  /dois identificador|identificar corretamente o paciente|pulseira.*identifica/i,
  /paciente errado|hom[oô]nimo|dupla checagem/i,
];

const SP_QUEDAS: RegExp[] = [
  /queda|risco de queda|escala.*morse|\bmorse\b|grades da cama/i,
  /prevenc[aã]o de queda|protocolo de queda|pulseira.*queda/i,
];

const SP_EVENTOS: RegExp[] = [
  /evento adverso|incidente|near miss|quase erro|\bpnsp\b|portaria.*529/i,
  /notifica[cç][aã]o de evento|cultura de seguran[cç]a|probabilidade de um incidente/i,
];

const SP_METAS: RegExp[] = [
  /metas internacionais|meta internacional|\bjci\b|joint commission/i,
  /higienizar as m[aã]os.*identificar|cirurgia segura.*medicamento/i,
];

const PERI_ISC: RegExp[] = [
  /infec[cç][aã]o.*s[ií]tio|infeccao.*sitio|\bisc\b|deisc[eê]ncia|ferida operat[oó]ria/i,
];

const PERI_PROTOCOLO: RegExp[] = [
  /cirurgia segura|checklist|time\s*out|timeout|\boms\b.*cirurg|cdc.*ferida|classifica[cç][aã]o.*ferida/i,
];

const PERI_PRE: RegExp[] = [
  /\bpr[eé][\s-]operat|preparo.*cir[uú]rg|tricotomia|jejum/i,
];

const PERI_POS: RegExp[] = [
  /\bsrpa\b|recupera[cç][aã]o p[oó]s-anest|p[oó]s[\s-]?operat|aldrete|kroulik/i,
];

const PERI_SRPA_CPD: RegExp[] = [/cateter peridural|\bcpd\b|curativo.*peridural/i];

const MULHER_PARTO: RegExp[] = [
  /trabalho de parto|parto humanizado|fase expulsiva|dequita[cç][aã]o|clampeamento/i,
  /acompanhante.*parto|posi[cç][aã]o.*expulsivo|monitoriza[cç][aã]o.*fetal/i,
];

const MULHER_PAPANICOLAU: RegExp[] = [
  /papanicolau|colo uterino|c[aâ]ncer.*colo|citologia onc[oó]tica|rastreio.*colo/i,
  /hpv.*vacina|25\s*(?:e|a)\s*64|trienal/i,
];

const MULHER_MAMA: RegExp[] = [
  /mamografia|rastreio.*mama|c[aâ]ncer de mama|autoexame.*mama/i,
];

const MULHER_PUERPERIO: RegExp[] = [
  /puerp[eé]rio|puerperal|lacta[cç][aã]o|aleitamento|colostro|amamenta[cç][aã]o/i,
];

const MULHER_PLANEJAMENTO: RegExp[] = [
  /planejamento familiar|contracep|anticoncep|m[eé]todo.*barreira|\bdiu\b|implante/i,
];

const MULHER_PRENATAL: RegExp[] = [
  /pr[eé][\s-]?natal|gesta[cç][aã]o|gestante|gravidez|idade gestacional|\big\b.*semana/i,
  /ttgo|glicemia.*jejum|vdrl|ácido fólico|acido folico|consultas.*pré/i,
  /álcool na gesta|tabagismo.*gesta|movimentos fetais/i,
];

const CRIANCA_TRIAGEM: RegExp[] = [
  /pezinho|teste do pezinho|fenilceton|fenilalanina|pk[uú]|tsh|hipotireoidismo congen/i,
  /triagem neonatal|teste do cora[cç][aã]ozinho|oximetria.*rn|pntn/i,
];

const CRIANCA_ALEITAMENTO: RegExp[] = [
  /aleitamento|amamenta[cç][aã]o|ame\b|leite materno|lactente|colostro/i,
  /introdu[cç][aã]o alimentar|pnae|mel\b|ordenha|fórmula infantil|nutri[cç][aã]o infantil/i,
];

const CRIANCA_DESIDRATACAO: RegExp[] = [
  /desidrata[cç][aã]o|diarreia aguda|plano [abc]|soro oral|tiragem|fontanela/i,
  /olig[uú]ria|mucosa seca|perda de peso.*diarreia/i,
];

const CRIANCA_NEONATOLOGIA: RegExp[] = [
  /surfactante|icter[ií]cia|s[ií]ndrome do desconforto|sdr\b|cefalohematoma/i,
  /convuls[aã]o neonatal|banho.*rec[eé]m|pele.*rec[eé]m-nascido|glicemia.*neonatal/i,
];

const CRIANCA_PUERICULTURA: RegExp[] = [
  /visita domiciliar|puericultura|5[oº] dia|caderneta|calend[aá]rio.*consulta/i,
  /estratifica[cç][aã]o.*risco|sinais de alerta|cab\b|aten[cç][aã]o b[aá]sica.*crian[cç]a/i,
];

const CRIANCA_DESENVOLVIMENTO: RegExp[] = [
  /tea\b|m-?chat|estrabismo|hirschberg|marco.*desenvolv|aidpi/i,
  /estimula[cç][aã]o precoce|desenvolvimento infantil/i,
];

const HISTORIA_NIGHTINGALE: RegExp[] = [
  /nightingale|florence|crimeia|dama da l[aâ]mpada|12 de maio/i,
  /ana n[eé]ri|eul[aá]lia|anna nery|escola de enfermagem|pioneir/i,
  /pr[eé][\s-]?sus|sistema [uú]nico de sa[uú]de|1988|marco hist[oó]ric/i,
  /sa[uú]de p[uú]blica.*brasil|evolu[cç][aã]o hist[oó]rica|lei\s*7\.?498|decreto\s*94\.?406/i,
  /get[uú]lio vargas|revolta da vacina|henrique dutra/i,
];

const HISTORIA_ETICA: RegExp[] = [
  /c[oó]digo de [eé]tica|cofen|coren/i,
  /autonomia|benefic[eê]ncia|n[aã]o malefic[eê]ncia|justi[cç]a/i,
  /comunica[cç][aã]o profissional|ru[ií]do na comunica|cal[uú]nia|difama[cç][aã]o|inj[uú]ria/i,
  /deveres profissionais|rela[cç][oõ]es humanas.*comunica/i,
];

const HISTORIA_HUMANIZACAO: RegExp[] = [
  /humaniza[cç][aã]o|pnh|pol[ií]tica nacional de humaniza/i,
  /peplau|watson|leininger|horta|hol[ií]stic|interdisciplinar|intersubjetiv/i,
  /teoria.*enfermagem|lideran[cç]a democr[aá]tica|abordagem hol[ií]stica/i,
  /cuidado centrado|terap[eê]utico|promo[cç][aã]o da humaniza/i,
];

const PT_CRASE_SIGNALS: RegExp[] = [
  /\bcrase\b/i,
  /acento\s+indicativo\s+de\s+crase/i,
  /a\s*\+\s*a\b/i,
  /funil/i,
  /teste\s*(1|2|3|ao)|t[123]\b/i,
  /norma[\s-]padr[aã]o.*crase/i,
  /prep[oó]si[cç][aã]o\s+a\s+.*artigo\s+a/i,
];

const PT_CLITIC_SIGNALS: RegExp[] = [
  /coloca[cç][aã]o\s+pronominal/i,
  /pr[oó]clise|ênclise|enclise|mes[oó]clise/i,
  /\batrativo\b|\b[aá]tono\b/i,
  /pronome\s+obl[ií]quo/i,
  /trilho\s+cl[ií]tico|h[aá]\s+fator\s+de\s+pr[oó]clise/i,
  /norma[\s-]padr[aã]o.*coloca[cç][aã]o/i,
];

const PT_COMMA_SIGNALS: RegExp[] = [
  /pontua[cç][aã]o/i,
  /v[ií]rgula|virgula/i,
  /vocativo|aposto/i,
  /sujeito\s*[|/]\s*verbo|trilho livre/i,
  /o que (a )?v[ií]rgula isola/i,
  /norma[\s-]padr[aã]o.*pontua/i,
  /frase correta.*pontua/i,
];

const PT_TERMOS_SIGNALS: RegExp[] = [
  /termos da ora[cç][aã]o/i,
  /adjunto adverbial|adjunto adnominal/i,
  /complemento nominal/i,
  /locu[cç][aã]o adverbial/i,
  /classificam-se, respectivamente/i,
  /modifica verbo|modifica nome|de qu[eê]\?/i,
  /circunst[aâ]ncia|funcao sint[aá]tica/i,
];

const PT_CONCORDANCIA_SIGNALS: RegExp[] = [
  /concord[aâ]ncia verbal|concord[aâ]ncia nominal/i,
  /n[uú]cleo do sujeito|n[uú]cleo concordante/i,
  /sujeito composto|sujeito partitivo|um dos que/i,
  /haver existencial|impessoal|ideol[oó]gica/i,
  /norma[\s-]padr[aã]o.*concord/i,
  /pergunta[\s-]teste.*n[uú]cleo/i,
];

function branchMapKey(subtopico: string): string | undefined {
  const key = normalizeKey(subtopico);
  const matches = Object.keys(BRANCH_DESIGN_MAP).filter(
    (k) => key === k || key.includes(k) || k.includes(key),
  );
  if (matches.length === 0) return undefined;
  return matches.sort((a, b) => b.length - a.length)[0];
}

/** true quando o subtópico tem ramos L2.5 em BRANCH_DESIGN_MAP (elegível a backfill). */
export function hasSubtopicBranchDesign(subtopico: string | undefined): boolean {
  if (!subtopico?.trim()) return false;
  return branchMapKey(subtopico) !== undefined;
}

function inferAdolescentBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  // Anorexia/bulimia com IMC no enunciado → saúde mental (não antropometria/escore Z)
  if (
    countPatternMatches(corpus, ADOLESCENT_MENTAL) > 0 &&
    /anorexia|bulimia|transtorno alimentar|imagem corporal|autoles[aã]o|suic[ií]dio/i.test(corpus)
  ) {
    return 'adolescente_saude_mental';
  }
  if (familyId === 'calc' || countPatternMatches(corpus, NUTRITION_ANTHROPOMETRY) > 0) {
    return 'adolescente_antropometria';
  }
  if (countPatternMatches(corpus, ADOLESCENT_VIOLENCE) > 0) {
    return 'adolescente_violencia_protecao';
  }
  if (countPatternMatches(corpus, ADOLESCENT_ETHICS) > 0) {
    return 'adolescente_etica_sigilo';
  }
  if (countPatternMatches(corpus, ADOLESCENT_DEVELOPMENT) > 0) {
    return 'adolescente_desenvolvimento';
  }
  if (countPatternMatches(corpus, ADOLESCENT_MENTAL) > 0) {
    return 'adolescente_saude_mental';
  }
  return 'adolescente_generico';
}

function inferCmeBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  if (familyId === 'certo_errado' || familyId === 'vf' || countPatternMatches(corpus, CME_VF_CE) > 0) {
    return 'cme_vf_ce';
  }
  if (countPatternMatches(corpus, CME_AUTOCLAVE) > 0) {
    return 'cme_autoclave_metodos';
  }
  if (countPatternMatches(corpus, CME_PREPARO) > 0) {
    return 'cme_preparo_limpeza';
  }
  if (countPatternMatches(corpus, CME_PROCESSAMENTO) > 0) {
    return 'cme_processamento_conceito';
  }
  return 'cme_generico';
}

function inferMentalBranch(corpus: string): PedagogicalBranchId {
  if (countPatternMatches(corpus, MENTAL_RAPS) > 0) {
    return 'mental_raps_legis';
  }
  if (countPatternMatches(corpus, MENTAL_DEPENDENCIA) > 0) {
    return 'mental_dependencia_tabagismo';
  }
  if (countPatternMatches(corpus, MENTAL_DEPRESSAO) > 0) {
    return 'mental_depressao';
  }
  if (countPatternMatches(corpus, MENTAL_CRISE) > 0) {
    return 'mental_crise_caps';
  }
  if (countPatternMatches(corpus, MENTAL_APS) > 0) {
    return 'mental_aps_acolhimento';
  }
  return 'mental_generico';
}

function inferSaeBranch(
  corpus: string,
  familyId?: FamilyId,
  instruction?: string,
): PedagogicalBranchId {
  const instr = (instruction ?? corpus).toLowerCase();
  const isExceto =
    /\b(exceto|incorret[oa])\b/i.test(instr) ||
    (familyId === 'certo_errado' && /\b(exceto|incorret[oa])\b/i.test(instr));
  if (isExceto) return 'sae_exceto';

  if (countPatternMatches(corpus, SAE_DOCUMENTACAO) > 0) {
    return 'sae_documentacao';
  }
  if (countPatternMatches(corpus, SAE_ETAPAS) > 0) {
    return 'sae_etapas';
  }
  return 'sae_generico';
}

function inferSondaBranch(corpus: string): PedagogicalBranchId {
  if (countPatternMatches(corpus, SONDA_MEDICAO) > 0 && countPatternMatches(corpus, SONDA_INSTALACAO) === 0) {
    return 'sonda_medicao_nex';
  }
  if (countPatternMatches(corpus, SONDA_INSTALACAO) > 0 || countPatternMatches(corpus, SONDA_MEDICAO) > 0) {
    return 'sonda_instalacao_protocolo';
  }
  return 'sonda_generico';
}

function inferFarmacoBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  const isVf =
    familyId === 'vf' ||
    (countPatternMatches(corpus, FARMACO_VF) >= 2 &&
      /\b(i|ii|iii)\s*[-–—]/i.test(corpus));
  if (isVf) return 'farmaco_pk_pd_vf';

  const isExceto =
    countPatternMatches(corpus, FARMACO_EXCETO) >= 1 ||
    (familyId === 'certo_errado' && /\b(incorret[oa]|exceto)\b/i.test(corpus));
  if (isExceto) return 'farmaco_generico';

  const isClinical =
    familyId === 'protocolo' || countPatternMatches(corpus, FARMACO_CLINICO) > 0;
  if (isClinical) return 'farmaco_clinico_protocolo';

  return 'farmaco_generico';
}

function inferImunizacaoBranch(
  corpus: string,
  familyId?: FamilyId,
  instruction?: string,
): PedagogicalBranchId {
  const anchor = instruction?.trim() || corpus.slice(0, 800);

  // Campanhas normativas APS no bucket Imunização (prova) — não calendário PNI
  if (
    /diabetes\s+mellitus|detec[cç][aã]o de casos suspeitos de diabetes|portaria\s*(n[ºo°]\s*)?2\.?048/i.test(
      anchor,
    ) &&
    !/\bvacina\b|\bimunobiol[oó]g|\besquema\s+vacinal/i.test(anchor)
  ) {
    return 'imunizacao_generico';
  }

  const isExceto =
    countPatternMatches(corpus, IMUNIZACAO_EXCETO) >= 1 ||
    (familyId === 'certo_errado' && /\b(exceto|incorret[oa])\b/i.test(corpus));
  if (isExceto) return 'imunizacao_exceto';

  const cadeiaScore = countPatternMatches(corpus, IMUNIZACAO_CADEIA_FRIO);
  if (cadeiaScore >= 2 || /cadeia de frio|rede de frio/i.test(corpus)) {
    return 'imunizacao_cadeia_frio';
  }

  const isVf =
    familyId === 'vf' ||
    (/\b(i|ii|iii)\s*[-–—]/i.test(corpus) && countPatternMatches(corpus, IMUNIZACAO_VF) >= 1);
  if (isVf) return 'imunizacao_vf_intervalos';

  if (cadeiaScore > 0) {
    return 'imunizacao_cadeia_frio';
  }

  if (countPatternMatches(corpus, IMUNIZACAO_CALENDARIO) > 0) {
    return 'imunizacao_calendario';
  }

  return 'imunizacao_generico';
}

function inferViaBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  const isExceto =
    countPatternMatches(corpus, VIA_EXCETO) >= 1 ||
    (familyId === 'certo_errado' && /\b(exceto|incorret[oa])\b/i.test(corpus));
  if (isExceto) return 'via_generico';

  const tecnicaScore = countPatternMatches(corpus, VIA_TECNICA);
  if (tecnicaScore >= 2) return 'via_tecnica_admin';

  const hasIii = /\b(i|ii|iii)\s*[-–—]/i.test(corpus);

  if (familyId === 'vf' && hasIii) {
    const isImPrimaryTopic =
      /\bvia\s+intramuscular\b|\bpela\s+via\s+im\b|\binje[cç][aã]o\s+intramuscular\b/i.test(corpus);
    const isScPrimaryTopic =
      /administra[cç][aã]o\s+de\s+medicamentos\s+por\s+via\s+subcut[aâ]nea/i.test(corpus) ||
      /\bpor\s+via\s+subcut[aâ]nea\b.*\banalise\b/i.test(corpus);
    if (isImPrimaryTopic && tecnicaScore >= 1) return 'via_tecnica_admin';
    if (isScPrimaryTopic) return 'via_vf_absorcao';
  }

  const isVf =
    (familyId === 'vf' && hasIii) ||
    (hasIii && countPatternMatches(corpus, VIA_VF) >= 1);
  if (isVf) return 'via_vf_absorcao';

  if (hasIii && tecnicaScore >= 1) return 'via_tecnica_admin';

  if (
    countPatternMatches(corpus, [/absor[cç][aã]o|biodisponibilidade/i]) > 0 &&
    countPatternMatches(corpus, [/via\b|oral|intestinal|parenteral|sublingual|retal|est[oô]mago/i]) > 0
  ) {
    return 'via_vf_absorcao';
  }

  if (tecnicaScore > 0) return 'via_tecnica_admin';

  return 'via_generico';
}

function hasPuncaoExcetoCommand(text: string): boolean {
  return (
    /\bexceto\b/i.test(text) ||
    /incorret[oa]\s+afirmar|assinale a alternativa incorreta|senten[cç]a incorreta|identifique a.*incorreta|afirmativa incorreta|alternativa incorreta/i.test(
      text,
    ) ||
    /n[aã]o\s+representa\s+(um\s+)?dos/i.test(text)
  );
}

function inferPuncaoBranch(
  corpus: string,
  familyId?: FamilyId,
  instruction?: string,
): PedagogicalBranchId {
  const commandText = instruction?.trim() ? instruction : corpus;

  if (hasPuncaoExcetoCommand(commandText)) {
    return 'puncao_exceto';
  }

  // Onda 2: comando ancora tempo/IPCS/periférica antes de flebite incidental nas alternativas.
  const ipcsInCommand = countPatternMatches(commandText, PUNCAO_IPCS);
  if (ipcsInCommand >= 1) return 'puncao_ipcs_cvc';

  const tempoInCommand = countPatternMatches(commandText, PUNCAO_TEMPO);
  if (tempoInCommand >= 1) return 'puncao_tempo';

  const perifericaInCommand = countPatternMatches(commandText, PUNCAO_PERIFERICA);
  if (perifericaInCommand >= 1) return 'puncao_periferica_antissepsia';

  const deviceInCommand = countPatternMatches(commandText, PUNCAO_DISPOSITIVO);
  if (deviceInCommand >= 1) return 'puncao_dispositivo';

  const ipcsScore = countPatternMatches(corpus, PUNCAO_IPCS);
  if (ipcsScore >= 2) return 'puncao_ipcs_cvc';

  const flebiteScore = countPatternMatches(corpus, PUNCAO_FLEBITE);
  if (flebiteScore >= 1) return 'puncao_flebite';

  const deviceScore = countPatternMatches(corpus, PUNCAO_DISPOSITIVO);
  if (deviceScore >= 1) return 'puncao_dispositivo';

  const tempoScore = countPatternMatches(corpus, PUNCAO_TEMPO);
  if (tempoScore >= 1) return 'puncao_tempo';

  const perifericaScore = countPatternMatches(corpus, PUNCAO_PERIFERICA);
  if (perifericaScore >= 1) return 'puncao_periferica_antissepsia';

  return 'puncao_generico';
}

function hasCamExcetoCommand(text: string): boolean {
  return (
    /\bexceto\b/i.test(text) ||
    /incorret[oa]\s+afirmar|assinale a alternativa incorreta|senten[cç]a incorreta|identifique a.*incorreta|afirmativa incorreta|alternativa incorreta/i.test(
      text,
    ) ||
    /n[aã]o\s+representa\s+(um\s+)?dos/i.test(text) ||
    /n[aã]o condiz/i.test(text)
  );
}

function inferCamBranch(
  corpus: string,
  familyId?: FamilyId,
  instruction?: string,
): PedagogicalBranchId {
  const commandText = instruction?.trim() ? instruction : corpus;
  const hasIii = /\b(i|ii|iii)\s*[-–—]/i.test(corpus);
  const certosScore = countPatternMatches(corpus, CAM_CERTOS_VF);
  const altoRiscoScore = countPatternMatches(corpus, CAM_ALTO_RISCO);
  const excetoScore = countPatternMatches(corpus, CAM_EXCETO);
  const documentacaoScore = countPatternMatches(corpus, CAM_DOCUMENTACAO);
  const isVf =
    familyId === 'vf' ||
    familyId === 'certo_errado' ||
    /\bcorreto o que se afirma\b|\bé correto\b/i.test(corpus);

  // Comando EXCETO/INCORRETA no enunciado vence certos e alto risco no corpus (g04 cluster).
  if (hasCamExcetoCommand(commandText)) {
    return 'cam_exceto_conduta';
  }

  if ((isVf || hasIii) && hasIii && documentacaoScore >= 1 && certosScore < 2) {
    return 'cam_documentacao';
  }

  if ((isVf || hasIii) && hasIii && certosScore >= 1) {
    return 'cam_certos_vf_caso';
  }

  // Listagem/completar 9 certos (pegadinha no 6º–9º certo) — cluster documentação g06.
  if (
    certosScore >= 2 &&
    /9\s+certos|nove certos/i.test(commandText) &&
    /s[aã]o\s*eles:|sendo eles:|consiste em:/i.test(commandText)
  ) {
    return 'cam_documentacao';
  }

  // EXCETO listagem MCQ — qual item NÃO é um dos 9 Certos (default cluster g08).
  if (
    certosScore >= 2 &&
    /n[aã]o\s+constitui|qual\s+das.*n[aã]o\s+constitui/i.test(commandText)
  ) {
    return 'cam_generico';
  }

  if (certosScore >= 2) return 'cam_certos_vf_caso';

  if (
    altoRiscoScore >= 2 ||
    (altoRiscoScore >= 1 &&
      /insulina|nph|heparina|confer[eê]ncia dupla|alto risco|quimioter[aá]pico/i.test(corpus))
  ) {
    return 'cam_alto_risco';
  }

  if (excetoScore >= 1) {
    return 'cam_exceto_conduta';
  }

  // Preparo/conceito — reconstituição; prontuário em distrator não vira cluster documentação.
  if (
    /reconstitui[cç][aã]o|entende-se por\b/i.test(commandText) &&
    /pó|l[ií]quido|diluente|forma original|liofiliz/i.test(corpus)
  ) {
    return 'cam_generico';
  }

  // 10 certos (banca) + vigilância pós-administração — playbook cam_generico.
  if (
    /10 certos|dez certos/i.test(corpus) ||
    (/vigil[aâ]ncia|efeitos?\s+colaterais|rea[cç][oõ]es?\s+adversas?/i.test(commandText) &&
      certosScore >= 1)
  ) {
    return 'cam_generico';
  }

  if (documentacaoScore >= 1) {
    return 'cam_documentacao';
  }

  return 'cam_generico';
}

function inferCalcBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  if (familyId === 'calc' || countPatternMatches(corpus, CALC_DOSE) > 0) {
    return 'calc_dose_equivalencia';
  }
  if (familyId === 'conceito' || /conceito|defini[cç][aã]o/i.test(corpus)) {
    return 'calc_conceito';
  }
  return 'calc_generico';
}

function inferBacterianasBranch(corpus: string): PedagogicalBranchId {
  if (countPatternMatches(corpus, BACTERIANAS_ETIOLOGIA) > 0) {
    return 'bacterianas_agente_etiologico';
  }
  if (countPatternMatches(corpus, BACTERIANAS_TB) > 0) {
    return 'bacterianas_tuberculose';
  }
  return 'bacterianas_generico';
}

function inferBiossegBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  const isExceto =
    /\bexceto\b/i.test(corpus) ||
    /n[aã]o condiz/i.test(corpus) ||
    familyId === 'certo_errado';
  if (isExceto && countPatternMatches(corpus, BIOSSEG_ITU_CATETER) >= 2) {
    return 'biosseg_iras_itu_cateter';
  }
  if (countPatternMatches(corpus, BIOSSEG_ITU_CATETER) >= 3) {
    return 'biosseg_iras_itu_cateter';
  }
  return 'biosseg_generico';
}

function inferSegurancaPacienteBranch(corpus: string, _familyId?: FamilyId): PedagogicalBranchId {
  if (countPatternMatches(corpus, SP_IDENTIFICACAO) > 0) {
    return 'sp_identificacao';
  }
  if (countPatternMatches(corpus, SP_QUEDAS) > 0) {
    return 'sp_prevencao_quedas';
  }
  if (countPatternMatches(corpus, SP_EVENTOS) > 0) {
    return 'sp_eventos_adversos';
  }
  if (countPatternMatches(corpus, SP_METAS) > 0) {
    return 'sp_metas_internacionais';
  }
  return 'sp_generico';
}

function inferPerioperatorioBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  if (countPatternMatches(corpus, PERI_ISC) > 0) {
    return 'perioperatorio_isc';
  }

  if (/\bsrpa\b/i.test(corpus) && countPatternMatches(corpus, PERI_SRPA_CPD) > 0) {
    return 'perioperatorio_pos_operatorio';
  }

  if (
    familyId === 'vf' ||
    (familyId === 'certo_errado' && !/\bsrpa\b/i.test(corpus)) ||
    (/julgue o item/i.test(corpus) && familyId === 'certo_errado')
  ) {
    return 'perioperatorio_vf';
  }

  if (familyId === 'protocolo' || countPatternMatches(corpus, PERI_PROTOCOLO) > 0) {
    return 'perioperatorio_protocolo';
  }

  if (countPatternMatches(corpus, PERI_PRE) > 0) {
    return 'perioperatorio_pre_operatorio';
  }

  if (countPatternMatches(corpus, PERI_POS) > 0) {
    return 'perioperatorio_pos_operatorio';
  }

  return 'perioperatorio_generico';
}

function inferRespiratorioBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  const isVf =
    familyId === 'vf' ||
    (/\b(i|ii|iii)\s*[-–—]/i.test(corpus) && countPatternMatches(corpus, RESP_VF) >= 1);
  if (isVf) return 'respiratorio_vf_asma_dpoc';

  const isCrise =
    /\bexceto\b/i.test(corpus) ||
    (familyId === 'certo_errado' && countPatternMatches(corpus, RESP_CRISE) >= 1) ||
    countPatternMatches(corpus, RESP_CRISE) >= 2 ||
    (/crian[cç]as? com asma|asma.*crian[cç]a/i.test(corpus) &&
      countPatternMatches(corpus, RESP_CRISE) >= 1);
  if (isCrise) return 'respiratorio_asma_crise';

  const isApsAsmaGenerico =
    /aten[cç][aã]o b[aá]sica|ubs\b|esf\b/i.test(corpus) &&
    /\basma\b/i.test(corpus) &&
    !/espacador|espaçador|peak flow|mdi\b|pico de fluxo/i.test(corpus);
  if (isApsAsmaGenerico) return 'respiratorio_generico';

  if (countPatternMatches(corpus, RESP_TECNICA) > 0) {
    return 'respiratorio_tecnica_inalador';
  }

  const isDpoc = familyId === 'protocolo' || countPatternMatches(corpus, RESP_DPOC) > 0;
  if (isDpoc) return 'respiratorio_dpoc_oxigenio';

  return 'respiratorio_generico';
}

const CURATIVOS_ESTOMIA: RegExp[] = [
  /estom[ií]a|colostomia|ileostomia|urostomia|periestomal|bolsa\s+coletora/i,
];
const CURATIVOS_DRENO: RegExp[] = [
  /dreno\s+de\s+penrose|\bpenrose\b|dreno\s+ativo|dreno\s+passivo/i,
];
const CURATIVOS_BANDAGEM: RegExp[] = [
  /bandagem|gesso\b|imobiliza[cç][aã]o|tra[cç][aã]o\s+esquel[eé]tica|tipoia/i,
];
const CURATIVOS_TERMOTERAPIA: RegExp[] = [
  /termoterapia|calor\s+[úu]mido|compressa\s+fria|crioterapia|hipertermia/i,
];
const CURATIVOS_LPP: RegExp[] = [
  /les[aã]o\s+por\s+press[aã]o|\blpp\b|úlcera\s+de\s+press[aã]o|escala\s+de\s+braden|\bbraden\b/i,
  /est[aá]gio\s+(i|ii|iii|iv)\b|eritema\s+n[aã]o\s+branque[aá]vel/i,
];
const CURATIVOS_FO: RegExp[] = [
  /ferida\s+operat[oó]ria|p[oó]s[\s-]?operat[oó]rio|\bpontos\b|retirada\s+de\s+pontos|deisc[eê]ncia/i,
  /sutura|incis[aã]o\s+cir[uú]rgica|ferida\s+cir[uú]rgica/i,
];
const CURATIVOS_DESBRIDAMENTO: RegExp[] = [
  /desbridamento|autol[ií]tico|enzim[aá]tico|mec[aâ]nico|esfacelo|necrose/i,
];
const CURATIVOS_COBERTURA: RegExp[] = [
  /alginato|hidrogel|hidrocol[oó]ide|espuma\s+de\s+poliuretano|semi[\s-]?oclusiv/i,
  /exsudato|tipos?\s+de\s+cobertura|sele[cç][aã]o\s+do\s+curativo|meio\s+[úu]mido/i,
];
const CURATIVOS_ASSEPSIA: RegExp[] = [
  /assepsia|antissepsia|sequ[eê]ncia\s+do\s+curativo|t[eé]cnica\s+ass[eé]ptica|soro\s+fisiol[oó]gico/i,
];

function isCurativosExcetoCommand(instruction: string, familyId?: FamilyId): boolean {
  if (/\bexceto\b|alternativa\s+incorreta|incorret[oa]\s+sobre|assinale.*incorreta/i.test(instruction)) {
    return true;
  }
  return familyId === 'certo_errado' && /incorret/i.test(instruction);
}

function inferCurativosBranch(corpus: string, familyId?: FamilyId, instruction?: string): PedagogicalBranchId {
  if (instruction && isCurativosExcetoCommand(instruction, familyId)) {
    return 'curativos_exceto_incorreta';
  }
  if (countPatternMatches(corpus, CURATIVOS_ESTOMIA) > 0) {
    return 'curativos_estomia';
  }
  if (countPatternMatches(corpus, CURATIVOS_DRENO) > 0) {
    return 'curativos_dreno';
  }
  if (countPatternMatches(corpus, CURATIVOS_BANDAGEM) > 0) {
    return 'curativos_bandagem_imobilizacao';
  }
  if (countPatternMatches(corpus, CURATIVOS_TERMOTERAPIA) > 0) {
    return 'curativos_termoterapia';
  }
  if (countPatternMatches(corpus, CURATIVOS_LPP) > 0) {
    return 'curativos_lpp';
  }
  if (countPatternMatches(corpus, CURATIVOS_FO) > 0) {
    return 'curativos_ferida_cirurgica';
  }
  if (countPatternMatches(corpus, CURATIVOS_DESBRIDAMENTO) > 0) {
    return 'curativos_desbridamento';
  }
  if (countPatternMatches(corpus, CURATIVOS_COBERTURA) > 0) {
    return 'curativos_cobertura_selecao';
  }
  if (countPatternMatches(corpus, CURATIVOS_ASSEPSIA) > 0) {
    return 'curativos_tecnica_assepsia';
  }
  return 'curativos_generico';
}

const FERIDAS_SCQ: RegExp[] = [
  /regra\s+dos\s*9|wallace|pulaski/i,
  /superf[ií]cie\s+corporal\s+queimada|\bscq\b/i,
  /percentual\s+correspondente|estimativa\s+da\s+extens[aã]o/i,
];
const FERIDAS_GRAU: RegExp[] = [
  /grau\b|profundidade|escara|espessura\s+total/i,
  /terceiro\s+grau|segundo\s+grau|primeiro\s+grau/i,
  /bolhas?\b/i,
];
const FERIDAS_ATENDIMENTO: RegExp[] = [
  /resfriamento|[áa]gua\s+corrente|\bgelo\b/i,
  /bolha\s+[ií]ntegra|primeiros\s+socorros|atendimento\s+inicial/i,
  /orienta[cç][aã]o\s+correta/i,
];
const FERIDAS_CLASSIFICACAO: RegExp[] = [
  /ferida\s+(limpa|contaminada|infectada)/i,
  /contaminad|6\s+horas|micro.?organismo|ass[eé]ptic/i,
];
const FERIDAS_CICATRIZACAO: RegExp[] = [
  /cicatriza[cç][aã]o|inflamat[oó]ria|proliferativa|matura[cç][aã]o/i,
  /granula[cç][aã]o|exsudativa/i,
];
const FERIDAS_CURATIVO: RegExp[] = [
  /alginato|hidrogel|hidrocol[oó]ide|bioativ|oclusiv/i,
  /tipos?\s+de\s+curativ/i,
];
const FERIDAS_GRANDE: RegExp[] = [
  /grande\s+queimad|>\s*26\s*%/i,
  /crit[eé]rio.*gravidade|encaminhamento.*refer[eê]ncia/i,
];

const TRABALHO_PEP: RegExp[] = [
  /perfurocortante|material\s+biol[oó]gico|pep\b|p[oó]s[\s-]?exposi[cç][aã]o|profilaxia\s+p[oó]s/i,
  /acidente\s+(?:de\s+)?trabalho|exposi[cç][aã]o\s+ocupacional|notificar.*acidente/i,
  /descarte\s+de\s+agulhas|reencapar|coletor\s+r[ií]gid/i,
  /anvisa.{0,40}preven[cç][aã]o.{0,30}acidente/i,
];

const TRABALHO_NR15: RegExp[] = [
  /nr[\s-]?15|ibutg|calor\s+excessivo|exposi[cç][aã]o\s+di[aá]ria\s+permiss[ií]vel/i,
  /ru[ií]do\s+occupacional|perda\s+auditiva|n[ií]vel\s+de\s+ru[ií]do|nr[\s-]?9\b/i,
  /radia[cç][aã]o\s+(?:n[aã]o\s+)?ionizante|radia[cç][aã]o\s+ionizante|exposi[cç][aã]o\s+radiol[oó]gica/i,
  /agentes?\s+f[ií]sicos?|temperatura\s+extrema|ilumina[cç][aã]o\s+pobre/i,
];

const TRABALHO_ERGONOMIA_PATTERNS: RegExp[] = [
  /ergonomia|ler\b|dort|esfor[cç]o\s+repetitivo|postura\s+est[aá]tica/i,
  /levantamento\s+manual|membro\s+superior|mobili[aá]rio\s+ergon[oô]mic/i,
  /burnout|esgotamento\s+profissional|sobrecarga\s+de\s+trabalho/i,
];

const TRABALHO_VF_NR32: RegExp[] = [
  /nr[\s-]?32|risco\s+biol[oó]gico|anexo\s+(?:i|ii|iii|iv|v)/i,
  /pcmso|aso\b|atestado\s+de\s+sa[uú]de\s+ocupacional|mapa\s+de\s+riscos/i,
  /hierarquia\s+de\s+controles|epi\b|vacina\s+hepatite/i,
];

function isTrabalhoExcetoCommand(instruction: string, familyId?: FamilyId): boolean {
  if (/\bexceto\b|alternativa\s+incorreta|incorret[oa]\s+sobre|assinale.*incorreta/i.test(instruction)) {
    return true;
  }
  if (familyId === 'certo_errado' && /\bincorreta\b/i.test(instruction)) return true;
  return false;
}

function inferTrabalhoBranch(
  corpus: string,
  familyId?: FamilyId,
  instruction?: string,
): PedagogicalBranchId {
  const instr = instruction?.trim() ?? '';

  if (isTrabalhoExcetoCommand(instr, familyId) && countPatternMatches(corpus, TRABALHO_PEP) > 0) {
    return 'trabalho_pep_trap';
  }
  if (countPatternMatches(corpus, TRABALHO_PEP) >= 2) {
    return 'trabalho_pep_trap';
  }
  if (countPatternMatches(corpus, TRABALHO_NR15) > 0) {
    return 'trabalho_nr15_reference';
  }
  if (countPatternMatches(corpus, TRABALHO_ERGONOMIA_PATTERNS) > 0) {
    return 'trabalho_ergonomia';
  }
  if (
    familyId === 'vf' ||
    (familyId === 'certo_errado' && countPatternMatches(corpus, TRABALHO_VF_NR32) > 0)
  ) {
    return 'trabalho_vf_nr32';
  }
  if (countPatternMatches(corpus, TRABALHO_VF_NR32) > 0) {
    return 'trabalho_vf_nr32';
  }
  return 'trabalho_generico';
}

function inferFeridasBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  if (familyId === 'calc' && countPatternMatches(corpus, FERIDAS_SCQ) > 0) {
    return 'feridas_scq_calculo';
  }
  if (familyId === 'protocolo' && countPatternMatches(corpus, FERIDAS_ATENDIMENTO) > 0) {
    return 'feridas_atendimento_inicial';
  }
  if (countPatternMatches(corpus, FERIDAS_GRANDE) > 0) {
    return 'feridas_grande_queimado';
  }
  if (familyId === 'text_fragment' && countPatternMatches(corpus, FERIDAS_CICATRIZACAO) > 0) {
    return 'feridas_cicatrizacao';
  }
  if (countPatternMatches(corpus, FERIDAS_GRAU) > 0 && countPatternMatches(corpus, FERIDAS_SCQ) === 0) {
    return 'feridas_grau_profundidade';
  }
  if (countPatternMatches(corpus, FERIDAS_SCQ) > 0) {
    return 'feridas_scq_regra9';
  }
  if (countPatternMatches(corpus, FERIDAS_CLASSIFICACAO) > 0) {
    return 'feridas_classificacao';
  }
  if (countPatternMatches(corpus, FERIDAS_CICATRIZACAO) > 0) {
    return 'feridas_cicatrizacao';
  }
  if (countPatternMatches(corpus, FERIDAS_CURATIVO) > 0) {
    return 'feridas_curativo_tipo';
  }
  return 'feridas_generico';
}

const URGENCIAS_EXCETO_COMMAND_RE =
  /\bexceto\b|alternativa\s+incorreta|incorret[oa]\s+afirmar|[ée]\s+incorret[oa]|n[aã]o\s+corresponde\s+(a\s+)?(verdade|realidade)/i;

function isUrgenciasExcetoCondutaCommand(instruction: string, familyId?: FamilyId): boolean {
  if (URGENCIAS_EXCETO_COMMAND_RE.test(instruction)) return true;
  if (familyId === 'certo_errado' && /\bincorreta\b/i.test(instruction)) return true;
  return false;
}

function inferUrgenciasBranch(
  corpus: string,
  familyId?: FamilyId,
  instruction?: string,
): PedagogicalBranchId {
  const instr = instruction?.trim() ?? '';
  if (
    isUrgenciasExcetoCondutaCommand(instr, familyId) ||
    isUrgenciasExcetoCondutaCommand(corpus, familyId)
  ) {
    return 'urgencias_exceto_conduta';
  }

  if (countPatternMatches(corpus, URGENCIAS_MANCHESTER) > 0) {
    return 'urgencias_manchester_triagem';
  }

  // V/F combinatório I–V com family vf — antes de choque/convulsão/trauma no corpus dos slides.
  if (familyId === 'vf' && /\b(i|ii|iii|iv|v)\s*[-–—]/i.test(instr)) {
    return 'urgencias_vf_protocolo';
  }

  const anafilaxiaHits = countPatternMatches(corpus, URGENCIAS_ANAFILAXIA);
  const rcpHits = countPatternMatches(corpus, URGENCIAS_RCP);
  const pedMatch = /pedi[aá]tr|lactente|crian[cç]a|beb[eê]/i.test(corpus);

  // Anafilaxia explícita com RCP só como reserva (PCR incidental) — antes do guard pediátrico.
  if (
    anafilaxiaHits > 0 &&
    /\banafilaxia\b/i.test(instr) &&
    rcpHits <= 1 &&
    !/\b15:2\b|compress[oõ]es tor[aá]c|ressuscita[cç][aã]o cardiopulmonar/i.test(instr) &&
    !/\basser[cç][oõ]es\b/i.test(instr)
  ) {
    return 'urgencias_anafilaxia';
  }

  // Pediatria + RCP antes de AVC/engasgo — evita falso positivo de \biam\b e OVACE com PCR.
  if (pedMatch && rcpHits >= 1) {
    return 'urgencias_rcp_pediatrico';
  }

  if (countPatternMatches(corpus, URGENCIAS_AVC) > 0) {
    return 'urgencias_avc_iam';
  }

  // V/F combinatory com RCP — antes de trauma incidental (queimadura/hemorragia como itens do enunciado).
  if (
    familyId === 'vf' &&
    rcpHits >= 1 &&
    /\bsequ[eê]ncia\s+correta|verdadeiro\s*\(v\)\s+ou\s+falso/i.test(instr)
  ) {
    if (pedMatch) return 'urgencias_rcp_pediatrico';
    return 'urgencias_rcp_sbv';
  }

  // Trauma/XABCDE antes de engasgo — obstrução VAA no contexto ABCDE (lote trauma) não vira engasgo.
  // BT1/avaliação primária com trauma — um hit basta quando o comando ancora trauma explícito.
  if (
    /\bbt-?1\b|avalia[cç][aã]o prim[aá]ria\b[\s\S]{0,40}\btrauma/i.test(instr) &&
    countPatternMatches(corpus, URGENCIAS_TRAUMA) >= 1
  ) {
    return 'urgencias_xabcde_trauma';
  }

  // Trauma com fratura exposta ou par fratura+imobilização — um grupo de padrão basta (evita falso generico).
  if (
    countPatternMatches(corpus, URGENCIAS_TRAUMA) >= 2 ||
    /\bfratura exposta\b|\bfratura\b[\s\S]{0,80}\bimobiliza/i.test(corpus)
  ) {
    return 'urgencias_xabcde_trauma';
  }

  // SBV/PCR no comando — engasgo só contextual no enunciado; RCP domina o ramo.
  if (
    rcpHits >= 2 &&
    /\bparada card|pcr\b|compress[oõ]es|ressuscita[cç][aã]o cardiopulmonar/i.test(instr) &&
    countPatternMatches(corpus, URGENCIAS_ENGASGO) > 0 &&
    !/\bheimlich\b.*inconsciente|ovace.*inconsciente|engasgo.*prioridade/i.test(instr)
  ) {
    if (pedMatch) return 'urgencias_rcp_pediatrico';
    return 'urgencias_rcp_sbv';
  }

  if (countPatternMatches(corpus, URGENCIAS_ENGASGO) > 0) {
    return 'urgencias_engasgo';
  }

  if (countPatternMatches(corpus, URGENCIAS_ANAFILAXIA) > 0) {
    return 'urgencias_anafilaxia';
  }

  if (countPatternMatches(corpus, URGENCIAS_CHOQUE) > 0) {
    return 'urgencias_choque';
  }

  if (
    familyId === 'vf' ||
    (/\b(i|ii|iii)\s*[-–—]/i.test(corpus) && countPatternMatches(corpus, URGENCIAS_RCP) >= 1)
  ) {
    if (/pedi[aá]tr|lactente|15:2|beb[eê]/i.test(corpus)) {
      return 'urgencias_rcp_pediatrico';
    }
    if (countPatternMatches(corpus, URGENCIAS_RCP) >= 1) {
      return 'urgencias_rcp_sbv';
    }
    return 'urgencias_vf_protocolo';
  }

  if (countPatternMatches(corpus, URGENCIAS_RCP) >= 2) {
    return 'urgencias_rcp_sbv';
  }

  if (/convuls|epilep|crise convulsiva/i.test(corpus)) {
    return 'urgencias_convulsao';
  }

  if (/queimadura/i.test(corpus) && !countPatternMatches(corpus, URGENCIAS_TRAUMA)) {
    return 'urgencias_queimadura';
  }

  return 'urgencias_generico';
}

function inferHistoriaBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  const humanizacaoScore = countPatternMatches(corpus, HISTORIA_HUMANIZACAO);
  const eticaScore = countPatternMatches(corpus, HISTORIA_ETICA);
  const nightingaleScore = countPatternMatches(corpus, HISTORIA_NIGHTINGALE);

  if (/teorias administrativas|teoria administrativa/i.test(corpus)) {
    return 'historia_generico';
  }

  // Teorias em enfermagem no slug mas enunciado de humanização → humanização (não genérico)
  if (
    humanizacaoScore >= 2 ||
    (/humaniza/i.test(corpus) &&
      (familyId === 'vf' || /\b(i|ii|iii|iv)\s*[-–—]/i.test(corpus)))
  ) {
    return 'historia_humanizacao';
  }

  if (eticaScore >= 2) return 'historia_comunicacao_etica';
  if (eticaScore > 0 && nightingaleScore === 0 && humanizacaoScore === 0) {
    return 'historia_comunicacao_etica';
  }

  if (nightingaleScore > 0) return 'historia_nightingale';
  if (/lei\s*7\.?498|decreto\s*94\.?406/i.test(corpus) && familyId === 'legis') {
    return 'historia_nightingale';
  }

  if (humanizacaoScore > 0) return 'historia_humanizacao';
  if (eticaScore > 0) return 'historia_comunicacao_etica';

  return 'historia_generico';
}

function inferCraseBranch(corpus: string): PedagogicalBranchId {
  if (countPatternMatches(corpus, PT_CRASE_SIGNALS) >= 1) {
    return 'pt_crase';
  }
  return 'pt_crase_generico';
}

function inferCliticBranch(corpus: string): PedagogicalBranchId {
  if (countPatternMatches(corpus, PT_CLITIC_SIGNALS) >= 1) {
    return 'pt_pronomes_colocacao';
  }
  return 'pt_pronomes_colocacao_generico';
}

function inferCommaBranch(corpus: string): PedagogicalBranchId {
  if (countPatternMatches(corpus, PT_COMMA_SIGNALS) >= 1) {
    return 'pt_pontuacao';
  }
  return 'pt_pontuacao_generico';
}

function inferTermosBranch(corpus: string): PedagogicalBranchId {
  if (countPatternMatches(corpus, PT_TERMOS_SIGNALS) >= 1) {
    return 'pt_termos_oracao';
  }
  return 'pt_termos_oracao_generico';
}

function inferConcordanciaBranch(corpus: string): PedagogicalBranchId {
  if (countPatternMatches(corpus, PT_CONCORDANCIA_SIGNALS) >= 1) {
    return 'pt_concordancia';
  }
  return 'pt_concordancia_generico';
}

function inferCriancaBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  if (countPatternMatches(corpus, CRIANCA_TRIAGEM) > 0) {
    return 'crianca_triagem_neonatal';
  }
  if (countPatternMatches(corpus, CRIANCA_ALEITAMENTO) > 0) {
    return 'crianca_aleitamento_nutricao';
  }
  if (countPatternMatches(corpus, CRIANCA_DESIDRATACAO) > 0) {
    return 'crianca_desidratacao';
  }
  if (countPatternMatches(corpus, CRIANCA_NEONATOLOGIA) > 0) {
    return 'crianca_neonatologia';
  }
  if (countPatternMatches(corpus, CRIANCA_PUERICULTURA) > 0) {
    return 'crianca_aps_puericultura';
  }
  if (countPatternMatches(corpus, CRIANCA_DESENVOLVIMENTO) > 0) {
    return 'crianca_desenvolvimento';
  }
  if (
    familyId === 'vf' &&
    /\b(i|ii|iii)\s*[-–—]/i.test(corpus) &&
    /crian[cç]a|lactente|pediatr|infantil/i.test(corpus)
  ) {
    return 'crianca_aleitamento_nutricao';
  }
  return 'crianca_generico';
}

function inferMulherBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  if (countPatternMatches(corpus, MULHER_PARTO) > 0 && !/pré-natal|prenatal/i.test(corpus)) {
    return 'mulher_parto';
  }
  if (countPatternMatches(corpus, MULHER_PAPANICOLAU) > 0) {
    return 'mulher_papanicolau';
  }
  if (countPatternMatches(corpus, MULHER_MAMA) > 0) {
    return 'mulher_mama';
  }
  if (countPatternMatches(corpus, MULHER_PUERPERIO) > 0 && countPatternMatches(corpus, MULHER_PRENATAL) === 0) {
    return 'mulher_puerperio';
  }
  if (countPatternMatches(corpus, MULHER_PLANEJAMENTO) > 0 && countPatternMatches(corpus, MULHER_PRENATAL) === 0) {
    return 'mulher_planejamento';
  }
  if (countPatternMatches(corpus, MULHER_PRENATAL) > 0) {
    return 'mulher_prenatal';
  }
  if (
    familyId === 'vf' &&
    /\b(i|ii|iii)\s*[-–—]/i.test(corpus) &&
    /gesta|pré-natal|prenatal|mulher/i.test(corpus)
  ) {
    return 'mulher_prenatal';
  }
  return 'mulher_generico';
}

function inferBranchForBucket(
  mapKey: string,
  corpus: string,
  familyId?: FamilyId,
  instruction?: string,
): PedagogicalBranchId | undefined {
  if (mapKey.includes('adolescente')) {
    return inferAdolescentBranch(corpus, familyId);
  }
  if (mapKey.includes('cme') || mapKey.includes('material') || mapKey.includes('processamento')) {
    return inferCmeBranch(corpus, familyId);
  }
  if (mapKey.includes('mental') || mapKey === 'psiquiatria') {
    return inferMentalBranch(corpus);
  }
  if (mapKey.includes('processo de enfermagem') || mapKey === 'sae') {
    return inferSaeBranch(corpus, familyId, instruction);
  }
  if (mapKey.includes('sonda')) {
    return inferSondaBranch(corpus);
  }
  if (
    mapKey.includes('farmacodinamica') ||
    mapKey.includes('farmacocinetica') ||
    mapKey.includes('farmacologia')
  ) {
    return inferFarmacoBranch(corpus, familyId);
  }
  if (mapKey.includes('imunizacao') || mapKey.includes('vacinacao')) {
    return inferImunizacaoBranch(corpus, familyId, instruction);
  }
  if (mapKey.includes('vias de administracao')) {
    return inferViaBranch(corpus, familyId);
  }
  if (mapKey.includes('puncao venosa') || mapKey.includes('cateteres')) {
    return inferPuncaoBranch(corpus, familyId, instruction);
  }
  if (mapKey.includes('cuidados na administracao de medicamentos')) {
    return inferCamBranch(corpus, familyId, instruction);
  }
  if (
    mapKey.includes('calculo de administracao') ||
    mapKey.includes('calculos de enfermagem') ||
    mapKey === 'dosagens'
  ) {
    return inferCalcBranch(corpus, familyId);
  }
  if (
    mapKey.includes('respiratorias cronicas') ||
    mapKey === 'asma' ||
    mapKey === 'dpoc'
  ) {
    return inferRespiratorioBranch(corpus, familyId);
  }
  if (
    mapKey.includes('bacterianas') ||
    mapKey.includes('fungicas') ||
    mapKey === 'tuberculose'
  ) {
    return inferBacterianasBranch(corpus);
  }
  if (
    mapKey.includes('biosseguranca') ||
    mapKey.includes('infeccoes no contexto') ||
    mapKey === 'iras'
  ) {
    return inferBiossegBranch(corpus, familyId);
  }
  if (mapKey.includes('seguranca do paciente')) {
    return inferSegurancaPacienteBranch(corpus, familyId);
  }
  if (
    mapKey.includes('perioperator') ||
    mapKey.includes('srpa') ||
    mapKey.includes('assistencia perioperatoria')
  ) {
    return inferPerioperatorioBranch(corpus, familyId);
  }
  if (mapKey.includes('urgencias') || mapKey.includes('emergencias') || mapKey === 'emergencia') {
    return inferUrgenciasBranch(corpus, familyId, instruction);
  }
  if (
    mapKey.includes('historia da enfermagem') ||
    mapKey.includes('historia enfermagem') ||
    mapKey === 'historia'
  ) {
    return inferHistoriaBranch(corpus, familyId);
  }
  if (mapKey.includes('enfermagem do trabalho') || mapKey.includes('saude do trabalhador')) {
    return inferTrabalhoBranch(corpus, familyId, instruction);
  }
  if (
    mapKey.includes('curativos e manejo de feridas') ||
    mapKey.includes('curativos') ||
    mapKey.includes('manejo de feridas')
  ) {
    return inferCurativosBranch(corpus, familyId, instruction);
  }
  if (
    mapKey.includes('feridas e queimaduras') ||
    mapKey === 'feridas' ||
    mapKey === 'queimaduras'
  ) {
    return inferFeridasBranch(corpus, familyId);
  }
  if (
    mapKey.includes('saude da mulher') ||
    mapKey === 'obstetricia' ||
    mapKey === 'ginecologia'
  ) {
    return inferMulherBranch(corpus, familyId);
  }
  if (mapKey.includes('saude da crianca') || mapKey === 'pediatria') {
    return inferCriancaBranch(corpus, familyId);
  }
  if (
    mapKey.includes('crase') ||
    mapKey.includes('acento indicativo de crase') ||
    (mapKey.includes('lingua portuguesa') && countPatternMatches(corpus, PT_CRASE_SIGNALS) >= 1)
  ) {
    return inferCraseBranch(corpus);
  }
  if (
    mapKey.includes('pronomes') ||
    mapKey.includes('colocacao') ||
    (mapKey.includes('lingua portuguesa') && countPatternMatches(corpus, PT_CLITIC_SIGNALS) >= 1)
  ) {
    return inferCliticBranch(corpus);
  }
  if (
    mapKey.includes('pontuacao') ||
    (mapKey.includes('lingua portuguesa') && countPatternMatches(corpus, PT_COMMA_SIGNALS) >= 1)
  ) {
    return inferCommaBranch(corpus);
  }
  if (
    mapKey.includes('termos') ||
    (mapKey.includes('lingua portuguesa') && countPatternMatches(corpus, PT_TERMOS_SIGNALS) >= 1)
  ) {
    return inferTermosBranch(corpus);
  }
  if (
    mapKey.includes('concordancia') ||
    (mapKey.includes('lingua portuguesa') && countPatternMatches(corpus, PT_CONCORDANCIA_SIGNALS) >= 1)
  ) {
    return inferConcordanciaBranch(corpus);
  }
  return undefined;
}

/** Ramo explícito em meta ou inferido por enunciado + slides. */
export function inferPedagogicalBranch(
  subtopico: string | undefined,
  instruction: string,
  slides: MoldAffinitySlide[],
  familyId?: FamilyId,
): PedagogicalBranchId | undefined {
  const mapKey = subtopico ? branchMapKey(subtopico) : undefined;
  if (!mapKey) return undefined;

  const corpus = [instruction, ...slides.map((s) => collectSlideTextCorpus(s))].join(' ');
  return inferBranchForBucket(mapKey, corpus, familyId, instruction);
}

export function resolvePedagogicalBranch(
  subtopico: string | undefined,
  instruction: string,
  slides: MoldAffinitySlide[],
  explicitBranch?: string | null,
  familyId?: FamilyId,
): PedagogicalBranchId | undefined {
  if (explicitBranch?.trim()) {
    return explicitBranch.trim() as PedagogicalBranchId;
  }
  return inferPedagogicalBranch(subtopico, instruction, slides, familyId);
}

/** Design L3 efetivo: ramo vence mapa fixo do subtópico quando há entrada em BRANCH_DESIGN_MAP. */
export function getPresentationDesign(
  subtopico: string | undefined,
  branch?: PedagogicalBranchId,
): SubtopicDesign | undefined {
  if (!subtopico?.trim()) return undefined;

  const mapKey = branchMapKey(subtopico);
  if (mapKey && branch) {
    const branchDesign = BRANCH_DESIGN_MAP[mapKey]?.[branch];
    if (branchDesign) return branchDesign;
  }

  return getDesignBySubtopic(subtopico);
}

export function getLayoutVariantForBranch(
  subtopico: string | undefined,
  slideType: string,
  branch?: PedagogicalBranchId,
): string | undefined {
  const design = getPresentationDesign(subtopico, branch);
  if (!design) return undefined;
  switch (slideType) {
    case 'concept_map':
      return design.conceptMap;
    case 'golden_rule':
      return design.goldenRule;
    case 'logic_flow':
      return design.logicFlow;
    case 'danger_zone':
      return design.dangerZone;
    default:
      return undefined;
  }
}
