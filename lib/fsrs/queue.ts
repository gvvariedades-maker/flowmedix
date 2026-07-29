/**
 * Fila due FSRS MVP (R4) — listagem e seletor de questão.
 * Spec: docs/DECISAO_REVISAO_FSRS_MVP.md §7 · PLANO §5
 */

import type { FsrsSupabaseClientLike } from '@/lib/fsrs/supabasePersistence';
import { logger } from '@/lib/logger';

export const FSRS_DAILY_REVIEW_LIMIT = 10;

export type FsrsDueCard = {
  review_unit_id: string;
  review_unit_kind: 'cluster' | 'subtopico';
  due_at: string;
  last_question_id: string | null;
  revision: number;
};

export type FsrsReviewQueueItem = {
  modulo_slug: string;
  review_unit_id: string;
  same_stem_fallback: boolean;
  inventory_missing: boolean;
};

export type FsrsQueueClient = {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        lte(column: string, value: string): {
          order(
            column: string,
            opts: { ascending: boolean },
          ): Promise<{ data: unknown; error: { message?: string } | null }>;
        };
      };
    };
  };
};

/**
 * Cards due: due_at <= now, ordenados por due_at ASC.
 */
export async function listDueReviewCards(
  client: FsrsQueueClient,
  userId: string,
  now: Date,
  limit: number = FSRS_DAILY_REVIEW_LIMIT,
): Promise<FsrsDueCard[]> {
  const { data, error } = await client
    .from('spaced_review_cards')
    .select('review_unit_id, review_unit_kind, due_at, last_question_id, revision')
    .eq('user_id', userId)
    .lte('due_at', now.toISOString())
    .order('due_at', { ascending: true });

  if (error) {
    logger.warn('listDueReviewCards failed', { userId, message: error.message });
    return [];
  }

  const rows = Array.isArray(data) ? data : [];
  const cards: FsrsDueCard[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    if (typeof r.review_unit_id !== 'string') continue;
    if (r.review_unit_kind !== 'cluster' && r.review_unit_kind !== 'subtopico') {
      continue;
    }
    if (typeof r.due_at !== 'string') continue;
    if (typeof r.revision !== 'number') continue;
    cards.push({
      review_unit_id: r.review_unit_id,
      review_unit_kind: r.review_unit_kind,
      due_at: r.due_at,
      last_question_id:
        typeof r.last_question_id === 'string' ? r.last_question_id : null,
      revision: r.revision,
    });
    if (cards.length >= limit) break;
  }
  return cards;
}

/**
 * Seletor mínimo: inventário de slugs por review_unit.
 * Preferência: ≠ last_question_id; senão same_stem_fallback.
 */
export function selectQuestionForUnit(params: {
  inventorySlugs: string[];
  lastQuestionId: string | null;
}): {
  modulo_slug: string | null;
  same_stem_fallback: boolean;
  inventory_missing: boolean;
} {
  const inventory = params.inventorySlugs.filter((s) => s.trim() !== '');
  if (inventory.length === 0) {
    return {
      modulo_slug: null,
      same_stem_fallback: false,
      inventory_missing: true,
    };
  }

  const preferred = inventory.filter((s) => s !== params.lastQuestionId);
  if (preferred.length > 0) {
    const sorted = [...preferred].sort((a, b) => a.localeCompare(b));
    return {
      modulo_slug: sorted[0]!,
      same_stem_fallback: false,
      inventory_missing: false,
    };
  }

  const sortedAll = [...inventory].sort((a, b) => a.localeCompare(b));
  return {
    modulo_slug: sortedAll[0]!,
    same_stem_fallback: true,
    inventory_missing: false,
  };
}

/**
 * Monta fila do dia a partir dos cards due + inventário por unidade.
 * `resolveInventory(reviewUnitId)` retorna slugs da unidade (já com entitlement).
 */
export async function buildFsrsTodayQueue(params: {
  client: FsrsQueueClient;
  userId: string;
  now?: Date;
  limit?: number;
  resolveInventory: (reviewUnitId: string) => Promise<string[]>;
}): Promise<FsrsReviewQueueItem[]> {
  const now = params.now ?? new Date();
  const cards = await listDueReviewCards(
    params.client,
    params.userId,
    now,
    params.limit ?? FSRS_DAILY_REVIEW_LIMIT,
  );

  const items: FsrsReviewQueueItem[] = [];
  for (const card of cards) {
    const inventory = await params.resolveInventory(card.review_unit_id);
    const selected = selectQuestionForUnit({
      inventorySlugs: inventory,
      lastQuestionId: card.last_question_id,
    });
    if (selected.inventory_missing || !selected.modulo_slug) {
      continue;
    }
    items.push({
      modulo_slug: selected.modulo_slug,
      review_unit_id: card.review_unit_id,
      same_stem_fallback: selected.same_stem_fallback,
      inventory_missing: false,
    });
  }
  return items;
}

/** Narrow helper — service client usable as queue client. */
export function asFsrsQueueClient(
  client: FsrsSupabaseClientLike | FsrsQueueClient,
): FsrsQueueClient {
  return client as FsrsQueueClient;
}
