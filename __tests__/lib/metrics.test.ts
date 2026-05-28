import {
  getPerformanceMetrics,
  recordPerformance,
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
});
