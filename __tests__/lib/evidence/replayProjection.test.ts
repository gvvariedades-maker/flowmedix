import { replayAttemptEvents } from '@/lib/evidence/replayProjection';
import type { EvidenceAttemptEvent } from '@/lib/evidence/types';

function makeEvent(overrides: Partial<EvidenceAttemptEvent> = {}): EvidenceAttemptEvent {
  return {
    event_type: 'attempt',
    attempt_id: 'attempt-1',
    user_id: 'user-1',
    question_id: 'questao-1',
    question_version: 'a'.repeat(64),
    selected_alternative: 'A',
    correct: true,
    conviction: 'unknown',
    context: 'regular_practice',
    started_at: '2026-01-01T10:00:00.000Z',
    answered_at: '2026-01-01T10:00:05.000Z',
    response_time_ms: 5000,
    response_time_status: 'valid',
    response_time_invalid_reason: null,
    answer_change_count: 0,
    session_id: null,
    source: 'api_registrar_tentativa',
    is_internal: false,
    created_at: '2026-01-01T10:00:05.100Z',
    ...overrides,
  };
}

describe('replayAttemptEvents (Lote 9 — projeção somente em teste)', () => {
  it('agrega attempts, corretas e incorretas por question_id', () => {
    const events = [
      makeEvent({ attempt_id: 'a1', correct: true, answered_at: '2026-01-01T10:00:05.000Z' }),
      makeEvent({ attempt_id: 'a2', correct: false, answered_at: '2026-01-01T10:05:00.000Z' }),
      makeEvent({
        attempt_id: 'a3',
        question_id: 'questao-2',
        correct: true,
        answered_at: '2026-01-01T10:10:00.000Z',
      }),
    ];

    const projection = replayAttemptEvents(events);

    expect(projection.total_events).toBe(3);
    expect(projection.by_question['questao-1'].attempts).toBe(2);
    expect(projection.by_question['questao-1'].correct_count).toBe(1);
    expect(projection.by_question['questao-1'].incorrect_count).toBe(1);
    expect(projection.by_question['questao-2'].attempts).toBe(1);
  });

  it('usa o último evento por answered_at para last_correct/last_conviction', () => {
    const events = [
      makeEvent({
        attempt_id: 'a1',
        correct: false,
        conviction: 'chute',
        answered_at: '2026-01-01T10:00:00.000Z',
      }),
      makeEvent({
        attempt_id: 'a2',
        correct: true,
        conviction: 'certeza',
        answered_at: '2026-01-01T10:05:00.000Z',
      }),
    ];

    const projection = replayAttemptEvents(events);
    const summary = projection.by_question['questao-1'];

    expect(summary.last_correct).toBe(true);
    expect(summary.last_conviction).toBe('certeza');
    expect(summary.last_attempt_id).toBe('a2');
  });

  it('é determinístico independente da ordem de entrada', () => {
    const events = [
      makeEvent({ attempt_id: 'a1', answered_at: '2026-01-01T10:00:00.000Z', correct: true }),
      makeEvent({ attempt_id: 'a2', answered_at: '2026-01-01T10:05:00.000Z', correct: false }),
      makeEvent({ attempt_id: 'a3', answered_at: '2026-01-01T10:10:00.000Z', correct: true }),
    ];

    const forward = replayAttemptEvents(events);
    const reversed = replayAttemptEvents([...events].reverse());

    expect(reversed).toEqual(forward);
  });

  it('desempata por attempt_id quando answered_at é igual', () => {
    const sameTimestamp = '2026-01-01T10:00:00.000Z';
    const events = [
      makeEvent({ attempt_id: 'zzz', answered_at: sameTimestamp, correct: false }),
      makeEvent({ attempt_id: 'aaa', answered_at: sameTimestamp, correct: true }),
    ];

    const projection = replayAttemptEvents(events);
    // Ordenação estável por attempt_id: 'aaa' processado antes de 'zzz' →
    // último aplicado é 'zzz' (correct: false).
    expect(projection.by_question['questao-1'].last_attempt_id).toBe('zzz');
    expect(projection.by_question['questao-1'].last_correct).toBe(false);
  });

  it('lista vazia produz projeção vazia', () => {
    const projection = replayAttemptEvents([]);
    expect(projection.total_events).toBe(0);
    expect(projection.by_question).toEqual({});
  });
});
