# Section 6 — new/untracked implementation files


### .gitattributes
```
# P0 evidence fixtures — canonical LF for cross-platform candidate_file_sha256 (EWU-HARNESS-DETERMINISM-001).
__tests__/fixtures/p0-evidence/*.json text eol=lf

```

### lib/e2e/captureMode.ts
```
/** Explicit opt-in for Playwright suites that write golden/evidence screenshots to tracked paths. */
export const E2E_CAPTURE_MODE_ENV = 'E2E_CAPTURE_MODE';

export function isE2eCaptureModeEnabled(): boolean {
  return process.env[E2E_CAPTURE_MODE_ENV] === 'true';
}

/** Child env for official capture entrypoints (`npm run capture:*`) — must opt in writers. */
export function withE2eCaptureModeEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return {
    ...env,
    [E2E_CAPTURE_MODE_ENV]: 'true',
  };
}

/**
 * Manual capture wrappers: capture mode on, CI unset so gated specs are not skipped by inherited CI=true.
 */
export function buildManualCaptureWrapperEnv(
  parent: NodeJS.ProcessEnv,
  extra: Partial<NodeJS.ProcessEnv> = {},
): NodeJS.ProcessEnv {
  const next = withE2eCaptureModeEnv({ ...parent, ...extra } as NodeJS.ProcessEnv);
  delete next.CI;
  return next;
}

/** Capture-only specs gated by {@link isE2eCaptureModeEnabled} — default `npm run test:e2e` must not mutate tracked assets. */
export const CAPTURE_ONLY_E2E_SPECS = [
  'e2e/audit-visual-baseline.spec.ts',
  'e2e/audit-visual-editorial-v2.spec.ts',
  'e2e/audit-visual-external.spec.ts',
  'e2e/capture-desempenho-hub.spec.ts',
  'e2e/capture-editorial-premium-after.spec.ts',
  'e2e/capture-editorial-premium-before.spec.ts',
  'e2e/capture-hero-mockups.spec.ts',
  'e2e/capture-questao-review.spec.ts',
  'e2e/capture-t3-vitrine.spec.ts',
] as const;

```

### lib/e2e/localRunnerEnv.ts
```
import { CI_HARNESS_METRICS_SECRET } from '@/lib/harness/ciPlaceholders';
import { E2E_CAPTURE_MODE_ENV } from '@/lib/e2e/captureMode';
import { sanitizeHarnessEnv } from '@/lib/perf/sanitizeHarnessEnv';

export const DEFAULT_E2E_LOCAL_PORT = 3104;

export type HarnessEnvPresence = 'ABSENT' | string;

export function readEnvPresence(env: NodeJS.ProcessEnv, key: string): HarnessEnvPresence {
  const value = env[key];
  if (value === undefined || value === '') return 'ABSENT';
  return value;
}

export function e2eLocalPortFromEnv(env: NodeJS.ProcessEnv): number {
  const raw = env.E2E_LOCAL_PORT;
  const port = raw !== undefined && raw !== '' ? Number(raw) : DEFAULT_E2E_LOCAL_PORT;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid E2E local port "${raw}". Use E2E_LOCAL_PORT with an integer between 1 and 65535.`,
    );
  }
  return port;
}

export function isAcceptableHealthStatus(status: number): boolean {
  return status === 200 || status === 503;
}

/** Public CI placeholders — same values as `.github/workflows/test.yml` build job (no secrets). */
export function applyCiBuildPlaceholderEnv(
  env: NodeJS.ProcessEnv,
  baseUrl: string,
  port: number,
): NodeJS.ProcessEnv {
  return {
    ...env,
    CI: 'true',
    NODE_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: 'https://ci-build-placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ci-build-placeholder-key',
    NEXT_PUBLIC_APP_URL: baseUrl,
    RESEND_API_KEY: 're_ci_build_placeholder_key',
    RESEND_FROM_EMAIL: 'Avant <noreply@ci.placeholder.test>',
    SUPABASE_WEBHOOK_SECRET: 'ci_supabase_webhook_secret_placeholder_32',
    SUPABASE_SERVICE_ROLE_KEY: 'ci_service_role_placeholder_key_32chars',
    ADMIN_EMAIL: 'ci-admin@placeholder.test',
    METRICS_SECRET: CI_HARNESS_METRICS_SECRET,
    PORT: String(port),
  };
}

export function perfLocalPortFromEnv(env: NodeJS.ProcessEnv): number {
  const raw = env.PERF_LOCAL_PORT;
  const port = raw !== undefined && raw !== '' ? Number(raw) : DEFAULT_E2E_LOCAL_PORT;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid perf local port "${raw}". Use PERF_LOCAL_PORT with an integer between 1 and 65535.`,
    );
  }
  return port;
}

/** Child env for build + Next start — explicit functional E2E, capture mode off by default. */
export function buildE2eFunctionalChildEnv(
  parentEnv: NodeJS.ProcessEnv,
  options: { port: number; baseUrl: string },
): NodeJS.ProcessEnv {
  const sanitized = sanitizeHarnessEnv(parentEnv);
  const withPlaceholders = applyCiBuildPlaceholderEnv(
    sanitized,
    options.baseUrl,
    options.port,
  );
  const next: NodeJS.ProcessEnv = {
    ...withPlaceholders,
    E2E_ADMIN_BYPASS: 'true',
    E2E_DASHBOARD_BYPASS: 'true',
    NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
  };
  delete next[E2E_CAPTURE_MODE_ENV];
  delete next.PLAYWRIGHT_SKIP_WEBSERVER;
  delete next.PLAYWRIGHT_PROD;
  delete next.PLAYWRIGHT_TEST_BASE_URL;
  return next;
}

/** Playwright child — webServer disabled, base URL pinned to local server. */
export function buildPlaywrightChildEnv(
  functionalEnv: NodeJS.ProcessEnv,
  baseUrl: string,
): NodeJS.ProcessEnv {
  return {
    ...functionalEnv,
    PLAYWRIGHT_SKIP_WEBSERVER: 'true',
    PLAYWRIGHT_TEST_BASE_URL: baseUrl,
  };
}

export function propagateChildExitCode(status: number | null, signal: NodeJS.Signals | null): number {
  if (signal) return 1;
  return status ?? 1;
}

export async function waitForHealth(
  baseUrl: string,
  timeoutMs = 180_000,
): Promise<number | 'TIMEOUT'> {
  const deadline = Date.now() + timeoutMs;
  const healthUrl = `${baseUrl.replace(/\/$/, '')}/api/health`;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(healthUrl, { cache: 'no-store' });
      if (isAcceptableHealthStatus(response.status)) {
        return response.status;
      }
    } catch {
      /* server still starting */
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 2000));
  }
  return 'TIMEOUT';
}

```

### lib/harness/assertPortFree.ts
```
import { createServer } from 'node:net';

/** Fails if `127.0.0.1:port` is already bound — prevents health checks against a foreign server. */
export function assertPortFree(port: number, label = 'harness'): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const probe = createServer();
    probe.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        reject(
          new Error(
            `[${label}] Port ${port} is already in use. Choose a free port or stop the conflicting process.`,
          ),
        );
        return;
      }
      reject(err);
    });
    probe.listen(port, '127.0.0.1', () => {
      probe.close(() => resolvePromise());
    });
  });
}

```

### lib/harness/captureFreshOutput.ts
```
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type PngFileSnapshot = Map<string, { mtimeMs: number; size: number }>;

/** Baseline PNG names + mtime/size before a capture run (ignores non-.png). */
export function snapshotPngFiles(dir: string): PngFileSnapshot {
  const map: PngFileSnapshot = new Map();
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    return map;
  }
  for (const name of names) {
    if (!name.endsWith('.png')) continue;
    const st = statSync(join(dir, name));
    map.set(name, { mtimeMs: st.mtimeMs, size: st.size });
  }
  return map;
}

/** PNGs created or updated since `before` — stale files unchanged are excluded. */
export function findNewOrModifiedPngs(dir: string, before: PngFileSnapshot): string[] {
  const after = snapshotPngFiles(dir);
  const changed: string[] = [];
  for (const [name, meta] of after) {
    const prev = before.get(name);
    if (!prev || prev.mtimeMs !== meta.mtimeMs || prev.size !== meta.size) {
      changed.push(name);
    }
  }
  return changed;
}

```

### lib/harness/ciPlaceholders.ts
```
/** Deterministic CI/harness placeholders — never inherit real secrets from parent shell. */
export const CI_HARNESS_METRICS_SECRET = 'ci_metrics_secret_placeholder';

```

### lib/perf/sanitizeHarnessEnv.ts
```
/** Keys that must not leak from Playwright/E2E into sanitized perf smoke runs. */
export const HARNESS_E2E_LEAK_KEYS = [
  'E2E_DASHBOARD_BYPASS',
  'E2E_ADMIN_BYPASS',
  'NEXT_PUBLIC_E2E_DASHBOARD_BYPASS',
  'PLAYWRIGHT_SKIP_WEBSERVER',
  'PLAYWRIGHT_PROD',
] as const;

export type HarnessEnvPresence = 'ABSENT' | string;

export function readHarnessEnvPresence(
  env: NodeJS.ProcessEnv,
  key: (typeof HARNESS_E2E_LEAK_KEYS)[number],
): HarnessEnvPresence {
  const value = env[key];
  if (value === undefined || value === '') return 'ABSENT';
  return value;
}

/** Returns a shallow copy with E2E/Playwright bypass keys removed (does not mutate input). */
export function sanitizeHarnessEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const next: NodeJS.ProcessEnv = { ...env };
  for (const key of HARNESS_E2E_LEAK_KEYS) {
    delete next[key];
  }
  return next;
}

```

### e2e/helpers/captureModeGate.ts
```
import { test } from '@playwright/test';
import { isE2eCaptureModeEnabled } from '@/lib/e2e/captureMode';

export function skipUnlessE2eCaptureMode(reason?: string): void {
  if (!isE2eCaptureModeEnabled()) {
    test.skip(true, reason ?? 'Capture-only spec — set E2E_CAPTURE_MODE=true to run writers');
  }
}

```

### scripts/run-perf-smoke-local.ts
```
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

```

### scripts/run-e2e-local.ts
```
#!/usr/bin/env tsx
/**
 * Local Windows-friendly E2E: build → next start → playwright (skip webServer).
 * GitHub CI continues to use `npm run test:e2e` unchanged.
 */
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { assertPortFree } from '@/lib/harness/assertPortFree';
import {
  buildE2eFunctionalChildEnv,
  buildPlaywrightChildEnv,
  e2eLocalPortFromEnv,
  propagateChildExitCode,
  readEnvPresence,
  waitForHealth,
} from '@/lib/e2e/localRunnerEnv';
import { E2E_CAPTURE_MODE_ENV } from '@/lib/e2e/captureMode';

const nodeBin = process.execPath;
const cwd = process.cwd();

function killProcessTree(child: ChildProcess | null): void {
  if (!child?.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      try {
        child.kill('SIGTERM');
      } catch {
        /* already exited */
      }
    }
  }
}

function runBuild(env: NodeJS.ProcessEnv): { exitCode: number; durationMs: number } {
  const started = Date.now();
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCmd, ['run', 'build'], {
    cwd,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return {
    exitCode: propagateChildExitCode(result.status, result.signal),
    durationMs: Date.now() - started,
  };
}

async function main(): Promise<number> {
  const port = e2eLocalPortFromEnv(process.env);
  const baseUrl = `http://127.0.0.1:${port}`;
  const functionalEnv = buildE2eFunctionalChildEnv(process.env, { port, baseUrl });

  console.log('[test:e2e:local] parent PLAYWRIGHT_SKIP_WEBSERVER=', readEnvPresence(process.env, 'PLAYWRIGHT_SKIP_WEBSERVER'));
  console.log('[test:e2e:local] child CI=', functionalEnv.CI);
  console.log('[test:e2e:local] child E2E_DASHBOARD_BYPASS=', functionalEnv.E2E_DASHBOARD_BYPASS);
  console.log(
    '[test:e2e:local] child E2E_CAPTURE_MODE=',
    readEnvPresence(functionalEnv, E2E_CAPTURE_MODE_ENV),
  );

  try {
    await assertPortFree(port, 'test:e2e:local');
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 1;
  }

  console.log('[test:e2e:local] npm run build…');
  const build = runBuild(functionalEnv);
  console.log(`[test:e2e:local] build exit=${build.exitCode} duration=${build.durationMs}ms`);
  if (build.exitCode !== 0) {
    return build.exitCode;
  }

  if (!existsSync(resolve(cwd, '.next'))) {
    console.error('[test:e2e:local] Missing .next after build.');
    return 1;
  }

  const nextCli = resolve(cwd, 'node_modules/next/dist/bin/next');
  let serverStderr = '';
  let serverExitDuringE2e = false;
  let serverExitCode: number | null = null;
  let runnerShuttingDown = false;

  const server = spawn(nodeBin, [nextCli, 'start', '-p', String(port)], {
    cwd,
    env: functionalEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  server.stderr?.on('data', (chunk: Buffer) => {
    serverStderr += chunk.toString();
  });

  server.on('exit', (code) => {
    serverExitCode = code;
    if (!runnerShuttingDown) {
      serverExitDuringE2e = true;
    }
  });

  const health = await waitForHealth(baseUrl);
  if (serverExitDuringE2e) {
    console.error('[test:e2e:local] Server exited before health check', serverExitCode);
    if (serverStderr.trim()) {
      console.error('[test:e2e:local] server stderr tail:', serverStderr.slice(-2000));
    }
    killProcessTree(server);
    return propagateChildExitCode(serverExitCode, null);
  }
  if (health === 'TIMEOUT') {
    console.error('[test:e2e:local] Server did not respond on /api/health (200 or 503)');
    if (serverStderr.trim()) {
      console.error('[test:e2e:local] server stderr tail:', serverStderr.slice(-2000));
    }
    killProcessTree(server);
    return 1;
  }
  console.log(`[test:e2e:local] health=${health} baseUrl=${baseUrl}`);

  const playwrightEnv = buildPlaywrightChildEnv(functionalEnv, baseUrl);
  const playwrightCli = resolve(cwd, 'node_modules/@playwright/test/cli.js');
  const e2eStarted = Date.now();

  const playwrightExit = await new Promise<number>((resolvePlaywright) => {
    const pw = spawn(nodeBin, [playwrightCli, 'test'], {
      cwd,
      env: playwrightEnv,
      stdio: 'inherit',
      shell: false,
    });

    pw.on('exit', (code, signal) => {
      resolvePlaywright(propagateChildExitCode(code, signal));
    });
  });

  const e2eDurationMs = Date.now() - e2eStarted;
  console.log(`[test:e2e:local] playwright exit=${playwrightExit} duration=${e2eDurationMs}ms`);

  runnerShuttingDown = true;
  killProcessTree(server);

  if (serverExitDuringE2e) {
    console.error('[test:e2e:local] FAIL: server died during E2E', serverExitCode);
    return 1;
  }

  return playwrightExit;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error('[test:e2e:local] fatal', error);
    process.exit(1);
  });

```

### scripts/capture-hero-mockups.ts
```
#!/usr/bin/env tsx
import { spawnSync } from 'node:child_process';

import { buildManualCaptureWrapperEnv } from '@/lib/e2e/captureMode';

const result = spawnSync(
  'npx',
  ['playwright', 'test', 'e2e/capture-hero-mockups.spec.ts', '--project=chromium'],
  {
    stdio: 'inherit',
    env: buildManualCaptureWrapperEnv(process.env),
    shell: true,
    cwd: process.cwd(),
  },
);

process.exit(result.status ?? 1);

```

### scripts/capture-t3-vitrine.ts
```
#!/usr/bin/env tsx
import { spawnSync } from 'node:child_process';

import { buildManualCaptureWrapperEnv } from '@/lib/e2e/captureMode';

const command =
  'npx playwright test e2e/capture-t3-vitrine.spec.ts --project=chromium --workers=1';

const result = spawnSync(command, {
  stdio: 'inherit',
  env: buildManualCaptureWrapperEnv({
    ...process.env,
    E2E_ADMIN_BYPASS: 'true',
    E2E_DASHBOARD_BYPASS: 'true',
    NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
  }),
  shell: true,
  cwd: process.cwd(),
});

process.exit(result.status ?? 1);

```

### scripts/capture-desempenho-hub.ts
```
#!/usr/bin/env tsx
/**
 * Capturas do hub `/desempenho` (Estudo, Simulados, Hábitos) em 390×844 e
 * 1440×900, gravadas em `artifacts/desempenho-v1/<sha>/`.
 *
 * Uso: `npm run capture:desempenho-hub`
 */
import { spawnSync } from 'node:child_process';

import { buildManualCaptureWrapperEnv } from '@/lib/e2e/captureMode';

const command =
  'npx playwright test e2e/capture-desempenho-hub.spec.ts --project=chromium --workers=1';

const result = spawnSync(command, {
  stdio: 'inherit',
  env: buildManualCaptureWrapperEnv({
    ...process.env,
    E2E_DASHBOARD_BYPASS: 'true',
    NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
    // Não herdar PLAYWRIGHT_TEST_BASE_URL de outro servidor (UI antiga / outra porta).
    PLAYWRIGHT_TEST_BASE_URL: 'http://localhost:3000',
  }),
  shell: true,
  cwd: process.cwd(),
});

process.exit(result.status ?? 1);

```

### scripts/capture-questao-review.ts
```
#!/usr/bin/env tsx
/**
 * Captura PNGs do fluxo questão → feedback → 4 slides (L4).
 *
 * Uso:
 *   npm run capture:questao-review -- --slug=idecan-...
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  resolveAnchorKeyReviewSlug,
  resolveLoteReviewSlug,
} from '@/lib/catalogMigration/captureLoteReview';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { buildManualCaptureWrapperEnv } from '@/lib/e2e/captureMode';
import {
  findNewOrModifiedPngs,
  snapshotPngFiles,
} from '@/lib/harness/captureFreshOutput';

function resolveSlug(): { slug: string; source: string; reason: string } {
  const explicitSlug = parseArg('slug');
  if (explicitSlug) {
    return {
      slug: explicitSlug,
      source: parseArg('source') ?? 'local',
      reason: 'cli --slug',
    };
  }

  const lote = parseArg('lote');
  const anchorKey = parseArg('anchor-key');
  const anchorsRegistry =
    parseArg('anchors-registry') ?? 'data/catalog-migration/imunizacao-golden-anchors.json';

  if (anchorKey) {
    const target = resolveAnchorKeyReviewSlug(anchorsRegistry, anchorKey);
    return { slug: target.slug, source: target.source, reason: target.reason };
  }

  if (lote) {
    const target = resolveLoteReviewSlug(lote);
    return { slug: target.slug, source: target.source, reason: target.reason };
  }

  throw new Error('Informe --slug, --lote ou --anchor-key');
}

function main(): void {
  const { slug, source, reason } = resolveSlug();
  const viewport = parseArg('viewport') ?? 'desktop';
  const outDir = resolve(process.cwd(), 'artifacts/questao-review', slug);
  mkdirSync(outDir, { recursive: true });
  const pngBefore = snapshotPngFiles(outDir);

  const specArgs = [
    'playwright',
    'test',
    'e2e/capture-questao-review.spec.ts',
    '--project=chromium',
    `--grep=${slug}`,
  ];

  const env = buildManualCaptureWrapperEnv(process.env, {
    CAPTURE_QUESTAO_SLUG: slug,
    CAPTURE_QUESTAO_SOURCE: source,
    CAPTURE_QUESTAO_OUT_DIR: outDir,
    CAPTURE_QUESTAO_VIEWPORT: viewport,
  });

  console.log(`[capture:questao-review] slug=${slug} source=${source} (${reason})`);
  console.log(`[capture:questao-review] viewport=${viewport}`);
  console.log(`[capture:questao-review] out=${outDir}`);

  const result = spawnSync('npx', specArgs, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
    env,
  });

  if (result.status !== 0) {
    console.error('[capture:questao-review] falhou');
    process.exitCode = 1;
    return;
  }

  const freshPngs = findNewOrModifiedPngs(outDir, pngBefore);
  if (freshPngs.length === 0) {
    console.error(
      '[capture:questao-review] Nenhum PNG novo ou modificado nesta execução — stale output ou spec skipped',
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[capture:questao-review] ${freshPngs.length} PNG(s) fresh em ${outDir}: ${freshPngs.join(', ')}`,
  );
}

main();

```

### scripts/write-independent-verify-bundle.ts
```
#!/usr/bin/env tsx
/**
 * Regenerates docs/independent-verify/* with UTF-8 patches (no mojibake).
 * Usage: npx tsx scripts/write-independent-verify-bundle.ts [baseSha]
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cwd = process.cwd();
const baseSha = process.argv[2] ?? 'ecb6d6810d2a36b1dc2af3df6c2f3c6d9145c2ff';
const outDir = resolve(cwd, 'docs/independent-verify');

function git(args: string): string {
  return execSync(`git ${args}`, { cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
}

mkdirSync(outDir, { recursive: true });

const status = git('status --short');
const diffCheck = git(`diff --check ${baseSha}`).trim();
const diffStat = git(`diff --stat ${baseSha}`).trim();
const nameStatus = git(`diff --name-status ${baseSha}`).trim();
const implementationPatch = git(`diff ${baseSha}`);
const packagePatch = git(`diff ${baseSha} -- package.json`);
const d9Patch = git(`diff ${baseSha} -- e2e/mobile-drawer.spec.ts`);

writeFileSync(resolve(outDir, 'implementation.patch'), implementationPatch, 'utf8');
writeFileSync(resolve(outDir, 'package.json.patch'), packagePatch, 'utf8');
writeFileSync(resolve(outDir, 'mobile-drawer.spec.patch'), d9Patch, 'utf8');

const newFiles = [
  '.gitattributes',
  'lib/e2e/captureMode.ts',
  'lib/e2e/localRunnerEnv.ts',
  'lib/harness/assertPortFree.ts',
  'lib/harness/captureFreshOutput.ts',
  'lib/harness/ciPlaceholders.ts',
  'lib/perf/sanitizeHarnessEnv.ts',
  'e2e/helpers/captureModeGate.ts',
  'scripts/run-perf-smoke-local.ts',
  'scripts/run-e2e-local.ts',
  'scripts/capture-hero-mockups.ts',
  'scripts/capture-t3-vitrine.ts',
  'scripts/capture-desempenho-hub.ts',
  'scripts/capture-questao-review.ts',
  'scripts/write-independent-verify-bundle.ts',
  '__tests__/lib/captureMode.test.ts',
  '__tests__/lib/harness/captureFreshOutput.test.ts',
  '__tests__/lib/perf/sanitizeHarnessEnv.test.ts',
  '__tests__/lib/e2eLocalRunnerEnv.test.ts',
  'docs/HARNESS_DETERMINISM.md',
];

let newFilesMd = '# Section 6 — new/untracked implementation files\n\n';
for (const rel of newFiles) {
  const abs = resolve(cwd, rel);
  newFilesMd += `\n### ${rel}\n\`\`\`\n`;
  newFilesMd += readFileSync(abs, 'utf8');
  newFilesMd += '\n```\n';
}
writeFileSync(resolve(outDir, 'NEW-IMPLEMENTATION-FILES.md'), newFilesMd, 'utf8');

const review = `# EWU-HARNESS-DETERMINISM-001 — Independent Verify Bundle (UTF-8)

BASE: ${baseSha}
HEAD: ${git('rev-parse HEAD').trim()}
Generated: ${new Date().toISOString()}
Encoding: UTF-8 (patches via git encoding=utf8)

## 1. git status --short
\`\`\`
${status.trimEnd()}
\`\`\`

## 2. git diff --check
\`\`\`
${diffCheck || '(clean)'}
\`\`\`

## 3. git diff --stat
\`\`\`
${diffStat}
\`\`\`

## 4. git diff --name-status
\`\`\`
${nameStatus}
\`\`\`

## 5–8. See implementation.patch, NEW-IMPLEMENTATION-FILES.md, package.json.patch, mobile-drawer.spec.patch

D9 note: \`expect(...).toPass()\` uses Playwright built-in retry (PLAYWRIGHT_TO_PASS_RETRY=YES); CUSTOM_RETRY_LOOP=NO.
`;

writeFileSync(resolve(outDir, 'REVIEW-BUNDLE.md'), review, 'utf8');

console.log('[write-independent-verify-bundle] wrote', outDir);
console.log('[write-independent-verify-bundle] files:', readdirSync(outDir).join(', '));

```

### __tests__/lib/captureMode.test.ts
```
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildManualCaptureWrapperEnv,
  CAPTURE_ONLY_E2E_SPECS,
  E2E_CAPTURE_MODE_ENV,
  isE2eCaptureModeEnabled,
  withE2eCaptureModeEnv,
} from '@/lib/e2e/captureMode';

describe('captureMode', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('default capture mode is off', () => {
    delete process.env.E2E_CAPTURE_MODE;
    expect(isE2eCaptureModeEnabled()).toBe(false);
  });

  it('E2E_CAPTURE_MODE=true enables capture writers', () => {
    process.env.E2E_CAPTURE_MODE = 'true';
    expect(isE2eCaptureModeEnabled()).toBe(true);
  });

  it('withE2eCaptureModeEnv sets capture flag for entrypoints', () => {
    const child = withE2eCaptureModeEnv({} as NodeJS.ProcessEnv);
    expect(child[E2E_CAPTURE_MODE_ENV]).toBe('true');
  });

  it('buildManualCaptureWrapperEnv enables capture and unsets inherited CI', () => {
    const child = buildManualCaptureWrapperEnv({ CI: 'true' } as unknown as NodeJS.ProcessEnv);
    expect(child[E2E_CAPTURE_MODE_ENV]).toBe('true');
    expect(child.CI).toBeUndefined();
  });

  it('official capture npm wrappers use buildManualCaptureWrapperEnv', () => {
    const cwd = process.cwd();
    const wrappers = [
      'scripts/capture-t3-vitrine.ts',
      'scripts/capture-desempenho-hub.ts',
      'scripts/capture-hero-mockups.ts',
      'scripts/capture-questao-review.ts',
    ];
    for (const rel of wrappers) {
      const source = readFileSync(resolve(cwd, rel), 'utf8');
      expect(source).toMatch(/buildManualCaptureWrapperEnv/);
    }
    const questao = readFileSync(resolve(cwd, 'scripts/capture-questao-review.ts'), 'utf8');
    expect(questao).toMatch(/findNewOrModifiedPngs/);
    expect(questao).toMatch(/snapshotPngFiles/);
    const pkg = readFileSync(resolve(cwd, 'package.json'), 'utf8');
    expect(pkg).toMatch(/capture:hero-mockups.*capture-hero-mockups\.ts/);
  });

  it('capture-only specs reference capture mode gate', () => {
    const cwd = process.cwd();
    for (const specRel of CAPTURE_ONLY_E2E_SPECS) {
      const source = readFileSync(resolve(cwd, specRel), 'utf8');
      expect(source).toMatch(/skipUnlessE2eCaptureMode|isE2eCaptureModeEnabled/);
    }
  });
});

```

### __tests__/lib/harness/captureFreshOutput.test.ts
```
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  findNewOrModifiedPngs,
  snapshotPngFiles,
} from '@/lib/harness/captureFreshOutput';

describe('captureFreshOutput', () => {
  it('detects only new or modified PNGs', () => {
    const dir = mkdtempSync(join(tmpdir(), 'avant-capture-fresh-'));
    try {
      writeFileSync(join(dir, 'stale.png'), 'old');
      const before = snapshotPngFiles(dir);
      expect(before.size).toBe(1);

      expect(findNewOrModifiedPngs(dir, before)).toEqual([]);

      writeFileSync(join(dir, 'fresh.png'), 'new');
      const afterAdd = findNewOrModifiedPngs(dir, before);
      expect(afterAdd).toEqual(['fresh.png']);

      writeFileSync(join(dir, 'stale.png'), 'updated');
      const afterModify = findNewOrModifiedPngs(dir, before);
      expect(afterModify.sort()).toEqual(['fresh.png', 'stale.png']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

```

### __tests__/lib/perf/sanitizeHarnessEnv.test.ts
```
import {
  HARNESS_E2E_LEAK_KEYS,
  readHarnessEnvPresence,
  sanitizeHarnessEnv,
} from '@/lib/perf/sanitizeHarnessEnv';

describe('sanitizeHarnessEnv', () => {
  it('removes E2E and Playwright bypass keys without mutating parent', () => {
    const parent: NodeJS.ProcessEnv = {
      CI: 'true',
      NODE_ENV: 'production',
      E2E_DASHBOARD_BYPASS: 'true',
      E2E_ADMIN_BYPASS: 'true',
      NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
      PLAYWRIGHT_SKIP_WEBSERVER: 'true',
      PLAYWRIGHT_PROD: 'true',
      METRICS_SECRET: 'ci_metrics_secret_placeholder',
    };

    const child = sanitizeHarnessEnv(parent);

    for (const key of HARNESS_E2E_LEAK_KEYS) {
      expect(readHarnessEnvPresence(child, key)).toBe('ABSENT');
      expect(parent[key]).toBeDefined();
    }
    expect(child.METRICS_SECRET).toBe('ci_metrics_secret_placeholder');
  });

  it('readHarnessEnvPresence reports ABSENT for empty values', () => {
    expect(readHarnessEnvPresence({} as NodeJS.ProcessEnv, 'E2E_DASHBOARD_BYPASS')).toBe('ABSENT');
    expect(
      readHarnessEnvPresence(
        { E2E_DASHBOARD_BYPASS: '' } as unknown as NodeJS.ProcessEnv,
        'E2E_DASHBOARD_BYPASS',
      ),
    ).toBe('ABSENT');
  });
});

```

### __tests__/lib/e2eLocalRunnerEnv.test.ts
```
import { CI_HARNESS_METRICS_SECRET } from '@/lib/harness/ciPlaceholders';
import { E2E_CAPTURE_MODE_ENV } from '@/lib/e2e/captureMode';
import {
  DEFAULT_E2E_LOCAL_PORT,
  buildE2eFunctionalChildEnv,
  buildPlaywrightChildEnv,
  e2eLocalPortFromEnv,
  isAcceptableHealthStatus,
  propagateChildExitCode,
  readEnvPresence,
} from '@/lib/e2e/localRunnerEnv';

describe('localRunnerEnv', () => {
  const baseUrl = `http://127.0.0.1:${DEFAULT_E2E_LOCAL_PORT}`;

  it('builds explicit functional E2E child env with capture mode off', () => {
    const parent = {
      CI: 'false',
      E2E_CAPTURE_MODE: 'true',
      E2E_DASHBOARD_BYPASS: 'false',
      PLAYWRIGHT_SKIP_WEBSERVER: 'true',
      PLAYWRIGHT_PROD: 'true',
      PLAYWRIGHT_TEST_BASE_URL: 'http://localhost:3000',
      METRICS_SECRET: 'real-metrics-secret-from-parent-shell',
    } as unknown as NodeJS.ProcessEnv;

    const child = buildE2eFunctionalChildEnv(parent, {
      port: DEFAULT_E2E_LOCAL_PORT,
      baseUrl,
    });

    expect(child.CI).toBe('true');
    expect(child.NODE_ENV).toBe('production');
    expect(child.E2E_ADMIN_BYPASS).toBe('true');
    expect(child.E2E_DASHBOARD_BYPASS).toBe('true');
    expect(child.NEXT_PUBLIC_E2E_DASHBOARD_BYPASS).toBe('true');
    expect(readEnvPresence(child, E2E_CAPTURE_MODE_ENV)).toBe('ABSENT');
    expect(readEnvPresence(child, 'PLAYWRIGHT_SKIP_WEBSERVER')).toBe('ABSENT');
    expect(readEnvPresence(child, 'PLAYWRIGHT_PROD')).toBe('ABSENT');
    expect(child.NEXT_PUBLIC_APP_URL).toBe(baseUrl);
    expect(child.METRICS_SECRET).toBe(CI_HARNESS_METRICS_SECRET);
  });

  it('playwright child disables webServer and sets base URL', () => {
    const functional = buildE2eFunctionalChildEnv(process.env, {
      port: 3105,
      baseUrl: 'http://127.0.0.1:3105',
    });
    const pw = buildPlaywrightChildEnv(functional, 'http://127.0.0.1:3105');
    expect(pw.PLAYWRIGHT_SKIP_WEBSERVER).toBe('true');
    expect(pw.PLAYWRIGHT_TEST_BASE_URL).toBe('http://127.0.0.1:3105');
  });

  it('resolves port from E2E_LOCAL_PORT with default (ignores generic PORT)', () => {
    expect(e2eLocalPortFromEnv({} as NodeJS.ProcessEnv)).toBe(DEFAULT_E2E_LOCAL_PORT);
    expect(
      e2eLocalPortFromEnv({ PORT: '3103' } as unknown as NodeJS.ProcessEnv),
    ).toBe(DEFAULT_E2E_LOCAL_PORT);
    expect(e2eLocalPortFromEnv({ E2E_LOCAL_PORT: '3110' } as unknown as NodeJS.ProcessEnv)).toBe(3110);
  });

  it('propagates child exit code', () => {
    expect(propagateChildExitCode(0, null)).toBe(0);
    expect(propagateChildExitCode(1, null)).toBe(1);
    expect(propagateChildExitCode(null, 'SIGTERM')).toBe(1);
  });

  it('accepts health 200 and 503', () => {
    expect(isAcceptableHealthStatus(200)).toBe(true);
    expect(isAcceptableHealthStatus(503)).toBe(true);
    expect(isAcceptableHealthStatus(404)).toBe(false);
  });
});

```

### docs/HARNESS_DETERMINISM.md
```
# Harness determinism (local replay)

## Local E2E runner (Windows / replay determinístico)

O job **GitHub CI** continua usando apenas `npm run test:e2e` (Playwright `webServer`: `build && start`, timeout 300s). **Nada no workflow foi alterado.**

Para desenvolvimento local — especialmente **Windows**, onde build + start dentro do `webServer` estoura o budget — use:

```bash
npm run test:e2e:local
```

O runner (`scripts/run-e2e-local.ts`):

1. Monta **child env explícito** (não confia no shell pai): `CI=true`, bypass E2E funcional, placeholders públicos de CI, **`E2E_CAPTURE_MODE` ausente** (capture-only specs skipped).
2. Remove resíduos `PLAYWRIGHT_SKIP_WEBSERVER` / `PLAYWRIGHT_PROD` antes de montar os filhos.
3. Executa **`npm run build`** como etapa separada.
4. Sobe **`next start`** via `process.execPath` (porta default **3104**, override só via `E2E_LOCAL_PORT` — **`PORT` genérico do shell é ignorado**). **`assertPortFree`** antes do bind — não aceita servidor preexistente na porta.
5. Aguarda `/api/health` (**200 ou 503** = vivo).
6. Roda **`playwright test`** com `PLAYWRIGHT_SKIP_WEBSERVER=true` e exit code propagado.
7. Encerra **somente** o process tree do servidor que ele criou.

Capture-only (mutação de PNGs tracked):

Use os **entrypoints oficiais** (`npm run capture:*`) — eles definem `E2E_CAPTURE_MODE=true` no child env. Ou manualmente:

```bash
E2E_CAPTURE_MODE=true npx playwright test e2e/audit-visual-baseline.spec.ts --project=chromium --workers=1
```

Wrappers com capture mode integrado: `capture:t3-vitrine`, `capture:desempenho-hub`, `capture:hero-mockups`, `capture:questao-review`.

## P0 fixtures (line endings)

P0 evidence JSON under `__tests__/fixtures/p0-evidence/` is checked out with **LF** via `.gitattributes` so `candidate_file_sha256` matches Linux CI on Windows.

## Perf smoke (sanitized local runner)

Playwright `webServer` sets `E2E_DASHBOARD_BYPASS=true` for functional E2E. That must **not** leak into perf smoke.

```bash
npm run build   # CI placeholders — see .github/workflows/test.yml
npm run perf:smoke:local
```

`perf:smoke:local` removes `E2E_*_BYPASS` keys in child processes only. GitHub CI continues to use `npm run perf:smoke`.

- **`assertPortFree`** on `PERF_LOCAL_PORT` (default 3104) before `next start`.
- Falha se o child Next morrer antes do health (ex.: `EADDRINUSE`) — evita perf contra processo estrangeiro.
- **`METRICS_SECRET`** no child é sempre o placeholder CI (`ci_metrics_secret_placeholder`), nunca herdado do shell pai.

Negative test: parent shell may set `E2E_DASHBOARD_BYPASS=true`; child env must show `ABSENT`.

## E2E capture mode

Specs that write golden screenshots to **tracked** paths are **capture-only**. Default `npm run test:e2e` skips them.

Explicit capture:

```bash
npm run capture:hero-mockups
# ou
E2E_CAPTURE_MODE=true npx playwright test e2e/audit-visual-baseline.spec.ts --project=chromium --workers=1
```

`capture:questao-review` exige pelo menos um `.png` **novo ou modificado** após o Playwright (snapshot antes/depois) — PNG stale não conta. Wrappers removem `CI` herdado para evitar skip silencioso no spec.

Functional regression specs are unchanged. `visual-mold-regression` / `variant-gallery-regression` remain CI-skipped via existing `process.env.CI` guards.

```
