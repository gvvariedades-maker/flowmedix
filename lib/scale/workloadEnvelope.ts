import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const DEFAULT_ENVELOPE_RELATIVE_PATH = 'docs/scale-1k-workload-envelope.v1.json';

export type ConcurrencyTierId = 'conservative' | 'nominal' | 'stress';

export type EnvelopeOperation = {
  id: string;
  journey: string;
  request_weight: number;
  kind: 'read' | 'write';
  method?: string;
  http_method_typical?: string;
  path?: string;
  auth?: string;
  execution_phase?: 'setup' | 'measured';
  surface?: string;
  notes?: string;
};

export type WorkloadEnvelopeV1 = {
  version: string;
  status: string;
  owner_signoff_required: boolean;
  owner_signoff?: {
    approved_at: string;
    approved_by: string;
    envelope_version: string;
    git_sha: string;
    statement: string;
    load_test_authorized: boolean;
    production_authorized: boolean;
  };
  journey_mix: Record<string, number | string>;
  journey_to_http_expansion: Record<string, Record<string, number> | string>;
  authenticated_operations: {
    operations: EnvelopeOperation[];
  };
  simulado_harness_phases?: {
    baseline_v1?: {
      setup_outside_measured_window?: Array<{
        id: string;
        method: string;
        path: string;
        execution_phase: string;
        auth: string;
      }>;
      measured_steady_state?: string[];
    };
  };
  concurrency_tiers: Record<
    ConcurrencyTierId,
    { peak_concurrent_users: number; label?: string; description?: string }
  >;
  traffic_model: {
    load_generator: {
      generator_target_requests_per_active_user_per_minute: number;
    };
  };
};

export function resolveEnvelopePath(pathFromEnv?: string): string {
  const rel = pathFromEnv?.trim() || DEFAULT_ENVELOPE_RELATIVE_PATH;
  return resolve(process.cwd(), rel);
}

export function loadWorkloadEnvelope(pathFromEnv?: string): WorkloadEnvelopeV1 {
  const absolute = resolveEnvelopePath(pathFromEnv);
  const raw = readFileSync(absolute, 'utf8');
  return JSON.parse(raw) as WorkloadEnvelopeV1;
}

export function listMeasuredOperationIds(envelope: WorkloadEnvelopeV1): EnvelopeOperation[] {
  const setupIds = new Set(
    envelope.simulado_harness_phases?.baseline_v1?.setup_outside_measured_window?.map((s) => s.id) ??
      [],
  );
  return envelope.authenticated_operations.operations.filter((op) => !setupIds.has(op.id));
}

export function getExpansionOperationIds(envelope: WorkloadEnvelopeV1): string[] {
  const ids: string[] = [];
  for (const [key, value] of Object.entries(envelope.journey_to_http_expansion)) {
    if (key === 'description' || typeof value === 'string') continue;
    for (const opId of Object.keys(value)) {
      ids.push(opId);
    }
  }
  return ids;
}

export function getTierPeakCcu(envelope: WorkloadEnvelopeV1, tier: ConcurrencyTierId): number {
  const row = envelope.concurrency_tiers[tier];
  if (!row?.peak_concurrent_users) {
    throw new Error(`concurrency_tiers.${tier} ausente no envelope`);
  }
  return row.peak_concurrent_users;
}

export function estimateMeanRps(envelope: WorkloadEnvelopeV1, peakCcu: number): number {
  const perMin = envelope.traffic_model.load_generator.generator_target_requests_per_active_user_per_minute;
  return (peakCcu * perMin) / 60;
}
