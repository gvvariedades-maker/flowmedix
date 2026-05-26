import { NextRequest, NextResponse } from 'next/server';
import { EstudarQuestaoQuerySchema } from '@/lib/validations';
import { buildEstudarQuestaoPlayerPayload } from '@/lib/estudar/questaoPlayerPayload';
import { logger } from '@/lib/logger';
import { logEstudarNavApiBuild } from '@/lib/estudar/navigationTelemetry';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = EstudarQuestaoQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { slug, from, caderno_id, banca, assunto, q } = parsed.data;
    const buildStartedAt = Date.now();
    const result = await buildEstudarQuestaoPlayerPayload({
      slug,
      userId: auth.user.id,
      searchParams: { from, caderno_id, banca, assunto, q },
      supabase: auth.supabase,
    });
    logEstudarNavApiBuild({
      slug,
      durationMs: Date.now() - buildStartedAt,
      status: result.status,
    });

    if (result.status === 'forbidden') {
      return NextResponse.json({ error: 'Sem acesso a este módulo' }, { status: 403 });
    }
    if (result.status === 'not_found') {
      return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.payload, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    logger.error('Falha em GET /api/estudar/questao', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
