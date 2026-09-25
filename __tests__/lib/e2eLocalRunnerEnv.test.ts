import { CI_HARNESS_METRICS_SECRET } from '@/lib/harness/ciPlaceholders';
import { E2E_CAPTURE_MODE_ENV } from '@/lib/e2e/captureMode';
import {
  DEFAULT_E2E_LOCAL_PORT,
  buildE2eFunctionalChildEnv,
  buildPlaywrightChildEnv,
  e2eLocalPortFromEnv,
  isAcceptableHealthStatus,
  propagateChildExitCode,
  readEnvPresence,
} from '@/lib/e2e/localRunnerEnv';

describe('localRunnerEnv', () => {
  const baseUrl = `http://127.0.0.1:${DEFAULT_E2E_LOCAL_PORT}`;

  it('builds explicit functional E2E child env with capture mode off', () => {
    const parent = {
      CI: 'false',
      E2E_CAPTURE_MODE: 'true',
      E2E_DASHBOARD_BYPASS: 'false',
      PLAYWRIGHT_SKIP_WEBSERVER: 'true',
      PLAYWRIGHT_PROD: 'true',
      PLAYWRIGHT_TEST_BASE_URL: 'http://localhost:3000',
      METRICS_SECRET: 'real-metrics-secret-from-parent-shell',
    } as unknown as NodeJS.ProcessEnv;

    const child = buildE2eFunctionalChildEnv(parent, {
      port: DEFAULT_E2E_LOCAL_PORT,
      baseUrl,
    });

    expect(child.CI).toBe('true');
    expect(child.NODE_ENV).toBe('production');
    expect(child.E2E_ADMIN_BYPASS).toBe('true');
    expect(child.E2E_DASHBOARD_BYPASS).toBe('true');
    expect(child.NEXT_PUBLIC_E2E_DASHBOARD_BYPASS).toBe('true');
    expect(readEnvPresence(child, E2E_CAPTURE_MODE_ENV)).toBe('ABSENT');
    expect(readEnvPresence(child, 'PLAYWRIGHT_SKIP_WEBSERVER')).toBe('ABSENT');
    expect(readEnvPresence(child, 'PLAYWRIGHT_PROD')).toBe('ABSENT');
    expect(child.NEXT_PUBLIC_APP_URL).toBe(baseUrl);
    expect(child.METRICS_SECRET).toBe(CI_HARNESS_METRICS_SECRET);
  });

  it('playwright child disables webServer and sets base URL', () => {
    const functional = buildE2eFunctionalChildEnv(process.env, {
      port: 3105,
      baseUrl: 'http://127.0.0.1:3105',
    });
    const pw = buildPlaywrightChildEnv(functional, 'http://127.0.0.1:3105');
    expect(pw.PLAYWRIGHT_SKIP_WEBSERVER).toBe('true');
    expect(pw.PLAYWRIGHT_TEST_BASE_URL).toBe('http://127.0.0.1:3105');
  });

  it('resolves port from E2E_LOCAL_PORT with default (ignores generic PORT)', () => {
    expect(e2eLocalPortFromEnv({} as NodeJS.ProcessEnv)).toBe(DEFAULT_E2E_LOCAL_PORT);
    expect(
      e2eLocalPortFromEnv({ PORT: '3103' } as unknown as NodeJS.ProcessEnv),
    ).toBe(DEFAULT_E2E_LOCAL_PORT);
    expect(e2eLocalPortFromEnv({ E2E_LOCAL_PORT: '3110' } as unknown as NodeJS.ProcessEnv)).toBe(3110);
  });

  it('propagates child exit code', () => {
    expect(propagateChildExitCode(0, null)).toBe(0);
    expect(propagateChildExitCode(1, null)).toBe(1);
    expect(propagateChildExitCode(null, 'SIGTERM')).toBe(1);
  });

  it('accepts health 200 and 503', () => {
    expect(isAcceptableHealthStatus(200)).toBe(true);
    expect(isAcceptableHealthStatus(503)).toBe(true);
    expect(isAcceptableHealthStatus(404)).toBe(false);
  });
});
