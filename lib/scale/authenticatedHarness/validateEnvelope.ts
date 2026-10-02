import {
  getExpansionOperationIds,
  listMeasuredOperationIds,
  loadWorkloadEnvelope,
  type WorkloadEnvelopeV1,
} from '@/lib/scale/workloadEnvelope';

export type EnvelopeIntegrityReport = {
  ok: boolean;
  errors: string[];
  checks: Record<string, boolean | number | string>;
};

function sumJourneyMix(envelope: WorkloadEnvelopeV1): number {
  let total = 0;
  for (const [key, value] of Object.entries(envelope.journey_mix)) {
    if (key === 'description') continue;
    if (typeof value === 'number') total += value;
  }
  return total;
}

function sumExpansionWeights(envelope: WorkloadEnvelopeV1): number {
  let total = 0;
  for (const [key, block] of Object.entries(envelope.journey_to_http_expansion)) {
    if (key === 'description' || typeof block === 'string') continue;
    for (const w of Object.values(block)) total += w;
  }
  return total;
}

function sumRequestWeights(envelope: WorkloadEnvelopeV1): number {
  return envelope.authenticated_operations.operations.reduce((acc, op) => acc + op.request_weight, 0);
}

export function validateEnvelopeIntegrity(pathFromEnv?: string): EnvelopeIntegrityReport {
  const envelope = loadWorkloadEnvelope(pathFromEnv);
  const errors: string[] = [];
  const opIds = new Set(envelope.authenticated_operations.operations.map((o) => o.id));
  const expansionIds = getExpansionOperationIds(envelope);
  const measuredIds =
    envelope.simulado_harness_phases?.baseline_v1?.measured_steady_state ?? [];

  for (const id of expansionIds) {
    if (!opIds.has(id)) errors.push(`journey_to_http_expansion referencia operação ausente: ${id}`);
  }
  for (const id of measuredIds) {
    if (!opIds.has(id)) errors.push(`measured_steady_state referencia operação ausente: ${id}`);
  }

  const journeyTotal = sumJourneyMix(envelope);
  const expansionTotal = sumExpansionWeights(envelope);
  const requestTotal = sumRequestWeights(envelope);

  if (Math.abs(journeyTotal - 1) > 0.0001) {
    errors.push(`journey_mix soma ${journeyTotal}, esperado 1.0`);
  }
  if (Math.abs(expansionTotal - 1) > 0.0001) {
    errors.push(`journey_to_http_expansion soma ${expansionTotal}, esperado 1.0`);
  }
  if (Math.abs(requestTotal - 1) > 0.0001) {
    errors.push(`request_weight soma ${requestTotal}, esperado 1.0`);
  }

  if (envelope.owner_signoff_required && !envelope.owner_signoff) {
    errors.push('owner_signoff_required mas owner_signoff ausente');
  }

  const measuredOps = listMeasuredOperationIds(envelope);
  const reads = measuredOps.reduce((acc, o) => acc + (o.kind === 'read' ? o.request_weight : 0), 0);
  const writes = measuredOps.reduce((acc, o) => acc + (o.kind === 'write' ? o.request_weight : 0), 0);

  return {
    ok: errors.length === 0,
    errors,
    checks: {
      envelope_version: envelope.version,
      envelope_status: envelope.status,
      journey_mix_total: journeyTotal,
      expansion_total: expansionTotal,
      request_weight_total: requestTotal,
      application_reads: reads,
      application_writes: writes,
      expansion_refs_ok: expansionIds.every((id) => opIds.has(id)),
      measured_refs_ok: measuredIds.every((id) => opIds.has(id)),
    },
  };
}
