import { NextRequest, NextResponse } from 'next/server';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { getIsoWeekInfo, getWeeklySimuladoMission } from '@/lib/simulado/weeklySimulado';
import type { WeeklySimuladoMission } from '@/lib/simulado/types';

function e2eWeeklyMission(): WeeklySimuladoMission {
  const week = getIsoWeekInfo();
  return {
    iso_year: week.isoYear,
    iso_week: week.isoWeek,
    week_ends_at: week.weekEndsAt.toISOString(),
    foco_principal: 'Urgências e Emergências',
    status: 'pendente',
    titulo: `Simulado da Semana #${week.isoWeek} - Urgências e Emergências`,
    session_id: null,
    total_questoes: 20,
    respondidas: 0,
    percentual_acerto: null,
  };
}

export async function GET(request: NextRequest) {
  try {
    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      return NextResponse.json({ mission: e2eWeeklyMission(), generated: false });
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const autoGenerate = request.nextUrl.searchParams.get('auto_generate') !== 'false';

    const result = await getWeeklySimuladoMission({
      userId: auth.user.id,
      autoGenerate,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Não foi possível carregar o simulado da semana' },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Erro inesperado em GET /api/simulado/weekly/current', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
