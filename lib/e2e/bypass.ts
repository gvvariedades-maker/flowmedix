/**
 * Bypass server-only para E2E/CI (Playwright).
 * Nunca habilitar em produção real (Vercel) sem CI.
 */
export function isE2eBypassEnabled(envVar: 'E2E_ADMIN_BYPASS' | 'E2E_DASHBOARD_BYPASS'): boolean {
  return (
    process.env[envVar] === 'true' &&
    (process.env.NODE_ENV !== 'production' || process.env.CI === 'true')
  );
}
