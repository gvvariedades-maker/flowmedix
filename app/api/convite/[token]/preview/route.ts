import { NextRequest, NextResponse } from 'next/server';

import { getInviteLinkPreview } from '@/lib/invite/links';
import { logger } from '@/lib/logger';
import { distributedRateLimit } from '@/lib/rate-limit';

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!(await distributedRateLimit(request, { key: 'convite-preview', limit: 30, windowMs: 60_000 }))) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
      { status: 429 },
    );
  }

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
