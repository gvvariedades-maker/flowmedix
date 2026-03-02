import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { validateEnv } from '@/lib/env';

// Validar variáveis de ambiente no proxy (apenas uma vez)
let envValidated = false;
if (!envValidated) {
  try {
    validateEnv();
    envValidated = true;
  } catch (error) {
    // Em produção, não quebrar o proxy (variáveis podem estar no Vercel)
    // O health check vai detectar o problema
    if (process.env.NODE_ENV === 'development') {
      console.error('⚠️ Environment validation failed:', error);
    }
  }
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          const cookieOptions: any = options ? { ...options } : {};
          // Garantir que sameSite seja do tipo correto
          if (cookieOptions.sameSite && typeof cookieOptions.sameSite === 'string') {
            cookieOptions.sameSite = cookieOptions.sameSite as 'lax' | 'strict' | 'none';
          }

          request.cookies.set({
            name,
            value,
            ...cookieOptions,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...cookieOptions,
          });
        },
        remove(name: string, options?: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      } as any, // Type assertion para compatibilidade com tipos do Supabase SSR
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
