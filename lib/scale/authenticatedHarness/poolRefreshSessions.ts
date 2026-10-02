import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';
import { formatHarnessSyntheticEmail } from '@/lib/scale/authenticatedHarness/poolProvisioning';
import {
  buildSupabaseSsrCookieHeader,
  createHarnessSessionForEmail,
} from '@/lib/scale/authenticatedHarness/provisionSession';

export type RefreshHarnessPoolSessionsOptions = {
  pool: SyntheticUserPoolFile;
  batch: string;
  emailDomain: string;
  supabaseUrl: string;
  serviceRoleKey: string;
  anonKey: string;
  throttleMs: number;
  startIndex?: number;
  onUserRefreshed?: (ctx: {
    pool: SyntheticUserPoolFile;
    poolId: string;
    index: number;
    total: number;
  }) => void;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const status = (err as { status?: number }).status;
  const msg = String((err as { message?: string }).message ?? '').toLowerCase();
  return status === 429 || msg.includes('rate limit');
}

async function withAuthRateLimitRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const waits = [0, 2000, 5000, 12000, 25000];
  for (let attempt = 0; attempt < waits.length; attempt += 1) {
    if (waits[attempt] > 0) await sleep(waits[attempt]);
    try {
      return await fn();
    } catch (err) {
      if (!isRateLimitError(err) || attempt === waits.length - 1) throw err;
    }
  }
  throw new Error(`${label}: esgotou retries`);
}

/**
 * Renova access_token, refresh_token e cookie SSR sem alterar slugs/opções do pool.
 */
export async function refreshHarnessPoolSessions(
  options: RefreshHarnessPoolSessionsOptions,
): Promise<SyntheticUserPoolFile> {
  const users = [...options.pool.users];
  const total = users.length;
  const start = Math.max(0, options.startIndex ?? 0);

  for (let i = start; i < total; i += 1) {
    const user = users[i]!;
    const email = formatHarnessSyntheticEmail(options.batch, i, options.emailDomain);
    const session = await withAuthRateLimitRetry(`session ${user.pool_id}`, () =>
      createHarnessSessionForEmail({
        supabaseUrl: options.supabaseUrl,
        serviceRoleKey: options.serviceRoleKey,
        anonKey: options.anonKey,
        email,
      }),
    );
    const cookie_header = await withAuthRateLimitRetry(`cookie ${user.pool_id}`, () =>
      buildSupabaseSsrCookieHeader(options.supabaseUrl, options.anonKey, session),
    );

    users[i] = {
      ...user,
      access_token: session.access_token,
      supabase_refresh_token: session.refresh_token,
      cookie_header,
    };
    options.onUserRefreshed?.({
      pool: { ...options.pool, users: [...users] },
      poolId: user.pool_id,
      index: i,
      total,
    });
    if (options.throttleMs > 0 && i < total - 1) {
      await sleep(options.throttleMs);
    }
  }

  return {
    ...options.pool,
    users,
  };
}
