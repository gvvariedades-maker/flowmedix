import {
  getSentryEnvironment,
  getSentryRelease,
  getEffectiveSentryDsn,
  isSentryConfigured,
} from '@/lib/monitoring/sentryEnv';

describe('Sentry Environment & Release Helper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getSentryEnvironment', () => {
    it('retorna VERCEL_ENV quando disponível', () => {
      process.env.VERCEL_ENV = 'production';
      expect(getSentryEnvironment()).toBe('production');

      process.env.VERCEL_ENV = 'preview';
      expect(getSentryEnvironment()).toBe('preview');
    });

    it('retorna NEXT_PUBLIC_VERCEL_ENV quando disponível', () => {
      delete process.env.VERCEL_ENV;
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview';
      expect(getSentryEnvironment()).toBe('preview');
    });

    it('deriva de NODE_ENV quando VERCEL_ENV não está definido', () => {
      delete process.env.VERCEL_ENV;
      delete process.env.NEXT_PUBLIC_VERCEL_ENV;

      (process.env as any).NODE_ENV = 'production';
      expect(getSentryEnvironment()).toBe('production');

      (process.env as any).NODE_ENV = 'test';
      expect(getSentryEnvironment()).toBe('test');

      (process.env as any).NODE_ENV = 'development';
      expect(getSentryEnvironment()).toBe('development');
    });
  });

  describe('getSentryRelease', () => {
    it('retorna o commit SHA da Vercel quando disponível', () => {
      process.env.VERCEL_GIT_COMMIT_SHA = '7fc5776d90dfb6e1c06cf8ba470522567eef7d21';
      expect(getSentryRelease()).toBe('7fc5776d90dfb6e1c06cf8ba470522567eef7d21');
    });

    it('retorna NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA quando disponível', () => {
      delete process.env.VERCEL_GIT_COMMIT_SHA;
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA = 'abc1234567890';
      expect(getSentryRelease()).toBe('abc1234567890');
    });

    it('retorna undefined quando nenhum commit SHA ou release está definido', () => {
      delete process.env.VERCEL_GIT_COMMIT_SHA;
      delete process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
      delete process.env.SENTRY_RELEASE;
      delete process.env.NEXT_PUBLIC_SENTRY_RELEASE;
      expect(getSentryRelease()).toBeUndefined();
    });
  });

  describe('getEffectiveSentryDsn & isSentryConfigured', () => {
    it('retorna DSN de servidor preferencialmente no servidor', () => {
      process.env.SENTRY_DSN = 'https://server-dsn@sentry.io/123';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://public-dsn@sentry.io/123';
      expect(getEffectiveSentryDsn(false)).toBe('https://server-dsn@sentry.io/123');
      expect(isSentryConfigured(false)).toBe(true);
    });

    it('cai para DSN público no servidor se SENTRY_DSN estiver ausente', () => {
      delete process.env.SENTRY_DSN;
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://public-dsn@sentry.io/123';
      expect(getEffectiveSentryDsn(false)).toBe('https://public-dsn@sentry.io/123');
      expect(isSentryConfigured(false)).toBe(true);
    });

    it('no client exige NEXT_PUBLIC_SENTRY_DSN', () => {
      process.env.SENTRY_DSN = 'https://server-dsn@sentry.io/123';
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      expect(getEffectiveSentryDsn(true)).toBeNull();
      expect(isSentryConfigured(true)).toBe(false);

      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://public-dsn@sentry.io/123';
      expect(getEffectiveSentryDsn(true)).toBe('https://public-dsn@sentry.io/123');
      expect(isSentryConfigured(true)).toBe(true);
    });
  });
});
