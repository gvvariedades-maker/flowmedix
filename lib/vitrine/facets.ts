import { getModulosEstudoVitrineForUserCached } from '@/lib/cache';
import { fetchVitrineFacetsFromRpc } from '@/lib/vitrine/rpc';
import { logger } from '@/lib/logger';
import type { ModuloEstudoRow } from '@/lib/vitrineFilters';
import type { VitrineFacets } from '@/lib/vitrine/types';

/** Placeholder quando facets vêm de `/api/vitrine/facets` (campo legado na página). */
export const EMPTY_VITRINE_FACETS: VitrineFacets = { bancas: [], assuntos: [] };

export type GetVitrineFacetsParams = {
  userId: string;
  banca?: string;
};

/**
 * Facets da vitrine: tenta RPC Postgres; em erro, fallback JS sobre catálogo do usuário.
 */
export async function getVitrineFacets(params: GetVitrineFacetsParams): Promise<VitrineFacets> {
  const { userId, banca } = params;

  try {
    return await fetchVitrineFacetsFromRpc({ userId, banca });
  } catch (err) {
    logger.warn('get_vitrine_facets indisponível; fallback JS', {
      userId,
      banca,
      error: err instanceof Error ? err.message : err,
    });
  }

  const modulos = (await getModulosEstudoVitrineForUserCached(userId)) as ModuloEstudoRow[];
  return buildVitrineFacets(modulos, { banca });
}

/**
 * Facets para filtros da vitrine.
 * `assuntos` respeita `banca` quando informada (dropdown coerente).
 */
export function buildVitrineFacets(
  modulos: ModuloEstudoRow[],
  filters?: { banca?: string },
): VitrineFacets {
  const bancas = [...new Set(modulos.map((m) => m.banca).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );

  const bancaFilter = filters?.banca?.trim();
  const baseForAssuntos = bancaFilter
    ? modulos.filter((m) => m.banca === bancaFilter)
    : modulos;

  const assuntos = [
    ...new Set(baseForAssuntos.map((m) => m.titulo_aula).filter((n): n is string => Boolean(n))),
  ].sort((a, b) => a.localeCompare(b));

  return { bancas, assuntos };
}
