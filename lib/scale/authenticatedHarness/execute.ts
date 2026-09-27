import {
  assertPoolBoundToApprovedStaging,
  type ApprovedStagingTarget,
} from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import {
  buildAuthorizedExecutionContext,
  type HarnessAuthorizedExecutionContext,
  type HarnessExecutionGate,
  HarnessExecutionForbiddenError,
} from '@/lib/scale/authenticatedHarness/executionAuthorization';
import {
  executeHarnessMeasuredWindowInternal,
  type HttpExecutorResult,
} from '@/lib/scale/authenticatedHarness/executeInternal';
import type { FetchLike } from '@/lib/scale/authenticatedHarness/httpExecute';
import type { ConcurrencyTierId } from '@/lib/scale/workloadEnvelope';
import type { HarnessExecutionPlan, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

export {
  HarnessExecutionForbiddenError,
  type HarnessExecutionGate,
  type HarnessLoadTestScope,
  parseLoadTestScopeFromEnv,
  assertScopeMatchesRun,
  assertHarnessExecutionGate,
} from '@/lib/scale/authenticatedHarness/executionAuthorization';

export type { HttpExecutorResult };

/**
 * Único entrypoint público para HTTP de carga — exige contexto autorizado (gate + escopo + target).
 */
export async function runHarnessMeasuredWindowAuthorized(
  auth: HarnessAuthorizedExecutionContext,
  plan: HarnessExecutionPlan,
  pool: SyntheticUserPoolFile,
  options: { durationMs: number; fetchImpl?: FetchLike },
): Promise<HttpExecutorResult> {
  assertPoolBoundToApprovedStaging(pool, auth.approved);
  if (options.durationMs !== auth.scope.duration_ms) {
    throw new HarnessExecutionForbiddenError(
      `duration_ms (${options.durationMs}) ≠ escopo autorizado (${auth.scope.duration_ms})`,
    );
  }
  if (plan.tier !== auth.scope.tier) {
    throw new HarnessExecutionForbiddenError(`plan.tier (${plan.tier}) ≠ escopo (${auth.scope.tier})`);
  }
  return executeHarnessMeasuredWindowInternal(plan, pool, options);
}

export function createAuthorizedExecutionContext(options: {
  gate: HarnessExecutionGate;
  env: NodeJS.ProcessEnv;
  runtimeGitSha: string;
  cliTier: ConcurrencyTierId;
  durationMs: number;
  plan: HarnessExecutionPlan;
  pool: SyntheticUserPoolFile;
  approved: ApprovedStagingTarget;
}): HarnessAuthorizedExecutionContext {
  return buildAuthorizedExecutionContext(options);
}

/** @deprecated Não exportar para novos callers — dispara erro se usado. */
export async function runHarnessMeasuredWindow(): Promise<HttpExecutorResult> {
  throw new HarnessExecutionForbiddenError(
    'runHarnessMeasuredWindow foi removido; use runHarnessMeasuredWindowAuthorized com escopo validado.',
  );
}
