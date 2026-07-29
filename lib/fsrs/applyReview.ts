/**
 * Orquestrador R3: elegibilidade → scheduler → persistência.
 * Sem throw para o caller — sempre resultado estruturado.
 */

import { createFsrsScheduler } from '@/lib/fsrs/adapter';
import { serializeFsrsMvpCard } from '@/lib/fsrs/cardState';
import { planFsrsRating } from '@/lib/fsrs/eligibility';
import { resolveReviewUnitId } from '@/lib/fsrs/reviewUnit';
import type { FsrsReviewPersistence } from '@/lib/fsrs/persistenceTypes';
import type {
  FsrsAttemptContext,
  FsrsMvpSerializedCard,
} from '@/lib/fsrs/types';
import { logger } from '@/lib/logger';

export type ApplyFsrsReviewInput = {
  userId: string;
  attemptId: string;
  questionId: string;
  isCorrect: boolean;
  /** Disciplina canônica (tópico). */
  discipline: string;
  subtopico: string | null | undefined;
  /** true somente quando o servidor atestou card due (não confiar no client). */
  fromScheduledReview: boolean;
  /** Telemetria: questão == last_question_id do card (derivado no servidor). */
  sameStemFallback?: boolean;
  reviewedAt?: Date;
  requestRetention?: number;
  persistence: FsrsReviewPersistence;
};

export type ApplyFsrsReviewResult =
  | { applied: false; reason: 'ineligible' | 'unit_unresolved' | 'load_failed' | 'persist_failed' | 'exception' }
  | { applied: true; outcome: string; writeStatus: string };

function mapAttemptContext(fromScheduledReview: boolean): FsrsAttemptContext {
  return fromScheduledReview ? 'scheduled_review' : 'cold_practice';
}

export async function applyFsrsReview(
  input: ApplyFsrsReviewInput,
): Promise<ApplyFsrsReviewResult> {
  try {
    const context = mapAttemptContext(input.fromScheduledReview);
    const plan = planFsrsRating({
      context,
      isCorrect: input.isCorrect,
    });
    if (!plan.eligible || !plan.rating) {
      return { applied: false, reason: 'ineligible' };
    }

    const unit = resolveReviewUnitId({
      discipline: input.discipline,
      subtopico: input.subtopico,
    });
    if (!unit.ok) {
      return { applied: false, reason: 'unit_unresolved' };
    }

    const loaded = await input.persistence.loadCard({
      userId: input.userId,
      reviewUnitId: unit.reviewUnitId,
    });
    if (!loaded.ok) {
      return { applied: false, reason: 'load_failed' };
    }

    const reviewedAt = input.reviewedAt ?? new Date();
    const scheduler = createFsrsScheduler({
      requestRetention: input.requestRetention,
    });
    const cardState = loaded.card
      ? {
          due: loaded.card.fsrs_state.due,
          stability: loaded.card.fsrs_state.stability,
          difficulty: loaded.card.fsrs_state.difficulty,
          elapsedDays: loaded.card.fsrs_state.elapsedDays,
          scheduledDays: loaded.card.fsrs_state.scheduledDays,
          learningSteps: loaded.card.fsrs_state.learningSteps,
          reps: loaded.card.fsrs_state.reps,
          lapses: loaded.card.fsrs_state.lapses,
          state: loaded.card.fsrs_state.state,
          lastReview: loaded.card.fsrs_state.lastReview,
        }
      : null;

    const out = scheduler.review({
      card: cardState,
      rating: plan.rating,
      reviewedAt,
    });

    const serializedAfter: FsrsMvpSerializedCard = serializeFsrsMvpCard(out.card);
    const serializedBefore: FsrsMvpSerializedCard | null = loaded.card
      ? loaded.card.fsrs_state
      : null;

    const persist = await input.persistence.persistReview({
      userId: input.userId,
      attemptId: input.attemptId,
      reviewUnitId: unit.reviewUnitId,
      reviewUnitKind: unit.reviewUnitKind,
      questionId: input.questionId,
      attemptContext: plan.context as 'cold_practice' | 'scheduled_review',
      isCorrect: input.isCorrect,
      rating: plan.rating,
      reviewedAt,
      expectedRevision: loaded.card?.revision ?? null,
      serializedBefore,
      serializedAfter,
      sameStemFallback: input.sameStemFallback === true,
    });

    if (
      persist.outcome === 'persistence_failed' ||
      persist.outcome === 'persistence_unknown' ||
      persist.outcome === 'invalid_state'
    ) {
      logger.warn('FSRS persist non-success', {
        userId: input.userId,
        attemptId: input.attemptId,
        outcome: persist.outcome,
      });
      return { applied: false, reason: 'persist_failed' };
    }

    return {
      applied: true,
      outcome: persist.outcome,
      writeStatus: persist.writeStatus,
    };
  } catch (err) {
    logger.error('FSRS applyReview exception', err, {
      userId: input.userId,
      attemptId: input.attemptId,
    });
    return { applied: false, reason: 'exception' };
  }
}
