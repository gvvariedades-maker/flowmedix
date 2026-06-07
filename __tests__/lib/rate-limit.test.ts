/**
 * @jest-environment node
 */
import {
  distributedRateLimit,
  distributedRateLimitWithInfo,
  getClientIp,
  rateLimit,
} from '@/lib/rate-limit';

function makeRequest(ip = '203.0.113.10'): Request {
  return new Request('https://avant.test/api/test', {
    headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` },
  });
}

describe('getClientIp', () => {
  it('extrai o primeiro IP de x-forwarded-for', () => {
    expect(getClientIp(makeRequest('203.0.113.10'))).toBe('203.0.113.10');
  });

  it('usa 127.0.0.1 quando header ausente', () => {
    const req = new Request('https://avant.test/api/test');
    expect(getClientIp(req)).toBe('127.0.0.1');
  });
});

describe('rateLimit (in-memory)', () => {
  it('bloqueia após exceder o limite', () => {
    const key = `unit-${Date.now()}`;
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });
});

describe('distributedRateLimit (fallback in-memory)', () => {
  const originalUpstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalUpstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const originalKvUrl = process.env.KV_REST_API_URL;
  const originalKvToken = process.env.KV_REST_API_TOKEN;

  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    jest.resetModules();
  });

  afterEach(() => {
    if (originalUpstashUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = originalUpstashUrl;
    if (originalUpstashToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = originalUpstashToken;
    if (originalKvUrl === undefined) delete process.env.KV_REST_API_URL;
    else process.env.KV_REST_API_URL = originalKvUrl;
    if (originalKvToken === undefined) delete process.env.KV_REST_API_TOKEN;
    else process.env.KV_REST_API_TOKEN = originalKvToken;
    jest.resetModules();
  });

  it('respeita limite por IP quando Upstash não está configurado', async () => {
    const { distributedRateLimit: limit } = await import('@/lib/rate-limit');
    const req = makeRequest(`rate-${Date.now()}`);

    expect(await limit(req, { key: 'criar-sessao', limit: 2, windowMs: 60_000 })).toBe(true);
    expect(await limit(req, { key: 'criar-sessao', limit: 2, windowMs: 60_000 })).toBe(true);
    expect(await limit(req, { key: 'criar-sessao', limit: 2, windowMs: 60_000 })).toBe(false);
  });
});

describe('distributedRateLimitWithInfo (fallback in-memory)', () => {
  it('retorna remaining e resetAt', async () => {
    const req = makeRequest(`info-${Date.now()}`);
    const first = await distributedRateLimitWithInfo(req, {
      key: 'reportar-erro',
      limit: 2,
      windowMs: 60_000,
      identifier: 'user-1:203.0.113.1',
    });

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);

    const second = await distributedRateLimitWithInfo(req, {
      key: 'reportar-erro',
      limit: 2,
      windowMs: 60_000,
      identifier: 'user-1:203.0.113.1',
    });
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);

    const third = await distributedRateLimitWithInfo(req, {
      key: 'reportar-erro',
      limit: 2,
      windowMs: 60_000,
      identifier: 'user-1:203.0.113.1',
    });
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
    expect(third.resetAt).toBeGreaterThan(Date.now() - 1000);
  });
});
