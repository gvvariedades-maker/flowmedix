import { redirect } from 'next/navigation';
import { WeeklyMissionHubClient } from '@/components/simulados/WeeklyMissionHubClient';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { getIsoWeekInfo, WEEKLY_SIMULADO_DEFAULT_QUANTIDADE } from '@/lib/simulado/weeklySimulado';
import { loadWeeklyMissionHubData, type WeeklyMissionHubData } from '@/lib/simulado/weeklyMissionHub';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';

function e2eHubData(): WeeklyMissionHubData {
  const week = getIsoWeekInfo();
  return {
    mission: {
      iso_year: week.isoYear,
      iso_week: week.isoWeek,
      week_ends_at: week.weekEndsAt.toISOString(),
      foco_principal: 'Urgências e Emergências',
      status: 'pendente' as const,
      titulo: `Simulado da Semana #${week.isoWeek} - Urgências e Emergências`,
      session_id: null,
      total_questoes: WEEKLY_SIMULADO_DEFAULT_QUANTIDADE,
      respondidas: 0,
      percentual_acerto: null,
    },
    history: [],
    semanas_consecutivas: 0,
    weekly_evolution: null,
    entitlement: { allowed: true as const, tier: 'pro' as const },
  };
}

function MissionLoadError() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background p-6">
      <p className="text-sm text-slate-600">Erro ao carregar missão da semana. Tente novamente.</p>
    </div>
  );
}

function MissionUnavailable() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background p-6">
      <p className="text-sm text-slate-600">
        Não foi possível carregar a missão da semana. Tente novamente.
      </p>
    </div>
  );
}

export default async function MissaoSemanalPage() {
  const e2eBypass = isE2eBypassEnabled('E2E_DASHBOARD_BYPASS');

  if (e2eBypass) {
    return <WeeklyMissionHubClient initialData={e2eHubData()} />;
  }

  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  let hub: WeeklyMissionHubData | null = null;
  let loadFailed = false;

  try {
    const supabase = await createSupabaseServerClient();
    hub = await loadWeeklyMissionHubData(supabase, session.user.id, session.user.email);
  } catch (error) {
    logger.error('Failed to load weekly mission hub', error);
    loadFailed = true;
  }

  if (loadFailed) {
    return <MissionLoadError />;
  }

  if (!hub) {
    return <MissionUnavailable />;
  }

  return <WeeklyMissionHubClient initialData={hub} />;
}
