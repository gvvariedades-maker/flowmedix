import { loadEnvConfig } from '@next/env';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let loaded = false;

function loadEnvFile(fileName: string): void {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

/** Carrega `.env*` no processo Playwright/E2E (Next não faz isso automaticamente). */
export function loadE2eEnv(): void {
  if (loaded) return;
  for (const file of ['.env.local', '.env.vercel.preview', '.env.vercel.prod', '.env.staging.local']) {
    loadEnvFile(file);
  }
  loadEnvConfig(process.cwd());
  if (!process.env.SUPABASE_WEBHOOK_SECRET?.trim() && !process.env.WEBHOOK_SECRET?.trim()) {
    process.env.SUPABASE_WEBHOOK_SECRET = 'e2e-cache-revalidate-secret';
  }
  if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://e2e-placeholder.supabase.co';
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'e2e-visual-fixture-anon-placeholder';
  }
  if (!process.env.COMMERCIAL_RUNTIME_READINESS_GATE?.trim()) {
    process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'false';
  }
  loaded = true;
}
