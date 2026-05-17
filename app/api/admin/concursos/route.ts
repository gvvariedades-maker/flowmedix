import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAdminSessionEmail } from '@/lib/constants';
import { ConcursoAdminUpsertSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

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

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { data, error } = await auth.admin
    .from('concursos')
    .select('id, slug, nome, cidade, orgao, banca, ano, cargo, tipo, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Falha ao listar concursos (admin)', error);
    return NextResponse.json({ error: 'Erro ao listar concursos' }, { status: 500 });
  }

  return NextResponse.json({ concursos: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = ConcursoAdminUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  const insertRow = { ...parsed.data, status: 'rascunho' as const };

  const { data, error } = await auth.admin
    .from('concursos')
    .insert(insertRow)
    .select(
      'id, slug, nome, cidade, orgao, banca, ano, cargo, tipo, status, price_cents, data_prova, descricao, destaque, created_at',
    )
    .single();

  if (error) {
    logger.error('Falha ao criar concurso', error, { slug: parsed.data.slug });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ concurso: data });
}
