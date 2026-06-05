#!/usr/bin/env tsx
/**
 * E2E do modal @estudar (fase 5) — injeta NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1 no webServer do Playwright.
 * Local: npm run test:e2e:modal
 * Staging: npm run test:e2e:modal:staging (PERF_BASE_URL em .env.staging.local + flag no deploy Vercel)
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

const grepInvert = againstRemote ? ' --grep-invert "não deixa vitrine inerte"' : '';
const command = `npx playwright test e2e/estudar-modal.spec.ts --project="Mobile Chrome"${grepInvert}`;

const result = spawnSync(command, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE: '1',
    PLAYWRIGHT_TEST_BASE_URL: baseUrl,
    ...(againstRemote ? { PLAYWRIGHT_SKIP_WEBSERVER: 'true' } : {}),
  },
  shell: true,
  cwd: process.cwd(),
});

const protectionBypass = Boolean(getVercelProtectionBypassSecret());
const rawBypass = process.env.VERCEL_PROTECTION_BYPASS?.trim();
if (againstRemote && rawBypass === 'x-vercel-protection-bypass') {
  console.warn(
    '[test:e2e:modal] VERCEL_PROTECTION_BYPASS está com o nome do header HTTP, não o secret. Copie o valor em Vercel → Settings → Deployment Protection → Protection Bypass for Automation (string ~32 caracteres).',
  );
} else if (againstRemote && !protectionBypass) {
  console.warn(
    '[test:e2e:modal] Preview com Deployment Protection: defina VERCEL_PROTECTION_BYPASS (ou VERCEL_AUTOMATION_BYPASS_SECRET) em .env.staging.local.',
  );
}

console.log(
  `[test:e2e:modal] target=${target} baseUrl=${baseUrl} modal=1 remote=${againstRemote} vercelBypass=${protectionBypass} env=${envMeta.loadedFiles.join(', ')}`,
);
process.exit(result.status ?? 1);
