import { NextRequest, NextResponse } from 'next/server';
import { searchParamsToQueryRecord } from '@/lib/api/query-params';
import { VitrineQuerySchema } from '@/lib/validations';
import { getVitrinePageCached, revalidateCache } from '@/lib/cache';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { logApiStrategy } from '@/lib/api/logApiStrategy';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { recordPerformance } from '@/lib/metrics';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { getE2eEstudarVitrinePage } from '@/lib/e2e/estudarSeed';
import { parseVitrineListQuery } from '@/lib/vitrine/parseListQuery';

export async function GET(request: NextRequest) {
  const requestStartedAt = Date.now();
  const endpoint = '/api/vitrine';
  const method = 'GET';
  try {
    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      const listQuery = parseVitrineListQuery(
        searchParamsToQueryRecord(request.nextUrl.searchParams),
      );
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, true);
      return NextResponse.json(getE2eEstudarVitrinePage(listQuery), {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }

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
    const isAdmin = isAdminSessionEmail(auth.user.email ?? null);
    
    logger.warn('API Vitrine: identidades', { 
      userId: auth.user.id, 
      email: auth.user.email, 
      emailLength: auth.user.email?.length,
      isAdmin,
      userAgent: request.headers.get('user-agent'),
      cfRay: request.headers.get('cf-ray')
    });

    const normalizedFilters = {
      bancas,
      assuntos,
      q: q || undefined,
    };
    if (isAdmin) {
      logger.warn('API Vitrine: admin detected, bypassing cache for test');
      const { getVitrinePage } = await import('@/lib/vitrine/service');
      const payload = await getVitrinePage({
        userId: auth.user.id,
        page,
        filters: normalizedFilters,
        isAdmin,
      });
      return NextResponse.json(payload, {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }

    const payload = await getVitrinePageCached(auth.user.id, page, {
      ...normalizedFilters,
    }, isAdmin);

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
