/**
 * Reducer determinístico de PROJEÇÃO EM TESTE — Evidence Engine Fase 1 (Lote 9).
 *
 * PROIBIDO importar este módulo em `app/` ou `components/` de produção
 * (ADR §27 item 9; spec §1.11, §2, §14 do plano). Existe **apenas** para
 * reproduzir, em CI/testes/ferramentas offline, como um futuro consumidor
 * de domínio leria o event stream — sem ativar `learner_skill_state`,
 * `misconceptions` ou qualquer projeção pedagógica no produto.
 *
 * `npm run check:architecture` deve permanecer o gate de referência; se um
 * import deste arquivo aparecer em `app/`/`components/`, é regressão.
 */

import type { EvidenceAttemptEvent } from '@/lib/evidence/types';

export type ReplayQuestionSummary = {
  question_id: string;
  attempts: number;
  correct_count: number;
  incorrect_count: number;
  last_correct: boolean | null;
  last_conviction: EvidenceAttemptEvent['conviction'] | null;
  last_attempt_id: string | null;
  last_answered_at: string | null;
};

export type ReplayProjection = {
  by_question: Record<string, ReplayQuestionSummary>;
  total_events: number;
};

function emptySummary(question_id: string): ReplayQuestionSummary {
  return {
    question_id,
    attempts: 0,
    correct_count: 0,
    incorrect_count: 0,
    last_correct: null,
    last_conviction: null,
    last_attempt_id: null,
    last_answered_at: null,
  };
}

/**
 * Reduz eventos `attempt` em uma projeção por `question_id`.
 * Puro e determinístico — mesma entrada produz a mesma saída, independente
 * da ordem de entrada (reordena internamente por `answered_at`; empate por
 * `attempt_id` para desempate estável).
 */
export function replayAttemptEvents(
  events: readonly EvidenceAttemptEvent[],
): ReplayProjection {
  const sorted = [...events].sort((a, b) => {
    const diff = new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime();
    if (diff !== 0) return diff;
    return a.attempt_id.localeCompare(b.attempt_id);
  });

  const by_question: Record<string, ReplayQuestionSummary> = {};

  for (const event of sorted) {
    const summary = by_question[event.question_id] ?? emptySummary(event.question_id);
    summary.attempts += 1;
    if (event.correct) {
      summary.correct_count += 1;
    } else {
      summary.incorrect_count += 1;
    }
    summary.last_correct = event.correct;
    summary.last_conviction = event.conviction;
    summary.last_attempt_id = event.attempt_id;
    summary.last_answered_at = event.answered_at;
    by_question[event.question_id] = summary;
  }

  return { by_question, total_events: sorted.length };
}
