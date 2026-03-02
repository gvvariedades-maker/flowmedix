import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { getAdminEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { EnrollmentDeleteSchema } from '@/lib/validations';

const buildServerClient = async () => {
  const cookieStore = await cookies();
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

const ensureAdmin = async (client: Awaited<ReturnType<typeof buildServerClient>>) => {
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Acesso não autenticado' }, { status: 401 });
  }
  if (session.user.email.toLowerCase() !== getAdminEmail()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  return null;
};

export async function GET() {
  const client = await buildServerClient();
  const accessError = await ensureAdmin(client);
  if (accessError) {
    return accessError;
  }

  const adminSupabase = await createServerSupabase();

  const { data: enrollmentsData, error: enrollmentsError } = await adminSupabase
    .from('enrollments')
    .select('id, user_id, exam_id, created_at')
    .limit(1000); // Limite para performance

  if (enrollmentsError) {
    logger.error('Database error fetching enrollments', enrollmentsError);
    return NextResponse.json(
      { error: 'Erro ao buscar matrículas' },
      { status: 500 }
    );
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
  const client = await buildServerClient();
  const accessError = await ensureAdmin(client);
  if (accessError) {
    return accessError;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  // Validação com Zod
  const validationResult = EnrollmentDeleteSchema.safeParse(body);
  if (!validationResult.success) {
    logger.warn('Validation failed for enrollment delete', { errors: validationResult.error.issues });
    return NextResponse.json(
      { error: 'Dados inválidos', details: validationResult.error.issues },
      { status: 400 }
    );
  }

  const { enrollmentId } = validationResult.data;

  const adminSupabase = await createServerSupabase();
  const { error } = await adminSupabase
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId);

  if (error) {
    logger.error('Database error deleting enrollment', error, { enrollmentId });
    return NextResponse.json(
      { error: 'Erro ao deletar matrícula' },
      { status: 500 }
    );
  }

  logger.info('Enrollment deleted successfully', { enrollmentId });
  return NextResponse.json({ success: true });
}









