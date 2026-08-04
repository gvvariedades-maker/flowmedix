import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { CACHE_REVALIDATE_IMMEDIATE } from '@/lib/cache';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { resolveE2eEstudarAttempt } from '@/lib/e2e/estudarSeed';
import { isE2eEstudarSlug } from '@/lib/e2e/constants';
import {
  extractEvidenceClientBody,
  ingestEvidenceRouteHook,
} from '@/lib/evidence/ingestEvidenceRouteHook';
import type { EvidenceSupabaseClientLike } from '@/lib/evidence/supabasePersistence';
import { resolveQuestionAttempt } from '@/lib/estudar/questionPayload';
import {
  assertCanAnswerQuestion,
  countQuestoesHojeForUser,
  FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT,
  getFreemiumDayBounds,
  isFreemiumUnlimitedEmail,
  isUserPro,
} from '@/lib/freemium';
import { userHasModuloAccess } from '@/lib/concursos/entitlements';
import { moduloAccessOptionsFromEmail } from '@/lib/concursos/studyAccess';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';

type CanonicalQuestionMeta = {
  banca: string;
  topico: string;
  /** null quando ausente no JSON. */
  subtopico: string | null;
};

function extractCanonicalQuestionMeta(conteudoJson: unknown): CanonicalQuestionMeta {
  const meta = (
    conteudoJson as {
      meta?: { banca?: string; topico?: string; subtopico?: string };
    } | null
  )?.meta;

  const topico =
    typeof meta?.topico === 'string' && meta.topico.trim() ? meta.topico.trim() : 'Geral';
  const subtopico =
    typeof meta?.subtopico === 'string' && meta.subtopico.trim()
      ? meta.subtopico.trim()
      : null;
  const banca =
    typeof meta?.banca === 'string' && meta.banca.trim()
      ? meta.banca.trim()
      : 'DESCONHECIDA';

  return { banca, topico, subtopico };
}

async function denyModuloAccessResponse(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  moduloSlug: string,
) {
  const { data: modulo, error } = await supabase
    .from('modulos_estudo')
    .select('id')
    .eq('modulo_slug', moduloSlug)
    .maybeSingle();

  if (error) {
    logger.error('Failed to resolve modulo for access check', error, { moduloSlug });
    return NextResponse.json({ error: 'Erro ao validar questão' }, { status: 500 });
  }

  if (!modulo) {
    return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
  }

  return NextResponse.json({ error: 'Sem acesso a esta questão' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modulo_slug, opcao_id, banca, topico, subtopico } = body;

    if (!modulo_slug || !opcao_id) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS') && isE2eEstudarSlug(modulo_slug)) {
      const gabarito = resolveE2eEstudarAttempt(modulo_slug, opcao_id);
      if (!gabarito) {
        return NextResponse.json({ error: 'Alternativa inválida' }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        acertou: gabarito.acertou,
        opcao_correta_id: gabarito.opcaoCorretaId,
      });
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { user } = auth;
    const supabase = await createServerSupabase();

    const hasAccess = await userHasModuloAccess(
      user.id,
      modulo_slug,
      moduloAccessOptionsFromEmail(user.email),
    );
    if (!hasAccess) {
      return denyModuloAccessResponse(supabase, modulo_slug);
    }

    const { data: historicoExistente, error: historicoLookupError } = await supabase
      .from('historico_questoes')
      .select('id')
      .eq('user_id', user.id)
      .eq('modulo_slug', modulo_slug)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (historicoLookupError) {
      logger.error('Failed to lookup historico for attempt', historicoLookupError, {
        userId: user.id,
        modulo_slug,
      });
      return NextResponse.json({ error: 'Erro ao consultar histórico' }, { status: 500 });
    }

    const isReplay = historicoExistente != null;

    // Metadados canônicos antes do gate: a classificação FSRS da tentativa exige meta.
    const { data: modulo, error: moduloError } = await supabase
      .from('modulos_estudo')
      .select('conteudo_json')
      .eq('modulo_slug', modulo_slug)
      .maybeSingle();

    if (moduloError) {
      logger.error('Failed to load question for attempt', moduloError, { modulo_slug });
      return NextResponse.json({ error: 'Questão não encontrada' }, { status: 500 });
    }

    if (!modulo) {
      return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
    }

    const canonical = extractCanonicalQuestionMeta(modulo.conteudo_json);

    // Replay não conta na cota do plano gratuito (não gera nova questão).
    if (!isReplay) {
      const gate = await assertCanAnswerQuestion(user.id, user.email);
      if (!gate.allowed) {
        return NextResponse.json(
          { limiteAtingido: true, resetEm: gate.resetEm, allowed: false },
          { status: 403 },
        );
      }

      if (!isFreemiumUnlimitedEmail(user.email)) {
        const [recheck, isPro] = await Promise.all([
          countQuestoesHojeForUser(user.id),
          isUserPro(user.id),
        ]);
        if (!isPro && recheck >= FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT) {
          const { resetEm } = getFreemiumDayBounds();
          return NextResponse.json(
            { limiteAtingido: true, resetEm: resetEm.toISOString(), allowed: false },
            { status: 403 },
          );
        }
      }
    }

    const gabarito = resolveQuestionAttempt(modulo.conteudo_json, opcao_id);
    if (!gabarito) {
      return NextResponse.json({ error: 'Alternativa inválida' }, { status: 400 });
    }

    const { acertou, opcaoCorretaId } = gabarito;

    const historicoPayload = {
      acertou,
      banca: canonical.banca !== 'DESCONHECIDA' ? canonical.banca : banca || 'DESCONHECIDA',
      topico: canonical.topico !== 'Geral' ? canonical.topico : topico || 'Geral',
      subtopico:
        canonical.subtopico && canonical.subtopico !== 'Geral'
          ? canonical.subtopico
          : subtopico || topico || 'Geral',
    };

    const reviewedAt = new Date().toISOString();

    const persistError = isReplay
      ? (
          await supabase
            .from('historico_questoes')
            .update({
              ...historicoPayload,
              /** Plano diário (SM-2) e /progresso usam `created_at` como última revisão. */
              created_at: reviewedAt,
            })
            .eq('id', historicoExistente.id)
        ).error
      : (
          await supabase.from('historico_questoes').insert({
            user_id: user.id,
            modulo_slug,
            ...historicoPayload,
          })
        ).error;

    if (persistError) {
      logger.error('Failed to register attempt via API', persistError, {
        userId: user.id,
        modulo_slug,
        isReplay,
      });
      return NextResponse.json({ error: 'Erro ao registrar tentativa' }, { status: 500 });
    }

    revalidateTag('historico', CACHE_REVALIDATE_IMMEDIATE);
    revalidateTag(`user-${user.id}`, CACHE_REVALIDATE_IMMEDIATE);

    const evidence = await ingestEvidenceRouteHook({
      supabase: supabase as unknown as EvidenceSupabaseClientLike,
      route: 'registrar_tentativa',
      user_id: user.id,
      user_email: user.email,
      question_id: modulo_slug,
      selected_alternative: opcao_id,
      correct: acertou,
      conteudo_json: modulo.conteudo_json,
      client_body: extractEvidenceClientBody(body as Record<string, unknown>),
      e2e_instrumentation: false,
      log_route_label: 'registrar-tentativa',
    });

    return NextResponse.json({
      success: true,
      acertou,
      opcao_correta_id: opcaoCorretaId,
      ...(evidence !== undefined ? { evidence } : {}),
    });
  } catch (error) {
    logger.error('Unexpected error in registrar-tentativa', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
