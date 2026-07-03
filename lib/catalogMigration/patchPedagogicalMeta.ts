/**
 * Backfill de meta.family e meta.pedagogical_branch (L2.5).
 * @see docs/MOLD_AFFINITY_RESOLVER.md
 */
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { classifyFamily } from '@/lib/catalogMigration/classifyFamily';
import { isPremiumSubtopico } from '@/lib/catalogMigration/premiumGate';
import { GOLDEN_CONTENT_STANDARD_VERSION } from '@/lib/goldenContentStandard';
import {
  detectMoldL3Mismatch,
  type MoldL3FitIssue,
} from '@/lib/slides/detectMoldL3Mismatch';
import type { MoldAffinitySlide } from '@/lib/slides/moldAffinity';
import {
  hasSubtopicBranchDesign,
  inferPedagogicalBranch,
  resolvePedagogicalBranch,
  type PedagogicalBranchId,
} from '@/lib/slides/pedagogicalBranch';
import { QuestaoCompletaSchema } from '@/lib/validations';

export type PatchPedagogicalMetaSkippedReason =
  | 'no_subtopico'
  | 'no_branch_map'
  | 'no_slides'
  | 'filter_premium'
  | 'filter_golden_v1'
  | 'unchanged'
  | 'zod_invalid';

export type PatchPedagogicalMetaOptions = {
  inferFamily?: boolean;
  forceFamily?: boolean;
  forceBranch?: boolean;
  /** Quando declarado ≠ inferido, preferir inferência (backfill L3 em massa). */
  reconcileBranch?: boolean;
  onlyPremium?: boolean;
  onlyGoldenV1?: boolean;
  slug?: string;
};

export type PatchPedagogicalMetaResult = {
  familyBefore?: FamilyId;
  familyAfter: FamilyId;
  branchBefore?: string;
  branchAfter?: PedagogicalBranchId;
  changed: boolean;
  skippedReason?: PatchPedagogicalMetaSkippedReason;
  preMismatch: MoldL3FitIssue[];
  postMismatch: MoldL3FitIssue[];
  zodValid: boolean;
};

export type PatchableQuestaoPayload = {
  meta?: {
    subtopico?: string;
    family?: FamilyId;
    pedagogical_branch?: string;
    content_standard?: string;
  };
  question_data?: {
    instruction?: string;
    text_fragment?: string;
    options?: { id: string; text: string; is_correct?: boolean }[];
  };
  reverse_study_slides?: unknown;
  study_slides?: unknown;
};

function slidesOf(q: PatchableQuestaoPayload): MoldAffinitySlide[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? (s as MoldAffinitySlide[]) : [];
}

function clonePayload<T>(payload: T): T {
  return JSON.parse(JSON.stringify(payload)) as T;
}

function mismatchCodes(issues: MoldL3FitIssue[]): string[] {
  return issues.map((i) => i.code);
}

/**
 * Infere e aplica meta.family + meta.pedagogical_branch quando elegível.
 * Mutates `payload` in place when changed.
 */
export function patchPedagogicalMeta(
  payload: PatchableQuestaoPayload,
  options: PatchPedagogicalMetaOptions = {},
): PatchPedagogicalMetaResult {
  const inferFamily = options.inferFamily !== false;
  const subtopico = payload.meta?.subtopico?.trim();
  const instruction = String(payload.question_data?.instruction ?? '');
  const slides = slidesOf(payload);
  const optionsList = (payload.question_data?.options ?? []).map((o) => ({
    id: o.id,
    text: o.text,
    is_correct: o.is_correct ?? false,
  }));
  const textFragment = String(payload.question_data?.text_fragment ?? '');

  const familyBefore = payload.meta?.family;
  const branchBefore = payload.meta?.pedagogical_branch?.trim();

  if (!subtopico) {
    return {
      familyAfter: familyBefore ?? 'conceito',
      changed: false,
      skippedReason: 'no_subtopico',
      preMismatch: [],
      postMismatch: [],
      zodValid: true,
    };
  }

  if (options.onlyPremium && !isPremiumSubtopico(subtopico)) {
    return {
      familyBefore,
      familyAfter: familyBefore ?? 'conceito',
      branchBefore,
      changed: false,
      skippedReason: 'filter_premium',
      preMismatch: [],
      postMismatch: [],
      zodValid: true,
    };
  }

  if (
    options.onlyGoldenV1 &&
    payload.meta?.content_standard !== GOLDEN_CONTENT_STANDARD_VERSION
  ) {
    return {
      familyBefore,
      familyAfter: familyBefore ?? 'conceito',
      branchBefore,
      changed: false,
      skippedReason: 'filter_golden_v1',
      preMismatch: [],
      postMismatch: [],
      zodValid: true,
    };
  }

  if (!hasSubtopicBranchDesign(subtopico)) {
    return {
      familyBefore,
      familyAfter: familyBefore ?? 'conceito',
      branchBefore,
      changed: false,
      skippedReason: 'no_branch_map',
      preMismatch: [],
      postMismatch: [],
      zodValid: true,
    };
  }

  if (slides.length === 0) {
    return {
      familyBefore,
      familyAfter: familyBefore ?? 'conceito',
      branchBefore,
      changed: false,
      skippedReason: 'no_slides',
      preMismatch: [],
      postMismatch: [],
      zodValid: true,
    };
  }

  const inferredFamily = classifyFamily(instruction, subtopico, optionsList, textFragment);
  let familyAfter: FamilyId = familyBefore ?? inferredFamily;

  if (options.forceFamily || (inferFamily && !familyBefore)) {
    familyAfter = inferredFamily;
  }

  const preSnapshot = clonePayload(payload);
  const preFamily = preSnapshot.meta?.family ?? familyAfter;
  const preBranch = resolvePedagogicalBranch(
    subtopico,
    instruction,
    slides,
    options.forceBranch ? undefined : preSnapshot.meta?.pedagogical_branch,
    preFamily,
  );
  const preMismatch = detectMoldL3Mismatch(preSnapshot, {
    slug: options.slug,
    familyId: preFamily,
    pedagogicalBranch: preBranch,
  });

  const inferredOnly = inferPedagogicalBranch(subtopico, instruction, slides, familyAfter);

  let explicitBranch: string | undefined | null = branchBefore;
  if (options.forceBranch) {
    explicitBranch = undefined;
  } else if (
    options.reconcileBranch &&
    branchBefore &&
    inferredOnly &&
    branchBefore !== inferredOnly
  ) {
    explicitBranch = undefined;
  }

  const branchAfter = resolvePedagogicalBranch(
    subtopico,
    instruction,
    slides,
    explicitBranch,
    familyAfter,
  );

  if (!branchAfter) {
    return {
      familyBefore,
      familyAfter,
      branchBefore,
      changed: false,
      skippedReason: 'no_branch_map',
      preMismatch,
      postMismatch: preMismatch,
      zodValid: true,
    };
  }

  const familyChanged = familyAfter !== familyBefore;
  const branchChanged = branchAfter !== branchBefore;

  if (!familyChanged && !branchChanged) {
    return {
      familyBefore,
      familyAfter,
      branchBefore,
      branchAfter,
      changed: false,
      skippedReason: 'unchanged',
      preMismatch,
      postMismatch: preMismatch,
      zodValid: QuestaoCompletaSchema.safeParse(payload).success,
    };
  }

  const metaSnapshot = { ...payload.meta };

  payload.meta = {
    ...payload.meta,
    pedagogical_branch: branchAfter,
    ...(familyChanged || !familyBefore ? { family: familyAfter } : {}),
  };

  const postMismatch = detectMoldL3Mismatch(payload, {
    slug: options.slug,
    familyId: familyAfter,
    pedagogicalBranch: branchAfter,
  });

  const zodValid = QuestaoCompletaSchema.safeParse(payload).success;
  if (!zodValid) {
    payload.meta = metaSnapshot;
    return {
      familyBefore,
      familyAfter,
      branchBefore,
      branchAfter,
      changed: false,
      skippedReason: 'zod_invalid',
      preMismatch,
      postMismatch,
      zodValid: false,
    };
  }

  return {
    familyBefore,
    familyAfter,
    branchBefore,
    branchAfter,
    changed: true,
    preMismatch,
    postMismatch,
    zodValid: true,
  };
}

export { mismatchCodes };
