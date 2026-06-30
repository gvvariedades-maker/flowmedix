/**
 * Camada 2 — alignment semântico slug ↔ slides ↔ gabarito.
 * @see docs/QUALITY_LAYERS_MODEL.md § L2
 */
import { detectDangerGabaritoMismatch } from '@/lib/catalogMigration/slideContract';
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import {
  extractInstructionTerms,
  lintGabaritoConsistency,
  lintLogicFlowRecycling,
} from '@/lib/goldenContentStandard';
import { inferPedagogicalBranch } from '@/lib/slides/pedagogicalBranch';
import { lintFamilyAlignment } from '@/lib/catalogMigration/slugAlignmentByFamily';

export type AlignmentSeverity = 'error' | 'warn';

export type AlignmentIssue = {
  code: string;
  message: string;
  severity: AlignmentSeverity;
  path?: string;
};

type SlideLike = Record<string, unknown>;
type QuestaoLike = {
  meta?: {
    subtopico?: string;
    family?: FamilyId;
    pedagogical_branch?: string;
    content_standard?: string;
  };
  question_data?: {
    instruction?: string;
    text_fragment?: string;
    options?: { id: string; text: string; is_correct: boolean }[];
  };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
};

function slidesOf(q: QuestaoLike): SlideLike[] {
  const slides = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(slides) ? slides : [];
}

function findSlide(slides: SlideLike[], type: string): SlideLike | undefined {
  return slides.find((s) => s.type === type);
}

function collectSlideStrings(node: unknown): string {
  if (typeof node === 'string') return node + ' ';
  if (Array.isArray(node)) return node.map(collectSlideStrings).join('');
  if (node && typeof node === 'object') {
    return Object.values(node as Record<string, unknown>).map(collectSlideStrings).join('');
  }
  return '';
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** ≥30% dos termos ≥5 chars do enunciado presentes nos slides. */
function lintInstructionTermsAlignment(q: QuestaoLike, slides: SlideLike[]): AlignmentIssue[] {
  const instruction = q.question_data?.instruction ?? '';
  const correctText = q.question_data?.options?.find((o) => o.is_correct)?.text ?? '';
  const terms = [
    ...new Set([...extractInstructionTerms(instruction), ...extractInstructionTerms(correctText)]),
  ].filter((t) => t.length >= 5);

  if (terms.length === 0) return [];

  const slidesPlain = normalizeText(collectSlideStrings(slides));
  const present = terms.filter((t) => slidesPlain.includes(t)).length;
  const threshold = Math.max(1, Math.ceil(terms.length * 0.3));

  if (present < threshold) {
    return [
      {
        code: 'align_instruction_terms',
        message: `Slides citam ${present}/${terms.length} termos do enunciado (mínimo ${threshold} = 30%).`,
        severity: 'error',
      },
    ];
  }
  return [];
}

/** Substring significativa (≥8 chars) da alternativa correta em concept_map ou golden_rule. */
function lintCorrectOptionRef(q: QuestaoLike, slides: SlideLike[]): AlignmentIssue[] {
  const correctText = q.question_data?.options?.find((o) => o.is_correct)?.text?.trim() ?? '';
  if (correctText.length < 12) return [];

  const words = normalizeText(correctText)
    .split(/\s+/)
    .filter((w) => w.length >= 5);
  if (words.length === 0) return [];

  const concept = findSlide(slides, 'concept_map');
  const golden = findSlide(slides, 'golden_rule');
  const target = normalizeText(
    collectSlideStrings([concept, golden].filter(Boolean)),
  );

  const hit = words.some((w) => target.includes(w));
  if (!hit) {
    return [
      {
        code: 'align_correct_option_ref',
        message:
          'Nenhum termo significativo da alternativa correta aparece em concept_map ou golden_rule.',
        severity: 'warn',
        path: 'reverse_study_slides',
      },
    ];
  }
  return [];
}

function lintDangerDistractors(
  q: QuestaoLike,
  slides: SlideLike[],
): AlignmentIssue[] {
  const issues: AlignmentIssue[] = [];
  const gabarito = detectDangerGabaritoMismatch(q.question_data?.options, slides);
  if (gabarito.mismatch) {
    issues.push({
      code: 'align_danger_gabarito',
      message: `danger_zone letra (${gabarito.parsed}) ≠ gabarito (${gabarito.expected})`,
      severity: 'error',
    });
  }

  const dz = findSlide(slides, 'danger_zone');
  const items = Array.isArray(dz?.items) ? (dz!.items as { correct?: string }[]) : [];
  const explanations = items
    .map((i) =>
      (i.correct ?? '')
        .replace(/^Gabarito:?\s*(?:letra\s*)?[A-E]\s*[—–-]\s*/i, '')
        .trim()
        .toLowerCase(),
    )
    .filter((t) => t.length > 0);
  const unique = new Set(explanations);
  if (unique.size < explanations.length) {
    issues.push({
      code: 'align_danger_duplicate_correct',
      message: 'danger_zone.items[].correct com justificativas duplicadas.',
      severity: 'error',
    });
  }
  return issues;
}

function lintBranchDeclared(q: QuestaoLike, slides: SlideLike[]): AlignmentIssue[] {
  const subtopico = q.meta?.subtopico?.trim();
  if (!subtopico) return [];

  const inferred = inferPedagogicalBranch(
    subtopico,
    q.question_data?.instruction ?? '',
    slides as never[],
    q.meta?.family,
  );
  const declared = q.meta?.pedagogical_branch?.trim();
  if (!declared || !inferred || declared === inferred) return [];

  return [
    {
      code: 'align_branch_declared',
      message: `meta.pedagogical_branch="${declared}" ≠ inferido="${inferred}"`,
      severity: 'warn',
      path: 'meta.pedagogical_branch',
    },
  ];
}

export type LintSlugAlignmentOptions = {
  /** errors bloqueiam; default true em preflight strict. */
  strict?: boolean;
};

/**
 * Lint de alignment semântico — transversal + por família.
 * Retorna issues com severity; em strict=false, alguns viram warn.
 */
export function lintSlugAlignment(
  payload: unknown,
  options: LintSlugAlignmentOptions = {},
): AlignmentIssue[] {
  const q = payload as QuestaoLike;
  const slides = slidesOf(q);
  const issues: AlignmentIssue[] = [];

  for (const issue of lintGabaritoConsistency(slides, q)) {
    issues.push({
      code: 'align_gabarito_letter',
      message: issue.message,
      severity: 'error',
      path: issue.path,
    });
  }

  for (const issue of lintLogicFlowRecycling(slides, q)) {
    issues.push({
      code: 'align_logic_not_recycle',
      message: issue.message,
      severity: 'error',
      path: issue.path,
    });
  }

  issues.push(...lintInstructionTermsAlignment(q, slides));
  issues.push(...lintCorrectOptionRef(q, slides));
  issues.push(...lintDangerDistractors(q, slides));
  issues.push(...lintBranchDeclared(q, slides));

  if (q.meta?.family) {
    issues.push(
      ...lintFamilyAlignment(q.meta.family, q, slides).map((i) => ({
        ...i,
        severity: i.severity ?? 'error',
      })),
    );
  }

  if (options.strict === false) {
    return issues.map((i) =>
      i.code === 'align_correct_option_ref' || i.code === 'align_branch_declared'
        ? { ...i, severity: 'warn' as const }
        : i,
    );
  }

  return issues;
}

export function slugAlignmentHasErrors(issues: AlignmentIssue[]): boolean {
  return issues.some((i) => i.severity === 'error');
}
