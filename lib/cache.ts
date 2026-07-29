/**
 * Sistema de Cache Estratégico para AVANT
 * 
 * Estratégias de cache:
 * - Dados estáticos (módulos, questões): 5-15 minutos
 * - Dados dinâmicos (histórico por usuário): 1-2 minutos
 * - Dados de sessão: Cache em memória durante request
 */

import { createHash } from 'crypto';
import { unstable_cache } from 'next/cache';
import { cache as cacheByRequest } from 'react';
import { logger } from './logger';
import { DataServiceUnavailableError } from './dataServiceError';
import { withPostgrestReadRetry } from './supabaseReadRetry';
import type { Concurso } from '@/types/database';
import type { VitrinePageResponse } from '@/lib/vitrine/types';
import { CATALOG_STATS_RPC, SCALE_LIMITS } from '@/lib/scale/constants';
import { normalizeSearchForCacheKey } from '@/lib/estudar/navigation';
import {
  ESTUDAR_QUESTAO_LAYERS_DEFAULT,
  type EstudarQuestaoLayers,
} from '@/lib/estudar/questaoLayers';
import {
  estudarPayloadSearchContextKey,
  parseEstudarSearchParams,
  type EstudarSearchParams,
} from '@/lib/estudar/parseEstudarSearchParams';
import type { EstudarQuestaoBuildResult } from '@/lib/estudar/questaoPlayerPayload';
import type { NotebookActivationStatus } from '@/lib/cadernos/activation';
import { isFsrsMvpBetaEmail, isFsrsMvpEnabled } from '@/lib/env';
import {
  getVitrineFacetsFilterTag,
  getVitrineFacetsFiltersHash,
  getVitrineFacetsUserFilterTag,
  getVitrineFacetsUserTag,
  getVitrinePageFilterTag,
  getVitrinePageFiltersHash,
  getVitrinePageUserFilterTag,
  getVitrinePageUserTag,
  vitrineFacetsCacheKey,
  vitrinePageCacheKey,
  createVitrineFilterHash,
  normalizeVitrineArrayFilter,
  normalizeVitrineTextFilter,
  type VitrineFacetsCacheFilters,
  type VitrinePageCacheFilters,
} from '@/lib/cache/vitrineTags';

import {
  CACHE_REVALIDATE_IMMEDIATE,
  revalidateCache,
  invalidateModulosCache,
  invalidateUserModulosCache,
  invalidateQuestoesCache,
  invalidateQuestaoSlugCache,
  invalidateQuestaoSlugsCache,
  invalidateHistoricoCache,
  invalidateHistoricoUserCache,
  invalidateNotebookActivationCache,
  invalidateVitrinePageCache,
  invalidateVitrineFacetsCache,
} from '@/lib/cache/revalidate';

export {
  CACHE_REVALIDATE_IMMEDIATE,
  revalidateCache,
  invalidateModulosCache,
  invalidateUserModulosCache,
  invalidateQuestoesCache,
  invalidateQuestaoSlugCache,
  invalidateQuestaoSlugsCache,
  invalidateHistoricoCache,
  invalidateHistoricoUserCache,
  invalidateNotebookActivationCache,
  invalidateVitrinePageCache,
  invalidateVitrineFacetsCache,
} from '@/lib/cache/revalidate';

export type { NotebookActivationStatus } from '@/lib/cadernos/activation';
export { EMPTY_NOTEBOOK_ACTIVATION } from '@/lib/cadernos/activation';

export type { VitrineFacetsCacheFilters, VitrinePageCacheFilters, EstudarSearchParams };
export {
  getVitrineFacetsFilterTag,
  getVitrineFacetsFiltersHash,
  getVitrineFacetsUserFilterTag,
  getVitrineFacetsUserTag,
  getVitrinePageFilterTag,
  getVitrinePageFiltersHash,
  getVitrinePageUserFilterTag,
  getVitrinePageUserTag,
} from '@/lib/cache/vitrineTags';

// Helper para tracking de métricas (opcional, não bloqueia se não disponível)
function trackCacheMiss(key: string) {
  try {
    const { recordCacheMiss } = require('./metrics');
    recordCacheMiss(key);
  } catch (e) {
    // Métricas podem não estar disponíveis em todos os contextos
    // Não é crítico, apenas ignora
  }
}

/** Callback de unstable_cache = miss (fetch); hit não é observável aqui. */
function trackUnstableCacheFetch(key: string) {
  trackCacheMiss(key);
}

/**
 * Configurações de cache por tipo de dado
 */
export const CACHE_CONFIG = {
  // Dados estáticos - raramente mudam
  STATIC: {
    revalidate: 900, // 15 minutos
    tags: ['static'] as const,
  },
  
  // Dados semi-estáticos - mudam ocasionalmente
  SEMI_STATIC: {
    revalidate: 300, // 5 minutos
    tags: ['semi-static'] as const,
  },
  
  // Dados dinâmicos - mudam frequentemente
  DYNAMIC: {
    revalidate: 60, // 1 minuto
    tags: ['dynamic'] as const,
  },
  
  // Dados de usuário - específicos por sessão
  USER: {
    revalidate: 120, // 2 minutos
    tags: ['user'] as const,
  },
} as const;

/** Limite da lista usada na vitrine (/estudar). Não usar 100: os N mais recentes podem ser só 1–2 assuntos e escondem o restante do catálogo. */
const MODULOS_ESTUDO_VITRINE_LIMIT = SCALE_LIMITS.VITRINE_MODULOS;

/**
 * Cache para lista de módulos de estudo
 * Revalida a cada 5 minutos (dados semi-estáticos)
 */
// Chave versionada: evita `unstable_cache` antigo com `[]` (rede/env) por vários minutos.
const MODULOS_ESTUDO_CACHE_ID = 'modulos-estudo-catalog-v3';

// Cache wrapper com tracking
const modulosCacheFn = unstable_cache(
  async () => {
    const { createServerSupabase } = await import('./supabase/server');
    let supabase: Awaited<ReturnType<typeof createServerSupabase>>;
    try {
      supabase = await createServerSupabase();
    } catch {
      trackCacheMiss('modulos-estudo-list');
      throw new DataServiceUnavailableError(
        'Configuração incompleta: variáveis NEXT_PUBLIC_SUPABASE_* ou SUPABASE_SERVICE_ROLE_KEY ausentes no servidor.',
      );
    }

    const data = await withPostgrestReadRetry('modulos-estudo-list', async () =>
      supabase
        .from('modulos_estudo')
        .select('id, modulo_slug, modulo_nome, titulo_aula, banca, created_at, avant_codigo')
        .order('created_at', { ascending: false })
        .limit(MODULOS_ESTUDO_VITRINE_LIMIT),
    );
    trackUnstableCacheFetch('modulos-estudo-list');
    return data ?? [];
  },
  [MODULOS_ESTUDO_CACHE_ID],
  {
    ...CACHE_CONFIG.SEMI_STATIC,
    tags: ['modulos-estudo', 'semi-static'],
  }
);

export const getModulosEstudoCached = modulosCacheFn;

const MODULOS_ESTUDO_USER_CACHE_PREFIX = 'modulos-estudo-user-v2';

/**
 * Catálogo de módulos visíveis ao usuário (matrículas + concurso_modulos).
 * Usa service role no servidor; não depende de RLS anon.
 */
export async function getModulosEstudoForUserCached(userId: string) {
  const cacheKey = `${MODULOS_ESTUDO_USER_CACHE_PREFIX}-${userId}`;

  return unstable_cache(
    async () => {
      const { getAccessibleModulosForUser } = await import('./concursos/entitlements');
      trackUnstableCacheFetch(cacheKey);
      return getAccessibleModulosForUser(userId);
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['modulos-estudo', 'user', `user-${userId}`],
    },
  )();
}

const MODULOS_ESTUDO_VITRINE_USER_CACHE_PREFIX = 'modulos-estudo-vitrine-user-v1';

/**
 * Catálogo da vitrine `/estudar` e lista por assunto no player: pacote do edital matriculado
 * quando existir; caso contrário, união completa (`getModulosEstudoForUserCached`).
 */
export async function getModulosEstudoVitrineForUserCached(userId: string) {
  const cacheKey = `${MODULOS_ESTUDO_VITRINE_USER_CACHE_PREFIX}-${userId}`;

  return unstable_cache(
    async () => {
      const { getAccessibleModulosForMatriculatedEditalPacote } = await import(
        './concursos/entitlements'
      );
      trackUnstableCacheFetch(cacheKey);
      return getAccessibleModulosForMatriculatedEditalPacote(userId);
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['modulos-estudo', 'user', `user-${userId}`],
    },
  )();
}

const ACCESSIBLE_MODULOS_NAV_CACHE_PREFIX = 'accessible-modulos-nav-v1';
const MATRICULATED_CONCURSOS_CACHE_PREFIX = 'matriculated-concursos-v1';

export type AccessibleModulosNavCacheFilters = {
  banca?: string;
  titulo_aula?: string;
  bancas?: string[];
  titulo_aulas?: string[];
};

export function getAccessibleModulosNavFiltersHash(
  filters: AccessibleModulosNavCacheFilters = {},
): string {
  return createVitrineFilterHash([
    normalizeVitrineTextFilter(filters.banca),
    normalizeVitrineArrayFilter(filters.bancas),
    normalizeVitrineTextFilter(filters.titulo_aula),
    normalizeVitrineArrayFilter(filters.titulo_aulas),
  ]);
}

export function getAccessibleModulosNavFilterTag(
  userId: string,
  filters: AccessibleModulosNavCacheFilters = {},
): string {
  return `nav-filter-${userId}-${getAccessibleModulosNavFiltersHash(filters)}`;
}

/**
 * Módulos acessíveis com filtros SQL (banca/assunto) para vitrine e player.
 * TTL 2 min; invalidar via `modulos-estudo` e `user-{id}`.
 */
export async function getAccessibleModulosForNavCached(
  userId: string,
  sqlFilters: AccessibleModulosNavCacheFilters,
) {
  const filtersHash = getAccessibleModulosNavFiltersHash(sqlFilters);
  const cacheKey = `${ACCESSIBLE_MODULOS_NAV_CACHE_PREFIX}-${userId}-${filtersHash}`;
  const filterTag = getAccessibleModulosNavFilterTag(userId, sqlFilters);

  return unstable_cache(
    async () => {
      const { fetchAccessibleModulosForNav } = await import('./concursos/entitlements');
      trackCacheMiss(cacheKey);
      return fetchAccessibleModulosForNav(userId, sqlFilters);
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['modulos-estudo', 'user', `user-${userId}`, filterTag],
    },
  )();
}

/**
 * Concursos matriculados ativos do usuário (título edital na vitrine, shell do dashboard).
 * TTL 2 min; invalidar via `modulos-estudo` e `user-{id}`.
 */
export async function getMatriculatedConcursosCached(userId: string) {
  const cacheKey = `${MATRICULATED_CONCURSOS_CACHE_PREFIX}-${userId}`;

  return unstable_cache(
    async () => {
      const { getMatriculatedConcursos } = await import('./concursos/entitlements');
      trackCacheMiss(cacheKey);
      return getMatriculatedConcursos(userId);
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['modulos-estudo', 'user', `user-${userId}`, `matriculated-${userId}`],
    },
  )();
}

/**
 * Cache para questão individual por slug
 * OTIMIZAÇÃO: Revalida a cada 10 minutos (aumentado de 5 para melhor cache hit rate)
 * 
 * Nota: unstable_cache requer que parâmetros sejam parte da key
 */
export async function getQuestaoBySlugCached(slug: string) {
  const cacheKey = `questao-${slug}`;

  return unstable_cache(
    async () => {
      const { createServerSupabase } = await import('./supabase/server');
      let supabase: Awaited<ReturnType<typeof createServerSupabase>>;
      try {
        supabase = await createServerSupabase();
      } catch {
        trackCacheMiss(cacheKey);
        throw new DataServiceUnavailableError(
          'Configuração incompleta: SUPABASE_SERVICE_ROLE_KEY ausente no servidor.',
        );
      }

      const { data, error } = await supabase
        .from('modulos_estudo')
        .select('id, modulo_slug, conteudo_json, banca, modulo_nome, titulo_aula, created_at, avant_codigo')
        .eq('modulo_slug', slug)
        .maybeSingle();

      if (error) {
        logger.error('Failed to fetch question from cache', error, { slug });
        trackCacheMiss(cacheKey);
        throw new DataServiceUnavailableError();
      }

      if (!data) {
        trackCacheMiss(cacheKey);
        return null;
      }

      trackUnstableCacheFetch(cacheKey);
      return data;
    },
    [cacheKey],
    {
      revalidate: 600, // 10 minutos (otimizado de 5 para melhor cache)
      tags: ['questao', 'semi-static', `questao-${slug}`],
    },
  )();
}

function estudarPayloadSearchContextKeyFromParams(searchParams: EstudarSearchParams = {}): string {
  return estudarPayloadSearchContextKey(searchParams);
}

export type GetEstudarQuestaoPayloadCachedInput = {
  slug: string;
  userId?: string | null;
  userEmail?: string | null;
  isAdmin?: boolean;
  searchParams?: EstudarSearchParams;
  layers?: EstudarQuestaoLayers;
};

/**
 * Cache do payload do player em `/estudar/[slug]` (RSC).
 * TTL 120 s; tags `estudar-questao`, `questao-{slug}`, `user-{id}`.
 */
export async function getEstudarQuestaoPayloadCached(
  input: GetEstudarQuestaoPayloadCachedInput,
): Promise<EstudarQuestaoBuildResult> {
  const userKey = input.userId?.trim() || 'anon';
  const layers = input.layers ?? ESTUDAR_QUESTAO_LAYERS_DEFAULT;
  const contextKey = estudarPayloadSearchContextKeyFromParams(input.searchParams);
  // `?from=revisoes` escolhe SM-2 vs FSRS via e-mail (allowlist); chave precisa distinguir cohort.
  const fromRevisoes = parseEstudarSearchParams(input.searchParams ?? {}).fromRevisoes;
  const reviewCohortKey = fromRevisoes
    ? isFsrsMvpEnabled() && isFsrsMvpBetaEmail(input.userEmail)
      ? 'fsrs'
      : 'sm2'
    : 'na';
  const cacheKey = `estudar-questao-payload-${input.slug}-${userKey}-${layers}-${contextKey}-${reviewCohortKey}`;

  return unstable_cache(
    async () => {
      let supabase: Awaited<
        ReturnType<typeof import('./supabase/server').createServerSupabase>
      > | undefined;

      if (input.userId) {
        try {
          const { createServerSupabase } = await import('./supabase/server');
          supabase = await createServerSupabase();
        } catch {
          trackCacheMiss(cacheKey);
          throw new DataServiceUnavailableError(
            'Configuração incompleta: SUPABASE_SERVICE_ROLE_KEY ausente no servidor.',
          );
        }
      }

      trackUnstableCacheFetch(cacheKey);
      const { buildEstudarQuestaoPlayerPayload } = await import('./estudar/questaoPlayerPayload');
      return buildEstudarQuestaoPlayerPayload({
        slug: input.slug,
        userId: input.userId,
        userEmail: input.userEmail,
        isAdmin: input.isAdmin,
        searchParams: input.searchParams,
        layers,
        supabase,
      });
    },
    [cacheKey],
    {
      revalidate: CACHE_CONFIG.USER.revalidate,
      tags: [
        'estudar-questao',
        `questao-${input.slug}`,
        ...(input.userId ? [`user-${input.userId}`] : []),
      ],
    },
  )();
}

/**
 * Cache para lista de questões por assunto (titulo_aula)
 * Usado para navegação entre questões do mesmo assunto
 * Revalida a cada 5 minutos
 * `cacheByRequest`: deduplica no mesmo request (varias chamadas RSC/paralelo).
 * Falha de rede: lança (não cacheia `[]` falso em `unstable_cache`). A página do player pode tratar com try/catch.
 */
export const getQuestoesByAssuntoCached = cacheByRequest(async (tituloAula: string) => {
  const cacheKey = `questoes-assunto-${tituloAula}`;

  return unstable_cache(
    async () => {
      const { createServerSupabase } = await import('./supabase/server');
      let supabase: Awaited<ReturnType<typeof createServerSupabase>>;
      try {
        supabase = await createServerSupabase();
      } catch {
        trackCacheMiss(cacheKey);
        throw new DataServiceUnavailableError(
          'Configuração incompleta: SUPABASE_SERVICE_ROLE_KEY ausente no servidor.',
        );
      }

      const data = await withPostgrestReadRetry(
        `questoes-assunto:${tituloAula.slice(0, 40)}`,
        async () =>
          supabase
            .from('modulos_estudo')
            .select('modulo_slug, id')
            .eq('titulo_aula', tituloAula)
            .order('created_at', { ascending: true })
            .limit(200),
      );
      trackUnstableCacheFetch(cacheKey);
      return data ?? [];
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.SEMI_STATIC,
      tags: ['questoes', 'semi-static', `assunto-${tituloAula}`],
    },
  )();
});

/**
 * Cache para lista de questões por banca e módulo
 * Usado para navegação entre questões
 * Revalida a cada 5 minutos
 */
export const getQuestoesByBancaCached = cacheByRequest(
  async (banca: string, moduloNome: string | null) => {
    const cacheKey = `questoes-banca-${banca}-modulo-${moduloNome || 'null'}`;

    return unstable_cache(
      async () => {
        const { createServerSupabase } = await import('./supabase/server');
        let supabase: Awaited<ReturnType<typeof createServerSupabase>>;
        try {
          supabase = await createServerSupabase();
        } catch {
          trackCacheMiss(cacheKey);
          throw new DataServiceUnavailableError(
            'Configuração incompleta: SUPABASE_SERVICE_ROLE_KEY ausente no servidor.',
          );
        }

        const data = await withPostgrestReadRetry(`questoes-banca:${banca}`, async () => {
          let q = supabase
            .from('modulos_estudo')
            .select('modulo_slug, id')
            .eq('banca', banca);

          if (moduloNome === null) {
            q = q.is('modulo_nome', null);
          } else {
            q = q.eq('modulo_nome', moduloNome);
          }
          return q.order('created_at', { ascending: true }).limit(100);
        });
        trackUnstableCacheFetch(cacheKey);
        return data ?? [];
      },
      [cacheKey],
      {
        ...CACHE_CONFIG.SEMI_STATIC,
        tags: ['questoes', 'semi-static', `banca-${banca}`],
      },
    )();
  },
);

/** Linha mínima de `historico_questoes` usada na vitrine e no player. */
export type HistoricoQuestaoCachedRow = {
  modulo_slug: string;
  acertou: boolean;
  estudo_reverso_concluido: boolean;
};

/** PostgREST: lotes de `modulo_slug` em `.in()` (mesmo padrão de `lib/spaced-repetition.ts`). */
const HISTORICO_SLUG_IN_CHUNK = 120;

function uniqueNonEmptySlugs(slugs: readonly string[]): string[] {
  return [...new Set(slugs.map((s) => s?.trim()).filter((s): s is string => Boolean(s)))];
}

function historicoSlugsCacheKey(userId: string, slugs: readonly string[]): string {
  const unique = uniqueNonEmptySlugs(slugs);
  if (unique.length === 0) return `historico-slugs-${userId}-empty`;
  const normalized = unique.slice().sort().join('\0');
  const hash = createHash('sha256').update(normalized).digest('hex').slice(0, 16);
  return `historico-slugs-${userId}-${hash}`;
}

/** Slugs com estudo reverso concluído (dots / navegação). */
export function estudadosSetFromHistorico(
  historico: readonly Pick<HistoricoQuestaoCachedRow, 'modulo_slug' | 'estudo_reverso_concluido'>[],
): Set<string> {
  return new Set(
    historico
      .filter((h) => h.estudo_reverso_concluido === true)
      .map((h) => h.modulo_slug),
  );
}

/** Métricas agregadas de progresso de um caderno (slugs do caderno × histórico). */
export type NotebookProgressStats = {
  totalQuestions: number;
  /** Slugs do caderno com qualquer linha em `historico_questoes`. */
  answeredQuestions: number;
  /** Slugs do caderno com `estudo_reverso_concluido === true`. */
  reversoCompleted: number;
};

/**
 * Agrega progresso do caderno a partir dos slugs e do histórico filtrado.
 * Deduplica por `modulo_slug` no histórico (pode haver várias linhas por slug).
 */
export function aggregateNotebookProgress(
  slugs: readonly string[],
  historico: readonly Pick<HistoricoQuestaoCachedRow, 'modulo_slug' | 'estudo_reverso_concluido'>[],
): NotebookProgressStats {
  const notebookSlugs = uniqueNonEmptySlugs(slugs);

  const answeredBySlug = new Set<string>();
  const reversoBySlug = new Set<string>();

  for (const row of historico) {
    const slug = row.modulo_slug?.trim();
    if (!slug) continue;
    answeredBySlug.add(slug);
    if (row.estudo_reverso_concluido === true) {
      reversoBySlug.add(slug);
    }
  }

  let answeredQuestions = 0;
  let reversoCompleted = 0;
  for (const slug of notebookSlugs) {
    if (answeredBySlug.has(slug)) answeredQuestions++;
    if (reversoBySlug.has(slug)) reversoCompleted++;
  }

  return {
    totalQuestions: notebookSlugs.length,
    answeredQuestions,
    reversoCompleted,
  };
}

/**
 * Histórico restrito aos slugs do contexto (player, assunto, vitrine).
 * Evita buscar até 1000 linhas quando só o subconjunto atual importa.
 * IMPORTANTE: userId deve ser obtido fora do cache (sessão) e passado como argumento.
 */
export async function getHistoricoQuestoesForSlugsCached(
  userId: string | undefined,
  slugs: readonly string[],
): Promise<HistoricoQuestaoCachedRow[]> {
  if (!userId) return [];

  const unique = uniqueNonEmptySlugs(slugs);
  if (unique.length === 0) return [];

  const cacheKey = historicoSlugsCacheKey(userId, unique);

  return unstable_cache(
    async () => {
      const { createServerSupabase } = await import('./supabase/server');
      const supabase = await createServerSupabase();

      const chunks: string[][] = [];
      for (let i = 0; i < unique.length; i += HISTORICO_SLUG_IN_CHUNK) {
        chunks.push(unique.slice(i, i + HISTORICO_SLUG_IN_CHUNK));
      }

      const chunkResults = await Promise.all(
        chunks.map((part) =>
          withPostgrestReadRetry(
            `historico_questoes:ctx:${userId.slice(0, 8)}:${part.length}`,
            async () =>
              supabase
                .from('historico_questoes')
                .select('modulo_slug, acertou, estudo_reverso_concluido')
                .eq('user_id', userId)
                .in('modulo_slug', part),
          ),
        ),
      );

      trackCacheMiss(cacheKey);
      return chunkResults.flatMap((data) => (data ?? []) as HistoricoQuestaoCachedRow[]);
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['historico', 'user', `user-${userId}`],
    },
  )();
}

/**
 * Cache para histórico de questões por usuário
 * Revalida a cada 2 minutos (dados dinâmicos por usuário)
 *
 * Padrão canônico para dados por userId em unstable_cache:
 * - userId na cache key (obtido fora do cache, ex.: sessão)
 * - createServerSupabase (service role) dentro do callback — nunca cookies()/createServerClient
 * - filtro explícito .eq('user_id', userId)
 * Ver também lib/analytics.ts (getHistoricoCompleto).
 */
export async function getHistoricoQuestoesCached(userId?: string) {
  // Sem userId = retornar vazio (segurança: não expor histórico de outros usuários)
  if (!userId) {
    return [];
  }
  
  const cacheKey = `historico-${userId}`;
  
  return unstable_cache(
    async () => {
      // Histórico é por usuário - usa service role para bypass RLS ao filtrar por userId
      const { createServerSupabase } = await import('./supabase/server');
      const supabase = await createServerSupabase();

      const data = await withPostgrestReadRetry(
        `historico_questoes:${userId.slice(0, 8)}…`,
        async () =>
          supabase
            .from('historico_questoes')
            .select('modulo_slug, acertou, estudo_reverso_concluido')
            .eq('user_id', userId)
            .limit(1000),
      );
      trackUnstableCacheFetch(cacheKey);
      return data ?? [];
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['historico', 'user', userId ? `user-${userId}` : 'global'],
    }
  )();
}

/**
 * Status de ativação de cadernos (onboarding / banner).
 * Revalida a cada 2 minutos; invalidar via `invalidateNotebookActivationCache`.
 */
export async function getNotebookActivationCached(
  userId?: string,
): Promise<NotebookActivationStatus> {
  if (!userId) {
    const { EMPTY_NOTEBOOK_ACTIVATION } = await import('@/lib/cadernos/activation');
    return EMPTY_NOTEBOOK_ACTIVATION;
  }

  const cacheKey = `notebook-activation-${userId}`;

  return unstable_cache(
    async () => {
      const { getNotebookActivationStatus } = await import('@/lib/cadernos/activation');
      trackUnstableCacheFetch(cacheKey);
      return getNotebookActivationStatus(userId);
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['notebook-activation', 'user', `user-${userId}`],
    },
  )();
}

/**
 * Preferências de onboarding do aluno (motor adaptativo).
 * Revalida a cada 2 minutos; invalidar via tag `onboarding-preferences` + `user-{id}`.
 */
export async function getUserPreferencesOnboardingCached(userId?: string) {
  if (!userId) {
    const { getEmptyOnboardingPreferencesStatus } = await import('@/lib/onboarding/preferences');
    return getEmptyOnboardingPreferencesStatus();
  }

  const cacheKey = `onboarding-preferences-${userId}`;

  return unstable_cache(
    async () => {
      const { getUserPreferencesOnboarding } = await import('@/lib/onboarding/preferences');
      trackUnstableCacheFetch(cacheKey);
      return getUserPreferencesOnboarding(userId);
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['onboarding-preferences', 'user', `user-${userId}`],
    },
  )();
}

/**
 * Página da vitrine com RPC + fallback JS (ver `lib/vitrine/service.ts`).
 * TTL 2 min; invalidar via tags `vitrine-page` e `user-{id}`.
 */
export async function getVitrinePageCached(
  userId: string,
  page: number,
  filters: VitrinePageCacheFilters = {},
  isAdmin = false,
) {
  const cacheKey = vitrinePageCacheKey(userId, page, filters, isAdmin);
  const userTag = getVitrinePageUserTag(userId);
  const filterTag = getVitrinePageFilterTag(filters);
  const userFilterTag = getVitrinePageUserFilterTag(userId, filters);

  return unstable_cache(
    async () => {
      const { getVitrinePage } = await import('./vitrine/service');
      trackUnstableCacheFetch(cacheKey);
      return getVitrinePage({ userId, page, filters, isAdmin });
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: [
        'vitrine-page',
        'user',
        `user-${userId}`,
        userTag,
        filterTag,
        userFilterTag,
        isAdmin ? 'admin' : 'student',
      ],
    },
  )();
}

/**
 * Facets da vitrine (bancas/assuntos) com RPC + fallback JS.
 * TTL 15 min — facets mudam com catálogo, não com paginação da lista.
 */
export async function getVitrineFacetsCached(
  userId: string,
  filters: VitrineFacetsCacheFilters = {},
  isAdmin = false,
) {
  const cacheKey = vitrineFacetsCacheKey(userId, filters, isAdmin);
  const userTag = getVitrineFacetsUserTag(userId);
  const filterTag = getVitrineFacetsFilterTag(filters);
  const userFilterTag = getVitrineFacetsUserFilterTag(userId, filters);

  return unstable_cache(
    async () => {
      const { getVitrineFacets } = await import('./vitrine/facets');
      trackUnstableCacheFetch(cacheKey);
      return getVitrineFacets({ userId, bancas: filters.bancas, isAdmin });
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.STATIC,
      tags: [
        'vitrine-facets',
        'user',
        `user-${userId}`,
        userTag,
        filterTag,
        userFilterTag,
        isAdmin ? 'admin' : 'student',
      ],
    },
  )();
}

/** Payload SSR inicial da vitrine: página com facets já mesclados. */
export type VitrineInitialPayload = {
  page: VitrinePageResponse;
};

function vitrineInitialPayloadCacheKey(
  userId: string,
  page: number,
  pageFilters: VitrinePageCacheFilters,
  facetsFilters: VitrineFacetsCacheFilters,
  isAdmin = false,
): string {
  const pageFiltersHash = getVitrinePageFiltersHash(pageFilters);
  const facetsFiltersHash = getVitrineFacetsFiltersHash(facetsFilters);
  const raw = `${userId}\0${page}\0${pageFiltersHash}\0${facetsFiltersHash}\0${isAdmin}`;
  const hash = createHash('sha256').update(raw).digest('hex').slice(0, 16);
  return `vitrine-initial-v2-${hash}`;
}

/**
 * Bundle SSR da vitrine: uma RPC get_vitrine_page (facets embutidos) via getVitrinePage.
 * facetsFilters permanece na cache key para invalidação ao trocar banca no client.
 */
export async function getVitrineInitialPayloadCached(
  userId: string,
  page: number,
  pageFilters: VitrinePageCacheFilters = {},
  facetsFilters: VitrineFacetsCacheFilters = {},
  isAdmin = false,
): Promise<VitrineInitialPayload> {
  const cacheKey = vitrineInitialPayloadCacheKey(userId, page, pageFilters, facetsFilters, isAdmin);
  const pageUserTag = getVitrinePageUserTag(userId);
  const pageFilterTag = getVitrinePageFilterTag(pageFilters);
  const pageUserFilterTag = getVitrinePageUserFilterTag(userId, pageFilters);
  const facetsUserTag = getVitrineFacetsUserTag(userId);
  const facetsFilterTag = getVitrineFacetsFilterTag(facetsFilters);
  const facetsUserFilterTag = getVitrineFacetsUserFilterTag(userId, facetsFilters);

  return unstable_cache(
    async () => {
      const { getVitrinePage } = await import('./vitrine/service');

      const pageData = await getVitrinePage({ userId, page, filters: pageFilters, isAdmin });

      trackUnstableCacheFetch(cacheKey);
      return {
        page: pageData,
      };
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: [
        'vitrine-page',
        'vitrine-facets',
        'user',
        `user-${userId}`,
        pageUserTag,
        pageFilterTag,
        pageUserFilterTag,
        facetsUserTag,
        facetsFilterTag,
        facetsUserFilterTag,
        isAdmin ? 'admin' : 'student',
      ],
    },
  )();
}

export type CatalogStats = {
  totalQuestions: number;
  totalSlides: number;
};

const EMPTY_CATALOG_STATS: CatalogStats = { totalQuestions: 0, totalSlides: 0 };

function parseCatalogStatsPayload(data: unknown): CatalogStats {
  if (!data || typeof data !== 'object') return EMPTY_CATALOG_STATS;
  const o = data as Record<string, unknown>;
  const toInt = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.trunc(value));
    if (typeof value === 'string' && value.trim() !== '') {
      const n = Number(value);
      if (Number.isFinite(n)) return Math.max(0, Math.trunc(n));
    }
    return 0;
  };
  return {
    totalQuestions: toInt(o.total_questions),
    totalSlides: toInt(o.total_slides),
  };
}

const CATALOG_STATS_CACHE_ID = 'catalog-stats-v1';

/**
 * Totais globais da plataforma: questões com estudo reverso e NeuroSlides agregados.
 * TTL 1 h; invalidar via tag `catalog-stats` (incluída em `invalidateModulosCache`).
 */
export const getCatalogStats = unstable_cache(
  async (): Promise<CatalogStats> => {
    const { createServerSupabase } = await import('./supabase/server');
    let supabase: Awaited<ReturnType<typeof createServerSupabase>>;
    try {
      supabase = await createServerSupabase();
    } catch {
      trackCacheMiss('catalog-stats');
      throw new DataServiceUnavailableError(
        'Configuração incompleta: variáveis NEXT_PUBLIC_SUPABASE_* ou SUPABASE_SERVICE_ROLE_KEY ausentes no servidor.',
      );
    }

    try {
      const data = await withPostgrestReadRetry('catalog-stats', async () =>
        supabase.rpc(CATALOG_STATS_RPC),
      );
      trackUnstableCacheFetch('catalog-stats');
      return parseCatalogStatsPayload(data);
    } catch (error) {
      logger.error('Falha ao buscar catalog stats', error);
      trackCacheMiss('catalog-stats');
      throw new DataServiceUnavailableError();
    }
  },
  [CATALOG_STATS_CACHE_ID],
  {
    revalidate: 3600,
    tags: ['catalog-stats', 'static', 'modulos-estudo'],
  },
);

/**
 * Invalidação completa de cache (usar com cuidado)
 */
export const invalidateAllCache = () =>
  revalidateCache(['static', 'semi-static', 'dynamic', 'user']);

const ADMIN_CONCURSOS_LIST_CACHE_ID = 'admin-concursos-list-v1';

/**
 * Agregado PostgREST embutido: `concurso_modulos(count)` → `[{ count: number }]`.
 */
export function extractCount(payload: unknown): number {
  if (!Array.isArray(payload) || payload.length === 0) return 0;
  const first = payload[0];
  if (first && typeof first === 'object' && 'count' in first) {
    const c = (first as { count: unknown }).count;
    if (typeof c === 'number' && Number.isFinite(c)) return c;
  }
  return 0;
}

/** Linha da lista admin do builder: concurso + total de vínculos em `concurso_modulos`. */
export type AdminConcursoListItem = Concurso & {
  linked_modulos_count: number;
};

const adminConcursosListCached = unstable_cache(
  async (): Promise<AdminConcursoListItem[]> => {
    const { createServerSupabase } = await import('./supabase/server');
    let supabase: Awaited<ReturnType<typeof createServerSupabase>>;
    try {
      supabase = await createServerSupabase();
    } catch {
      trackCacheMiss('admin-concursos-list');
      throw new DataServiceUnavailableError(
        'Configuração incompleta: variáveis NEXT_PUBLIC_SUPABASE_* ou SUPABASE_SERVICE_ROLE_KEY ausentes no servidor.',
      );
    }

    const raw = await withPostgrestReadRetry('admin-concursos-list', async () =>
      supabase
        .from('concursos')
        .select(
          `
          id, slug, nome, cidade, orgao, banca, ano, cargo, tipo, status, price_cents, data_prova, descricao, destaque, created_at,
          concurso_modulos(count)
        `.replace(/\s+/g, ' '),
        )
        .order('created_at', { ascending: false }),
    );

    trackUnstableCacheFetch('admin-concursos-list');
    const rows = (raw ?? []) as unknown as Array<Record<string, unknown>>;
    return rows.map((row) => {
      const { concurso_modulos: nested, ...rest } = row;
      return {
        ...(rest as unknown as Concurso),
        linked_modulos_count: extractCount(nested),
      };
    });
  },
  [ADMIN_CONCURSOS_LIST_CACHE_ID],
  {
    revalidate: CACHE_CONFIG.SEMI_STATIC.revalidate,
    tags: ['admin-concursos', 'semi-static'],
  },
);

/** Lista de concursos para o builder admin (cache com tag `admin-concursos`). */
export const getAdminConcursosList = adminConcursosListCached;

export async function invalidateAdminConcursosCache() {
  await revalidateCache(['admin-concursos']);
}

/** Contato mínimo para e-mail transacional de boas-vindas (Auth metadata). */
export type AuthUserWelcomeContact = {
  email: string;
  firstName: string;
};

function firstNameFromDisplayName(displayName: string | null | undefined): string | null {
  if (!displayName?.trim()) return null;
  const part = displayName.trim().split(/\s+/)[0];
  return part || null;
}

function firstNameFromAuthMetadata(
  metadata: Record<string, unknown> | undefined,
): string | null {
  if (!metadata) return null;
  const full = metadata.full_name;
  if (typeof full === 'string' && full.trim()) {
    return firstNameFromDisplayName(full);
  }
  const name = metadata.name;
  if (typeof name === 'string' && name.trim()) {
    return firstNameFromDisplayName(name);
  }
  return null;
}

/**
 * E-mail e primeiro nome para boas-vindas (service role + cache por usuário).
 * Usado por webhooks/actions server-side — não expor ao client.
 */
export async function getAuthUserWelcomeContactCached(
  userId: string,
): Promise<AuthUserWelcomeContact | null> {
  const cacheKey = `auth-user-welcome-${userId}`;

  return unstable_cache(
    async () => {
      const { createServerSupabase } = await import('./supabase/server');
      let supabase: Awaited<ReturnType<typeof createServerSupabase>>;
      try {
        supabase = await createServerSupabase();
      } catch {
        trackCacheMiss(cacheKey);
        throw new DataServiceUnavailableError(
          'Configuração incompleta: variáveis NEXT_PUBLIC_SUPABASE_* ou SUPABASE_SERVICE_ROLE_KEY ausentes no servidor.',
        );
      }

      const { data: authData, error: authError } =
        await supabase.auth.admin.getUserById(userId);

      if (authError || !authData.user?.email) {
        logger.error('Falha ao buscar usuário Auth para e-mail de boas-vindas', authError, {
          userId,
        });
        trackCacheMiss(cacheKey);
        return null;
      }

      const { resolveWelcomeSalutation } = await import('./email/welcomeSalutation');
      const firstName = resolveWelcomeSalutation(
        firstNameFromAuthMetadata(
          authData.user.user_metadata as Record<string, unknown> | undefined,
        ),
      );

      trackUnstableCacheFetch(cacheKey);
      return {
        email: authData.user.email,
        firstName,
      };
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['auth-user', 'user', `user-${userId}`],
    },
  )();
}
