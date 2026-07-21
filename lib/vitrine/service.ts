import {
  getAccessibleModulosForNavCached,
  getModulosEstudoVitrineForUserCached,
  getHistoricoQuestoesForSlugsCached,
  getModulosEstudoCached,
} from '@/lib/cache';
import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import {
  attachHistoricoStats,
  filterModulosLikeVitrine,
  vitrineFiltersToSqlNavFilters,
  type ModuloEstudoRow,
} from '@/lib/vitrineFilters';
import { buildVitrineGroups } from '@/lib/vitrine/buildGroups';
import { buildVitrineFacets, getVitrineFacets } from '@/lib/vitrine/facets';
import { VITRINE_ASSUNTOS_POR_PAGINA } from '@/lib/vitrine/constants';
import { fetchVitrinePageFromRpc } from '@/lib/vitrine/rpc';
import { fetchSlideCountsByModuloIds } from '@/lib/vitrine/slideCounts';
import {
  buildDisciplinaSummaries,
  parseVitrineDisciplina,
  resolveVitrineDisciplinaId,
  type VitrineDisciplinaId,
} from '@/lib/vitrine/disciplina';
import { logApiStrategy } from '@/lib/api/logApiStrategy';
import { logger } from '@/lib/logger';
import { SCALE_LIMITS } from '@/lib/scale/constants';
import type { VitrinePageResponse } from '@/lib/vitrine/types';
import {
  applyVitrineQualityGateToPage,
  filterModulosByVitrineQualityGate,
  filterVitrineFacetsByQualityGate,
} from '@/lib/catalogMigration/vitrineQualityGate';

export type VitrineListFilters = {
  bancas?: string[];
  assuntos?: string[];
  /** @deprecated use bancas */
  banca?: string;
  /** @deprecated use assuntos */
  assunto?: string;
  q?: string;
  disciplina?: VitrineDisciplinaId;
};

export type GetVitrinePageParams = {
  userId: string;
  page: number;
  filters?: VitrineListFilters;
  isAdmin?: boolean;
};

function vitrineHasActiveFilters(filters: VitrineListFilters): boolean {
  const normalized = normalizeVitrineListFilters(filters);
  return Boolean(
    normalized.bancas?.length || normalized.assuntos?.length || normalized.q,
  );
}

function normalizeVitrineListFilters(filters: VitrineListFilters = {}): VitrineListFilters {
  const bancas = [
    ...(filters.bancas?.map((b) => b.trim()).filter(Boolean) ?? []),
    ...(filters.banca?.trim() ? [filters.banca.trim()] : []),
  ];
  const assuntos = [
    ...(filters.assuntos?.map((a) => a.trim()).filter(Boolean) ?? []),
    ...(filters.assunto?.trim() ? [filters.assunto.trim()] : []),
  ];
  const disciplina = parseVitrineDisciplina(filters.disciplina);
  return {
    bancas: bancas.length ? [...new Set(bancas)] : undefined,
    assuntos: assuntos.length ? [...new Set(assuntos)] : undefined,
    q: filters.q?.trim() || undefined,
    ...(disciplina ? { disciplina } : {}),
  };
}

const normalizeFiltersForLog = normalizeVitrineListFilters;

function paginateGroups<T>(items: T[], page: number, perPage: number): { slice: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const pageClamped = Math.min(Math.max(1, page), totalPages);
  const start = (pageClamped - 1) * perPage;
  return {
    slice: items.slice(start, start + perPage),
    totalPages,
  };
}

/**
 * Contagens por disciplina sem historico (caminho RPC).
 * Progresso fica 0 até o pipeline JS (filtro disciplina / fallback).
 */
async function buildDisciplinaSummariesLite(
  userId: string,
  filters: VitrineListFilters,
  isAdmin: boolean,
) {
  const modulosRaw = filterModulosByVitrineQualityGate(
    await loadModulosForVitrine(userId, { ...filters, disciplina: undefined }, isAdmin),
    { isAdmin },
  );
  const placeholders = modulosRaw.map((m) => ({
    ...m,
    estudoReversoConcluido: false,
    stats: { acertos: 0, total: 0, percentual: 0, priorityScore: 0 },
  }));
  const filtered = filterModulosLikeVitrine(placeholders, {
    bancas: filters.bancas,
    assuntos: filters.assuntos,
    q: filters.q,
  });
  const byAssunto = new Map<
    string,
    { modulo_nome: string; totalQuestoes: number }
  >();
  for (const m of filtered) {
    const key = m.titulo_aula || 'Sem subtópico';
    const prev = byAssunto.get(key);
    if (prev) {
      prev.totalQuestoes += 1;
    } else {
      byAssunto.set(key, {
        modulo_nome: m.modulo_nome || 'Geral',
        totalQuestoes: 1,
      });
    }
  }
  const groups = [...byAssunto.entries()].map(([titulo_aula, info]) => ({
    titulo_aula,
    modulo_nome: info.modulo_nome,
    banca: '',
    questoes: [],
    acertos: 0,
    erros: 0,
    totalResolvidas: 0,
    totalQuestoes: info.totalQuestoes,
    totalNeuroSlides: 0,
    trabalhadas: 0,
    percentual: 0,
    firstSlug: titulo_aula,
  }));
  return buildDisciplinaSummaries(groups);
}

async function loadModulosForVitrine(
  userId: string,
  filters: VitrineListFilters,
  isAdmin = false,
): Promise<ModuloEstudoRow[]> {
  const sqlFilters = vitrineFiltersToSqlNavFilters(filters);
  if (sqlFilters) {
    const modulos = (await getAccessibleModulosForNavCached(userId, sqlFilters)) as ModuloEstudoRow[];
    logger.warn('loadModulosForVitrine: sqlFilters result', { count: modulos.length, isAdmin });
    if (modulos.length > 0 || !isAdmin) {
      return modulos;
    }
  }
  if (isAdmin) {
    const { createServerSupabase } = await import('@/lib/supabase/server');
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, modulo_slug, modulo_nome, titulo_aula, banca, created_at, avant_codigo')
      .order('created_at', { ascending: false })
      .limit(SCALE_LIMITS.VITRINE_MODULOS);
    
    if (error) {
      logger.error('loadModulosForVitrine: admin DB bypass error', error);
      return (await getModulosEstudoCached()) as ModuloEstudoRow[];
    }
    const modulos = (data ?? []) as ModuloEstudoRow[];
    logger.warn('loadModulosForVitrine: admin DB bypass result', { count: modulos.length });
    return modulos;
  }
  const modulos = (await getModulosEstudoVitrineForUserCached(userId)) as ModuloEstudoRow[];
  logger.warn('loadModulosForVitrine: user vitrine result', { count: modulos.length });
  if (modulos.length > 0) return modulos;
  const emptyFallback = (await resolveAccessibleModulosWhenEmpty(userId, false)) as ModuloEstudoRow[];
  logger.warn('loadModulosForVitrine: empty fallback result', { count: emptyFallback.length });
  return emptyFallback;
}

async function getVitrinePageViaJs(params: GetVitrinePageParams): Promise<VitrinePageResponse> {
  const { userId, page, isAdmin = false } = params;
  const filters = normalizeVitrineListFilters(params.filters);

  logger.warn('getVitrinePageViaJs started', { userId, isAdmin, filters });

  const modulosRaw = filterModulosByVitrineQualityGate(
    await loadModulosForVitrine(userId, filters, isAdmin),
    { isAdmin },
  );
  logger.warn('getVitrinePageViaJs: loadModulosForVitrine result', { count: modulosRaw.length });

  const facets = buildVitrineFacets(modulosRaw, { bancas: filters.bancas });

  const modulosComStatsPlaceholder = modulosRaw.map((m) => ({
    ...m,
    estudoReversoConcluido: false,
    stats: { acertos: 0, total: 0, percentual: 0, priorityScore: 0 },
  }));

  /** Filtros sem disciplina — resumo do picker precisa das duas prateleiras. */
  const filtersForSummaries = { ...filters, disciplina: undefined };
  const filteredForSummaries = filterModulosLikeVitrine(
    modulosComStatsPlaceholder,
    filtersForSummaries,
  );

  logger.warn('getVitrinePageViaJs: filtered count', {
    count: filteredForSummaries.length,
    disciplina: filters.disciplina ?? null,
  });

  const slugsForStats = filteredForSummaries.map((m) => m.modulo_slug);
  const modulosForStats = filteredForSummaries;
  const [historico, slideCounts] = await Promise.all([
    getHistoricoQuestoesForSlugsCached(userId, slugsForStats),
    fetchSlideCountsByModuloIds(modulosForStats.map((m) => m.id)),
  ]);

  const withStatsAll = attachHistoricoStats(
    modulosForStats.map(({ estudoReversoConcluido: _e, stats: _s, ...m }) => m),
    historico,
  ).map((modulo) => ({
    ...modulo,
    slide_count: slideCounts.get(modulo.id) ?? 0,
  }));

  const allGroups = buildVitrineGroups(withStatsAll).map((group) => ({
    ...group,
    questoes: group.questoes.slice(0, SCALE_LIMITS.QUESTOES_POR_ASSUNTO),
  }));
  const disciplinas = buildDisciplinaSummaries(allGroups);

  const groupsScoped = filters.disciplina
    ? allGroups.filter(
        (g) => resolveVitrineDisciplinaId(g.modulo_nome) === filters.disciplina,
      )
    : allGroups;

  logger.warn('getVitrinePageViaJs: total groups built', {
    totalGroups: groupsScoped.length,
    userId,
    isAdmin,
    disciplina: filters.disciplina ?? null,
  });

  const { slice, totalPages } = paginateGroups(
    groupsScoped,
    page,
    VITRINE_ASSUNTOS_POR_PAGINA,
  );
  const pageClamped = Math.min(Math.max(1, page), totalPages);

  const withStatsScoped = filters.disciplina
    ? withStatsAll.filter(
        (m) => resolveVitrineDisciplinaId(m.modulo_nome) === filters.disciplina,
      )
    : withStatsAll;

  return {
    groups: slice,
    facets,
    disciplinas,
    pagination: {
      page: pageClamped,
      perPage: VITRINE_ASSUNTOS_POR_PAGINA,
      totalGroups: groupsScoped.length,
      totalPages,
    },
    totalModulosFiltrados: withStatsScoped.length,
  };
}

/**
 * Página da vitrine com facets e grupos paginados por assunto.
 * Caminho feliz: RPC Postgres (incluindo busca `q`); em erro, fallback JS.
 */
export async function getVitrinePage(params: GetVitrinePageParams): Promise<VitrinePageResponse> {
  const { userId, page, isAdmin = false } = params;
  const filters = normalizeVitrineListFilters(params.filters);
  const normalizedFilters = normalizeFiltersForLog(filters);
  const startAt = Date.now();

  logger.warn('getVitrinePage called', { userId, page, isAdmin, filters: normalizedFilters });

  /** Filtro por disciplina ainda não existe na RPC — pipeline JS. */
  if (filters.disciplina) {
    const jsStartAt = Date.now();
    const jsPage = await getVitrinePageViaJs(params);
    logApiStrategy({
      event: 'vitrine_page',
      strategy: 'js',
      durationMs: Date.now() - jsStartAt,
      context: {
        userId,
        page,
        filters: normalizedFilters,
        rowCount: jsPage.totalModulosFiltrados,
        isAdmin,
        reason: 'disciplina_filter',
      },
    });
    return applyVitrineQualityGateToPage(jsPage, { isAdmin });
  }

  try {
    const rpcPage = await fetchVitrinePageFromRpc({ userId, page, filters });
    const durationMs = Date.now() - startAt;

    const rpcHasResults =
      rpcPage.pagination.totalGroups > 0 || rpcPage.totalModulosFiltrados > 0;

    if (!rpcHasResults) {
      if (isAdmin) {
        throw new Error('Admin RPC returned empty, forcing fallback JS with full catalog');
      }
      if (!vitrineHasActiveFilters(filters)) {
        logger.error('RPC get_vitrine_page vazio sem filtros; verificar matrícula/dados', {
          userId,
          page,
          isAdmin,
        });
        throw new Error('RPC returned empty result without active filters');
      }
    }

    const facets = filterVitrineFacetsByQualityGate(
      rpcPage.facets ??
        (await getVitrineFacets({
          userId,
          bancas: filters.bancas,
          isAdmin,
        })),
      { isAdmin },
    );

    const disciplinas = await buildDisciplinaSummariesLite(userId, filters, isAdmin);

    logApiStrategy({
      event: 'vitrine_page',
      strategy: 'rpc',
      durationMs,
      context: {
        userId,
        page,
        filters: normalizedFilters,
        rowCount: rpcPage.totalModulosFiltrados,
        isAdmin,
      },
    });
    logger.info('Vitrine service resolved', {
      strategy: 'rpc',
      durationMs,
      userId,
      page,
      filters: normalizedFilters,
      rowCount: rpcPage.totalModulosFiltrados,
      groupCount: rpcPage.pagination.totalGroups,
      isAdmin,
    });

    return applyVitrineQualityGateToPage(
      {
        ...rpcPage,
        facets,
        disciplinas,
      },
      { isAdmin },
    );
  } catch (err) {
    logger.warn('get_vitrine_page indisponível; pipeline JS', {
      strategy: 'rpc',
      durationMs: Date.now() - startAt,
      userId,
      page,
      filters: normalizedFilters,
      isAdmin,
      error: err instanceof Error ? err.message : err,
    });
  }

  const jsStartAt = Date.now();
  const jsPage = await getVitrinePageViaJs(params);

  logApiStrategy({
    event: 'vitrine_page',
    strategy: 'js',
    durationMs: Date.now() - jsStartAt,
    context: {
      userId,
      page,
      filters: normalizedFilters,
      rowCount: jsPage.totalModulosFiltrados,
      isAdmin,
    },
  });
  logger.warn('Vitrine service resolved via pipeline JS', {
    strategy: 'js',
    durationMs: Date.now() - jsStartAt,
    userId,
    page,
    filters: normalizedFilters,
    rowCount: jsPage.totalModulosFiltrados,
    groupCount: jsPage.pagination.totalGroups,
    isAdmin,
  });

  return applyVitrineQualityGateToPage(jsPage, { isAdmin });
}
