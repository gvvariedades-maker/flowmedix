/**
 * Bypass de Deployment Protection na Vercel (preview protegida).
 * @see https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
 *
 * Defina `VERCEL_PROTECTION_BYPASS` no `.env.staging.local` (secret gerado em
 * Project Settings → Deployment Protection → Protection Bypass for Automation).
 */

const BYPASS_HEADER = 'x-vercel-protection-bypass';
const SET_COOKIE_HEADER = 'x-vercel-set-bypass-cookie';

export function getVercelProtectionBypassSecret(): string | undefined {
  const secret = process.env.VERCEL_PROTECTION_BYPASS?.trim();
  return secret || undefined;
}

/** Headers para `fetch` / Playwright contra preview com protection ativa. */
export function getVercelProtectionHeaders(): Record<string, string> {
  const secret = getVercelProtectionBypassSecret();
  if (!secret) return {};
  return {
    [BYPASS_HEADER]: secret,
    [SET_COOKIE_HEADER]: 'true',
  };
}

export function mergeWithVercelProtectionHeaders(
  headers?: Record<string, string>,
): Record<string, string> {
  const protection = getVercelProtectionHeaders();
  if (Object.keys(protection).length === 0) {
    return headers ? { ...headers } : {};
  }
  return { ...headers, ...protection };
}
