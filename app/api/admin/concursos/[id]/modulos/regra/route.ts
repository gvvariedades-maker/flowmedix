import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { ConcursoRegraModulosSchema } from '@/lib/validations';
import { linkModulosPorRegra } from '@/lib/concursos/entitlements';
import { invalidateModulosCache } from '@/lib/cache';
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

  const parsed = ConcursoRegraModulosSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const linkedCount = await linkModulosPorRegra(concursoId, parsed.data);
    await invalidateModulosCache();
    return NextResponse.json({ ok: true, linkedCount });
  } catch (error) {
    logger.error('Falha ao aplicar regra de módulos no concurso', error, { concursoId, filters: parsed.data });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao aplicar regra' },
      { status: 400 },
    );
  }
}
