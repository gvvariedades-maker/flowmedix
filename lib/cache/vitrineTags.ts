import { createHash } from 'crypto';

export type VitrinePageCacheFilters = {
  bancas?: string[];
  assuntos?: string[];
  q?: string;
  disciplina?: string;
};

export type VitrineFacetsCacheFilters = {
  bancas?: string[];
};

export function normalizeVitrineArrayFilter(values?: string[]): string {
  if (!values?.length) return '';
  return [...values].map((v) => v.trim()).filter(Boolean).sort().join('\u0001');
}

export function normalizeVitrineTextFilter(value?: string): string {
  return value?.trim() || '';
}

export function createVitrineFilterHash(parts: readonly string[]): string {
  return createHash('sha256').update(parts.join('\0')).digest('hex').slice(0, 16);
}

const VITRINE_PAGE_USER_TAG_PREFIX = 'vitrine-page-user';
const VITRINE_PAGE_FILTER_TAG_PREFIX = 'vitrine-page-filter';
const VITRINE_PAGE_USER_FILTER_TAG_PREFIX = 'vitrine-page-user-filter';
const VITRINE_FACETS_USER_TAG_PREFIX = 'vitrine-facets-user';
const VITRINE_FACETS_FILTER_TAG_PREFIX = 'vitrine-facets-filter';
const VITRINE_FACETS_USER_FILTER_TAG_PREFIX = 'vitrine-facets-user-filter';

export function getVitrinePageFiltersHash(filters: VitrinePageCacheFilters = {}): string {
  return createVitrineFilterHash([
    normalizeVitrineArrayFilter(filters.bancas),
    normalizeVitrineArrayFilter(filters.assuntos),
    normalizeVitrineTextFilter(filters.q),
    normalizeVitrineTextFilter(filters.disciplina),
  ]);
}

export function getVitrinePageUserTag(userId: string): string {
  return `${VITRINE_PAGE_USER_TAG_PREFIX}-${userId}`;
}

export function getVitrinePageFilterTag(filters: VitrinePageCacheFilters = {}): string {
  return `${VITRINE_PAGE_FILTER_TAG_PREFIX}-${getVitrinePageFiltersHash(filters)}`;
}

export function getVitrinePageUserFilterTag(
  userId: string,
  filters: VitrinePageCacheFilters = {},
): string {
  return `${VITRINE_PAGE_USER_FILTER_TAG_PREFIX}-${userId}-${getVitrinePageFiltersHash(filters)}`;
}

export function getVitrineFacetsFiltersHash(filters: VitrineFacetsCacheFilters = {}): string {
  return createVitrineFilterHash([normalizeVitrineArrayFilter(filters.bancas)]);
}

export function getVitrineFacetsUserTag(userId: string): string {
  return `${VITRINE_FACETS_USER_TAG_PREFIX}-${userId}`;
}

export function getVitrineFacetsFilterTag(filters: VitrineFacetsCacheFilters = {}): string {
  return `${VITRINE_FACETS_FILTER_TAG_PREFIX}-${getVitrineFacetsFiltersHash(filters)}`;
}

export function getVitrineFacetsUserFilterTag(
  userId: string,
  filters: VitrineFacetsCacheFilters = {},
): string {
  return `${VITRINE_FACETS_USER_FILTER_TAG_PREFIX}-${userId}-${getVitrineFacetsFiltersHash(filters)}`;
}

export function vitrinePageCacheKey(
  userId: string,
  page: number,
  filters: VitrinePageCacheFilters,
  isAdmin = false,
): string {
  const filtersHash = getVitrinePageFiltersHash(filters);
  const raw = `${userId}\0${page}\0${filtersHash}\0${isAdmin}`;
  const hash = createHash('sha256').update(raw).digest('hex').slice(0, 16);
  return `vitrine-page-v2-${hash}`;
}

export function vitrineFacetsCacheKey(
  userId: string,
  filters: VitrineFacetsCacheFilters = {},
  isAdmin = false,
): string {
  const filtersHash = getVitrineFacetsFiltersHash(filters);
  const raw = `${userId}\0${filtersHash}\0${isAdmin}`;
  const hash = createHash('sha256').update(raw).digest('hex').slice(0, 16);
  return `vitrine-facets-v2-${hash}`;
}
