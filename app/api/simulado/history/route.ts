import { NextRequest, NextResponse } from 'next/server';
import { SimuladoHistoryQuerySchema } from '@/lib/validations';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { normalizeSimuladoAnalyticsFilters } from '@/lib/simulado/analyticsSummary';
import { loadSimuladoHistory } from '@/lib/simulado/history';
import { logger } from '@/lib/logger';
import { withPerformanceTracking } from '@/lib/performance-tracker';

const PRIVATE_SHORT_CACHE = 'private, max-age=30, stale-while-revalidate=60';

/** GET /api/simulado/history — histórico paginado de sessões. */
export const GET = withPerformanceTracking(async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = SimuladoHistoryQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Query inválida', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const normalizedFilters = normalizeSimuladoAnalyticsFilters({
      periodoRaw: parsed.data.periodo ?? null,
      modoRaw: parsed.data.modo ?? null,
      bancaRaw: parsed.data.banca ?? null,
      topicoRaw: parsed.data.topico ?? null,
      subtopicoRaw: parsed.data.subtopico ?? null,
      assuntoRaw: parsed.data.assunto ?? null,
    });
    const status = parsed.data.status ?? 'todos';
    const page = parsed.data.page ?? 1;
    const pageSize = parsed.data.page_size ?? 20;

    const result = await loadSimuladoHistory(auth.supabase, auth.user.id, {
      periodo: normalizedFilters.periodo,
      modo: normalizedFilters.modo,
      banca: normalizedFilters.banca,
      topico: normalizedFilters.topico,
      subtopico: normalizedFilters.subtopico,
      status,
      page,
      pageSize,
    });

    const totalPages = Math.max(1, Math.ceil(result.total / result.page_size));

    return NextResponse.json(
      {
        filters: {
          periodo: normalizedFilters.periodo,
          modo: normalizedFilters.modo,
          banca: normalizedFilters.banca,
          topico: normalizedFilters.topico,
          subtopico: normalizedFilters.subtopico,
          status,
        },
        pagination: {
          total: result.total,
          page: result.page,
          page_size: result.page_size,
          total_pages: totalPages,
        },
        sessions: result.sessions.map((session) => ({
          id: session.id,
          status: session.status,
          modo: session.modo,
          titulo: session.titulo?.trim() ?? '',
          total_questoes: session.total_questoes ?? null,
          acertos: session.acertos ?? null,
          erros: session.erros ?? null,
          percentual_acerto: session.percentual_acerto ?? null,
          tempo_total_ms: session.tempo_total_ms ?? null,
          tempo_medio_ms: session.tempo_medio_ms ?? null,
          created_at: session.created_at,
          concluida_em: session.concluida_em ?? null,
        })),
      },
      {
        headers: { 'Cache-Control': PRIVATE_SHORT_CACHE },
      },
    );
  } catch (error) {
    logger.error('Erro inesperado em GET /api/simulado/history', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
});
