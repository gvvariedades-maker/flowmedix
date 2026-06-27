/**
 * Ramo pedagógico (L2.5) — subtópico canônico é bucket; o ramo define molde L3.
 *
 * @see docs/MOLD_AFFINITY_RESOLVER.md
 */
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { getDesignBySubtopic, type SubtopicDesign } from '@/components/slides/core/themeGenerator';
import { collectSlideTextCorpus, type MoldAffinitySlide } from '@/lib/slides/moldAffinity';

export type PedagogicalBranchId =
  | 'adolescente_etica_sigilo'
  | 'adolescente_antropometria'
  | 'adolescente_desenvolvimento'
  | 'adolescente_saude_mental'
  | 'adolescente_generico';

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
  /puberdade|puberal|adolesc[eê]ncia|metamorfose/i,
  /horm[oô]nio|disfun[cç][aã]o hormonal|desenvolvimento das mamas|test[ií]culo/i,
  /menarca|espermarquia|estadiamento de tanner|tanner/i,
  /atraso na puberdade|maturidade sexual/i,
];

const ADOLESCENT_MENTAL: RegExp[] = [
  /anorexia|bulimia|transtorno alimentar|imagem corporal/i,
  /depress[aã]o adolescente|autoles[aã]o|suic[ií]dio adolescente/i,
  /sa[uú]de mental.*adolescente/i,
];

function branchMapKey(subtopico: string): string | undefined {
  const key = normalizeKey(subtopico);
  return Object.keys(BRANCH_DESIGN_MAP).find(
    (k) => key === k || key.includes(k) || k.includes(key),
  );
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

  const corpus = [
    instruction,
    ...slides.map((s) => collectSlideTextCorpus(s)),
  ].join(' ');

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
