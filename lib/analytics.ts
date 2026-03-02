/**
 * Sistema de Analytics e Insights Avançados
 * 
 * Funções para análise de dados de desempenho do usuário
 */

import { logger } from './logger';
import { unstable_cache } from 'next/cache';
import { CACHE_CONFIG } from './cache';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface HistoricoQuestao {
  id: string;
  user_id: string;
  modulo_slug: string;
  topico: string | null;
  subtopico: string | null;
  banca: string | null;
  acertou: boolean;
  created_at: string;
}

export interface PerformanceStats {
  total: number;
  acertos: number;
  erros: number;
  percentual: number;
  streak: number;
  lastAttempt?: string;
}

export interface TopicPerformance {
  topico: string;
  subtopico?: string;
  total: number;
  acertos: number;
  erros: number;
  percentual: number;
  lastAttempt?: string;
}

export interface BancaPerformance {
  banca: string;
  total: number;
  acertos: number;
  erros: number;
  percentual: number;
}

export interface TimeSeriesData {
  date: string;
  acertos: number;
  erros: number;
  total: number;
  percentual: number;
}

export interface ErrorPattern {
  topico: string;
  subtopico?: string;
  errorRate: number;
  totalAttempts: number;
  lastError?: string;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface AnalyticsSummary {
  overall: PerformanceStats;
  byTopic: TopicPerformance[];
  byBanca: BancaPerformance[];
  timeSeries: TimeSeriesData[];
  errorPatterns: ErrorPattern[];
  weakAreas: TopicPerformance[];
  strongAreas: TopicPerformance[];
}

// ============================================================================
// FUNÇÕES DE ANÁLISE
// ============================================================================

/**
 * Busca histórico completo do usuário (com cache)
 */
export async function getHistoricoCompleto(userId: string): Promise<HistoricoQuestao[]> {
  const cacheKey = `analytics-historico-${userId}`;
  
  return unstable_cache(
    async () => {
      try {
        // Criar cliente Supabase dentro do cache function
        const cookieStore = await cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return cookieStore.getAll();
              },
              setAll(cookiesToSet) {
                try {
                  cookiesToSet.forEach(({ name, value, options }) =>
                    cookieStore.set(name, value, options)
                  );
                } catch {
                  // Next.js já cuida dos cookies em Server Components
                }
              },
            },
          }
        );
        
        const { data, error } = await supabase
          .from('historico_questoes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5000); // Limite razoável para analytics
        
        if (error) {
          logger.error('Failed to fetch complete history', error, { userId });
          return [];
        }
        
        return (data || []) as HistoricoQuestao[];
      } catch (error) {
        logger.error('Unexpected error fetching history', error, { userId });
        return [];
      }
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['analytics', 'historico', `user-${userId}`],
    }
  )();
}

/**
 * Calcula estatísticas gerais de desempenho
 */
export function calculateOverallStats(historico: HistoricoQuestao[]): PerformanceStats {
  if (historico.length === 0) {
    return {
      total: 0,
      acertos: 0,
      erros: 0,
      percentual: 0,
      streak: 0,
    };
  }

  const acertos = historico.filter((h) => h.acertou).length;
  const erros = historico.length - acertos;
  const percentual = Math.round((acertos / historico.length) * 100);

  // Calcular streak atual (sequência de acertos consecutivos)
  let streak = 0;
  for (let i = 0; i < historico.length; i++) {
    if (historico[i].acertou) {
      streak++;
    } else {
      break;
    }
  }

  const sorted = [...historico].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    total: historico.length,
    acertos,
    erros,
    percentual,
    streak,
    lastAttempt: sorted[0]?.created_at,
  };
}

/**
 * Analisa desempenho por tópico/subtópico
 */
export function analyzeByTopic(historico: HistoricoQuestao[]): TopicPerformance[] {
  const topicMap = new Map<string, TopicPerformance>();

  historico.forEach((h) => {
    const key = h.subtopico 
      ? `${h.topico || 'Geral'}::${h.subtopico}`
      : h.topico || 'Geral';
    
    const existing = topicMap.get(key) || {
      topico: h.topico || 'Geral',
      subtopico: h.subtopico || undefined,
      total: 0,
      acertos: 0,
      erros: 0,
      percentual: 0,
    };

    existing.total++;
    if (h.acertou) {
      existing.acertos++;
    } else {
      existing.erros++;
    }
    existing.percentual = Math.round((existing.acertos / existing.total) * 100);

    // Atualizar última tentativa
    if (!existing.lastAttempt || h.created_at > existing.lastAttempt) {
      existing.lastAttempt = h.created_at;
    }

    topicMap.set(key, existing);
  });

  return Array.from(topicMap.values()).sort((a, b) => b.total - a.total);
}

/**
 * Analisa desempenho por banca examinadora
 */
export function analyzeByBanca(historico: HistoricoQuestao[]): BancaPerformance[] {
  const bancaMap = new Map<string, BancaPerformance>();

  historico.forEach((h) => {
    const banca = h.banca || 'Desconhecida';
    const existing = bancaMap.get(banca) || {
      banca,
      total: 0,
      acertos: 0,
      erros: 0,
      percentual: 0,
    };

    existing.total++;
    if (h.acertou) {
      existing.acertos++;
    } else {
      existing.erros++;
    }
    existing.percentual = Math.round((existing.acertos / existing.total) * 100);

    bancaMap.set(banca, existing);
  });

  return Array.from(bancaMap.values()).sort((a, b) => b.total - a.total);
}

/**
 * Gera dados de série temporal (progresso ao longo do tempo)
 */
export function generateTimeSeries(
  historico: HistoricoQuestao[],
  days: number = 30
): TimeSeriesData[] {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  // Agrupar por dia
  const dailyMap = new Map<string, { acertos: number; erros: number }>();

  historico
    .filter((h) => new Date(h.created_at) >= startDate)
    .forEach((h) => {
      const date = new Date(h.created_at).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { acertos: 0, erros: 0 };

      if (h.acertou) {
        existing.acertos++;
      } else {
        existing.erros++;
      }

      dailyMap.set(date, existing);
    });

  // Converter para array e preencher dias faltantes
  const result: TimeSeriesData[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const data = dailyMap.get(dateStr) || { acertos: 0, erros: 0 };
    const total = data.acertos + data.erros;
    const percentual = total > 0 ? Math.round((data.acertos / total) * 100) : 0;

    result.push({
      date: dateStr,
      acertos: data.acertos,
      erros: data.erros,
      total,
      percentual,
    });
  }

  return result;
}

/**
 * Identifica padrões de erro
 */
export function identifyErrorPatterns(
  historico: HistoricoQuestao[],
  minAttempts: number = 3
): ErrorPattern[] {
  const topicMap = new Map<string, HistoricoQuestao[]>();

  // Agrupar por tópico/subtópico
  historico.forEach((h) => {
    const key = h.subtopico 
      ? `${h.topico || 'Geral'}::${h.subtopico}`
      : h.topico || 'Geral';
    
    const existing = topicMap.get(key) || [];
    existing.push(h);
    topicMap.set(key, existing);
  });

  const patterns: ErrorPattern[] = [];

  topicMap.forEach((attempts, key) => {
    if (attempts.length < minAttempts) return;

    const errors = attempts.filter((a) => !a.acertou);
    const errorRate = errors.length / attempts.length;

    // Calcular tendência (últimas 5 tentativas vs anteriores)
    const recent = attempts.slice(0, 5);
    const older = attempts.slice(5);
    
    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (recent.length >= 3 && older.length >= 3) {
      const recentErrorRate = recent.filter((a) => !a.acertou).length / recent.length;
      const olderErrorRate = older.filter((a) => !a.acertou).length / older.length;
      
      if (recentErrorRate < olderErrorRate - 0.1) {
        trend = 'improving';
      } else if (recentErrorRate > olderErrorRate + 0.1) {
        trend = 'worsening';
      }
    }

    const [topico, subtopico] = key.split('::');

    patterns.push({
      topico,
      subtopico: subtopico || undefined,
      errorRate: Math.round(errorRate * 100),
      totalAttempts: attempts.length,
      lastError: errors[0]?.created_at,
      trend,
    });
  });

  return patterns
    .filter((p) => p.errorRate > 30) // Apenas áreas com taxa de erro > 30%
    .sort((a, b) => b.errorRate - a.errorRate);
}

/**
 * Identifica áreas fracas (taxa de acerto < 70%)
 */
export function identifyWeakAreas(
  topicPerformance: TopicPerformance[]
): TopicPerformance[] {
  return topicPerformance
    .filter((t) => t.percentual < 70 && t.total >= 3)
    .sort((a, b) => a.percentual - b.percentual);
}

/**
 * Identifica áreas fortes (taxa de acerto >= 90%)
 */
export function identifyStrongAreas(
  topicPerformance: TopicPerformance[]
): TopicPerformance[] {
  return topicPerformance
    .filter((t) => t.percentual >= 90 && t.total >= 5)
    .sort((a, b) => b.percentual - a.percentual);
}

/**
 * Gera resumo completo de analytics
 */
export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  try {
    const historico = await getHistoricoCompleto(userId);

    // Se não há histórico, retorna estrutura vazia mas válida
    if (historico.length === 0) {
      return {
        overall: {
          total: 0,
          acertos: 0,
          erros: 0,
          percentual: 0,
          streak: 0,
        },
        byTopic: [],
        byBanca: [],
        timeSeries: generateTimeSeries([], 30),
        errorPatterns: [],
        weakAreas: [],
        strongAreas: [],
      };
    }

    const overall = calculateOverallStats(historico);
    const byTopic = analyzeByTopic(historico);
    const byBanca = analyzeByBanca(historico);
    const timeSeries = generateTimeSeries(historico, 30);
    const errorPatterns = identifyErrorPatterns(historico);
    const weakAreas = identifyWeakAreas(byTopic);
    const strongAreas = identifyStrongAreas(byTopic);

    return {
      overall,
      byTopic,
      byBanca,
      timeSeries,
      errorPatterns,
      weakAreas,
      strongAreas,
    };
  } catch (error) {
    logger.error('Failed to generate analytics summary', error, { userId });
    // Retorna estrutura vazia em caso de erro
    return {
      overall: {
        total: 0,
        acertos: 0,
        erros: 0,
        percentual: 0,
        streak: 0,
      },
      byTopic: [],
      byBanca: [],
      timeSeries: generateTimeSeries([], 30),
      errorPatterns: [],
      weakAreas: [],
      strongAreas: [],
    };
  }
}

/**
 * Busca histórico completo (sem cache, para uso em APIs)
 */
export async function getHistoricoCompletoUncached(userId: string): Promise<HistoricoQuestao[]> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Next.js já cuida dos cookies em Server Components
            }
          },
        },
      }
    );
    
    const { data, error } = await supabase
      .from('historico_questoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5000);
    
    if (error) {
      logger.error('Failed to fetch complete history', error, { userId });
      return [];
    }
    
    return (data || []) as HistoricoQuestao[];
  } catch (error) {
    logger.error('Unexpected error fetching history', error, { userId });
    return [];
  }
}
