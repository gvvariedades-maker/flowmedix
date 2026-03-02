/**
 * Sistema de Recomendação Inteligente
 * 
 * Algoritmo de priorização baseado em desempenho do usuário
 */

import type { TopicPerformance, HistoricoQuestao, ErrorPattern } from './analytics';
import { getModulosEstudoCached } from './cache';
import { logger } from './logger';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface RecommendedQuestion {
  modulo_slug: string;
  titulo_aula?: string;
  banca?: string;
  topico?: string;
  subtopico?: string;
  priority: number;
  reason: string;
  category: 'weak_area' | 'error_pattern' | 'not_attempted' | 'review_needed' | 'spaced_repetition';
}

export interface RecommendationConfig {
  maxRecommendations?: number;
  prioritizeWeakAreas?: boolean;
  prioritizeErrorPatterns?: boolean;
  includeNotAttempted?: boolean;
}

// ============================================================================
// ALGORITMO DE PRIORIZAÇÃO
// ============================================================================

/**
 * Calcula score de prioridade para uma questão
 */
function calculatePriorityScore(
  question: {
    modulo_slug: string;
    topico?: string | null;
    subtopico?: string | null;
    banca?: string | null;
  },
  weakAreas: TopicPerformance[],
  errorPatterns: ErrorPattern[],
  historico: HistoricoQuestao[],
  lastAttempts: Map<string, string>
): { score: number; reason: string; category: RecommendedQuestion['category'] } {
  let score = 0;
  const reasons: string[] = [];
  let category: RecommendedQuestion['category'] = 'not_attempted';

  const topico = question.topico || 'Geral';
  const subtopico = question.subtopico || undefined;
  const key = subtopico ? `${topico}::${subtopico}` : topico;

  // 1. Verificar se é área fraca
  const weakArea = weakAreas.find(
    (w) => w.topico === topico && w.subtopico === subtopico
  );
  if (weakArea) {
    score += 100 - weakArea.percentual; // Quanto menor o percentual, maior o score
    reasons.push(`Área fraca (${weakArea.percentual}% de acerto)`);
    category = 'weak_area';
  }

  // 2. Verificar padrão de erro
  const errorPattern = errorPatterns.find(
    (e) => e.topico === topico && e.subtopico === subtopico
  );
  if (errorPattern) {
    score += errorPattern.errorRate * 0.8; // Taxa de erro contribui para score
    reasons.push(`Padrão de erro identificado (${errorPattern.errorRate}% de erro)`);
    if (category === 'not_attempted') {
      category = 'error_pattern';
    }
  }

  // 3. Verificar última tentativa (quanto mais antiga, maior prioridade)
  const lastAttempt = lastAttempts.get(question.modulo_slug);
  if (lastAttempt) {
    const daysSince = Math.floor(
      (Date.now() - new Date(lastAttempt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince > 7) {
      score += Math.min(daysSince * 2, 50); // Máximo 50 pontos
      reasons.push(`Última tentativa há ${daysSince} dias`);
      if (category === 'not_attempted') {
        category = 'review_needed';
      }
    }
  } else {
    // Nunca tentada
    score += 30;
    reasons.push('Questão nunca tentada');
    category = 'not_attempted';
  }

  // 4. Verificar tentativas anteriores (se errou recentemente, aumenta prioridade)
  const attempts = historico.filter((h) => h.modulo_slug === question.modulo_slug);
  const recentErrors = attempts
    .slice(0, 3)
    .filter((a) => !a.acertou).length;
  
  if (recentErrors > 0) {
    score += recentErrors * 20;
    reasons.push(`${recentErrors} erro(s) recente(s)`);
    if (category === 'not_attempted' || category === 'review_needed') {
      category = 'spaced_repetition';
    }
  }

  // 5. Penalizar questões muito recentes (evitar spam)
  if (lastAttempt) {
    const hoursSince = Math.floor(
      (Date.now() - new Date(lastAttempt).getTime()) / (1000 * 60 * 60)
    );
    if (hoursSince < 24) {
      score -= 50; // Penalidade para questões respondidas nas últimas 24h
    }
  }

  return {
    score: Math.max(0, score), // Garantir score não negativo
    reason: reasons.join('; ') || 'Questão recomendada',
    category,
  };
}

/**
 * Gera recomendações de questões para o usuário
 */
export async function generateRecommendations(
  userId: string,
  config: RecommendationConfig = {}
): Promise<RecommendedQuestion[]> {
  const {
    maxRecommendations = 10,
    prioritizeWeakAreas = true,
    prioritizeErrorPatterns = true,
    includeNotAttempted = true,
  } = config;

  try {
    // Buscar histórico diretamente (sem cache para evitar problemas com cookies)
    let historico: HistoricoQuestao[] = [];
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
                // Next.js já cuida dos cookies
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
        logger.error('Failed to fetch history for recommendations', error, { userId });
        return [];
      }

      historico = (data || []) as HistoricoQuestao[];
    } catch (err) {
      logger.error('Failed to get complete history for recommendations', err, { userId });
      // Se falhar, retorna recomendações vazias
      return [];
    }

    const modulos = await getModulosEstudoCached();

    if (modulos.length === 0) {
      return [];
    }

    // Analisar desempenho
    const analytics = await import('./analytics');
    const byTopic = analytics.analyzeByTopic(historico);
    const weakAreas = analytics.identifyWeakAreas(byTopic);
    const errorPatterns = analytics.identifyErrorPatterns(historico);

    // Criar mapa de últimas tentativas por módulo
    const lastAttempts = new Map<string, string>();
    historico.forEach((h) => {
      const existing = lastAttempts.get(h.modulo_slug);
      if (!existing || h.created_at > existing) {
        lastAttempts.set(h.modulo_slug, h.created_at);
      }
    });

    // Calcular scores para todas as questões
    const recommendations: RecommendedQuestion[] = modulos.map((modulo) => {
      const { score, reason, category } = calculatePriorityScore(
        {
          modulo_slug: modulo.modulo_slug,
          topico: (modulo as any).topico,
          subtopico: (modulo as any).subtopico,
          banca: modulo.banca,
        },
        weakAreas,
        errorPatterns,
        historico,
        lastAttempts
      );

      return {
        modulo_slug: modulo.modulo_slug,
        titulo_aula: modulo.titulo_aula || undefined,
        banca: modulo.banca,
        topico: (modulo as any).topico || undefined,
        subtopico: (modulo as any).subtopico || undefined,
        priority: score,
        reason,
        category,
      };
    });

    // Filtrar e ordenar
    let filtered = recommendations;

    if (!includeNotAttempted) {
      filtered = filtered.filter((r) => r.category !== 'not_attempted');
    }

    if (prioritizeWeakAreas) {
      filtered = filtered.sort((a, b) => {
        if (a.category === 'weak_area' && b.category !== 'weak_area') return -1;
        if (a.category !== 'weak_area' && b.category === 'weak_area') return 1;
        return b.priority - a.priority;
      });
    } else {
      filtered = filtered.sort((a, b) => b.priority - a.priority);
    }

    return filtered.slice(0, maxRecommendations);
  } catch (error) {
    logger.error('Failed to generate recommendations', error, { userId });
    return [];
  }
}

/**
 * Gera recomendações focadas em áreas fracas
 */
export async function getWeakAreaRecommendations(
  userId: string,
  limit: number = 5
): Promise<RecommendedQuestion[]> {
  return generateRecommendations(userId, {
    maxRecommendations: limit,
    prioritizeWeakAreas: true,
    prioritizeErrorPatterns: true,
    includeNotAttempted: true,
  });
}

/**
 * Gera recomendações para revisão espaçada
 */
export async function getSpacedRepetitionRecommendations(
  userId: string,
  limit: number = 5
): Promise<RecommendedQuestion[]> {
  const recommendations = await generateRecommendations(userId, {
    maxRecommendations: limit * 2,
    prioritizeWeakAreas: false,
    prioritizeErrorPatterns: true,
    includeNotAttempted: false,
  });

  // Filtrar apenas questões que precisam de revisão
  return recommendations
    .filter((r) => r.category === 'spaced_repetition' || r.category === 'review_needed')
    .slice(0, limit);
}
