import type { SupabaseClient } from '@supabase/supabase-js';
import { HARNESS_GERAL_CONCURSO_SLUG } from '@/lib/scale/authenticatedHarness/poolPreflightReport';
import {
  formatHarnessSyntheticEmail,
  mapHarnessEmailsToAuthUserIds,
} from '@/lib/scale/authenticatedHarness/poolProvisioning';

export const HARNESS_MATRICULA_ORIGEM = 'invite' as const;
export const DEFAULT_HARNESS_MATRICULA_EXPIRES_DAYS = 90;

export type GeralConcursoRef = {
  id: string;
  slug: string;
  status: string;
};

export type HarnessMatriculaFixturePlanRow = {
  email: string;
  user_id: string;
};

export type HarnessMatriculaFixtureReport = {
  mode: 'scale-harness-pool-matricula-fixture';
  dry_run: boolean;
  supabase_project_ref: string;
  concurso: GeralConcursoRef | null;
  batch: string;
  email_domain: string;
  expires_at: string;
  users_targeted: number;
  users_resolved_in_auth: number;
  matriculas_before_active_invite: number;
  matriculas_upserted: number;
  matriculas_already_ok: number;
  cleanup_user_count: number;
  blockers: string[];
};

export function buildHarnessMatriculaExpiresAt(daysFromNow: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString();
}

export function assertHarnessMatriculaEmailAllowed(email: string, batch: string): void {
  const normalized = email.toLowerCase().trim();
  const expectedPrefix = `scale.harness.${batch.replace(/[^a-zA-Z0-9._+-]/g, '-').toLowerCase()}.`;
  if (!normalized.startsWith(expectedPrefix) || !normalized.includes('@')) {
    throw new Error(`E-mail fora do allowlist harness: ${email}`);
  }
}

export async function resolveGeralConcursoForHarness(
  admin: SupabaseClient,
): Promise<GeralConcursoRef | null> {
  const { data, error } = await admin
    .from('concursos')
    .select('id, slug, status')
    .eq('slug', HARNESS_GERAL_CONCURSO_SLUG)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) return null;
  return {
    id: String(data.id),
    slug: String(data.slug),
    status: String(data.status ?? ''),
  };
}

export async function countActiveInviteMatriculasForUsers(
  admin: SupabaseClient,
  concursoId: string,
  userIds: string[],
): Promise<number> {
  if (userIds.length === 0) return 0;
  const { count, error } = await admin
    .from('concurso_matriculas')
    .select('id', { count: 'exact', head: true })
    .eq('concurso_id', concursoId)
    .eq('origem', HARNESS_MATRICULA_ORIGEM)
    .eq('status', 'ativo')
    .in('user_id', userIds);
  if (error) throw error;
  return count ?? 0;
}

export async function planHarnessMatriculaFixture(options: {
  admin: SupabaseClient;
  userCount: number;
  batch: string;
  emailDomain: string;
}): Promise<{ concurso: GeralConcursoRef | null; rows: HarnessMatriculaFixturePlanRow[] }> {
  const emails = Array.from({ length: options.userCount }, (_, i) =>
    formatHarnessSyntheticEmail(options.batch, i, options.emailDomain),
  );
  for (const email of emails) {
    assertHarnessMatriculaEmailAllowed(email, options.batch);
  }
  const concurso = await resolveGeralConcursoForHarness(options.admin);
  const authIdByEmail = await mapHarnessEmailsToAuthUserIds(options.admin, emails);
  const rows: HarnessMatriculaFixturePlanRow[] = [];
  for (const email of emails) {
    const userId = authIdByEmail.get(email.toLowerCase());
    if (userId) rows.push({ email, user_id: userId });
  }
  return { concurso, rows };
}

export async function applyHarnessInviteMatriculaFixture(options: {
  admin: SupabaseClient;
  concursoId: string;
  rows: HarnessMatriculaFixturePlanRow[];
  expiresAt: string;
}): Promise<{ upserted: number; already_ok: number }> {
  let upserted = 0;
  let already_ok = 0;

  for (const row of options.rows) {
    const { data: existing, error: readError } = await options.admin
      .from('concurso_matriculas')
      .select('origem, status, expires_at')
      .eq('user_id', row.user_id)
      .eq('concurso_id', options.concursoId)
      .maybeSingle();
    if (readError) throw readError;

    const ok =
      existing?.origem === HARNESS_MATRICULA_ORIGEM &&
      existing?.status === 'ativo' &&
      existing?.expires_at &&
      new Date(existing.expires_at).getTime() > Date.now();

    if (ok) {
      already_ok += 1;
      continue;
    }

    const { error: upsertError } = await options.admin.from('concurso_matriculas').upsert(
      {
        user_id: row.user_id,
        concurso_id: options.concursoId,
        origem: HARNESS_MATRICULA_ORIGEM,
        status: 'ativo',
        expires_at: options.expiresAt,
      },
      { onConflict: 'user_id,concurso_id' },
    );
    if (upsertError) throw upsertError;
    upserted += 1;
  }

  return { upserted, already_ok };
}
