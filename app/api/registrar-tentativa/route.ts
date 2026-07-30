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
import { isUuidV4 } from '@/lib/evidence/parseClientFields';
import { applyFsrsReview } from '@/lib/fsrs/applyReview';
import {
  confirmDueScheduledReview,
  parseFromRevisoesIntention,
  type ConfirmDueReviewClient,
} from '@/lib/fsrs/confirmDueReview';
import { createSupabaseFsrsPersistence } from '@/lib/fsrs/supabasePersistence';
import {
  getFsrsRequestRetention,
  isFsrsMvpBetaEmail,
  isFsrsMvpEnabled,
} from '@/lib/env';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { randomUUID } from 'node:crypto';

type CanonicalQuestionMeta = {
  banca: string;
  topico: string;
  /** null quando ausente no JSON — FSRS exige subtópico não genérico. */
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
    const wantsScheduledReview = parseFromRevisoesIntention(
      body as Record<string, unknown>,
    );

    let scheduledReviewConfirmed = false;
    let sameStemFallback = false;
    // Mesma disciplina no confirm e no apply (Geral → Enfermagem) para o mesmo review_unit_id.
    const fsrsDiscipline =
      canonical.topico !== 'Geral' ? canonical.topico : 'Enfermagem';

    // Intenção do client não basta: só agenda scheduled_review se card due atestado.
    // A confirmação classifica a tentativa; nunca dispensa a cota (ver gate abaixo).
    if (
      wantsScheduledReview &&
      isFsrsMvpEnabled() &&
      isFsrsMvpBetaEmail(user.email)
    ) {
      const due = await confirmDueScheduledReview({
        client: supabase as unknown as ConfirmDueReviewClient,
        userId: user.id,
        questionId: modulo_slug,
        discipline: fsrsDiscipline,
        subtopico: canonical.subtopico,
      });
      if (due.confirmed) {
        scheduledReviewConfirmed = true;
        sameStemFallback = due.sameStemFallback;
      } else {
        logger.info('FSRS MVP: from_revisoes sem card due confirmado', {
          userId: user.id,
          modulo_slug,
          reason: due.reason,
        });
      }
    }

    // Revisão vencida conta na cota do plano gratuito: `scheduledReviewConfirmed`
    // decide elegibilidade FSRS, não isenção. Só replay escapa (não gera nova questão).
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

    // FSRS MVP — não bloqueia a tentativa; flag default off
    if (isFsrsMvpEnabled()) {
      try {
        const rawAttempt = (body as Record<string, unknown>).attempt_id;
        const trimmedAttempt =
          typeof rawAttempt === 'string' ? rawAttempt.trim() : '';
        const hadAttemptId = trimmedAttempt.length > 0;
        let attemptId: string;
        if (isUuidV4(trimmedAttempt)) {
          attemptId = trimmedAttempt;
        } else {
          attemptId = randomUUID();
          logger.info('FSRS MVP: attempt_id missing or invalid; generated server-side', {
            userId: user.id,
            modulo_slug,
            had_attempt_id: hadAttemptId,
          });
        }

        const persistence = createSupabaseFsrsPersistence(
          supabase as unknown as Parameters<typeof createSupabaseFsrsPersistence>[0],
        );
        await applyFsrsReview({
          userId: user.id,
          attemptId,
          questionId: modulo_slug,
          isCorrect: acertou,
          discipline: fsrsDiscipline,
          subtopico: canonical.subtopico,
          fromScheduledReview: scheduledReviewConfirmed,
          sameStemFallback: scheduledReviewConfirmed ? sameStemFallback : false,
          requestRetention: getFsrsRequestRetention(),
          persistence,
        });
      } catch (fsrsErr) {
        logger.error('FSRS MVP boundary failed in registrar-tentativa', fsrsErr, {
          userId: user.id,
          modulo_slug,
        });
      }
    }

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
