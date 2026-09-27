import type { ApprovedStagingTarget } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import { HarnessExecutionForbiddenError } from '@/lib/scale/authenticatedHarness/harnessForbidden';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

const BYPASS_HEADER = 'x-vercel-protection-bypass';
const SET_COOKIE_HEADER = 'x-vercel-set-bypass-cookie';

export type HarnessHttpTransportOptions = {
  vercelProtectionBypass?: string;
  approvedAppHosts: string[];
};

export function getVercelProtectionBypassFromEnv(env: NodeJS.ProcessEnv): string | undefined {
  const secret =
    env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim() || env.VERCEL_PROTECTION_BYPASS?.trim();
  if (!secret) return undefined;
  if (secret === BYPASS_HEADER || secret === SET_COOKIE_HEADER) return undefined;
  return secret;
}

export function poolAppHostname(pool: SyntheticUserPoolFile): string {
  return new URL(pool.base_url).hostname.toLowerCase();
}

export function requiresVercelProtectionBypass(pool: SyntheticUserPoolFile, approved: ApprovedStagingTarget): boolean {
  const host = poolAppHostname(pool);
  if (host === '127.0.0.1' || host === 'localhost') return false;
  return approved.app_hosts.includes(host) && host.endsWith('.vercel.app');
}

export function assertVercelProtectionBypassForStagingExecute(
  pool: SyntheticUserPoolFile,
  approved: ApprovedStagingTarget,
  env: NodeJS.ProcessEnv,
): void {
  if (!requiresVercelProtectionBypass(pool, approved)) return;
  if (!getVercelProtectionBypassFromEnv(env)) {
    throw new HarnessExecutionForbiddenError(
      'VERCEL_AUTOMATION_BYPASS_SECRET (ou VERCEL_PROTECTION_BYPASS) obrigatório para --execute contra preview Vercel protegido.',
    );
  }
}

export function mergeVercelProtectionHeadersForAppUrl(
  requestUrl: string,
  headers: Record<string, string>,
  transport: HarnessHttpTransportOptions,
): void {
  if (!transport.vercelProtectionBypass) return;
  let host: string;
  try {
    host = new URL(requestUrl).hostname.toLowerCase();
  } catch {
    return;
  }
  if (host === '127.0.0.1' || host === 'localhost') return;
  if (!transport.approvedAppHosts.includes(host)) return;
  headers[BYPASS_HEADER] = transport.vercelProtectionBypass;
  headers[SET_COOKIE_HEADER] = 'true';
}

export function buildHarnessHttpTransport(
  pool: SyntheticUserPoolFile,
  approved: ApprovedStagingTarget,
  env: NodeJS.ProcessEnv,
): HarnessHttpTransportOptions {
  return {
    vercelProtectionBypass: getVercelProtectionBypassFromEnv(env),
    approvedAppHosts: approved.app_hosts,
  };
}

export type HarnessFetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export function mergeSetCookieIntoCookieHeader(
  existingCookie: string | undefined,
  setCookieHeaders: string[],
): string {
  const pairs = setCookieHeaders
    .map((raw) => raw.split(';')[0]?.trim())
    .filter((v): v is string => Boolean(v));
  const parts = new Set<string>();
  if (existingCookie?.trim()) {
    for (const chunk of existingCookie.split(';')) {
      const trimmed = chunk.trim();
      if (trimmed) parts.add(trimmed);
    }
  }
  for (const pair of pairs) parts.add(pair);
  return [...parts].join('; ');
}

function shouldUseVercelProtectionFetch(url: string, transport: HarnessHttpTransportOptions): boolean {
  if (!transport.vercelProtectionBypass) return false;
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (host === '127.0.0.1' || host === 'localhost') return false;
  return transport.approvedAppHosts.includes(host);
}

/**
 * Vercel Deployment Protection: 1º request manual → cookie `_vercel_jwt`; 2º com Cookie evita redirect loop.
 */
export function createHarnessFetch(
  baseFetch: HarnessFetchLike = fetch,
  transport?: HarnessHttpTransportOptions,
): HarnessFetchLike {
  if (!transport?.vercelProtectionBypass) return baseFetch;

  return async (input: string, init?: RequestInit) => {
    const url = input;
    if (!shouldUseVercelProtectionFetch(url, transport)) {
      return baseFetch(input, init);
    }

    const headers: Record<string, string> = {
      ...((init?.headers as Record<string, string> | undefined) ?? {}),
    };
    mergeVercelProtectionHeadersForAppUrl(url, headers, transport);

    const probe = await baseFetch(url, { ...init, headers, redirect: 'manual' });
    if (probe.status >= 200 && probe.status < 300) {
      return probe;
    }
    if (probe.status < 300 || probe.status >= 400) {
      return probe;
    }

    const setCookies =
      typeof probe.headers.getSetCookie === 'function'
        ? probe.headers.getSetCookie()
        : [probe.headers.get('set-cookie')].filter((v): v is string => Boolean(v));

    if (setCookies.length === 0) {
      return probe;
    }

    headers.Cookie = mergeSetCookieIntoCookieHeader(headers.Cookie, setCookies);
    return baseFetch(url, {
      ...init,
      headers,
      redirect: init?.redirect ?? 'follow',
    });
  };
}
