#!/usr/bin/env tsx
/**
 * Fixture staging: matrícula Pro-like (geral + invite) para usuários scale.harness.*.
 * Idempotente; só higsjz. Não executa carga.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  applyHarnessInviteMatriculaFixture,
  buildHarnessMatriculaExpiresAt,
  countActiveInviteMatriculasForUsers,
  DEFAULT_HARNESS_MATRICULA_EXPIRES_DAYS,
  planHarnessMatriculaFixture,
  type HarnessMatriculaFixtureReport,
} from '@/lib/scale/authenticatedHarness/poolMatriculaFixture';
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

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function loadDotenvFile(rel: string): void {
  const absolute = resolve(process.cwd(), rel);
  if (!existsSync(absolute)) return;
  const content = readFileSync(absolute, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value) process.env[key] = value;
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

function loadPool(pathRel: string): SyntheticUserPoolFile {
  return JSON.parse(readFileSync(resolve(process.cwd(), pathRel), 'utf8')) as SyntheticUserPoolFile;
}

async function main() {
  const apply = hasFlag('--apply');
  const poolPath =
    parseArg('--pool') ?? 'scale-harness-private/staging-conservative-50.scale-harness-pool.local.json';
  const batch = parseArg('--batch') ?? '20260927';
  const emailDomain = parseArg('--email-domain') ?? 'example.com';
  const envFile = parseArg('--env-file') ?? 'scale-harness-private/.env.harness-pool.local';
  const projectRef = parseArg('--supabase-project-ref') ?? 'higsjzfigprqvldpxfwj';
  const expiresDays = Number.parseInt(parseArg('--expires-days') ?? String(DEFAULT_HARNESS_MATRICULA_EXPIRES_DAYS), 10);
  const cleanupOut =
    parseArg('--cleanup-out') ??
    'scale-harness-private/staging-conservative-50.matricula-fixture.cleanup.json';
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

  assertHarnessProvisionTargetsAllowed({
    supabaseUrl,
    baseUrl: 'https://flowmedix-git-staging-gvvariedades-makers-projects.vercel.app',
  });

  const host = new URL(supabaseUrl).hostname;
  const projectRefResolved = host.split('.')[0] ?? projectRef;
  if (projectRefResolved === 'ozgouenqrofnvgrlgfwd') {
    throw new Error('Production ozgouen bloqueado');
  }

  const pool = loadPool(poolPath);
  const expiresAt = buildHarnessMatriculaExpiresAt(expiresDays);
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const blockers: string[] = [];
  const { concurso, rows } = await planHarnessMatriculaFixture({
    admin,
    userCount: pool.users.length,
    batch,
    emailDomain,
  });

  if (!concurso) blockers.push('concurso geral não encontrado');
  if (concurso && concurso.status !== 'ativo') {
    blockers.push(`concurso geral status=${concurso.status}`);
  }
  if (rows.length < pool.users.length) {
    blockers.push(`auth: ${rows.length}/${pool.users.length} usuários harness resolvidos`);
  }

  const userIds = rows.map((r) => r.user_id);
  const beforeInvite =
    concurso ? await countActiveInviteMatriculasForUsers(admin, concurso.id, userIds) : 0;

  let upserted = 0;
  let already_ok = 0;

  if (apply && concurso && blockers.length === 0) {
    const result = await applyHarnessInviteMatriculaFixture({
      admin,
      concursoId: concurso.id,
      rows,
      expiresAt,
    });
    upserted = result.upserted;
    already_ok = result.already_ok;
  }

  const afterInvite =
    concurso && apply
      ? await countActiveInviteMatriculasForUsers(admin, concurso.id, userIds)
      : beforeInvite;

  const report: HarnessMatriculaFixtureReport = {
    mode: 'scale-harness-pool-matricula-fixture',
    dry_run: !apply,
    supabase_project_ref: projectRefResolved,
    concurso,
    batch,
    email_domain: emailDomain,
    expires_at: expiresAt,
    users_targeted: pool.users.length,
    users_resolved_in_auth: rows.length,
    matriculas_before_active_invite: beforeInvite,
    matriculas_upserted: upserted,
    matriculas_already_ok: already_ok,
    cleanup_user_count: apply ? userIds.length : 0,
    blockers,
  };

  console.log(JSON.stringify(report, null, 2));

  if (apply && blockers.length === 0) {
    const cleanupPayload = {
      schema_version: 1,
      concurso_id: concurso!.id,
      concurso_slug: concurso!.slug,
      origem: 'invite',
      batch,
      expires_at: expiresAt,
      user_ids: userIds,
      count: userIds.length,
    };
    const abs = resolve(process.cwd(), cleanupOut);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, JSON.stringify(cleanupPayload, null, 2), 'utf8');
    console.error(`cleanup manifest: ${cleanupOut}`);
  }

  if (blockers.length > 0) process.exit(2);
  if (apply && afterInvite < pool.users.length) {
    console.error(`matrículas invite ativas após apply: ${afterInvite}/${pool.users.length}`);
    process.exit(3);
  }
}

main().catch((err) => {
  console.error(formatHarnessProvisionError(err));
  process.exit(1);
});
