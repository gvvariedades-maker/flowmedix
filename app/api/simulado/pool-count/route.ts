import { NextRequest, NextResponse } from 'next/server';
import { searchParamsToQueryRecord } from '@/lib/api/query-params';
import { SimuladoPoolCountQuerySchema } from '@/lib/validations';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { fetchSimuladoQuestionPoolCountFromRpc } from '@/lib/simulado/rpc';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';

/** GET /api/simulado/pool-count — estimativa rápida do pool com filtros atuais. */
export async function GET(request: NextRequest) {
  try {
    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      return NextResponse.json({ estimated_count: 1 });
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const raw = searchParamsToQueryRecord(request.nextUrl.searchParams);
    const parsed = SimuladoPoolCountQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Query inválida', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const estimatedCount = await fetchSimuladoQuestionPoolCountFromRpc({
      userId: auth.user.id,
      filters: parsed.data,
    });

    return NextResponse.json({ estimated_count: estimatedCount });
  } catch (error) {
    logger.error('Erro inesperado em GET /api/simulado/pool-count', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
