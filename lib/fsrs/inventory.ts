/**
 * Inventário de slugs por review_unit (R4) — fora de page.tsx (gate RSC).
 */

import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/** Row tipada de `modulos_estudo` para inventário de revisão. */
export type ModuloInventoryRow = {
  modulo_slug: string;
};

/**
 * Resolve slugs (`modulo_slug`) do subtópico embutido em `review_unit_id`.
 * Unidades sem sufixo `:subtopico=` → inventário vazio.
 */
export async function resolveSubtopicoInventoryFromReviewUnit(
  reviewUnitId: string,
): Promise<string[]> {
  const match = /:subtopico=([^:]+)$/.exec(reviewUnitId);
  if (!match?.[1]) return [];
  const subtopico = decodeURIComponent(match[1]);
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug')
      .eq('subtopico', subtopico)
      .limit(50);
    if (error) {
      logger.warn('resolveSubtopicoInventory failed', {
        reviewUnitId,
        message: error.message,
      });
      return [];
    }
    const rows = (data ?? []) as ModuloInventoryRow[];
    return rows
      .map((r) => (typeof r.modulo_slug === 'string' ? r.modulo_slug.trim() : ''))
      .filter(Boolean);
  } catch (err) {
    logger.warn('resolveSubtopicoInventory exception', { reviewUnitId, err });
    return [];
  }
}
