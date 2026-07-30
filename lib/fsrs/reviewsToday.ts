/**
 * Fonte única da fila de revisões do dia (SM-2 vs FSRS beta).
 * Usada por `/revisoes-hoje`, `/api/analytics/reviews` e player `?from=revisoes`.
 */

import 'server-only';

import { isFsrsMvpBetaEmail, isFsrsMvpEnabled } from '@/lib/env';
import { resolveSubtopicoInventoryFromReviewUnit } from '@/lib/fsrs/inventory';
import {
  asFsrsQueueClient,
  buildFsrsTodayQueue,
  FSRS_DAILY_REVIEW_LIMIT,
  type FsrsQueueClient,
  type FsrsReviewQueueItem,
  type FsrsTodayQueueTelemetry,
} from '@/lib/fsrs/queue';
import { logger } from '@/lib/logger';
import { getTodayReviews, type ReviewItem } from '@/lib/spaced-repetition';
import { createServerSupabase } from '@/lib/supabase/server';

export type ReviewsTodaySource = 'sm2' | 'fsrs';

export type ReviewsTodaySm2Result = {
  source: 'sm2';
  reviews: ReviewItem[];
};

export type ReviewsTodayFsrsResult = {
  source: 'fsrs';
  reviews: FsrsReviewQueueItem[];
  telemetry: FsrsTodayQueueTelemetry;
};

export type ReviewsTodayResult = ReviewsTodaySm2Result | ReviewsTodayFsrsResult;

export type GetReviewsTodayInput = {
  userId: string;
  email?: string | null;
  now?: Date;
  limit?: number;
  /** Cliente injetável (testes). */
  queueClient?: FsrsQueueClient;
  resolveInventory?: (reviewUnitId: string) => Promise<string[]>;
  getSm2Reviews?: (userId: string) => Promise<ReviewItem[]>;
};

/** Flag on + e-mail na allowlist beta → fila FSRS; senão SM-2. */
export function shouldUseFsrsTodayQueue(email?: string | null): boolean {
  return isFsrsMvpEnabled() && isFsrsMvpBetaEmail(email);
}

/**
 * Decide SM-2 vs FSRS e monta a fila do dia.
 * Erro no caminho FSRS → fallback SM-2 (não propaga 500 ao caller).
 */
export async function getReviewsToday(
  input: GetReviewsTodayInput,
): Promise<ReviewsTodayResult> {
  const getSm2 = input.getSm2Reviews ?? getTodayReviews;

  if (!shouldUseFsrsTodayQueue(input.email)) {
    const reviews = await getSm2(input.userId);
    return { source: 'sm2', reviews };
  }

  try {
    const client =
      input.queueClient ??
      asFsrsQueueClient((await createServerSupabase()) as never);
    const built = await buildFsrsTodayQueue({
      client,
      userId: input.userId,
      now: input.now,
      limit: input.limit ?? FSRS_DAILY_REVIEW_LIMIT,
      resolveInventory:
        input.resolveInventory ?? resolveSubtopicoInventoryFromReviewUnit,
    });
    return {
      source: 'fsrs',
      reviews: built.items,
      telemetry: built.telemetry,
    };
  } catch (err) {
    logger.warn('getReviewsToday FSRS failed; falling back to SM-2', {
      userId: input.userId,
      message: err instanceof Error ? err.message : String(err),
    });
    const reviews = await getSm2(input.userId);
    return { source: 'sm2', reviews };
  }
}

/** Slugs para navegação do player (ambos os sources). */
export function reviewsTodaySlugs(result: ReviewsTodayResult): string[] {
  return result.reviews.map((r) => r.modulo_slug);
}
