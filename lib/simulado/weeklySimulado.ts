import type { SupabaseClient } from '@supabase/supabase-js';
import type { HistoricoQuestao, TopicPerformance, ErrorPattern } from '@/lib/analytics';
import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import type { ModuloEstudoListRow } from '@/lib/concursos/entitlements';
import { logger } from '@/lib/logger';
import type { SimuladoPoolItem } from '@/lib/simulado/rpc';
import {
  calculateHybridPriorityScore,
  computeHybridWeights,
  type UserDeclaredPreferences,
} from '@/lib/recommendations';
import { createServerSupabase } from '@/lib/supabase/server';
import { getWeeklyOrdinalFromMap, loadWeeklySessionOrdinals } from '@/lib/simulado/weeklyOrdinal';
import type { WeeklySimuladoMission } from '@/lib/simulado/types';
import {
  WEEKLY_SIMULADO_ORIGEM,
  WEEKLY_SIMULADO_DEFAULT_QUANTIDADE,
  ADAPTIVE_SIMULADO_MODO,
  WEEKLY_POOL_BUCKET_SHARES,
  buildWeeklyQuestionPoolFromScored,
  buildWeeklySimuladoTitulo,
  getIsoWeekInfo,
  resolveWeeklyFocoPrincipal,
  resolveWeeklySimuladoStatus,
  weeklyFiltrosMatchWeek,
  assignWeeklyBucket,
  type ScoredModulo,
} from '@/lib/simulado/weeklySimuladoCore';

export {
  WEEKLY_SIMULADO_ORIGEM,
  WEEKLY_SIMULADO_DEFAULT_QUANTIDADE,
  ADAPTIVE_SIMULADO_MODO,
  WEEKLY_POOL_BUCKET_SHARES,
  assignWeeklyBucket,
  buildWeeklyQuestionPoolFromScored,
  buildWeeklySimuladoTitulo,
  getIsoWeekInfo,
  isWeeklySimuladoFiltros,
  weeklyFiltrosMatchWeek,
  resolveWeeklyFocoPrincipal,
  resolveWeeklySimuladoStatus,
  topicMatchesDeclared,
} from '@/lib/simulado/weeklySimuladoCore';

export type {
  WeeklyPoolBucket,
  WeeklySimuladoStatus,
  ScoredModulo,
  IsoWeekInfo,
} from '@/lib/simulado/weeklySimuladoCore';

type WeeklySessionRow = {
  id: string;
  status: 'aberto' | 'concluido' | 'cancelado';
  total_questoes: number;
  titulo: string | null;
  filtros: Record<string, unknown>;
  created_at: string;
  concluida_em: string | null;
  percentual_acerto?: number | null;
};

function scoreModulosForWeeklyPool(
  modulos: ModuloEstudoListRow[],
  context: {
    historico: HistoricoQuestao[];
    preferences: UserDeclaredPreferences | null;
    weakAreas: TopicPerformance[];
    errorPatterns: ErrorPattern[];
  },
): ScoredModulo[] {
  const lastAttempts = new Map<string, string>();
  context.historico.forEach((h) => {
    const existing = lastAttempts.get(h.modulo_slug);
    if (!existing || h.created_at > existing) {
      lastAttempts.set(h.modulo_slug, h.created_at);
    }
  });

  const hybridWeights = computeHybridWeights(context.historico.length);
  const historicoSlugs = new Set(context.historico.map((h) => h.modulo_slug));
  const wrongSlugs = new Set(
    context.historico.filter((h) => h.acertou === false).map((h) => h.modulo_slug),
  );

  const bucketContext = {
    historicoSlugs,
    wrongSlugs,
    preferences: context.preferences,
    weakAreas: context.weakAreas,
  };

  return modulos.map((modulo) => {
    const topico = modulo.modulo_nome;
    const subtopico = modulo.titulo_aula;
    const { score, category } = calculateHybridPriorityScore(
      {
        modulo_slug: modulo.modulo_slug,
        topico,
        subtopico,
        banca: modulo.banca,
      },
      {
        weakAreas: context.weakAreas,
        errorPatterns: context.errorPatterns,
        historico: context.historico,
        lastAttempts,
        declaredPreferences: context.preferences,
        hybridWeights,
      },
    );

    const scored: ScoredModulo = {
      modulo_id: modulo.id,
      modulo_slug: modulo.modulo_slug,
      topico,
      subtopico,
      banca: modulo.banca,
      priority: score,
      category,
      bucket: 'weakness',
    };

    scored.bucket = assignWeeklyBucket(scored, bucketContext);
    return scored;
  });
}

async function fetchUserHistorico(
  supabase: SupabaseClient,
  userId: string,
): Promise<HistoricoQuestao[]> {
  const { data, error } = await supabase
    .from('historico_questoes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    logger.warn('Falha ao carregar histórico para simulado semanal', {
      userId,
      code: error.code,
    });
    return [];
  }

  return (data ?? []) as HistoricoQuestao[];
}

async function fetchUserPreferences(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserDeclaredPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences_onboarding')
    .select('topicos_afinidade, topicos_dificuldade, bancas_foco, carga_horaria_semanal')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    topicos_afinidade: data.topicos_afinidade ?? [],
    topicos_dificuldade: data.topicos_dificuldade ?? [],
    bancas_foco: data.bancas_foco ?? [],
    carga_horaria_semanal: data.carga_horaria_semanal,
  };
}

function filterModulosByBancas(
  modulos: ModuloEstudoListRow[],
  bancasFoco: string[] | undefined,
): ModuloEstudoListRow[] {
  if (!bancasFoco?.length) return modulos;
  const needles = bancasFoco.map((b) => b.trim().toLowerCase()).filter(Boolean);
  if (!needles.length) return modulos;

  return modulos.filter((m) => {
    const haystack = (m.banca ?? '').toLowerCase();
    return needles.some((n) => haystack === n || haystack.includes(n) || n.includes(haystack));
  });
}

export async function buildWeeklySimuladoPool(params: {
  userId: string;
  quantidade?: number;
  isAdmin?: boolean;
  supabase?: SupabaseClient;
  historico?: HistoricoQuestao[];
  preferences?: UserDeclaredPreferences | null;
}): Promise<{
  pool: SimuladoPoolItem[];
  foco_principal: string;
  scored: ScoredModulo[];
}> {
  const quantidade = params.quantidade ?? WEEKLY_SIMULADO_DEFAULT_QUANTIDADE;
  const supabase = params.supabase ?? (await createServerSupabase());

  const [historico, preferences, modulosRaw] = await Promise.all([
    params.historico !== undefined
      ? Promise.resolve(params.historico)
      : fetchUserHistorico(supabase, params.userId),
    params.preferences !== undefined
      ? Promise.resolve(params.preferences)
      : fetchUserPreferences(supabase, params.userId),
    resolveAccessibleModulosWhenEmpty(params.userId, params.isAdmin ?? false),
  ]);

  const modulos = filterModulosByBancas(modulosRaw, preferences?.bancas_foco);
  if (!modulos.length) {
    return { pool: [], foco_principal: 'Estudo Geral', scored: [] };
  }

  const { analyzeByTopic, identifyWeakAreas, identifyErrorPatterns } = await import(
    '@/lib/analytics'
  );
  const byTopic = analyzeByTopic(historico);
  const weakAreas = identifyWeakAreas(byTopic);
  const errorPatterns = identifyErrorPatterns(historico);

  const scored = scoreModulosForWeeklyPool(modulos, {
    historico,
    preferences,
    weakAreas,
    errorPatterns,
  });

  const weaknessItems = scored
    .filter((s) => s.bucket === 'weakness')
    .sort((a, b) => b.priority - a.priority);

  const foco_principal = resolveWeeklyFocoPrincipal(weaknessItems, weakAreas, preferences);
  const pool = buildWeeklyQuestionPoolFromScored(scored, quantidade);

  return { pool, foco_principal, scored };
}

export async function findWeeklySimuladoSession(
  supabase: SupabaseClient,
  userId: string,
  isoYear: number,
  isoWeek: number,
): Promise<WeeklySessionRow | null> {
  const { weekStart } = getIsoWeekInfo();
  const { data, error } = await supabase
    .from('simulado_sessions')
    .select(
      'id, status, total_questoes, titulo, filtros, created_at, concluida_em, percentual_acerto',
    )
    .eq('user_id', userId)
    .gte('created_at', weekStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    logger.warn('Falha ao buscar sessão semanal', { userId, code: error.code });
    return null;
  }

  const match = (data ?? []).find((row) =>
    weeklyFiltrosMatchWeek(row.filtros as Record<string, unknown>, isoYear, isoWeek),
  );

  return (match as WeeklySessionRow | undefined) ?? null;
}

async function countRespondidas(supabase: SupabaseClient, sessionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('simulado_respostas')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .not('acertou', 'is', null);

  if (error) return 0;
  return count ?? 0;
}

async function attachWeeklyOrdinalToMission(
  supabase: SupabaseClient,
  userId: string,
  mission: WeeklySimuladoMission,
): Promise<WeeklySimuladoMission> {
  if (!mission.session_id) {
    return { ...mission, weekly_ordinal: null };
  }
  const ordinals = await loadWeeklySessionOrdinals(supabase, userId);
  return {
    ...mission,
    weekly_ordinal: getWeeklyOrdinalFromMap(ordinals, mission.session_id),
  };
}

export async function mapSessionToWeeklyMission(
  supabase: SupabaseClient,
  session: WeeklySessionRow,
  isoYear: number,
  isoWeek: number,
  weekEndsAt: Date,
): Promise<WeeklySimuladoMission> {
  const respondidas =
    session.status === 'concluido'
      ? session.total_questoes
      : await countRespondidas(supabase, session.id);

  const filtros = session.filtros ?? {};
  const foco = typeof filtros.foco_principal === 'string' ? filtros.foco_principal : null;

  return {
    iso_year: isoYear,
    iso_week: isoWeek,
    week_ends_at: weekEndsAt.toISOString(),
    foco_principal: foco,
    status: resolveWeeklySimuladoStatus(session, respondidas),
    titulo: session.titulo?.trim() || buildWeeklySimuladoTitulo(isoWeek, foco ?? 'Estudo Geral'),
    session_id: session.id,
    total_questoes: session.total_questoes,
    respondidas,
    percentual_acerto:
      session.status === 'concluido' ? (session.percentual_acerto ?? null) : null,
  };
}

export async function createWeeklySimuladoSession(params: {
  userId: string;
  quantidade?: number;
  isAdmin?: boolean;
  isoYear?: number;
  isoWeek?: number;
  supabase?: SupabaseClient;
}): Promise<{
  created: boolean;
  session: WeeklySessionRow | null;
  mission: WeeklySimuladoMission | null;
  reason?: 'already_exists' | 'empty_pool' | 'insert_failed';
}> {
  const supabase = params.supabase ?? (await createServerSupabase());
  const weekInfo = getIsoWeekInfo();
  const isoYear = params.isoYear ?? weekInfo.isoYear;
  const isoWeek = params.isoWeek ?? weekInfo.isoWeek;

  const existing = await findWeeklySimuladoSession(supabase, params.userId, isoYear, isoWeek);
  if (existing) {
    const mission = await attachWeeklyOrdinalToMission(
      supabase,
      params.userId,
      await mapSessionToWeeklyMission(
        supabase,
        existing,
        isoYear,
        isoWeek,
        weekInfo.weekEndsAt,
      ),
    );
    return { created: false, session: existing, mission, reason: 'already_exists' };
  }

  const { pool, foco_principal } = await buildWeeklySimuladoPool({
    userId: params.userId,
    quantidade: params.quantidade,
    isAdmin: params.isAdmin,
    supabase,
  });

  if (!pool.length) {
    return { created: false, session: null, mission: null, reason: 'empty_pool' };
  }

  const titulo = buildWeeklySimuladoTitulo(isoWeek, foco_principal);
  const filtros = {
    origem: WEEKLY_SIMULADO_ORIGEM,
    iso_year: isoYear,
    iso_week: isoWeek,
    foco_principal,
    bancas: null,
    assuntos: null,
    q: null,
    requested: params.quantidade ?? WEEKLY_SIMULADO_DEFAULT_QUANTIDADE,
    selected: pool.length,
    modo: ADAPTIVE_SIMULADO_MODO,
    bucket_shares: WEEKLY_POOL_BUCKET_SHARES,
  };

  const sessionInsertPayload = {
    user_id: params.userId,
    total_questoes: pool.length,
    filtros,
    status: 'aberto' as const,
    titulo,
    ritmo_meta_segundos_por_questao: null,
    prova_iniciada_em: null,
    modo: ADAPTIVE_SIMULADO_MODO,
  };

  const { data: session, error: sessionError } = await supabase
    .from('simulado_sessions')
    .insert(sessionInsertPayload)
    .select(
      'id, status, total_questoes, titulo, filtros, created_at, concluida_em, percentual_acerto',
    )
    .single();

  if (sessionError || !session) {
    logger.error('Falha ao criar sessão do simulado semanal', sessionError, {
      userId: params.userId,
    });
    return { created: false, session: null, mission: null, reason: 'insert_failed' };
  }

  const respostas = pool.map((item) => ({
    session_id: session.id,
    user_id: params.userId,
    modulo_id: item.modulo_id,
    modulo_slug: item.modulo_slug,
    ordem: item.ordem,
  }));

  const { error: respostasError } = await supabase.from('simulado_respostas').insert(respostas);

  if (respostasError) {
    logger.error('Falha ao persistir pool do simulado semanal', respostasError, {
      userId: params.userId,
      sessionId: session.id,
    });
    await supabase.from('simulado_sessions').delete().eq('id', session.id);
    return { created: false, session: null, mission: null, reason: 'insert_failed' };
  }

  const mission = await attachWeeklyOrdinalToMission(
    supabase,
    params.userId,
    await mapSessionToWeeklyMission(
      supabase,
      session as WeeklySessionRow,
      isoYear,
      isoWeek,
      weekInfo.weekEndsAt,
    ),
  );

  return { created: true, session: session as WeeklySessionRow, mission };
}

export async function getWeeklySimuladoMission(params: {
  userId: string;
  isAdmin?: boolean;
  autoGenerate?: boolean;
  quantidade?: number;
}): Promise<{ mission: WeeklySimuladoMission; generated: boolean } | null> {
  const supabase = await createServerSupabase();
  const weekInfo = getIsoWeekInfo();

  let session = await findWeeklySimuladoSession(
    supabase,
    params.userId,
    weekInfo.isoYear,
    weekInfo.isoWeek,
  );

  let generated = false;

  if (!session && params.autoGenerate !== false) {
    const result = await createWeeklySimuladoSession({
      userId: params.userId,
      isAdmin: params.isAdmin,
      quantidade: params.quantidade,
      supabase,
    });
    session = result.session;
    generated = result.created;
    if (!session) return null;
  }

  if (!session) {
    return {
      mission: {
        iso_year: weekInfo.isoYear,
        iso_week: weekInfo.isoWeek,
        week_ends_at: weekInfo.weekEndsAt.toISOString(),
        foco_principal: null,
        status: 'ausente',
        titulo: buildWeeklySimuladoTitulo(weekInfo.isoWeek, 'Estudo Geral'),
        session_id: null,
        total_questoes: null,
        respondidas: null,
        percentual_acerto: null,
      },
      generated: false,
    };
  }

  const mission = await attachWeeklyOrdinalToMission(
    supabase,
    params.userId,
    await mapSessionToWeeklyMission(
      supabase,
      session,
      weekInfo.isoYear,
      weekInfo.isoWeek,
      weekInfo.weekEndsAt,
    ),
  );

  return { mission, generated };
}

export async function listUsersEligibleForWeeklyGeneration(
  supabase: SupabaseClient,
): Promise<string[]> {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [prefResult, histResult] = await Promise.all([
    supabase.from('user_preferences_onboarding').select('user_id'),
    supabase
      .from('historico_questoes')
      .select('user_id')
      .gte('created_at', since.toISOString()),
  ]);

  const ids = new Set<string>();
  for (const row of prefResult.data ?? []) {
    if (row.user_id) ids.add(row.user_id);
  }
  for (const row of histResult.data ?? []) {
    if (row.user_id) ids.add(row.user_id);
  }

  return [...ids];
}

export async function generateWeeklySimuladosBatch(params: {
  supabase: SupabaseClient;
  userIds?: string[];
  quantidade?: number;
}): Promise<{
  processed: number;
  created: number;
  skipped: number;
  failed: number;
}> {
  const userIds =
    params.userIds ?? (await listUsersEligibleForWeeklyGeneration(params.supabase));

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const userId of userIds) {
    try {
      const result = await createWeeklySimuladoSession({
        userId,
        quantidade: params.quantidade,
        supabase: params.supabase,
      });

      if (result.created) {
        created += 1;
      } else if (result.reason === 'already_exists' || result.reason === 'empty_pool') {
        skipped += 1;
      } else {
        failed += 1;
      }
    } catch (error) {
      failed += 1;
      logger.warn('Falha ao gerar simulado semanal em lote', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { processed: userIds.length, created, skipped, failed };
}
