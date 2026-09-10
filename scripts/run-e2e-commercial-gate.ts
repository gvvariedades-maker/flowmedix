#!/usr/bin/env tsx
/**
 * Playwright API — enforcement comercial com COMMERCIAL_RUNTIME_READINESS_GATE=true.
 * Reutiliza .next existente (start only) quando BUILD_ID presente.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { loadE2eEnv } from '../e2e/helpers/loadE2eEnv';

async function main(): Promise<void> {
  loadE2eEnv();
  process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'true';
  process.env.CI = 'true';
  process.env.E2E_ADMIN_BYPASS = 'true';
  process.env.E2E_DASHBOARD_BYPASS = 'true';
  process.env.NEXT_PUBLIC_E2E_DASHBOARD_BYPASS = 'true';

  const hasBuild = existsSync(resolve(process.cwd(), '.next', 'BUILD_ID'));
  let server: ChildProcess | null = null;

  if (hasBuild) {
    process.env.PLAYWRIGHT_SKIP_WEBSERVER = 'true';
    server = spawn('npm', ['run', 'start'], {
      stdio: 'pipe',
      shell: true,
      env: process.env,
    });
    await new Promise<void>((resolveReady) => {
      const timer = setTimeout(() => resolveReady(), 15_000);
      server?.stdout?.on('data', (chunk: Buffer) => {
        const text = String(chunk);
        if (text.includes('Ready') || text.includes('started') || text.includes('3000')) {
          clearTimeout(timer);
          resolveReady();
        }
      });
    });
  } else {
    process.env.PLAYWRIGHT_PROD = 'true';
  }

  const result = spawnSync(
    'npx playwright test e2e/commercial-enforcement-gate.spec.ts --project=chromium --workers=1',
    {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    },
  );

  if (server) {
    server.kill('SIGTERM');
  }

  process.exit(result.status ?? 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
