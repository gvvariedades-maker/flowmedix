import {
  getModulosEstudoVitrineForUserCached,
  getHistoricoQuestoesForSlugsCached,
} from '@/lib/cache';
import { fetchAccessibleModulosForNav } from '@/lib/concursos/entitlements';
import {
  attachHistoricoStats,
  filterModulosLikeVitrine,
  vitrineFiltersToSqlNavFilters,
  type ModuloEstudoRow,
} from '@/lib/vitrineFilters';
import { buildVitrineGroups } from '@/lib/vitrine/buildGroups';
import { buildVitrineFacets, EMPTY_VITRINE_FACETS } from '@/lib/vitrine/facets';
import { VITRINE_ASSUNTOS_POR_PAGINA } from '@/lib/vitrine/constants';
import { fetchVitrinePageFromRpc } from '@/lib/vitrine/rpc';
import { logger } from '@/lib/logger';
import type { VitrinePageResponse } from '@/lib/vitrine/types';

export type VitrineListFilters = {
  banca?: string;
  assunto?: string;
  q?: string;
};

export type GetVitrinePageParams = {
  userId: string;
  page: number;
  filters?: VitrineListFilters;
};

function paginateGroups<T>(items: T[], page: number, perPage: number): { slice: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const pageClamped = Math.min(Math.max(1, page), totalPages);
  const start = (pageClamped - 1) * perPage;
  return {
    slice: items.slice(start, start + perPage),
    totalPages,
  };
}

function hasSearchQuery(filters: VitrineListFilters): boolean {
  return Boolean(filters.q?.trim());
}

async function loadModulosForVitrine(
  userId: string,
  filters: VitrineListFilters,
): Promise<ModuloEstudoRow[]> {
  const sqlFilters = vitrineFiltersToSqlNavFilters(filters);
  if (sqlFilters) {
    return (await fetchAccessibleModulosForNav(userId, sqlFilters)) as ModuloEstudoRow[];
  }
  return (await getModulosEstudoVitrineForUserCached(userId)) as ModuloEstudoRow[];
}

async function getVitrinePageViaJs(params: GetVitrinePageParams): Promise<VitrinePageResponse> {
  const { userId, page, filters = {} } = params;

  const modulosRaw = await loadModulosForVitrine(userId, filters);
  const facets = buildVitrineFacets(modulosRaw, { banca: filters.banca });

  const modulosComStatsPlaceholder = modulosRaw.map((m) => ({
    ...m,
    estudoReversoConcluido: false,
    stats: { acertos: 0, total: 0, percentual: 0, priorityScore: 0 },
  }));

  const filtered = filterModulosLikeVitrine(modulosComStatsPlaceholder, filters);
  const slugs = filtered.map((m) => m.modulo_slug);
  const historico = await getHistoricoQuestoesForSlugsCached(userId, slugs);

  const withStats = attachHistoricoStats(
    filtered.map(({ estudoReversoConcluido: _e, stats: _s, ...m }) => m),
    historico,
  );

  const allGroups = buildVitrineGroups(withStats);
  const { slice, totalPages } = paginateGroups(allGroups, page, VITRINE_ASSUNTOS_POR_PAGINA);
  const pageClamped = Math.min(Math.max(1, page), totalPages);

  return {
    groups: slice,
    facets,
    pagination: {
      page: pageClamped,
      perPage: VITRINE_ASSUNTOS_POR_PAGINA,
      totalGroups: allGroups.length,
      totalPages,
    },
    totalModulosFiltrados: withStats.length,
  };
}

/**
 * Página da vitrine com facets e grupos paginados por assunto.
 * Sem `q`: tenta RPC Postgres; em erro, fallback JS. Com `q`: pipeline JS.
 */
export async function getVitrinePage(params: GetVitrinePageParams): Promise<VitrinePageResponse> {
  const { userId, page, filters = {} } = params;

  if (!hasSearchQuery(filters)) {
    try {
      const rpcPage = await fetchVitrinePageFromRpc({ userId, page, filters });

      return {
        ...rpcPage,
        facets: EMPTY_VITRINE_FACETS,
      };
    } catch (err) {
      logger.warn('get_vitrine_page indisponível; pipeline JS', {
        userId,
        page,
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  return getVitrinePageViaJs(params);
}
