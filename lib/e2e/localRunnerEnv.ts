import { CI_HARNESS_METRICS_SECRET } from '@/lib/harness/ciPlaceholders';
import { E2E_CAPTURE_MODE_ENV } from '@/lib/e2e/captureMode';
import { sanitizeHarnessEnv } from '@/lib/perf/sanitizeHarnessEnv';

export const DEFAULT_E2E_LOCAL_PORT = 3104;

export type HarnessEnvPresence = 'ABSENT' | string;

export function readEnvPresence(env: NodeJS.ProcessEnv, key: string): HarnessEnvPresence {
  const value = env[key];
  if (value === undefined || value === '') return 'ABSENT';
  return value;
}

export function e2eLocalPortFromEnv(env: NodeJS.ProcessEnv): number {
  const raw = env.E2E_LOCAL_PORT;
  const port = raw !== undefined && raw !== '' ? Number(raw) : DEFAULT_E2E_LOCAL_PORT;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid E2E local port "${raw}". Use E2E_LOCAL_PORT with an integer between 1 and 65535.`,
    );
  }
  return port;
}

export function isAcceptableHealthStatus(status: number): boolean {
  return status === 200 || status === 503;
}

/** Public CI placeholders — same values as `.github/workflows/test.yml` build job (no secrets). */
export function applyCiBuildPlaceholderEnv(
  env: NodeJS.ProcessEnv,
  baseUrl: string,
  port: number,
): NodeJS.ProcessEnv {
  return {
    ...env,
    CI: 'true',
    NODE_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: 'https://ci-build-placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ci-build-placeholder-key',
    NEXT_PUBLIC_APP_URL: baseUrl,
    RESEND_API_KEY: 're_ci_build_placeholder_key',
    RESEND_FROM_EMAIL: 'Avant <noreply@ci.placeholder.test>',
    SUPABASE_WEBHOOK_SECRET: 'ci_supabase_webhook_secret_placeholder_32',
    SUPABASE_SERVICE_ROLE_KEY: 'ci_service_role_placeholder_key_32chars',
    ADMIN_EMAIL: 'ci-admin@placeholder.test',
    METRICS_SECRET: CI_HARNESS_METRICS_SECRET,
    PORT: String(port),
  };
}

export function perfLocalPortFromEnv(env: NodeJS.ProcessEnv): number {
  const raw = env.PERF_LOCAL_PORT;
  const port = raw !== undefined && raw !== '' ? Number(raw) : DEFAULT_E2E_LOCAL_PORT;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid perf local port "${raw}". Use PERF_LOCAL_PORT with an integer between 1 and 65535.`,
    );
  }
  return port;
}

/** Child env for build + Next start — explicit functional E2E, capture mode off by default. */
export function buildE2eFunctionalChildEnv(
  parentEnv: NodeJS.ProcessEnv,
  options: { port: number; baseUrl: string },
): NodeJS.ProcessEnv {
  const sanitized = sanitizeHarnessEnv(parentEnv);
  const withPlaceholders = applyCiBuildPlaceholderEnv(
    sanitized,
    options.baseUrl,
    options.port,
  );
  const next: NodeJS.ProcessEnv = {
    ...withPlaceholders,
    E2E_ADMIN_BYPASS: 'true',
    E2E_DASHBOARD_BYPASS: 'true',
    NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
  };
  delete next[E2E_CAPTURE_MODE_ENV];
  delete next.PLAYWRIGHT_SKIP_WEBSERVER;
  delete next.PLAYWRIGHT_PROD;
  delete next.PLAYWRIGHT_TEST_BASE_URL;
  return next;
}

/** Playwright child — webServer disabled, base URL pinned to local server. */
export function buildPlaywrightChildEnv(
  functionalEnv: NodeJS.ProcessEnv,
  baseUrl: string,
): NodeJS.ProcessEnv {
  return {
    ...functionalEnv,
    PLAYWRIGHT_SKIP_WEBSERVER: 'true',
    PLAYWRIGHT_TEST_BASE_URL: baseUrl,
  };
}

export function propagateChildExitCode(status: number | null, signal: NodeJS.Signals | null): number {
  if (signal) return 1;
  return status ?? 1;
}

export async function waitForHealth(
  baseUrl: string,
  timeoutMs = 180_000,
): Promise<number | 'TIMEOUT'> {
  const deadline = Date.now() + timeoutMs;
  const healthUrl = `${baseUrl.replace(/\/$/, '')}/api/health`;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(healthUrl, { cache: 'no-store' });
      if (isAcceptableHealthStatus(response.status)) {
        return response.status;
      }
    } catch {
      /* server still starting */
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 2000));
  }
  return 'TIMEOUT';
}
