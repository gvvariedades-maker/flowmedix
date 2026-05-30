import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import { fetchVitrineFacetsFromRpc } from '@/lib/vitrine/rpc';
import { logger } from '@/lib/logger';
import type { ModuloEstudoRow } from '@/lib/vitrineFilters';
import type { VitrineFacets } from '@/lib/vitrine/types';

/** Placeholder quando facets vêm de `/api/vitrine/facets` (campo legado na página). */
export const EMPTY_VITRINE_FACETS: VitrineFacets = { bancas: [], assuntos: [] };

export type GetVitrineFacetsParams = {
  userId: string;
  bancas?: string[];
  isAdmin?: boolean;
  /** @deprecated use bancas */
  banca?: string;
};

/**
 * Facets da vitrine: admin e RPC vazio usam catálogo JS (mesma regra da página).
 */
export async function getVitrineFacets(params: GetVitrineFacetsParams): Promise<VitrineFacets> {
  const { userId, isAdmin = false } = params;
  const bancas =
    params.bancas?.length
      ? params.bancas
      : params.banca?.trim()
        ? [params.banca.trim()]
        : undefined;

  if (!isAdmin) {
    try {
      const rpcFacets = await fetchVitrineFacetsFromRpc({ userId, bancas });
      const rpcHasResults =
        rpcFacets.bancas.length > 0 || rpcFacets.assuntos.length > 0;

      if (rpcHasResults) {
        return rpcFacets;
      }

      logger.warn('RPC get_vitrine_facets vazio; fallback JS', { userId, bancas });
    } catch (err) {
      logger.warn('get_vitrine_facets indisponível; fallback JS', {
        userId,
        bancas,
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  const modulos = (await resolveAccessibleModulosWhenEmpty(userId, isAdmin)) as ModuloEstudoRow[];
  return buildVitrineFacets(modulos, { bancas });
}

/**
 * Facets para filtros da vitrine.
 * `assuntos` respeita `banca` quando informada (dropdown coerente).
 */
export function buildVitrineFacets(
  modulos: ModuloEstudoRow[],
  filters?: { banca?: string; bancas?: string[] },
): VitrineFacets {
  const bancas = [...new Set(modulos.map((m) => m.banca).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );

  const bancaSet = filters?.bancas?.length
    ? filters.bancas.map((b) => b.trim()).filter(Boolean)
    : filters?.banca?.trim()
      ? [filters.banca.trim()]
      : [];
  const baseForAssuntos = bancaSet.length
    ? modulos.filter((m) => bancaSet.includes(m.banca))
    : modulos;

  const assuntos = [
    ...new Set(baseForAssuntos.map((m) => m.titulo_aula).filter((n): n is string => Boolean(n))),
  ].sort((a, b) => a.localeCompare(b));

  return { bancas, assuntos };
}
