import {
  HARNESS_E2E_LEAK_KEYS,
  readHarnessEnvPresence,
  sanitizeHarnessEnv,
} from '@/lib/perf/sanitizeHarnessEnv';

describe('sanitizeHarnessEnv', () => {
  it('removes E2E and Playwright bypass keys without mutating parent', () => {
    const parent: NodeJS.ProcessEnv = {
      CI: 'true',
      NODE_ENV: 'production',
      E2E_DASHBOARD_BYPASS: 'true',
      E2E_ADMIN_BYPASS: 'true',
      NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
      PLAYWRIGHT_SKIP_WEBSERVER: 'true',
      PLAYWRIGHT_PROD: 'true',
      METRICS_SECRET: 'ci_metrics_secret_placeholder',
    };

    const child = sanitizeHarnessEnv(parent);

    for (const key of HARNESS_E2E_LEAK_KEYS) {
      expect(readHarnessEnvPresence(child, key)).toBe('ABSENT');
      expect(parent[key]).toBeDefined();
    }
    expect(child.METRICS_SECRET).toBe('ci_metrics_secret_placeholder');
  });

  it('readHarnessEnvPresence reports ABSENT for empty values', () => {
    expect(readHarnessEnvPresence({} as NodeJS.ProcessEnv, 'E2E_DASHBOARD_BYPASS')).toBe('ABSENT');
    expect(
      readHarnessEnvPresence(
        { E2E_DASHBOARD_BYPASS: '' } as unknown as NodeJS.ProcessEnv,
        'E2E_DASHBOARD_BYPASS',
      ),
    ).toBe('ABSENT');
  });
});
