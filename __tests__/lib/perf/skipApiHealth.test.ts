import {
  API_HEALTH_BUDGET_MS,
  API_HEALTH_SCENARIO_NAME,
  API_HEALTH_SKIP_REASON,
  assertApiHealthNotSilentlySkipped,
  isPerfSkipApiHealthEnabled,
  selectHttpScenarios,
} from '@/lib/perf/skipApiHealth';

const ALL_SCENARIOS = [
  { name: 'api_vitrine_unauth', budgetMs: 480 },
  { name: API_HEALTH_SCENARIO_NAME, budgetMs: API_HEALTH_BUDGET_MS },
  { name: 'api_metrics', budgetMs: 700 },
];

describe('skipApiHealth', () => {
  it('inclui api_health por default (flag ausente, vazia, 0 ou true)', () => {
    for (const env of [
      {},
      { PERF_SKIP_API_HEALTH: '' },
      { PERF_SKIP_API_HEALTH: '0' },
      { PERF_SKIP_API_HEALTH: 'true' },
      { PERF_SKIP_API_HEALTH: 'yes' },
    ]) {
      expect(isPerfSkipApiHealthEnabled(env)).toBe(false);
      const selected = selectHttpScenarios(ALL_SCENARIOS, env);
      expect(selected.scenarios.map((s) => s.name)).toContain(API_HEALTH_SCENARIO_NAME);
      expect(selected.skippedScenarios).toEqual([]);
      const health = selected.scenarios.find((s) => s.name === API_HEALTH_SCENARIO_NAME);
      expect(health?.budgetMs).toBe(700);
    }
  });

  it('exclui api_health só com PERF_SKIP_API_HEALTH=1 e registra skippedScenarios', () => {
    const env = { PERF_SKIP_API_HEALTH: '1' };
    expect(isPerfSkipApiHealthEnabled(env)).toBe(true);
    const selected = selectHttpScenarios(ALL_SCENARIOS, env);
    expect(selected.scenarios.map((s) => s.name)).not.toContain(API_HEALTH_SCENARIO_NAME);
    expect(selected.scenarios.map((s) => s.name)).toEqual(['api_vitrine_unauth', 'api_metrics']);
    expect(selected.skippedScenarios).toEqual([
      { name: API_HEALTH_SCENARIO_NAME, reason: API_HEALTH_SKIP_REASON },
    ]);
  });

  it('não infere skip pela URL placeholder do Supabase', () => {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://ci-build-placeholder.supabase.co',
    };
    const selected = selectHttpScenarios(ALL_SCENARIOS, env);
    expect(selected.scenarios.map((s) => s.name)).toContain(API_HEALTH_SCENARIO_NAME);
    expect(selected.skippedScenarios).toEqual([]);
  });

  it('rejeita skip silencioso (ausente em results e em skippedScenarios)', () => {
    expect(() =>
      assertApiHealthNotSilentlySkipped({
        skipHttp: false,
        ranNames: ['api_vitrine_unauth', 'synthetic_10k_pipeline'],
        skippedScenarios: [],
      }),
    ).toThrow(/silent skip is forbidden/i);
  });

  it('aceita execução default e skip explícito com razão canônica', () => {
    expect(() =>
      assertApiHealthNotSilentlySkipped({
        skipHttp: false,
        ranNames: [API_HEALTH_SCENARIO_NAME, 'api_metrics'],
        skippedScenarios: [],
      }),
    ).not.toThrow();

    expect(() =>
      assertApiHealthNotSilentlySkipped({
        skipHttp: false,
        ranNames: ['api_metrics'],
        skippedScenarios: [{ name: API_HEALTH_SCENARIO_NAME, reason: API_HEALTH_SKIP_REASON }],
      }),
    ).not.toThrow();
  });

  it('PERF_SKIP_HTTP=1 não exige skippedScenarios de api_health', () => {
    expect(() =>
      assertApiHealthNotSilentlySkipped({
        skipHttp: true,
        ranNames: ['synthetic_10k_pipeline'],
        skippedScenarios: [],
      }),
    ).not.toThrow();
  });
});
