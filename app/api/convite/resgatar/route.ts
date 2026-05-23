import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
  clearInviteTokenCookieOptions,
  INVITE_TOKEN_COOKIE,
} from '@/lib/invite/cookie';
import { redeemInvite, type RedeemInviteErrorCode } from '@/lib/invite/redeem';
import { getRequestUserId } from '@/lib/invite/requestUser';
import { logger } from '@/lib/logger';
import { InviteRedeemSchema } from '@/lib/validations';

const REDEEM_STATUS: Record<RedeemInviteErrorCode, number> = {
  LINK_NOT_FOUND: 404,
  LINK_REVOKED: 410,
  LINK_EXPIRED: 410,
  LINK_EXHAUSTED: 410,
  ALREADY_REDEEMED: 409,
  INVITE_PRO_ACTIVE: 409,
  GERAL_CONCURSO_MISSING: 503,
};

export async function POST(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = InviteRedeemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const token =
    parsed.data.token?.trim() || cookieStore.get(INVITE_TOKEN_COOKIE)?.value?.trim() || '';

  if (!token) {
    return NextResponse.json({ error: 'Token de convite ausente' }, { status: 400 });
  }

  try {
    const result = await redeemInvite(userId, token);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, code: result.code, error: result.message },
        { status: REDEEM_STATUS[result.code] ?? 400 },
      );
    }

    const response = NextResponse.json({
      ok: true,
      alreadyPro: result.alreadyPro ?? false,
      proExpiresAt: result.proExpiresAt,
    });

    response.cookies.set(INVITE_TOKEN_COOKIE, '', clearInviteTokenCookieOptions());
    return response;
  } catch (error) {
    logger.error('POST /api/convite/resgatar', error, { userId });
    return NextResponse.json({ error: 'Erro ao resgatar convite' }, { status: 500 });
  }
}
