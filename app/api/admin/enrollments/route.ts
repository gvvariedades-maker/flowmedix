import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { ADMIN_EMAIL } from '@/lib/constants';

const ADMIN_EMAIL_LOWER = ADMIN_EMAIL.toLowerCase();

const buildServerClient = () => {
  const cookieStore = cookies();
  return createServerClient(
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
            // Next já cuida dos cookies em Server Components.
          }
        },
      },
    }
  );
};

const ensureAdmin = async (client: ReturnType<typeof buildServerClient>) => {
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Acesso não autenticado' }, { status: 401 });
  }
  if (session.user.email.toLowerCase() !== ADMIN_EMAIL_LOWER) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  return null;
};

export async function GET() {
  const client = buildServerClient();
  const accessError = await ensureAdmin(client);
  if (accessError) {
    return accessError;
  }

  const adminSupabase = await createServerSupabase();

  const { data: enrollmentsData, error: enrollmentsError } = await adminSupabase
    .from('enrollments')
    .select('id, user_id, exam_id, created_at');

  if (enrollmentsError) {
    return NextResponse.json({ error: enrollmentsError.message }, { status: 500 });
  }

  const userIds = Array.from(new Set((enrollmentsData ?? []).map((row) => row.user_id)));
  const examIds = Array.from(new Set((enrollmentsData ?? []).map((row) => row.exam_id)));

  const { data: usersData } = userIds.length
    ? await adminSupabase.from('auth.users').select('id, email').in('id', userIds)
    : { data: [] };

  const { data: examsData } = examIds.length
    ? await adminSupabase.from('exams').select('id, name').in('id', examIds)
    : { data: [] };

  const emailMap = new Map(usersData?.map((user) => [user.id, user.email ?? null]));
  const examMap = new Map(examsData?.map((exam) => [exam.id, exam.name ?? null]));

  const payload = (enrollmentsData ?? []).map((entry) => ({
    id: entry.id,
    user_id: entry.user_id,
    exam_id: entry.exam_id,
    created_at: entry.created_at ?? null,
    email: emailMap.get(entry.user_id) ?? null,
    exam_name: examMap.get(entry.exam_id) ?? null,
  }));

  return NextResponse.json({ enrollments: payload });
}

export async function DELETE(request: NextRequest) {
  const client = buildServerClient();
  const accessError = await ensureAdmin(client);
  if (accessError) {
    return accessError;
  }

  const body = await request.json().catch(() => null);
  const enrollmentId = body?.enrollmentId;
  if (!enrollmentId) {
    return NextResponse.json({ error: 'Nenhuma matrícula informada' }, { status: 400 });
  }

  const adminSupabase = await createServerSupabase();
  const { error } = await adminSupabase
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}









