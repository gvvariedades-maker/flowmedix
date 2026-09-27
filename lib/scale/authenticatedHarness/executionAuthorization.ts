import type { ApprovedStagingTarget } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import { assertPoolBoundToApprovedStaging } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import type { ConcurrencyTierId } from '@/lib/scale/workloadEnvelope';
import type { HarnessExecutionPlan, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

export type HarnessLoadTestScope = {
  authorized_git_sha: string;
  tier: ConcurrencyTierId;
  app_host: string;
  supabase_host: string | null;
  duration_ms: number;
};

export type HarnessExecutionGate = {
  cliExecuteFlag: boolean;
  harnessExecuteEnv: string | undefined;
  loadTestAuthorizedEnv: string | undefined;
};

export class HarnessExecutionForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HarnessExecutionForbiddenError';
  }
}

const TIERS: ConcurrencyTierId[] = ['conservative', 'nominal', 'stress'];

export function parseLoadTestScopeFromEnv(env: NodeJS.ProcessEnv): HarnessLoadTestScope {
  const sha = env.SCALE_HARNESS_AUTHORIZED_GIT_SHA?.trim();
  const tier = env.SCALE_HARNESS_AUTHORIZED_TIER?.trim() as ConcurrencyTierId;
  const appHost = env.SCALE_HARNESS_AUTHORIZED_APP_HOST?.trim().toLowerCase();
  const supabaseHost = env.SCALE_HARNESS_AUTHORIZED_SUPABASE_HOST?.trim().toLowerCase() || null;
  const durationRaw = env.SCALE_HARNESS_AUTHORIZED_DURATION_MS?.trim();

  if (!sha) throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_GIT_SHA obrigatório');
  if (!tier || !TIERS.includes(tier)) {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_TIER inválido (conservative|nominal|stress)');
  }
  if (!appHost) throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_APP_HOST obrigatório');
  const duration_ms = Number(durationRaw);
  if (!Number.isFinite(duration_ms) || duration_ms <= 0) {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_AUTHORIZED_DURATION_MS inválido');
  }

  return {
    authorized_git_sha: sha,
    tier,
    app_host: appHost,
    supabase_host: supabaseHost,
    duration_ms,
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

export function assertScopeMatchesRun(
  scope: HarnessLoadTestScope,
  options: {
    runtimeGitSha: string;
    cliTier: ConcurrencyTierId;
    durationMs: number;
    plan: HarnessExecutionPlan;
    pool: SyntheticUserPoolFile;
    approved: ApprovedStagingTarget;
  },
): void {
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
  });
  return { scope, approved: options.approved };
}
