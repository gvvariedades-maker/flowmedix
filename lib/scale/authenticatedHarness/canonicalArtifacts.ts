import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
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

/** SHA-256 dos bytes no working tree (sensível a CRLF no Windows). */
export function sha256HexOfWorktreeFile(relativePath: string): string {
  const absolute = resolve(process.cwd(), relativePath);
  const buf = readFileSync(absolute);
  return createHash('sha256').update(buf).digest('hex');
}

/** @deprecated Use sha256HexOfGitBlobAtRef — alias legado para worktree. */
export function sha256HexOfRepoFile(relativePath: string): string {
  return sha256HexOfWorktreeFile(relativePath);
}

/** SHA-256 do blob Git (portável LF; independente de core.autocrlf). */
export function sha256HexOfGitBlobAtRef(relativePath: string, gitRef = 'HEAD'): string {
  const posixPath = relativePath.replace(/\\/g, '/');
  let buf: Buffer;
  try {
    buf = execSync(`git show ${gitRef}:${posixPath}`, {
      encoding: 'buffer',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }) as Buffer;
  } catch {
    throw new HarnessExecutionForbiddenError(
      `git show ${gitRef}:${posixPath} falhou; digest canônico exige repositório git.`,
    );
  }
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
    envelope_digest_sha256: sha256HexOfGitBlobAtRef(envelope_relative_path),
    allowlist_digest_sha256: sha256HexOfGitBlobAtRef(allowlist_relative_path),
    peak_concurrent_users: peak,
    target_mean_rps,
  };
}
