/** Limites e copy do plano gratuito — safe para client (sem Supabase). */

export type ProSource = 'stripe' | 'invite' | null;

/** Offset fixo UTC−3 (horário de Brasília, sem DST). */
const FREEMIUM_TZ_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Estudo reverso (registrar-tentativa): 1 questão nova por dia no plano gratuito. */
export const FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT = 1;

/** Simulado: questões respondidas por dia no plano gratuito. */
export const FREEMIUM_SIMULADO_DAILY_LIMIT = 5;

/** Badge / sidebar: limites diários do tier gratuito (curto; ER = estudo reverso). */
export const FREEMIUM_PLAN_LIMITS_COMPACT = `${FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT} questão ER + ${FREEMIUM_SIMULADO_DAILY_LIMIT} questões simulado grátis/dia`;

/** Frase completa para FAQ, assinatura, paywall e telas de configuração. */
export const FREEMIUM_PLAN_LIMITS_DESCRIPTION = `${FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT} questão de estudo reverso e ${FREEMIUM_SIMULADO_DAILY_LIMIT} questões de simulado grátis por dia`;

export type AssertCanAnswerResult =
  | { allowed: true }
  | { allowed: false; resetEm: string };

export interface FreemiumDayBounds {
  start: Date;
  end: Date;
  resetEm: Date;
}

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

/** Data civil YYYY-MM-DD no fuso freemium (UTC−3 / Brasília). */
export function toFreemiumTimezoneYmd(instant: Date = new Date()): string {
  const localMs = instant.getTime() - FREEMIUM_TZ_OFFSET_MS;
  const local = new Date(localMs);
  const y = local.getUTCFullYear();
  const mo = local.getUTCMonth() + 1;
  const d = local.getUTCDate();
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
