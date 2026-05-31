import {
  getPerformanceMetrics,
  getVitrineStrategyStats,
  recordPerformance,
  recordVitrineStrategy,
  resetMetrics,
} from '@/lib/metrics';

describe('lib/metrics', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('armazena dimensão context em recordPerformance', () => {
    recordPerformance('/api/simulado/questao', 'GET', 12, true, 'simulado');
    recordPerformance('/api/estudar/questao', 'GET', 20, false);

    const simuladoOnly = getPerformanceMetrics(undefined, 100, 'simulado');
    expect(simuladoOnly).toHaveLength(1);
    expect(simuladoOnly[0]?.context).toBe('simulado');
    expect(simuladoOnly[0]?.endpoint).toBe('/api/simulado/questao');
  });

  it('agrega contadores vitrine_strategy rpc e js', () => {
    recordVitrineStrategy('rpc', 120);
    recordVitrineStrategy('rpc', 80);
    recordVitrineStrategy('js', 400);

    const stats = getVitrineStrategyStats();
    expect(stats.totalRequests).toBe(3);
    expect(stats.rpc.count).toBe(2);
    expect(stats.js.count).toBe(1);
    expect(stats.rpc.sharePercent).toBeCloseTo(66.67, 1);
  });
});
