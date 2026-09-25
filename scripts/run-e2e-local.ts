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
