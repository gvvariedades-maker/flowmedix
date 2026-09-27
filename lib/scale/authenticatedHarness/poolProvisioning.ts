import type { SupabaseClient } from '@supabase/supabase-js';
import { loadApprovedStagingTarget } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import { findAuthUserByEmail } from '@/lib/supabase/adminUsers';

const PRODUCTION_SUPABASE_REF = 'ozgouenqrofnvgrlgfwd';
const PRODUCTION_APP_HOSTS = new Set(['avant.enf.br', 'www.avant.enf.br']);

export class PoolProvisionForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PoolProvisionForbiddenError';
  }
}

export function assertHarnessProvisionTargetsAllowed(options: {
  supabaseUrl: string;
  baseUrl: string;
}): void {
  const approved = loadApprovedStagingTarget();
  let supabaseHost: string;
  let appHost: string;
  try {
    supabaseHost = new URL(options.supabaseUrl).hostname.toLowerCase();
    appHost = new URL(options.baseUrl).hostname.toLowerCase();
  } catch {
    throw new PoolProvisionForbiddenError('supabase_url ou base_url inválidas');
  }

  const ref = supabaseHost.split('.')[0];
  if (ref === PRODUCTION_SUPABASE_REF || supabaseHost.includes(PRODUCTION_SUPABASE_REF)) {
    throw new PoolProvisionForbiddenError(
      `Provisionamento bloqueado: Supabase Production (${PRODUCTION_SUPABASE_REF})`,
    );
  }
  if (PRODUCTION_APP_HOSTS.has(appHost)) {
    throw new PoolProvisionForbiddenError('Provisionamento bloqueado: host Production avant.enf.br');
  }
  if (!approved.supabase_hosts.includes(supabaseHost)) {
    throw new PoolProvisionForbiddenError(
      `supabase_url host "${supabaseHost}" fora da allowlist (${approved.supabase_hosts.join(', ')})`,
    );
  }
  if (!approved.app_hosts.includes(appHost)) {
    throw new PoolProvisionForbiddenError(
      `base_url host "${appHost}" fora da allowlist (${approved.app_hosts.join(', ')})`,
    );
  }
}

export function formatHarnessPoolUserId(index: number): string {
  return `harness-u${String(index + 1).padStart(3, '0')}`;
}

export function formatHarnessSyntheticEmail(batch: string, index: number, domain: string): string {
  const safeBatch = batch.replace(/[^a-zA-Z0-9._+-]/g, '-').toLowerCase();
  const safeDomain = domain.trim().toLowerCase();
  return `scale.harness.${safeBatch}.${String(index + 1).padStart(3, '0')}@${safeDomain}`;
}

/** Domínio aceito pelo GoTrue no CAS (evita TLD `.invalid`). */
export const DEFAULT_HARNESS_EMAIL_DOMAIN = 'example.com';

export const DEFAULT_STAGING_APP_URL =
  'https://flowmedix-git-staging-gvvariedades-makers-projects.vercel.app';

export const DEFAULT_STAGING_SUPABASE_URL = 'https://higsjzfigprqvldpxfwj.supabase.co';

/** Serializa erros do GoTrue/PostgREST (evita stderr só `{}`). */
export function formatHarnessProvisionError(err: unknown): string {
  if (err instanceof Error && err.message && err.message !== '{}') {
    const status = (err as Error & { status?: number }).status;
    return status ? `${err.message} (status ${status})` : err.message;
  }
  if (typeof err === 'object' && err) {
    const record = err as Record<string, unknown>;
    const parts = [
      record.message,
      record.code,
      record.status !== undefined ? `status ${record.status}` : null,
      record.details,
      record.hint,
    ]
      .filter((v) => typeof v === 'string' && v.trim() && v !== '{}')
      .map((v) => String(v));
    if (parts.length > 0) return parts.join(' | ');
  }
  return err instanceof Error ? err.name : JSON.stringify(err);
}

/**
 * Resolve e-mails harness → user_id via RPC (evita listUsers perPage alto, que retorna 500 no CAS).
 */
export async function mapHarnessEmailsToAuthUserIds(
  admin: SupabaseClient,
  emails: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const email of emails) {
    const normalized = email.toLowerCase();
    const { user, error } = await findAuthUserByEmail(admin, email);
    if (error) throw error;
    if (user?.id) out.set(normalized, user.id);
  }
  return out;
}
