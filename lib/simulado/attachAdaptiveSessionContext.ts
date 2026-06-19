import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveSimuladoSessionKind } from '@/lib/simulado/sessionKind';
import type { SimuladoSessionDetailResponse } from '@/lib/simulado/types';
import { loadWeeklyMissionEvolution } from '@/lib/simulado/weeklyEvolution';

/** Anexa contexto exclusivo de sessões adaptativas (evolução semanal, etc.). */
export async function attachAdaptiveSessionContext(
  supabase: SupabaseClient,
  userId: string,
  detail: SimuladoSessionDetailResponse,
): Promise<SimuladoSessionDetailResponse> {
  if (detail.session.status !== 'concluido') {
    return detail;
  }

  const kind = resolveSimuladoSessionKind(detail.session.filtros);
  if (kind !== 'weekly') {
    return detail;
  }

  const filtros = detail.session.filtros;
  const isoYear = Number(filtros.iso_year);
  const isoWeek = Number(filtros.iso_week);

  if (!Number.isFinite(isoYear) || !Number.isFinite(isoWeek)) {
    return detail;
  }

  const weekly_evolution = await loadWeeklyMissionEvolution(
    supabase,
    userId,
    isoYear,
    isoWeek,
    detail.resumo.percentual_acerto,
    detail.questoes,
  );

  return { ...detail, weekly_evolution };
}
