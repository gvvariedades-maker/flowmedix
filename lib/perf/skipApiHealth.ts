/**
 * Skip explícito do cenário HTTP `api_health` no perf-smoke.
 *
 * Só `PERF_SKIP_API_HEALTH=1` exclui o cenário. URL de placeholder Supabase,
 * `PERF_SKIP_HTTP` ou outros sinais de ambiente **não** implicam skip de health.
 */

export const API_HEALTH_SCENARIO_NAME = 'api_health';

export const API_HEALTH_BUDGET_MS = 700;

export const API_HEALTH_SKIP_REASON =
  'external database unavailable in CI placeholder environment';

export type SkippedScenario = {
  name: string;
  reason: string;
};

export type EnvLike = Record<string, string | undefined>;

export function isPerfSkipApiHealthEnabled(env: EnvLike = process.env): boolean {
  return env.PERF_SKIP_API_HEALTH === '1';
}

export function selectHttpScenarios<T extends { name: string }>(
  scenarios: T[],
  env: EnvLike = process.env,
): { scenarios: T[]; skippedScenarios: SkippedScenario[] } {
  if (!isPerfSkipApiHealthEnabled(env)) {
    return { scenarios: [...scenarios], skippedScenarios: [] };
  }

  const skippedScenarios: SkippedScenario[] = [];
  const kept: T[] = [];
  for (const scenario of scenarios) {
    if (scenario.name === API_HEALTH_SCENARIO_NAME) {
      skippedScenarios.push({
        name: API_HEALTH_SCENARIO_NAME,
        reason: API_HEALTH_SKIP_REASON,
      });
      continue;
    }
    kept.push(scenario);
  }
  return { scenarios: kept, skippedScenarios };
}

/**
 * Impede omitir `api_health` sem registro em `skippedScenarios`.
 * `PERF_SKIP_HTTP=1` já desliga todo o HTTP de forma explícita — não exige o item de health.
 */
export function assertApiHealthNotSilentlySkipped(input: {
  skipHttp: boolean;
  ranNames: string[];
  skippedScenarios: SkippedScenario[];
}): void {
  if (input.skipHttp) return;

  const ranHealth = input.ranNames.includes(API_HEALTH_SCENARIO_NAME);
  const skippedHealth = input.skippedScenarios.find(
    (scenario) => scenario.name === API_HEALTH_SCENARIO_NAME,
  );

  if (ranHealth && skippedHealth) {
    throw new Error('api_health cannot be both executed and listed in skippedScenarios');
  }

  if (!ranHealth && !skippedHealth) {
    throw new Error(
      'api_health was omitted without skippedScenarios (silent skip is forbidden). Set PERF_SKIP_API_HEALTH=1 to skip explicitly.',
    );
  }

  if (skippedHealth && skippedHealth.reason !== API_HEALTH_SKIP_REASON) {
    throw new Error('api_health skip must record the canonical reason');
  }
}
