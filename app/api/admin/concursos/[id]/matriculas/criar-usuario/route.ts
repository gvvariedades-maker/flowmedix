import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { findOrCreateAuthUserByEmail } from '@/lib/supabase/adminUsers';
import { AdminCriarUsuarioMatriculaSchema } from '@/lib/validations';
import { invalidateUserModulosCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { id: concursoId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = AdminCriarUsuarioMatriculaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  const { data: concurso, error: cErr } = await auth.admin
    .from('concursos')
    .select('id')
    .eq('id', concursoId)
    .maybeSingle();

  if (cErr) {
    logger.error('Admin criar-usuario: concurso', cErr, { concursoId });
    return NextResponse.json({ error: 'Erro ao validar concurso' }, { status: 500 });
  }
  if (!concurso) {
    return NextResponse.json({ error: 'Concurso não encontrado' }, { status: 404 });
  }

  const targetEmail = parsed.data.email.toLowerCase().trim();
  const displayName = parsed.data.nome?.trim() || null;

  try {
    const { userId, created } = await findOrCreateAuthUserByEmail(
      auth.admin,
      targetEmail,
      displayName,
    );

    const { error: matriculaError } = await auth.admin.from('concurso_matriculas').upsert(
      {
        user_id: userId,
        concurso_id: concursoId,
        origem: 'admin',
        status: 'ativo',
        expires_at: null,
      },
      { onConflict: 'user_id,concurso_id' },
    );

    if (matriculaError) {
      logger.error('Admin criar-usuario: matrícula', matriculaError, { concursoId, userId });
      return NextResponse.json({ error: matriculaError.message }, { status: 400 });
    }

    try {
      await invalidateUserModulosCache(userId);
    } catch (cacheError) {
      logger.warn('Falha ao invalidar cache após criar-usuario matrícula', {
        userId,
        error: cacheError instanceof Error ? cacheError.message : String(cacheError),
      });
    }

    return NextResponse.json({
      ok: true,
      userId,
      email: targetEmail,
      created,
      message: created
        ? 'Conta criada e matrícula registrada. O aluno deve usar “Esqueci a senha” no login para definir a senha.'
        : 'Usuário já existia; matrícula registrada ou reativada.',
    });
  } catch (error) {
    logger.error('Admin criar-usuario', error, { concursoId, email: targetEmail });
    const msg = error instanceof Error ? error.message : 'Erro ao criar usuário';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
