#!/usr/bin/env tsx
/**
 * Local perf smoke with sanitized child env — no E2E bypass leakage from parent shell.
 * CI job (.github/workflows/test.yml) unchanged; use `npm run perf:smoke` there.
 */
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { assertPortFree } from '@/lib/harness/assertPortFree';
import { CI_HARNESS_METRICS_SECRET } from '@/lib/harness/ciPlaceholders';
import {
  applyCiBuildPlaceholderEnv,
  perfLocalPortFromEnv,
  propagateChildExitCode,
  waitForHealth,
} from '@/lib/e2e/localRunnerEnv';
import {
  readHarnessEnvPresence,
  sanitizeHarnessEnv,
} from '@/lib/perf/sanitizeHarnessEnv';

const nodeBin = process.execPath;
const cwd = process.cwd();

function buildChildEnv(port: number, baseUrl: string): NodeJS.ProcessEnv {
  const sanitized = sanitizeHarnessEnv(process.env);
  const withPlaceholders = applyCiBuildPlaceholderEnv(sanitized, baseUrl, port);
  return {
    ...withPlaceholders,
    PERF_BASELINE_ENV: 'ci',
  };
}

function runSync(command: string, args: string[], env: NodeJS.ProcessEnv): number {
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status ?? 1;
}

function killProcessTree(child: ChildProcess | null): void {
  if (!child?.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill('SIGTERM');
    }
  }
}

/** Async child — event loop stays free so server `exit` is observed during long runs. */
function runPerfSmokeAsync(env: NodeJS.ProcessEnv, server: ChildProcess): Promise<number> {
  return new Promise((resolvePerf) => {
    let serverDiedUnexpectedly = false;
    let perfFinished = false;
    let perf: ChildProcess | undefined;

    const onServerExit = () => {
      if (perfFinished) return;
      serverDiedUnexpectedly = true;
      if (perf) killProcessTree(perf);
    };

    server.on('exit', onServerExit);

    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    perf = spawn(npmCmd, ['run', 'perf:smoke'], {
      cwd,
      env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    const poll = setInterval(() => {
      if (server.exitCode !== null && !perfFinished) {
        serverDiedUnexpectedly = true;
        killProcessTree(perf);
      }
    }, 200);

    perf.on('exit', (code, signal) => {
      perfFinished = true;
      clearInterval(poll);
      server.off('exit', onServerExit);
      if (serverDiedUnexpectedly) {
        console.error('[perf:smoke:local] FAIL: server died during perf smoke');
        resolvePerf(1);
        return;
      }
      resolvePerf(propagateChildExitCode(code, signal));
    });
  });
}

async function main(): Promise<number> {
  const port = perfLocalPortFromEnv(process.env);
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await assertPortFree(port, 'perf:smoke:local');
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 1;
  }

  const sanitized = buildChildEnv(port, baseUrl);
  console.log('[perf:smoke:local] parent E2E_DASHBOARD_BYPASS=', process.env.E2E_DASHBOARD_BYPASS ?? 'ABSENT');
  console.log(
    '[perf:smoke:local] child E2E_DASHBOARD_BYPASS=',
    readHarnessEnvPresence(sanitized, 'E2E_DASHBOARD_BYPASS'),
  );
  console.log('[perf:smoke:local] child METRICS_SECRET=', sanitized.METRICS_SECRET);
  if (sanitized.METRICS_SECRET !== CI_HARNESS_METRICS_SECRET) {
    console.error('[perf:smoke:local] child METRICS_SECRET must use CI harness placeholder');
    return 1;
  }

  if (!existsSync(resolve(cwd, '.next'))) {
    console.error('[perf:smoke:local] Missing .next — run npm run build first.');
    return 1;
  }

  const scaleExit = runSync('npm', ['run', 'scale:dataset', '--', '--total', '10000'], sanitized);
  if (scaleExit !== 0) return scaleExit;

  const nextCli = resolve(cwd, 'node_modules/next/dist/bin/next');
  let serverStderr = '';
  let serverExitBeforeHealth = false;
  let serverExitCode: number | null = null;
  let runnerShuttingDown = false;

  const server: ChildProcess = spawn(nodeBin, [nextCli, 'start', '-p', String(port)], {
    cwd,
    env: sanitized,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  server.stderr?.on('data', (chunk: Buffer) => {
    serverStderr += chunk.toString();
  });

  server.on('exit', (code) => {
    serverExitCode = code;
    if (!runnerShuttingDown) {
      serverExitBeforeHealth = true;
    }
  });

  const health = await waitForHealth(baseUrl);
  if (serverExitBeforeHealth) {
    console.error('[perf:smoke:local] Server exited before health check', serverExitCode);
    if (serverStderr.trim()) {
      console.error('[perf:smoke:local] server stderr tail:', serverStderr.slice(-2000));
    }
    return propagateChildExitCode(serverExitCode, null);
  }
  if (health === 'TIMEOUT') {
    console.error('[perf:smoke:local] Server did not respond on /api/health');
    if (serverStderr.trim()) {
      console.error('[perf:smoke:local] server stderr tail:', serverStderr.slice(-2000));
    }
    killProcessTree(server);
    return 1;
  }
  console.log(`[perf:smoke:local] health=${health} baseUrl=${baseUrl} pid=${server.pid}`);

  const perfEnv: NodeJS.ProcessEnv = {
    ...sanitized,
    PERF_BASE_URL: baseUrl,
    PERF_DURATION_MS: process.env.PERF_DURATION_MS ?? '20000',
    PERF_CONCURRENCY: process.env.PERF_CONCURRENCY ?? '20',
    PERF_BUDGET_BASELINE_FILE:
      process.env.PERF_BUDGET_BASELINE_FILE ?? 'docs/perf-smoke-baseline-ci.json',
    PERF_REGRESSION_TOLERANCE: process.env.PERF_REGRESSION_TOLERANCE ?? '0.20',
    PERF_REPORT_OUTPUT: 'artifacts/perf-smoke-local-report.json',
    PERF_SKIP_API_HEALTH: process.env.PERF_SKIP_API_HEALTH ?? '1',
  };

  const perfExit = await runPerfSmokeAsync(perfEnv, server);

  runnerShuttingDown = true;
  killProcessTree(server);

  if (perfExit !== 0) {
    return perfExit;
  }

  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error('[perf:smoke:local] fatal', error);
    process.exit(1);
  });
