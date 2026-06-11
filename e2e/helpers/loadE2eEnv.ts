import { loadEnvConfig } from '@next/env';

let loaded = false;

/** Carrega `.env.local` no processo Playwright (Next não faz isso automaticamente). */
export function loadE2eEnv(): void {
  if (loaded) return;
  loadEnvConfig(process.cwd());
  loaded = true;
}
