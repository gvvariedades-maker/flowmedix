#!/usr/bin/env tsx
/**
 * E2E da paginação inline da vitrine (mobile).
 * Local: npm run test:e2e:vitrine-pagination
 * Staging: npm run test:e2e:vitrine-pagination:staging
 */
import { spawnSync } from 'node:child_process';
import {
  assertPerfTargetConfigured,
  loadPerfEnv,
  parsePerfTarget,
  resolvePerfBaseUrl,
} from '@/lib/perf/loadPerfEnv';
import { getVercelProtectionBypassSecret } from '@/lib/perf/vercelProtection';

const target = parsePerfTarget(process.argv.slice(2));
const envMeta = loadPerfEnv(target);
const resolved = target === 'staging' ? resolvePerfBaseUrl() : null;
if (target === 'staging') {
  assertPerfTargetConfigured('staging', resolved!.baseUrl);
}

const baseUrl =
  process.env.PLAYWRIGHT_TEST_BASE_URL?.replace(/\/$/, '') ??
  resolved?.baseUrl ??
  'http://localhost:3000';
const againstRemote = !/^https?:\/\/localhost(?::\d+)?$/i.test(baseUrl);

const command = `npx playwright test e2e/vitrine-pagination.spec.ts --project="Mobile Chrome"`;

const result = spawnSync(command, {
  stdio: 'inherit',
  env: {
    ...process.env,
    PLAYWRIGHT_TEST_BASE_URL: baseUrl,
    ...(target === 'staging' ? { E2E_STAGING_OPT_IN: 'true' } : {}),
    ...(againstRemote ? { PLAYWRIGHT_SKIP_WEBSERVER: 'true' } : {}),
  },
  shell: true,
  cwd: process.cwd(),
});

const protectionBypass = Boolean(getVercelProtectionBypassSecret());
if (againstRemote && !protectionBypass) {
  console.warn(
    '[test:e2e:vitrine-pagination] Preview com Deployment Protection: defina VERCEL_PROTECTION_BYPASS em .env.staging.local.',
  );
}

console.log(
  `[test:e2e:vitrine-pagination] target=${target} baseUrl=${baseUrl} remote=${againstRemote} vercelBypass=${protectionBypass} env=${envMeta.loadedFiles.join(', ')}`,
);
process.exit(result.status ?? 1);
