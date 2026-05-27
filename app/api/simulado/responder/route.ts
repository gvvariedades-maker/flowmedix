import { NextRequest, NextResponse } from 'next/server';
import { resolveQuestionAttempt } from '@/lib/estudar/questionPayload';
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
  acertou: boolean | null;
};

type SimuladoSessionRow = {
  id: string;
  status: 'aberto' | 'concluido' | 'cancelado';
  user_id: string;
};

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

    const { session_id, modulo_slug, opcao_id } = parsed.data;

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
      .select('id, status, user_id')
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

    if (session.status !== 'aberto') {
      return NextResponse.json({ error: 'Sessão de simulado não está aberta' }, { status: 409 });
    }

    const { data: resposta, error: respostaError } = await supabase
      .from('simulado_respostas')
      .select('id, session_id, modulo_id, modulo_slug, acertou')
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

    const { data: modulo, error: moduloError } = await supabase
      .from('modulos_estudo')
      .select('conteudo_json')
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

    const { error: updateError } = await supabase
      .from('simulado_respostas')
      .update({
        opcao_id,
        opcao_correta_id: opcaoCorretaId,
        acertou,
        respondida_em: new Date().toISOString(),
      })
      .eq('id', resposta.id)
      .eq('session_id', session_id);

    if (updateError) {
      logger.error('Falha ao atualizar resposta do simulado', updateError, {
        userId: auth.user.id,
        sessionId: session_id,
        moduloSlug: modulo_slug,
      });
      return NextResponse.json({ error: 'Erro ao registrar resposta' }, { status: 500 });
    }

    const { count: pendentes, error: pendentesError } = await supabase
      .from('simulado_respostas')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id)
      .eq('user_id', auth.user.id)
      .is('acertou', null);

    if (pendentesError) {
      logger.error('Falha ao contar pendências do simulado', pendentesError, {
        userId: auth.user.id,
        sessionId: session_id,
      });
      return NextResponse.json({ error: 'Erro ao atualizar progresso do simulado' }, { status: 500 });
    }

    if ((pendentes ?? 0) === 0) {
      await supabase
        .from('simulado_sessions')
        .update({
          status: 'concluido',
          concluida_em: new Date().toISOString(),
        })
        .eq('id', session_id)
        .eq('user_id', auth.user.id)
        .eq('status', 'aberto');
    }

    return NextResponse.json({
      success: true,
      acertou,
      opcao_correta_id: opcaoCorretaId,
      session_status: (pendentes ?? 0) === 0 ? 'concluido' : 'aberto',
    });
  } catch (error) {
    logger.error('Erro inesperado em POST /api/simulado/responder', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
