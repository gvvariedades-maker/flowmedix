/**
 * Utilitários de URL e chave de cache para navegação em /estudar/[slug].
 */

import type { EstudarQuestaoLayers } from '@/lib/estudar/questaoLayers';

export type BuildEstudarQuestaoApiUrlOptions = {
  /** Prefetch client usa `core` (menor); estudo reverso busca `full` sob demanda. */
  layers?: EstudarQuestaoLayers;
};

export function buildEstudarHref(slugComQuery: string): string {
  const trimmed = slugComQuery.trim();
  if (!trimmed) return '/estudar';
  return `/estudar/${trimmed}`;
}

export type EstudarRouteSnapshot = {
  pathname: string;
  /** Query string com `?` ou vazio. */
  search: string;
};

/**
 * Atualiza a URL no browser sem `router.replace` (evita RSC na troca Q1→Q2 no caderno).
 * Retorna pathname + search para o shell alinhar cache key ao payload em memória.
 */
export function applySoftEstudarHistoryUrl(href: string): EstudarRouteSnapshot {
  const trimmed = href.trim();
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const qIndex = path.indexOf('?');
  const pathname = qIndex === -1 ? path : path.slice(0, qIndex);
  const search = qIndex === -1 ? '' : path.slice(qIndex);

  if (typeof window !== 'undefined') {
    window.history.replaceState(window.history.state, '', pathname + search);
  }

  return { pathname, search };
}

/** Slug da questão em `/estudar/[slug]`; `null` na vitrine (`/estudar` apenas). */
export function parseEstudarSlugFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'estudar' || segments.length < 2) return null;
  const slug = segments[1]?.trim();
  return slug || null;
}

export function parseEstudarSlugComQuery(slugComQuery: string): {
  slug: string;
  search: string;
} {
  const trimmed = slugComQuery.trim();
  const qIndex = trimmed.indexOf('?');
  if (qIndex === -1) {
    return { slug: trimmed, search: '' };
  }
  return {
    slug: trimmed.slice(0, qIndex),
    search: trimmed.slice(qIndex + 1),
  };
}

/** Normaliza query string para chave de cache estável (params ordenados). */
export function normalizeSearchForCacheKey(search: string): string {
  if (!search.trim()) return '';
  const params = new URLSearchParams(search);
  const sorted = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  return new URLSearchParams(sorted).toString();
}

/**
 * Chave estável: slug + contexto de query (plano, caderno, vitrine).
 * pathname esperado: /estudar/[slug]
 */
export function buildEstudarCacheKey(
  pathname: string,
  searchParams: URLSearchParams,
): string {
  const segments = pathname.split('/').filter(Boolean);
  const slug = segments[segments.length - 1] ?? '';
  const search = searchParams.toString();
  const normalized = normalizeSearchForCacheKey(search);
  return normalized ? `${slug}|${normalized}` : slug;
}

export function buildEstudarCacheKeyFromSlugComQuery(slugComQuery: string): string {
  const { slug, search } = parseEstudarSlugComQuery(slugComQuery);
  const normalized = normalizeSearchForCacheKey(search);
  return normalized ? `${slug}|${normalized}` : slug;
}

export function buildEstudarCacheKeyFromHref(href: string): string {
  const path = href.replace(/^\//, '');
  const match = path.match(/^estudar\/([^?]+)(?:\?(.*))?$/);
  if (!match) return '';
  const slug = match[1];
  const search = match[2] ?? '';
  const normalized = normalizeSearchForCacheKey(search);
  return normalized ? `${slug}|${normalized}` : slug;
}

/** Query string para `GET /api/estudar/questao` a partir de `slugComQuery`. */
export function buildEstudarQuestaoApiSearch(
  slugComQuery: string,
  options?: BuildEstudarQuestaoApiUrlOptions,
): string {
  const { slug, search } = parseEstudarSlugComQuery(slugComQuery);
  const params = new URLSearchParams(search);
  params.set('slug', slug);
  if (options?.layers) {
    params.set('layers', options.layers);
  }
  return params.toString();
}

export function buildEstudarQuestaoApiUrl(
  slugComQuery: string,
  options?: BuildEstudarQuestaoApiUrlOptions,
): string {
  return `/api/estudar/questao?${buildEstudarQuestaoApiSearch(slugComQuery, options)}`;
}

export type EstudarVitrineReturnContext = {
  fromPlano?: boolean;
  fromCaderno?: string;
  vitrineQuerySuffix?: string;
};

/** Destino ao fechar questão (modal, botão Vitrine) — preserva filtros da vitrine. */
export function buildEstudarVitrineHref(ctx: EstudarVitrineReturnContext = {}): string {
  if (ctx.fromPlano) return '/plano-diario';
  if (ctx.fromCaderno) return '/cadernos';
  const suffix = ctx.vitrineQuerySuffix?.trim() ?? '';
  return `/estudar${suffix}`;
}
