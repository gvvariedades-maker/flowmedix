import {
  estimateMeanRps,
  getTierPeakCcu,
  loadWorkloadEnvelope,
  type ConcurrencyTierId,
  type EnvelopeOperation,
} from '@/lib/scale/workloadEnvelope';
import { materializeSampleForUser } from '@/lib/scale/authenticatedHarness/materializeRequest';
import { buildSchedulerConfig } from '@/lib/scale/authenticatedHarness/scheduler';
import {
  mapAuthToHarnessMode,
  type HarnessExecutionPlan,
  type HarnessOperationStep,
  type SyntheticUserPoolFile,
} from '@/lib/scale/authenticatedHarness/types';
import {
  validateAllUsersForOperations,
  validatePoolCardinality,
  validatePoolIdentityUniqueness,
} from '@/lib/scale/authenticatedHarness/validatePool';

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

  validatePoolCardinality(options.pool, peakCcu);
  validatePoolIdentityUniqueness(options.pool);

  const setupSpecs = envelope.simulado_harness_phases?.baseline_v1?.setup_outside_measured_window ?? [];
  const setupIds = new Set(setupSpecs.map((s) => s.id));

  const setup_steps: HarnessOperationStep[] = setupSpecs.map((spec) => ({
    operation_id: spec.id,
    phase: 'setup',
    auth: 'bearer',
    method: spec.method,
    path: spec.path,
    request_weight: 0,
    kind: 'write',
  }));

  const measured_operations = envelope.authenticated_operations.operations
    .filter((op) => !setupIds.has(op.id))
    .map((op) => toHarnessStep(op, 'measured'));

  validateAllUsersForOperations(
    options.pool,
    measured_operations,
    setup_steps.map((s) => s.operation_id),
  );

  const rpm =
    envelope.traffic_model.load_generator.generator_target_requests_per_active_user_per_minute;

  const sampleUser = options.pool.users[0];
  const materialized_sample = materializeSampleForUser(
    setup_steps,
    measured_operations,
    options.pool,
    sampleUser,
  );

  return {
    envelope_version: envelope.version,
    envelope_status: envelope.status,
    tier: options.tier,
    peak_concurrent_users: peakCcu,
    target_mean_rps: estimateMeanRps(envelope, peakCcu),
    generator_requests_per_active_user_per_minute: rpm,
    pool_size: options.pool.users.length,
    setup_steps,
    measured_operations,
    journey_mix: journeyMixNumbers(envelope),
    scheduler: buildSchedulerConfig({
      virtualUsers: peakCcu,
      requestsPerMinutePerUser: rpm,
      measuredOperations: measured_operations,
    }),
    materialized_sample,
    readiness: {
      HARNESS_VALIDATOR: 'IMPLEMENTED',
      HARNESS_PLANNER: 'IMPLEMENTED',
      HARNESS_HTTP_EXECUTOR: 'IMPLEMENTED_BLOCKED_BY_POLICY',
      HARNESS_AUTHENTICATED: 'IMPLEMENTATION_IN_PROGRESS',
    },
  };
}
