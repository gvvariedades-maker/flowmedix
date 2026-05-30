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

    const { slug, from, caderno_id, bancas, assuntos, q } = parsed.data;

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
    };
    const buildStartedAt = Date.now();
    const result = await buildEstudarQuestaoPlayerPayload({
      slug,
      userId: auth.user.id,
      isAdmin: isAdminSessionEmail(auth.user.email ?? null),
      searchParams: {
        from,
        caderno_id,
        banca: bancas,
        assunto: assuntos,
        q,
      },
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
      headers: { 'Cache-Control': 'private, no-store' },
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
