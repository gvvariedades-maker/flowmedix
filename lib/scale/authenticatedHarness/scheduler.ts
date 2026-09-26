import type { HarnessOperationStep } from '@/lib/scale/authenticatedHarness/types';

export type HarnessSchedulerConfig = {
  virtual_users: number;
  requests_per_active_user_per_minute: number;
  interval_ms_per_request: number;
  selection: 'weighted_random';
  weights: Array<{ operation_id: string; request_weight: number }>;
};

export function buildSchedulerConfig(options: {
  virtualUsers: number;
  requestsPerMinutePerUser: number;
  measuredOperations: HarnessOperationStep[];
}): HarnessSchedulerConfig {
  const intervalMs = options.requestsPerMinutePerUser > 0
    ? Math.round(60_000 / options.requestsPerMinutePerUser)
    : 60_000;

  return {
    virtual_users: options.virtualUsers,
    requests_per_active_user_per_minute: options.requestsPerMinutePerUser,
    interval_ms_per_request: intervalMs,
    selection: 'weighted_random',
    weights: options.measuredOperations.map((o) => ({
      operation_id: o.operation_id,
      request_weight: o.request_weight,
    })),
  };
}

/** Escolhe operação por peso (soma request_weight). */
export function pickWeightedOperation(
  operations: HarnessOperationStep[],
  random: () => number = Math.random,
): HarnessOperationStep {
  const total = operations.reduce((acc, o) => acc + o.request_weight, 0);
  let r = random() * total;
  for (const op of operations) {
    r -= op.request_weight;
    if (r <= 0) return op;
  }
  return operations[operations.length - 1];
}
