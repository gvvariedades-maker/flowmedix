import { buildEstudarCacheKeyFromSlugComQuery } from '@/lib/estudar/navigation';
import { recordPrefetchChain, type PrefetchChainStoppedReason } from '@/lib/estudar/navigationTelemetry';

const MIN_DEPTH = 0;

export const PREFETCH_FORWARD_DEPTH = 2;

type PrefetchablePayload = {
  proximaSlug?: string | null;
};

type WarmForwardChainDeps = {
  fetchPayloadIntoCache: (slugComQuery: string) => Promise<PrefetchablePayload | null>;
  prefetchRoute: (href: string) => void;
  buildHref: (slugComQuery: string) => string;
};

export async function warmForwardChain(
  startSlugComQuery: string,
  depth: number,
  deps: WarmForwardChainDeps,
): Promise<string[]> {
  const normalizedDepth = Math.max(MIN_DEPTH, Math.floor(depth));
  if (!startSlugComQuery || normalizedDepth === 0) return [];

  const visited = new Set<string>([startSlugComQuery]);
  const prefetchedSlugs: string[] = [];
  let currentSlug = startSlugComQuery;
  let stoppedReason: PrefetchChainStoppedReason = 'depth';

  const startCacheKey = buildEstudarCacheKeyFromSlugComQuery(startSlugComQuery);

  for (let i = 0; i < normalizedDepth; i += 1) {
    const payload = await deps.fetchPayloadIntoCache(currentSlug);
    const nextSlug = payload?.proximaSlug;

    if (!nextSlug) {
      stoppedReason = 'no_proxima';
      break;
    }
    if (nextSlug === currentSlug || visited.has(nextSlug)) {
      stoppedReason = 'loop';
      break;
    }

    deps.prefetchRoute(deps.buildHref(nextSlug));
    prefetchedSlugs.push(nextSlug);
    visited.add(nextSlug);
    currentSlug = nextSlug;
  }

  recordPrefetchChain(startCacheKey, {
    depth: normalizedDepth,
    slugsPrefetched: prefetchedSlugs,
    stoppedReason,
  });

  return prefetchedSlugs;
}
