import { NextRequest, NextResponse } from 'next/server';
import { SimuladoQuestaoQuerySchema } from '@/lib/validations';
import { buildSimuladoQuestaoPayload } from '@/lib/estudar/questaoSimuladoPayload';
import { stripQuestionForSimulado } from '@/lib/estudar/questionPayload';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { logger } from '@/lib/logger';
import { recordPerformance } from '@/lib/metrics';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { E2E_SIMULADO_LESSON, E2E_SIMULADO_SLUG } from '@/lib/e2e/constants';

/** GET /api/simulado/questao — enunciado slim (sem slides, nav nem gabarito). */
export async function GET(request: NextRequest) {
  const requestStartedAt = Date.now();
  const endpoint = '/api/simulado/questao';
  const method = 'GET';

  try {
    const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = SimuladoQuestaoQuerySchema.safeParse(raw);
    if (!parsed.success) {
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, false, 'simulado');
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { slug } = parsed.data;

    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS') && slug === E2E_SIMULADO_SLUG) {
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, true, 'simulado');
      return NextResponse.json(
        { dados: stripQuestionForSimulado({ ...E2E_SIMULADO_LESSON }) },
        { headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, false, 'simulado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const result = await buildSimuladoQuestaoPayload({
      slug,
      userId: auth.user.id,
      supabase: auth.supabase,
    });

    const cached = result.status === 'ok';
    recordPerformance(endpoint, method, Date.now() - requestStartedAt, cached, 'simulado');

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
    recordPerformance(endpoint, method, Date.now() - requestStartedAt, false, 'simulado');
    logger.error('Falha em GET /api/simulado/questao', error, {
      durationMs: Date.now() - requestStartedAt,
    });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
