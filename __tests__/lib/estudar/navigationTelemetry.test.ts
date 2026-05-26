import {
  getEstudarNavSessionSnapshot,
  isEstudarNavTelemetryEnabled,
  recordNavigateCacheResult,
  recordPrefetchChain,
  recordPrefetchEnd,
  resetEstudarNavSession,
} from '@/lib/estudar/navigationTelemetry';

describe('navigationTelemetry', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetEstudarNavSession();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('habilitado em development por padrão', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_ESTUDAR_NAV_TELEMETRY;
    expect(isEstudarNavTelemetryEnabled()).toBe(true);
  });

  it('acumula hits e misses de navegação', () => {
    recordNavigateCacheResult('slug-a', true);
    recordNavigateCacheResult('slug-b', false);
    recordPrefetchEnd('slug-c', { ok: true, durationMs: 120, status: 200 });

    const snap = getEstudarNavSessionSnapshot();
    expect(snap.navigateHit).toBe(1);
    expect(snap.navigateMiss).toBe(1);
    expect(snap.prefetchOk).toBe(1);
    expect(snap.navigateHitRatePct).toBe(50);
  });

  it('recordPrefetchChain incrementa prefetchChainRuns no snapshot', () => {
    recordPrefetchChain('questao-a', {
      depth: 2,
      slugsPrefetched: ['questao-b', 'questao-c'],
      stoppedReason: 'depth',
    });
    recordPrefetchChain('questao-b', {
      depth: 2,
      slugsPrefetched: ['questao-c'],
      stoppedReason: 'no_proxima',
    });

    const snap = getEstudarNavSessionSnapshot();
    expect(snap.prefetchChainRuns).toBe(2);
  });

  it('cenário de validação manual: chain + dois navigate_hit → navigateHitRatePct 100', () => {
    recordPrefetchChain('questao-a', {
      depth: 2,
      slugsPrefetched: ['questao-b', 'questao-c'],
      stoppedReason: 'depth',
    });
    recordNavigateCacheResult('questao-b', true);
    recordNavigateCacheResult('questao-c', true);

    const snap = getEstudarNavSessionSnapshot();
    expect(snap.prefetchChainRuns).toBe(1);
    expect(snap.navigateHit).toBe(2);
    expect(snap.navigateMiss).toBe(0);
    expect(snap.navigateHitRatePct).toBe(100);
  });
});
