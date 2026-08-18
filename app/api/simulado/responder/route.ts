import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { CACHE_REVALIDATE_IMMEDIATE } from '@/lib/cache';
import { resolveQuestionAttempt } from '@/lib/estudar/questionPayload';
import {
  extractEvidenceClientBody,
  ingestEvidenceRouteHook,
} from '@/lib/evidence/ingestEvidenceRouteHook';
import type { EvidenceSupabaseClientLike } from '@/lib/evidence/supabasePersistence';
import {
  buildSimuladoQuestaoRespondida,
  computeSimuladoResumo,
  type SimuladoRespostaProgressRow,
} from '@/lib/simulado/sessionProgress';
import { resolveSimuladoSessionKind } from '@/lib/simulado/sessionKind';
import {
  assertCanAnswerSimuladoQuestion,
  countSimuladoQuestoesHojeForUser,
  FREEMIUM_SIMULADO_DAILY_LIMIT,
  getFreemiumDayBounds,
  isFreemiumUnlimitedEmail,
  isUserPro,
} from '@/lib/freemium';
import { SimuladoAnswerSchema } from '@/lib/validations';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { answerE2eSimuladoQuestion } from '@/lib/e2e/simuladoSeed';

type SimuladoRespostaRow = {
  id: string;
  session_id: string;
  modulo_id: string;
  modulo_slug: string;
  ordem: number;
  acertou: boolean | null;
};

type SimuladoSessionRow = {
  id: string;
  status: 'aberto' | 'concluido' | 'cancelado';
  user_id: string;
  total_questoes: number;
  filtros: Record<string, unknown> | null;
};

const RESPOSTA_PROGRESS_SELECT = `
  ordem,
  modulo_slug,
  opcao_id,
  opcao_correta_id,
  acertou,
  respondida_em,
  tempo_ms,
  modulos_estudo (
    banca,
    titulo_aula,
    modulo_nome
  )
`;

function resolveSessionMode(filtros?: Record<string, unknown> | null): 'treino' | 'prova' {
  return filtros?.modo === 'prova' ? 'prova' : 'treino';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SimuladoAnswerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { session_id, modulo_slug, opcao_id, tempo_ms } = parsed.data;

    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      const result = answerE2eSimuladoQuestion(session_id, modulo_slug, opcao_id);
      if (!result) {
        return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createServerSupabase();

    const { data: session, error: sessionError } = await supabase
      .from('simulado_sessions')
      .select('id, status, user_id, filtros, total_questoes')
      .eq('id', session_id)
      .maybeSingle<SimuladoSessionRow>();

    if (sessionError) {
      logger.error('Falha ao buscar sessão de simulado', sessionError, {
        userId: auth.user.id,
        sessionId: session_id,
      });
      return NextResponse.json({ error: 'Erro ao validar sessão' }, { status: 500 });
    }

    if (!session || session.user_id !== auth.user.id) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    const sessionMode = resolveSessionMode(session.filtros);

    if (session.status !== 'aberto') {
      return NextResponse.json({ error: 'Sessão de simulado não está aberta' }, { status: 409 });
    }

    const { data: resposta, error: respostaError } = await supabase
      .from('simulado_respostas')
      .select('id, session_id, modulo_id, modulo_slug, ordem, acertou')
      .eq('session_id', session_id)
      .eq('modulo_slug', modulo_slug)
      .eq('user_id', auth.user.id)
      .maybeSingle<SimuladoRespostaRow>();

    if (respostaError) {
      logger.error('Falha ao buscar item do simulado', respostaError, {
        userId: auth.user.id,
        sessionId: session_id,
        modulo_slug,
      });
      return NextResponse.json({ error: 'Erro ao validar questão do simulado' }, { status: 500 });
    }

    if (!resposta) {
      return NextResponse.json({ error: 'Questão não encontrada na sessão' }, { status: 404 });
    }

    if (resposta.acertou !== null && sessionMode === 'prova') {
      return NextResponse.json({ error: 'Questão já respondida para esta sessão' }, { status: 409 });
    }

    const isFirstAnswerInSession = resposta.acertou === null;

    if (isFirstAnswerInSession) {
      const gate = await assertCanAnswerSimuladoQuestion(auth.user.id, auth.user.email);
      if (!gate.allowed) {
        return NextResponse.json(
          {
            limiteAtingido: true,
            resetEm: gate.resetEm,
            allowed: false,
            limite: FREEMIUM_SIMULADO_DAILY_LIMIT,
          },
          { status: 403 },
        );
      }

      if (!isFreemiumUnlimitedEmail(auth.user.email)) {
        const [recheck, isPro] = await Promise.all([
          countSimuladoQuestoesHojeForUser(auth.user.id),
          isUserPro(auth.user.id),
        ]);
        if (!isPro && recheck >= FREEMIUM_SIMULADO_DAILY_LIMIT) {
          const { resetEm } = getFreemiumDayBounds();
          return NextResponse.json(
            {
              limiteAtingido: true,
              resetEm: resetEm.toISOString(),
              allowed: false,
              limite: FREEMIUM_SIMULADO_DAILY_LIMIT,
            },
            { status: 403 },
          );
        }
      }
    }

    const { data: modulo, error: moduloError } = await supabase
      .from('modulos_estudo')
      .select('conteudo_json, banca, modulo_nome, titulo_aula')
      .eq('id', resposta.modulo_id)
      .maybeSingle();

    if (moduloError || !modulo) {
      logger.error('Falha ao buscar conteúdo da questão do simulado', moduloError, {
        userId: auth.user.id,
        sessionId: session_id,
        moduloSlug: modulo_slug,
      });
      return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
    }

    const gabarito = resolveQuestionAttempt(modulo.conteudo_json, opcao_id);
    if (!gabarito) {
      return NextResponse.json({ error: 'Alternativa inválida' }, { status: 400 });
    }

    const { acertou, opcaoCorretaId } = gabarito;

    const { data: respostaAtualizada, error: updateError } = await supabase
      .from('simulado_respostas')
      .update({
        opcao_id,
        opcao_correta_id: opcaoCorretaId,
        acertou,
        tempo_ms: tempo_ms ?? null,
        respondida_em: new Date().toISOString(),
      })
      .eq('id', resposta.id)
      .eq('session_id', session_id)
      .select('id')
      .maybeSingle();

    if (updateError) {
      logger.error('Falha ao atualizar resposta do simulado', updateError, {
        userId: auth.user.id,
        sessionId: session_id,
        moduloSlug: modulo_slug,
      });
      return NextResponse.json({ error: 'Erro ao registrar resposta' }, { status: 500 });
    }

    if (!respostaAtualizada) {
      return NextResponse.json({ error: 'Questão já respondida para esta sessão' }, { status: 409 });
    }

    const { data: historicoExistente, error: historicoLookupError } = await supabase
      .from('historico_questoes')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('modulo_slug', modulo_slug)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (historicoLookupError) {
      logger.error('Falha ao consultar histórico para resposta de simulado', historicoLookupError, {
        userId: auth.user.id,
        sessionId: session_id,
        moduloSlug: modulo_slug,
      });
      return NextResponse.json({ error: 'Erro ao sincronizar histórico' }, { status: 500 });
    }

    const moduloMeta = (modulo.conteudo_json as { meta?: { banca?: string; topico?: string; subtopico?: string } } | null)
      ?.meta;

    const historicoPayload = {
      acertou,
      banca: moduloMeta?.banca || modulo.banca || 'DESCONHECIDA',
      topico: moduloMeta?.topico || modulo.modulo_nome || 'Geral',
      subtopico: moduloMeta?.subtopico || modulo.titulo_aula || modulo.modulo_nome || 'Geral',
    };

    const persistError = historicoExistente
      ? (
          await supabase
            .from('historico_questoes')
            .update(historicoPayload)
            .eq('id', historicoExistente.id)
        ).error
      : (
          await supabase.from('historico_questoes').insert({
            user_id: auth.user.id,
            modulo_slug,
            ...historicoPayload,
          })
        ).error;

    if (persistError) {
      logger.error('Falha ao persistir histórico de resposta do simulado', persistError, {
        userId: auth.user.id,
        sessionId: session_id,
        moduloSlug: modulo_slug,
      });
      return NextResponse.json({ error: 'Erro ao sincronizar histórico' }, { status: 500 });
    }

    revalidateTag('historico', CACHE_REVALIDATE_IMMEDIATE);
    revalidateTag(`user-${auth.user.id}`, CACHE_REVALIDATE_IMMEDIATE);

    const evidence = await ingestEvidenceRouteHook({
      supabase: supabase as unknown as EvidenceSupabaseClientLike,
      route: 'simulado_responder',
      user_id: auth.user.id,
      user_email: auth.user.email,
      question_id: modulo_slug,
      selected_alternative: opcao_id,
      correct: acertou,
      conteudo_json: modulo.conteudo_json,
      client_body: extractEvidenceClientBody(body as Record<string, unknown>),
      session_id: session.id,
      session_kind: resolveSimuladoSessionKind(session.filtros),
      e2e_instrumentation: false,
      log_route_label: 'simulado-responder',
    });

    const { data: progressRows, error: progressError } = await supabase
      .from('simulado_respostas')
      .select(RESPOSTA_PROGRESS_SELECT)
      .eq('session_id', session_id)
      .eq('user_id', auth.user.id)
      .order('ordem', { ascending: true });

    if (progressError) {
      logger.error('Falha ao carregar progresso após resposta do simulado', progressError, {
        userId: auth.user.id,
        sessionId: session_id,
      });
      return NextResponse.json({ error: 'Erro ao atualizar progresso do simulado' }, { status: 500 });
    }

    const rows = (progressRows ?? []) as SimuladoRespostaProgressRow[];
    const pendentes = rows.reduce((acc, row) => acc + (row.acertou === null ? 1 : 0), 0);
    const sessionStatus = pendentes === 0 ? 'concluido' : 'aberto';

    if (sessionStatus === 'concluido') {
      const { error: finalizeError } = await supabase
        .from('simulado_sessions')
        .update({
          status: 'concluido',
          concluida_em: new Date().toISOString(),
        })
        .eq('id', session_id)
        .eq('user_id', auth.user.id)
        .eq('status', 'aberto');

      if (finalizeError) {
        logger.error('Falha ao concluir sessão de simulado', finalizeError, {
          userId: auth.user.id,
          sessionId: session_id,
        });
      } else {
        const { error: refreshError } = await supabase.rpc('refresh_simulado_session_analytics', {
          p_session_id: session_id,
        });
        if (refreshError) {
          logger.warn('Falha ao materializar analytics da sessão concluída', {
            userId: auth.user.id,
            sessionId: session_id,
            message: refreshError.message,
          });
        }
      }
    }

    const answeredRow = rows.find((row) => row.modulo_slug === modulo_slug);

    if (!answeredRow || answeredRow.acertou === null) {
      logger.error('Resposta registrada mas progresso inconsistente', undefined, {
        userId: auth.user.id,
        sessionId: session_id,
        moduloSlug: modulo_slug,
      });
      return NextResponse.json({ error: 'Erro ao atualizar progresso do simulado' }, { status: 500 });
    }

    const resumo = computeSimuladoResumo(rows, session.total_questoes);
    const questao_atualizada = buildSimuladoQuestaoRespondida(answeredRow, {
      sessionMode,
      sessionStatus,
    });

    return NextResponse.json({
      success: true,
      acertou: sessionMode === 'treino' ? acertou : null,
      opcao_correta_id: sessionMode === 'treino' ? opcaoCorretaId : null,
      session_status: sessionStatus,
      questao_atualizada,
      resumo,
      ...(evidence !== undefined ? { evidence } : {}),
    });
  } catch (error) {
    logger.error('Erro inesperado em POST /api/simulado/responder', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
