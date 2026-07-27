import {
  FSRS_ATTEMPT_CONTEXTS,
  type FsrsAttemptContext,
  type FsrsMvpEligibilityInput,
  type FsrsMvpEligibilityResult,
  type FsrsMvpIneligibilityReason,
  type FsrsMvpRatingPlanInput,
  type FsrsMvpRatingPlanResult,
} from './types';
import { mapCorrectToRating } from './rating';

const ELIGIBLE_CONTEXTS = new Set<FsrsAttemptContext>([
  'cold_practice',
  'scheduled_review',
]);

const CONTEXT_SET = new Set<string>(FSRS_ATTEMPT_CONTEXTS);

export function isFsrsAttemptContext(value: unknown): value is FsrsAttemptContext {
  return typeof value === 'string' && CONTEXT_SET.has(value);
}

/**
 * Gate puro por taxonomia semântica.
 * Fail-closed: contexto inválido / unknown → inelegível.
 * **Não** recebe `isReplay` — sinal técnico sem semântica pedagógica suficiente.
 */
export function isFsrsEligibleAttempt(
  input: FsrsMvpEligibilityInput,
): FsrsMvpEligibilityResult {
  if (!isFsrsAttemptContext(input.context)) {
    return {
      eligible: false,
      reasons: ['context_invalid'],
      context: null,
    };
  }

  const context = input.context;

  if (context === 'unknown') {
    return {
      eligible: false,
      reasons: ['context_unknown'],
      context,
    };
  }

  if (!ELIGIBLE_CONTEXTS.has(context)) {
    const reasons: FsrsMvpIneligibilityReason[] = ['context_not_eligible'];
    return { eligible: false, reasons, context };
  }

  return { eligible: true, context };
}

/**
 * Combina elegibilidade + política binária.
 * Inelegível → `rating: null` (caller **não** deve chamar o scheduler).
 */
export function planFsrsRating(
  input: FsrsMvpRatingPlanInput,
): FsrsMvpRatingPlanResult {
  const gate = isFsrsEligibleAttempt({ context: input.context });
  if (!gate.eligible) {
    return {
      eligible: false,
      reasons: gate.reasons,
      context: gate.context,
      rating: null,
    };
  }
  if (typeof input.isCorrect !== 'boolean') {
    return {
      eligible: false,
      reasons: ['context_invalid'],
      context: gate.context,
      rating: null,
    };
  }
  return {
    eligible: true,
    context: gate.context,
    rating: mapCorrectToRating(input.isCorrect),
  };
}
