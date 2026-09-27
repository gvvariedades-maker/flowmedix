import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFAULT_STAGING_ALLOWLIST_RELATIVE_PATH } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import { HarnessExecutionForbiddenError } from '@/lib/scale/authenticatedHarness/harnessForbidden';
import {
  DEFAULT_ENVELOPE_RELATIVE_PATH,
  estimateMeanRps,
  getTierPeakCcu,
  loadWorkloadEnvelope,
  type ConcurrencyTierId,
} from '@/lib/scale/workloadEnvelope';

export type CanonicalArtifactBinding = {
  envelope_relative_path: string;
  allowlist_relative_path: string;
  envelope_version: string;
  envelope_digest_sha256: string;
  allowlist_digest_sha256: string;
  peak_concurrent_users: number;
  target_mean_rps: number;
};

export function sha256HexOfRepoFile(relativePath: string): string {
  const absolute = resolve(process.cwd(), relativePath);
  const buf = readFileSync(absolute);
  return createHash('sha256').update(buf).digest('hex');
}

export function assertExecuteUsesCanonicalArtifactPaths(options: {
  execute: boolean;
  envelopePath?: string;
  allowlistPath?: string;
}): void {
  if (!options.execute) return;
  if (options.envelopePath?.trim()) {
    throw new HarnessExecutionForbiddenError(
      '--envelope customizado proibido com --execute; use docs/scale-1k-workload-envelope.v1.json versionado.',
    );
  }
  if (options.allowlistPath?.trim()) {
    throw new HarnessExecutionForbiddenError(
      '--staging-allowlist customizado proibido com --execute; use data/scale-harness/staging-target.allowlist.json versionado.',
    );
  }
}

export function loadCanonicalArtifactBinding(tier: ConcurrencyTierId): CanonicalArtifactBinding {
  const envelope_relative_path = DEFAULT_ENVELOPE_RELATIVE_PATH;
  const allowlist_relative_path = DEFAULT_STAGING_ALLOWLIST_RELATIVE_PATH;
  const envelope = loadWorkloadEnvelope(envelope_relative_path);
  const peak = getTierPeakCcu(envelope, tier);
  const target_mean_rps = estimateMeanRps(envelope, peak);
  return {
    envelope_relative_path,
    allowlist_relative_path,
    envelope_version: envelope.version,
    envelope_digest_sha256: sha256HexOfRepoFile(envelope_relative_path),
    allowlist_digest_sha256: sha256HexOfRepoFile(allowlist_relative_path),
    peak_concurrent_users: peak,
    target_mean_rps,
  };
}
