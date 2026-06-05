import { NextRequest, NextResponse } from 'next/server';
import { getEstudarL0GenerationCached } from '@/lib/estudar/l0Generation';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { logger } from '@/lib/logger';

/**
 * GET /api/estudar/l0-meta
 * Fingerprint do catálogo para sincronizar invalidação L0 no cliente (IDB + SW).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const generation = await getEstudarL0GenerationCached();
    return NextResponse.json(
      { generation },
      {
        headers: {
          'Cache-Control': 'private, no-store',
        },
      },
    );
  } catch (error) {
    logger.error('Falha ao obter l0-meta', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
