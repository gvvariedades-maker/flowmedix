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
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cache as cacheByRequest } from 'react';
import { logger } from './logger';
import { DataServiceUnavailableError } from './dataServiceError';
import { withPostgrestReadRetry } from './supabaseReadRetry';
import type { Concurso } from '@/types/database';
import { SCALE_LIMITS } from '@/lib/scale/constants';

// Cliente Supabase SEM cookies - para uso dentro de unstable_cache.
// Lazy: evita createClient com URL/key indefinidos no import (ex.: `next build` / CI sem .env).
let supabaseAnonSingleton: SupabaseClient | null | undefined;

function getSupabaseAnon(): SupabaseClient | null {
  if (supabaseAnonSingleton !== undefined) return supabaseAnonSingleton;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !key?.trim()) {
    supabaseAnonSingleton = null;
    return null;
  }
  supabaseAnonSingleton = createClient(url, key);
  return supabaseAnonSingleton;
}

// Helper para tracking de métricas (opcional, não bloqueia se não disponível)
function trackCacheHit(key: string) {
  try {
    // Importação dinâmica para evitar problemas de inicialização
    const { recordCacheHit } = require('./metrics');
    recordCacheHit(key);
  } catch (e) {
    // Métricas podem não estar disponíveis em todos os contextos
    // Não é crítico, apenas ignora
  }
}

function trackCacheMiss(key: string) {
  try {
    const { recordCacheMiss } = require('./metrics');
    recordCacheMiss(key);
  } catch (e) {
    // Métricas podem não estar disponíveis em todos os contextos
    // Não é crítico, apenas ignora
  }
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
const MODULOS_ESTUDO_CACHE_ID = 'modulos-estudo-catalog-v2';

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
    trackCacheHit('modulos-estudo-list');
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
      trackCacheHit(cacheKey);
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
      trackCacheHit(cacheKey);
      return getAccessibleModulosForMatriculatedEditalPacote(userId);
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['modulos-estudo', 'user', `user-${userId}`],
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
      const supabase = getSupabaseAnon();
      if (!supabase) {
        trackCacheMiss(cacheKey);
        return null;
      }

      // OTIMIZAÇÃO: Seleciona apenas campos necessários (não *)
      const { data, error } = await supabase
        .from('modulos_estudo')
        .select('id, modulo_slug, conteudo_json, banca, modulo_nome, titulo_aula, created_at, avant_codigo')
        .eq('modulo_slug', slug)
        .single();
      
      if (error) {
        logger.error('Failed to fetch question from cache', error, { slug });
        trackCacheMiss(cacheKey);
        return null;
      }
      
      trackCacheHit(cacheKey);
      return data;
    },
    [cacheKey],
    {
      revalidate: 600, // 10 minutos (otimizado de 5 para melhor cache)
      tags: ['questao', 'semi-static', `questao-${slug}`],
    }
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
      const supabase = getSupabaseAnon();
      if (!supabase) {
        trackCacheMiss(cacheKey);
        throw new DataServiceUnavailableError();
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
      trackCacheHit(cacheKey);
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
        const supabase = getSupabaseAnon();
        if (!supabase) {
          trackCacheMiss(cacheKey);
          throw new DataServiceUnavailableError();
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
        trackCacheHit(cacheKey);
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
      const merged: HistoricoQuestaoCachedRow[] = [];

      for (let i = 0; i < unique.length; i += HISTORICO_SLUG_IN_CHUNK) {
        const part = unique.slice(i, i + HISTORICO_SLUG_IN_CHUNK);
        const data = await withPostgrestReadRetry(
          `historico_questoes:ctx:${userId.slice(0, 8)}:${part.length}`,
          async () =>
            supabase
              .from('historico_questoes')
              .select('modulo_slug, acertou, estudo_reverso_concluido')
              .eq('user_id', userId)
              .in('modulo_slug', part),
        );
        if (data?.length) merged.push(...(data as HistoricoQuestaoCachedRow[]));
      }

      trackCacheHit(cacheKey);
      return merged;
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
 * IMPORTANTE: userId deve ser obtido fora do cache (ex: cookies + auth.getUser) e passado como argumento
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
      trackCacheHit(cacheKey);
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
 * Perfil de revalidação imediata (Next.js 16+).
 * Um objeto vazio `{}` não é perfil documentado e pode não expirar o cache corretamente.
 * @see https://nextjs.org/docs/app/api-reference/functions/revalidateTag
 */
export const CACHE_REVALIDATE_IMMEDIATE = { expire: 0 } as const;

export type VitrinePageCacheFilters = {
  banca?: string;
  assunto?: string;
  q?: string;
};

function vitrinePageCacheKey(
  userId: string,
  page: number,
  filters: VitrinePageCacheFilters,
): string {
  const banca = filters.banca?.trim() || '';
  const assunto = filters.assunto?.trim() || '';
  const q = filters.q?.trim() || '';
  const raw = `${userId}\0${page}\0${banca}\0${assunto}\0${q}`;
  const hash = createHash('sha256').update(raw).digest('hex').slice(0, 16);
  return `vitrine-page-${hash}`;
}

/**
 * Página da vitrine com RPC + fallback JS (ver `lib/vitrine/service.ts`).
 * TTL 2 min; invalidar via tags `vitrine-page` e `user-{id}`.
 */
export async function getVitrinePageCached(
  userId: string,
  page: number,
  filters: VitrinePageCacheFilters = {},
) {
  const cacheKey = vitrinePageCacheKey(userId, page, filters);

  return unstable_cache(
    async () => {
      const { getVitrinePage } = await import('./vitrine/service');
      trackCacheHit(cacheKey);
      return getVitrinePage({ userId, page, filters });
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['vitrine-page', 'user', `user-${userId}`],
    },
  )();
}

export type VitrineFacetsCacheFilters = {
  banca?: string;
};

function vitrineFacetsCacheKey(userId: string, filters: VitrineFacetsCacheFilters = {}): string {
  const banca = filters.banca?.trim() || '';
  const raw = `${userId}\0${banca}`;
  const hash = createHash('sha256').update(raw).digest('hex').slice(0, 16);
  return `vitrine-facets-${hash}`;
}

/**
 * Facets da vitrine (bancas/assuntos) com RPC + fallback JS.
 * TTL 15 min; invalidar via tags `vitrine-facets` e `user-{id}`.
 */
export async function getVitrineFacetsCached(
  userId: string,
  filters: VitrineFacetsCacheFilters = {},
) {
  const cacheKey = vitrineFacetsCacheKey(userId, filters);

  return unstable_cache(
    async () => {
      const { getVitrineFacets } = await import('./vitrine/facets');
      trackCacheHit(cacheKey);
      return getVitrineFacets({ userId, banca: filters.banca });
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.STATIC,
      tags: ['vitrine-facets', 'user', `user-${userId}`],
    },
  )();
}

/**
 * Função helper para invalidar cache por tag
 * Útil para invalidação via webhook do Supabase
 */
export async function revalidateCache(tags: string[]) {
  const { revalidateTag } = await import('next/cache');

  for (const tag of tags) {
    revalidateTag(tag, CACHE_REVALIDATE_IMMEDIATE);
    logger.info('Cache invalidated', { tag });
  }
}

/**
 * Funções de invalidação específicas
 */
export const invalidateModulosCache = () =>
  revalidateCache(['modulos-estudo', 'vitrine-page', 'vitrine-facets']);
export const invalidateUserModulosCache = (userId: string) =>
  revalidateCache([
    'modulos-estudo',
    'user',
    `user-${userId}`,
    'vitrine-page',
    'vitrine-facets',
  ]);
export const invalidateQuestoesCache = () => revalidateCache(['questoes']);
export const invalidateHistoricoCache = () => revalidateCache(['historico', 'vitrine-page']);
export const invalidateVitrinePageCache = (userId?: string) =>
  revalidateCache(userId ? ['vitrine-page', `user-${userId}`] : ['vitrine-page']);
export const invalidateVitrineFacetsCache = (userId?: string) =>
  revalidateCache(userId ? ['vitrine-facets', `user-${userId}`] : ['vitrine-facets']);

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

    trackCacheHit('admin-concursos-list');
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

      trackCacheHit(cacheKey);
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
