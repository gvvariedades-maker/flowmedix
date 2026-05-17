import { NextRequest, NextResponse } from 'next/server';
import { getFreemiumStatusForUser } from '@/lib/freemium';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { user } = auth;
    const status = await getFreemiumStatusForUser(user.id, user.email);

    return NextResponse.json(
      status,
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
