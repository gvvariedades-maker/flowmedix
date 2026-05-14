/**
 * Sistema de Cache Estratégico para AVANT
 * 
 * Estratégias de cache:
 * - Dados estáticos (módulos, questões): 5-15 minutos
 * - Dados dinâmicos (histórico por usuário): 1-2 minutos
 * - Dados de sessão: Cache em memória durante request
 */

import { unstable_cache } from 'next/cache';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cache as cacheByRequest } from 'react';
import { logger } from './logger';
import { DataServiceUnavailableError } from './dataServiceError';
import { withPostgrestReadRetry } from './supabaseReadRetry';

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
const MODULOS_ESTUDO_VITRINE_LIMIT = 5000;

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
 * Cache para fluxogramas por assunto
 * Revalida a cada 15 minutos (dados estáticos)
 */
export async function getFluxogramaByAssuntoCached(assuntoId: string) {
  const cacheKey = `fluxograma-assunto-${assuntoId}`;
  
  return unstable_cache(
    async () => {
      const supabase = getSupabaseAnon();
      if (!supabase) {
        return null;
      }

      const { data, error } = await supabase
        .from('exam_contents')
        .select(`
          id,
          subtopic_id,
          flowchart_id,
          flowcharts (
            id,
            title,
            content,
            modulo_id,
            slug
          )
        `)
        .eq('subtopic_id', assuntoId)
        .maybeSingle();
      
      if (error) {
        logger.error('Failed to fetch flowchart from cache', error, { assuntoId });
        return null;
      }
      
      return data;
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.STATIC,
      tags: ['fluxograma', 'static', `assunto-${assuntoId}`],
    }
  )();
}

/**
 * Cache para lista de fluxogramas
 * Revalida a cada 15 minutos
 */
export const getFluxogramasCached = unstable_cache(
  async () => {
    const supabase = getSupabaseAnon();
    if (!supabase) {
      trackCacheMiss('fluxogramas-list');
      return [];
    }

    const data = await withPostgrestReadRetry('flowcharts-list', async () =>
      supabase
        .from('flowcharts')
        .select('id, title, slug, modulo_id')
        .order('created_at', { ascending: false })
        .limit(100),
    );
    trackCacheHit('fluxogramas-list');
    return data ?? [];
  },
  ['fluxogramas-list'],
  {
    ...CACHE_CONFIG.STATIC,
    tags: ['fluxogramas', 'static'],
  }
);

/**
 * Perfil de revalidação imediata (Next.js 16+).
 * Um objeto vazio `{}` não é perfil documentado e pode não expirar o cache corretamente.
 * @see https://nextjs.org/docs/app/api-reference/functions/revalidateTag
 */
export const CACHE_REVALIDATE_IMMEDIATE = { expire: 0 } as const;

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
export const invalidateModulosCache = () => revalidateCache(['modulos-estudo']);
export const invalidateUserModulosCache = (userId: string) =>
  revalidateCache(['modulos-estudo', 'user', `user-${userId}`]);
export const invalidateQuestoesCache = () => revalidateCache(['questoes']);
export const invalidateFluxogramasCache = () => revalidateCache(['fluxogramas']);
export const invalidateHistoricoCache = () => revalidateCache(['historico']);

/**
 * Invalidação completa de cache (usar com cuidado)
 */
export const invalidateAllCache = () => 
  revalidateCache(['static', 'semi-static', 'dynamic', 'user']);
