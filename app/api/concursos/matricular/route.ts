import { NextRequest, NextResponse } from 'next/server';
import { ConcursoMatriculaSchema } from '@/lib/validations';
import { matricularPorSlug } from '@/lib/concursos/entitlements';
import { invalidateUserModulosCache } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { getServerUser } from '@/lib/supabase/server-auth';

export async function POST(request: NextRequest) {
  const user = await getServerUser();

  if (!user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = ConcursoMatriculaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 400 },
    );
  }

  if (!parsed.data.concursoSlug) {
    return NextResponse.json({ error: 'Slug do concurso é obrigatório.' }, { status: 400 });
  }

  try {
    const concurso = await matricularPorSlug(user.id, parsed.data.concursoSlug, 'cadastro');

    try {
      await invalidateUserModulosCache(user.id);
    } catch (cacheError) {
      logger.warn('Falha ao invalidar cache após matrícula', {
        userId: user.id,
        error: cacheError instanceof Error ? cacheError.message : String(cacheError),
      });
    }

    return NextResponse.json({
      concurso: {
        id: concurso.id,
        slug: concurso.slug,
        nome: concurso.nome,
        tipo: concurso.tipo,
      },
    });
  } catch (error) {
    logger.error('Erro ao matricular usuário', error, { userId: user.id });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao matricular' },
      { status: 400 },
    );
  }
}
