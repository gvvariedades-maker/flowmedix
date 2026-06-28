import { unstable_cache } from 'next/cache';
import { CACHE_CONFIG } from '@/lib/cache';
import {
  getDiagnosticoSimuladoCardState,
  type DiagnosticoSimuladoCardState,
} from '@/lib/simulado/diagnosticoStatus';

/** Cache USER 2 min para o card na vitrine `/estudar`. */
export async function getDiagnosticoSimuladoCardStateCached(
  userId: string,
): Promise<DiagnosticoSimuladoCardState> {
  if (!userId) {
    return {
      show_card: false,
      onboarding_completed: false,
      diagnostico_completed: false,
      has_open_session: false,
      session: null,
    };
  }

  return unstable_cache(
    () => getDiagnosticoSimuladoCardState(userId),
    [`diagnostico-card-${userId}`],
    {
      revalidate: CACHE_CONFIG.USER.revalidate,
      tags: [...CACHE_CONFIG.USER.tags, 'simulado', `user-${userId}`],
    },
  )();
}
