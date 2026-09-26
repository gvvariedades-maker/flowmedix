import {
  estimateMeanRps,
  getTierPeakCcu,
  loadWorkloadEnvelope,
  type ConcurrencyTierId,
  type EnvelopeOperation,
} from '@/lib/scale/workloadEnvelope';
import {
  mapAuthToHarnessMode,
  type HarnessExecutionPlan,
  type HarnessOperationStep,
  type SyntheticUserPoolFile,
} from '@/lib/scale/authenticatedHarness/types';

function toHarnessStep(op: EnvelopeOperation, phase: 'setup' | 'measured'): HarnessOperationStep {
  return {
    operation_id: op.id,
    phase,
    auth: mapAuthToHarnessMode(op),
    method: op.method ?? op.http_method_typical ?? 'GET',
    path: op.path ?? op.surface ?? op.id,
    request_weight: op.request_weight,
    kind: op.kind,
  };
}

function journeyMixNumbers(envelope: ReturnType<typeof loadWorkloadEnvelope>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(envelope.journey_mix)) {
    if (key === 'description') continue;
    if (typeof value === 'number') out[key] = value;
  }
  return out;
}

export function buildHarnessExecutionPlan(options: {
  tier: ConcurrencyTierId;
  pool: SyntheticUserPoolFile;
  envelopePath?: string;
}): HarnessExecutionPlan {
  const envelope = loadWorkloadEnvelope(options.envelopePath);
  const peakCcu = getTierPeakCcu(envelope, options.tier);
  const setupSpecs = envelope.simulado_harness_phases?.baseline_v1?.setup_outside_measured_window ?? [];
  const setupIds = new Set(setupSpecs.map((s) => s.id));

  const setup_steps: HarnessOperationStep[] = setupSpecs.map((spec) => ({
    operation_id: spec.id,
    phase: 'setup',
    auth: spec.auth === 'Bearer' ? 'bearer' : 'bearer',
    method: spec.method,
    path: spec.path,
    request_weight: 0,
    kind: 'write',
  }));

  const measured_operations = envelope.authenticated_operations.operations
    .filter((op) => !setupIds.has(op.id))
    .map((op) => toHarnessStep(op, 'measured'));

  return {
    envelope_version: envelope.version,
    envelope_status: envelope.status,
    tier: options.tier,
    peak_concurrent_users: peakCcu,
    target_mean_rps: estimateMeanRps(envelope, peakCcu),
    generator_requests_per_active_user_per_minute:
      envelope.traffic_model.load_generator.generator_target_requests_per_active_user_per_minute,
    pool_size: options.pool.users.length,
    setup_steps,
    measured_operations,
    journey_mix: journeyMixNumbers(envelope),
    load_test_execution: 'forbidden',
  };
}
