import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { ConcursoMatriculaSchema } from '@/lib/validations';
import {
  ensureDefaultMatricula,
  getConcursoBySlug,
  GERAL_CONCURSO_SLUG,
  matricularPorSlug,
} from '@/lib/concursos/entitlements';
import { invalidateUserModulosCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component já gerencia cookies.
          }
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
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

  try {
    const concurso = parsed.data.concursoSlug
      ? await matricularPorSlug(session.user.id, parsed.data.concursoSlug, 'cadastro')
      : await (async () => {
          await ensureDefaultMatricula(session.user.id);
          const geral = await getConcursoBySlug(GERAL_CONCURSO_SLUG);
          if (!geral) {
            throw new Error('Concurso Geral não encontrado.');
          }
          return geral;
        })();

    try {
      await invalidateUserModulosCache(session.user.id);
    } catch (cacheError) {
      logger.warn('Falha ao invalidar cache após matrícula', {
        userId: session.user.id,
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
    logger.error('Erro ao matricular usuário', error, { userId: session.user.id });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao matricular' },
      { status: 400 },
    );
  }
}
