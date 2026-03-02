/**
 * Sistema de Revisão Espaçada (Spaced Repetition)
 * 
 * Algoritmo baseado na curva de esquecimento de Ebbinghaus
 * para otimizar revisões de questões erradas
 */

import type { HistoricoQuestao } from './analytics';
import { logger } from './logger';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface ReviewItem {
  modulo_slug: string;
  topico?: string;
  subtopico?: string;
  nextReview: Date;
  interval: number; // dias até próxima revisão
  easeFactor: number; // fator de facilidade (SM-2 algorithm)
  repetitions: number; // número de revisões bem-sucedidas
  lastReview?: Date;
  priority: number;
}

export interface SpacedRepetitionConfig {
  initialInterval?: number; // dias (padrão: 1)
  easeFactor?: number; // fator inicial (padrão: 2.5)
  minEaseFactor?: number; // mínimo (padrão: 1.3)
}

// ============================================================================
// ALGORITMO SM-2 (SIMPLIFICADO)
// ============================================================================

/**
 * Calcula intervalo para próxima revisão (algoritmo SM-2 simplificado)
 */
function calculateNextInterval(
  currentInterval: number,
  easeFactor: number,
  quality: number // 0-5 (0 = erro completo, 5 = lembrou perfeitamente)
): { interval: number; easeFactor: number } {
  // Ajustar ease factor baseado na qualidade
  let newEaseFactor = easeFactor;
  
  if (quality < 3) {
    // Errou ou lembrou com dificuldade
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
    return {
      interval: 1, // Revisar amanhã
      easeFactor: newEaseFactor,
    };
  } else if (quality === 3) {
    // Lembrou com dificuldade
    newEaseFactor = Math.max(1.3, easeFactor - 0.15);
    return {
      interval: Math.max(1, Math.floor(currentInterval * 1.2)),
      easeFactor: newEaseFactor,
    };
  } else {
    // Lembrou bem ou perfeitamente
    newEaseFactor = Math.min(2.5, easeFactor + 0.1);
    const multiplier = quality === 4 ? 1.5 : 2.0;
    return {
      interval: Math.max(1, Math.floor(currentInterval * multiplier * newEaseFactor)),
      easeFactor: newEaseFactor,
    };
  }
}

/**
 * Converte resultado de questão (acertou/errou) em qualidade (0-5)
 */
function acertouToQuality(acertou: boolean, attempts: number): number {
  if (!acertou) {
    return 0; // Erro completo
  }
  
  // Se acertou, qualidade baseada no número de tentativas
  // Primeira tentativa correta = 5 (perfeito)
  // Segunda tentativa correta = 4 (bom)
  // Terceira+ tentativa correta = 3 (ok)
  if (attempts === 1) return 5;
  if (attempts === 2) return 4;
  return 3;
}

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Gera lista de questões para revisar hoje
 */
export async function getTodayReviews(userId: string): Promise<ReviewItem[]> {
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
        logger.error('Failed to fetch history for reviews', error, { userId });
        return [];
      }

      historico = (data || []) as HistoricoQuestao[];
    } catch (err) {
      logger.error('Failed to get complete history for reviews', err, { userId });
      // Se falhar, retorna lista vazia
      return [];
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Agrupar tentativas por módulo
    const moduleMap = new Map<string, HistoricoQuestao[]>();
    historico.forEach((h) => {
      const existing = moduleMap.get(h.modulo_slug) || [];
      existing.push(h);
      moduleMap.set(h.modulo_slug, existing);
    });

    const reviews: ReviewItem[] = [];

    moduleMap.forEach((attempts, moduloSlug) => {
      // Ordenar por data (mais recente primeiro)
      const sorted = [...attempts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const lastAttempt = sorted[0];
      const lastDate = new Date(lastAttempt.created_at);
      lastDate.setHours(0, 0, 0, 0);

      // Calcular intervalo baseado no histórico
      let interval = 1;
      let easeFactor = 2.5;
      let repetitions = 0;

      // Simular algoritmo SM-2 com histórico
      for (let i = 0; i < Math.min(sorted.length, 10); i++) {
        const attempt = sorted[i];
        const quality = acertouToQuality(attempt.acertou, i + 1);
        
        const result = calculateNextInterval(interval, easeFactor, quality);
        interval = result.interval;
        easeFactor = result.easeFactor;
        
        if (attempt.acertou) {
          repetitions++;
        } else {
          repetitions = Math.max(0, repetitions - 1);
        }
      }

      // Calcular próxima revisão
      const nextReview = new Date(lastDate);
      nextReview.setDate(nextReview.getDate() + interval);

      // Se próxima revisão é hoje ou passou, incluir na lista
      if (nextReview <= today) {
        // Calcular prioridade (quanto mais urgente, maior)
        const daysOverdue = Math.floor(
          (today.getTime() - nextReview.getTime()) / (1000 * 60 * 60 * 24)
        );
        const priority = daysOverdue * 10 + (lastAttempt.acertou ? 0 : 50);

        reviews.push({
          modulo_slug: moduloSlug,
          topico: lastAttempt.topico || undefined,
          subtopico: lastAttempt.subtopico || undefined,
          nextReview,
          interval,
          easeFactor,
          repetitions,
          lastReview: lastDate,
          priority,
        });
      }
    });

    // Ordenar por prioridade (maior primeiro)
    return reviews.sort((a, b) => b.priority - a.priority);
  } catch (error) {
    logger.error('Failed to get today reviews', error, { userId });
    return [];
  }
}

/**
 * Registra resultado de revisão e atualiza intervalo
 */
export function recordReviewResult(
  currentItem: ReviewItem,
  acertou: boolean
): ReviewItem {
  const attempts = currentItem.repetitions + 1;
  const quality = acertouToQuality(acertou, attempts);

  const { interval, easeFactor } = calculateNextInterval(
    currentItem.interval,
    currentItem.easeFactor,
    quality
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    ...currentItem,
    interval,
    easeFactor,
    repetitions: acertou ? currentItem.repetitions + 1 : Math.max(0, currentItem.repetitions - 1),
    lastReview: new Date(),
    nextReview,
    priority: 0, // Reset priority após revisão
  };
}

/**
 * Conta quantas questões estão vencidas para revisão
 */
export async function getOverdueCount(userId: string): Promise<number> {
  const reviews = await getTodayReviews(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return reviews.filter((r) => r.nextReview < today).length;
}

/**
 * Estima tempo necessário para revisar todas as questões vencidas
 */
export async function estimateReviewTime(userId: string): Promise<number> {
  const reviews = await getTodayReviews(userId);
  // Estimativa: 2 minutos por questão
  return reviews.length * 2;
}
