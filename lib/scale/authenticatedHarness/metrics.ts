export type OperationMetricBucket = {
  operation_id: string;
  kind: 'read' | 'write' | 'setup';
  requests: number;
  successes: number;
  failures: number;
  status_counts: Record<string, number>;
  latency_ms_samples: number[];
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  max_ms: number;
};

export type HarnessRunMetricsReport = {
  phase: 'setup' | 'measured' | 'combined';
  elapsed_ms: number;
  target_mean_rps: number;
  achieved_mean_rps: number;
  setup_failures: number;
  operations: OperationMetricBucket[];
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.max(0, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function finalizeBucket(bucket: OperationMetricBucket): OperationMetricBucket {
  const sorted = [...bucket.latency_ms_samples].sort((a, b) => a - b);
  return {
    ...bucket,
    p50_ms: percentile(sorted, 50),
    p95_ms: percentile(sorted, 95),
    p99_ms: percentile(sorted, 99),
    max_ms: sorted.length ? sorted[sorted.length - 1] : 0,
  };
}

export class HarnessMetricsCollector {
  private setupFailures = 0;
  private buckets = new Map<string, OperationMetricBucket>();

  private getBucket(operationId: string, kind: 'read' | 'write' | 'setup'): OperationMetricBucket {
    const key = `${kind}:${operationId}`;
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        operation_id: operationId,
        kind,
        requests: 0,
        successes: 0,
        failures: 0,
        status_counts: {},
        latency_ms_samples: [],
        p50_ms: 0,
        p95_ms: 0,
        p99_ms: 0,
        max_ms: 0,
      };
      this.buckets.set(key, bucket);
    }
    return bucket;
  }

  recordSetupFailure(): void {
    this.setupFailures += 1;
  }

  recordRequest(
    phase: 'setup' | 'measured',
    operationId: string,
    kind: 'read' | 'write',
    status: number,
    latencyMs: number,
    success: boolean,
  ): void {
    const bucketKind = phase === 'setup' ? 'setup' : kind;
    const bucket = this.getBucket(operationId, bucketKind);
    bucket.requests += 1;
    const statusKey = String(status);
    bucket.status_counts[statusKey] = (bucket.status_counts[statusKey] ?? 0) + 1;
    bucket.latency_ms_samples.push(latencyMs);
    if (success) bucket.successes += 1;
    else bucket.failures += 1;
  }

  buildReport(options: {
    phase: 'setup' | 'measured' | 'combined';
    elapsedMs: number;
    targetMeanRps: number;
    httpRequestsSent: number;
  }): HarnessRunMetricsReport {
    const achieved =
      options.elapsedMs > 0 ? options.httpRequestsSent / (options.elapsedMs / 1000) : 0;
    const operations = [...this.buckets.values()].map((b) => finalizeBucket({ ...b }));
    return {
      phase: options.phase,
      elapsed_ms: options.elapsedMs,
      target_mean_rps: options.targetMeanRps,
      achieved_mean_rps: achieved,
      setup_failures: this.setupFailures,
      operations,
    };
  }
}
