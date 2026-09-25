/** Keys that must not leak from Playwright/E2E into sanitized perf smoke runs. */
export const HARNESS_E2E_LEAK_KEYS = [
  'E2E_DASHBOARD_BYPASS',
  'E2E_ADMIN_BYPASS',
  'NEXT_PUBLIC_E2E_DASHBOARD_BYPASS',
  'PLAYWRIGHT_SKIP_WEBSERVER',
  'PLAYWRIGHT_PROD',
] as const;

export type HarnessEnvPresence = 'ABSENT' | string;

export function readHarnessEnvPresence(
  env: NodeJS.ProcessEnv,
  key: (typeof HARNESS_E2E_LEAK_KEYS)[number],
): HarnessEnvPresence {
  const value = env[key];
  if (value === undefined || value === '') return 'ABSENT';
  return value;
}

/** Returns a shallow copy with E2E/Playwright bypass keys removed (does not mutate input). */
export function sanitizeHarnessEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const next: NodeJS.ProcessEnv = { ...env };
  for (const key of HARNESS_E2E_LEAK_KEYS) {
    delete next[key];
  }
  return next;
}
