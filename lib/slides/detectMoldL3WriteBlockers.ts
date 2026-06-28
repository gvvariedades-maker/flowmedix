/**
 * Bloqueios L3 na escrita — simula resolução do player e emite errors.
 */
import {
  enrichPresentationContext,
  resolveSlidePresentation,
} from '@/components/slides/core/slidePresentation';
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import {
  bespokeMoldHasContentAffinity,
  isBespokeLayoutVariant,
  type MoldAffinitySlide,
} from '@/lib/slides/moldAffinity';
import {
  detectMoldL3Mismatch,
  type MoldL3FitIssue,
} from '@/lib/slides/detectMoldL3Mismatch';
import {
  getLayoutVariantForBranch,
  resolvePedagogicalBranch,
  type PedagogicalBranchId,
} from '@/lib/slides/pedagogicalBranch';

type SlideLike = MoldAffinitySlide & { type?: string; meta?: { subtopico?: string } };

type QuestaoLike = {
  meta?: {
    subtopico?: string;
    family?: FamilyId;
    pedagogical_branch?: string;
    content_standard?: string;
  };
  question_data?: { instruction?: string };
  reverse_study_slides?: unknown;
  study_slides?: unknown;
};

function slidesOf(q: QuestaoLike): SlideLike[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? (s as SlideLike[]) : [];
}

export type DetectMoldL3WriteBlockersOptions = {
  slug?: string;
  /** Fase B: bloqueia unresolved_bespoke em golden-v1 */
  strictL3?: boolean;
  /** Fase A: sempre bloqueia declared_branch_conflict */
  phaseA?: boolean;
};

/**
 * Issues que devem bloquear escrita (apply-lote / Laboratório).
 */
export function detectMoldL3WriteBlockers(
  payload: QuestaoLike,
  options: DetectMoldL3WriteBlockersOptions = {},
): MoldL3FitIssue[] {
  const issues: MoldL3FitIssue[] = [];
  const slides = slidesOf(payload);
  const subtopico = payload.meta?.subtopico;
  const instruction = String(payload.question_data?.instruction ?? '');
  const familyId = payload.meta?.family;
  const declaredBranch = payload.meta?.pedagogical_branch?.trim();
  const branch = resolvePedagogicalBranch(
    subtopico,
    instruction,
    slides,
    declaredBranch,
    familyId,
  );

  const phaseA = options.phaseA !== false;
  const strictL3 =
    options.strictL3 === true ||
    payload.meta?.content_standard === 'golden-v1' ||
    Boolean(declaredBranch);

  for (const fit of detectMoldL3Mismatch(payload, {
    slug: options.slug,
    familyId,
    pedagogicalBranch: branch,
  })) {
    if (fit.code === 'mold_l3_zero_slots') {
      issues.push(fit);
    }
    if (strictL3 && fit.code === 'mold_l3_affinity_rejected') {
      issues.push({
        code: 'mold_l3_unresolved_bespoke',
        slideType: fit.slideType,
        resolvedVariant: fit.resolvedVariant,
        message: `Molde bespoke rejeitado por afinidade em golden-v1 — ${fit.message}`,
      });
    }
  }

  const questionMeta = {
    subtopico,
    pedagogical_branch: declaredBranch,
  };

  slides.forEach((slide, slideIndex) => {
    const slideType = slide.type ?? 'unknown';
    const subtopicoName = slide.meta?.subtopico ?? subtopico;
    if (!subtopicoName) return;

    const ctx = enrichPresentationContext(
      {
        questionSlug: options.slug ?? 'gate-check',
        slideIndex,
        familyId,
      },
      slide.meta,
      instruction,
      slides,
      questionMeta,
    );

    const resolved = resolveSlidePresentation(
      slide as Parameters<typeof resolveSlidePresentation>[0],
      ctx,
    );

    const effectiveBranch = ctx.pedagogicalBranch ?? branch;

    if (phaseA && declaredBranch) {
      const slideRecord = slide as Record<string, unknown>;
      if (slideType === 'golden_rule' && Array.isArray(slideRecord.rows) && slideRecord.rows.length > 0) {
        return;
      }
      if (
        slideType === 'danger_zone' &&
        Array.isArray(slideRecord.items) &&
        (slideRecord.items as { correct?: string }[]).some((i) => i.correct?.trim())
      ) {
        return;
      }

      const expectedFromBranch = getLayoutVariantForBranch(
        subtopicoName,
        slideType,
        declaredBranch as PedagogicalBranchId,
      );

      if (
        expectedFromBranch &&
        resolved.layoutVariant !== expectedFromBranch &&
        !resolved.moldFallback
      ) {
        issues.push({
          code: 'mold_l3_declared_branch_conflict',
          slideType,
          resolvedVariant: resolved.layoutVariant,
          message: `Ramo declarado "${declaredBranch}" espera "${expectedFromBranch}" mas o player resolve "${resolved.layoutVariant}".`,
        });
      }
    }

    if (strictL3 && isBespokeLayoutVariant(resolved.layoutVariant) && !resolved.moldFallback) {
      const affinityOk = bespokeMoldHasContentAffinity(resolved.layoutVariant, slide, {
        slideType,
        familyId,
        subtopico: subtopicoName,
        pedagogicalBranch: effectiveBranch,
      });

      if (!affinityOk) {
        issues.push({
          code: 'mold_l3_unresolved_bespoke',
          slideType,
          resolvedVariant: resolved.layoutVariant,
          message: `Molde bespoke "${resolved.layoutVariant}" aplicado sem afinidade — conteúdo incompatível com o ramo (declarado: ${declaredBranch ?? effectiveBranch ?? '—'}).`,
        });
      }
    }
  });

  return issues;
}
