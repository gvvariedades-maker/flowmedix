import { buildWeeklyOrdinalMap } from '@/lib/simulado/weeklyOrdinal';

describe('buildWeeklyOrdinalMap', () => {
  it('numera apenas sessões com origem weekly por created_at', () => {
    const map = buildWeeklyOrdinalMap([
      {
        id: 'b',
        created_at: '2026-06-10T10:00:00.000Z',
        filtros: { origem: 'weekly' },
      },
      {
        id: 'a',
        created_at: '2026-06-01T10:00:00.000Z',
        filtros: { origem: 'weekly' },
      },
      {
        id: 'c',
        created_at: '2026-06-15T10:00:00.000Z',
        filtros: { modo: 'prova' },
      },
      {
        id: 'd',
        created_at: '2026-06-20T10:00:00.000Z',
        filtros: { origem: 'weekly' },
      },
    ]);

    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(2);
    expect(map.get('d')).toBe(3);
    expect(map.has('c')).toBe(false);
  });

  it('inclui canceladas na numeração', () => {
    const map = buildWeeklyOrdinalMap([
      {
        id: 'x',
        created_at: '2026-06-01T10:00:00.000Z',
        filtros: { origem: 'weekly' },
      },
      {
        id: 'y',
        created_at: '2026-06-08T10:00:00.000Z',
        filtros: { origem: 'weekly' },
      },
    ]);

    expect(map.size).toBe(2);
    expect(map.get('y')).toBe(2);
  });
});
