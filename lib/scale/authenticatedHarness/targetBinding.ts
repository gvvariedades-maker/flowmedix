import {
  assertPoolBoundToApprovedStaging,
  loadApprovedStagingTarget,
  mergeApprovedHostsFromEnv,
  type ApprovedStagingTarget,
} from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

export type TargetBindingValidation = { ok: true } | { ok: false; reason: string };

/** @deprecated Use assertPoolBoundToApprovedStaging — pool.allowed_hosts não é autoridade. */
export function validateStagingTargetBinding(pool: SyntheticUserPoolFile): TargetBindingValidation {
  try {
    const approved = loadApprovedStagingTarget();
    assertPoolBoundToApprovedStaging(pool, approved);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

export function resolveApprovedStagingForCli(options: {
  allowlistPath?: string;
  extraAppHostsCsv?: string;
}): ApprovedStagingTarget {
  const base = loadApprovedStagingTarget(options.allowlistPath);
  return mergeApprovedHostsFromEnv(base, options.extraAppHostsCsv);
}

export { assertPoolBoundToApprovedStaging, type ApprovedStagingTarget };
