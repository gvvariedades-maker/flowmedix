import { NextRequest, NextResponse } from 'next/server';
import { SimuladoCreateSessionSchema } from '@/lib/validations';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { fetchSimuladoQuestionPoolFromRpc } from '@/lib/simulado/rpc';
import { getFreemiumStatusForUser } from '@/lib/freemium';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { createE2eSimuladoSession, resetE2eSimuladoStore } from '@/lib/e2e/simuladoSeed';

type SimuladoOpenSessionRow = {
  id: string;
  total_questoes: number;
  status: 'aberto' | 'concluido' | 'cancelado';
  created_at: string;
  filtros?: Record<string, unknown>;
};

function resolveSessionMode(filtros?: Record<string, unknown>): 'treino' | 'prova' {
  return filtros?.modo === 'prova' ? 'prova' : 'treino';
}

export async function GET(request: NextRequest) {
  try {
    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      return NextResponse.json({ has_open_session: false, session: null });
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createServerSupabase();
    const { data: openSession, error: openSessionError } = await supabase
      .from('simulado_sessions')
      .select('id, total_questoes, status, created_at, filtros')
      .eq('user_id', auth.user.id)
      .eq('status', 'aberto')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<SimuladoOpenSessionRow>();

    if (openSessionError) {
      logger.error('Falha ao buscar sessão aberta de simulado', openSessionError, {
        userId: auth.user.id,
      });
      return NextResponse.json({ error: 'Erro ao consultar sessões' }, { status: 500 });
    }

    return NextResponse.json({
      has_open_session: openSession != null,
      session: openSession
        ? {
            ...openSession,
            modo: resolveSessionMode(openSession.filtros),
          }
        : null,
    });
  } catch (error) {
    logger.error('Erro inesperado em GET /api/simulado/sessions', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      const body = await request.json().catch(() => ({}));
      const parsed = SimuladoCreateSessionSchema.safeParse(body);
      const quantidade = parsed.success ? parsed.data.quantidade : 20;
      const modo = parsed.success ? parsed.data.modo : 'treino';
      resetE2eSimuladoStore();
      return NextResponse.json(createE2eSimuladoSession(quantidade, modo));
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

    const { quantidade, modo, banca, assunto, q, forcar_novo, from_session_id, only_errors } = parsed.data;
    const supabase = await createServerSupabase();
    const freemium = await getFreemiumStatusForUser(auth.user.id, auth.user.email ?? null);
    if (!freemium.isPro && freemium.limiteAtingido) {
      return NextResponse.json(
        {
          error: 'Limite diário do plano gratuito atingido para simulados',
          details: { resetEm: freemium.resetEm, limite: '1 simulado/dia' },
        },
        { status: 403 },
      );
    }

    if (!forcar_novo) {
      const { data: openSession, error: openSessionError } = await supabase
        .from('simulado_sessions')
        .select('id, total_questoes, status, created_at, filtros')
        .eq('user_id', auth.user.id)
        .eq('status', 'aberto')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (openSessionError) {
        logger.error('Falha ao verificar sessão aberta antes de criar simulado', openSessionError, {
          userId: auth.user.id,
        });
        return NextResponse.json({ error: 'Erro ao criar simulado' }, { status: 500 });
      }

      if (openSession) {
        return NextResponse.json({
          success: true,
          resumed: true,
          session: {
            ...openSession,
            modo: resolveSessionMode(openSession.filtros),
          },
          questoes: [],
        });
      }
    }

    let pool = await fetchSimuladoQuestionPoolFromRpc({
      userId: auth.user.id,
      quantidade,
      filters: { banca, assunto, q },
    });

    if (from_session_id && only_errors) {
      const { data: erroRows, error: errosLookupError } = await supabase
        .from('simulado_respostas')
        .select('modulo_id, modulo_slug')
        .eq('session_id', from_session_id)
        .eq('user_id', auth.user.id)
        .eq('acertou', false)
        .order('respondida_em', { ascending: true, nullsFirst: false })
        .limit(quantidade);

      if (errosLookupError) {
        logger.error('Falha ao buscar erros para simulado derivado', errosLookupError, {
          userId: auth.user.id,
          fromSessionId: from_session_id,
        });
        return NextResponse.json({ error: 'Erro ao criar simulado derivado' }, { status: 500 });
      }

      const errorPool = (erroRows ?? []).map((row, idx) => ({
        modulo_id: row.modulo_id as string,
        modulo_slug: row.modulo_slug as string,
        ordem: idx + 1,
      }));

      if (errorPool.length > 0) {
        pool = errorPool;
      }
    }

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
      modo,
    };

    const sessionInsertPayload = {
      user_id: auth.user.id,
      total_questoes: pool.length,
      filtros: filters,
      status: 'aberto' as const,
    };

    const { data: session, error: sessionError } = await supabase
      .from('simulado_sessions')
      .insert({
        ...sessionInsertPayload,
        modo,
      })
      .select('id, total_questoes, status, created_at, filtros')
      .single();

    let createdSession = session;
    let createdSessionError = sessionError;

    if (createdSessionError?.code === '42703') {
      const fallbackInsert = await supabase
        .from('simulado_sessions')
        .insert(sessionInsertPayload)
        .select('id, total_questoes, status, created_at, filtros')
        .single();
      createdSession = fallbackInsert.data;
      createdSessionError = fallbackInsert.error;
    }

    if (createdSessionError || !createdSession) {
      logger.error('Falha ao criar sessão de simulado', createdSessionError, {
        userId: auth.user.id,
      });
      return NextResponse.json({ error: 'Erro ao criar simulado' }, { status: 500 });
    }

    const respostas = pool.map((item) => ({
      session_id: createdSession.id,
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
        sessionId: createdSession.id,
      });

      await supabase.from('simulado_sessions').delete().eq('id', createdSession.id);
      return NextResponse.json({ error: 'Erro ao iniciar simulado' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      resumed: false,
      session: {
        ...createdSession,
        modo,
      },
      questoes: pool.map(({ modulo_slug, ordem }) => ({ modulo_slug, ordem })),
    });
  } catch (error) {
    logger.error('Erro inesperado em POST /api/simulado/sessions', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
