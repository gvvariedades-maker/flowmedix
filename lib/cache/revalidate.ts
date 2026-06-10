import { logger } from '@/lib/logger';
import {
  getVitrineFacetsFilterTag,
  getVitrineFacetsUserFilterTag,
  getVitrineFacetsUserTag,
  getVitrinePageFilterTag,
  getVitrinePageUserFilterTag,
  getVitrinePageUserTag,
  type VitrineFacetsCacheFilters,
  type VitrinePageCacheFilters,
} from '@/lib/cache/vitrineTags';

/**
 * Perfil de revalidação imediata (Next.js 16+).
 * @see https://nextjs.org/docs/app/api-reference/functions/revalidateTag
 */
export const CACHE_REVALIDATE_IMMEDIATE = { expire: 0 } as const;

export async function revalidateCache(tags: string[]) {
  const { revalidateTag } = await import('next/cache');

  for (const tag of tags) {
    revalidateTag(tag, CACHE_REVALIDATE_IMMEDIATE);
    logger.info('Cache invalidated', { tag });
  }
}

export const invalidateModulosCache = () =>
  revalidateCache(['modulos-estudo', 'catalog-stats', 'vitrine-page', 'vitrine-facets']);

export const invalidateUserModulosCache = (userId: string) =>
  revalidateCache([
    'modulos-estudo',
    'user',
    `user-${userId}`,
    getVitrinePageUserTag(userId),
    getVitrineFacetsUserTag(userId),
  ]);

export const invalidateQuestoesCache = () => revalidateCache(['questoes', 'estudar-questao']);

export const invalidateQuestaoSlugCache = (slug: string) => {
  const trimmed = slug.trim();
  if (!trimmed) return Promise.resolve();
  return revalidateCache(['questoes', 'estudar-questao', `questao-${trimmed}`]);
};

export const invalidateQuestaoSlugsCache = (slugs: string[]) => {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
  if (unique.length === 0) return Promise.resolve();
  return revalidateCache([
    'questoes',
    'estudar-questao',
    ...unique.map((slug) => `questao-${slug}`),
  ]);
};

export const invalidateHistoricoCache = () =>
  revalidateCache(['historico', 'analytics', 'vitrine-page']);

export const invalidateHistoricoUserCache = (userId: string) =>
  revalidateCache([
    'historico',
    'analytics',
    `user-${userId}`,
    getVitrinePageUserTag(userId),
    getVitrineFacetsUserTag(userId),
  ]);

export const invalidateNotebookActivationCache = (userId: string) =>
  revalidateCache(['notebook-activation', 'user', `user-${userId}`]);

export const invalidateVitrinePageCache = (
  userId?: string,
  filters?: VitrinePageCacheFilters,
) => {
  if (!userId) return revalidateCache(['vitrine-page']);
  const tags = ['vitrine-page', getVitrinePageUserTag(userId)];
  if (filters) {
    tags.push(getVitrinePageFilterTag(filters), getVitrinePageUserFilterTag(userId, filters));
  }
  return revalidateCache(tags);
};

export const invalidateVitrineFacetsCache = (
  userId?: string,
  filters?: VitrineFacetsCacheFilters,
) => {
  if (!userId) return revalidateCache(['vitrine-facets']);
  const tags = ['vitrine-facets', getVitrineFacetsUserTag(userId)];
  if (filters) {
    tags.push(getVitrineFacetsFilterTag(filters), getVitrineFacetsUserFilterTag(userId, filters));
  }
  return revalidateCache(tags);
};

export type { VitrineFacetsCacheFilters, VitrinePageCacheFilters };
