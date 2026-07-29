/**
 * Confirma revisão due no servidor (FSRS MVP R4).
 * `from_revisoes` no client é só intenção — privilégios exigem card due atestado.
 */

import 'server-only';

import { resolveReviewUnitId } from '@/lib/fsrs/reviewUnit';
import type { FsrsMvpReviewUnitKind } from '@/lib/fsrs/types';
import { logger } from '@/lib/logger';

export type ConfirmDueReviewClient = {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        eq(column: string, value: string): {
          maybeSingle(): Promise<{
            data: unknown;
            error: { message?: string } | null;
          }>;
        };
      };
    };
  };
};

export type ConfirmDueScheduledReviewInput = {
  client: ConfirmDueReviewClient;
  userId: string;
  /** Questão canônica sendo respondida (`modulo_slug`). */
  questionId: string;
  /** Disciplina canônica (`meta.topico`). */
  discipline: string;
  /** Subtópico canônico (`meta.subtopico`). */
  subtopico: string | null | undefined;
  now?: Date;
};

export type ConfirmDueScheduledReviewResult =
  | {
      confirmed: true;
      reviewUnitId: string;
      reviewUnitKind: FsrsMvpReviewUnitKind;
      dueAt: string;
      lastQuestionId: string | null;
      revision: number;
      /** Questão selecionada == último enunciado do card. */
      sameStemFallback: boolean;
    }
  | {
      confirmed: false;
      reason: 'unit_unresolved' | 'card_missing' | 'not_due' | 'load_failed';
    };

/**
 * Intenção do client (`from_revisoes`). Nunca isenta cota nem marca
 * `scheduled_review` sozinha — exige `confirmDueScheduledReview`.
 */
export function parseFromRevisoesIntention(body: Record<string, unknown>): boolean {
  const value = body.from_revisoes;
  return value === true || value === '1' || value === 'true';
}

/**
 * Deriva `review_unit_id` da questão canônica e confirma
 * `spaced_review_cards.due_at <= now` para o usuário.
 */
export async function confirmDueScheduledReview(
  input: ConfirmDueScheduledReviewInput,
): Promise<ConfirmDueScheduledReviewResult> {
  const unit = resolveReviewUnitId({
    discipline: input.discipline,
    subtopico: input.subtopico,
  });
  if (!unit.ok) {
    return { confirmed: false, reason: 'unit_unresolved' };
  }

  const now = input.now ?? new Date();

  try {
    const { data, error } = await input.client
      .from('spaced_review_cards')
      .select('review_unit_id, review_unit_kind, due_at, last_question_id, revision')
      .eq('user_id', input.userId)
      .eq('review_unit_id', unit.reviewUnitId)
      .maybeSingle();

    if (error) {
      logger.warn('confirmDueScheduledReview load failed', {
        userId: input.userId,
        reviewUnitId: unit.reviewUnitId,
        message: error.message,
      });
      return { confirmed: false, reason: 'load_failed' };
    }

    if (!data || typeof data !== 'object') {
      return { confirmed: false, reason: 'card_missing' };
    }

    const row = data as Record<string, unknown>;
    if (typeof row.due_at !== 'string' || typeof row.revision !== 'number') {
      return { confirmed: false, reason: 'load_failed' };
    }

    const dueAtMs = Date.parse(row.due_at);
    if (Number.isNaN(dueAtMs) || dueAtMs > now.getTime()) {
      return { confirmed: false, reason: 'not_due' };
    }

    const lastQuestionId =
      typeof row.last_question_id === 'string' ? row.last_question_id : null;

    return {
      confirmed: true,
      reviewUnitId: unit.reviewUnitId,
      reviewUnitKind: unit.reviewUnitKind,
      dueAt: row.due_at,
      lastQuestionId,
      revision: row.revision,
      sameStemFallback:
        lastQuestionId != null && lastQuestionId === input.questionId,
    };
  } catch (err) {
    logger.warn('confirmDueScheduledReview exception', {
      userId: input.userId,
      message: err instanceof Error ? err.message : String(err),
    });
    return { confirmed: false, reason: 'load_failed' };
  }
}
