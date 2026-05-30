import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { finalizeE2eSimuladoSession } from '@/lib/e2e/simuladoSeed';
import { loadSimuladoSessionDetail } from '@/lib/simulado/sessionDetail';
import { markSimuladoSessionConcluida } from '@/lib/simulado/finalizeSession';

const SessionIdSchema = z.string().uuid('ID de sessão inválido');

/** POST /api/simulado/sessions/[id]/concluir — encerra o simulado e libera o resumo. */
export async function POST(
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

    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      const e2e = finalizeE2eSimuladoSession(sessionId);
      if (!e2e) {
        return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
      }
      return NextResponse.json(e2e);
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createServerSupabase();
    const finalized = await markSimuladoSessionConcluida(supabase, auth.user.id, sessionId);

    if (!finalized.ok) {
      if (finalized.code === 'not_found') {
        return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Erro ao finalizar simulado' }, { status: 500 });
    }

    const result = await loadSimuladoSessionDetail(supabase, auth.user.id, sessionId);
    if (result.error || !result.data) {
      return NextResponse.json({ error: 'Erro ao carregar simulado' }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    logger.error('Erro inesperado em POST /api/simulado/sessions/[id]/concluir', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
