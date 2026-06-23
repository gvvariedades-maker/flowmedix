import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveSimuladoSessionKind } from '@/lib/simulado/sessionKind';
import type { SimuladoSessionDetailResponse } from '@/lib/simulado/types';
import { getWeeklyOrdinalFromMap, loadWeeklySessionOrdinals } from '@/lib/simulado/weeklyOrdinal';

/** Anexa `weekly_ordinal` para exibição aluno em sessões semanais. */
export async function attachWeeklySessionDisplay(
  supabase: SupabaseClient,
  userId: string,
  detail: SimuladoSessionDetailResponse,
): Promise<SimuladoSessionDetailResponse> {
  if (resolveSimuladoSessionKind(detail.session.filtros) !== 'weekly') {
    return detail;
  }

  const ordinals = await loadWeeklySessionOrdinals(supabase, userId);
  const weekly_ordinal = getWeeklyOrdinalFromMap(ordinals, detail.session.id);

  return { ...detail, weekly_ordinal };
}
