import {
  E2E_SIMULADO_LESSON,
  E2E_SIMULADO_SESSION_ID,
  E2E_SIMULADO_SLUG,
} from '@/lib/e2e/constants';

type SessionStatus = 'aberto' | 'concluido';

type SessionState = {
  session: {
    id: string;
    status: SessionStatus;
    total_questoes: number;
    filtros: Record<string, unknown>;
    created_at: string;
    concluida_em: string | null;
  };
  answered: boolean;
  opcao_id: string | null;
};

const store = new Map<string, SessionState>();

function buildSummary(state: SessionState) {
  const respondidas = state.answered ? 1 : 0;
  const pendentes = state.session.total_questoes - respondidas;
  const acertos = state.answered ? 1 : 0;
  return {
    respondidas,
    pendentes,
    acertos,
    erros: 0,
    percentual_acerto: respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0,
  };
}

function buildQuestoes(state: SessionState) {
  const meta = {
    banca: E2E_SIMULADO_LESSON.meta.banca,
    topico: E2E_SIMULADO_LESSON.meta.topico,
    subtopico: E2E_SIMULADO_LESSON.meta.subtopico,
  };

  if (!state.answered) {
    return [
      {
        ordem: 1,
        modulo_slug: E2E_SIMULADO_SLUG,
        respondida: false as const,
        meta,
      },
    ];
  }

  return [
    {
      ordem: 1,
      modulo_slug: E2E_SIMULADO_SLUG,
      respondida: true as const,
      meta,
      acertou: true,
      opcao_id: state.opcao_id,
      opcao_correta_id: 'A',
      respondida_em: new Date().toISOString(),
    },
  ];
}

export function resetE2eSimuladoStore() {
  store.clear();
}

export function createE2eSimuladoSession(quantidade: number) {
  const total = Math.min(Math.max(quantidade, 1), 1);
  const state: SessionState = {
    session: {
      id: E2E_SIMULADO_SESSION_ID,
      status: 'aberto',
      total_questoes: total,
      filtros: { e2e: true, requested: quantidade, selected: total },
      created_at: new Date().toISOString(),
      concluida_em: null,
    },
    answered: false,
    opcao_id: null,
  };
  store.set(E2E_SIMULADO_SESSION_ID, state);

  return {
    success: true as const,
    session: {
      id: state.session.id,
      total_questoes: state.session.total_questoes,
      status: state.session.status,
      created_at: state.session.created_at,
    },
    questoes: [{ modulo_slug: E2E_SIMULADO_SLUG, ordem: 1 }],
  };
}

export function getE2eSimuladoSession(sessionId: string) {
  const state = store.get(sessionId);
  if (!state) return null;

  return {
    session: state.session,
    resumo: buildSummary(state),
    questoes: buildQuestoes(state),
  };
}

export function answerE2eSimuladoQuestion(
  sessionId: string,
  moduloSlug: string,
  opcaoId: string,
) {
  const state = store.get(sessionId);
  if (!state || moduloSlug !== E2E_SIMULADO_SLUG) return null;

  const acertou = opcaoId === 'A';
  state.answered = true;
  state.opcao_id = opcaoId;
  state.session.status = 'concluido';
  state.session.concluida_em = new Date().toISOString();

  return {
    success: true as const,
    acertou,
    opcao_correta_id: 'A',
    session_status: 'concluido' as const,
  };
}

export function getE2eSimuladoLessonPayload() {
  return { dados: E2E_SIMULADO_LESSON };
}
