import { NextRequest, NextResponse } from 'next/server';
import { SimuladoCreateSessionSchema } from '@/lib/validations';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { fetchSimuladoQuestionPoolFromRpc } from '@/lib/simulado/rpc';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { createE2eSimuladoSession, resetE2eSimuladoStore } from '@/lib/e2e/simuladoSeed';

export async function POST(request: NextRequest) {
  try {
    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      const body = await request.json().catch(() => ({}));
      const parsed = SimuladoCreateSessionSchema.safeParse(body);
      const quantidade = parsed.success ? parsed.data.quantidade : 20;
      resetE2eSimuladoStore();
      return NextResponse.json(createE2eSimuladoSession(quantidade));
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SimuladoCreateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { quantidade, banca, assunto, q } = parsed.data;
    const supabase = await createServerSupabase();

    const pool = await fetchSimuladoQuestionPoolFromRpc({
      userId: auth.user.id,
      quantidade,
      filters: { banca, assunto, q },
    });

    if (!pool.length) {
      return NextResponse.json(
        { error: 'Nenhuma questão disponível para os filtros informados' },
        { status: 404 },
      );
    }

    const filters = {
      banca: banca || null,
      assunto: assunto || null,
      q: q || null,
      requested: quantidade,
      selected: pool.length,
    };

    const { data: session, error: sessionError } = await supabase
      .from('simulado_sessions')
      .insert({
        user_id: auth.user.id,
        total_questoes: pool.length,
        filtros: filters,
        status: 'aberto',
      })
      .select('id, total_questoes, status, created_at')
      .single();

    if (sessionError || !session) {
      logger.error('Falha ao criar sessão de simulado', sessionError, {
        userId: auth.user.id,
      });
      return NextResponse.json({ error: 'Erro ao criar simulado' }, { status: 500 });
    }

    const respostas = pool.map((item) => ({
      session_id: session.id,
      user_id: auth.user.id,
      modulo_id: item.modulo_id,
      modulo_slug: item.modulo_slug,
      ordem: item.ordem,
    }));

    const { error: respostasError } = await supabase
      .from('simulado_respostas')
      .insert(respostas);

    if (respostasError) {
      logger.error('Falha ao persistir pool do simulado', respostasError, {
        userId: auth.user.id,
        sessionId: session.id,
      });

      await supabase.from('simulado_sessions').delete().eq('id', session.id);
      return NextResponse.json({ error: 'Erro ao iniciar simulado' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      session,
      questoes: pool.map(({ modulo_slug, ordem }) => ({ modulo_slug, ordem })),
    });
  } catch (error) {
    logger.error('Erro inesperado em POST /api/simulado/sessions', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
