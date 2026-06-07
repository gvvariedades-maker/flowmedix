import { NextRequest, NextResponse } from 'next/server';
import { ErrorReportCreateSchema } from '@/lib/validations';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { logger } from '@/lib/logger';
import { distributedRateLimitWithInfo } from '@/lib/rate-limit';

const REPORT_ERROR_RATE_LIMIT = {
  limit: 5,
  windowMs: 60_000,
} as const;

function getRequestIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (!forwarded) return '127.0.0.1';
  return forwarded.split(',')[0]?.trim() || '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userIp = getRequestIp(request);
    const limiter = await distributedRateLimitWithInfo(request, {
      key: 'reportar-erro',
      limit: REPORT_ERROR_RATE_LIMIT.limit,
      windowMs: REPORT_ERROR_RATE_LIMIT.windowMs,
      identifier: `${auth.user.id}:${userIp}`,
    });
    if (!limiter.allowed) {
      logger.warn('Rate limit excedido em POST /api/reportar-erro', {
        userId: auth.user.id,
        ip: userIp,
      });

      return NextResponse.json(
        {
          error: 'Muitas requisições. Aguarde alguns instantes para tentar novamente.',
          retry_after_ms: Math.max(0, limiter.resetAt - Date.now()),
        },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const parsed = ErrorReportCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const payload = parsed.data;

    if (payload.context_type === 'simulado' && !payload.simulado_session_id) {
      return NextResponse.json(
        { error: 'simulado_session_id é obrigatório para context_type=simulado' },
        { status: 400 },
      );
    }

    const pageUrlFromRequest = request.headers.get('origin') ?? undefined;
    const safeMetadata = payload.metadata ?? {};

    const { data, error } = await auth.supabase
      .from('error_reports')
      .insert({
        user_id: auth.user.id,
        context_type: payload.context_type,
        modulo_slug: payload.modulo_slug ?? null,
        simulado_session_id: payload.simulado_session_id ?? null,
        page_url: payload.page_url ?? pageUrlFromRequest ?? null,
        category: payload.category,
        description: payload.description,
        metadata: safeMetadata,
      })
      .select('id, created_at, status, priority')
      .single();

    if (error) {
      logger.error('Falha ao inserir error_report', error, {
        userId: auth.user.id,
        contextType: payload.context_type,
        category: payload.category,
      });
      return NextResponse.json({ error: 'Erro ao registrar reporte' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        report: data,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('Erro inesperado em POST /api/reportar-erro', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
