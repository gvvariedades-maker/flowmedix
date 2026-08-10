import { computeActivityTrend } from '@/components/dashboard/performance/activity-sparkline';

describe('computeActivityTrend', () => {
  it('marca em alta quando a 2ª metade cresce ≥10%', () => {
    expect(computeActivityTrend([1, 1, 1, 1, 5, 5, 5, 5])).toEqual({
      trend: 'up',
      deltaPct: 400,
    });
  });

  it('marca em queda quando a 2ª metade cai ≥10%', () => {
    expect(computeActivityTrend([8, 8, 8, 8, 2, 2, 2, 2])).toEqual({
      trend: 'down',
      deltaPct: -75,
    });
  });

  it('marca estável com variação pequena', () => {
    expect(computeActivityTrend([5, 5, 5, 5, 5, 5, 5, 5])).toEqual({
      trend: 'flat',
      deltaPct: 0,
    });
  });

  it('retorna flat com série curta ou zerada', () => {
    expect(computeActivityTrend([1, 2, 3])).toEqual({ trend: 'flat', deltaPct: null });
    expect(computeActivityTrend([0, 0, 0, 0])).toEqual({ trend: 'flat', deltaPct: null });
  });
});
