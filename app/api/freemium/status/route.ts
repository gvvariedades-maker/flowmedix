import { NextRequest, NextResponse } from 'next/server';
import {
  countQuestoesHojeForUser,
  getFreemiumDayBounds,
  isUserPro,
} from '@/lib/freemium';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { user } = auth;
    const [isPro, questoesHoje] = await Promise.all([
      isUserPro(user.id),
      countQuestoesHojeForUser(user.id),
    ]);

    const { resetEm } = getFreemiumDayBounds();
    const limiteAtingido = !isPro && questoesHoje >= 1;

    return NextResponse.json(
      {
        isPro,
        questoesHoje,
        limiteAtingido,
        resetEm: resetEm.toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    logger.error('Unexpected error in freemium/status', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
