/**
 * Resolução de moldes premium (L3) por afinidade de conteúdo.
 *
 * Regra: molde bespoke do subtópico só aplica quando o texto do slide
 * combina com o ramo pedagógico — senão cai para família + rotação por slug.
 *
 * @see docs/MOLD_AFFINITY_RESOLVER.md
 */
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { ADOLESCENT_Z_SCORE_POSITIVE } from '@/lib/slides/adolescentAntropometriaSlideUtils';

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/** Variantes genéricas — não exigem afinidade temática. */
export const GENERIC_LAYOUT_VARIANTS = new Set<string>([
  'center',
  'compact',
  'minimal',
  'banner',
  'grid',
  'morphological',
  'molecular',
  'bridge',
  'stack',
  'cards',
  'list',
  'vertical',
  'horizontal',
  'compare',
  'reference_table',
]);

export function isBespokeLayoutVariant(variant: string | undefined): boolean {
  if (!variant) return false;
  return !GENERIC_LAYOUT_VARIANTS.has(variant);
}

export type MoldAffinitySlide = {
  type?: string;
  content?: string;
  footer_rule?: string;
  items?: unknown[];
  rows?: unknown[];
  steps?: unknown[];
  concepts?: unknown[];
};

export type MoldAffinityContext = {
  slideType?: string;
  familyId?: FamilyId;
  subtopico?: string;
  pedagogicalBranch?: string;
};

type MoldAffinityRule = {
  /** Fragmentos do subtópico canônico (normalizados) — molde “de casa”. */
  homeSubtopicFragments?: string[];
  /** Famílias que nunca usam este molde. */
  blockFamilies?: FamilyId[];
  /** Se bater, rejeita o molde (mesmo no subtópico de casa). */
  blockPatterns?: RegExp[];
  /** Termos que confirmam o ramo — obrigatórios para moldes adolescente e fora do subtópico de casa. */
  positivePatterns?: RegExp[];
  minPositive?: number;
};

/** Conteúdo antropométrico / escore Z — não usar moldes de sigilo adolescente. */
const NUTRITION_ANTHROPOMETRY_BLOCK: RegExp[] = [
  /escore\s*z|score\s*z|\bz\s*[<>≤≥]|desvio[\s-]?padr[aã]o/i,
  /\bimc\b|índice de massa|eutrofi|sobrepeso|obesidade|magreza/i,
  /antropometr|pondero[\s-]?estatur|caderneta do adolescente|curvas?\s*oms/i,
  /classifica[cç][aã]o nutricional|estatura muito baixa/i,
];

const ADOLESCENT_ETHICS_POSITIVE: RegExp[] = [
  /sigilo|confidencial|quebra de sigilo|quebrar sigilo/i,
  /escuta qualificada|privacidade|acolhimento|v[ií]nculo/i,
  /gravidez|gestante|gesta[cç][aã]o|pr[eé][\s-]?natal/i,
  /\bcaps\b|aten[cç][aã]o psicossocial/i,
  /contracep|orienta[cç][aã]o sexual|viol[eê]ncia sexual|abuso sexual/i,
  /autonomia|consentimento|respons[aá]vel legal/i,
  /espa[cç]o do adolescente/i,
];

/** Desenvolvimento puberal / fisiologia — não usar moldes de ética adolescente. */
const ADOLESCENT_DEVELOPMENT_BLOCK: RegExp[] = [
  /puberdade|puberal|metamorfose f[ií]sica|maturidade sexual/i,
  /horm[oô]nio|disfun[cç][aã]o hormonal|desenvolvimento das mamas|hipertrofia dos test[ií]culo/i,
  /menarca|espermarquia|estadiamento de tanner|\btanner\b/i,
  /atraso na puberdade|12 aos 13 anos|13-14 anos/i,
];

const ADOLESCENT_ETHICS_BLOCK: RegExp[] = [
  ...NUTRITION_ANTHROPOMETRY_BLOCK,
  ...ADOLESCENT_DEVELOPMENT_BLOCK,
];

/** IRAS / ITU / cateter vesical — ramo biosseg_iras_itu_cateter. */
const BIOSSEG_ITU_POSITIVE: RegExp[] = [
  /\bitu\b|infec[cç][aã]o do trato urin[aá]rio|iras\b|infec[cç][aã]o relacionada [àa] assist/i,
  /cateteriza[cç][aã]o vesical|sonda vesical|cateter vesical|drenagem urin[aá]ria/i,
  /sistema de drenagem fechado|meato|bolsa coletora|fluxo de urina/i,
  /pin[cç]ar|fechar.*cateter|higiene.*meato/i,
];

const BIOSSEG_GENERIC_VARIANTS = new Set([
  'biosseg-precaution-deck',
  'biosseg-reference-board',
  'biosseg-vf-juggle-tap',
  'biosseg-trap-chips',
]);

const BIOSSEG_ITU_VARIANTS = new Set([
  'itu-closed-system-rail',
  'itu-bundle-letter-board',
  'itu-exceto-tap',
  'itu-catheter-trap',
]);

const ADOLESCENT_VARIANTS = new Set([
  'adolescent-privacy-curtain',
  'adolescent-sigilo-spectrum',
  'adolescent-vf-weave-tap',
  'adolescent-consent-gate',
]);

const ADOLESCENT_ANTHROPOMETRY_VARIANTS = new Set([
  'adolescent-growth-z-rail',
  'adolescent-z-band-board',
  'adolescent-z-classify-tap',
  'adolescent-z-threshold-trap',
]);

const MENTAL_SAE_VARIANTS = new Set(['sae-decision-tap', 'norm-reveal']);
const MENTAL_RAPS_VARIANTS = new Set([
  'mental-raps-network-rail',
  'mental-raps-tier-board',
  'mental-raps-classify-tap',
  'mental-raps-trap-arena',
]);
const MENTAL_RAPS_BESPOKE_BRANCHES = new Set(['mental_raps_legis']);
const MENTAL_CRISIS_VARIANTS = new Set([
  'mental-crisis-signal-deck',
  'mental-crisis-ladder-board',
  'mental-crisis-decision-tap',
  'mental-crisis-coercion-trap',
]);
const MENTAL_CRISIS_BESPOKE_BRANCHES = new Set(['mental_crise_caps']);

const PERI_PREOP_VARIANTS = new Set([
  'peri-preop-phase-deck',
  'peri-preop-prep-board',
  'peri-preop-decision-tap',
  'peri-preop-trap-arena',
]);
const PERI_PREOP_BESPOKE_BRANCHES = new Set(['perioperatorio_pre_operatorio']);

const PERI_POS_VARIANTS = new Set([
  'peri-srpa-monitor-deck',
  'peri-aldrete-board',
  'peri-srpa-decision-tap',
  'peri-srpa-trap-arena',
]);
const PERI_POS_BESPOKE_BRANCHES = new Set(['perioperatorio_pos_operatorio']);

const PERI_PROTOCOL_VARIANTS = new Set([
  'peri-protocol-checklist-deck',
  'peri-protocol-reference-board',
  'peri-protocol-tap-flow',
  'peri-protocol-trap-arena',
]);
const PERI_PROTOCOL_BESPOKE_BRANCHES = new Set(['perioperatorio_protocolo']);

const PERI_VF_VARIANTS = new Set([
  'peri-vf-assertions-deck',
  'peri-vf-reference-board',
  'peri-vf-juggle-tap',
  'peri-vf-trap-chips',
]);
const PERI_VF_BESPOKE_BRANCHES = new Set(['perioperatorio_vf']);

const SONDA_BESPOKE_VARIANTS = new Set([
  'procedure-protocol',
  'sonda-measurement-board',
  'sonda-decision-tap',
  'trap-reveal',
]);

const FARMACO_VF_VARIANTS = new Set([
  'adme-journey-rail',
  'pk-pd-reference-board',
  'farmaco-vf-juggle-tap',
  'farmaco-trap',
]);

const FARMACO_CLINICO_VARIANTS = new Set([
  'infusao-ev-station-deck',
  'farmaco-clinico-reference-board',
  'farmaco-protocol-tap-flow',
  'farmaco-clinico-trap',
]);

const PNI_VF_VARIANTS = new Set([
  'pni-rules-deck',
  'pni-interval-matrix',
  'pni-vf-juggle-tap',
  'pni-trap-chips',
]);

const PNI_CALENDARIO_VARIANTS = new Set([
  'vaccine-timeline',
  'pni-calendar-board',
  'pni-calendar-elimination-tap',
  'calendar-mismatch',
]);

const PNI_CADEIA_FRIO_VARIANTS = new Set([
  'cold-chain-hub',
  'pni-temperature-rail',
  'pni-cold-chain-tap',
  'temperature-mismatch',
]);

const MULHER_PRENATAL_VARIANTS = new Set([
  'mulher-gestation-timeline',
  'mulher-prenatal-board',
  'mulher-prenatal-tap-flow',
  'mulher-prenatal-trap-arena',
]);

const MULHER_PARTO_VARIANTS = new Set([
  'mulher-labor-phase-deck',
  'mulher-parto-humanizado-board',
  'mulher-labor-tap-flow',
  'mulher-parto-trap-arena',
]);

const MULHER_PRENATAL_BESPOKE_BRANCHES = new Set(['mulher_prenatal']);
const MULHER_PARTO_BESPOKE_BRANCHES = new Set(['mulher_parto']);

const MULHER_PAPANICOLAU_VARIANTS = new Set([
  'mulher-screening-spectrum',
  'mulher-papanicolau-board',
  'mulher-screening-tap-flow',
  'mulher-screening-trap-arena',
]);

const MULHER_PAPANICOLAU_BESPOKE_BRANCHES = new Set(['mulher_papanicolau']);

const MULHER_MAMA_VARIANTS = new Set([
  'mulher-mammography-spectrum',
  'mulher-mama-board',
  'mulher-mama-tap-flow',
  'mulher-mama-trap-arena',
]);

const MULHER_MAMA_BESPOKE_BRANCHES = new Set(['mulher_mama']);

const MULHER_PUERPERIO_VARIANTS = new Set([
  'mulher-puerperio-timeline',
  'mulher-puerperio-board',
  'mulher-puerperio-tap-flow',
  'mulher-puerperio-trap-arena',
]);

const MULHER_PUERPERIO_BESPOKE_BRANCHES = new Set(['mulher_puerperio']);

const MULHER_PLANEJAMENTO_VARIANTS = new Set([
  'mulher-contraception-spectrum',
  'mulher-planejamento-board',
  'mulher-planejamento-tap-flow',
  'mulher-planejamento-trap-arena',
]);

const MULHER_PLANEJAMENTO_BESPOKE_BRANCHES = new Set(['mulher_planejamento']);

const VIA_VF_VARIANTS = new Set([
  'absorption-speed-rail',
  'via-reference-board',
  'via-vf-juggle-tap',
  'route-trap',
]);

const CAM_CERTOS_VF_VARIANTS = new Set([
  'cam-certos-deck',
  'cam-nine-rights-board',
  'cam-vf-juggle-tap',
  'cam-certos-trap-arena',
]);

const CAM_ALTO_RISCO_VARIANTS = new Set([
  'cam-high-risk-duo-deck',
  'cam-high-risk-protocol-board',
  'cam-alto-risco-elimination-tap',
  'cam-high-risk-trap-arena',
]);

const CAM_EXCETO_VARIANTS = new Set([
  'cam-exceto-rail',
  'cam-exceto-reference-board',
  'cam-exceto-tap-flow',
  'cam-exceto-trap-arena',
]);

const CAM_DOCUMENTACAO_VARIANTS = new Set([
  'cam-documentacao-deck',
  'cam-documentacao-board',
  'cam-documentacao-vf-tap',
  'cam-documentacao-trap-arena',
]);

const PUNCAO_FLEBITE_VARIANTS = new Set([
  'iv-complication-tissue-layers',
  'iv-differential-board',
  'iv-complication-tap-flow',
  'iv-label-swap-trap',
]);

const PUNCAO_FLEBITE_BESPOKE_BRANCHES = new Set(['puncao_flebite']);

const PUNCAO_DISPOSITIVO_VARIANTS = new Set([
  'iv-gauge-matrix',
  'iv-device-reference-board',
  'iv-device-tap-flow',
  'iv-gauge-mismatch-trap',
]);

const PUNCAO_DISPOSITIVO_BESPOKE_BRANCHES = new Set(['puncao_dispositivo']);

const PUNCAO_EXCETO_VARIANTS = new Set([
  'iv-exceto-spectrum',
  'iv-exceto-command-board',
  'iv-exceto-tap-flow',
  'iv-exceto-intruder-trap',
]);

const PUNCAO_EXCETO_BESPOKE_BRANCHES = new Set(['puncao_exceto']);

const PUNCAO_TEMPO_VARIANTS = new Set([
  'iv-interval-timeline',
  'iv-interval-board',
  'iv-interval-tap-flow',
  'iv-interval-swap-trap',
]);

const PUNCAO_TEMPO_BESPOKE_BRANCHES = new Set(['puncao_tempo']);

const PUNCAO_PERIFERICA_VARIANTS = new Set([
  'iv-puncture-rail',
  'iv-antisepsis-board',
  'iv-puncture-tap-flow',
  'iv-order-invert-trap',
]);

const PUNCAO_PERIFERICA_BESPOKE_BRANCHES = new Set(['puncao_periferica_antissepsia']);

const PUNCAO_IPCS_VARIANTS = new Set([
  'iv-bundle-orbit',
  'iv-bundle-mesh-reveal',
  'iv-bundle-tap-flow',
  'iv-bundle-break-trap',
]);

const PUNCAO_IPCS_BESPOKE_BRANCHES = new Set(['puncao_ipcs_cvc']);

const CALC_DOSE_VARIANTS = new Set([
  'dose-equivalence-rail',
  'soft-lens-board',
  'dose-calc-tap',
  'dose-trap',
]);

const RESPIRATORIO_BESPOKE_VARIANTS = new Set([
  'respiratorio-asma-dpoc-duel-deck',
  'respiratorio-spo2-reference-board',
  'respiratorio-vf-juggle-tap',
  'respiratorio-spo2-trap-arena',
]);

const SP_IDENTIFICACAO_VARIANTS = new Set(['sp-id-verify-deck', 'sp-vf-juggle-tap']);

const SP_QUEDAS_VARIANTS = new Set(['sp-fall-risk-rail']);

const SP_EVENTOS_VARIANTS = new Set(['sp-incident-taxonomy-deck']);

const SP_SHARED_BESPOKE_VARIANTS = new Set([
  'sp-nsp-reference-board',
  'sp-safety-trap-arena',
  'sp-protocol-tap-flow',
]);

export const SP_BESPOKE_VARIANTS = new Set([
  ...SP_IDENTIFICACAO_VARIANTS,
  ...SP_QUEDAS_VARIANTS,
  ...SP_EVENTOS_VARIANTS,
  ...SP_SHARED_BESPOKE_VARIANTS,
]);

const SP_IDENTIFICACAO_BESPOKE_BRANCHES = new Set(['sp_identificacao']);
const SP_QUEDAS_BESPOKE_BRANCHES = new Set(['sp_prevencao_quedas']);
const SP_EVENTOS_BESPOKE_BRANCHES = new Set(['sp_eventos_adversos']);
const SP_STRONG_BESPOKE_BRANCHES = new Set([
  'sp_identificacao',
  'sp_prevencao_quedas',
  'sp_eventos_adversos',
]);

const URGENCIAS_RCP_BESPOKE_VARIANTS = new Set([
  'urgencias-survival-chain-deck',
  'urgencias-rcp-params-board',
  'urgencias-rcp-tap-flow',
  'urgencias-rcp-trap-arena',
]);

const URGENCIAS_XABCDE_BESPOKE_VARIANTS = new Set([
  'urgencias-xabcde-rail',
  'urgencias-trauma-reference-board',
  'urgencias-xabcde-tap-flow',
  'urgencias-trauma-trap-arena',
]);

const URGENCIAS_AVC_BESPOKE_VARIANTS = new Set([
  'urgencias-stroke-signs-deck',
  'urgencias-cincinnati-board',
  'urgencias-stroke-elimination-tap',
  'urgencias-stroke-trap-arena',
]);

const URGENCIAS_CHOQUE_BESPOKE_VARIANTS = new Set([
  'urgencias-shock-types-deck',
  'urgencias-shock-reference-board',
  'urgencias-shock-tap-flow',
  'urgencias-shock-trap-arena',
]);

const URGENCIAS_ENGASGO_BESPOKE_VARIANTS = new Set([
  'urgencias-choking-signal-deck',
  'urgencias-heimlich-board',
  'urgencias-choking-tap-flow',
  'urgencias-choking-trap-arena',
]);

const URGENCIAS_PEDIATRIC_BESPOKE_VARIANTS = new Set([
  'urgencias-pediatric-rcp-deck',
  'urgencias-pediatric-params-board',
  'urgencias-pediatric-tap-flow',
  'urgencias-pediatric-trap-arena',
]);

const URGENCIAS_MANCHESTER_BESPOKE_VARIANTS = new Set([
  'urgencias-manchester-spectrum',
  'urgencias-manchester-board',
  'urgencias-manchester-trap',
]);

const URGENCIAS_EXCETO_BESPOKE_VARIANTS = new Set([
  'urgencias-exceto-rail',
  'urgencias-exceto-reference-board',
  'urgencias-exceto-tap-flow',
  'urgencias-exceto-trap-arena',
]);

const URGENCIAS_PROTOCOL_BESPOKE_VARIANTS = new Set([
  'urgencias-protocol-rules-deck',
  'urgencias-protocol-reference-board',
  'urgencias-protocol-tap-flow',
  'urgencias-protocol-trap-arena',
]);

const URGENCIAS_EMERGENCY_HUB_VARIANTS = new Set(['urgencias-emergency-hub']);

const RESPIRATORIO_BESPOKE_BRANCHES = new Set([
  'respiratorio_vf_asma_dpoc',
  'respiratorio_dpoc_oxigenio',
]);

const URGENCIAS_RCP_BESPOKE_BRANCHES = new Set(['urgencias_rcp_sbv']);

const URGENCIAS_XABCDE_BESPOKE_BRANCHES = new Set(['urgencias_xabcde_trauma']);

const URGENCIAS_AVC_BESPOKE_BRANCHES = new Set(['urgencias_avc_iam']);

const URGENCIAS_CHOQUE_BESPOKE_BRANCHES = new Set(['urgencias_choque']);

const URGENCIAS_ENGASGO_BESPOKE_BRANCHES = new Set(['urgencias_engasgo']);

const URGENCIAS_PEDIATRIC_BESPOKE_BRANCHES = new Set(['urgencias_rcp_pediatrico']);

const URGENCIAS_MANCHESTER_BESPOKE_BRANCHES = new Set(['urgencias_manchester_triagem']);

const URGENCIAS_EXCETO_BESPOKE_BRANCHES = new Set(['urgencias_exceto_conduta']);

const URGENCIAS_PROTOCOL_BESPOKE_BRANCHES = new Set([
  'urgencias_vf_protocolo',
  'urgencias_convulsao',
  'urgencias_anafilaxia',
  'urgencias_queimadura',
]);

const URGENCIAS_EMERGENCY_GENERIC_BRANCHES = new Set(['urgencias_generico']);

function subtopicoMatchesFragments(subtopico: string | undefined, fragments: string[]): boolean {
  if (!subtopico?.trim() || fragments.length === 0) return false;
  const key = normalizeKey(subtopico);
  return fragments.some((f) => key.includes(normalizeKey(f)));
}

function countPatternMatches(corpus: string, patterns: RegExp[]): number {
  return patterns.reduce((n, p) => (p.test(corpus) ? n + 1 : n), 0);
}

/** Extrai texto pesquisável do slide (labels, steps, rows…). */
export function collectSlideTextCorpus(slide: MoldAffinitySlide): string {
  const parts: string[] = [];

  if (typeof slide.content === 'string') parts.push(slide.content);
  if (typeof slide.footer_rule === 'string') parts.push(slide.footer_rule);

  if (Array.isArray(slide.items)) {
    for (const raw of slide.items) {
      if (!raw || typeof raw !== 'object') continue;
      const item = raw as Record<string, unknown>;
      if (item.label != null) parts.push(String(item.label));
      if (item.detail != null) parts.push(String(item.detail));
      if (item.correct != null) parts.push(String(item.correct));
      if (item.title != null) parts.push(String(item.title));
    }
  }

  if (Array.isArray(slide.rows)) {
    for (const raw of slide.rows) {
      if (!raw || typeof raw !== 'object') continue;
      const row = raw as Record<string, unknown>;
      if (row.label != null) parts.push(String(row.label));
      if (row.value != null) parts.push(String(row.value));
    }
  }

  if (Array.isArray(slide.steps)) {
    for (const step of slide.steps) {
      if (typeof step === 'string') parts.push(step);
    }
  }

  return parts.join(' ');
}

/**
 * Registry de afinidade por molde bespoke.
 * Moldes ausentes → pass (compatibilidade com lotes legados).
 */
const MOLD_AFFINITY_RULES: Record<string, MoldAffinityRule> = {
  // ---- Saúde do Adolescente (ramo ético — bloqueia nutrição/Z) ----
  'adolescent-privacy-curtain': {
    homeSubtopicFragments: ['saude do adolescente', 'adolescente'],
    blockFamilies: ['calc'],
    blockPatterns: ADOLESCENT_ETHICS_BLOCK,
    positivePatterns: ADOLESCENT_ETHICS_POSITIVE,
  },
  'adolescent-sigilo-spectrum': {
    homeSubtopicFragments: ['saude do adolescente', 'adolescente'],
    blockFamilies: ['calc'],
    blockPatterns: ADOLESCENT_ETHICS_BLOCK,
    positivePatterns: ADOLESCENT_ETHICS_POSITIVE,
  },
  'adolescent-vf-weave-tap': {
    homeSubtopicFragments: ['saude do adolescente', 'adolescente'],
    blockFamilies: ['calc', 'legis'],
    blockPatterns: ADOLESCENT_ETHICS_BLOCK,
    positivePatterns: [
      ...ADOLESCENT_ETHICS_POSITIVE,
      /afirmativa\s+[IIVX]+|julgar\s+[IIVX]+|\bI\b.*(?:verdadeira|falsa)/i,
    ],
  },
  'adolescent-consent-gate': {
    homeSubtopicFragments: ['saude do adolescente', 'adolescente'],
    blockFamilies: ['calc'],
    blockPatterns: ADOLESCENT_ETHICS_BLOCK,
    positivePatterns: ADOLESCENT_ETHICS_POSITIVE,
  },

  // ---- Saúde do Adolescente — antropometria / escore Z ----
  'adolescent-growth-z-rail': {
    homeSubtopicFragments: ['saude do adolescente', 'adolescente'],
    blockPatterns: [
      ...ADOLESCENT_ETHICS_POSITIVE,
      /anorexia|bulimia/i,
    ],
    positivePatterns: ADOLESCENT_Z_SCORE_POSITIVE,
    minPositive: 1,
  },
  'adolescent-z-band-board': {
    homeSubtopicFragments: ['saude do adolescente', 'adolescente'],
    blockPatterns: [...ADOLESCENT_ETHICS_POSITIVE, /anorexia|bulimia/i],
    positivePatterns: ADOLESCENT_Z_SCORE_POSITIVE,
    minPositive: 1,
  },
  'adolescent-z-classify-tap': {
    homeSubtopicFragments: ['saude do adolescente', 'adolescente'],
    blockPatterns: [...ADOLESCENT_ETHICS_POSITIVE, /anorexia|bulimia/i],
    positivePatterns: ADOLESCENT_Z_SCORE_POSITIVE,
    minPositive: 1,
  },
  'adolescent-z-threshold-trap': {
    homeSubtopicFragments: ['saude do adolescente', 'adolescente'],
    blockPatterns: [...ADOLESCENT_ETHICS_POSITIVE, /anorexia|bulimia/i],
    positivePatterns: ADOLESCENT_Z_SCORE_POSITIVE,
    minPositive: 1,
  },

  // ---- Sinais vitais ----
  'vitals-panel': {
    homeSubtopicFragments: ['sinais vitais', 'verificacao de sinais vitais'],
    positivePatterns: [
      /sinais vitais|\bfc\b|freq[uê]ncia card[ií]aca|press[aã]o arterial|\bpa\b|\bfr\b|spo2|temperatura|taquicard|bradicard|pulso/i,
    ],
  },
  'vitals-reference-board': {
    homeSubtopicFragments: ['sinais vitais', 'verificacao de sinais vitais'],
    positivePatterns: [
      /sinais vitais|\bfc\b|freq[uê]ncia card[ií]aca|press[aã]o arterial|\bpa\b|\bfr\b|spo2|temperatura|taquicard|bradicard/i,
    ],
  },
  'vitals-translate-tap': {
    homeSubtopicFragments: ['sinais vitais', 'verificacao de sinais vitais'],
    positivePatterns: [/sinais vitais|\bfc\b|press[aã]o|temperatura|spo2/i],
  },
  'vitals-classify-arena': {
    homeSubtopicFragments: ['sinais vitais', 'verificacao de sinais vitais'],
    positivePatterns: [/sinais vitais|\bfc\b|press[aã]o|temperatura|taquicard|bradicard/i],
  },

  // ---- Sondas ----
  'procedure-protocol': {
    homeSubtopicFragments: ['sonda', 'manejo de sondas'],
    positivePatterns: [/sonda|nasog[aá]strica|nasoenteral|\bnex\b|bal[aã]o|gastrostomia|jejunostomia/i],
  },
  'sonda-measurement-board': {
    homeSubtopicFragments: ['sonda', 'manejo de sondas'],
    positivePatterns: [/sonda|\bnex\b|nariz|xifoide|medi[cç][aã]o/i],
  },
  'sonda-decision-tap': {
    homeSubtopicFragments: ['sonda', 'manejo de sondas'],
    positivePatterns: [/sonda|nasog[aá]strica|instala[cç][aã]o/i],
  },

  // ---- Imunização / PNI ----
  'pni-rules-deck': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['protocolo', 'calc', 'legis', 'text_fragment'],
    positivePatterns: [
      /\b(i|ii|iii)\s*[-–—]/i,
      /intervalo|refor[cç]o|dose.*vacina|calend[aá]rio.*pni/i,
    ],
    minPositive: 1,
  },
  'pni-interval-matrix': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['protocolo', 'calc', 'legis', 'text_fragment'],
    positivePatterns: [
      /\b(i|ii|iii)\s*[-–—]/i,
      /vacina|imuniz|pni|dose|intervalo|refor[cç]o/i,
    ],
    minPositive: 1,
  },
  'pni-vf-juggle-tap': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['protocolo', 'calc', 'legis', 'text_fragment'],
    positivePatterns: [/\b(i|ii|iii)\s*[-–—]/i, /vacina|imuniz|pni/i],
    minPositive: 1,
  },
  'pni-trap-chips': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['protocolo', 'calc', 'legis', 'text_fragment'],
    positivePatterns: [/vacina|imuniz|pni|intervalo/i],
    minPositive: 1,
  },

  'pni-calendar-board': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['vf', 'calc', 'legis'],
    positivePatterns: [
      /calend[aá]rio|faixa et[aá]ria|\d+\s*m[eê]s|ao nascer|meningo|pentavalente|cart[aã]o perdido|catch-up/i,
    ],
    minPositive: 1,
  },

  'pni-calendar-elimination-tap': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['vf', 'calc', 'legis'],
    positivePatterns: [
      /calend[aá]rio|testar [a-e]|eliminar|marcar [a-e]|\d+\s*m[eê]s|cart[aã]o perdido/i,
    ],
    minPositive: 1,
  },

  'vaccine-timeline': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['vf', 'calc', 'legis'],
    positivePatterns: [
      /calend[aá]rio|\d+\s*m[eê]s|marco|meningo|pentavalente|bcg|cart[aã]o perdido/i,
    ],
    minPositive: 1,
  },

  'calendar-mismatch': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['vf', 'calc', 'legis'],
    positivePatterns: [/calend[aá]rio|\d+\s*m[eê]s|bcg|rotav|pneumo|letra [a-e]/i],
    minPositive: 1,
  },

  'mulher-gestation-timeline': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /pr[eé][\s-]?natal|gesta[cç][aã]o|gestante|ttgo|consulta|trimestre|ácido fólico|acido folico/i,
    ],
    minPositive: 1,
  },
  'mulher-prenatal-board': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /pr[eé][\s-]?natal|gesta[cç][aã]o|ttgo|consulta|trimestre|vdrl|glicemia|6 consultas/i,
    ],
    minPositive: 1,
  },
  'mulher-prenatal-tap-flow': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /pr[eé][\s-]?natal|gesta[cç][aã]o|\b(i|ii|iii)\b|letra [a-e]|eliminar|verdadeira|falsa/i,
    ],
    minPositive: 1,
  },
  'mulher-prenatal-trap-arena': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /pr[eé][\s-]?natal|gesta[cç][aã]o|ttgo|tabagismo|consulta|trimestre|pegadinha/i,
    ],
    minPositive: 1,
  },

  'mulher-labor-phase-deck': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /trabalho de parto|parto humanizado|fase expulsiva|expulsiv|dilata[cç][aã]o|dequita[cç][aã]o|lat[eê]ncia/i,
    ],
    minPositive: 1,
  },
  'mulher-parto-humanizado-board': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /trabalho de parto|parto humanizado|acompanhante|clampeamento|posi[cç][aã]o|fcf|n[aã]o farmacol[oó]gic/i,
    ],
    minPositive: 1,
  },
  'mulher-labor-tap-flow': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /trabalho de parto|parto|\b(i|ii|iii)\b|letra [a-e]|eliminar|verdadeira|falsa|expulsiv/i,
    ],
    minPositive: 1,
  },
  'mulher-parto-trap-arena': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /trabalho de parto|parto|supina|vertical|ctg|clampeamento|água morna|agua morna|pegadinha/i,
    ],
    minPositive: 1,
  },

  'mulher-screening-spectrum': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /papanicolau|colo uterino|rastreio.*colo|citologia|25\s*(?:e|a)\s*64|hpv/i,
    ],
    minPositive: 1,
  },
  'mulher-papanicolau-board': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /papanicolau|25 anos|64 anos|3 anos|trienal|hpv|rastreio.*colo/i,
    ],
    minPositive: 1,
  },
  'mulher-screening-tap-flow': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /papanicolau|rastreio|colo|letra [a-e]|eliminar|40 anos|anual|trienal/i,
    ],
    minPositive: 1,
  },
  'mulher-screening-trap-arena': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /papanicolau|rastreio|colo|40 anos|anual|sintom[aá]tica|pegadinha/i,
    ],
    minPositive: 1,
  },

  'mulher-mammography-spectrum': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /mamografia|rastreio.*mama|c[aâ]ncer de mama|50\s*(?:e|a)\s*69|bienal|autoexame/i,
    ],
    minPositive: 1,
  },
  'mulher-mama-board': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /mamografia|50 anos|69 anos|bienal|2 anos|autoexame|rastreio.*mama/i,
    ],
    minPositive: 1,
  },
  'mulher-mama-tap-flow': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /mamografia|rastreio|mama|letra [a-e]|eliminar|40 anos|anual|bienal/i,
    ],
    minPositive: 1,
  },
  'mulher-mama-trap-arena': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /mamografia|rastreio|mama|40 anos|anual|autoexame|pegadinha/i,
    ],
    minPositive: 1,
  },

  'mulher-puerperio-timeline': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [/puerp[eé]rio|lacta|amamenta|42\s*dia|visita domiciliar/i],
    minPositive: 1,
  },
  'mulher-puerperio-board': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [/puerp[eé]rio|42|visita|am exclusivo|6 meses/i],
    minPositive: 1,
  },
  'mulher-puerperio-tap-flow': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [/puerp[eé]rio|lacta|letra [a-e]|eliminar|42|30 dias/i],
    minPositive: 1,
  },
  'mulher-puerperio-trap-arena': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    positivePatterns: [/puerp[eé]rio|30 dias|42|visita|amamenta|pegadinha/i],
    minPositive: 1,
  },

  'mulher-contraception-spectrum': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [/contracep|planejamento familiar|comportamental|oral|diu/i],
    minPositive: 1,
  },
  'mulher-planejamento-board': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [/contracep|comportamental|hormonal|barreira|larc|diu/i],
    minPositive: 1,
  },
  'mulher-planejamento-tap-flow': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [/contracep|comportamental|julgar|letra [a-e]|eliminar|oral/i],
    minPositive: 1,
  },
  'mulher-planejamento-trap-arena': {
    homeSubtopicFragments: ['saude da mulher', 'obstetricia', 'ginecologia'],
    positivePatterns: [/contracep|oral|comportamental|tabelinha|pegadinha/i],
    minPositive: 1,
  },

  'cold-chain-hub': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /cadeia de frio|rede de frio|conserva[cç][aã]o|refriger|congel|si[\s-]?pni|caixa t[eé]rmica|geladeira|imunobiol/i,
    ],
    minPositive: 1,
  },

  'pni-temperature-rail': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /2\s*°c|8\s*°c|cadeia de frio|rede de frio|conserva[cç][aã]o|refriger|termo|faixa/i,
    ],
    minPositive: 1,
  },

  'pni-cold-chain-tap': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /cadeia de frio|rede de frio|2\s*°c|8\s*°c|eliminar|marcar [a-e]|sequ[eê]ncia|\bI\b\s*[-–—]/i,
    ],
    minPositive: 1,
  },

  'temperature-mismatch': {
    homeSubtopicFragments: ['imunizacao', 'vacinacao'],
    blockFamilies: ['calc', 'legis'],
    positivePatterns: [
      /2\s*°c|8\s*°c|cadeia de frio|piso|teto|congel|agitar|letra [a-e]/i],
    minPositive: 1,
  },

  // ---- ISTs ----
  'ist-risk-routes-deck': {
    homeSubtopicFragments: ['ists', 'infecoes sexualmente transmissiveis'],
    positivePatterns: [/ist\b|hiv|s[ií]filis|hepatite|transmiss[aã]o sexual|preservativo/i],
  },
  'ist-reference-board': {
    homeSubtopicFragments: ['ists', 'infecoes sexualmente transmissiveis'],
    positivePatterns: [/ist\b|hiv|s[ií]filis|hepatite/i],
  },
  'ist-vf-juggle-tap': {
    homeSubtopicFragments: ['ists', 'infecoes sexualmente transmissiveis'],
    positivePatterns: [/ist\b|hiv|s[ií]filis/i],
  },
  'ist-trap-chips': {
    homeSubtopicFragments: ['ists', 'infecoes sexualmente transmissiveis'],
    positivePatterns: [/ist\b|hiv|s[ií]filis/i],
  },

  // ---- IRAS / ITU-cateter (biossegurança) ----
  'itu-closed-system-rail': {
    homeSubtopicFragments: ['infeccoes no contexto da biosseguranca', 'biosseguranca', 'iras'],
    positivePatterns: BIOSSEG_ITU_POSITIVE,
    minPositive: 2,
  },
  'itu-bundle-letter-board': {
    homeSubtopicFragments: ['infeccoes no contexto da biosseguranca', 'biosseguranca', 'iras'],
    positivePatterns: BIOSSEG_ITU_POSITIVE,
    minPositive: 2,
  },
  'itu-exceto-tap': {
    homeSubtopicFragments: ['infeccoes no contexto da biosseguranca', 'biosseguranca', 'iras'],
    blockFamilies: ['vf', 'legis'],
    positivePatterns: [
      ...BIOSSEG_ITU_POSITIVE,
      /\bexceto\b|n[aã]o condiz/i,
    ],
    minPositive: 2,
  },
  'itu-catheter-trap': {
    homeSubtopicFragments: ['infeccoes no contexto da biosseguranca', 'biosseguranca', 'iras'],
    positivePatterns: BIOSSEG_ITU_POSITIVE,
    minPositive: 2,
  },

  'biosseg-precaution-deck': {
    homeSubtopicFragments: ['infeccoes no contexto da biosseguranca', 'biosseguranca', 'iras'],
    positivePatterns: [
      /iras|infec[cç][aã]o.*assist[eê]ncia|precau[cç][aã]o|higiene das m[aã]os|epi\b|res[ií]duo/i,
    ],
    minPositive: 1,
  },
  'biosseg-reference-board': {
    homeSubtopicFragments: ['infeccoes no contexto da biosseguranca', 'biosseguranca', 'iras'],
    positivePatterns: [/iras|precau[cç][aã]o|higiene|epi|res[ií]duo|cadeia de infec[cç][aã]o/i],
    minPositive: 1,
  },
  'biosseg-vf-juggle-tap': {
    homeSubtopicFragments: ['infeccoes no contexto da biosseguranca', 'biosseguranca', 'iras'],
    // Portarias/RDCs (legis) são âncora frequente em IRAS — não bloquear; só calc puro.
    blockFamilies: ['calc'],
    positivePatterns: [
      /\b(i|ii|iii)\s*[-–—]/i,
      /afirmativa|verdadeira|falsa|julgue/i,
      /letra [a-e]|alternativa correta|eliminar|marcar|gabarito|correta/i,
      /iras|infec[cç][aã]o hospitalar|portaria|precau[cç][aã]o|higiene|perfurocortante|epi\b|res[ií]duo|cadeia/i,
    ],
    minPositive: 1,
  },
  'biosseg-trap-chips': {
    homeSubtopicFragments: ['infeccoes no contexto da biosseguranca', 'biosseguranca', 'iras'],
    positivePatterns: [/iras|precau[cç][aã]o|perfurocortante|epi|higiene/i],
    minPositive: 1,
  },

  // ---- Farmacologia ----
  'adme-journey-rail': {
    homeSubtopicFragments: ['farmacodinamica', 'farmacocinetica', 'farmacologia'],
    blockFamilies: ['protocolo', 'calc', 'legis', 'conceito', 'text_fragment', 'certo_errado'],
    blockPatterns: [
      /cen[aá]rio|monitoriza[cç][aã]o|infus[aã]o contínua|ph g[aá]stric|úlcera p[eé]ptica/i,
    ],
    positivePatterns: [
      /\b(i|ii|iii)\s*[-–—]/i,
      /meia[\s-]?vida|t½|t1\/2|\badme\b/i,
      /farmacocin[eé]tica.*farmacodin[aâ]mica|corpo.*f[aá]rmaco.*f[aá]rmaco.*corpo/i,
    ],
    minPositive: 1,
  },
  'pk-pd-reference-board': {
    homeSubtopicFragments: ['farmacodinamica', 'farmacocinetica', 'farmacologia'],
    blockFamilies: ['protocolo', 'calc', 'legis', 'conceito', 'text_fragment', 'certo_errado'],
    positivePatterns: [
      /\b(i|ii|iii)\s*[-–—]/i,
      /farmacocin[eé]tica|farmacodin[aâ]mica|pk|pd|meia[\s-]?vida|biodisponibilidade/i,
    ],
    minPositive: 1,
  },
  'farmaco-vf-juggle-tap': {
    homeSubtopicFragments: ['farmacodinamica', 'farmacocinetica', 'farmacologia'],
    blockFamilies: ['protocolo', 'calc', 'legis', 'conceito', 'text_fragment', 'certo_errado'],
    positivePatterns: [/\b(i|ii|iii)\s*[-–—]/i, /afirmativa|verdadeira|falsa|julgue/i],
    minPositive: 1,
  },
  'farmaco-trap': {
    homeSubtopicFragments: ['farmacodinamica', 'farmacocinetica', 'farmacologia'],
    blockFamilies: ['protocolo', 'calc', 'legis', 'conceito', 'text_fragment', 'certo_errado'],
    positivePatterns: [/farmac|medicamento|meia[\s-]?vida|50%|100%/i],
    minPositive: 1,
  },

  'infusao-ev-station-deck': {
    homeSubtopicFragments: ['farmacodinamica', 'farmacocinetica', 'farmacologia'],
    blockFamilies: ['vf', 'calc', 'legis'],
    blockPatterns: [/\b(i|ii|iii)\s*[-–—]/i, /meia[\s-]?vida.*100%|\badme\b/i],
    positivePatterns: [
      /endoven|infus[aã]o|dilui[cç][aã]o|omeprazol|ibp|fentanil|antib[ií]otico ev/i,
      /monitor|ph g[aá]stric|úlcera|protocolo clínico/i,
    ],
    minPositive: 1,
  },
  'farmaco-clinico-reference-board': {
    homeSubtopicFragments: ['farmacodinamica', 'farmacocinetica', 'farmacologia'],
    blockFamilies: ['vf', 'calc', 'legis'],
    positivePatterns: [
      /dilui[cç][aã]o|infus[aã]o|endoven|monitor|ph g[aá]stric|via sc|bólus/i,
    ],
    minPositive: 1,
  },
  'farmaco-protocol-tap-flow': {
    homeSubtopicFragments: ['farmacodinamica', 'farmacocinetica', 'farmacologia'],
    blockFamilies: ['vf', 'calc', 'legis'],
    positivePatterns: [/testar [a-e]|eliminar|correta|errada|marcar/i],
    minPositive: 1,
  },
  'farmaco-clinico-trap': {
    homeSubtopicFragments: ['farmacodinamica', 'farmacocinetica', 'farmacologia'],
    blockFamilies: ['vf', 'calc', 'legis'],
    positivePatterns: [/letra [a-e]|fosfato|subcut|bólus|alumínio|dilui/i],
    minPositive: 1,
  },

  // ---- Cálculos ----
  'dose-equivalence-rail': {
    homeSubtopicFragments: ['calculo de administracao', 'calculos de enfermagem', 'dosagens'],
    blockFamilies: ['vf', 'certo_errado', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [/dose|gota|ml\b|mg\b|equival[eê]ncia|dilui[cç][aã]o|calcule|regra de tr[eê]s/i],
    minPositive: 1,
  },
  'soft-lens-board': {
    homeSubtopicFragments: ['calculo de administracao', 'calculos de enfermagem', 'dosagens'],
    blockFamilies: ['vf', 'certo_errado', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [/dose|gota|ml\b|mg\b|equival[eê]ncia|dilui[cç][aã]o|regra de tr[eê]s/i],
    minPositive: 1,
  },
  'dose-calc-tap': {
    homeSubtopicFragments: ['calculo de administracao', 'calculos de enfermagem', 'dosagens'],
    blockFamilies: ['vf', 'certo_errado', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [/dose|calcule|ml\b|mg\b|gota/i],
    minPositive: 1,
  },
  'dose-trap': {
    homeSubtopicFragments: ['calculo de administracao', 'calculos de enfermagem', 'dosagens'],
    blockFamilies: ['vf', 'certo_errado', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [/dose|ml\b|mg\b/i],
    minPositive: 1,
  },

  // ---- Vias ----
  'absorption-speed-rail': {
    homeSubtopicFragments: ['vias de administracao'],
    blockFamilies: ['calc', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [
      /\b(i|ii|iii)\s*[-–—]/i,
      /absor[cç][aã]o|biodisponibilidade|velocidade.*absor/i,
    ],
    minPositive: 1,
  },
  'via-reference-board': {
    homeSubtopicFragments: ['vias de administracao'],
    blockFamilies: ['calc', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [
      /\b(i|ii|iii)\s*[-–—]/i,
      /via\b|subcut[aâ]nea|intramuscular|intravenosa|oral/i,
    ],
    minPositive: 1,
  },
  'via-vf-juggle-tap': {
    homeSubtopicFragments: ['vias de administracao'],
    blockFamilies: ['calc', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [/\b(i|ii|iii)\s*[-–—]/i, /via\b|absor[cç][aã]o/i],
    minPositive: 1,
  },
  'route-trap': {
    homeSubtopicFragments: ['vias de administracao'],
    blockFamilies: ['calc', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [/via\b|subcut[aâ]nea|intramuscular|intravenosa/i],
    minPositive: 1,
  },

  // ---- Cuidados na Administração de Medicamentos ----
  'cam-certos-deck': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [
      /\b(i|ii|iii)\s*[-–—]/i,
      /9 certos|nove certos|dois identificador|alto risco|dose certa/i,
    ],
    minPositive: 1,
  },
  'cam-nine-rights-board': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [
      /\b(i|ii|iii)\s*[-–—]/i,
      /9 certos|paciente certo|medicamento certo|dose certa|via certa/i,
    ],
    minPositive: 1,
  },
  'cam-vf-juggle-tap': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [/\b(i|ii|iii)\s*[-–—]/i, /9 certos|administra[cç][aã]o de medicamentos/i],
    minPositive: 1,
  },
  'cam-certos-trap-arena': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'protocolo', 'text_fragment'],
    positivePatterns: [/9 certos|uso habitual|dupla checagem|dose duvidosa/i],
    minPositive: 1,
  },

  'cam-high-risk-duo-deck': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/alto risco|confer[eê]ncia dupla|insulina|heparina|nph/i],
    minPositive: 1,
  },
  'cam-high-risk-protocol-board': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/alto risco|insulina|heparina|dupla checagem/i],
    minPositive: 1,
  },
  'cam-alto-risco-elimination-tap': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/alto risco|insulina|heparina|eliminar letra/i],
    minPositive: 1,
  },
  'cam-high-risk-trap-arena': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/alto risco|insulina|massagear|nph|homogeneizar/i],
    minPositive: 1,
  },

  'cam-exceto-rail': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/\bexceto\b/i, /incorret[oa]\s+afirmar|preparo de medicamento|sala de medica/i],
    minPositive: 1,
  },
  'cam-exceto-reference-board': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/\bexceto\b/i, /preparo|higieniza[cç][aã]o|prescri[cç][aã]o/i],
    minPositive: 1,
  },
  'cam-exceto-tap-flow': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/\bexceto\b/i, /eliminar|letra|conduta/i],
    minPositive: 1,
  },
  'cam-exceto-trap-arena': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/\bexceto\b/i, /via oral|fisiol[oó]gica|preparo/i],
    minPositive: 1,
  },

  'cam-documentacao-deck': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [
      /\b(i|ii|iii)\s*[-–—]/i,
      /registro certo|documenta[cç][aã]o certa|prontu[aá]rio/i,
    ],
    minPositive: 1,
  },
  'cam-documentacao-board': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/registro certo|ap[oó]s administrar|certo\s*6/i],
    minPositive: 1,
  },
  'cam-documentacao-vf-tap': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/\b(i|ii|iii)\s*[-–—]/i, /registro|documenta[cç][aã]o/i],
    minPositive: 1,
  },
  'cam-documentacao-trap-arena': {
    homeSubtopicFragments: ['cuidados na administracao de medicamentos'],
    blockFamilies: ['calc', 'legis', 'text_fragment'],
    positivePatterns: [/antecipad|posterg|ap[oó]s administrar|registro/i],
    minPositive: 1,
  },

  // ---- SAE ----
  'sae-responsibility-matrix': {
    homeSubtopicFragments: ['processo de enfermagem', 'sae'],
    positivePatterns: [/sae|processo de enfermagem|diagn[oó]stico|interven[cç][aã]o|nanda|nic|noc|anota[cç][aã]o/i],
  },
  'sae-reference-board': {
    homeSubtopicFragments: ['processo de enfermagem', 'sae'],
    positivePatterns: [/sae|processo de enfermagem|diagn[oó]stico|nanda/i],
  },
  'sae-decision-tap': {
    homeSubtopicFragments: [
      'processo de enfermagem',
      'sae',
    ],
    positivePatterns: [
      /sae|processo de enfermagem|diagn[oó]stico/i,
    ],
  },
  'norm-reveal': {
    homeSubtopicFragments: [
      'processo de enfermagem',
      'sae',
    ],
    positivePatterns: [
      /sae|processo de enfermagem|diagn[oó]stico|nanda/i,
      /norma|conduta|registro/i,
    ],
  },

  // ---- Oxigenoterapia ----
  'oxygen-protocol-deck': {
    homeSubtopicFragments: ['oxigenoterapia', 'cuidados respiratorios'],
    positivePatterns: [/oxigen|o2\b|cat[eé]ter nasal|m[aá]scara|ventila[cç][aã]o|spo2|hipoxemia/i],
  },
  'oxygen-rule-carousel': {
    homeSubtopicFragments: ['oxigenoterapia', 'cuidados respiratorios'],
    positivePatterns: [/oxigen|o2\b|fluxo|litro/i],
  },
  'oxygen-step-ladder': {
    homeSubtopicFragments: ['oxigenoterapia', 'cuidados respiratorios'],
    positivePatterns: [/oxigen|o2\b/i],
  },

  // ---- Curativos ----
  'wound-stage-tissue-deck': {
    homeSubtopicFragments: ['curativos', 'manejo de feridas'],
    positivePatterns: [/ferida|curativo|les[aã]o|tecido|granula[cç][aã]o|necrose|exsudato/i],
  },
  'dressing-match-matrix': {
    homeSubtopicFragments: ['curativos', 'manejo de feridas'],
    positivePatterns: [/ferida|curativo|les[aã]o|pomada|gaze/i],
  },
  'wound-prep-tap-flow': {
    homeSubtopicFragments: ['curativos', 'manejo de feridas'],
    positivePatterns: [/ferida|curativo|les[aã]o/i],
  },
  'dressing-choice-arena': {
    homeSubtopicFragments: ['curativos', 'manejo de feridas'],
    positivePatterns: [/ferida|curativo|les[aã]o/i],
  },

  // ---- Queimaduras ----
  'burn-depth-layer-deck': {
    homeSubtopicFragments: ['queimaduras', 'feridas e queimaduras'],
    positivePatterns: [/queimadura|grau\b|espessura|superficial|profunda/i],
  },
  'burn-rule-nine-board': {
    homeSubtopicFragments: ['queimaduras', 'feridas e queimaduras'],
    positivePatterns: [/queimadura|regra dos 9|superf[ií]cie corporal/i],
  },
  'burn-triage-tap-flow': {
    homeSubtopicFragments: ['queimaduras', 'feridas e queimaduras'],
    positivePatterns: [/queimadura/i],
  },
  'burn-trap-arena': {
    homeSubtopicFragments: ['queimaduras', 'feridas e queimaduras'],
    positivePatterns: [/queimadura/i],
  },

  // ---- Punção / IV ----
  'morphing-timeline': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/cateter|pun[cç][aã]o|venosa|dispositivo|acesso vascular|equipo/i],
  },
  'iv-bundle-mesh-reveal': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/cateter|pun[cç][aã]o|venosa|bundle|higiene das m[aã]os/i],
  },
  'iv-care-soft-stack': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/cateter|pun[cç][aã]o|venosa/i],
  },
  'catheter-danger-arena': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/cateter|pun[cç][aã]o|venosa/i],
  },
  'iv-complication-tissue-layers': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [
      /infiltra[cç][aã]o|flebite|hematoma|extravasamento|esclerose|subcut[aâ]neo/i,
    ],
    minPositive: 1,
  },
  'iv-differential-board': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/infiltra[cç][aã]o|flebite|hematoma|mecanismo|sinal/i],
    minPositive: 1,
  },
  'iv-complication-tap-flow': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/mecanismo|eliminar|complica[cç][aã]o|em similares/i],
    minPositive: 1,
  },
  'iv-label-swap-trap': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/infiltra[cç][aã]o|flebite|hematoma|troca|confund/i],
    minPositive: 1,
  },
  'iv-gauge-matrix': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/jelco|scalp|calibre|\b(14|16|18|20|22|24)\s*g\b/i],
    minPositive: 1,
  },
  'iv-device-reference-board': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/calibre|jelco|scalp|hemotransfus/i],
    minPositive: 1,
  },
  'iv-device-tap-flow': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/calibre|eliminar|dispositivo/i],
    minPositive: 1,
  },
  'iv-gauge-mismatch-trap': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/calibre|jelco|grosso|fr[aá]gil/i],
    minPositive: 1,
  },
  'iv-exceto-spectrum': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/\bexceto\b|incorret[oa]|pun[cç][aã]o/i],
    minPositive: 1,
  },
  'iv-exceto-command-board': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/\bexceto\b|antissepsia|bisel/i],
    minPositive: 1,
  },
  'iv-exceto-tap-flow': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/\bexceto\b|eliminar|intrusa/i],
    minPositive: 1,
  },
  'iv-exceto-intruder-trap': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/\bexceto\b|proeminente|veia/i],
    minPositive: 1,
  },
  'iv-interval-timeline': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/troca|equipo|24\s*h|72\s*h|perman[eê]ncia/i],
    minPositive: 1,
  },
  'iv-interval-board': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/intervalo|troca|curativo|equipo/i],
    minPositive: 1,
  },
  'iv-interval-tap-flow': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/prazo|horas|eliminar/i],
    minPositive: 1,
  },
  'iv-interval-swap-trap': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/24\s*h|72\s*h|invert|trocar/i],
    minPositive: 1,
  },
  'iv-puncture-rail': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/antissepsia|bisel|pun[cç][aã]o perif/i],
    minPositive: 1,
  },
  'iv-antisepsis-board': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/antissepsia|álcool|70\s*%|secar/i],
    minPositive: 1,
  },
  'iv-puncture-tap-flow': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/sequ[eê]ncia|ordem|eliminar/i],
    minPositive: 1,
  },
  'iv-order-invert-trap': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/invert|distal|proximal|bisel/i],
    minPositive: 1,
  },
  'iv-bundle-orbit': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/bundle|ipcs|cvc|barreira est[eé]ril/i],
    minPositive: 1,
  },
  'iv-bundle-tap-flow': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/bundle|ipcs|barreira|curativo/i],
    minPositive: 1,
  },
  'iv-bundle-break-trap': {
    homeSubtopicFragments: ['puncao venosa', 'cateteres'],
    positivePatterns: [/bundle|barreira|curativo|[uú]mido/i],
    minPositive: 1,
  },

  // ---- Laboratório ----
  'lab-specimen-chain': {
    homeSubtopicFragments: ['coleta de exames', 'exames laboratoriais'],
    positivePatterns: [/coleta|exame|amostra|tubo|jejum|laborat[oó]rio/i],
  },
  'lab-prep-lens-board': {
    homeSubtopicFragments: ['coleta de exames', 'exames laboratoriais'],
    positivePatterns: [/coleta|exame|amostra|jejum/i],
  },
  'lab-vf-soft-stack': {
    homeSubtopicFragments: ['coleta de exames', 'exames laboratoriais'],
    positivePatterns: [/coleta|exame|amostra/i],
  },
  'lab-specimen-arena': {
    homeSubtopicFragments: ['coleta de exames', 'exames laboratoriais'],
    positivePatterns: [/coleta|exame|amostra/i],
  },
  'lab-prep-trap': {
    homeSubtopicFragments: ['coleta de exames', 'exames laboratoriais'],
    positivePatterns: [/coleta|exame|amostra/i],
  },

  // ---- Promoção SUS ----
  'sus-art4-orbit': {
    homeSubtopicFragments: ['promocao a saude', 'prevencao de agravos'],
    positivePatterns: [/art\.?\s*4|promo[cç][aã]o|preven[cç][aã]o|sus\b|princ[ií]pio/i],
  },
  'scope-trap': {
    homeSubtopicFragments: ['promocao a saude', 'prevencao de agravos'],
    positivePatterns: [/promo[cç][aã]o|preven[cç][aã]o|sus\b/i],
  },

  // ---- Enfermagem do trabalho / NR-32 ----
  'nr32-annex-deck': {
    homeSubtopicFragments: ['enfermagem do trabalho'],
    positivePatterns: [/nr[\s-]?32|biológico|risco ocupacional|epi\b|vacina|hepatite|hiv/i],
  },
  'trabalho-nr32-reference-board': {
    homeSubtopicFragments: ['enfermagem do trabalho'],
    positivePatterns: [/nr[\s-]?32|biológico|risco ocupacional|epi\b/i],
  },
  'trabalho-vf-juggle-tap': {
    homeSubtopicFragments: ['enfermagem do trabalho'],
    positivePatterns: [/nr[\s-]?32|trabalho|ocupacional/i],
  },
  'trabalho-pep-trap-arena': {
    homeSubtopicFragments: ['enfermagem do trabalho'],
    positivePatterns: [/nr[\s-]?32|pep\b|profilaxia|acidente/i],
  },

  // ---- Segurança do Paciente / NSP ----
  'sp-id-verify-deck': {
    homeSubtopicFragments: ['seguranca do paciente'],
    positivePatterns: [/dois identificador|pulseira|identificar.*paciente|hom[oô]nimo|dupla checagem/i],
  },
  'sp-fall-risk-rail': {
    homeSubtopicFragments: ['seguranca do paciente'],
    positivePatterns: [/\bmorse\b|queda|risco de queda|grades da cama|prevenc[aã]o de queda/i],
  },
  'sp-incident-taxonomy-deck': {
    homeSubtopicFragments: ['seguranca do paciente'],
    positivePatterns: [/evento adverso|incidente|near miss|quase erro|\bpnsp\b|portaria.*529/i],
  },
  'sp-nsp-reference-board': {
    homeSubtopicFragments: ['seguranca do paciente'],
    positivePatterns: [/seguran[cç]a do paciente|nsp\b|identificador|queda|evento adverso/i],
  },
  'sp-vf-juggle-tap': {
    homeSubtopicFragments: ['seguranca do paciente'],
    positivePatterns: [/seguran[cç]a do paciente|identificador|verdadeira|falsa|afirmativa/i],
  },
  'sp-protocol-tap-flow': {
    homeSubtopicFragments: ['seguranca do paciente'],
    positivePatterns: [/queda|\bmorse\b|evento adverso|incidente|protocolo|notifica[cç][aã]o/i],
  },
  'sp-safety-trap-arena': {
    homeSubtopicFragments: ['seguranca do paciente'],
    positivePatterns: [/seguran[cç]a do paciente|pegadinha|identificador|queda|evento adverso/i],
  },

  // ---- Doenças Respiratórias Crônicas ----
  'respiratorio-asma-dpoc-duel-deck': {
    homeSubtopicFragments: ['doencas respiratorias cronicas', 'asma', 'dpoc'],
    positivePatterns: [/\basma\b|\bdpoc\b|spo2|oxigen|inalador|broncoespasmo|tabag/i],
  },
  'respiratorio-spo2-reference-board': {
    homeSubtopicFragments: ['doencas respiratorias cronicas', 'asma', 'dpoc'],
    positivePatterns: [/\basma\b|\bdpoc\b|spo2|88.?92|oxigen|gasometria/i],
  },
  'respiratorio-vf-juggle-tap': {
    homeSubtopicFragments: ['doencas respiratorias cronicas', 'asma', 'dpoc'],
    positivePatterns: [/\basma\b|\bdpoc\b|spo2|oxigen|afirmativa|verdadeira|falsa/i],
  },
  'respiratorio-spo2-trap-arena': {
    homeSubtopicFragments: ['doencas respiratorias cronicas', 'asma', 'dpoc'],
    positivePatterns: [/\basma\b|\bdpoc\b|spo2|88.?92|oxigen|hiperoxia|titulad/i],
  },

  // ---- Saúde Mental (bespoke — não reutiliza SAE) ----
  'mental-raps-network-rail': {
    homeSubtopicFragments: ['saude mental', 'saúde mental', 'psiquiatria'],
    positivePatterns: [/\braps\b|reforma psiqui[aá]trica|\bsrt\b|portaria.*3088|aten[cç][aã]o psicossocial/i],
  },
  'mental-raps-tier-board': {
    homeSubtopicFragments: ['saude mental', 'saúde mental', 'psiquiatria'],
    positivePatterns: [/\braps\b|\bcaps\b|hospital[\s-]?dia|rede de aten[cç][aã]o|componente/i],
  },
  'mental-raps-classify-tap': {
    homeSubtopicFragments: ['saude mental', 'saúde mental', 'psiquiatria'],
    positivePatterns: [/\braps\b|eliminar|letra|sigla|rede de aten[cç][aã]o/i],
  },
  'mental-raps-trap-arena': {
    homeSubtopicFragments: ['saude mental', 'saúde mental', 'psiquiatria'],
    positivePatterns: [/\braps\b|hospitaliza[cç][aã]o|asilo|exclus[aã]o|caps|pegadinha/i],
  },
  'mental-crisis-signal-deck': {
    homeSubtopicFragments: ['saude mental', 'saúde mental', 'psiquiatria'],
    positivePatterns: [/\bcaps\b|crise|agita[cç][aã]o|acolhimento|escuta|conten[cç][aã]o/i],
  },
  'mental-crisis-ladder-board': {
    homeSubtopicFragments: ['saude mental', 'saúde mental', 'psiquiatria'],
    positivePatterns: [/acolh|escuta|v[ií]nculo|conten[cç][aã]o|interna[cç][aã]o|equipe/i],
  },
  'mental-crisis-decision-tap': {
    homeSubtopicFragments: ['saude mental', 'saúde mental', 'psiquiatria'],
    positivePatterns: [/crise|caps|agita[cç][aã]o|eliminar|priorizar|acolhimento/i],
  },
  'mental-crisis-coercion-trap': {
    homeSubtopicFragments: ['saude mental', 'saúde mental', 'psiquiatria'],
    positivePatterns: [/conten[cç][aã]o|coer[cç][aã]o|acolh|escuta|pegadinha|letra/i],
  },

  // ---- Assistência Perioperatória (bespoke 4 ramos fortes) ----
  'peri-preop-phase-deck': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/pr[eé][\s-]?operat|preparo|jejum|tricotomia|orienta[cç][aã]o/i],
  },
  'peri-preop-prep-board': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/pr[eé][\s-]?operat|jejum|tricotomia|preparo|verifica[cç][aã]o/i],
  },
  'peri-preop-decision-tap': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/pr[eé][\s-]?operat|eliminar|letra|preparo|orienta[cç][aã]o/i],
  },
  'peri-preop-trap-arena': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/pr[eé][\s-]?operat|jejum|tricotomia|pegadinha|letra/i],
  },
  'peri-srpa-monitor-deck': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/\bsrpa\b|aldrete|monitor|sinais vitais|p[oó]s[\s-]?anest/i],
  },
  'peri-aldrete-board': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/aldrete|kroulik|escala|alta da srpa|pontua[cç][aã]o/i],
  },
  'peri-srpa-decision-tap': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/\bsrpa\b|aldrete|eliminar|letra|monitor|analgesia/i],
  },
  'peri-srpa-trap-arena': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/\bsrpa\b|aldrete|\bexceto\b|analgesia|pegadinha|letra/i],
  },
  'peri-protocol-checklist-deck': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/protocolo|cirurgia segura|sign[\s-]?in|time[\s-]?out|sign[\s-]?out|who/i],
  },
  'peri-protocol-reference-board': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/protocolo|cdc|anvisa|cirurgia segura|checklist|sequ[eê]ncia/i],
  },
  'peri-protocol-tap-flow': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/protocolo|sign[\s-]?in|time[\s-]?out|eliminar|letra|who/i],
  },
  'peri-protocol-trap-arena': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/protocolo|cirurgia segura|cdc|pegadinha|letra|who/i],
  },
  'peri-vf-assertions-deck': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/\b(i|ii|iii)\b|verdadeira|falsa|certo ou errado|julgue/i],
  },
  'peri-vf-reference-board': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/\b(i|ii|iii)\b|verdadeira|falsa|srpa|perioperat/i],
  },
  'peri-vf-juggle-tap': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/\b(i|ii|iii)\b|verdadeira|falsa|combina[cç][aã]o|letra/i],
  },
  'peri-vf-trap-chips': {
    homeSubtopicFragments: ['perioperatoria', 'assistencia perioperatoria', 'srpa'],
    positivePatterns: [/\b(i|ii|iii)\b|verdadeira|falsa|pegadinha|letra|srpa/i],
  },
  'urgencias-survival-chain-deck': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/\brcp\b|\bsbv\b|pcr|compress|30:2|100.?120|dea|parada card/i],
  },
  'urgencias-rcp-params-board': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/\brcp\b|\bsbv\b|30:2|100.?120|5.?6\s*cm|pulso|dea/i],
  },
  'urgencias-rcp-tap-flow': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/\brcp\b|\bsbv\b|pcr|compress|30:2|afirmativa|verdadeira|falsa/i],
  },
  'urgencias-rcp-trap-arena': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/\brcp\b|\bsbv\b|30:2|100.?120|pulso|dea|80.?100|4\s*cm/i],
  },
  'urgencias-xabcde-rail': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/xabcde|hemorragia|torniquete|fratura|imobiliza|queimadura|trauma|pr[eé].?hospitalar/i],
  },
  'urgencias-trauma-reference-board': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/xabcde|hemorragia|fratura|queimadura|corpo estranho|trauma|imobiliza/i],
  },
  'urgencias-xabcde-tap-flow': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/xabcde|trauma|hemorragia|fratura|queimadura|eliminar|verdadeira|falsa/i],
  },
  'urgencias-trauma-trap-arena': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/torniquete|tra[cç][aã]o|queimadura|objeto|gelo|manteiga|hemorragia|fratura/i],
  },
  'urgencias-stroke-signs-deck': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/cincinnati|fast|avc|face|bra[cç]o|fala|speech|assimetria/i],
  },
  'urgencias-cincinnati-board': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/cincinnati|fast|face|arms|speech|sorriso|mmss/i],
  },
  'urgencias-stroke-elimination-tap': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/cincinnati|glasgow|ssvv|men[ií]ngea|iam|eliminar|avc/i],
  },
  'urgencias-stroke-trap-arena': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/glasgow|ssvv|men[ií]ngea|iam|cefaleia|tor[aá]cic|cincinnati/i],
  },
  'urgencias-shock-types-deck': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/choque|hipoperfus|el[eé]tric|hipovol[eê]m|seguran[cç]a da cena/i],
  },
  'urgencias-shock-reference-board': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/choque|interromper|desligar|circuito|hipovol[eê]m|arritmia/i],
  },
  'urgencias-shock-tap-flow': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/choque|el[eé]tric|primeira conduta|seguran[cç]a|eliminar/i],
  },
  'urgencias-shock-trap-arena': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/choque|el[eé]tric|rcp|afrouxar|enrolar|hipovol[eê]m/i],
  },
  'urgencias-choking-signal-deck': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/engasgo|obstru[cç][aã]o|sinal universal|pesco[cç]o|heimlich/i],
  },
  'urgencias-heimlich-board': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/engasgo|heimlich|abdominal|lactente|inconsciente|pesco[cç]o/i],
  },
  'urgencias-choking-tap-flow': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/engasgo|sinal|pesco[cç]o|abdome|eliminar|calc[aâ]neo/i],
  },
  'urgencias-choking-trap-arena': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/engasgo|pesco[cç]o|abdome|heimlich|calc[aâ]neo|joelho/i],
  },
  'urgencias-pediatric-rcp-deck': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/pedi[aá]tr|lactente|15:2|ter[cç]o|beb[eê]/i],
  },
  'urgencias-pediatric-params-board': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/15:2|pedi[aá]tr|ter[cç]o|profundidade|30:2/i],
  },
  'urgencias-pediatric-tap-flow': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/pedi[aá]tr|15:2|ter[cç]o|eliminar|profundidade/i],
  },
  'urgencias-pediatric-trap-arena': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/30:2|15:2|metade|ter[cç]o|pedi[aá]tr/i],
  },
  'urgencias-manchester-spectrum': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/manchester|triagem|vermelh|amarel|verde|azul|etiqueta/i],
  },
  'urgencias-manchester-board': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/manchester|vermelh|amarel|verde|azul|etiqueta|triagem/i],
  },
  'urgencias-manchester-trap': {
    homeSubtopicFragments: ['urgencias e emergencias', 'urgencia', 'emergencia'],
    positivePatterns: [/manchester|amarel|azul|verde|monitor|inst[aá]vel|triagem/i],
  },
};

function isOnHomeSubtopic(
  rule: MoldAffinityRule,
  subtopico: string | undefined,
): boolean {
  return subtopicoMatchesFragments(subtopico, rule.homeSubtopicFragments ?? []);
}

/**
 * Retorna true se o molde bespoke combina com o conteúdo do slide.
 * Variantes genéricas sempre passam.
 */
export function bespokeMoldHasContentAffinity(
  variant: string,
  slide: MoldAffinitySlide,
  ctx: MoldAffinityContext = {},
): boolean {
  if (!isBespokeLayoutVariant(variant)) return true;

  const rule = MOLD_AFFINITY_RULES[variant];
  const corpus = collectSlideTextCorpus(slide);

  if (ctx.familyId && rule?.blockFamilies?.includes(ctx.familyId)) {
    return false;
  }

  if (ADOLESCENT_VARIANTS.has(variant) && ctx.familyId === 'calc') {
    return false;
  }

  if (rule?.blockPatterns?.some((p) => p.test(corpus))) {
    return false;
  }

  const onHome = rule ? isOnHomeSubtopic(rule, ctx.subtopico) : false;

  if (ADOLESCENT_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'adolescente_etica_sigilo') {
      return false;
    }
    if (!rule?.positivePatterns?.length) return false;
    const hits = countPatternMatches(corpus, rule.positivePatterns);
    return hits >= (rule.minPositive ?? 1);
  }

  if (ADOLESCENT_ANTHROPOMETRY_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'adolescente_antropometria') {
      return false;
    }
    if (/anorexia|bulimia/i.test(corpus) && !/escore\s*z|score\s*z/i.test(corpus)) {
      return false;
    }
    const positives = rule?.positivePatterns ?? ADOLESCENT_Z_SCORE_POSITIVE;
    const hits = countPatternMatches(corpus, positives);
    return hits >= (rule?.minPositive ?? 1);
  }

  if (MENTAL_SAE_VARIANTS.has(variant)) {
    const isMentalSubtopic = subtopicoMatchesFragments(ctx.subtopico, [
      'saude mental',
      'saúde mental',
      'psiquiatria',
    ]);
    if (isMentalSubtopic) {
      return false;
    }
    if (onHome) return true;
    if (rule?.positivePatterns?.length) {
      const hits = countPatternMatches(corpus, rule.positivePatterns);
      return hits >= (rule.minPositive ?? 1);
    }
    return true;
  }

  if (MENTAL_RAPS_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !MENTAL_RAPS_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (MENTAL_CRISIS_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !MENTAL_CRISIS_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (PERI_PREOP_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !PERI_PREOP_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (PERI_POS_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !PERI_POS_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (PERI_PROTOCOL_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !PERI_PROTOCOL_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (PERI_VF_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !PERI_VF_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (BIOSSEG_GENERIC_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'biosseg_generico') {
      return false;
    }
    if (onHome) return true;
  }

  if (BIOSSEG_ITU_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'biosseg_iras_itu_cateter') {
      return false;
    }
    if (onHome) return true;
  }

  if (SONDA_BESPOKE_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch === 'sonda_generico') {
      return false;
    }
  }

  if (FARMACO_VF_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'farmaco_pk_pd_vf') {
      return false;
    }
  }

  if (FARMACO_CLINICO_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'farmaco_clinico_protocolo') {
      return false;
    }
  }

  if (PNI_VF_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'imunizacao_vf_intervalos') {
      return false;
    }
  }

  if (PNI_CALENDARIO_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'imunizacao_calendario') {
      return false;
    }
  }

  if (PNI_CADEIA_FRIO_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'imunizacao_cadeia_frio') {
      return false;
    }
  }

  if (MULHER_PRENATAL_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !MULHER_PRENATAL_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (MULHER_PARTO_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !MULHER_PARTO_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (MULHER_PAPANICOLAU_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !MULHER_PAPANICOLAU_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (MULHER_MAMA_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !MULHER_MAMA_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (MULHER_PUERPERIO_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !MULHER_PUERPERIO_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (MULHER_PLANEJAMENTO_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !MULHER_PLANEJAMENTO_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (VIA_VF_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'via_vf_absorcao') {
      return false;
    }
  }

  if (CAM_CERTOS_VF_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'cam_certos_vf_caso') {
      return false;
    }
  }

  if (CAM_ALTO_RISCO_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'cam_alto_risco') {
      return false;
    }
  }

  if (CAM_EXCETO_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'cam_exceto_conduta') {
      return false;
    }
  }

  if (CAM_DOCUMENTACAO_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'cam_documentacao') {
      return false;
    }
  }

  if (PUNCAO_FLEBITE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !PUNCAO_FLEBITE_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (PUNCAO_DISPOSITIVO_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !PUNCAO_DISPOSITIVO_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (PUNCAO_EXCETO_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !PUNCAO_EXCETO_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (PUNCAO_TEMPO_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !PUNCAO_TEMPO_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (PUNCAO_PERIFERICA_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !PUNCAO_PERIFERICA_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (PUNCAO_IPCS_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !PUNCAO_IPCS_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (CALC_DOSE_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'calc_dose_equivalencia') {
      return false;
    }
  }

  if (RESPIRATORIO_BESPOKE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !RESPIRATORIO_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (SP_IDENTIFICACAO_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !SP_IDENTIFICACAO_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (SP_QUEDAS_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !SP_QUEDAS_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (SP_EVENTOS_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !SP_EVENTOS_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (SP_SHARED_BESPOKE_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && !SP_STRONG_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)) {
      return false;
    }
  }

  if (URGENCIAS_RCP_BESPOKE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !URGENCIAS_RCP_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (URGENCIAS_XABCDE_BESPOKE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !URGENCIAS_XABCDE_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (URGENCIAS_AVC_BESPOKE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !URGENCIAS_AVC_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (URGENCIAS_CHOQUE_BESPOKE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !URGENCIAS_CHOQUE_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (URGENCIAS_ENGASGO_BESPOKE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !URGENCIAS_ENGASGO_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (URGENCIAS_PEDIATRIC_BESPOKE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !URGENCIAS_PEDIATRIC_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (URGENCIAS_MANCHESTER_BESPOKE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !URGENCIAS_MANCHESTER_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (URGENCIAS_EXCETO_BESPOKE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !URGENCIAS_EXCETO_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (URGENCIAS_PROTOCOL_BESPOKE_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !URGENCIAS_PROTOCOL_BESPOKE_BRANCHES.has(ctx.pedagogicalBranch) &&
      !URGENCIAS_EMERGENCY_GENERIC_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (URGENCIAS_EMERGENCY_HUB_VARIANTS.has(variant)) {
    if (
      ctx.pedagogicalBranch &&
      !URGENCIAS_EMERGENCY_GENERIC_BRANCHES.has(ctx.pedagogicalBranch)
    ) {
      return false;
    }
  }

  if (rule?.positivePatterns?.length) {
    const hits = countPatternMatches(corpus, rule.positivePatterns);
    if (hits >= (rule.minPositive ?? 1)) return true;
  }

  if (onHome) return true;

  if (!rule) return true;

  return false;
}

/**
 * Decide se o fallback do subtópico deve ser usado para este slide.
 */
export function shouldApplySubtopicMold(
  subtopicoVariant: string | undefined,
  slide: MoldAffinitySlide,
  ctx: MoldAffinityContext = {},
): boolean {
  if (!subtopicoVariant) return false;
  if (!isBespokeLayoutVariant(subtopicoVariant)) return true;
  return bespokeMoldHasContentAffinity(subtopicoVariant, slide, ctx);
}
