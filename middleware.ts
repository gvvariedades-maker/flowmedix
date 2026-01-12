'use server';

import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set(name, value, options);
        },
        delete(name, options) {
          response.cookies.delete(name, options);
        },
        // Backwards compatibility for Supabase helpers that invoke `remove`
        remove(name: string, options?: Record<string, unknown>) {
          response.cookies.delete(name, options);
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response.clone();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};



