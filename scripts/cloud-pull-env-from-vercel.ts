#!/usr/bin/env tsx
/**
 * Bootstrap de env para Cloud Agents — puxa secrets do projeto Vercel.
 *
 * Pré-requisito: VERCEL_TOKEN (Dashboard Vercel → Settings → Tokens)
 *   ou auth.json do `vercel login`.
 *
 * Uso:
 *   VERCEL_TOKEN=... npm run cloud:pull-env
 *   npm run cloud:pull-env -- --dry-run
 *
 * Grava só em .env.local (gitignored). Não imprime valores secretos.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const PROJECT_ID = 'prj_JQl6DT8ZO9ZS5U605ArlChAWdzXN';
const TEAM_ID = 'team_XIpT0h00cn8EPNIACpffDsff';

const WANTED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'ADMIN_EMAIL',
  'ADMIN_EMAILS',
] as const;

function readVercelToken(): string {
  const fromEnv = (process.env.VERCEL_TOKEN ?? '').trim();
  if (fromEnv) return fromEnv;

  const candidates = [
    join(process.env.APPDATA ?? '', 'com.vercel.cli', 'Data', 'auth.json'),
    join(homedir(), '.local', 'share', 'com.vercel.cli', 'auth.json'),
    join(homedir(), '.config', 'vercel', 'auth.json'),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { token?: string };
    if (parsed.token?.trim()) return parsed.token.trim();
  }
  throw new Error(
    'VERCEL_TOKEN ausente. Crie em https://vercel.com/account/tokens e rode:\n' +
      '  VERCEL_TOKEN=... npm run cloud:pull-env\n' +
      'Ou adicione SUPABASE_SERVICE_ROLE_KEY como Runtime Secret em\n' +
      '  https://cursor.com/dashboard/cloud-agents',
  );
}

function upsertEnvFile(path: string, updates: Record<string, string>): void {
  let content = existsSync(path) ? readFileSync(path, 'utf8') : '';
  if (content && !content.endsWith('\n')) content += '\n';
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(content)) content = content.replace(re, line);
    else content += `${line}\n`;
  }
  writeFileSync(path, content, 'utf8');
}

async function fetchEnvMap(token: string): Promise<Record<string, string>> {
  const listUrl = `https://api.vercel.com/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&decrypt=true`;
  const res = await fetch(listUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel env list ${res.status}: ${body.slice(0, 300)}`);
  }
  const payload = (await res.json()) as {
    envs?: Array<{ key?: string; value?: string; target?: string[] | string; id?: string }>;
  };
  const envs = payload.envs ?? [];
  const preferTarget = (targets: string[] | string | undefined): number => {
    const t = Array.isArray(targets) ? targets : targets ? [targets] : [];
    if (t.includes('production')) return 0;
    if (t.includes('preview')) return 1;
    return 2;
  };
  const byKey = new Map<string, { value: string; rank: number }>();
  for (const row of envs) {
    const key = row.key?.trim();
    if (!key || !WANTED.includes(key as (typeof WANTED)[number])) continue;
    let value = row.value?.trim() ?? '';
    // Algumas contas exigem GET por id para decrypt
    if (!value && row.id) {
      const oneUrl = `https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${row.id}?teamId=${TEAM_ID}`;
      const one = await fetch(oneUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (one.ok) {
        const detail = (await one.json()) as { value?: string };
        value = detail.value?.trim() ?? '';
      }
    }
    if (!value) continue;
    const rank = preferTarget(row.target);
    const prev = byKey.get(key);
    if (!prev || rank < prev.rank) byKey.set(key, { value, rank });
  }
  return Object.fromEntries([...byKey.entries()].map(([k, v]) => [k, v.value]));
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const token = readVercelToken();
  const map = await fetchEnvMap(token);

  if (!map.NEXT_PUBLIC_APP_URL) {
    map.NEXT_PUBLIC_APP_URL = 'https://www.avant.enf.br';
  }

  const found = WANTED.filter((k) => Boolean(map[k]));
  const missing = WANTED.filter((k) => !map[k]);
  console.log(`[cloud:pull-env] found=${found.length} missing=${missing.length}`);
  for (const k of found) console.log(`  ✅ ${k} (${map[k]!.length} chars)`);
  for (const k of missing) console.log(`  ❌ ${k}`);

  if (!map.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não veio da Vercel — verifique o projeto flowmedix / Production.');
  }
  if (dryRun) {
    console.log('[cloud:pull-env] dry-run — não gravou .env.local');
    return;
  }

  const envPath = resolve(process.cwd(), '.env.local');
  upsertEnvFile(envPath, map);
  console.log(`[cloud:pull-env] OK → ${envPath} (gitignored)`);
}

main().catch((err) => {
  console.error('[cloud:pull-env]', err instanceof Error ? err.message : err);
  process.exit(1);
});
