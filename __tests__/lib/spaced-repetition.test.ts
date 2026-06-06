import type { HistoricoQuestao } from '@/lib/analytics';
import { groupHistoricoByModulo, simulateSm2FromAttempts } from '@/lib/spaced-repetition';

const base: Omit<HistoricoQuestao, 'id' | 'acertou' | 'created_at'> = {
  user_id: 'user-test',
  modulo_slug: 'mod-x',
  topico: 'Tópico',
  subtopico: null,
  banca: null,
};

/** Reproduz o bug: loop em ordem newest-first com índice i+1 como número da tentativa. */
function simulateSm2NewestFirstBug(attempts: HistoricoQuestao[]): number {
  const sorted = [...attempts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const window = sorted.slice(0, 10);

  let interval = 1;
  let easeFactor = 2.5;

  for (let i = 0; i < window.length; i++) {
    const attempt = window[i];
    const quality = attempt.acertou
      ? i === 0
        ? 5
        : i === 1
          ? 4
          : 3
      : 0;

    if (quality < 3) {
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      interval = 1;
    } else if (quality === 3) {
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      interval = Math.max(1, Math.floor(interval * 1.2));
    } else {
      easeFactor = Math.min(2.5, easeFactor + 0.1);
      const multiplier = quality === 4 ? 1.5 : 2.0;
      interval = Math.max(1, Math.floor(interval * multiplier * easeFactor));
    }
  }

  return interval;
}

describe('groupHistoricoByModulo', () => {
  it('agrupa todo o histórico sem depender de matrícula ativa', () => {
    const historico: HistoricoQuestao[] = [
      { ...base, id: '1', acertou: false, created_at: '2026-06-01T10:00:00Z' },
      { ...base, id: '2', modulo_slug: 'mod-y', acertou: true, created_at: '2026-06-02T10:00:00Z' },
      { ...base, id: '3', acertou: true, created_at: '2026-06-03T10:00:00Z' },
    ];

    const grouped = groupHistoricoByModulo(historico);

    expect(grouped.size).toBe(2);
    expect(grouped.get('mod-x')).toHaveLength(2);
    expect(grouped.get('mod-y')).toHaveLength(1);
  });
});

describe('simulateSm2FromAttempts', () => {
  it('após 3 erros e 2 acertos recentes, intervalo > 1 dia (ordem cronológica)', () => {
    const attempts: HistoricoQuestao[] = [
      { ...base, id: '1', acertou: false, created_at: '2026-01-01T10:00:00Z' },
      { ...base, id: '2', acertou: false, created_at: '2026-01-02T10:00:00Z' },
      { ...base, id: '3', acertou: false, created_at: '2026-01-03T10:00:00Z' },
      { ...base, id: '4', acertou: true, created_at: '2026-01-04T10:00:00Z' },
      { ...base, id: '5', acertou: true, created_at: '2026-01-05T10:00:00Z' },
    ];

    const { interval } = simulateSm2FromAttempts(attempts);

    expect(interval).toBeGreaterThan(1);
  });

  it('erro recente após acertos não infla intervalo (regressão ordem invertida)', () => {
    const attempts: HistoricoQuestao[] = [
      { ...base, id: '1', acertou: true, created_at: '2026-01-01T10:00:00Z' },
      { ...base, id: '2', acertou: true, created_at: '2026-01-02T10:00:00Z' },
      { ...base, id: '3', acertou: true, created_at: '2026-01-03T10:00:00Z' },
      { ...base, id: '4', acertou: true, created_at: '2026-01-04T10:00:00Z' },
      { ...base, id: '5', acertou: false, created_at: '2026-01-05T10:00:00Z' },
    ];

    expect(simulateSm2FromAttempts(attempts).interval).toBe(1);
    expect(simulateSm2NewestFirstBug(attempts)).toBeGreaterThan(1);
  });
});
