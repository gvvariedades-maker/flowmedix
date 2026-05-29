import { NextRequest, NextResponse } from 'next/server';
import { searchParamsToQueryRecord } from '@/lib/api/query-params';
import { VitrineQuerySchema } from '@/lib/validations';
import { getVitrinePageCached } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { logApiStrategy } from '@/lib/api/logApiStrategy';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { recordPerformance } from '@/lib/metrics';

export async function GET(request: NextRequest) {
  const requestStartedAt = Date.now();
  const endpoint = '/api/vitrine';
  const method = 'GET';
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, false);
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const raw = searchParamsToQueryRecord(request.nextUrl.searchParams);
    const parsed = VitrineQuerySchema.safeParse(raw);
    if (!parsed.success) {
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, false);
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { page, bancas, assuntos, q } = parsed.data;
    const normalizedFilters = {
      bancas,
      assuntos,
      q: q || undefined,
    };
    const payload = await getVitrinePageCached(auth.user.id, page, {
      ...normalizedFilters,
    });

    logApiStrategy({
      event: 'api_vitrine',
      strategy: 'cache',
      durationMs: Date.now() - requestStartedAt,
      context: {
        userId: auth.user.id,
        page,
        filters: normalizedFilters,
        rowCount: payload.totalModulosFiltrados,
        groupCount: payload.pagination.totalGroups,
      },
    });
    recordPerformance(endpoint, method, Date.now() - requestStartedAt, true);

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    recordPerformance(endpoint, method, Date.now() - requestStartedAt, false);
    logger.error('Falha em GET /api/vitrine', error, {
      durationMs: Date.now() - requestStartedAt,
      strategy: 'cache',
    });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
