/**
 * Resolução de moldes premium (L3) por afinidade de conteúdo.
 *
 * Regra: molde bespoke do subtópico só aplica quando o texto do slide
 * combina com o ramo pedagógico — senão cai para família + rotação por slug.
 *
 * @see docs/MOLD_AFFINITY_RESOLVER.md
 */
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';

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

const ADOLESCENT_VARIANTS = new Set([
  'adolescent-privacy-curtain',
  'adolescent-sigilo-spectrum',
  'adolescent-vf-weave-tap',
  'adolescent-consent-gate',
]);

const MENTAL_SAE_VARIANTS = new Set(['sae-decision-tap', 'norm-reveal']);

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

const PNI_VF_VARIANTS = new Set([
  'pni-rules-deck',
  'pni-interval-matrix',
  'pni-vf-juggle-tap',
  'pni-trap-chips',
]);

const VIA_VF_VARIANTS = new Set([
  'absorption-speed-rail',
  'via-reference-board',
  'via-vf-juggle-tap',
  'route-trap',
]);

const CALC_DOSE_VARIANTS = new Set([
  'dose-equivalence-rail',
  'soft-lens-board',
  'dose-calc-tap',
  'dose-trap',
]);

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
      'saude mental',
      'saúde mental',
      'psiquiatria',
    ],
    positivePatterns: [
      /sae|processo de enfermagem|diagn[oó]stico/i,
      /caps|crise|agita[cç][aã]o|suic[ií]dio|psicose|transtorno mental/i,
    ],
  },
  'norm-reveal': {
    homeSubtopicFragments: [
      'processo de enfermagem',
      'sae',
      'saude mental',
      'saúde mental',
      'psiquiatria',
    ],
    positivePatterns: [
      /sae|processo de enfermagem|diagn[oó]stico|nanda/i,
      /caps|crise|agita[cç][aã]o|suic[ií]dio|norma|conduta/i,
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

  if (MENTAL_SAE_VARIANTS.has(variant)) {
    const isMentalSubtopic = subtopicoMatchesFragments(ctx.subtopico, [
      'saude mental',
      'saúde mental',
      'psiquiatria',
    ]);
    const isSaeSubtopic = subtopicoMatchesFragments(ctx.subtopico, [
      'processo de enfermagem',
      'sae',
    ]);

    if (isSaeSubtopic && !isMentalSubtopic) {
      if (onHome) return true;
      if (rule?.positivePatterns?.length) {
        const hits = countPatternMatches(corpus, rule.positivePatterns);
        return hits >= (rule.minPositive ?? 1);
      }
      return true;
    }

    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'mental_crise_caps') {
      return false;
    }
    if (!rule?.positivePatterns?.length) return false;
    const hits = countPatternMatches(corpus, rule.positivePatterns);
    return hits >= (rule.minPositive ?? 1);
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

  if (PNI_VF_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'imunizacao_vf_intervalos') {
      return false;
    }
  }

  if (VIA_VF_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'via_vf_absorcao') {
      return false;
    }
  }

  if (CALC_DOSE_VARIANTS.has(variant)) {
    if (ctx.pedagogicalBranch && ctx.pedagogicalBranch !== 'calc_dose_equivalencia') {
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
