import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase();

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // O Next já lida com cookies no Server Component
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Acesso não autenticado' }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();
  if (ADMIN_EMAIL && email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  let payload: { email?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const targetEmail = payload.email?.toLowerCase().trim();
  if (!targetEmail) {
    return NextResponse.json({ error: 'Informe um e-mail válido' }, { status: 400 });
  }

  const adminSupabase = await createServerSupabase();
  const { data: user, error } = await adminSupabase.auth.admin.getUserByEmail(targetEmail);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ userId: user.id });
}







