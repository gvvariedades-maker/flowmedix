#!/usr/bin/env tsx
/**
 * Smoke remoto JWT: own-user, cross-user (IDOR), matrícula → módulos, RPC admin negada.
 *
 *   npm run smoke:rls-auth
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
 *      SMOKE_RLS_FIXTURE_PASSWORD (mesma senha das contas fixture A/B).
 *
 * Fixtures idempotentes (service role): usuários A/B + matrícula ativa só em A para um concurso com módulos.
 */

import { loadEnvConfig } from '@next/env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  SMOKE_RLS_FIXTURE_ENV,
  SMOKE_RLS_USER_A_EMAIL,
  SMOKE_RLS_USER_B_EMAIL,
} from '../lib/security/rlsAuthSmokeConstants';
import {
  evaluateAuthenticatedDeniedRpc,
  evaluateCrossUserBlocked,
  evaluateEnrolledModulesVisible,
  evaluateOwnRowsVisible,
  evaluateUnenrolledModulesEmpty,
  type RlsAuthCheck,
} from '../lib/security/rlsAuthSmokeChecks';
import { createServerSupabase } from '../lib/supabase/server';

loadEnvConfig(process.cwd());

type Check = RlsAuthCheck;

function logChecks(checks: Check[]) {
  console.log('\n--- smoke:rls-auth (JWT / matrícula / IDOR) ---\n');
  for (const c of checks) {
    console.log(`${c.ok ? '✓' : '✗'} ${c.name}: ${c.detail}`);
  }
}

function jwtClient(url: string, anonKey: string, accessToken: string): SupabaseClient {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureFixtureUser(
  url: string,
  anonKey: string,
  admin: SupabaseClient,
  email: string,
  password: string,
): Promise<string> {
  const probe = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: signInData, error: signInErr } = await probe.auth.signInWithPassword({
    email,
    password,
  });
  if (!signInErr && signInData.user?.id) {
    return signInData.user.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (!error && data.user?.id) return data.user.id;

  const msg = error?.message ?? '';
  if (/already|registered|exists/i.test(msg)) {
    const retry = await probe.auth.signInWithPassword({ email, password });
    if (retry.data.user?.id) return retry.data.user.id;
  }
  throw new Error(`ensureFixtureUser ${email}: ${msg || signInErr?.message || 'failed'}`);
}

async function pickConcursoWithModules(admin: SupabaseClient): Promise<string> {
  const { data: rows, error } = await admin
    .from('concurso_modulos')
    .select('concurso_id')
    .limit(50);
  if (error) throw new Error(`concurso_modulos: ${error.message}`);
  const ids = [...new Set((rows ?? []).map((r) => r.concurso_id as string))];
  if (ids.length === 0) throw new Error('nenhum concurso_modulos — impossível testar matrícula');
  return ids[0]!;
}

async function ensureEnrollmentFixture(
  admin: SupabaseClient,
  userAId: string,
  userBId: string,
  concursoId: string,
): Promise<void> {
  const { error: upsertErr } = await admin.from('concurso_matriculas').upsert(
    {
      user_id: userAId,
      concurso_id: concursoId,
      status: 'ativo',
    },
    { onConflict: 'user_id,concurso_id' },
  );
  if (upsertErr) throw new Error(`matrícula A: ${upsertErr.message}`);

  const { error: delErr } = await admin
    .from('concurso_matriculas')
    .delete()
    .eq('user_id', userBId)
    .eq('concurso_id', concursoId);
  if (delErr) throw new Error(`limpar matrícula B: ${delErr.message}`);
}

async function signIn(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<string> {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`signIn ${email}: ${error?.message ?? 'no session'}`);
  }
  return data.session.access_token;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const password = process.env[SMOKE_RLS_FIXTURE_ENV]?.trim();
  const checks: Check[] = [];

  if (!url || !anonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.');
    process.exit(1);
  }
  if (!password) {
    console.error(`❌ ${SMOKE_RLS_FIXTURE_ENV} é obrigatória para smoke:rls-auth.`);
    process.exit(1);
  }

  const admin = await createServerSupabase();
  const userAId = await ensureFixtureUser(url, anonKey, admin, SMOKE_RLS_USER_A_EMAIL, password);
  const userBId = await ensureFixtureUser(url, anonKey, admin, SMOKE_RLS_USER_B_EMAIL, password);
  const concursoId = await pickConcursoWithModules(admin);
  await ensureEnrollmentFixture(admin, userAId, userBId, concursoId);

  const jwtA = await signIn(url, anonKey, SMOKE_RLS_USER_A_EMAIL, password);
  const jwtB = await signIn(url, anonKey, SMOKE_RLS_USER_B_EMAIL, password);
  const clientA = jwtClient(url, anonKey, jwtA);
  const clientB = jwtClient(url, anonKey, jwtB);

  const notebookTitle = `smoke-rls-auth ${new Date().toISOString()}`;
  const { data: notebookA, error: nbInsertErr } = await clientA
    .from('study_notebooks')
    .insert({ user_id: userAId, title: notebookTitle })
    .select('id, user_id, title')
    .single();

  if (nbInsertErr || !notebookA) {
    checks.push({
      name: 'auth_fixture_notebook_insert',
      ok: false,
      detail: nbInsertErr?.message ?? 'insert falhou',
    });
  } else {
    const { data: listA, error: listAErr } = await clientA
      .from('study_notebooks')
      .select('id, user_id')
      .eq('id', notebookA.id);
    if (listAErr) {
      checks.push({
        name: 'auth_own_notebook_read',
        ok: false,
        detail: listAErr.message,
      });
    } else {
      checks.push(
        evaluateOwnRowsVisible({
          name: 'auth_own_notebook_read',
          rows: listA,
          ownerId: userAId,
          getOwnerId: (r) => r.user_id as string,
          mustIncludeId: notebookA.id,
        }),
      );
    }

    const { data: idorRead, error: idorReadErr } = await clientB
      .from('study_notebooks')
      .select('id')
      .eq('id', notebookA.id);
    checks.push(
      evaluateCrossUserBlocked({
        name: 'auth_cross_user_notebook_read',
        rows: idorRead,
        errorMessage: idorReadErr?.message,
      }),
    );

    const { data: idorUpd, error: idorUpdErr } = await clientB
      .from('study_notebooks')
      .update({ title: 'idor' })
      .eq('id', notebookA.id)
      .select('id');
    checks.push(
      evaluateCrossUserBlocked({
        name: 'auth_cross_user_notebook_update',
        rows: idorUpd,
        errorMessage: idorUpdErr?.message,
      }),
    );

    await clientA.from('study_notebooks').delete().eq('id', notebookA.id);
  }

  const { count: modCountA, error: modErrA } = await clientA
    .from('modulos_estudo')
    .select('id', { count: 'exact', head: true });
  checks.push(
    evaluateEnrolledModulesVisible({
      name: 'auth_enrolled_modulos_estudo',
      count: modCountA,
      errorMessage: modErrA?.message,
      minExpected: 1,
    }),
  );

  const { count: modCountB, error: modErrB } = await clientB
    .from('modulos_estudo')
    .select('id', { count: 'exact', head: true });
  checks.push(
    evaluateUnenrolledModulesEmpty({
      name: 'auth_unenrolled_modulos_estudo',
      count: modCountB,
      errorMessage: modErrB?.message,
    }),
  );

  const { error: rpcErr } = await clientA.rpc('invalidate_cache_via_webhook', {
    table_name: 'historico_questoes',
    event_type: 'INSERT',
  });
  checks.push(
    evaluateAuthenticatedDeniedRpc({
      name: 'auth_cannot_rpc_cache_webhook',
      errorMessage: rpcErr?.message,
    }),
  );

  checks.push({
    name: 'auth_fixture_metadata',
    ok: true,
    detail: `concurso_id=${concursoId.slice(0, 8)}… userA/B provisionados (sem PII)`,
  });

  logChecks(checks);
  const failed = checks.some((c) => !c.ok);
  process.exitCode = failed ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
