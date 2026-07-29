/**
 * Inventário de slugs por review_unit (R4) — fora de page.tsx (gate RSC).
 */

import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

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
      .select('slug')
      .eq('subtopico', subtopico)
      .limit(50);
    if (error) {
      logger.warn('resolveSubtopicoInventory failed', {
        reviewUnitId,
        message: error.message,
      });
      return [];
    }
    return (data ?? [])
      .map((r) => (typeof r.slug === 'string' ? r.slug : ''))
      .filter(Boolean);
  } catch (err) {
    logger.warn('resolveSubtopicoInventory exception', { reviewUnitId, err });
    return [];
  }
}
