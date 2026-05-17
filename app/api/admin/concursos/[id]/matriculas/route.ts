import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAdminSessionEmail } from '@/lib/constants';
import {
  ConcursoAdminMatriculaRevogarSchema,
  ConcursoAdminMatriculaSchema,
} from '@/lib/validations';
import { invalidateUserModulosCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

const MATRICULAS_LIST_LIMIT = 500;

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const email = session?.user?.email?.toLowerCase();
  if (!email) {
    return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  }
  if (!isAdminSessionEmail(email)) {
    return { error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }) };
  }

  return { admin: await createServerSupabase() };
}

async function emailsPorUserId(
  admin: SupabaseClient,
  userIds: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(userIds)];
  const out = new Map<string, string>();
  const chunk = 25;
  for (let i = 0; i < unique.length; i += chunk) {
    const part = unique.slice(i, i + chunk);
    await Promise.all(
      part.map(async (uid) => {
        try {
          const { data, error } = await admin.auth.admin.getUserById(uid);
          if (error || !data.user?.email) {
            out.set(uid, '—');
          } else {
            out.set(uid, data.user.email);
          }
        } catch {
          out.set(uid, '—');
        }
      }),
    );
  }
  return out;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { id: concursoId } = await params;

  const { data: concurso, error: cErr } = await auth.admin
    .from('concursos')
    .select('id, slug, nome')
    .eq('id', concursoId)
    .maybeSingle();

  if (cErr) {
    logger.error('Admin: concurso para matrículas', cErr, { concursoId });
    return NextResponse.json({ error: 'Erro ao carregar concurso' }, { status: 500 });
  }
  if (!concurso) {
    return NextResponse.json({ error: 'Concurso não encontrado' }, { status: 404 });
  }

  const { data: rows, error: mErr } = await auth.admin
    .from('concurso_matriculas')
    .select('user_id, origem, status, expires_at, created_at')
    .eq('concurso_id', concursoId)
    .order('created_at', { ascending: false })
    .limit(MATRICULAS_LIST_LIMIT);

  if (mErr) {
    logger.error('Admin: listar matrículas', mErr, { concursoId });
    return NextResponse.json({ error: 'Erro ao listar matrículas' }, { status: 500 });
  }

  const list = rows ?? [];
  const emailMap = await emailsPorUserId(
    auth.admin,
    list.map((r) => r.user_id as string),
  );

  const matriculas = list.map((r) => ({
    userId: r.user_id as string,
    email: emailMap.get(r.user_id as string) ?? '—',
    origem: r.origem as string,
    status: r.status as string,
    expiresAt: r.expires_at as string | null,
    createdAt: r.created_at as string,
  }));

  return NextResponse.json({ concurso, matriculas });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { id: routeConcursoId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = ConcursoAdminMatriculaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  if (parsed.data.concursoId !== routeConcursoId) {
    return NextResponse.json({ error: 'Concurso da rota não confere com o payload' }, { status: 400 });
  }

  const { error } = await auth.admin.from('concurso_matriculas').upsert(
    {
      user_id: parsed.data.userId,
      concurso_id: parsed.data.concursoId,
      origem: 'admin',
      status: 'ativo',
      expires_at: null,
    },
    { onConflict: 'user_id,concurso_id' },
  );

  if (error) {
    logger.error('Falha na matrícula admin', error, parsed.data);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await invalidateUserModulosCache(parsed.data.userId);
  } catch (cacheError) {
    logger.warn('Falha ao invalidar cache após matrícula admin', {
      userId: parsed.data.userId,
      error: cacheError instanceof Error ? cacheError.message : String(cacheError),
    });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { id: routeConcursoId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = ConcursoAdminMatriculaRevogarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  const { error } = await auth.admin
    .from('concurso_matriculas')
    .update({ status: 'expirado' })
    .eq('concurso_id', routeConcursoId)
    .eq('user_id', parsed.data.userId);

  if (error) {
    logger.error('Falha ao revogar matrícula admin', error, {
      concursoId: routeConcursoId,
      userId: parsed.data.userId,
    });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await invalidateUserModulosCache(parsed.data.userId);
  } catch (cacheError) {
    logger.warn('Falha ao invalidar cache após revogar matrícula', {
      userId: parsed.data.userId,
      error: cacheError instanceof Error ? cacheError.message : String(cacheError),
    });
  }

  return NextResponse.json({ ok: true });
}
