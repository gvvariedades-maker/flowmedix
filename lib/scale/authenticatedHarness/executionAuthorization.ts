import type { ApprovedStagingTarget } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import { assertPoolBoundToApprovedStaging } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import type { CanonicalArtifactBinding } from '@/lib/scale/authenticatedHarness/canonicalArtifacts';
import { assertGitWorktreeClean } from '@/lib/scale/authenticatedHarness/gitExecutionBinding';
import { HarnessExecutionForbiddenError } from '@/lib/scale/authenticatedHarness/harnessForbidden';
import type { ConcurrencyTierId } from '@/lib/scale/workloadEnvelope';
import type { HarnessExecutionPlan, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

export { HarnessExecutionForbiddenError };

export type HarnessLoadTestScope = {
  authorized_git_sha: string;
  tier: ConcurrencyTierId;
  app_host: string;
  supabase_host: string | null;
  duration_ms: number;
  envelope_version: string;
  envelope_digest_sha256: string;
  allowlist_digest_sha256: string;
  peak_concurrent_users: number;
  target_mean_rps: number;
};

export type HarnessExecutionGate = {
  cliExecuteFlag: boolean;
  harnessExecuteEnv: string | undefined;
  loadTestAuthorizedEnv: string | undefined;
};

const TIERS: ConcurrencyTierId[] = ['conservative', 'nominal', 'stress'];

function parsePositiveInt(name: string, raw: string | undefined): number {
  const n = Number(raw?.trim());
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
    throw new HarnessExecutionForbiddenError(`${name} inválido`);
  }
  return n;
}

function parsePositiveNumber(name: string, raw: string | undefined): number {
  const n = Number(raw?.trim());
  if (!Number.isFinite(n) || n <= 0) {
    throw new HarnessExecutionForbiddenError(`${name} inválido`);
  }
  return n;
}

export function parseLoadTestScopeFromEnv(env: NodeJS.ProcessEnv): HarnessLoadTestScope {
  const sha = env.SCALE_HARNESS_AUTHORIZED_GIT_SHA?.trim();
  const tier = env.SCALE_HARNESS_AUTHORIZED_TIER?.trim() as ConcurrencyTierId;
  const appHost = env.SCALE_HARNESS_AUTHORIZED_APP_HOST?.trim().toLowerCase();
  const supabaseHost = env.SCALE_HARNESS_AUTHORIZED_SUPABASE_HOST?.trim().toLowerCase() || null;
  const durationRaw = env.SCALE_HARNESS_AUTHORIZED_DURATION_MS?.trim();
  const envelopeVersion = env.SCALE_HARNESS_AUTHORIZED_ENVELOPE_VERSION?.trim();
  const envelopeDigest = env.SCALE_HARNESS_AUTHORIZED_ENVELOPE_SHA256?.trim().toLowerCase();
  const allowlistDigest = env.SCALE_HARNESS_AUTHORIZED_ALLOWLIST_SHA256?.trim().toLowerCase();

  if (!sha) throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_GIT_SHA obrigatório');
  if (!tier || !TIERS.includes(tier)) {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_TIER inválido (conservative|nominal|stress)');
  }
  if (!appHost) throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_APP_HOST obrigatório');
  const duration_ms = Number(durationRaw);
  if (!Number.isFinite(duration_ms) || duration_ms <= 0) {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_DURATION_MS inválido');
  }
  if (!envelopeVersion) {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_ENVELOPE_VERSION obrigatório');
  }
  if (!envelopeDigest || envelopeDigest.length !== 64) {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_ENVELOPE_SHA256 obrigatório (64 hex)');
  }
  if (!allowlistDigest || allowlistDigest.length !== 64) {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_ALLOWLIST_SHA256 obrigatório (64 hex)');
  }
  const peak_concurrent_users = parsePositiveInt(
    'SCALE_HARNESS_AUTHORIZED_PEAK_CCU',
    env.SCALE_HARNESS_AUTHORIZED_PEAK_CCU,
  );
  const target_mean_rps = parsePositiveNumber(
    'SCALE_HARNESS_AUTHORIZED_TARGET_MEAN_RPS',
    env.SCALE_HARNESS_AUTHORIZED_TARGET_MEAN_RPS,
  );

  return {
    authorized_git_sha: sha,
    tier,
    app_host: appHost,
    supabase_host: supabaseHost,
    duration_ms,
    envelope_version: envelopeVersion,
    envelope_digest_sha256: envelopeDigest,
    allowlist_digest_sha256: allowlistDigest,
    peak_concurrent_users,
    target_mean_rps,
  };
}

export function assertHarnessExecutionGate(gate: HarnessExecutionGate): void {
  if (!gate.cliExecuteFlag) {
    throw new HarnessExecutionForbiddenError('Execução não solicitada (--execute).');
  }
  if (gate.harnessExecuteEnv !== '1') {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_EXECUTE=1 obrigatório.');
  }
  if (gate.loadTestAuthorizedEnv !== '1') {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_LOAD_TEST_AUTHORIZED≠1.');
  }
}

export function assertScopeMatchesCanonicalArtifacts(
  scope: HarnessLoadTestScope,
  canonical: CanonicalArtifactBinding,
  plan: HarnessExecutionPlan,
): void {
  if (scope.envelope_version !== canonical.envelope_version) {
    throw new HarnessExecutionForbiddenError(
      `envelope_version autorizado (${scope.envelope_version}) ≠ canônico (${canonical.envelope_version})`,
    );
  }
  if (scope.envelope_digest_sha256 !== canonical.envelope_digest_sha256) {
    throw new HarnessExecutionForbiddenError('envelope_digest_sha256 ≠ envelope versionado');
  }
  if (scope.allowlist_digest_sha256 !== canonical.allowlist_digest_sha256) {
    throw new HarnessExecutionForbiddenError('allowlist_digest_sha256 ≠ allowlist versionada');
  }
  if (scope.peak_concurrent_users !== canonical.peak_concurrent_users) {
    throw new HarnessExecutionForbiddenError(
      `peak CCU autorizado (${scope.peak_concurrent_users}) ≠ canônico (${canonical.peak_concurrent_users})`,
    );
  }
  if (Math.abs(scope.target_mean_rps - canonical.target_mean_rps) > 0.0001) {
    throw new HarnessExecutionForbiddenError(
      `target_mean_rps autorizado (${scope.target_mean_rps}) ≠ canônico (${canonical.target_mean_rps})`,
    );
  }
  if (plan.peak_concurrent_users !== canonical.peak_concurrent_users) {
    throw new HarnessExecutionForbiddenError('plan.peak_concurrent_users ≠ envelope canônico');
  }
  if (Math.abs(plan.target_mean_rps - canonical.target_mean_rps) > 0.0001) {
    throw new HarnessExecutionForbiddenError('plan.target_mean_rps ≠ envelope canônico');
  }
  if (plan.envelope_version !== canonical.envelope_version) {
    throw new HarnessExecutionForbiddenError('plan.envelope_version ≠ envelope canônico');
  }
}

export function assertScopeMatchesRun(
  scope: HarnessLoadTestScope,
  options: {
    runtimeGitSha: string;
    cliTier: ConcurrencyTierId;
    durationMs: number;
    plan: HarnessExecutionPlan;
    pool: SyntheticUserPoolFile;
    approved: ApprovedStagingTarget;
    canonical: CanonicalArtifactBinding;
    gitWorktreePorcelain?: string;
  },
): void {
  if (options.gitWorktreePorcelain !== undefined) {
    assertGitWorktreeClean(options.gitWorktreePorcelain);
  }

  if (scope.authorized_git_sha !== options.runtimeGitSha) {
    throw new HarnessExecutionForbiddenError(
      `SHA autorizado (${scope.authorized_git_sha}) ≠ runtime (${options.runtimeGitSha})`,
    );
  }
  if (scope.tier !== options.cliTier || scope.tier !== options.plan.tier) {
    throw new HarnessExecutionForbiddenError(
      `tier autorizado (${scope.tier}) ≠ execução (${options.cliTier})`,
    );
  }
  if (scope.duration_ms !== options.durationMs) {
    throw new HarnessExecutionForbiddenError(
      `duration autorizada (${scope.duration_ms}) ≠ execução (${options.durationMs})`,
    );
  }

  assertScopeMatchesCanonicalArtifacts(scope, options.canonical, options.plan);

  assertPoolBoundToApprovedStaging(options.pool, options.approved);

  let poolAppHost: string;
  try {
    poolAppHost = new URL(options.pool.base_url).hostname.toLowerCase();
  } catch {
    throw new HarnessExecutionForbiddenError('base_url inválida no pool');
  }
  if (scope.app_host !== poolAppHost) {
    throw new HarnessExecutionForbiddenError(
      `app host autorizado (${scope.app_host}) ≠ pool (${poolAppHost})`,
    );
  }

  if (options.pool.supabase_url?.trim()) {
    let poolSupabaseHost: string;
    try {
      poolSupabaseHost = new URL(options.pool.supabase_url).hostname.toLowerCase();
    } catch {
      throw new HarnessExecutionForbiddenError('supabase_url inválida no pool');
    }
    if (!scope.supabase_host || scope.supabase_host !== poolSupabaseHost) {
      throw new HarnessExecutionForbiddenError(
        `supabase host autorizado (${scope.supabase_host ?? 'ausente'}) ≠ pool (${poolSupabaseHost})`,
      );
    }
  }
}

export type HarnessAuthorizedExecutionContext = {
  scope: HarnessLoadTestScope;
  approved: ApprovedStagingTarget;
  canonical: CanonicalArtifactBinding;
};

export function buildAuthorizedExecutionContext(options: {
  gate: HarnessExecutionGate;
  env: NodeJS.ProcessEnv;
  runtimeGitSha: string;
  cliTier: ConcurrencyTierId;
  durationMs: number;
  plan: HarnessExecutionPlan;
  pool: SyntheticUserPoolFile;
  approved: ApprovedStagingTarget;
  canonical: CanonicalArtifactBinding;
  gitWorktreePorcelain?: string;
}): HarnessAuthorizedExecutionContext {
  assertHarnessExecutionGate(options.gate);
  const scope = parseLoadTestScopeFromEnv(options.env);
  assertScopeMatchesRun(scope, {
    runtimeGitSha: options.runtimeGitSha,
    cliTier: options.cliTier,
    durationMs: options.durationMs,
    plan: options.plan,
    pool: options.pool,
    approved: options.approved,
    canonical: options.canonical,
    gitWorktreePorcelain: options.gitWorktreePorcelain,
  });
  return { scope, approved: options.approved, canonical: options.canonical };
}
