import { NextRequest, NextResponse } from 'next/server';
import { SimuladoAnalyticsQuerySchema } from '@/lib/validations';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { loadSimuladoAnalyticsSummary, normalizeSimuladoAnalyticsFilters } from '@/lib/simulado/analyticsSummary';
import { syncPendingSimuladoAnalytics } from '@/lib/simulado/analyticsSync';
import { logger } from '@/lib/logger';
import { withPerformanceTracking } from '@/lib/performance-tracker';

const PRIVATE_SHORT_CACHE = 'private, max-age=30, stale-while-revalidate=60';

/** GET /api/simulado/analytics — resumo inicial de analytics dos simulados. */
export const GET = withPerformanceTracking(async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = SimuladoAnalyticsQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Query inválida', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const filters = normalizeSimuladoAnalyticsFilters({
      periodoRaw: parsed.data.periodo ?? null,
      modoRaw: parsed.data.modo ?? null,
      bancaRaw: parsed.data.banca ?? null,
      topicoRaw: parsed.data.topico ?? null,
      subtopicoRaw: parsed.data.subtopico ?? null,
      assuntoRaw: parsed.data.assunto ?? null,
    });

    try {
      const serviceSupabase = await createServerSupabase();
      await syncPendingSimuladoAnalytics(serviceSupabase, auth.user.id);
    } catch (syncError) {
      logger.warn('Falha ao sincronizar analytics pendentes de simulado', {
        userId: auth.user.id,
        error: syncError instanceof Error ? syncError.message : 'unknown',
      });
    }

    const summary = await loadSimuladoAnalyticsSummary(auth.supabase, auth.user.id, filters);

    return NextResponse.json(
      {
        filters,
        kpis: {
          total_simulados: summary.totalSimulados,
          media_acerto: summary.mediaAcerto,
          melhor_score: summary.melhorScore,
          tempo_medio_ms: summary.tempoMedioMs,
        },
        evolucao_temporal: summary.evolucaoTemporal,
        desempenho: {
          por_banca: summary.desempenhoPorBanca,
          por_topico: summary.desempenhoPorTopico,
          por_subtopico: summary.desempenhoPorSubtopico,
        },
        padroes_erro: summary.errorPatterns,
        metas_streaks: {
          streaks: summary.streaks,
          metas: summary.goals,
        },
        history_preview: summary.ultimasSessoes.map((session) => ({
          id: session.id,
          status: session.status,
          modo: session.modo,
          titulo: session.titulo?.trim() ?? '',
          percentual_acerto: session.percentual_acerto ?? null,
          created_at: session.created_at,
          concluida_em: session.concluida_em ?? null,
        })),
      },
      {
        headers: { 'Cache-Control': PRIVATE_SHORT_CACHE },
      },
    );
  } catch (error) {
    logger.error('Erro inesperado em GET /api/simulado/analytics', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
});
