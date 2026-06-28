import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { getDiagnosticoSimuladoCardState } from '@/lib/simulado/diagnosticoStatus';
import { isWeeklySimuladoFiltros } from '@/lib/simulado/weeklySimuladoCore';
import {
  FREEMIUM_FREE_WEEKLY_MISSIONS,
  FREEMIUM_WEEKLY_UNLOCK_DAYS,
  addFreemiumDaysToYmd,
  freemiumYmdDiffDays,
  toFreemiumTimezoneYmd,
} from '@/lib/freemium/constants';
import { isFreemiumUnlimitedEmail, isUserPro } from '@/lib/freemium';

export type WeeklyMissionBlockReason =
  | 'upgrade_required'
  | 'waiting_period'
  | 'diagnostico_pending';

export type WeeklyMissionEntitlement =
  | { allowed: true; tier: 'pro' | 'free' | 'admin' }
  | {
      allowed: false;
      reason: WeeklyMissionBlockReason;
      unlockAt?: string;
      daysRemaining?: number;
      weeklyMissionsUsed: number;
      weeklyMissionsLimit: number;
    };

async function getUserSignupYmd(userId: string): Promise<string | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) {
    logger.warn('Falha ao buscar data de cadastro (missão semanal)', {
      userId,
      code: error.message,
    });
    return null;
  }
  const createdAt = data.user?.created_at;
  if (!createdAt) return null;
  return toFreemiumTimezoneYmd(new Date(createdAt));
}

export async function countWeeklyMissionsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('simulado_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .filter('filtros->>origem', 'eq', 'weekly')
    .neq('status', 'cancelado');

  if (error) {
    logger.warn('Falha ao contar missões semanais', { userId, code: error.code });
    return 0;
  }

  return count ?? 0;
}

/**
 * Gate para gerar nova missão semanal.
 * Grátis: 1 missão após 7 dias do cadastro (2º simulado personalizado do funil).
 * Pro: ilimitado.
 */
export async function getWeeklyMissionEntitlement(
  userId: string,
  userEmail?: string | null,
  supabase?: SupabaseClient,
): Promise<WeeklyMissionEntitlement> {
  if (isFreemiumUnlimitedEmail(userEmail)) {
    return { allowed: true, tier: 'admin' };
  }

  if (await isUserPro(userId)) {
    return { allowed: true, tier: 'pro' };
  }

  const client = supabase ?? (await createServerSupabase());
  const [weeklyMissionsUsed, signupYmd, diagnostico] = await Promise.all([
    countWeeklyMissionsForUser(client, userId),
    getUserSignupYmd(userId),
    getDiagnosticoSimuladoCardState(userId),
  ]);

  if (!diagnostico.diagnostico_completed) {
    return {
      allowed: false,
      reason: 'diagnostico_pending',
      weeklyMissionsUsed,
      weeklyMissionsLimit: FREEMIUM_FREE_WEEKLY_MISSIONS,
    };
  }

  if (weeklyMissionsUsed >= FREEMIUM_FREE_WEEKLY_MISSIONS) {
    return {
      allowed: false,
      reason: 'upgrade_required',
      weeklyMissionsUsed,
      weeklyMissionsLimit: FREEMIUM_FREE_WEEKLY_MISSIONS,
    };
  }

  const todayYmd = toFreemiumTimezoneYmd();
  const unlockYmd = signupYmd
    ? addFreemiumDaysToYmd(signupYmd, FREEMIUM_WEEKLY_UNLOCK_DAYS)
    : todayYmd;
  const daysRemaining = freemiumYmdDiffDays(todayYmd, unlockYmd);

  if (daysRemaining > 0) {
    return {
      allowed: false,
      reason: 'waiting_period',
      unlockAt: unlockYmd,
      daysRemaining,
      weeklyMissionsUsed,
      weeklyMissionsLimit: FREEMIUM_FREE_WEEKLY_MISSIONS,
    };
  }

  return { allowed: true, tier: 'free' };
}

export async function assertCanStartWeeklyMission(
  userId: string,
  userEmail?: string | null,
  supabase?: SupabaseClient,
): Promise<WeeklyMissionEntitlement> {
  return getWeeklyMissionEntitlement(userId, userEmail, supabase);
}

/** Usado em cron/lote: só gera automaticamente para Pro ou admin. */
export async function isEligibleForAutomaticWeeklyGeneration(
  userId: string,
  userEmail?: string | null,
): Promise<boolean> {
  const entitlement = await getWeeklyMissionEntitlement(userId, userEmail);
  if (!entitlement.allowed) return false;
  return entitlement.tier === 'pro' || entitlement.tier === 'admin';
}

export function weeklyMissionBlockMessage(entitlement: Extract<WeeklyMissionEntitlement, { allowed: false }>): string {
  switch (entitlement.reason) {
    case 'diagnostico_pending':
      return 'Conclua seu simulado diagnóstico inicial para liberar a missão da semana.';
    case 'waiting_period':
      if (entitlement.daysRemaining === 1) {
        return 'Sua 2ª missão personalizada libera amanhã.';
      }
      if (entitlement.daysRemaining != null && entitlement.daysRemaining > 0) {
        return `Sua 2ª missão personalizada libera em ${entitlement.daysRemaining} dias.`;
      }
      return 'Sua missão semanal personalizada libera em breve.';
    case 'upgrade_required':
      return 'Você já usou sua missão semanal gratuita. Assine o Pro para continuar toda semana.';
    default:
      return 'Missão semanal indisponível no plano gratuito.';
  }
}

export function isWeeklySessionRow(
  filtros: Record<string, unknown> | null | undefined,
): boolean {
  return isWeeklySimuladoFiltros(filtros);
}
