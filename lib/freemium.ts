import { createServerSupabase } from '@/lib/supabase/server';
import { GERAL_CONCURSO_SLUG } from '@/lib/concursos/catalogSlugs';
import { isActiveMatriculaRow } from '@/lib/concursos/matriculaActive';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import type { ConcursoMatriculaOrigem } from '@/types/database';

import {
  FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT,
  FREEMIUM_SIMULADO_DAILY_LIMIT,
  getFreemiumDayBounds,
  type AssertCanAnswerResult,
  type ProSource,
} from '@/lib/freemium/constants';

export type { ProSource, AssertCanAnswerResult, FreemiumDayBounds } from '@/lib/freemium/constants';
export {
  FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT,
  FREEMIUM_SIMULADO_DAILY_LIMIT,
  FREEMIUM_PLAN_LIMITS_COMPACT,
  FREEMIUM_PLAN_LIMITS_DESCRIPTION,
  FREEMIUM_SIMULADOS_PERSONALIZADOS_TOTAL,
  FREEMIUM_FREE_WEEKLY_MISSIONS,
  FREEMIUM_WEEKLY_UNLOCK_DAYS,
  FREEMIUM_SIMULADOS_PERSONALIZADOS_COMPACT,
  FREEMIUM_SIMULADOS_PERSONALIZADOS_DESCRIPTION,
  getFreemiumDayBounds,
  toFreemiumTimezoneYmd,
} from '@/lib/freemium/constants';

export type {
  WeeklyMissionEntitlement,
  WeeklyMissionBlockReason,
} from '@/lib/freemium/weeklyMissionEntitlement';
export {
  assertCanStartWeeklyMission,
  getWeeklyMissionEntitlement,
  countWeeklyMissionsForUser,
  isEligibleForAutomaticWeeklyGeneration,
  weeklyMissionBlockMessage,
} from '@/lib/freemium/weeklyMissionEntitlement';

export type GeralMatriculaSnapshot = {
  origem: ConcursoMatriculaOrigem;
  status: string | null;
  expires_at: string | null;
};

/** Admin e contas com acesso ilimitado não entram no limite de 1 questão/dia. */
export function isFreemiumUnlimitedEmail(email: string | null | undefined): boolean {
  return isAdminSessionEmail(email);
}

/**
 * Acesso ilimitado ao estudo (admin por e-mail ou assinatura Pro ativa).
 * Usado no checkout para não enviar ao Stripe quem já pode estudar sem limite.
 */
export async function userHasUnlimitedStudyAccess(
  userId: string | undefined,
  email: string | null | undefined,
): Promise<boolean> {
  if (isFreemiumUnlimitedEmail(email)) return true;
  if (userId) return isUserPro(userId);
  return false;
}

/** Matrícula no concurso `geral` (qualquer origem), ou null se inexistente. */
export async function getGeralMatriculaForUser(
  userId: string,
): Promise<GeralMatriculaSnapshot | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('concurso_matriculas')
    .select(
      `
      origem,
      status,
      expires_at,
      concurso:concursos!inner(slug)
    `,
    )
    .eq('user_id', userId)
    .eq('concurso.slug', GERAL_CONCURSO_SLUG)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao buscar matrícula geral', error, { userId });
    throw error;
  }

  if (!data?.origem) return null;

  return {
    origem: data.origem as ConcursoMatriculaOrigem,
    status: data.status ?? null,
    expires_at: data.expires_at ?? null,
  };
}

function proSourceFromOrigem(origem: ConcursoMatriculaOrigem): ProSource {
  if (origem === 'stripe_pro') return 'stripe';
  if (origem === 'invite') return 'invite';
  return null;
}

/**
 * Pro = matrícula `geral` ativa com origem `stripe_pro` ou `invite` (trial por convite).
 * Matrícula `cadastro` ou edital pago não contam como Pro.
 */
export async function isUserPro(userId: string): Promise<boolean> {
  const matricula = await getGeralMatriculaForUser(userId);
  if (!matricula || !isActiveMatriculaRow(matricula)) return false;
  return matricula.origem === 'stripe_pro' || matricula.origem === 'invite';
}

/** Origem e fim do Pro ativo em `geral`, se houver. */
export async function getActiveProInfoForUser(
  userId: string,
): Promise<{ proSource: ProSource; proExpiresAt: string | null }> {
  const matricula = await getGeralMatriculaForUser(userId);
  if (!matricula || !isActiveMatriculaRow(matricula)) {
    return { proSource: null, proExpiresAt: null };
  }

  const proSource = proSourceFromOrigem(matricula.origem);
  if (!proSource) {
    return { proSource: null, proExpiresAt: null };
  }

  return {
    proSource,
    proExpiresAt: matricula.expires_at,
  };
}

/** Contagem de questões respondidas no dia civil UTC−3 (sem cache). */
export async function countQuestoesHojeForUser(userId: string): Promise<number> {
  const { start, end } = getFreemiumDayBounds();
  const supabase = await createServerSupabase();

  const { count, error } = await supabase
    .from('historico_questoes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());

  if (error) {
    logger.error('Falha ao contar questões do dia (freemium)', error, { userId });
    throw error;
  }

  return count ?? 0;
}

/** Respostas de simulado registradas no dia civil UTC−3 (sem cache). */
export async function countSimuladoQuestoesHojeForUser(userId: string): Promise<number> {
  const { start, end } = getFreemiumDayBounds();
  const supabase = await createServerSupabase();

  const { count, error } = await supabase
    .from('simulado_respostas')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('respondida_em', 'is', null)
    .gte('respondida_em', start.toISOString())
    .lt('respondida_em', end.toISOString());

  if (error) {
    logger.error('Falha ao contar questões de simulado do dia (freemium)', error, { userId });
    throw error;
  }

  return count ?? 0;
}

export type SimuladoFreemiumPayload = {
  questoesHoje: number;
  limite: number;
  restantes: number;
  limiteAtingido: boolean;
};

export type FreemiumStatusPayload = {
  isPro: boolean;
  questoesHoje: number;
  limiteAtingido: boolean;
  resetEm: string;
  proSource: ProSource;
  proExpiresAt: string | null;
  simulado: SimuladoFreemiumPayload;
};

/** Status freemium para UI/API (`/api/freemium/status`). */
export async function getFreemiumStatusForUser(
  userId: string,
  userEmail?: string | null,
): Promise<FreemiumStatusPayload> {
  const { resetEm } = getFreemiumDayBounds();

  const simuladoUnlimited = {
    questoesHoje: 0,
    limite: FREEMIUM_SIMULADO_DAILY_LIMIT,
    restantes: FREEMIUM_SIMULADO_DAILY_LIMIT,
    limiteAtingido: false,
  };

  if (isFreemiumUnlimitedEmail(userEmail)) {
    return {
      isPro: true,
      questoesHoje: 0,
      limiteAtingido: false,
      resetEm: resetEm.toISOString(),
      proSource: null,
      proExpiresAt: null,
      simulado: simuladoUnlimited,
    };
  }

  const [isPro, questoesHoje, simuladoQuestoesHoje, proInfo] = await Promise.all([
    isUserPro(userId),
    countQuestoesHojeForUser(userId),
    countSimuladoQuestoesHojeForUser(userId),
    getActiveProInfoForUser(userId),
  ]);

  const simuladoLimiteAtingido =
    !isPro && simuladoQuestoesHoje >= FREEMIUM_SIMULADO_DAILY_LIMIT;

  return {
    isPro,
    questoesHoje,
    limiteAtingido: !isPro && questoesHoje >= FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT,
    resetEm: resetEm.toISOString(),
    proSource: isPro ? proInfo.proSource : null,
    proExpiresAt: isPro ? proInfo.proExpiresAt : null,
    simulado: isPro
      ? simuladoUnlimited
      : {
          questoesHoje: simuladoQuestoesHoje,
          limite: FREEMIUM_SIMULADO_DAILY_LIMIT,
          restantes: Math.max(0, FREEMIUM_SIMULADO_DAILY_LIMIT - simuladoQuestoesHoje),
          limiteAtingido: simuladoLimiteAtingido,
        },
  };
}

/**
 * Gate freemium antes de registrar tentativa.
 * Não lança exceção — retorna `{ allowed: false, resetEm }` quando o limite diário foi atingido.
 */
export async function assertCanAnswerQuestion(
  userId: string,
  userEmail?: string | null,
): Promise<AssertCanAnswerResult> {
  if (isFreemiumUnlimitedEmail(userEmail)) {
    return { allowed: true };
  }

  if (await isUserPro(userId)) {
    return { allowed: true };
  }

  const questoesHoje = await countQuestoesHojeForUser(userId);
  if (questoesHoje >= FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT) {
    const { resetEm } = getFreemiumDayBounds();
    return { allowed: false, resetEm: resetEm.toISOString() };
  }

  return { allowed: true };
}

/**
 * Gate freemium antes de registrar resposta no simulado (primeira resposta do item na sessão).
 */
export async function assertCanAnswerSimuladoQuestion(
  userId: string,
  userEmail?: string | null,
): Promise<AssertCanAnswerResult> {
  if (isFreemiumUnlimitedEmail(userEmail)) {
    return { allowed: true };
  }

  if (await isUserPro(userId)) {
    return { allowed: true };
  }

  const questoesHoje = await countSimuladoQuestoesHojeForUser(userId);
  if (questoesHoje >= FREEMIUM_SIMULADO_DAILY_LIMIT) {
    const { resetEm } = getFreemiumDayBounds();
    return { allowed: false, resetEm: resetEm.toISOString() };
  }

  return { allowed: true };
}
