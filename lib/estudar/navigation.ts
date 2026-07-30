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

/** `true` quando o pathname aponta para a vitrine (`/estudar` sem slug). */
export function isEstudarVitrinePathname(pathname: string): boolean {
  return parseEstudarSlugFromPathname(pathname) === null;
}

/** `true` quando `window.location` reflete uma rota `/estudar` (após replaceState ou navegação real). */
export function isBrowserOnEstudarRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname;
  return pathname === '/estudar' || pathname.startsWith('/estudar/');
}

/** Lê o slug da questão na barra de endereço (SSR-safe: retorna `null` sem `window`). */
export function parseEstudarSlugFromBrowserPathname(): string | null {
  if (typeof window === 'undefined') return null;
  if (!isBrowserOnEstudarRoute()) return null;
  return parseEstudarSlugFromPathname(window.location.pathname);
}

const VITRINE_RETURN_ELIGIBLE_KEY = 'avant.estudar.vitrineReturnEligible';

/** Marca navegação interna vitrine → questão (habilita `history.back` no dismiss). */
export function markEstudarVitrineReturnEligible(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(VITRINE_RETURN_ELIGIBLE_KEY, '1');
  } catch {
    /* storage indisponível */
  }
}

export function clearEstudarVitrineReturnEligible(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(VITRINE_RETURN_ELIGIBLE_KEY);
  } catch {
    /* storage indisponível */
  }
}

function isEstudarVitrineReturnEligible(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(VITRINE_RETURN_ELIGIBLE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Voltar interno pode usar `history.back()` quando há entrada anterior (ex.: vitrine → questão).
 * Não aplica a retornos para plano/caderno nem cold load direto na questão.
 */
export function canDismissEstudarViaHistoryBack(
  ctx: EstudarVitrineReturnContext = {},
): boolean {
  if (ctx.fromPlano || ctx.fromRevisoes || ctx.fromCaderno) return false;
  if (typeof window === 'undefined') return false;
  if (window.history.length <= 1) return false;
  if (!isBrowserOnEstudarRoute()) return false;
  return isEstudarVitrineReturnEligible();
}

/**
 * Evita reidratar payload de questão quando o browser já está na vitrine
 * mas o App Router ainda reporta `/estudar/[slug]` (pós-dismiss com soft-nav).
 */
export function shouldSkipEstudarRoutePayloadSync(nextSlug: string | null): boolean {
  if (!nextSlug) return true;
  if (!isBrowserOnEstudarRoute()) return false;
  return parseEstudarSlugFromBrowserPathname() === null;
}

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
  /** Fila FSRS `/revisoes-hoje` (`?from=revisoes`). */
  fromRevisoes?: boolean;
  fromCaderno?: string;
  vitrineQuerySuffix?: string;
};

/** Destino ao fechar questão (modal, botão Vitrine) — preserva filtros da vitrine. */
export function buildEstudarVitrineHref(ctx: EstudarVitrineReturnContext = {}): string {
  // C2: superfícies de revisão descontinuadas → Vitrine (não encadear em rotas stub).
  if (ctx.fromRevisoes || ctx.fromPlano) {
    return '/estudar';
  }
  if (ctx.fromCaderno) return '/cadernos';
  const suffix = ctx.vitrineQuerySuffix?.trim() ?? '';
  return `/estudar${suffix}`;
}
