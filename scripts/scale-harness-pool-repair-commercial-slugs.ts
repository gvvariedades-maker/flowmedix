#!/usr/bin/env tsx
/**
 * Substitui default_questao_slug inelegíveis (commercial authority) no pool existente.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { evaluateHarnessSlugCommercialEligibility } from '@/lib/scale/authenticatedHarness/poolCommercialEligibility';
import { fetchHarnessCommercialQuestionFixtures } from '@/lib/scale/authenticatedHarness/poolCommercialFixtures';
import {
  assertHarnessProvisionTargetsAllowed,
  DEFAULT_STAGING_SUPABASE_URL,
  formatHarnessProvisionError,
} from '@/lib/scale/authenticatedHarness/poolProvisioning';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';
import { loadPerfEnv, parsePerfTarget } from '@/lib/perf/loadPerfEnv';

function parseArg(name: string): string | undefined {
  const prefix = `${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

function loadDotenvFile(rel: string): void {
  const absolute = resolve(process.cwd(), rel);
  if (!existsSync(absolute)) return;
  for (const line of readFileSync(absolute, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[t.slice(0, eq).trim()] = v;
  }
}

function hydrateServiceRole(projectRef: string): void {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return;
  const stdout = execSync(`npx supabase projects api-keys --project-ref ${projectRef}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const key = (JSON.parse(stdout) as { keys?: Array<{ id?: string; api_key?: string }> }).keys?.find(
    (k) => k.id === 'service_role',
  )?.api_key;
  if (!key) throw new Error('service_role ausente');
  process.env.SUPABASE_SERVICE_ROLE_KEY = key;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const poolPath =
    parseArg('--pool') ?? 'scale-harness-private/staging-conservative-50.scale-harness-pool.local.json';
  const envFile = parseArg('--env-file') ?? 'scale-harness-private/.env.harness-pool.local';
  const projectRef = parseArg('--supabase-project-ref') ?? 'higsjzfigprqvldpxfwj';
  const target = parsePerfTarget(process.argv);

  loadDotenvFile(envFile);
  try {
    loadPerfEnv(target);
  } catch {
    loadPerfEnv('local');
  }
  loadDotenvFile(envFile);

  const pool = JSON.parse(readFileSync(resolve(process.cwd(), poolPath), 'utf8')) as SyntheticUserPoolFile;
  assertHarnessProvisionTargetsAllowed({
    supabaseUrl: pool.supabase_url ?? DEFAULT_STAGING_SUPABASE_URL,
    baseUrl: pool.base_url,
  });

  hydrateServiceRole(projectRef);
  const admin = createClient(
    pool.supabase_url ?? DEFAULT_STAGING_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const slugMeta = new Map<string, { titulo_aula: string | null; conteudo_json: unknown }>();
  const slugs = [...new Set(pool.users.map((u) => u.default_questao_slug?.trim()).filter(Boolean))];
  if (slugs.length > 0) {
    const { data } = await admin
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, conteudo_json')
      .in('modulo_slug', slugs);
    for (const row of data ?? []) {
      const slug = (row as { modulo_slug?: string }).modulo_slug?.trim();
      if (slug) {
        slugMeta.set(slug, {
          titulo_aula: (row as { titulo_aula?: string | null }).titulo_aula ?? null,
          conteudo_json: (row as { conteudo_json?: unknown }).conteudo_json,
        });
      }
    }
  }

  const repairs: Array<{
    pool_id: string;
    from_slug: string;
    to_slug: string;
    to_opcao_id: string;
    reason: string;
  }> = [];

  const usedSlugs = new Set(
    pool.users.map((u) => u.default_questao_slug?.trim()).filter(Boolean) as string[],
  );

  for (const user of pool.users) {
    const slug = user.default_questao_slug?.trim() ?? '';
    const meta = slugMeta.get(slug);
    const commercial = meta
      ? evaluateHarnessSlugCommercialEligibility({
          modulo_slug: slug,
          titulo_aula: meta.titulo_aula,
          conteudo_json: meta.conteudo_json,
        })
      : { commercial_eligible: false, commercial_reason: 'SLUG_NOT_IN_CATALOG' as const };
    if (commercial.commercial_eligible) continue;

    const [fixture] = await fetchHarnessCommercialQuestionFixtures(admin, 1, usedSlugs);
    repairs.push({
      pool_id: user.pool_id,
      from_slug: slug,
      to_slug: fixture.modulo_slug,
      to_opcao_id: fixture.default_opcao_id,
      reason: commercial.commercial_reason ?? 'INELIGIBLE',
    });
    usedSlugs.delete(slug);
    usedSlugs.add(fixture.modulo_slug);
    user.default_questao_slug = fixture.modulo_slug;
    user.default_opcao_id = fixture.default_opcao_id;
  }

  const report = {
    mode: 'scale-harness-pool-repair-commercial-slugs',
    apply,
    pool_path: poolPath,
    repairs,
    remaining_ineligible: repairs.length,
  };
  console.log(JSON.stringify(report, null, 2));

  if (repairs.length === 0) {
    return;
  }
  if (!apply) {
    console.error('Dry-run: passe --apply para gravar o pool');
    process.exit(1);
  }
  writeFileSync(resolve(process.cwd(), poolPath), `${JSON.stringify(pool, null, 2)}\n`, 'utf8');
}

main().catch((err) => {
  console.error(formatHarnessProvisionError(err));
  process.exit(1);
});
