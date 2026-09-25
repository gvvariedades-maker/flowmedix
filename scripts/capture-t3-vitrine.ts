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
