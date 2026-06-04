import {
  addFreemiumDaysToYmd,
  freemiumYmdDiffDays,
  toFreemiumTimezoneYmd,
} from '@/lib/freemium/constants';

describe('freemium YMD helpers (plano diário)', () => {
  it('addFreemiumDaysToYmd soma dias civis em Brasília', () => {
    expect(addFreemiumDaysToYmd('2026-06-04', 1)).toBe('2026-06-05');
    expect(addFreemiumDaysToYmd('2026-06-04', 3)).toBe('2026-06-07');
  });

  it('freemiumYmdDiffDays mede atraso entre revisão e hoje', () => {
    expect(freemiumYmdDiffDays('2026-06-01', '2026-06-04')).toBe(3);
    expect(freemiumYmdDiffDays('2026-06-04', '2026-06-04')).toBe(0);
  });

  it('toFreemiumTimezoneYmd usa UTC−3', () => {
    // 2026-06-04 02:00 UTC = 2026-06-03 23:00 em Brasília
    const instant = new Date('2026-06-04T02:00:00.000Z');
    expect(toFreemiumTimezoneYmd(instant)).toBe('2026-06-03');
  });
});
