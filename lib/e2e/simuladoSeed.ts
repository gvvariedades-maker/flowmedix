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
    modo: 'treino' | 'prova';
    titulo: string;
    ritmo_meta_segundos_por_questao: number | null;
    prova_iniciada_em: string | null;
    total_questoes: number;
    filtros: Record<string, unknown>;
    created_at: string;
    concluida_em: string | null;
  };
  answered: boolean;
  opcao_id: string | null;
};

/**
 * O seed é escrito pelas rotas `/api/simulado/*` e lido pelo RSC de
 * `/simulados/[id]`. Bundlers de produção podem instanciar o módulo mais de uma
 * vez (um grafo por entry), então a âncora precisa ser o processo — não a
 * instância do módulo.
 */
type SimuladoSeedGlobal = typeof globalThis & {
  __avantE2eSimuladoStore__?: Map<string, SessionState>;
};

function getStore(): Map<string, SessionState> {
  const scope = globalThis as SimuladoSeedGlobal;
  if (!scope.__avantE2eSimuladoStore__) {
    scope.__avantE2eSimuladoStore__ = new Map<string, SessionState>();
  }
  return scope.__avantE2eSimuladoStore__;
}

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
    tempo_total_ms: state.answered ? 45000 : 0,
    tempo_medio_ms: state.answered ? 45000 : 0,
  };
}

function buildQuestoes(state: SessionState) {
  const meta = {
    banca: E2E_SIMULADO_LESSON.meta.banca,
    topico: E2E_SIMULADO_LESSON.meta.topico,
    subtopico: E2E_SIMULADO_LESSON.meta.subtopico ?? null,
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
      tempo_ms: 45000,
    },
  ];
}

export function resetE2eSimuladoStore() {
  getStore().clear();
}

export function createE2eSimuladoSession(
  quantidade: number,
  modo: 'treino' | 'prova' = 'treino',
  opts?: { titulo?: string; ritmo_meta_segundos_por_questao?: number | null },
) {
  const total = Math.min(Math.max(quantidade, 1), 1);
  const state: SessionState = {
    session: {
      id: E2E_SIMULADO_SESSION_ID,
      status: 'aberto',
      modo,
      titulo: opts?.titulo?.trim() ?? (modo === 'prova' ? 'Prova E2E' : ''),
      ritmo_meta_segundos_por_questao:
        modo === 'prova' ? (opts?.ritmo_meta_segundos_por_questao ?? 180) : null,
      prova_iniciada_em: null,
      total_questoes: total,
      filtros: { e2e: true, requested: quantidade, selected: total, modo },
      created_at: new Date().toISOString(),
      concluida_em: null,
    },
    answered: false,
    opcao_id: null,
  };
  getStore().set(E2E_SIMULADO_SESSION_ID, state);

  return {
    success: true as const,
    session: {
      id: state.session.id,
      total_questoes: state.session.total_questoes,
      status: state.session.status,
      modo: state.session.modo,
      titulo: state.session.titulo,
      ritmo_meta_segundos_por_questao: state.session.ritmo_meta_segundos_por_questao,
      prova_iniciada_em: state.session.prova_iniciada_em,
      created_at: state.session.created_at,
    },
    questoes: [{ modulo_slug: E2E_SIMULADO_SLUG, ordem: 1 }],
  };
}

export function getE2eSimuladoSession(sessionId: string) {
  const state = getStore().get(sessionId);
  if (!state) return null;

  return {
    session: state.session,
    resumo: buildSummary(state),
    questoes: buildQuestoes(state),
  };
}

export function iniciarE2eSimuladoProva(sessionId: string) {
  const state = getStore().get(sessionId);
  if (!state || state.session.modo !== 'prova' || state.session.status !== 'aberto') {
    return null;
  }

  if (!state.session.prova_iniciada_em) {
    state.session.prova_iniciada_em = new Date().toISOString();
  }

  return getE2eSimuladoSession(sessionId);
}

export function answerE2eSimuladoQuestion(
  sessionId: string,
  moduloSlug: string,
  opcaoId: string,
) {
  const state = getStore().get(sessionId);
  if (!state || moduloSlug !== E2E_SIMULADO_SLUG) return null;

  const acertou = opcaoId === 'A';
  state.answered = true;
  state.opcao_id = opcaoId;
  state.session.status = 'concluido';
  state.session.concluida_em = new Date().toISOString();

  const questoes = buildQuestoes(state);
  const questaoAtualizada = questoes[0];
  if (!questaoAtualizada || questaoAtualizada.respondida !== true) {
    return null;
  }

  return {
    success: true as const,
    acertou: state.session.modo === 'treino' ? acertou : null,
    opcao_correta_id: state.session.modo === 'treino' ? 'A' : null,
    session_status: 'concluido' as const,
    questao_atualizada: questaoAtualizada,
    resumo: buildSummary(state),
  };
}

export function finalizeE2eSimuladoSession(sessionId: string) {
  const state = getStore().get(sessionId);
  if (!state) return null;

  state.session.status = 'concluido';
  state.session.concluida_em = new Date().toISOString();

  return getE2eSimuladoSession(sessionId);
}

export function getE2eSimuladoLessonPayload() {
  return { dados: E2E_SIMULADO_LESSON };
}
