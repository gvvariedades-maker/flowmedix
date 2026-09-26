import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

export type TargetBindingValidation = { ok: true } | { ok: false; reason: string };

export function validateStagingTargetBinding(pool: SyntheticUserPoolFile): TargetBindingValidation {
  if (pool.target_environment !== 'staging') {
    return {
      ok: false,
      reason: `target_environment deve ser "staging" (recebido: ${pool.target_environment ?? 'ausente'})`,
    };
  }
  if (!Array.isArray(pool.allowed_hosts) || pool.allowed_hosts.length === 0) {
    return { ok: false, reason: 'allowed_hosts[] obrigatório (allowlist explícita)' };
  }

  let host: string;
  try {
    host = new URL(pool.base_url).hostname.toLowerCase();
  } catch {
    return { ok: false, reason: `base_url inválida: ${pool.base_url}` };
  }

  const allowed = pool.allowed_hosts.map((h) => h.toLowerCase());
  if (!allowed.includes(host)) {
    return {
      ok: false,
      reason: `host ${host} não está em allowed_hosts (${allowed.join(', ')})`,
    };
  }

  return { ok: true };
}
