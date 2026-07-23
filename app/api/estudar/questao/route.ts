import { NextRequest, NextResponse } from 'next/server';
import { searchParamsToQueryRecord } from '@/lib/api/query-params';
import { EstudarQuestaoQuerySchema } from '@/lib/validations';
import { buildEstudarQuestaoPlayerPayload } from '@/lib/estudar/questaoPlayerPayload';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { logEstudarNavApiBuild } from '@/lib/estudar/navigationTelemetry';
import { logApiStrategy } from '@/lib/api/logApiStrategy';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { recordPerformance } from '@/lib/metrics';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { buildE2eEstudarQuestaoPayload } from '@/lib/e2e/estudarSeed';
import { isE2eEstudarSlug } from '@/lib/e2e/constants';

/** Headers para cache L0 no Service Worker (Vary: Authorization). */
function estudarQuestaoApiCacheHeaders(): HeadersInit {
  return {
    'Cache-Control': 'private, no-store',
    Vary: 'Authorization',
  };
}

export async function GET(request: NextRequest) {
  const requestStartedAt = Date.now();
  const endpoint = '/api/estudar/questao';
  const method = 'GET';
  try {
    const raw = searchParamsToQueryRecord(request.nextUrl.searchParams);
    const parsed = EstudarQuestaoQuerySchema.safeParse(raw);
    if (!parsed.success) {
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, false);
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { slug, layers, from, caderno_id, bancas, assuntos, q, page, disciplina } =
      parsed.data;

    const estudarSearchParams = {
      from,
      caderno_id,
      banca: bancas,
      assunto: assuntos,
      q,
      ...(page != null && page > 1 ? { page: String(page) } : {}),
      ...(disciplina ? { disciplina } : {}),
    };

    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS') && isE2eEstudarSlug(slug)) {
      const result = buildE2eEstudarQuestaoPayload(slug, estudarSearchParams, layers);
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, result.status === 'ok');
      if (result.status === 'not_found') {
        return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
      }
      if (result.status === 'forbidden') {
        return NextResponse.json({ error: 'Sem acesso a este módulo' }, { status: 403 });
      }
      return NextResponse.json(result.payload, {
        headers: estudarQuestaoApiCacheHeaders(),
      });
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, false);
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const normalizedFilters = {
      bancas,
      assuntos,
      q: q || undefined,
      from: from || undefined,
      caderno_id: caderno_id || undefined,
      disciplina: disciplina || undefined,
    };
    const buildStartedAt = Date.now();
    const result = await buildEstudarQuestaoPlayerPayload({
      slug,
      layers,
      userId: auth.user.id,
      isAdmin: isAdminSessionEmail(auth.user.email ?? null),
      searchParams: estudarSearchParams,
      supabase: auth.supabase,
    });
    logEstudarNavApiBuild({
      slug,
      durationMs: Date.now() - buildStartedAt,
      status: result.status,
    });
    logApiStrategy({
      event: 'api_estudar_questao',
      strategy: 'builder',
      durationMs: Date.now() - requestStartedAt,
      context: {
        userId: auth.user.id,
        slug,
        filters: normalizedFilters,
        status: result.status,
      },
    });
    const cached = result.status === 'ok';
    recordPerformance(endpoint, method, Date.now() - requestStartedAt, cached);

    if (result.status === 'forbidden') {
      return NextResponse.json({ error: 'Sem acesso a este módulo' }, { status: 403 });
    }
    if (result.status === 'not_found') {
      return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.payload, {
      headers: estudarQuestaoApiCacheHeaders(),
    });
  } catch (error) {
    recordPerformance(endpoint, method, Date.now() - requestStartedAt, false);
    logger.error('Falha em GET /api/estudar/questao', error, {
      durationMs: Date.now() - requestStartedAt,
      strategy: 'builder',
    });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
