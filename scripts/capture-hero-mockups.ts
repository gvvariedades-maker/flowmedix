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
