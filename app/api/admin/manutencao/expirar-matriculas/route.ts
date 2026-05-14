import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAdminEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createServerSupabase } from '@/lib/supabase/server';

function isAuthorizedCron(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

async function isAuthorizedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Não precisa setar cookies nesta rota
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return false;
  }

  return session.user.email.toLowerCase() === getAdminEmail();
}

async function expireMatriculas(request: NextRequest) {
  if (!isAuthorizedCron(request) && !(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.rpc('expire_concurso_matriculas');

    if (error) {
      logger.error('Falha ao expirar matrículas de concurso', error);
      return NextResponse.json({ error: 'Erro ao expirar matrículas' }, { status: 500 });
    }

    const expiradas = typeof data === 'number' ? data : 0;
    logger.info('Matrículas de concurso expiradas', { expiradas });

    return NextResponse.json({ expiradas });
  } catch (error) {
    logger.error('Erro ao expirar matrículas de concurso', error);
    return NextResponse.json({ error: 'Erro ao expirar matrículas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return expireMatriculas(request);
}

export async function GET(request: NextRequest) {
  return expireMatriculas(request);
}
