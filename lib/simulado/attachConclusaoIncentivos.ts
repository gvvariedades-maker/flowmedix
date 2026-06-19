import type { SupabaseClient } from '@supabase/supabase-js';
import { loadConclusaoIncentivos } from '@/lib/simulado/loadConclusaoIncentivos';
import type { SimuladoSessionDetailResponse } from '@/lib/simulado/types';

/** Anexa incentivos motivacionais quando a sessão está concluída. */
export async function attachConclusaoIncentivos(
  supabase: SupabaseClient,
  userId: string,
  detail: SimuladoSessionDetailResponse,
): Promise<SimuladoSessionDetailResponse> {
  if (detail.session.status !== 'concluido') {
    return detail;
  }

  const incentivos = await loadConclusaoIncentivos(
    supabase,
    userId,
    detail.session.id,
    detail.questoes,
    detail.session.filtros,
  );

  return { ...detail, incentivos };
}
