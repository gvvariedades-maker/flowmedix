/**
 * Fixture determinística da jornada FSRS `/revisoes-hoje` (Playwright).
 * Só engata sob `E2E_DASHBOARD_BYPASS` — nunca em produção real.
 */
import type { FsrsReviewQueueItem } from '@/lib/fsrs/queue';
import { E2E_ESTUDAR_SLUG_1, isE2eEstudarSlug } from '@/lib/e2e/constants';

/** Query param exclusivo do bypass E2E (ignorado fora de `isE2eBypassEnabled`). */
export const E2E_REVISOES_FSRS_MODE_PARAM = 'e2e_fsrs';

export type E2eRevisoesFsrsMode = 'empty' | 'queue' | 'off';

export const E2E_FSRS_REVIEW_UNIT_ID =
  'fsrs:v1:discipline=enfermagem:subtopico=urgencias-e2e';

/** Slugs da fila E2E (1 card — “Concluir revisões” no fim). */
export const E2E_REVISOES_QUEUE_SLUGS = [E2E_ESTUDAR_SLUG_1] as const;

export function parseE2eRevisoesFsrsMode(
  searchParams: Record<string, string | string[] | undefined> = {},
): E2eRevisoesFsrsMode {
  const raw = searchParams[E2E_REVISOES_FSRS_MODE_PARAM];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'queue') return 'queue';
  if (value === 'off') return 'off';
  return 'empty';
}

export function getE2eRevisoesQueueItems(): FsrsReviewQueueItem[] {
  return E2E_REVISOES_QUEUE_SLUGS.map((modulo_slug) => ({
    modulo_slug,
    review_unit_id: E2E_FSRS_REVIEW_UNIT_ID,
    same_stem_fallback: false,
    inventory_missing: false,
  }));
}

export function getE2eRevisoesQueueSlugs(): string[] {
  return [...E2E_REVISOES_QUEUE_SLUGS];
}

export function isE2eRevisoesQueueSlug(slug: string): boolean {
  return isE2eEstudarSlug(slug) && getE2eRevisoesQueueSlugs().includes(slug);
}
