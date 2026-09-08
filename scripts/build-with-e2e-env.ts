#!/usr/bin/env tsx
/**
 * Build de produção com placeholders E2E (loadE2eEnv) — sem .env.local.
 * Não desabilita validate:env; apenas injeta variáveis mínimas autorizadas pelo harness.
 */
import { spawnSync } from 'node:child_process';
import { loadE2eEnv } from '../e2e/helpers/loadE2eEnv';

loadE2eEnv();

const result = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
