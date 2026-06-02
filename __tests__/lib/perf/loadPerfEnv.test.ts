import {
  assertPerfTargetConfigured,
  normalizePerfBaseUrl,
  parsePerfTarget,
  resolvePerfBaseUrl,
} from '@/lib/perf/loadPerfEnv';

describe('loadPerfEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('parsePerfTarget lê --target=staging', () => {
    expect(parsePerfTarget(['--target=staging'])).toBe('staging');
    expect(parsePerfTarget([])).toBe('local');
  });

  it('normalizePerfBaseUrl remove barra final', () => {
    expect(normalizePerfBaseUrl('https://preview.vercel.app/')).toBe('https://preview.vercel.app');
  });

  it('assertPerfTargetConfigured rejeita localhost em staging', () => {
    expect(() => assertPerfTargetConfigured('staging', 'http://127.0.0.1:3000')).toThrow(
      /localhost/i,
    );
  });

  it('resolvePerfBaseUrl prioriza PERF_BASE_URL', () => {
    process.env.PERF_BASE_URL = 'https://a.vercel.app';
    process.env.NEXT_PUBLIC_APP_URL = 'https://b.vercel.app';
    expect(resolvePerfBaseUrl()).toEqual({
      baseUrl: 'https://a.vercel.app',
      source: 'PERF_BASE_URL',
    });
  });
});
