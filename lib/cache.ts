/**
 * Sistema de Cache Estratégico para AVANT
 * 
 * Estratégias de cache:
 * - Dados estáticos (módulos, questões): 5-15 minutos
 * - Dados dinâmicos (histórico por usuário): 1-2 minutos
 * - Dados de sessão: Cache em memória durante request
 */

import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Cliente Supabase SEM cookies - para uso dentro de unstable_cache.
// Dados públicos (módulos, questões, fluxogramas) usam anon key.
// IMPORTANTE: Nunca use cookies() dentro de funções em unstable_cache.
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

/**
 * Cache para lista de módulos de estudo
 * Revalida a cada 5 minutos (dados semi-estáticos)
 */
// Cache wrapper com tracking
const modulosCacheFn = unstable_cache(
  async () => {
    const supabase = supabaseAnon;
    
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, modulo_slug, modulo_nome, titulo_aula, banca, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      logger.error('Failed to fetch modules from cache', error);
      trackCacheMiss('modulos-estudo-list');
      return [];
    }
    
    trackCacheHit('modulos-estudo-list');
    return data || [];
  },
  ['modulos-estudo-list'],
  {
    ...CACHE_CONFIG.SEMI_STATIC,
    tags: ['modulos-estudo', 'semi-static'],
  }
);

export const getModulosEstudoCached = modulosCacheFn;

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
      const supabase = supabaseAnon;
      
      // OTIMIZAÇÃO: Seleciona apenas campos necessários (não *)
      const { data, error } = await supabase
        .from('modulos_estudo')
        .select('id, modulo_slug, conteudo_json, banca, modulo_nome, created_at')
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
 * Cache para lista de questões por banca e módulo
 * Usado para navegação entre questões
 * Revalida a cada 5 minutos
 */
export async function getQuestoesByBancaCached(banca: string, moduloNome: string | null) {
  const cacheKey = `questoes-banca-${banca}-modulo-${moduloNome || 'null'}`;
  
  return unstable_cache(
    async () => {
      const supabase = supabaseAnon;
      
      let query = supabase
        .from('modulos_estudo')
        .select('modulo_slug, id')
        .eq('banca', banca);
      
      if (moduloNome === null) {
        query = query.is('modulo_nome', null);
      } else {
        query = query.eq('modulo_nome', moduloNome);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (error) {
        logger.error('Failed to fetch questions list from cache', error, { banca, moduloNome });
        trackCacheMiss(cacheKey);
        return [];
      }
      
      trackCacheHit(cacheKey);
      return data || [];
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.SEMI_STATIC,
      tags: ['questoes', 'semi-static', `banca-${banca}`],
    }
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
      
      const { data, error } = await supabase
        .from('historico_questoes')
        .select('modulo_slug, acertou')
        .eq('user_id', userId)
        .limit(1000);
      
      if (error) {
        logger.error('Failed to fetch history from cache', error, { userId });
        trackCacheMiss(cacheKey);
        return [];
      }
      
      trackCacheHit(cacheKey);
      return data || [];
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
      const supabase = supabaseAnon;
      
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
    const supabase = supabaseAnon;
    
    const { data, error } = await supabase
      .from('flowcharts')
      .select('id, title, slug, modulo_id')
      .order('created_at', { ascending: false })
      .limit(100);
    
      if (error) {
        logger.error('Failed to fetch flowcharts from cache', error);
        trackCacheMiss('fluxogramas-list');
        return [];
      }
      
      trackCacheHit('fluxogramas-list');
      return data || [];
  },
  ['fluxogramas-list'],
  {
    ...CACHE_CONFIG.STATIC,
    tags: ['fluxogramas', 'static'],
  }
);

/**
 * Função helper para invalidar cache por tag
 * Útil para invalidação via webhook do Supabase
 */
export async function revalidateCache(tags: string[]) {
  const { revalidateTag } = await import('next/cache');
  
  tags.forEach((tag) => {
    revalidateTag(tag);
    logger.info('Cache invalidated', { tag });
  });
}

/**
 * Funções de invalidação específicas
 */
export const invalidateModulosCache = () => revalidateCache(['modulos-estudo']);
export const invalidateQuestoesCache = () => revalidateCache(['questoes']);
export const invalidateFluxogramasCache = () => revalidateCache(['fluxogramas']);
export const invalidateHistoricoCache = () => revalidateCache(['historico']);

/**
 * Invalidação completa de cache (usar com cuidado)
 */
export const invalidateAllCache = () => 
  revalidateCache(['static', 'semi-static', 'dynamic', 'user']);
