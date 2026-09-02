import {
  classifyTarget,
  assertE2eTargetSafe,
  isLoopbackHost,
  isProductionHost,
} from '@/lib/e2e/targetSafety';

describe('E2E Target Safety Guard (Production Protection)', () => {
  describe('LOCALHOST_ALLOWED (loopback hosts)', () => {
    const validLoopbackUrls = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://[::1]:3000',
      'https://localhost',
      'http://127.0.0.1:8080/estudar?query=1',
      'http://[::1]:8080',
    ];

    it.each(validLoopbackUrls)('allows loopback url: %s', (url) => {
      expect(classifyTarget(url)).toBe('loopback');
      const result = assertE2eTargetSafe(url);
      expect(result.classification).toBe('loopback');
      expect(result.baseUrl).toBeDefined();
    });

    it('correctly identifies loopback hostnames', () => {
      expect(isLoopbackHost('localhost')).toBe(true);
      expect(isLoopbackHost('127.0.0.1')).toBe(true);
      expect(isLoopbackHost('::1')).toBe(true);
      expect(isLoopbackHost('[::1]')).toBe(true);
      expect(isLoopbackHost('LOCALHOST')).toBe(true);
      expect(isLoopbackHost('example.com')).toBe(false);
      expect(isLoopbackHost('avantmed.app')).toBe(false);
    });
  });

  describe('PRODUCTION_ALWAYS_BLOCKED (fail-closed against all production domains)', () => {
    const canonicalProductionUrls = [
      'https://avantmed.app',
      'http://avantmed.app',
      'https://www.avantmed.app',
      'https://avantmed.app:8443',
      'https://avantmed.app/estudar',
      'http://avantmed.app:3000/api/health',
      'https://avant.enf.br',
      'http://avant.enf.br',
      'https://www.avant.enf.br',
      'https://www.avant.enf.br:443/login',
      'http://www.avant.enf.br:8080',
      'https://api.avant.enf.br',
      'https://preview.avant.enf.br',
      'https://app.avantmed.app',
    ];

    it.each(canonicalProductionUrls)('classifies as production and blocks: %s', (url) => {
      expect(classifyTarget(url)).toBe('production');
      expect(() => assertE2eTargetSafe(url)).toThrow(/PRODUCTION/i);
    });

    it('correctly identifies production hostnames', () => {
      expect(isProductionHost('avantmed.app')).toBe(true);
      expect(isProductionHost('www.avantmed.app')).toBe(true);
      expect(isProductionHost('avant.enf.br')).toBe(true);
      expect(isProductionHost('www.avant.enf.br')).toBe(true);
      expect(isProductionHost('sub.avant.enf.br')).toBe(true);
      expect(isProductionHost('AVANTMED.APP')).toBe(true);
      expect(isProductionHost('localhost')).toBe(false);
      expect(isProductionHost('staging.vercel.app')).toBe(false);
    });

    it('blocks production EVEN WHEN staging opt-in is explicitly true', () => {
      const prodUrl = 'https://www.avant.enf.br';
      expect(classifyTarget(prodUrl, { allowStaging: true })).toBe('production');
      expect(() => assertE2eTargetSafe(prodUrl, { allowStaging: true })).toThrow(/PRODUCTION/i);
    });
  });

  describe('GENERIC_REMOTE_FAILS_CLOSED (generic Playwright rejects arbitrary remote targets)', () => {
    const genericRemoteUrls = [
      'https://preview-123.vercel.app',
      'https://avant-preview.vercel.app',
      'http://staging.internal:3000',
      'https://example.com',
      'http://192.168.1.50:3000',
    ];

    it.each(genericRemoteUrls)('blocks generic remote without staging opt-in: %s', (url) => {
      expect(classifyTarget(url)).toBe('remote_disallowed');
      expect(() => assertE2eTargetSafe(url)).toThrow(/alvo remoto.*não foi autorizado/i);
    });
  });

  describe('STAGING_EXPLICITLY_ALLOWED (authorized staging remote targets)', () => {
    const stagingUrls = [
      'https://preview-123.vercel.app',
      'https://avant-staging.vercel.app',
      'http://staging.internal:3000',
    ];

    it.each(stagingUrls)('allows remote target when staging is explicitly authorized: %s', (url) => {
      expect(classifyTarget(url, { allowStaging: true })).toBe('staging');
      const result = assertE2eTargetSafe(url, { allowStaging: true });
      expect(result.classification).toBe('staging');
      expect(result.baseUrl).toBe(new URL(url).origin);
    });
  });

  describe('PERF_TARGET_ALONE_DOES_NOT_AUTHORIZE_REMOTE', () => {
    it('blocks remote target when only PERF_TARGET is set without E2E_STAGING_OPT_IN', () => {
      const remoteUrl = 'https://example.com';
      // Simula a resolução estrita do playwright.config.ts onde allowStaging requer E2E_STAGING_OPT_IN === 'true'
      const allowStaging = process.env.E2E_STAGING_OPT_IN === 'true';
      expect(allowStaging).toBe(false);
      expect(classifyTarget(remoteUrl, { allowStaging })).toBe('remote_disallowed');
      expect(() => assertE2eTargetSafe(remoteUrl, { allowStaging })).toThrow(/alvo remoto.*não foi autorizado/i);
    });
  });

  describe('INVALID_URLS (malformed or unsupported protocol)', () => {
    const invalidUrls = [
      'not-a-valid-url',
      'ftp://localhost:3000',
      'file:///path/to/file',
      'javascript:alert(1)',
      '',
      '   ',
    ];

    it.each(invalidUrls)('rejects invalid or unsupported url: %s', (url) => {
      expect(classifyTarget(url)).toBe('invalid');
      expect(() => assertE2eTargetSafe(url)).toThrow(/inválida/i);
    });
  });
});