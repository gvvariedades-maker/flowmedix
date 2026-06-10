import { NextRequest, NextResponse } from 'next/server';
import { getNotebookActivationCached } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

/** GET /api/notebooks/activation — status de ativação para banner/onboarding */
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const status = await getNotebookActivationCached(auth.user.id);
    return NextResponse.json(status);
  } catch (error) {
    logger.error('GET /api/notebooks/activation failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
