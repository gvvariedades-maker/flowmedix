import {
  aggregateAttemptSeries,
  emptyAttemptSeries,
} from '@/lib/desempenho/attemptSeries';
import type { AttemptSeriesEventRow } from '@/lib/desempenho/types';

function evt(
  partial: Partial<AttemptSeriesEventRow> &
    Pick<AttemptSeriesEventRow, 'attempt_id' | 'question_id' | 'correct' | 'created_at'>,
): AttemptSeriesEventRow {
  return {
    response_time_ms: null,
    response_time_status: 'unknown',
    context: 'regular_practice',
    ...partial,
  };
}

describe('emptyAttemptSeries', () => {
  it('marca available=false para flag_off', () => {
    const empty = emptyAttemptSeries('flag_off');
    expect(empty.available).toBe(false);
    expect(empty.unavailableReason).toBe('flag_off');
    expect(empty.daily).toEqual([]);
  });
});

describe('aggregateAttemptSeries', () => {
  const now = new Date('2026-08-11T15:00:00.000Z');

  it('filtra só regular_practice e calcula série diária + tempo + 1ª tentativa', () => {
    const events: AttemptSeriesEventRow[] = [
      evt({
        attempt_id: 'a1',
        question_id: 'q1',
        correct: true,
        created_at: '2026-08-10T10:00:00.000Z',
        response_time_ms: 4000,
        response_time_status: 'valid',
      }),
      evt({
        attempt_id: 'a2',
        question_id: 'q1',
        correct: false,
        created_at: '2026-08-10T12:00:00.000Z',
        response_time_ms: 2000,
        response_time_status: 'valid',
      }),
      evt({
        attempt_id: 'a3',
        question_id: 'q2',
        correct: false,
        created_at: '2026-08-11T09:00:00.000Z',
        response_time_ms: 99999,
        response_time_status: 'invalid',
      }),
      evt({
        attempt_id: 'a4',
        question_id: 'q3',
        correct: true,
        created_at: '2026-08-11T11:00:00.000Z',
        response_time_ms: 6000,
        response_time_status: 'valid',
        context: 'simulation',
      }),
    ];

    const series = aggregateAttemptSeries(events, { periodo: '7d', now });

    expect(series.available).toBe(true);
    expect(series.unavailableReason).toBeNull();
    expect(series.totalEvents).toBe(3);
    expect(series.distinctQuestions).toBe(2);
    expect(series.firstAttemptAccuracyPct).toBe(50); // q1 true, q2 false
    expect(series.attemptsPerQuestionAvg).toBe(1.5);
    expect(series.tempoMedioMs).toBe(3000); // (4000+2000)/2 — invalid ignorado
    expect(series.dadosDesde).toBe('2026-08-10T10:00:00.000Z');

    const activeDays = series.daily.filter((d) => d.attempts > 0);
    expect(activeDays).toHaveLength(2);
    expect(activeDays[0]!.percentual).toBe(50); // 1/2 no dia 10
    expect(activeDays[1]!.percentual).toBe(0); // 0/1 no dia 11
  });

  it('marca cobertura parcial quando histórico predates o ledger', () => {
    const events = [
      evt({
        attempt_id: 'a1',
        question_id: 'q1',
        correct: true,
        created_at: '2026-08-10T10:00:00.000Z',
        response_time_ms: 1000,
        response_time_status: 'valid',
      }),
    ];

    const series = aggregateAttemptSeries(events, {
      periodo: 'all',
      now,
      historicoOldestAt: '2026-07-01T00:00:00.000Z',
      historicoRespondidas: 20,
    });

    expect(series.coberturaParcial).toBe(true);
  });

  it('usa dia civil de Brasília na série (não UTC)', () => {
    const events = [
      // 11/08 22:00 em Brasília
      evt({
        attempt_id: 'a1',
        question_id: 'q1',
        correct: true,
        created_at: '2026-08-12T01:00:00.000Z',
      }),
    ];

    const series = aggregateAttemptSeries(events, { periodo: '7d', now });
    const ativos = series.daily.filter((d) => d.attempts > 0);

    expect(series.daily).toHaveLength(7);
    expect(ativos).toHaveLength(1);
    expect(ativos[0]!.date).toBe('2026-08-11');
  });

  it('exclui evento futuro (intervalo semiaberto)', () => {
    const series = aggregateAttemptSeries(
      [
        evt({
          attempt_id: 'a1',
          question_id: 'q1',
          correct: true,
          created_at: '2026-08-13T12:00:00.000Z',
        }),
      ],
      { periodo: '7d', now },
    );

    expect(series.unavailableReason).toBe('empty');
    expect(series.totalEvents).toBe(0);
  });

  it('propaga truncamento como cobertura parcial e limite explícito', () => {
    const events = [
      evt({
        attempt_id: 'a1',
        question_id: 'q1',
        correct: true,
        created_at: '2026-08-10T10:00:00.000Z',
      }),
    ];

    const series = aggregateAttemptSeries(events, {
      periodo: '7d',
      now,
      truncated: true,
      limiteRegistros: 5000,
    });

    expect(series.truncated).toBe(true);
    expect(series.limiteRegistros).toBe(5000);
    expect(series.coberturaParcial).toBe(true);
  });

  it('mantém truncamento visível mesmo sem eventos no período', () => {
    const series = aggregateAttemptSeries([], {
      periodo: '7d',
      now,
      truncated: true,
      limiteRegistros: 5000,
    });

    expect(series.unavailableReason).toBe('empty');
    expect(series.truncated).toBe(true);
    expect(series.limiteRegistros).toBe(5000);
  });

  it('retorna available com empty quando não há eventos no período', () => {
    const series = aggregateAttemptSeries(
      [
        evt({
          attempt_id: 'a1',
          question_id: 'q1',
          correct: true,
          created_at: '2025-01-01T00:00:00.000Z',
        }),
      ],
      { periodo: '7d', now },
    );

    expect(series.available).toBe(true);
    expect(series.unavailableReason).toBe('empty');
    expect(series.totalEvents).toBe(0);
  });
});
