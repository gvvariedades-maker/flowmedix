import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import {
  getProvaEvolucaoPorTitulo,
  normalizeTituloForEvolucao,
} from '@/lib/simulado/provaEvolucao';

const EvolucaoQuerySchema = z.object({
  titulo: z.string().trim().min(1).max(120),
  limit: z.coerce.number().int().min(1).max(10).optional().default(5),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = EvolucaoQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createServerSupabase();
    const items = await getProvaEvolucaoPorTitulo(
      supabase,
      auth.user.id,
      parsed.data.titulo,
      parsed.data.limit,
    );

    return NextResponse.json({
      titulo_base: normalizeTituloForEvolucao(parsed.data.titulo),
      items,
    });
  } catch (error) {
    logger.error('Erro inesperado em GET /api/simulado/evolucao', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
