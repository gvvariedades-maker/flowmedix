import { buildHarnessExecutionPlan } from '@/lib/scale/authenticatedHarness/buildPlan';
import { assertBaseUrlAllowedForHarness } from '@/lib/scale/authenticatedHarness/syntheticUserPool';
import { validateEnvelopeIntegrity } from '@/lib/scale/authenticatedHarness/validateEnvelope';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

const stubPool: SyntheticUserPoolFile = {
  schema_version: 1,
  base_url: 'http://127.0.0.1:3000',
  users: [{ pool_id: 'u1', access_token: 'token' }],
};

describe('scale authenticated harness', () => {
  it('valida integridade do envelope aprovado v1.0.3', () => {
    const report = validateEnvelopeIntegrity();
    expect(report.ok).toBe(true);
    expect(report.checks.envelope_version).toBe('1.0.3');
    expect(report.checks.envelope_status).toBe('approved');
    expect(report.checks.expansion_refs_ok).toBe(true);
    expect(report.checks.measured_refs_ok).toBe(true);
  });

  it('monta plano com setup de simulado fora da janela medida', () => {
    const plan = buildHarnessExecutionPlan({ tier: 'nominal', pool: stubPool });
    expect(plan.peak_concurrent_users).toBe(100);
    expect(plan.target_mean_rps).toBeCloseTo(10, 5);
    expect(plan.setup_steps.map((s) => s.operation_id)).toEqual(['api_simulado_sessions_create']);
    expect(plan.measured_operations.some((o) => o.operation_id === 'api_simulado_sessions')).toBe(true);
    expect(plan.journey_mix.estudar_player).toBe(0.7);
    expect(plan.load_test_execution).toBe('forbidden');
  });

  it('bloqueia base_url de Production no pool', () => {
    expect(() => assertBaseUrlAllowedForHarness('https://avant.enf.br')).toThrow(/Production/);
  });
});
