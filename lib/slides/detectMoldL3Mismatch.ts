/**
 * Detecção de mismatch L3: molde resolvido vs conteúdo do slide.
 */
import {
  resolveSlidePresentation,
  type SlidePresentationContext,
} from '@/components/slides/core/slidePresentation';
import { getLayoutVariantBySubtopic } from '@/components/slides/core/themeGenerator';
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import {
  bespokeMoldHasContentAffinity,
  isBespokeLayoutVariant,
  shouldApplySubtopicMold,
  type MoldAffinitySlide,
} from '@/lib/slides/moldAffinity';
import { bespokeMoldHasRenderableSlots, countMoldInteractiveSlots } from '@/lib/slides/moldSlotFit';
import {
  getLayoutVariantForBranch,
  resolvePedagogicalBranch,
  type PedagogicalBranchId,
} from '@/lib/slides/pedagogicalBranch';

export type MoldL3FitIssue = {
  code: string;
  slideType: string;
  message: string;
  resolvedVariant?: string;
};

type SlideLike = MoldAffinitySlide & { type?: string; meta?: { subtopico?: string } };

type QuestaoLike = {
  meta?: {
    subtopico?: string;
    family?: FamilyId;
    pedagogical_branch?: string;
  };
  question_data?: { instruction?: string };
  reverse_study_slides?: unknown;
  study_slides?: unknown;
};

function slidesOf(q: QuestaoLike): SlideLike[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? (s as SlideLike[]) : [];
}

export type DetectMoldL3MismatchOptions = {
  slug?: string;
  familyId?: FamilyId;
  pedagogicalBranch?: PedagogicalBranchId;
};

/**
 * Audita se o player resolveria moldes sem afinidade ou com 0 slots (antes do fallback).
 */
export function detectMoldL3Mismatch(
  payload: QuestaoLike,
  options: DetectMoldL3MismatchOptions = {},
): MoldL3FitIssue[] {
  const issues: MoldL3FitIssue[] = [];
  const slides = slidesOf(payload);
  const subtopico = payload.meta?.subtopico;
  const instruction = String(payload.question_data?.instruction ?? '');
  const familyId = options.familyId ?? payload.meta?.family;
  const branch =
    options.pedagogicalBranch ??
    resolvePedagogicalBranch(
      subtopico,
      instruction,
      slides,
      payload.meta?.pedagogical_branch,
      familyId,
    );

  slides.forEach((slide, slideIndex) => {
    const slideType = slide.type ?? 'unknown';
    const subtopicoName = slide.meta?.subtopico ?? subtopico;
    const mappedVariant =
      (subtopicoName && branch
        ? getLayoutVariantForBranch(subtopicoName, slideType, branch)
        : undefined) ??
      (subtopicoName ? getLayoutVariantBySubtopic(subtopicoName, slideType, slide) : undefined);

    if (!mappedVariant || !isBespokeLayoutVariant(mappedVariant)) return;

    const affinityCtx = {
      slideType,
      familyId,
      subtopico: subtopicoName,
      pedagogicalBranch: branch,
    };

    const affinityOk = bespokeMoldHasContentAffinity(mappedVariant, slide, affinityCtx);
    const slots = countMoldInteractiveSlots(mappedVariant, slide);
    const wouldApply = shouldApplySubtopicMold(mappedVariant, slide, affinityCtx);

    if (!affinityOk || !wouldApply) {
      issues.push({
        code: 'mold_l3_affinity_rejected',
        slideType,
        resolvedVariant: mappedVariant,
        message: `Molde "${mappedVariant}" rejeitado por afinidade (ramo: ${branch ?? '—'}) — player usará fallback genérico.`,
      });
      return;
    }

    if (slots === 0) {
      issues.push({
        code: 'mold_l3_zero_slots',
        slideType,
        resolvedVariant: mappedVariant,
        message: `Molde "${mappedVariant}" teria 0 slots interativos — conteúdo incompatível com o molde do subtópico.`,
      });
    }

    const ctx: SlidePresentationContext = {
      questionSlug: options.slug,
      slideIndex,
      familyId,
      pedagogicalBranch: branch,
      instruction,
    };
    const resolved = resolveSlidePresentation(
      slide as Parameters<typeof resolveSlidePresentation>[0],
      ctx,
    );
    if (resolved.moldFallback && isBespokeLayoutVariant(mappedVariant)) {
      issues.push({
        code: 'mold_l3_runtime_fallback',
        slideType,
        resolvedVariant: resolved.layoutVariant,
        message: `Player fez fallback de "${mappedVariant}" → "${resolved.layoutVariant}".`,
      });
    }
  });

  return issues;
}

export function moldL3MismatchErrors(
  payload: QuestaoLike,
  options: DetectMoldL3MismatchOptions = {},
): MoldL3FitIssue[] {
  return detectMoldL3Mismatch(payload, options).filter((i) => i.code === 'mold_l3_zero_slots');
}
