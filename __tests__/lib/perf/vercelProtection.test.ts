import {
  getVercelProtectionBypassSecret,
  getVercelProtectionHeaders,
  mergeWithVercelProtectionHeaders,
} from '@/lib/perf/vercelProtection';

describe('vercelProtection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.VERCEL_PROTECTION_BYPASS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('sem secret não adiciona headers', () => {
    expect(getVercelProtectionHeaders()).toEqual({});
    expect(mergeWithVercelProtectionHeaders({ Authorization: 'Bearer x' })).toEqual({
      Authorization: 'Bearer x',
    });
  });

  it('com VERCEL_PROTECTION_BYPASS envia headers de bypass', () => {
    process.env.VERCEL_PROTECTION_BYPASS = 'test-secret';
    expect(getVercelProtectionBypassSecret()).toBe('test-secret');
    expect(getVercelProtectionHeaders()).toEqual({
      'x-vercel-protection-bypass': 'test-secret',
      'x-vercel-set-bypass-cookie': 'true',
    });
  });
});
