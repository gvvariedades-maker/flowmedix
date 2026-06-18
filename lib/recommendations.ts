/**
 * Sistema de Recomendação Inteligente (híbrido)
 *
 * Combina preferências declaradas no onboarding, desempenho real no histórico
 * e revisão espaçada por padrões de erro.
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
  /** Injeta preferências já carregadas (ex.: testes ou batch). */
  declaredPreferences?: UserDeclaredPreferences | null;
}

/** Preferências declaradas no onboarding (`user_preferences_onboarding`). */
export interface UserDeclaredPreferences {
  topicos_afinidade: string[];
  topicos_dificuldade: string[];
  bancas_foco: string[];
  carga_horaria_semanal?: number | null;
}

export interface HybridRecommendationWeights {
  declared: number;
  performance: number;
  spacedRepetition: number;
}

export const HYBRID_WEIGHT_CONFIG = {
  /** Peso inicial das preferências declaradas (50%). */
  INITIAL_DECLARED: 0.5,
  /** Redução do peso declarado a cada tentativa real no histórico (10 p.p.). */
  DECLARED_DECAY_PER_ATTEMPT: 0.1,
  /** Fração do peso restante destinada à revisão espaçada (após declarado). */
  SPACED_REPETITION_SHARE_OF_REMAINDER: 0.25,
} as const;

// ============================================================================
// PESOS HÍBRIDOS
// ============================================================================

/**
 * Calcula a distribuição de pesos entre preferências declaradas, desempenho real
 * e revisão espaçada. O peso declarado começa em 50% e cai 10 p.p. por tentativa
 * registrada no histórico até zerar.
 */
export function computeHybridWeights(totalAttempts: number): HybridRecommendationWeights {
  const declared = Math.max(
    0,
    HYBRID_WEIGHT_CONFIG.INITIAL_DECLARED -
      totalAttempts * HYBRID_WEIGHT_CONFIG.DECLARED_DECAY_PER_ATTEMPT,
  );
  const remainder = 1 - declared;
  const spacedRepetition =
    remainder * HYBRID_WEIGHT_CONFIG.SPACED_REPETITION_SHARE_OF_REMAINDER;
  const performance = remainder - spacedRepetition;

  return { declared, performance, spacedRepetition };
}

// ============================================================================
// MATCHING DE TÓPICOS / BANCAS
// ============================================================================

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

/** Compara rótulo declarado com tópico/subtópico da questão (case-insensitive). */
export function topicMatchesDeclared(
  declared: string,
  topico?: string | null,
  subtopico?: string | null,
): boolean {
  const needle = normalizeLabel(declared);
  if (!needle) return false;

  const candidates = [topico, subtopico]
    .filter((v): v is string => Boolean(v))
    .map(normalizeLabel);

  return candidates.some(
    (candidate) =>
      candidate === needle || candidate.includes(needle) || needle.includes(candidate),
  );
}

function bancaMatchesDeclared(declared: string, banca?: string | null): boolean {
  if (!banca) return false;
  const needle = normalizeLabel(declared);
  const haystack = normalizeLabel(banca);
  return haystack === needle || haystack.includes(needle) || needle.includes(haystack);
}

// ============================================================================
// SCORES POR COMPONENTE (0–100 cada)
// ============================================================================

type ScoreComponent = {
  score: number;
  reasons: string[];
  category?: RecommendedQuestion['category'];
};

function calculateDeclaredScore(
  question: {
    topico?: string | null;
    subtopico?: string | null;
    banca?: string | null;
  },
  preferences: UserDeclaredPreferences | null,
): ScoreComponent {
  if (!preferences) {
    return { score: 0, reasons: [] };
  }

  let score = 0;
  const reasons: string[] = [];

  const difficultyHit = preferences.topicos_dificuldade.some((t) =>
    topicMatchesDeclared(t, question.topico, question.subtopico),
  );
  if (difficultyHit) {
    score += 85;
    reasons.push('Foco declarado no onboarding (dificuldade)');
  }

  const affinityHit = preferences.topicos_afinidade.some((t) =>
    topicMatchesDeclared(t, question.topico, question.subtopico),
  );
  if (affinityHit) {
    score += 45;
    reasons.push('Afinidade declarada no onboarding');
  }

  const bancaHit = preferences.bancas_foco.some((b) =>
    bancaMatchesDeclared(b, question.banca),
  );
  if (bancaHit) {
    score += 35;
    reasons.push('Banca alvo declarada no onboarding');
  }

  return {
    score: Math.min(100, score),
    reasons,
    category: difficultyHit ? 'weak_area' : undefined,
  };
}

function calculatePerformanceScore(
  question: {
    modulo_slug: string;
    topico?: string | null;
    subtopico?: string | null;
  },
  weakAreas: TopicPerformance[],
  historico: HistoricoQuestao[],
  lastAttempts: Map<string, string>,
): ScoreComponent {
  let score = 0;
  const reasons: string[] = [];
  let category: RecommendedQuestion['category'] = 'not_attempted';

  const topico = question.topico || 'Geral';
  const subtopico = question.subtopico || undefined;

  const weakArea = weakAreas.find(
    (w) => w.topico === topico && w.subtopico === subtopico,
  );
  if (weakArea) {
    score += 100 - weakArea.percentual;
    reasons.push(`Área fraca (${weakArea.percentual}% de acerto)`);
    category = 'weak_area';
  }

  const lastAttempt = lastAttempts.get(question.modulo_slug);
  if (!lastAttempt) {
    score += 30;
    reasons.push('Questão nunca tentada');
    category = 'not_attempted';
  }

  if (lastAttempt) {
    const hoursSince = Math.floor(
      (Date.now() - new Date(lastAttempt).getTime()) / (1000 * 60 * 60),
    );
    if (hoursSince < 24) {
      score -= 50;
      reasons.push('Respondida nas últimas 24h (penalidade)');
    }
  }

  const attempts = historico.filter((h) => h.modulo_slug === question.modulo_slug);
  if (attempts.length === 0 && category === 'not_attempted') {
    // já contabilizado acima
  } else if (attempts.length > 0 && !weakArea) {
    const accuracy = Math.round(
      (attempts.filter((a) => a.acertou).length / attempts.length) * 100,
    );
    if (accuracy < 70) {
      score += 100 - accuracy;
      reasons.push(`Desempenho real baixo (${accuracy}% de acerto)`);
      category = 'weak_area';
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
    category,
  };
}

function calculateSpacedRepetitionScore(
  question: {
    modulo_slug: string;
    topico?: string | null;
    subtopico?: string | null;
  },
  errorPatterns: ErrorPattern[],
  historico: HistoricoQuestao[],
  lastAttempts: Map<string, string>,
): ScoreComponent {
  let score = 0;
  const reasons: string[] = [];
  let category: RecommendedQuestion['category'] | undefined;

  const topico = question.topico || 'Geral';
  const subtopico = question.subtopico || undefined;

  const errorPattern = errorPatterns.find(
    (e) => e.topico === topico && e.subtopico === subtopico,
  );
  if (errorPattern) {
    score += errorPattern.errorRate * 0.8;
    reasons.push(`Padrão de erro identificado (${errorPattern.errorRate}% de erro)`);
    category = 'error_pattern';
  }

  const lastAttempt = lastAttempts.get(question.modulo_slug);
  if (lastAttempt) {
    const daysSince = Math.floor(
      (Date.now() - new Date(lastAttempt).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSince > 7) {
      score += Math.min(daysSince * 2, 50);
      reasons.push(`Última tentativa há ${daysSince} dias`);
      category = category ?? 'review_needed';
    }
  }

  const attempts = historico.filter((h) => h.modulo_slug === question.modulo_slug);
  const recentErrors = attempts.slice(0, 3).filter((a) => !a.acertou).length;
  if (recentErrors > 0) {
    score += recentErrors * 20;
    reasons.push(`${recentErrors} erro(s) recente(s)`);
    category = 'spaced_repetition';
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
    category,
  };
}

/**
 * Combina os três componentes com pesos híbridos dinâmicos.
 */
export function calculateHybridPriorityScore(
  question: {
    modulo_slug: string;
    topico?: string | null;
    subtopico?: string | null;
    banca?: string | null;
  },
  context: {
    weakAreas: TopicPerformance[];
    errorPatterns: ErrorPattern[];
    historico: HistoricoQuestao[];
    lastAttempts: Map<string, string>;
    declaredPreferences: UserDeclaredPreferences | null;
    hybridWeights: HybridRecommendationWeights;
  },
): { score: number; reason: string; category: RecommendedQuestion['category'] } {
  const declared = calculateDeclaredScore(question, context.declaredPreferences);
  const performance = calculatePerformanceScore(
    question,
    context.weakAreas,
    context.historico,
    context.lastAttempts,
  );
  const spaced = calculateSpacedRepetitionScore(
    question,
    context.errorPatterns,
    context.historico,
    context.lastAttempts,
  );

  const { declared: wDecl, performance: wPerf, spacedRepetition: wSpaced } =
    context.hybridWeights;

  const blended =
    declared.score * wDecl +
    performance.score * wPerf +
    spaced.score * wSpaced;

  const allReasons = [
    ...declared.reasons.map((r) => `[declarado] ${r}`),
    ...performance.reasons.map((r) => `[desempenho] ${r}`),
    ...spaced.reasons.map((r) => `[revisão] ${r}`),
  ];

  const weightNote = `pesos: ${Math.round(wDecl * 100)}% declarado, ${Math.round(wPerf * 100)}% desempenho, ${Math.round(wSpaced * 100)}% revisão`;
  const reason =
    allReasons.length > 0
      ? `${allReasons.join('; ')} (${weightNote})`
      : `Questão recomendada (${weightNote})`;

  const weightedCategories: Array<{
    category: RecommendedQuestion['category'];
    weight: number;
  }> = [];
  if (declared.category) {
    weightedCategories.push({ category: declared.category, weight: wDecl * declared.score });
  }
  if (performance.category) {
    weightedCategories.push({
      category: performance.category,
      weight: wPerf * performance.score,
    });
  }
  if (spaced.category) {
    weightedCategories.push({ category: spaced.category, weight: wSpaced * spaced.score });
  }

  weightedCategories.sort((a, b) => b.weight - a.weight);
  const category =
    weightedCategories[0]?.category ??
    performance.category ??
    spaced.category ??
    'not_attempted';

  return {
    score: Math.max(0, Math.round(blended * 10) / 10),
    reason,
    category,
  };
}

// ============================================================================
// PREFERÊNCIAS DO ONBOARDING
// ============================================================================

async function fetchUserDeclaredPreferences(
  userId: string,
): Promise<UserDeclaredPreferences | null> {
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
                cookieStore.set(name, value, options),
              );
            } catch {
              // Next.js já cuida dos cookies
            }
          },
        },
      },
    );

    const { data, error } = await supabase
      .from('user_preferences_onboarding')
      .select('topicos_afinidade, topicos_dificuldade, bancas_foco, carga_horaria_semanal')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      logger.warn('Failed to fetch onboarding preferences for recommendations', {
        userId,
        code: error.code,
      });
      return null;
    }

    if (!data) return null;

    return {
      topicos_afinidade: data.topicos_afinidade ?? [],
      topicos_dificuldade: data.topicos_dificuldade ?? [],
      bancas_foco: data.bancas_foco ?? [],
      carga_horaria_semanal: data.carga_horaria_semanal,
    };
  } catch (err) {
    logger.warn('Unexpected error fetching onboarding preferences', { userId, err });
    return null;
  }
}

// ============================================================================
// GERAÇÃO DE RECOMENDAÇÕES
// ============================================================================

/**
 * Gera recomendações de questões para o usuário
 */
export async function generateRecommendations(
  userId: string,
  config: RecommendationConfig = {},
): Promise<RecommendedQuestion[]> {
  const {
    maxRecommendations = 10,
    prioritizeWeakAreas = true,
    includeNotAttempted = true,
    declaredPreferences: injectedPreferences,
  } = config;

  try {
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
                  cookieStore.set(name, value, options),
                );
              } catch {
                // Next.js já cuida dos cookies
              }
            },
          },
        },
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
      return [];
    }

    const declaredPreferences =
      injectedPreferences !== undefined
        ? injectedPreferences
        : await fetchUserDeclaredPreferences(userId);

    const hybridWeights = computeHybridWeights(historico.length);

    const modulos = await getModulosEstudoCached();

    if (modulos.length === 0) {
      return [];
    }

    const analytics = await import('./analytics');
    const byTopic = analytics.analyzeByTopic(historico);
    const weakAreas = analytics.identifyWeakAreas(byTopic);
    const errorPatterns = analytics.identifyErrorPatterns(historico);

    const lastAttempts = new Map<string, string>();
    historico.forEach((h) => {
      const existing = lastAttempts.get(h.modulo_slug);
      if (!existing || h.created_at > existing) {
        lastAttempts.set(h.modulo_slug, h.created_at);
      }
    });

    const scoreContext = {
      weakAreas,
      errorPatterns,
      historico,
      lastAttempts,
      declaredPreferences,
      hybridWeights,
    };

    const recommendations: RecommendedQuestion[] = modulos.map((modulo) => {
      const { score, reason, category } = calculateHybridPriorityScore(
        {
          modulo_slug: modulo.modulo_slug,
          topico: (modulo as { topico?: string | null }).topico,
          subtopico: (modulo as { subtopico?: string | null }).subtopico,
          banca: modulo.banca,
        },
        scoreContext,
      );

      return {
        modulo_slug: modulo.modulo_slug,
        titulo_aula: modulo.titulo_aula || undefined,
        banca: modulo.banca,
        topico: (modulo as { topico?: string | null }).topico || undefined,
        subtopico: (modulo as { subtopico?: string | null }).subtopico || undefined,
        priority: score,
        reason,
        category,
      };
    });

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
  limit: number = 5,
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
  limit: number = 5,
): Promise<RecommendedQuestion[]> {
  const recommendations = await generateRecommendations(userId, {
    maxRecommendations: limit * 2,
    prioritizeWeakAreas: false,
    prioritizeErrorPatterns: true,
    includeNotAttempted: false,
  });

  return recommendations
    .filter((r) => r.category === 'spaced_repetition' || r.category === 'review_needed')
    .slice(0, limit);
}
