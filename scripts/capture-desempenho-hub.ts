#!/usr/bin/env tsx
/**
 * Capturas do hub `/desempenho` (Estudo, Simulados, Atividade) em 390×844 e
 * 1440×900, gravadas em `artifacts/desempenho-v1/<sha>/`.
 *
 * Uso: `npm run capture:desempenho-hub`
 */
import { spawnSync } from 'node:child_process';

const command =
  'npx playwright test e2e/capture-desempenho-hub.spec.ts --project=chromium --workers=1';

const result = spawnSync(command, {
  stdio: 'inherit',
  env: {
    ...process.env,
    E2E_DASHBOARD_BYPASS: 'true',
    NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
  },
  shell: true,
  cwd: process.cwd(),
});

process.exit(result.status ?? 1);
