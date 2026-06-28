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
  | 'sonda_generico';

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

const MENTAL_CRISIS_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'morphological',
  goldenRule: 'center',
  logicFlow: 'sae-decision-tap',
  dangerZone: 'norm-reveal',
};

const MENTAL_GENERIC: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const MENTAL_LEGIS: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'bridge',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
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

/**
 * Mapa ramo → pacote L3 por subtópico.
 * Chave externa: fragmento normalizado do subtópico canônico.
 */
export const BRANCH_DESIGN_MAP: Record<string, Partial<Record<PedagogicalBranchId, SubtopicDesign>>> = {
  'saude do adolescente': {
    adolescente_etica_sigilo: ADOLESCENTE_ETHICS_MOLD,
    adolescente_antropometria: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_desenvolvimento: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_saude_mental: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_generico: ADOLESCENTE_GENERIC_DESIGN,
  },
  adolescente: {
    adolescente_etica_sigilo: ADOLESCENTE_ETHICS_MOLD,
    adolescente_antropometria: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_desenvolvimento: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_saude_mental: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_generico: ADOLESCENTE_GENERIC_DESIGN,
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
  /escuta qualificada|privacidade|acolhimento|v[ií]nculo/i,
  /gravidez|gestante|gesta[cç][aã]o|pr[eé][\s-]?natal/i,
  /\bcaps\b|aten[cç][aã]o psicossocial/i,
  /contracep|orienta[cç][aã]o sexual|viol[eê]ncia sexual|abuso sexual/i,
  /autonomia|consentimento|respons[aá]vel legal/i,
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

const SONDA_MEDICAO: RegExp[] = [
  /\bnex\b|nariz.*orelha|lobo da orelha|xifoide|umbigo|medi[cç][aã]o.*sonda|comprimento/i,
];

const SONDA_INSTALACAO: RegExp[] = [
  /instala[cç][aã]o|fixa[cç][aã]o|nasog[aá]strica|nasoenteral|bal[aã]o|gastrostomia|jejunostomia/i,
];

function branchMapKey(subtopico: string): string | undefined {
  const key = normalizeKey(subtopico);
  const matches = Object.keys(BRANCH_DESIGN_MAP).filter(
    (k) => key === k || key.includes(k) || k.includes(key),
  );
  if (matches.length === 0) return undefined;
  return matches.sort((a, b) => b.length - a.length)[0];
}

function inferAdolescentBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  if (familyId === 'calc' || countPatternMatches(corpus, NUTRITION_ANTHROPOMETRY) > 0) {
    return 'adolescente_antropometria';
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
  if (countPatternMatches(corpus, MENTAL_CRISE) > 0) {
    return 'mental_crise_caps';
  }
  if (countPatternMatches(corpus, MENTAL_DEPENDENCIA) > 0) {
    return 'mental_dependencia_tabagismo';
  }
  if (countPatternMatches(corpus, MENTAL_DEPRESSAO) > 0) {
    return 'mental_depressao';
  }
  if (countPatternMatches(corpus, MENTAL_APS) > 0) {
    return 'mental_aps_acolhimento';
  }
  return 'mental_generico';
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

function inferBranchForBucket(
  mapKey: string,
  corpus: string,
  familyId?: FamilyId,
): PedagogicalBranchId | undefined {
  if (mapKey.includes('adolescente')) {
    return inferAdolescentBranch(corpus, familyId);
  }
  if (mapKey.includes('cme') || mapKey.includes('material')) {
    return inferCmeBranch(corpus, familyId);
  }
  if (mapKey.includes('mental') || mapKey === 'psiquiatria') {
    return inferMentalBranch(corpus);
  }
  if (mapKey.includes('sonda')) {
    return inferSondaBranch(corpus);
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
  return inferBranchForBucket(mapKey, corpus, familyId);
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
