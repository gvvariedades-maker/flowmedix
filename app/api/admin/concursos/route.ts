import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { ConcursoAdminUpsertSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET() {
  const auth = await requireAdminApi();
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
  const auth = await requireAdminApi();
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
