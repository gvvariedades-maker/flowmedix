import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

export const DEFAULT_STAGING_ALLOWLIST_RELATIVE_PATH = 'data/scale-harness/staging-target.allowlist.json';

export type ApprovedStagingTarget = {
  schema_version: number;
  app_hosts: string[];
  supabase_hosts: string[];
};

export class StagingTargetBindingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StagingTargetBindingError';
  }
}

export function loadApprovedStagingTarget(pathFromEnv?: string): ApprovedStagingTarget {
  const rel = pathFromEnv?.trim() || DEFAULT_STAGING_ALLOWLIST_RELATIVE_PATH;
  const absolute = resolve(process.cwd(), rel);
  const parsed = JSON.parse(readFileSync(absolute, 'utf8')) as ApprovedStagingTarget;
  if (parsed.schema_version !== 1) {
    throw new StagingTargetBindingError(`allowlist schema_version ${parsed.schema_version} não suportado`);
  }
  if (!parsed.app_hosts?.length || !parsed.supabase_hosts?.length) {
    throw new StagingTargetBindingError('allowlist app_hosts e supabase_hosts obrigatórios');
  }
  return {
    schema_version: 1,
    app_hosts: parsed.app_hosts.map((h) => h.toLowerCase()),
    supabase_hosts: parsed.supabase_hosts.map((h) => h.toLowerCase()),
  };
}

export function assertPoolBoundToApprovedStaging(
  pool: SyntheticUserPoolFile,
  approved: ApprovedStagingTarget,
): void {
  if (pool.target_environment !== 'staging') {
    throw new StagingTargetBindingError(
      `target_environment deve ser staging (recebido: ${pool.target_environment})`,
    );
  }

  let appHost: string;
  try {
    appHost = new URL(pool.base_url).hostname.toLowerCase();
  } catch {
    throw new StagingTargetBindingError(`base_url inválida: ${pool.base_url}`);
  }

  if (!approved.app_hosts.includes(appHost)) {
    throw new StagingTargetBindingError(
      `base_url host "${appHost}" não está na allowlist aprovada (${approved.app_hosts.join(', ')})`,
    );
  }

  if (pool.supabase_url?.trim()) {
    let supabaseHost: string;
    try {
      supabaseHost = new URL(pool.supabase_url).hostname.toLowerCase();
    } catch {
      throw new StagingTargetBindingError(`supabase_url inválida: ${pool.supabase_url}`);
    }
    if (!approved.supabase_hosts.includes(supabaseHost)) {
      throw new StagingTargetBindingError(
        `supabase_url host "${supabaseHost}" não está na allowlist aprovada (${approved.supabase_hosts.join(', ')})`,
      );
    }
  }
}
