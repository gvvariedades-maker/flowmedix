/**
 * @jest-environment node
 */
import * as Sentry from '@sentry/nextjs';
import {
  distributedRateLimit,
  distributedRateLimitWithInfo,
  _resetUpstashErrorCooldownForTesting,
} from '@/lib/rate-limit';

// Mock @sentry/nextjs
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock @upstash/ratelimit
const mockLimit = jest.fn();
jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    jest.fn().mockImplementation(() => ({
      limit: mockLimit,
    })),
    {
      slidingWindow: jest.fn(),
    },
  ),
}));

// Mock @upstash/redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({})),
}));

describe('Rate Limit Redis / Upstash Observability & Fallback', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    _resetUpstashErrorCooldownForTesting();
    process.env = {
      ...originalEnv,
      UPSTASH_REDIS_REST_URL: 'https://test-upstash.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function makeMockRequest(ip = '127.0.0.1'): Request {
    return {
      headers: {
        get: (header: string) => {
          if (header.toLowerCase() === 'x-forwarded-for') return ip;
          return null;
        },
      },
    } as unknown as Request;
  }

  it('retorna resultado normal quando Upstash Redis responde com sucesso (sem Sentry)', async () => {
    mockLimit.mockResolvedValueOnce({ success: true, remaining: 9, reset: Date.now() + 10000 });

    const allowed = await distributedRateLimit(makeMockRequest(), {
      key: 'test_endpoint',
      limit: 10,
      windowMs: 10000,
    });

    expect(allowed).toBe(true);
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it('captura falha de rede/fetch do Upstash, preserva Error original, despacha exatamente 1 evento ao Sentry e executa fallback in-memory', async () => {
    const networkError = new Error('fetch failed: connection timeout to upstash.io');
    mockLimit.mockRejectedValueOnce(networkError);

    const allowed = await distributedRateLimit(makeMockRequest('192.168.1.100'), {
      key: 'checkout_create',
      limit: 5,
      windowMs: 10000,
    });

    expect(allowed).toBe(true); // Fallback in-memory permite a requisição inicial
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      networkError,
      expect.objectContaining({
        tags: expect.objectContaining({
          origin: 'logger',
          component: 'rate-limit',
          dependency: 'upstash',
          operation: 'limit',
          degraded: 'true',
          endpoint: 'checkout_create',
        }),
        fingerprint: ['rate-limit', 'upstash', 'limit', 'checkout_create'],
        extra: expect.objectContaining({
          endpoint: 'checkout_create',
          logMessage: expect.stringContaining('Falha na comunicação com Upstash Redis rate limiter (limit)'),
        }),
      }),
    );
  });

  it('distributedRateLimitWithInfo captura falha do Upstash, reporta ao Sentry e entrega fallback com info', async () => {
    const serviceError = new Error('Upstash 503 Service Unavailable');
    mockLimit.mockRejectedValueOnce(serviceError);

    const result = await distributedRateLimitWithInfo(makeMockRequest('192.168.1.101'), {
      key: 'payment_intent',
      limit: 10,
      windowMs: 10000,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.resetAt).toBeGreaterThan(Date.now() - 1000);
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      serviceError,
      expect.objectContaining({
        tags: expect.objectContaining({
          component: 'rate-limit',
          dependency: 'upstash',
          degraded: 'true',
          endpoint: 'payment_intent',
        }),
        fingerprint: ['rate-limit', 'upstash', 'limit', 'payment_intent'],
      }),
    );
  });

  it('não vaza identifier sensível (IP bruto, e-mail, user_id) para tags, extra ou mensagem do Sentry', async () => {
    const sensitiveIdentifier = 'user_victim_999@test.com:203.0.113.195';
    mockLimit.mockRejectedValueOnce(new Error('Upstash connection reset'));

    await distributedRateLimit(makeMockRequest('203.0.113.195'), {
      key: 'auth_sensitive_route',
      limit: 5,
      windowMs: 10000,
      identifier: sensitiveIdentifier,
    });

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    const sentryCallArgs = (Sentry.captureException as jest.Mock).mock.calls[0];
    const sentryPayloadStr = JSON.stringify(sentryCallArgs[1]);

    expect(sentryPayloadStr).not.toContain('user_victim_999@test.com');
    expect(sentryPayloadStr).not.toContain('203.0.113.195');
    expect(sentryPayloadStr).not.toContain(sensitiveIdentifier);
  });

  it('sanitiza segredos artificiais presentes na mensagem de erro do Upstash', async () => {
    const errorWithSecrets = new Error(
      'Upstash failed: url=https://my-db.upstash.io?token=SUPER_SECRET_TOKEN_XYZ Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeak',
    );
    mockLimit.mockRejectedValueOnce(errorWithSecrets);

    await distributedRateLimit(makeMockRequest(), {
      key: 'api_query',
      limit: 5,
      windowMs: 10000,
    });

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    const sentryCallArgs = (Sentry.captureException as jest.Mock).mock.calls[0];
    const capturedError = sentryCallArgs[0];
    const extraContext = JSON.stringify(sentryCallArgs[1]);

    expect(extraContext).not.toContain('SUPER_SECRET_TOKEN_XYZ');
    expect(extraContext).not.toContain('doNotLeak');
  });

  it('anti-event-storm: 10 falhas consecutivas disparam exatamente 1 evento Sentry durante o período de cooldown', async () => {
    mockLimit.mockRejectedValue(new Error('Upstash cluster outage'));

    for (let i = 0; i < 10; i++) {
      const allowed = await distributedRateLimit(makeMockRequest(`10.0.0.${i + 1}`), {
        key: 'storm_test_endpoint',
        limit: 100,
        windowMs: 60000,
      });
      expect(allowed).toBe(true);
    }

    // Apenas a 1ª falha dispara Sentry.captureException
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it('fallback in-memory aplica limites locais por chave quando Upstash está indisponível', async () => {
    mockLimit.mockRejectedValue(new Error('Upstash down'));

    const ip = '198.51.100.42';
    const key = `local_fallback_enforce_${Date.now()}`;
    const limit = 3;

    // Requisição 1: permitida
    const r1 = await distributedRateLimit(makeMockRequest(ip), { key, limit, windowMs: 60000 });
    expect(r1).toBe(true);

    // Requisição 2: permitida
    const r2 = await distributedRateLimit(makeMockRequest(ip), { key, limit, windowMs: 60000 });
    expect(r2).toBe(true);

    // Requisição 3: permitida (atinge o limite 3)
    const r3 = await distributedRateLimit(makeMockRequest(ip), { key, limit, windowMs: 60000 });
    expect(r3).toBe(true);

    // Requisição 4: BLOQUEADA (excedeu o limite in-memory de 3)
    const r4 = await distributedRateLimit(makeMockRequest(ip), { key, limit, windowMs: 60000 });
    expect(r4).toBe(false);
  });
});
