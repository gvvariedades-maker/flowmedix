#!/usr/bin/env tsx
/**
 * E2E de navegação estudar (vitrine → questão → próxima/anterior + rota #5 imersiva).
 * Local: npm run test:e2e:estudar-nav
 * Staging: npm run test:e2e:estudar-nav:staging
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

const command = 'npx playwright test e2e/estudar-nav.spec.ts --project=chromium';

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
    '[test:e2e:estudar-nav] Preview com Deployment Protection: defina VERCEL_PROTECTION_BYPASS em .env.staging.local.',
  );
}

console.log(
  `[test:e2e:estudar-nav] target=${target} baseUrl=${baseUrl} remote=${againstRemote} vercelBypass=${protectionBypass} env=${envMeta.loadedFiles.join(', ')}`,
);
process.exit(result.status ?? 1);
