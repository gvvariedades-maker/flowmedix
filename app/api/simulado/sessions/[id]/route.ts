import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { attachConclusaoIncentivos } from '@/lib/simulado/attachConclusaoIncentivos';
import { attachWeeklySessionDisplay } from '@/lib/simulado/attachWeeklySessionDisplay';
import { loadSimuladoSessionDetail } from '@/lib/simulado/sessionDetail';

const SessionIdSchema = z.string().uuid('ID de sessão inválido');

/** GET /api/simulado/sessions/[id] — resumo da sessão e progresso por questão. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const parsedId = SessionIdSchema.safeParse(rawId);
    if (!parsedId.success) {
      return NextResponse.json({ error: 'ID de sessão inválido' }, { status: 400 });
    }

    const sessionId = parsedId.data;
    const e2e = isE2eBypassEnabled('E2E_DASHBOARD_BYPASS');

    let supabase = null;
    let userId: string | undefined;

    if (!e2e) {
      const auth = await getUserAndClientFromBearer(request);
      if (!auth) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }
      supabase = auth.supabase;
      userId = auth.user.id;
    }

    const result = await loadSimuladoSessionDetail(supabase, userId, sessionId);

    if (result.error === 'not_found') {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }
    if (result.error === 'db') {
      return NextResponse.json({ error: 'Erro ao carregar simulado' }, { status: 500 });
    }

    if (!e2e && supabase && userId) {
      let detail = await attachWeeklySessionDisplay(supabase, userId, result.data);
      if (detail.session.status === 'concluido') {
        detail = await attachConclusaoIncentivos(supabase, userId, detail);
      }
      return NextResponse.json(detail);
    }

    return NextResponse.json(result.data);
  } catch (error) {
    logger.error('Erro inesperado em GET /api/simulado/sessions/[id]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
