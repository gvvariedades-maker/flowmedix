import { buildEstudarCacheKey } from '@/lib/estudar/navigation';

type PayloadRouteFields = {
  moduloSlug?: string | null;
  vitrineQuerySuffix?: string;
};

/** Chave de cache do payload em memória (slug + query de contexto). */
export function buildPayloadCacheKey(payload: PayloadRouteFields): string {
  if (!payload.moduloSlug) return '';
  return buildEstudarCacheKey(
    `/estudar/${payload.moduloSlug}`,
    new URLSearchParams((payload.vitrineQuerySuffix ?? '').replace(/^\?/, '')),
  );
}

/**
 * `true` quando a entrada de cache é coerente com a chave.
 * Evita SINCRONIZANDO: chave com `disciplina` + payload sem `vitrineQuerySuffix`.
 */
export function payloadMatchesCacheKey(
  payload: PayloadRouteFields | null | undefined,
  cacheKey: string,
): boolean {
  if (!payload?.moduloSlug || !cacheKey) return false;
  return buildPayloadCacheKey(payload) === cacheKey;
}

/** `true` quando o payload exibido corresponde à rota efetiva (pathname + query). */
export function estudarPayloadMatchesRoute(
  payload: PayloadRouteFields | null | undefined,
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  if (!payload?.moduloSlug) return false;
  const routeCacheKey = buildEstudarCacheKey(pathname, searchParams);
  return routeCacheKey === buildPayloadCacheKey(payload);
}
