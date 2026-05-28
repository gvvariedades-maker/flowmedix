import type {
  SimuladoAnswerResponse,
  SimuladoQuestaoItem,
  SimuladoSessionDetailResponse,
} from '@/lib/simulado/types';

/**
 * Aplica resposta incremental do POST /api/simulado/responder sem refetch da sessão.
 */
export function applyAnswerPatch(
  session: SimuladoSessionDetailResponse,
  patch: Pick<SimuladoAnswerResponse, 'questao_atualizada' | 'resumo' | 'session_status'>,
): SimuladoSessionDetailResponse {
  const questoes: SimuladoQuestaoItem[] = session.questoes.map((q) =>
    q.modulo_slug === patch.questao_atualizada.modulo_slug ? patch.questao_atualizada : q,
  );

  const becameConcluido =
    patch.session_status === 'concluido' && session.session.status !== 'concluido';

  return {
    session: {
      ...session.session,
      status: patch.session_status,
      concluida_em:
        becameConcluido && !session.session.concluida_em
          ? new Date().toISOString()
          : session.session.concluida_em,
    },
    resumo: patch.resumo,
    questoes,
  };
}
