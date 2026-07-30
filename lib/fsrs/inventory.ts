/**
 * Inventário de slugs por review_unit (R4) — fora de page.tsx (gate RSC).
 * Fonte: coluna `subtopico` e, se vazia, `conteudo_json.meta.subtopico` (ADR).
 */

import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/** Row tipada de `modulos_estudo` para inventário de revisão. */
export type ModuloInventoryRow = {
  modulo_slug: string;
};

function mapInventorySlugs(data: unknown): string[] {
  const rows = (Array.isArray(data) ? data : []) as ModuloInventoryRow[];
  return rows
    .map((r) => (typeof r.modulo_slug === 'string' ? r.modulo_slug.trim() : ''))
    .filter(Boolean);
}

/**
 * Resolve slugs (`modulo_slug`) do subtópico embutido em `review_unit_id`.
 * Unidades sem sufixo `:subtopico=` → inventário vazio.
 * Preferência: coluna `subtopico`; fallback ADR: `conteudo_json.meta.subtopico`.
 */
export async function resolveSubtopicoInventoryFromReviewUnit(
  reviewUnitId: string,
): Promise<string[]> {
  const match = /:subtopico=([^:]+)$/.exec(reviewUnitId);
  if (!match?.[1]) return [];
  const subtopico = decodeURIComponent(match[1]);
  try {
    const supabase = await createServerSupabase();

    const byColumn = await supabase
      .from('modulos_estudo')
      .select('modulo_slug')
      .eq('subtopico', subtopico)
      .limit(50);
    if (byColumn.error) {
      logger.warn('resolveSubtopicoInventory failed', {
        reviewUnitId,
        message: byColumn.error.message,
        source: 'column',
      });
      return [];
    }
    const columnSlugs = mapInventorySlugs(byColumn.data);
    if (columnSlugs.length > 0) return columnSlugs;

    const byMeta = await supabase
      .from('modulos_estudo')
      .select('modulo_slug')
      .filter('conteudo_json->meta->>subtopico', 'eq', subtopico)
      .limit(50);
    if (byMeta.error) {
      logger.warn('resolveSubtopicoInventory failed', {
        reviewUnitId,
        message: byMeta.error.message,
        source: 'meta',
      });
      return [];
    }
    return mapInventorySlugs(byMeta.data);
  } catch (err) {
    logger.warn('resolveSubtopicoInventory exception', { reviewUnitId, err });
    return [];
  }
}
