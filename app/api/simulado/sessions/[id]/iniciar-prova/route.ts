import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { iniciarE2eSimuladoProva } from '@/lib/e2e/simuladoSeed';
import { loadSimuladoSessionDetail } from '@/lib/simulado/sessionDetail';
import { markSimuladoProvaIniciada } from '@/lib/simulado/startProva';

const SessionIdSchema = z.string().uuid('ID de sessão inválido');

/** POST /api/simulado/sessions/[id]/iniciar-prova — inicia cronômetro da prova (idempotente). */
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
      const e2e = iniciarE2eSimuladoProva(sessionId);
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
    const started = await markSimuladoProvaIniciada(supabase, auth.user.id, sessionId);

    if (!started.ok) {
      if (started.code === 'not_found') {
        return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
      }
      if (started.code === 'invalid_mode') {
        return NextResponse.json({ error: 'Sessão não está em modo prova' }, { status: 400 });
      }
      if (started.code === 'invalid_status') {
        return NextResponse.json({ error: 'Sessão não está aberta' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Erro ao iniciar prova' }, { status: 500 });
    }

    const result = await loadSimuladoSessionDetail(supabase, auth.user.id, sessionId);
    if (result.error || !result.data) {
      return NextResponse.json({ error: 'Erro ao carregar simulado' }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    logger.error('Erro inesperado em POST /api/simulado/sessions/[id]/iniciar-prova', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
