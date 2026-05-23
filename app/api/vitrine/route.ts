import { NextRequest, NextResponse } from 'next/server';
import { VitrineQuerySchema } from '@/lib/validations';
import { getVitrinePage } from '@/lib/vitrine/service';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = VitrineQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { page, banca, assunto, q } = parsed.data;
    const payload = await getVitrinePage({
      userId: auth.user.id,
      page,
      filters: {
        banca: banca || undefined,
        assunto: assunto || undefined,
        q: q || undefined,
      },
    });

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    logger.error('Falha em GET /api/vitrine', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
