#!/usr/bin/env tsx
/**
 * perf:smoke contra staging — carrega .env.staging.local e delega para perf-smoke.ts
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

import { assertPerfTargetConfigured, loadPerfEnv, resolvePerfBaseUrl } from '@/lib/perf/loadPerfEnv';

const envMeta = loadPerfEnv('staging');
const { baseUrl } = resolvePerfBaseUrl();
assertPerfTargetConfigured('staging', baseUrl);

const result = spawnSync('npm', ['run', 'perf:smoke'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PERF_TARGET: 'staging',
    PERF_BASE_URL: baseUrl,
    PERF_BUDGET_BASELINE_FILE:
      process.env.PERF_BUDGET_BASELINE_FILE ?? 'docs/perf-smoke-baseline-staging.json',
    PERF_REPORT_OUTPUT:
      process.env.PERF_REPORT_OUTPUT ?? 'artifacts/perf-smoke-baseline-staging-report.json',
  },
  shell: true,
  cwd: process.cwd(),
});

console.log(`[perf:smoke:staging] target=staging baseUrl=${baseUrl} env=${envMeta.loadedFiles.join(', ')}`);
process.exit(result.status ?? 1);
