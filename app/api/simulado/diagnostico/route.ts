import { NextRequest, NextResponse } from 'next/server';
import { SimuladoDiagnosticoCreateSchema } from '@/lib/validations';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { createE2eSimuladoSession, resetE2eSimuladoStore } from '@/lib/e2e/simuladoSeed';
import { getUserPreferencesOnboarding } from '@/lib/onboarding/preferences';
import { buildDiagnosticoQuestionPool } from '@/lib/simulado/diagnosticoPool';
import { getDiagnosticoSimuladoCardState } from '@/lib/simulado/diagnosticoStatus';
import {
  isDiagnosticoSessionFiltros,
  SIMULADO_DIAGNOSTICO_TIPO,
  SIMULADO_DIAGNOSTICO_TITULO,
} from '@/lib/simulado/diagnosticoConstants';
import type { UserDeclaredPreferences } from '@/lib/recommendations';

const SESSION_PUBLIC_SELECT =
  'id, total_questoes, status, created_at, filtros, titulo, ritmo_meta_segundos_por_questao, prova_iniciada_em';

type SessionRow = {
  id: string;
  total_questoes: number;
  status: 'aberto' | 'concluido' | 'cancelado';
  created_at: string;
  titulo?: string | null;
  ritmo_meta_segundos_por_questao?: number | null;
  prova_iniciada_em?: string | null;
  filtros?: Record<string, unknown>;
};

function mapSessionResponse(row: SessionRow) {
  return {
    id: row.id,
    total_questoes: row.total_questoes,
    status: row.status,
    modo: 'treino' as const,
    titulo: row.titulo?.trim() || SIMULADO_DIAGNOSTICO_TITULO,
    ritmo_meta_segundos_por_questao: row.ritmo_meta_segundos_por_questao ?? null,
    prova_iniciada_em: row.prova_iniciada_em ?? null,
    created_at: row.created_at,
    filtros: row.filtros ?? {},
  };
}

function toDeclaredPreferences(
  preferences: Awaited<ReturnType<typeof getUserPreferencesOnboarding>>['preferences'],
): UserDeclaredPreferences | null {
  if (!preferences) return null;
  return {
    topicos_afinidade: preferences.topicos_afinidade,
    topicos_dificuldade: preferences.topicos_dificuldade,
    bancas_foco: preferences.bancas_foco,
    carga_horaria_semanal: preferences.carga_horaria_semanal,
  };
}

/** GET /api/simulado/diagnostico — status do simulado diagnóstico inicial */
export async function GET(request: NextRequest) {
  try {
    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      return NextResponse.json({
        show_card: true,
        onboarding_completed: true,
        diagnostico_completed: false,
        has_open_session: false,
        session: null,
      } satisfies Awaited<ReturnType<typeof getDiagnosticoSimuladoCardState>>);
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const state = await getDiagnosticoSimuladoCardState(auth.user.id);
    return NextResponse.json(state);
  } catch (error) {
    logger.error('Erro inesperado em GET /api/simulado/diagnostico', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/** POST /api/simulado/diagnostico — gera sessão de simulado diagnóstico inicial */
export async function POST(request: NextRequest) {
  try {
    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      const body = await request.json().catch(() => ({}));
      const parsed = SimuladoDiagnosticoCreateSchema.safeParse(body);
      const quantidade = parsed.success ? parsed.data.quantidade : 18;
      resetE2eSimuladoStore();
      const e2e = createE2eSimuladoSession(quantidade, 'treino', {
        titulo: SIMULADO_DIAGNOSTICO_TITULO,
      });
      return NextResponse.json({
        ...e2e,
        diagnostico: true,
      });
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = SimuladoDiagnosticoCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const onboarding = await getUserPreferencesOnboarding(auth.user.id);
    if (!onboarding.completed) {
      return NextResponse.json(
        { error: 'Complete o onboarding de preferências antes do simulado diagnóstico' },
        { status: 403 },
      );
    }

    const supabase = await createServerSupabase();
    const { data: existingSessions, error: existingError } = await supabase
      .from('simulado_sessions')
      .select(SESSION_PUBLIC_SELECT)
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(25);

    if (existingError) {
      logger.error('Falha ao consultar sessões de diagnóstico', existingError, {
        userId: auth.user.id,
      });
      return NextResponse.json({ error: 'Erro ao criar simulado diagnóstico' }, { status: 500 });
    }

    const diagnosticoSessions = (existingSessions ?? []).filter((row) =>
      isDiagnosticoSessionFiltros(row.filtros as Record<string, unknown> | undefined),
    );

    if (diagnosticoSessions.some((row) => row.status === 'concluido')) {
      return NextResponse.json(
        { error: 'Simulado diagnóstico já concluído' },
        { status: 409 },
      );
    }

    const openSession = diagnosticoSessions.find((row) => row.status === 'aberto');
    if (openSession) {
      return NextResponse.json({
        success: true,
        resumed: true,
        diagnostico: true,
        session: mapSessionResponse(openSession as SessionRow),
        questoes: [],
      });
    }

    const isAdmin = isAdminSessionEmail(auth.user.email ?? null);
    const pool = await buildDiagnosticoQuestionPool({
      userId: auth.user.id,
      isAdmin,
      preferences: toDeclaredPreferences(onboarding.preferences),
      quantidade: parsed.data.quantidade,
    });

    if (!pool.length) {
      return NextResponse.json(
        { error: 'Nenhuma questão disponível para montar o simulado diagnóstico' },
        { status: 404 },
      );
    }

    const filters = {
      tipo: SIMULADO_DIAGNOSTICO_TIPO,
      bancas: onboarding.preferences?.bancas_foco?.length
        ? onboarding.preferences.bancas_foco
        : null,
      assuntos: null,
      q: null,
      requested: parsed.data.quantidade,
      selected: pool.length,
      modo: 'treino' as const,
    };

    const sessionInsertPayload = {
      user_id: auth.user.id,
      total_questoes: pool.length,
      filtros: filters,
      status: 'aberto' as const,
      titulo: SIMULADO_DIAGNOSTICO_TITULO,
      ritmo_meta_segundos_por_questao: null,
      prova_iniciada_em: null,
      modo: 'treino' as const,
    };

    const { data: session, error: sessionError } = await supabase
      .from('simulado_sessions')
      .insert(sessionInsertPayload)
      .select(SESSION_PUBLIC_SELECT)
      .single();

    if (sessionError || !session) {
      logger.error('Falha ao criar sessão de simulado diagnóstico', sessionError, {
        userId: auth.user.id,
      });
      return NextResponse.json({ error: 'Erro ao criar simulado diagnóstico' }, { status: 500 });
    }

    const respostas = pool.map((item) => ({
      session_id: session.id,
      user_id: auth.user.id,
      modulo_id: item.modulo_id,
      modulo_slug: item.modulo_slug,
      ordem: item.ordem,
    }));

    const { error: respostasError } = await supabase.from('simulado_respostas').insert(respostas);

    if (respostasError) {
      logger.error('Falha ao persistir pool do simulado diagnóstico', respostasError, {
        userId: auth.user.id,
        sessionId: session.id,
      });
      await supabase.from('simulado_sessions').delete().eq('id', session.id);
      return NextResponse.json({ error: 'Erro ao iniciar simulado diagnóstico' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      resumed: false,
      diagnostico: true,
      session: mapSessionResponse(session as SessionRow),
      questoes: pool.map(({ modulo_slug, ordem }) => ({ modulo_slug, ordem })),
    });
  } catch (error) {
    logger.error('Erro inesperado em POST /api/simulado/diagnostico', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
