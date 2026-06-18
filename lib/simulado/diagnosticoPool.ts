import type { ModuloEstudoListRow } from '@/lib/concursos/entitlements';
import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import { tituloMatchesOnboardingAreas } from '@/lib/onboarding/topicAreas';
import {
  calculateHybridPriorityScore,
  computeHybridWeights,
  type UserDeclaredPreferences,
} from '@/lib/recommendations';
import type { HistoricoQuestao } from '@/lib/analytics';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { SimuladoPoolItem } from '@/lib/simulado/rpc';
import {
  clampDiagnosticoQuantidade,
  SIMULADO_DIAGNOSTICO_QUANTIDADE_DEFAULT,
} from '@/lib/simulado/diagnosticoConstants';

type ScoredModulo = {
  modulo: ModuloEstudoListRow;
  priority: number;
  category: string;
  bucket: 'difficulty' | 'affinity' | 'spread';
};

const BUCKET_QUOTAS = {
  difficulty: 0.4,
  affinity: 0.3,
  spread: 0.3,
} as const;

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

function classifyBucket(
  modulo: ModuloEstudoListRow,
  preferences: UserDeclaredPreferences | null,
  category: string,
): ScoredModulo['bucket'] {
  if (
    preferences &&
    tituloMatchesOnboardingAreas(modulo.titulo_aula, preferences.topicos_dificuldade)
  ) {
    return 'difficulty';
  }
  if (category === 'weak_area' || category === 'error_pattern') {
    return 'difficulty';
  }
  if (
    preferences &&
    tituloMatchesOnboardingAreas(modulo.titulo_aula, preferences.topicos_afinidade)
  ) {
    return 'affinity';
  }
  return 'spread';
}

function pickBalancedPool(scored: ScoredModulo[], quantidade: number): ScoredModulo[] {
  const targets = {
    difficulty: Math.round(quantidade * BUCKET_QUOTAS.difficulty),
    affinity: Math.round(quantidade * BUCKET_QUOTAS.affinity),
    spread: quantidade,
  };
  targets.spread = Math.max(
    0,
    quantidade - targets.difficulty - targets.affinity,
  );

  const buckets: Record<ScoredModulo['bucket'], ScoredModulo[]> = {
    difficulty: [],
    affinity: [],
    spread: [],
  };

  for (const item of scored) {
    buckets[item.bucket].push(item);
  }

  for (const key of Object.keys(buckets) as ScoredModulo['bucket'][]) {
    buckets[key].sort((a, b) => b.priority - a.priority);
  }

  const picked: ScoredModulo[] = [];
  const seen = new Set<string>();

  const takeFrom = (bucket: ScoredModulo['bucket'], limit: number) => {
    let count = 0;
    for (const item of buckets[bucket]) {
      if (count >= limit || picked.length >= quantidade) break;
      if (seen.has(item.modulo.modulo_slug)) continue;
      seen.add(item.modulo.modulo_slug);
      picked.push(item);
      count += 1;
    }
  };

  takeFrom('difficulty', targets.difficulty);
  takeFrom('affinity', targets.affinity);
  takeFrom('spread', targets.spread);

  if (picked.length < quantidade) {
    for (const item of scored) {
      if (picked.length >= quantidade) break;
      if (seen.has(item.modulo.modulo_slug)) continue;
      seen.add(item.modulo.modulo_slug);
      picked.push(item);
    }
  }

  return shuffleInPlace(picked).slice(0, quantidade);
}

async function fetchHistoricoForDiagnostico(userId: string): Promise<HistoricoQuestao[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('historico_questoes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    logger.warn('diagnostico pool: falha ao carregar histórico', {
      userId,
      code: error.code,
    });
    return [];
  }

  return (data ?? []) as HistoricoQuestao[];
}

export async function buildDiagnosticoQuestionPool(params: {
  userId: string;
  isAdmin: boolean;
  preferences: UserDeclaredPreferences | null;
  quantidade?: number;
}): Promise<SimuladoPoolItem[]> {
  const quantidade = clampDiagnosticoQuantidade(
    params.quantidade ?? SIMULADO_DIAGNOSTICO_QUANTIDADE_DEFAULT,
  );

  const [modulos, historico] = await Promise.all([
    resolveAccessibleModulosWhenEmpty(params.userId, params.isAdmin),
    fetchHistoricoForDiagnostico(params.userId),
  ]);

  if (modulos.length === 0) return [];

  const analytics = await import('@/lib/analytics');
  const byTopic = analytics.analyzeByTopic(historico);
  const weakAreas = analytics.identifyWeakAreas(byTopic);
  const errorPatterns = analytics.identifyErrorPatterns(historico);
  const hybridWeights = computeHybridWeights(historico.length);

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
    declaredPreferences: params.preferences,
    hybridWeights,
  };

  const scored: ScoredModulo[] = modulos.map((modulo) => {
    const titulo = modulo.titulo_aula ?? null;
    const { score, category } = calculateHybridPriorityScore(
      {
        modulo_slug: modulo.modulo_slug,
        topico: titulo,
        subtopico: titulo,
        banca: modulo.banca,
      },
      scoreContext,
    );

    return {
      modulo,
      priority: score,
      category,
      bucket: classifyBucket(modulo, params.preferences, category),
    };
  });

  scored.sort((a, b) => b.priority - a.priority);

  const picked = pickBalancedPool(scored, Math.min(quantidade, modulos.length));

  return picked.map((item, idx) => ({
    modulo_id: item.modulo.id,
    modulo_slug: item.modulo.modulo_slug,
    ordem: idx + 1,
  }));
}
