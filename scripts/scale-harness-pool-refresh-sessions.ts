#!/usr/bin/env tsx
/**
 * Renova JWT + cookie SSR do pool gitignored (preserva default_questao_slug / opcao_id).
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { refreshHarnessPoolSessions } from '@/lib/scale/authenticatedHarness/poolRefreshSessions';
import {
  assertHarnessProvisionTargetsAllowed,
  DEFAULT_STAGING_SUPABASE_URL,
  formatHarnessProvisionError,
} from '@/lib/scale/authenticatedHarness/poolProvisioning';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';
import { loadPerfEnv, parsePerfTarget } from '@/lib/perf/loadPerfEnv';

function parseArg(name: string): string | undefined {
  const prefix = `${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function loadDotenvFile(rel: string): void {
  const absolute = resolve(process.cwd(), rel);
  if (!existsSync(absolute)) return;
  for (const line of readFileSync(absolute, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value) process.env[trimmed.slice(0, eq).trim()] = value;
  }
}

function hydrateServiceRoleFromSupabaseCli(projectRef: string): void {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return;
  const stdout = execSync(`npx supabase projects api-keys --project-ref ${projectRef}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(stdout) as { keys?: Array<{ id?: string; api_key?: string }> };
  const service = parsed.keys?.find((k) => k.id === 'service_role')?.api_key?.trim();
  if (!service) throw new Error(`service_role ausente para ref ${projectRef}`);
  process.env.SUPABASE_SERVICE_ROLE_KEY = service;
}

async function main() {
  const poolPath =
    parseArg('--pool') ?? 'scale-harness-private/staging-conservative-50.scale-harness-pool.local.json';
  const batch = parseArg('--batch') ?? '20260927';
  const emailDomain = parseArg('--email-domain') ?? 'example.com';
  const envFile = parseArg('--env-file') ?? 'scale-harness-private/.env.harness-pool.local';
  const projectRef = parseArg('--supabase-project-ref') ?? 'higsjzfigprqvldpxfwj';
  const throttleMs = Number.parseInt(parseArg('--throttle-ms') ?? '1200', 10);
  const startIndex = Number.parseInt(parseArg('--start-index') ?? '0', 10);
  const target = parsePerfTarget(process.argv);

  if (envFile) loadDotenvFile(envFile);
  try {
    loadPerfEnv(target);
  } catch {
    loadPerfEnv('local');
  }
  loadDotenvFile(envFile);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_STAGING_SUPABASE_URL;
  hydrateServiceRoleFromSupabaseCli(projectRef);
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

  const pool = JSON.parse(readFileSync(resolve(process.cwd(), poolPath), 'utf8')) as SyntheticUserPoolFile;

  assertHarnessProvisionTargetsAllowed({
    supabaseUrl,
    baseUrl: pool.base_url,
  });

  const absolutePool = resolve(process.cwd(), poolPath);

  const refreshed = await refreshHarnessPoolSessions({
    pool,
    batch,
    emailDomain,
    supabaseUrl,
    serviceRoleKey: serviceKey,
    anonKey,
    throttleMs,
    startIndex,
    onUserRefreshed: ({ pool: snapshot, poolId, index, total }) => {
      writeFileSync(absolutePool, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
      process.stdout.write(`Refresh ${poolId} (${index + 1}/${total})… ok\n`);
    },
  });

  console.log(
    JSON.stringify(
      {
        mode: 'scale-harness-pool-refresh-sessions',
        written: poolPath,
        users: refreshed.users.length,
        batch,
        throttle_ms: throttleMs,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(formatHarnessProvisionError(err));
  process.exit(1);
});
