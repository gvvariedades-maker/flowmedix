import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';

export type PerfTarget = 'local' | 'staging';

export type LoadPerfEnvResult = {
  target: PerfTarget;
  loadedFiles: string[];
};

/**
 * `--target=staging` ou `PERF_TARGET=staging` → carrega `.env.staging.local` por cima do `.env.local`.
 */
export function parsePerfTarget(argv: string[]): PerfTarget {
  const fromArg = argv.find((a) => a.startsWith('--target='))?.split('=')[1]?.trim().toLowerCase();
  const fromEnv = process.env.PERF_TARGET?.trim().toLowerCase();
  const raw = fromArg ?? fromEnv ?? 'local';
  if (raw === 'staging') return 'staging';
  if (raw !== 'local' && raw !== '') {
    throw new Error(`PERF target inválido: "${raw}". Use local ou staging.`);
  }
  return 'local';
}

function mergeDotenvFile(absolutePath: string): void {
  const content = readFileSync(absolutePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

/**
 * Carrega `.env` / `.env.local` (Next) e, em staging, sobrescreve com `.env.staging.local`.
 */
export function loadPerfEnv(target: PerfTarget): LoadPerfEnvResult {
  const loadedFiles: string[] = [];

  const nextEnv = loadEnvConfig(process.cwd());
  if (nextEnv.loadedEnvFiles?.length) {
    const cwd = process.cwd();
    for (const entry of nextEnv.loadedEnvFiles) {
      const filePath =
        typeof entry === 'string'
          ? entry
          : entry && typeof entry === 'object' && 'path' in entry
            ? String((entry as { path: string }).path)
            : null;
      if (filePath) {
        loadedFiles.push(filePath.replace(cwd, '.').replace(/\\/g, '/'));
      }
    }
  }
  if (loadedFiles.length === 0) {
    loadedFiles.push('.env', '.env.local (se existir)');
  }

  if (target === 'staging') {
    const envFile = process.env.PERF_ENV_FILE?.trim() || '.env.staging.local';
    const absolutePath = resolve(process.cwd(), envFile);
    if (!existsSync(absolutePath)) {
      throw new Error(
        [
          `Arquivo ${envFile} não encontrado.`,
          `Copie .env.staging.example → ${envFile} e defina PERF_BASE_URL com a URL da preview Vercel.`,
          'Supabase (SERVICE_ROLE, URL, anon) pode continuar no .env.local — só a URL do app precisa mudar.',
        ].join(' '),
      );
    }
    mergeDotenvFile(absolutePath);
    loadedFiles.push(envFile);
  }

  return { target, loadedFiles };
}

export function resolvePerfBaseUrl(): { baseUrl: string; source: 'PERF_BASE_URL' | 'NEXT_PUBLIC_APP_URL' | 'default' } {
  const fromPerf = process.env.PERF_BASE_URL?.trim();
  if (fromPerf) {
    return { baseUrl: normalizePerfBaseUrl(fromPerf), source: 'PERF_BASE_URL' };
  }
  const fromApp = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromApp) {
    return { baseUrl: normalizePerfBaseUrl(fromApp), source: 'NEXT_PUBLIC_APP_URL' };
  }
  return { baseUrl: 'http://127.0.0.1:3000', source: 'default' };
}

export function normalizePerfBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/$/, '');
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`protocolo inválido: ${parsed.protocol}`);
    }
    return parsed.origin;
  } catch (error) {
    throw new Error(
      `PERF_BASE_URL / NEXT_PUBLIC_APP_URL inválida: "${url}". ${
        error instanceof Error ? error.message : ''
      }`.trim(),
    );
  }
}

function isLocalhostUrl(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  } catch {
    return false;
  }
}

export function assertPerfTargetConfigured(target: PerfTarget, baseUrl: string): void {
  if (target !== 'staging') return;
  if (isLocalhostUrl(baseUrl)) {
    throw new Error(
      [
        'PERF_TARGET=staging, mas a URL do app ainda é localhost.',
        'Em .env.staging.local defina PERF_BASE_URL=https://sua-preview.vercel.app',
        '(e opcionalmente NEXT_PUBLIC_APP_URL com o mesmo valor).',
      ].join(' '),
    );
  }
}

export function resolvePerfEnvironmentLabel(
  target: PerfTarget,
  baseUrl: string,
): 'local' | 'staging' | 'production' {
  if (target === 'staging') return 'staging';
  if (isLocalhostUrl(baseUrl)) return 'local';
  const host = new URL(baseUrl).hostname.toLowerCase();
  if (host.endsWith('.vercel.app') || process.env.VERCEL_ENV === 'preview') return 'staging';
  return 'production';
}

export function defaultPerfBaselineOutputPath(target: PerfTarget): string {
  const date = new Date().toISOString().slice(0, 10);
  const suffix = target === 'staging' ? '-staging' : '';
  return resolve(process.cwd(), `docs/perf-baseline${suffix}-${date}.json`);
}
