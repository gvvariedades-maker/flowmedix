/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { DELETE, GET } from '@/app/api/metrics/route';

const mockGetAllMetrics = jest.fn();
const mockGetCacheMetrics = jest.fn();
const mockGetPerformanceStats = jest.fn();
const mockGetQueryMetrics = jest.fn();
const mockGetPerformanceMetrics = jest.fn();

jest.mock('@/lib/metrics', () => ({
  getAllMetrics: (...args: unknown[]) => mockGetAllMetrics(...args),
  getCacheMetrics: (...args: unknown[]) => mockGetCacheMetrics(...args),
  getPerformanceStats: (...args: unknown[]) => mockGetPerformanceStats(...args),
  getQueryMetrics: (...args: unknown[]) => mockGetQueryMetrics(...args),
  getPerformanceMetrics: (...args: unknown[]) => mockGetPerformanceMetrics(...args),
  resetMetrics: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GET /api/metrics', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      METRICS_SECRET: 'metrics-ci-secret',
    };
    mockGetAllMetrics.mockReturnValue({
      cache: {},
      performance: { avgTTFB: 0, p95TTFB: 0, totalRequests: 0 },
      queries: { totalQueries: 0, cachedQueries: 0, reduction: 0 },
      timestamp: Date.now(),
    });
    mockGetCacheMetrics.mockReturnValue({});
    mockGetPerformanceStats.mockReturnValue({ p95TTFB: 10, totalRequests: 1 });
    mockGetPerformanceMetrics.mockReturnValue([{ endpoint: '/api/vitrine', ttfb: 10 }]);
    mockGetQueryMetrics.mockReturnValue({ totalQueries: 1, cachedQueries: 1, reduction: 100 });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('retorna 401 sem bearer válido', async () => {
    const request = new NextRequest('https://avant.test/api/metrics');
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autorizado' });
  });

  it('retorna stats de performance quando type=performance', async () => {
    const request = new NextRequest('https://avant.test/api/metrics?type=performance&endpoint=/api/vitrine', {
      headers: { authorization: 'Bearer metrics-ci-secret' },
    });
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.stats).toEqual({ p95TTFB: 10, totalRequests: 1 });
    expect(Array.isArray(body.recent)).toBe(true);
    expect(mockGetPerformanceStats).toHaveBeenCalledWith('/api/vitrine');
  });

  it('retorna 403 no DELETE fora de development', async () => {
    const request = new NextRequest('https://avant.test/api/metrics');
    const response = await DELETE(request);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Não permitido em produção' });
  });
});
