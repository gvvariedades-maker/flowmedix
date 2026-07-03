/**
 * Camada 2b — factcheck expandido rede de frio (0–2, 8–12, congelamento).
 * Exige guideline tier A explícita e decore 2–8 °C nos goldens de cadeia frio.
 */
import type { GoldenMetaExtensions } from '@/lib/goldenContentStandard';
import { matchClaimToGuideline } from '@/lib/catalogMigration/numericFactcheck';

export type RedeFrioFactcheckIssue = {
  code: string;
  message: string;
  path?: string;
};

type SlideLike = Record<string, unknown>;

const REDE_FRIO_CORPUS_RE =
  /cadeia de frio|rede de frio|temperatura positiva|si-pni|conserva[cç][aã]o.*imunobiol|geladeira.*vacina|2\s*°?\s*c\s*a\s*8/i;

const FAIXA_28_RE = /2\s*°?\s*c\s*(a|e|até|-)\s*8\s*°?\s*c|2\s*[-–]\s*8\s*°?\s*c|entre\s+2\s+e\s+8/i;

const TIER_A_COVERS_RE =
  /cadeia de frio|rede de frio|temperatura|conserva[cç][aã]o|2\s*°?\s*c|imunobiol/i;

function slidesOf(payload: {
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): SlideLike[] {
  const s = payload.reverse_study_slides ?? payload.study_slides;
  return Array.isArray(s) ? s : [];
}

function collectText(node: unknown): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(collectText).join(' ');
  if (node && typeof node === 'object') {
    return Object.values(node as Record<string, unknown>).map(collectText).join(' ');
  }
  return '';
}

function findSlide(slides: SlideLike[], type: string): SlideLike | undefined {
  return slides.find((s) => s.type === type);
}

function isRedeFrioQuestion(
  payload: {
    meta?: { subtopico?: string; pedagogical_branch?: string };
    question_data?: { instruction?: string };
  },
  slides: SlideLike[],
): boolean {
  if (payload.meta?.subtopico?.trim() !== 'Imunização') return false;
  if (payload.meta?.pedagogical_branch === 'imunizacao_cadeia_frio') return true;
  const corpus = `${payload.question_data?.instruction ?? ''} ${collectText(slides)}`;
  return REDE_FRIO_CORPUS_RE.test(corpus);
}

function hasTierASource(meta?: GoldenMetaExtensions): boolean {
  return (meta?.sources ?? []).some((s) => {
    if (s.tier !== 'A') return false;
    const covers = (s.covers ?? []).join(' ');
    return TIER_A_COVERS_RE.test(covers) || /pni|manual.*rede|ms\/pni/i.test(String(s.id ?? s.title ?? ''));
  });
}

/** Claims de armadilha (0–2, 8–12, congelamento) devem existir na guideline tier A. */
function lintTrapClaimsAgainstGuideline(slideText: string): RedeFrioFactcheckIssue[] {
  const issues: RedeFrioFactcheckIssue[] = [];
  const trapSamples: { re: RegExp; claim: string; label: string }[] = [
    { re: /0\s*°?\s*c\s*(e|a|-)\s*2\s*°?\s*c|0\s*[-–]\s*2\s*°?\s*c/i, claim: '0 °C a 2 °C', label: '0–2 °C' },
    { re: /8\s*°?\s*c\s*(e|a|-)\s*12\s*°?\s*c|8\s*[-–]\s*12\s*°?\s*c/i, claim: '8 °C a 12 °C', label: '8–12 °C' },
    { re: /congel|freezer|−?\s*15\s*°?\s*c|câmara negativa/i, claim: 'congelamento', label: 'congelamento' },
  ];

  for (const trap of trapSamples) {
    if (!trap.re.test(slideText)) continue;
    const matched = matchClaimToGuideline('Imunização', trap.claim);
    if (!matched) {
      issues.push({
        code: 'rede_frio_claim_unmatched',
        message: `Armadilha ${trap.label} citada nos slides sem entrada na guideline tier A (Manual Rede de Frio PNI).`,
        path: 'reverse_study_slides',
      });
    }
  }
  return issues;
}

/**
 * Verifica rede de frio: fonte tier A, decore 2–8 °C, armadilhas não como gabarito.
 */
export function lintRedeFrioFactcheck(payload: {
  meta?: GoldenMetaExtensions & { subtopico?: string; pedagogical_branch?: string; content_standard?: string };
  question_data?: { instruction?: string; options?: { id: string; text: string; is_correct?: boolean }[] };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): RedeFrioFactcheckIssue[] {
  if (payload.meta?.content_standard !== 'golden-v1') return [];

  const slides = slidesOf(payload);
  if (!isRedeFrioQuestion(payload, slides)) return [];

  const issues: RedeFrioFactcheckIssue[] = [];
  const slideText = collectText(slides);
  const golden = findSlide(slides, 'golden_rule');
  const goldenText = collectText(golden);

  if (!hasTierASource(payload.meta)) {
    issues.push({
      code: 'rede_frio_tier_a_source',
      message:
        'Rede de frio: meta.sources[] tier A com covers de cadeia/temperatura/conservação (ex.: Manual da Rede de Frio PNI).',
      path: 'meta.sources',
    });
  }

  if (!FAIXA_28_RE.test(goldenText)) {
    issues.push({
      code: 'rede_frio_golden_faixa_28',
      message: 'golden_rule cadeia frio: rows/content devem declarar decore 2 °C a 8 °C (temperatura positiva).',
      path: 'reverse_study_slides.golden_rule',
    });
  }

  const trapAsCorrectRe = /0\s*°?\s*c\s*(e|a)\s*2|8\s*°?\s*c\s*(e|a)\s*12|0\s*[-–]\s*2\s*°?\s*c/i;
  if (trapAsCorrectRe.test(goldenText) && !/não|armadilha|pegadinha|eliminar|fora da faixa/i.test(goldenText)) {
    issues.push({
      code: 'rede_frio_trap_as_correct',
      message:
        'golden_rule não pode apresentar faixa armadilha (0–2 ou 8–12 °C) como decore correto — use danger_zone para distractors.',
      path: 'reverse_study_slides.golden_rule',
    });
  }

  for (const issue of lintTrapClaimsAgainstGuideline(slideText)) {
    if (!issues.some((i) => i.code === issue.code && i.message === issue.message)) {
      issues.push(issue);
    }
  }

  const canonical28 = matchClaimToGuideline('Imunização', '2 °C a 8 °C');
  if (!canonical28 && FAIXA_28_RE.test(slideText)) {
    issues.push({
      code: 'rede_frio_claim_unmatched',
      message: 'Decore 2 °C a 8 °C nos slides sem entrada cadeia-frio-2-8 na guideline Imunização.',
      path: 'reverse_study_slides',
    });
  }

  return issues;
}

export const REDE_FRIO_ALWAYS_ERROR_CODES = new Set([
  'rede_frio_tier_a_source',
  'rede_frio_golden_faixa_28',
  'rede_frio_trap_as_correct',
  'rede_frio_claim_unmatched',
]);

export function redeFrioFactcheckHasErrors(issues: RedeFrioFactcheckIssue[]): boolean {
  return issues.length > 0;
}
