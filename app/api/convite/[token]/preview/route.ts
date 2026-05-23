import { NextRequest, NextResponse } from 'next/server';

import { getInviteLinkPreview } from '@/lib/invite/links';
import { logger } from '@/lib/logger';

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { token } = await context.params;
  const decoded = decodeURIComponent(token).trim();

  if (!decoded || decoded.length > 128) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
  }

  try {
    const preview = await getInviteLinkPreview(decoded);
    if (!preview) {
      return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ preview });
  } catch (error) {
    logger.error('GET /api/convite/[token]/preview', error, {
      tokenPrefix: decoded.slice(0, 4),
    });
    return NextResponse.json({ error: 'Erro ao carregar convite' }, { status: 500 });
  }
}
