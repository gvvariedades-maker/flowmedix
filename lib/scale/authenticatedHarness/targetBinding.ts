import {
  assertPoolBoundToApprovedStaging,
  loadApprovedStagingTarget,
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

export function resolveApprovedStagingForCli(options: { allowlistPath?: string }): ApprovedStagingTarget {
  return loadApprovedStagingTarget(options.allowlistPath);
}

export { assertPoolBoundToApprovedStaging, type ApprovedStagingTarget };
