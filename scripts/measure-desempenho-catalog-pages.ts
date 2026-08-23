#!/usr/bin/env tsx
/**
 * Medição isolada de getAccessibleModulosForUser (sem Next cache).
 *   npx tsx scripts/measure-desempenho-catalog-pages.ts
 */
import { loadEnvConfig } from '@next/env';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { getAccessibleModulosForUser } from '../lib/concursos/entitlements';
import { createServerSupabase } from '../lib/supabase/server';

loadEnvConfig(process.cwd());

async function resolveUserId() {
  const fromEnv = process.env.DESEMPENHO_AUDIT_USER_ID?.trim();
  if (fromEnv) return fromEnv;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('historico_questoes').select('user_id').limit(20000);
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = (row as { user_id: string }).user_id;
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  let best: string | null = null;
  let n = 0;
  for (const [id, count] of counts) {
    if (count > n) {
      best = id;
      n = count;
    }
  }
  if (!best) throw new Error('sem user');
  return best;
}

async function timeCatalog(userId: string) {
  const t0 = performance.now();
  const rows = await getAccessibleModulosForUser(userId);
  return { ms: Math.round(performance.now() - t0), count: rows.length };
}

async function main() {
  const userId = await resolveUserId();
  const cold: Array<{ ms: number; count: number }> = [];
  for (let i = 0; i < 3; i += 1) {
    cold.push(await timeCatalog(userId));
  }
  const warm: Array<{ ms: number; count: number }> = [];
  for (let i = 0; i < 3; i += 1) {
    warm.push(await timeCatalog(userId));
  }
  const out = {
    measuredAt: new Date().toISOString(),
    userIdShort: `${userId.slice(0, 8)}…`,
    cold,
    warm,
    coldAvgMs: Math.round(cold.reduce((s, x) => s + x.ms, 0) / cold.length),
    warmAvgMs: Math.round(warm.reduce((s, x) => s + x.ms, 0) / warm.length),
  };
  const path = resolve(process.cwd(), 'artifacts/desempenho-catalog-pages-isolated.json');
  writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
