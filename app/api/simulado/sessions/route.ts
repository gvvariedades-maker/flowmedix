import { NextRequest, NextResponse } from 'next/server';
import { SimuladoCreateSessionSchema } from '@/lib/validations';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { fetchSimuladoQuestionPoolFromRpc } from '@/lib/simulado/rpc';
import {
  fetchSimuladoQuestionPoolFromCatalog,
} from '@/lib/simulado/poolFromCatalog';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { createE2eSimuladoSession, resetE2eSimuladoStore } from '@/lib/e2e/simuladoSeed';
import { buildDefaultTitulo, ritmoToSecondsPerQuestion } from '@/lib/simulado/provaMeta';
import {
  getSimuladoTemplateById,
  templateToSessionConfig,
  touchSimuladoTemplateUsage,
} from '@/lib/simulado/templates';
import {
  isAdaptiveSimuladoKind,
  resolveSimuladoSessionKind,
} from '@/lib/simulado/sessionKind';

const SESSION_PUBLIC_SELECT =
  'id, total_questoes, status, created_at, filtros, titulo, ritmo_meta_segundos_por_questao, prova_iniciada_em';

type SimuladoOpenSessionRow = {
  id: string;
  total_questoes: number;
  status: 'aberto' | 'concluido' | 'cancelado';
  created_at: string;
  titulo?: string | null;
  ritmo_meta_segundos_por_questao?: number | null;
  prova_iniciada_em?: string | null;
  filtros?: Record<string, unknown>;
};

function mapSessionResponse<T extends SimuladoOpenSessionRow>(row: T) {
  return {
    ...row,
    titulo: row.titulo?.trim() ?? '',
    ritmo_meta_segundos_por_questao: row.ritmo_meta_segundos_por_questao ?? null,
    prova_iniciada_em: row.prova_iniciada_em ?? null,
    modo: resolveSessionMode(row.filtros),
  };
}

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
      .select(SESSION_PUBLIC_SELECT)
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
      session: openSession ? mapSessionResponse(openSession) : null,
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

    const {
      quantidade: quantidadeInput,
      modo: modoInput,
      titulo: tituloInput,
      ritmo_meta: ritmoMetaInput,
      template_id,
      bancas: bancasInput,
      assuntos: assuntosInput,
      q: qInput,
      forcar_novo,
      from_session_id,
      only_errors,
    } = parsed.data;
    const supabase = await createServerSupabase();

    let templateIdForSession: string | null = null;
    let quantidade = quantidadeInput;
    let modo = modoInput;
    let tituloOverride = tituloInput;
    let ritmo_meta = ritmoMetaInput;
    let bancas = bancasInput;
    let assuntos = assuntosInput;
    let q = qInput;

    if (template_id) {
      const template = await getSimuladoTemplateById(supabase, auth.user.id, template_id);
      if (!template) {
        return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
      }

      const config = templateToSessionConfig(template);
      templateIdForSession = template.id;
      quantidade = config.quantidade;
      modo = config.modo;
      tituloOverride = config.titulo;
      ritmo_meta = config.ritmo_meta;
      bancas = config.bancas;
      assuntos = config.assuntos;
      q = config.q;
    }

    if (!forcar_novo) {
      const { data: openSession, error: openSessionError } = await supabase
        .from('simulado_sessions')
        .select(SESSION_PUBLIC_SELECT)
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
          session: mapSessionResponse(openSession as SimuladoOpenSessionRow),
          questoes: [],
        });
      }
    }

    let pool = await fetchSimuladoQuestionPoolFromRpc({
      userId: auth.user.id,
      quantidade,
      filters: { bancas, assuntos, q },
    });

    const isAdmin = isAdminSessionEmail(auth.user.email ?? null);

    if (!pool.length && !from_session_id) {
      pool = await fetchSimuladoQuestionPoolFromCatalog({
        userId: auth.user.id,
        quantidade,
        filters: { bancas, assuntos, q },
        isAdmin,
      });
    }

    if (from_session_id) {
      const { data: originSession, error: originSessionError } = await supabase
        .from('simulado_sessions')
        .select('id, filtros, user_id')
        .eq('id', from_session_id)
        .eq('user_id', auth.user.id)
        .maybeSingle<{ id: string; filtros: Record<string, unknown>; user_id: string }>();

      if (originSessionError) {
        logger.error('Falha ao buscar sessão de origem para simulado derivado', originSessionError, {
          userId: auth.user.id,
          fromSessionId: from_session_id,
        });
        return NextResponse.json({ error: 'Erro ao criar simulado derivado' }, { status: 500 });
      }

      if (!originSession) {
        return NextResponse.json({ error: 'Sessão de origem não encontrada' }, { status: 404 });
      }

      const originKind = resolveSimuladoSessionKind(originSession.filtros);
      if (isAdaptiveSimuladoKind(originKind)) {
        return NextResponse.json(
          {
            error:
              'Esta avaliação é única e não pode ser refeita. Revise as questões no estudo reverso.',
          },
          { status: 403 },
        );
      }

      let derivedQuery = supabase
        .from('simulado_respostas')
        .select('modulo_id, modulo_slug, ordem')
        .eq('session_id', from_session_id)
        .eq('user_id', auth.user.id);

      if (only_errors) {
        derivedQuery = derivedQuery
          .eq('acertou', false)
          .order('respondida_em', { ascending: true, nullsFirst: false })
          .limit(quantidade);
      } else {
        derivedQuery = derivedQuery.order('ordem', { ascending: true }).limit(100);
      }

      const { data: derivedRows, error: derivedLookupError } = await derivedQuery;

      if (derivedLookupError) {
        logger.error('Falha ao buscar questões para simulado derivado', derivedLookupError, {
          userId: auth.user.id,
          fromSessionId: from_session_id,
          onlyErrors: only_errors,
        });
        return NextResponse.json({ error: 'Erro ao criar simulado derivado' }, { status: 500 });
      }

      const derivedPool = (derivedRows ?? []).map((row, idx) => ({
        modulo_id: row.modulo_id as string,
        modulo_slug: row.modulo_slug as string,
        ordem: only_errors ? idx + 1 : (row.ordem as number),
      }));

      if (derivedPool.length > 0) {
        pool = derivedPool;
      }
    }

    if (!pool.length) {
      return NextResponse.json(
        { error: 'Nenhuma questão disponível para os filtros informados' },
        { status: 404 },
      );
    }

    const filters = {
      bancas: bancas?.length ? bancas : null,
      assuntos: assuntos?.length ? assuntos : null,
      q: q || null,
      requested: quantidade,
      selected: pool.length,
      modo,
    };

    const titulo =
      tituloOverride?.trim() ||
      buildDefaultTitulo({
        bancas,
        assuntos,
        quantidade: pool.length,
        modo,
      });
    const ritmoMetaSegundos =
      modo === 'prova' ? ritmoToSecondsPerQuestion(ritmo_meta) : null;

    const sessionInsertPayload = {
      user_id: auth.user.id,
      total_questoes: pool.length,
      filtros: filters,
      status: 'aberto' as const,
      titulo,
      ritmo_meta_segundos_por_questao: ritmoMetaSegundos,
      prova_iniciada_em: null,
      ...(templateIdForSession ? { template_id: templateIdForSession } : {}),
    };

    const { data: session, error: sessionError } = await supabase
      .from('simulado_sessions')
      .insert({
        ...sessionInsertPayload,
        modo,
      })
      .select(SESSION_PUBLIC_SELECT)
      .single();

    let createdSession = session;
    let createdSessionError = sessionError;

    if (createdSessionError?.code === '42703') {
      const { template_id: _templateId, ...payloadWithoutOptionalCols } = sessionInsertPayload;
      const fallbackInsert = await supabase
        .from('simulado_sessions')
        .insert(payloadWithoutOptionalCols)
        .select(SESSION_PUBLIC_SELECT)
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

    if (templateIdForSession) {
      await touchSimuladoTemplateUsage(supabase, auth.user.id, templateIdForSession);
    }

    return NextResponse.json({
      success: true,
      resumed: false,
      session: mapSessionResponse(createdSession as SimuladoOpenSessionRow),
      questoes: pool.map(({ modulo_slug, ordem }) => ({ modulo_slug, ordem })),
    });
  } catch (error) {
    logger.error('Erro inesperado em POST /api/simulado/sessions', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
