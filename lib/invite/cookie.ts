/** Cookie httpOnly de fallback quando o query `invite` some no fluxo de auth. */
export const INVITE_TOKEN_COOKIE = 'avant_invite_token';

/** 7 dias */
export const INVITE_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function inviteTokenCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: INVITE_TOKEN_COOKIE_MAX_AGE,
    path: '/',
  };
}

export function clearInviteTokenCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  };
}
