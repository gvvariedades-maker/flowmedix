#!/usr/bin/env tsx
/**
 * Preflight read-only: concurso geral, harness users, matrículas, slugs/opções.
 * Não matricula; não executa carga.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  assertHarnessProvisionTargetsAllowed,
  DEFAULT_STAGING_SUPABASE_URL,
  formatHarnessProvisionError,
  formatHarnessSyntheticEmail,
  mapHarnessEmailsToAuthUserIds,
} from '@/lib/scale/authenticatedHarness/poolProvisioning';
import {
  buildSlugPreflightChecks,
  HARNESS_GERAL_CONCURSO_SLUG,
  type PoolPreflightReport,
} from '@/lib/scale/authenticatedHarness/poolPreflightReport';
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
  const absolute = resolve(process.cwd(), pathRel);
  return JSON.parse(readFileSync(absolute, 'utf8')) as SyntheticUserPoolFile;
}

async function main() {
  const poolPath =
    parseArg('--pool') ?? 'scale-harness-private/staging-conservative-50.scale-harness-pool.local.json';
  const batch = parseArg('--batch') ?? '20260927';
  const emailDomain = parseArg('--email-domain') ?? 'example.com';
  const envFile = parseArg('--env-file') ?? 'scale-harness-private/.env.harness-pool.local';
  const projectRef = parseArg('--supabase-project-ref') ?? 'higsjzfigprqvldpxfwj';
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

  const pool = loadPool(poolPath);
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const blockers: string[] = [];
  const host = new URL(supabaseUrl).hostname;
  const projectRefResolved = host.split('.')[0] ?? projectRef;

  if (projectRefResolved === 'ozgouenqrofnvgrlgfwd') {
    blockers.push('projeto Production ozgouen — bloqueado');
  }

  const { data: concursoRow, error: concursoError } = await admin
    .from('concursos')
    .select('id, slug, status')
    .eq('slug', HARNESS_GERAL_CONCURSO_SLUG)
    .maybeSingle();
  if (concursoError) throw concursoError;

  const concurso =
    concursoRow?.id
      ? {
          slug: String(concursoRow.slug),
          id: String(concursoRow.id),
          status: String(concursoRow.status ?? ''),
        }
      : null;

  if (!concurso) blockers.push('concurso slug geral não encontrado');
  if (concurso && concurso.status !== 'ativo') {
    blockers.push(`concurso geral status=${concurso.status} (esperado ativo)`);
  }

  let concursoModulosCount = 0;
  const uniqueSlugs = [
    ...new Set(pool.users.map((u) => u.default_questao_slug?.trim()).filter(Boolean) as string[]),
  ];

  const slugLinked = new Set<string>();
  const conteudoBySlug = new Map<string, unknown>();

  if (concurso) {
    const { count, error: cmCountError } = await admin
      .from('concurso_modulos')
      .select('id', { count: 'exact', head: true })
      .eq('concurso_id', concurso.id);
    if (cmCountError) throw cmCountError;
    concursoModulosCount = count ?? 0;

    if (uniqueSlugs.length > 0) {
      const { data: modulos, error: modError } = await admin
        .from('modulos_estudo')
        .select('id, modulo_slug, conteudo_json')
        .in('modulo_slug', uniqueSlugs);
      if (modError) throw modError;

      const moduloIds: string[] = [];
      for (const row of modulos ?? []) {
        const slug = (row as { modulo_slug?: string }).modulo_slug?.trim();
        const id = (row as { id?: string }).id;
        if (slug) {
          conteudoBySlug.set(slug, (row as { conteudo_json?: unknown }).conteudo_json);
        }
        if (id) moduloIds.push(id);
      }

      if (moduloIds.length > 0) {
        const { data: links, error: linkError } = await admin
          .from('concurso_modulos')
          .select('modulo_id')
          .eq('concurso_id', concurso.id)
          .in('modulo_id', moduloIds);
        if (linkError) throw linkError;

        const linkedModuloIds = new Set(
          (links ?? []).map((r) => String((r as { modulo_id?: string }).modulo_id)),
        );
        for (const row of modulos ?? []) {
          const slug = (row as { modulo_slug?: string }).modulo_slug?.trim();
          const id = (row as { id?: string }).id;
          if (slug && id && linkedModuloIds.has(id)) slugLinked.add(slug);
        }
      }
    }
  }

  const slugReport = buildSlugPreflightChecks(pool, slugLinked, conteudoBySlug, 8);
  if (uniqueSlugs.length > 0 && slugLinked.size < uniqueSlugs.length) {
    blockers.push('default_questao_slug fora do pacote concurso geral');
  }
  if (uniqueSlugs.length > 0 && slugReport.opcaoValid < uniqueSlugs.length) {
    blockers.push('default_opcao_id inválido para um ou mais slugs');
  }

  const emails = Array.from({ length: pool.users.length }, (_, i) =>
    formatHarnessSyntheticEmail(batch, i, emailDomain).toLowerCase(),
  );
  const authIdByEmail = await mapHarnessEmailsToAuthUserIds(admin, emails);
  const foundInAuth = authIdByEmail.size;

  if (foundInAuth < pool.users.length) {
    blockers.push(`auth: ${foundInAuth}/${pool.users.length} e-mails harness encontrados`);
  }

  const matriculaStats = {
    active_total_for_harness_users: 0,
    active_invite: 0,
    active_cadastro: 0,
    active_stripe_pro: 0,
    other_origem: 0,
  };

  if (concurso && authIdByEmail.size > 0) {
    const harnessUserIds = [...authIdByEmail.values()];
    const { data: matriculas, error: matError } = await admin
      .from('concurso_matriculas')
      .select('user_id, origem, status')
      .eq('concurso_id', concurso.id)
      .in('user_id', harnessUserIds)
      .eq('status', 'ativo');
    if (matError) throw matError;
    for (const row of matriculas ?? []) {
      matriculaStats.active_total_for_harness_users += 1;
      const origem = String((row as { origem?: string }).origem ?? '');
      if (origem === 'invite') matriculaStats.active_invite += 1;
      else if (origem === 'cadastro') matriculaStats.active_cadastro += 1;
      else if (origem === 'stripe_pro') matriculaStats.active_stripe_pro += 1;
      else matriculaStats.other_origem += 1;
    }
  }

  const matriculaPending = matriculaStats.active_invite < pool.users.length;
  const hardBlockers = blockers.filter((b) => !b.startsWith('auth:'));

  const report: PoolPreflightReport = {
    mode: 'scale-harness-pool-preflight',
    supabase_project_ref: projectRefResolved,
    supabase_host: host,
    concurso,
    concurso_modulos_count: concursoModulosCount,
    harness_users: {
      batch,
      email_domain: emailDomain,
      expected: pool.users.length,
      found_in_auth: foundInAuth,
      pool_file_users: pool.users.length,
    },
    matriculas_geral: matriculaStats,
    pool_slugs: {
      unique_slugs: uniqueSlugs.length,
      linked_to_geral: slugLinked.size,
      opcao_valid: slugReport.opcaoValid,
      all_linked_and_opcao_valid:
        slugLinked.size >= uniqueSlugs.length && slugReport.opcaoValid >= uniqueSlugs.length,
      sample_checks: slugReport.checks,
    },
    ready_for_invite_matricula_fixture:
      hardBlockers.length === 0 && matriculaPending && foundInAuth === pool.users.length,
    blockers: [...blockers, ...(matriculaPending ? ['matrícula invite ativa pendente (esperado antes do ensaio)'] : [])],
  };

  console.log(JSON.stringify(report, null, 2));
  if (hardBlockers.length > 0) process.exit(2);
}

main().catch((err) => {
  console.error(formatHarnessProvisionError(err));
  process.exit(1);
});
