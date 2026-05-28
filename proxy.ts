import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { validateEnv } from '@/lib/env';
import { INVITE_TOKEN_COOKIE, inviteTokenCookieOptions } from '@/lib/invite/cookie';

/**
 * Next.js 16 — função `proxy` (antigo middleware).
 *
 * Chama `getUser()` uma vez por request nas rotas protegidas para renovar a
 * sessão **antes** dos RSC — evita que layout+page acumulem refresh.
 *
 * Rotas `/api/*` usam `Authorization: Bearer` + `getUser(jwt)` nas handlers
 * (sem refresh no Node) para não competir com o browser.
 */

let envValidated = false;
if (!envValidated) {
  try {
    validateEnv();
    envValidated = true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('⚠️ Environment validation failed:', error);
    }
  }
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  try {
    await supabase.auth.getUser();
  } catch {
    // Sessão inválida: deixa a página/redirect tratar; não derrubamos a resposta.
  }

  const conviteMatch = request.nextUrl.pathname.match(/^\/convite\/([^/]+)\/?$/);
  if (conviteMatch) {
    const token = decodeURIComponent(conviteMatch[1]).trim();
    if (token.length >= 8 && token.length <= 128) {
      supabaseResponse.cookies.set(INVITE_TOKEN_COOKIE, token, inviteTokenCookieOptions());
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/convite/:path*',
    '/simulados/:path*',
    '/estudar/:path*',
    '/analytics/:path*',
    '/plano-diario/:path*',
    '/cadernos/:path*',
    '/material/:path*',
    '/admin/:path*',
  ],
};
