import { createServerSupabase } from '@/lib/supabase/server';
import { isActiveMatriculaRow, GERAL_CONCURSO_SLUG } from '@/lib/concursos/entitlements';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import type { ConcursoMatriculaOrigem } from '@/types/database';

export type GeralMatriculaSnapshot = {
  origem: ConcursoMatriculaOrigem;
  status: string | null;
  expires_at: string | null;
};

export type ProSource = 'stripe' | 'invite' | null;

/** Offset fixo UTC−3 (horário de Brasília, sem DST). */
const FREEMIUM_TZ_OFFSET_MS = 3 * 60 * 60 * 1000;

export type AssertCanAnswerResult =
  | { allowed: true }
  | { allowed: false; resetEm: string };

export interface FreemiumDayBounds {
  /** Início do dia civil (meia-noite UTC−3), instante UTC. */
  start: Date;
  /** Fim exclusivo do dia civil (= próxima meia-noite UTC−3). */
  end: Date;
  /** Próxima meia-noite UTC−3 — quando o limite diário free é liberado. */
  resetEm: Date;
}

/**
 * Limites do “dia” freemium no calendário UTC−3 (Brasília).
 * `resetEm` é a próxima meia-noite nesse fuso.
 */
export function getFreemiumDayBounds(now: Date = new Date()): FreemiumDayBounds {
  const localMs = now.getTime() - FREEMIUM_TZ_OFFSET_MS;
  const local = new Date(localMs);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const d = local.getUTCDate();

  const start = new Date(Date.UTC(y, m, d) + FREEMIUM_TZ_OFFSET_MS);
  const resetEm = new Date(Date.UTC(y, m, d + 1) + FREEMIUM_TZ_OFFSET_MS);

  return { start, end: resetEm, resetEm };
}

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

export type FreemiumStatusPayload = {
  isPro: boolean;
  questoesHoje: number;
  limiteAtingido: boolean;
  resetEm: string;
  proSource: ProSource;
  proExpiresAt: string | null;
};

/** Status freemium para UI/API (`/api/freemium/status`). */
export async function getFreemiumStatusForUser(
  userId: string,
  userEmail?: string | null,
): Promise<FreemiumStatusPayload> {
  const { resetEm } = getFreemiumDayBounds();

  if (isFreemiumUnlimitedEmail(userEmail)) {
    return {
      isPro: true,
      questoesHoje: 0,
      limiteAtingido: false,
      resetEm: resetEm.toISOString(),
      proSource: null,
      proExpiresAt: null,
    };
  }

  const [isPro, questoesHoje, proInfo] = await Promise.all([
    isUserPro(userId),
    countQuestoesHojeForUser(userId),
    getActiveProInfoForUser(userId),
  ]);

  return {
    isPro,
    questoesHoje,
    limiteAtingido: !isPro && questoesHoje >= 1,
    resetEm: resetEm.toISOString(),
    proSource: isPro ? proInfo.proSource : null,
    proExpiresAt: isPro ? proInfo.proExpiresAt : null,
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
  if (questoesHoje >= 1) {
    const { resetEm } = getFreemiumDayBounds();
    return { allowed: false, resetEm: resetEm.toISOString() };
  }

  return { allowed: true };
}
